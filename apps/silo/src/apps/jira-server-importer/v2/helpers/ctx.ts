/*  Context Helpers */
import type { TStepExecutionContext } from "@/apps/jira-server-importer/v2/types";

/**
 * Props for pagination context creation
 */
type PaginationContextProps = {
  hasMore: boolean;
  startAt: number;
  pageSize: number;
  pulled: number;
  pushed: number;
  totalProcessed: number;
};

/**
 * Create context based on pagination state
 */
export function createPaginationContext(props: PaginationContextProps): TStepExecutionContext {
  const { hasMore, startAt, pageSize, pulled, pushed, totalProcessed } = props;

  if (hasMore) {
    return createContinueContext({
      nextStartAt: startAt + pageSize,
      pulled,
      pushed,
      totalProcessed,
    });
  }

  return createSuccessContext({
    pulled,
    pushed,
    totalProcessed,
  });
}

/**
 * Create context for empty/skipped execution
 */
export function createEmptyContext(): TStepExecutionContext {
  return {
    pageCtx: {
      startAt: 0,
      hasMore: false,
      totalProcessed: 0,
    },
    results: {
      pulled: 0,
      pushed: 0,
      errors: [],
    },
  };
}

/**
 * Create context for successful completion
 */
export function createSuccessContext(props: {
  pulled: number;
  pushed: number;
  totalProcessed?: number;
  errors?: Error[];
}): TStepExecutionContext {
  return {
    pageCtx: {
      startAt: 0,
      hasMore: false,
      totalProcessed: props.totalProcessed ?? props.pulled,
    },
    results: {
      pulled: props.pulled,
      pushed: props.pushed,
      errors: props.errors ?? [],
    },
  };
}

/**
 * Create context for paginated continuation
 */
export function createContinueContext(props: {
  nextStartAt: number;
  pulled: number;
  pushed: number;
  totalProcessed: number;
  errors?: Error[];
}): TStepExecutionContext {
  return {
    pageCtx: {
      startAt: props.nextStartAt,
      hasMore: true,
      totalProcessed: props.totalProcessed,
    },
    results: {
      pulled: props.pulled,
      pushed: props.pushed,
      errors: props.errors ?? [],
    },
  };
}

/**
 * Create context with errors
 */
export function createErrorContext(props: {
  startAt?: number;
  totalProcessed?: number;
  errors: Error[];
}): TStepExecutionContext {
  return {
    pageCtx: {
      startAt: props.startAt ?? 0,
      hasMore: false,
      totalProcessed: props.totalProcessed ?? 0,
    },
    results: {
      pulled: 0,
      pushed: 0,
      errors: props.errors,
    },
  };
}
