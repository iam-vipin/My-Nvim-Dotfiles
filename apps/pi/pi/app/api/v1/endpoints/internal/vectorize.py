import uuid
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter
from fastapi import Depends
from fastapi import status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import desc
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.app.api.v1.dependencies import verify_internal_secret_key
from pi.app.models.workspace_vectorization import VectorizationStatus
from pi.app.models.workspace_vectorization import WorkspaceVectorization
from pi.celery_app import celery_app
from pi.config import Settings
from pi.core.db.plane_pi.lifecycle import get_async_session
from pi.core.vectordb import VectorStore
from pi.vectorizer.docs import process_repo_contents
from pi.vectorizer.vectorize import _batched_predict

log = logger.getChild(__name__)
router = APIRouter(
    dependencies=[Depends(verify_internal_secret_key)],
    include_in_schema=False,
)


class VectorizeRequest(BaseModel):
    workspace_ids: list[str]
    feed_issues: bool = True
    feed_pages: bool = True
    feed_slices: int = 4
    batch_size: int = 32


class VectorizeQueryRequest(BaseModel):
    query: str
    retrieved_tables: list[str]


class JobStatusUpdate(BaseModel):
    status: VectorizationStatus
    progress_pct: int | None = None
    last_error: str | None = None


class JobConfig(BaseModel):
    workspace_id: str
    job_id: str
    feed_issues: bool = True
    feed_pages: bool = True
    feed_slices: int = 4
    batch_size: int = 32


class VectorizeDocsRequest(BaseModel):
    repo_names: list[str] | None = None  # If None, uses settings.DOCS_REPO_NAME


class VectorizeDocsResponse(BaseModel):
    total_ok: int
    total_failed: int
    results: list[dict[str, int | str]]  # List of {repo: str, ok: int, failed: int}


class ChatSearchIndexRequest(BaseModel):
    workspace_id: str | None = None  # If None, processes all workspaces
    batch_size: int = 100


class ChatSearchIndexResponse(BaseModel):
    total_chats: int
    total_messages: int
    processed_chats: int
    processed_messages: int
    failed_chats: int
    failed_messages: int
    duration_seconds: float


@router.post("/vectorize/workspaces/", include_in_schema=False)
async def trigger_vectorization(
    body: VectorizeRequest,
    db: AsyncSession = Depends(get_async_session),
):
    """
    Trigger vectorization for multiple workspaces.
    Creates database records and queues Celery tasks for each workspace.
    """
    accepted, skipped = [], []

    for ws in body.workspace_ids:
        # Check if workspace already has a running/queued job
        stmt = select(WorkspaceVectorization).where(
            WorkspaceVectorization.workspace_id == ws,
            (WorkspaceVectorization.status == VectorizationStatus.queued) | (WorkspaceVectorization.status == VectorizationStatus.running),
        )
        existing_job = (await db.exec(stmt)).first()

        if existing_job:
            skipped.append(ws)
            continue

        # Create new job record
        job = WorkspaceVectorization(
            workspace_id=ws,
            status=VectorizationStatus.queued,
            feed_issues=body.feed_issues,
            feed_pages=body.feed_pages,
            feed_slices=body.feed_slices,
            batch_size=body.batch_size,
        )
        db.add(job)
        await db.commit()
        await db.refresh(job)

        # Queue Celery task with job config
        job_config = JobConfig(
            workspace_id=ws,
            job_id=str(job.id),
            feed_issues=body.feed_issues,
            feed_pages=body.feed_pages,
            feed_slices=body.feed_slices,
            batch_size=body.batch_size,
        )
        celery_app.send_task("pi.celery_app.vectorize_workspace", args=[job_config.model_dump()])
        accepted.append(ws)

    return JSONResponse(
        status_code=status.HTTP_202_ACCEPTED,
        content={"accepted": accepted, "skipped": skipped},
    )


@router.post("/vectorize/status/{job_id}/", include_in_schema=False)
async def update_job_status(
    job_id: str,
    status_update: JobStatusUpdate,
    db: AsyncSession = Depends(get_async_session),
):
    """
    Update the status of a vectorization job.

    Note: This endpoint is primarily for external use or manual updates.
    """
    try:
        job_uuid = UUID(job_id)
        stmt = select(WorkspaceVectorization).where(WorkspaceVectorization.id == job_uuid)
        job = (await db.exec(stmt)).first()

        if not job:
            return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"detail": f"Job {job_id} not found"})

        # Update job status
        job.status = status_update.status

        if status_update.progress_pct is not None:
            job.progress_pct = status_update.progress_pct

        if status_update.last_error is not None:
            job.last_error = status_update.last_error

        # Update timestamps based on status
        now = datetime.utcnow()
        if status_update.status == VectorizationStatus.running and not job.started_at:
            job.started_at = now
        elif status_update.status in [VectorizationStatus.success, VectorizationStatus.failed]:
            job.finished_at = now
            if status_update.status == VectorizationStatus.success:
                job.progress_pct = 100

        await db.commit()

        return JSONResponse(status_code=status.HTTP_200_OK, content={"status": "updated", "job_id": job_id})

    except ValueError:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"detail": "Invalid job ID format"})
    except Exception as exc:
        log.error("Failed to update job status for %s: %s", job_id, exc)
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"detail": "Failed to update job status"})


@router.post("/vectorize/manual-status/{job_id}/", include_in_schema=False)
async def manual_update_job_status(
    job_id: str,
    status_update: JobStatusUpdate,
    db: AsyncSession = Depends(get_async_session),
):
    """
    Manually update the status of a vectorization job.
    """
    try:
        job_uuid = UUID(job_id)
        stmt = select(WorkspaceVectorization).where(WorkspaceVectorization.id == job_uuid)
        job = (await db.exec(stmt)).first()

        if not job:
            return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"detail": f"Job {job_id} not found"})

        # Update job status
        job.status = status_update.status
        if status_update.progress_pct is not None:
            job.progress_pct = status_update.progress_pct
        if status_update.last_error is not None:
            job.last_error = status_update.last_error

        # Update timestamps based on status
        now = datetime.utcnow()
        if status_update.status == VectorizationStatus.running and not job.started_at:
            job.started_at = now
        elif status_update.status in [VectorizationStatus.success, VectorizationStatus.failed]:
            job.finished_at = now
            if status_update.status == VectorizationStatus.success:
                job.progress_pct = 100

        await db.commit()
        return JSONResponse(status_code=status.HTTP_200_OK, content={"status": "updated", "job_id": job_id})
    except ValueError:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"detail": "Invalid job ID format"})
    except Exception as exc:
        log.error("Failed to manually update job status for %s: %s", job_id, exc)
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"detail": "Failed to update job status"})


@router.get("/vectorize/job/{job_id}/", include_in_schema=False)
async def get_job_details(
    job_id: str,
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get details of a vectorization job including progress.
    Useful for monitoring and progress tracking.
    """
    try:
        job_uuid = UUID(job_id)
        stmt = select(WorkspaceVectorization).where(WorkspaceVectorization.id == job_uuid)
        job = (await db.exec(stmt)).first()

        if not job:
            return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"detail": f"Job {job_id} not found"})

        status_value = job.status.value if hasattr(job.status, "value") else job.status

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "job_id": str(job.id),
                "workspace_id": job.workspace_id,
                "status": status_value,
                "progress_pct": job.progress_pct,
                "feed_issues": job.feed_issues,
                "feed_pages": job.feed_pages,
                "feed_slices": job.feed_slices,
                "batch_size": job.batch_size,
                "live_sync_enabled": job.live_sync_enabled,
                "created_at": job.created_at.isoformat() if job.created_at else None,
                "started_at": job.started_at.isoformat() if job.started_at else None,
                "finished_at": job.finished_at.isoformat() if job.finished_at else None,
                "last_error": job.last_error,
            },
        )

    except ValueError:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"detail": "Invalid job ID format"})
    except Exception as exc:
        log.error("Failed to get job details for %s: %s", job_id, exc)
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"detail": "Failed to get job details"})


@router.get("/vectorize/workspace/{workspace_id}/progress/", include_in_schema=False)
async def get_workspace_progress(
    workspace_id: str,
    db: AsyncSession = Depends(get_async_session),
):
    """Return the most recent vectorization progress for a given workspace.

    Looks up the latest WorkspaceVectorization record for the supplied ``workspace_id``
    (ordered by the ``created_at`` timestamp) and returns its ``progress_pct`` along
    with a few other helpful fields. If no job is found, a 404 response is returned.
    """
    try:
        stmt = (
            select(WorkspaceVectorization)
            .where(WorkspaceVectorization.workspace_id == workspace_id)
            .order_by(desc(WorkspaceVectorization.created_at))  # type: ignore[arg-type]
        )
        job = (await db.exec(stmt)).first()

        if not job:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"detail": f"No vectorization jobs found for workspace {workspace_id}"},
            )

        status_value = job.status.value if hasattr(job.status, "value") else job.status

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "job_id": str(job.id),
                "workspace_id": job.workspace_id,
                "status": status_value,
                "progress_pct": job.progress_pct,
                "created_at": job.created_at.isoformat() if job.created_at else None,
                "started_at": job.started_at.isoformat() if job.started_at else None,
                "finished_at": job.finished_at.isoformat() if job.finished_at else None,
            },
        )

    except Exception as exc:
        log.error("Failed to get progress for workspace %s: %s", workspace_id, exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Failed to get workspace progress"},
        )


@router.post("/vectorize/docs/", include_in_schema=False)
async def trigger_docs_vectorization(
    body: VectorizeDocsRequest,
    db: AsyncSession = Depends(get_async_session),
) -> JSONResponse:
    """
    Trigger vectorization for documentation repositories.
    Processes repository contents and feeds them to the docs index.
    """
    settings = Settings()

    try:
        # Determine which repositories to process
        if body.repo_names:
            repos = [repo.strip() for repo in body.repo_names if repo.strip()]
        else:
            repos = [repo.strip() for repo in settings.vector_db.DOCS_REPO_NAME.split(",") if repo.strip()]

        if not repos:
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"detail": "No repositories specified"})

        log.info("Processing %d documentation repositories: %s", len(repos), repos)

        total_ok = 0
        total_failed = 0
        results = []

        async with VectorStore() as vdb:
            for i, repo in enumerate(repos, 1):
                repo_result = {"repo": repo, "ok": 0, "failed": 0}

                try:
                    log.info("Repo %d/%d: %s", i, len(repos), repo)
                    docs = process_repo_contents(repo)  # read repo files

                    if docs:
                        ok, failed_docs = await vdb.async_feed(settings.vector_db.DOCS_INDEX, docs)  # bulk-index docs
                        repo_result["ok"] = ok
                        repo_result["failed"] = len(failed_docs)
                        total_ok += ok
                        total_failed += len(failed_docs)
                        log.info("Repo %s: %d ok, %d failed", repo, ok, len(failed_docs))
                    else:
                        log.warning("No documents found in repository: %s", repo)

                except Exception as exc:
                    log.error("Error processing repo %s: %s", repo, exc)
                    repo_result["failed"] = 1  # Mark the entire repo as failed
                    total_failed += 1

                results.append(repo_result)

        log.info("Docs vectorization complete — %d ok, %d failed", total_ok, total_failed)

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"total_ok": total_ok, "total_failed": total_failed, "results": results, "message": f"Processed {len(repos)} repositories"},
        )

    except Exception as exc:
        log.error("Error in docs vectorization: %s", exc)
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"detail": f"Failed to vectorize docs: {str(exc)}"})


@router.post("/vectorize/query/", include_in_schema=False)
async def vectorize_and_cache_query(
    body: VectorizeQueryRequest,
    db: AsyncSession = Depends(get_async_session),
):
    """
    Create a vector embedding for the query and push it to cache_index.
    """
    settings = Settings()
    async with VectorStore() as vdb:
        # Generate embedding for the query
        vectors = await _batched_predict(vdb, [body.query])
        if not vectors or not vectors[0]:
            return JSONResponse(status_code=500, content={"detail": "Failed to generate embedding for query"})
        query_vector = vectors[0]
        doc = {
            "id": str(uuid.uuid4()),
            "query": body.query,
            "retrieved_tables": body.retrieved_tables,
            "query_vector": query_vector,
        }
        _, failed_docs = await vdb.async_feed(settings.vector_db.CACHE_INDEX, [doc])
        if failed_docs:
            return JSONResponse(status_code=500, content={"detail": "Failed to cache query"})
        return JSONResponse(status_code=200, content={"detail": "Query cached successfully"})


@router.post("/vectorize/chat-search-index/", include_in_schema=False)
async def trigger_chat_search_index_population(
    body: ChatSearchIndexRequest,
) -> JSONResponse:
    """
    Trigger chat search index population as a Celery background task.

    This endpoint queues a background job to populate the search index with existing
    chats and messages. The job runs asynchronously to avoid HTTP timeouts.
    """
    try:
        # Queue Celery task
        task = celery_app.send_task("pi.celery_app.populate_chat_search_index", args=[body.model_dump()])

        log.info("Queued chat search index population task: %s", task.id)

        return JSONResponse(
            status_code=status.HTTP_202_ACCEPTED,
            content={
                "task_id": task.id,
                "status": "queued",
                "message": "Chat search index population started",
                "workspace_id": body.workspace_id,
                "batch_size": body.batch_size,
            },
        )

    except Exception as exc:
        log.error("Failed to queue chat search index population: %s", exc)
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"detail": f"Failed to queue task: {str(exc)}"})


@router.get("/vectorize/chat-search-index/{task_id}/", include_in_schema=False)
async def get_chat_search_index_task_status(task_id: str) -> JSONResponse:
    """
    Get the status and progress of a chat search index population task.
    """
    try:
        from celery.result import AsyncResult

        task_result = AsyncResult(task_id, app=celery_app)

        if task_result.state == "PENDING":
            response = {"task_id": task_id, "status": "pending", "message": "Task is waiting to be processed"}
        elif task_result.state == "PROGRESS":
            response = {"task_id": task_id, "status": "running", "progress": task_result.info, "message": "Task is running"}
        elif task_result.state == "SUCCESS":
            response = {"task_id": task_id, "status": "completed", "result": task_result.info, "message": "Task completed successfully"}
        elif task_result.state == "FAILURE":
            response = {"task_id": task_id, "status": "failed", "error": str(task_result.info), "message": "Task failed"}
        else:
            response = {"task_id": task_id, "status": task_result.state.lower(), "message": f"Task state: {task_result.state}"}

        return JSONResponse(status_code=status.HTTP_200_OK, content=response)

    except Exception as exc:
        log.error("Failed to get task status for %s: %s", task_id, exc)
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"detail": f"Failed to get task status: {str(exc)}"})
