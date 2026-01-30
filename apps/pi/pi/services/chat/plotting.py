# SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
# SPDX-License-Identifier: LicenseRef-Plane-Commercial
#
# Licensed under the Plane Commercial License (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# https://plane.so/legals/eula
#
# DO NOT remove or modify this notice.
# NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.

"""
Plotting tools for Ask mode.

This module provides LangChain tools for generating charts/graphs from retrieval results.
Generated plots are uploaded to S3 and returned as markdown image links.

Design: Modern minimal style with gradient colors and clean aesthetics.
"""

import io
import uuid
from datetime import datetime
from typing import Dict
from typing import List
from typing import Optional

import matplotlib
import matplotlib.pyplot as plt
import numpy as np
from langchain_core.tools import tool
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.app.models.message_attachment import MessageAttachment
from pi.app.utils.attachments import get_s3_client
from pi.config import settings

# Use non-interactive backend for server-side rendering
matplotlib.use("Agg")

log = logger.getChild(__name__)


# S3 Configuration
S3_BUCKET = settings.AWS_S3_BUCKET

# List of plotting tool names for detection logic
PLOTTING_TOOL_NAMES = {
    "create_pie_chart",
    "create_bar_chart",
    "create_line_chart",
    "create_stacked_bar_chart",
}

# ============================================================================
# MODERN TRENDY COLOR PALETTE
# Inspired by modern UI design systems (Tailwind, Radix, Linear)
# ============================================================================

# Primary gradient-inspired colors (vibrant but professional)
MODERN_COLORS = [
    "#818CF8",  # Indigo 400 - Primary
    "#34D399",  # Emerald 400 - Success
    "#FBBF24",  # Amber 400 - Warning
    "#F87171",  # Red 400 - Danger
    "#A78BFA",  # Violet 400
    "#22D3EE",  # Cyan 400
    "#FB7185",  # Rose 400
    "#4ADE80",  # Green 400
    "#60A5FA",  # Blue 400
    "#E879F9",  # Fuchsia 400
]

# Gradient pairs for bar charts (start, end colors)
GRADIENT_PAIRS = [
    ("#818CF8", "#6366F1"),  # Indigo gradient
    ("#34D399", "#10B981"),  # Emerald gradient
    ("#FBBF24", "#F59E0B"),  # Amber gradient
    ("#F87171", "#EF4444"),  # Red gradient
    ("#A78BFA", "#8B5CF6"),  # Violet gradient
    ("#22D3EE", "#06B6D4"),  # Cyan gradient
    ("#FB7185", "#EC4899"),  # Rose gradient
    ("#4ADE80", "#22C55E"),  # Green gradient
]

# Chart background and text colors
CHART_BG = "#FFFFFF"
CHART_TEXT = "#1F2937"  # Gray 800
CHART_SUBTEXT = "#6B7280"  # Gray 500
CHART_GRID = "#E5E7EB"  # Gray 200
CHART_BORDER = "#F3F4F6"  # Gray 100


def _apply_modern_style():
    """Apply modern, trendy styling to matplotlib charts."""
    plt.rcParams.update({
        # Figure
        "figure.figsize": (11, 6.5),
        "figure.dpi": 150,
        "figure.facecolor": CHART_BG,
        "figure.edgecolor": "none",
        # Axes
        "axes.facecolor": CHART_BG,
        "axes.edgecolor": "none",  # No border - ultra clean
        "axes.labelcolor": CHART_TEXT,
        "axes.titlesize": 16,
        "axes.titleweight": "bold",
        "axes.titlepad": 20,
        "axes.labelsize": 11,
        "axes.labelpad": 10,
        "axes.spines.top": False,
        "axes.spines.right": False,
        "axes.spines.left": False,
        "axes.spines.bottom": False,
        # Grid - subtle dotted style
        "axes.grid": True,
        "axes.grid.axis": "y",
        "grid.color": CHART_GRID,
        "grid.linestyle": "--",
        "grid.linewidth": 0.8,
        "grid.alpha": 0.7,
        # Ticks
        "xtick.color": CHART_SUBTEXT,
        "ytick.color": CHART_SUBTEXT,
        "xtick.labelsize": 10,
        "ytick.labelsize": 10,
        "xtick.major.size": 0,  # No tick marks
        "ytick.major.size": 0,
        "xtick.major.pad": 8,
        "ytick.major.pad": 8,
        # Font - modern sans-serif
        "font.family": "sans-serif",
        "font.sans-serif": ["Inter", "SF Pro Display", "Segoe UI", "Helvetica Neue", "Arial"],
        "font.size": 11,
        "font.weight": "normal",
        # Legend
        "legend.frameon": False,
        "legend.fontsize": 10,
        "legend.labelcolor": CHART_TEXT,
        # Save
        "savefig.facecolor": CHART_BG,
        "savefig.edgecolor": "none",
        "savefig.pad_inches": 0.2,
    })


def _create_gradient_bars(ax, x_positions, values, colors, width=0.7, horizontal=False):
    """Create bars with subtle gradient effect using multiple stacked rectangles."""
    bars = []
    for i, (x, val, color) in enumerate(zip(x_positions, values, colors)):
        if horizontal:
            bar = ax.barh(x, val, height=width, color=color, edgecolor="none", zorder=3)
        else:
            bar = ax.bar(x, val, width=width, color=color, edgecolor="none", zorder=3)
        bars.extend(bar)
    return bars


def _add_value_labels(ax, bars, values, horizontal=False, fontsize=10, offset=0.3):
    """Add value labels with modern styling."""
    for bar, val in zip(bars, values):
        if horizontal:
            x_pos = bar.get_width() + offset
            y_pos = bar.get_y() + bar.get_height() / 2
            ax.text(x_pos, y_pos, f"{val:,.0f}", va="center", ha="left", fontsize=fontsize, color=CHART_TEXT, fontweight="medium")
        else:
            x_pos = bar.get_x() + bar.get_width() / 2
            y_pos = bar.get_height() + offset
            ax.text(x_pos, y_pos, f"{val:,.0f}", ha="center", va="bottom", fontsize=fontsize, color=CHART_TEXT, fontweight="medium")


def _add_chart_footer(fig, source_text="Generated by Plane AI"):
    """Add subtle source attribution."""
    fig.text(0.99, 0.01, source_text, ha="right", va="bottom", fontsize=8, color=CHART_SUBTEXT, alpha=0.6, style="italic")


def _generate_plot_bytes(fig: plt.Figure) -> bytes:
    """Convert matplotlib figure to PNG bytes with high quality."""
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight", facecolor=CHART_BG, edgecolor="none", dpi=150)
    buf.seek(0)
    plot_bytes = buf.read()
    buf.close()
    plt.close(fig)
    return plot_bytes


async def upload_plot_to_s3(
    plot_bytes: bytes,
    filename: str,
    workspace_id: str,
    chat_id: str,
    user_id: str,
    db: AsyncSession,
) -> tuple[Optional[str], Optional[str]]:
    """
    Upload a generated plot image to S3 and create MessageAttachment record.

    Args:
        plot_bytes: PNG image bytes
        filename: Name for the file (e.g., "bar_chart_priority.png")
        workspace_id: Workspace UUID
        chat_id: Chat UUID
        user_id: User UUID
        db: Database session

    Returns:
        Tuple of (redirect_url, attachment_id) or (None, None) on failure

    Note:
        Returns a redirect endpoint URL instead of a presigned URL. This ensures
        the URL works forever since presigned URLs are regenerated on each request.
    """
    try:
        file_size = len(plot_bytes)
        content_type = "image/png"

        # Create attachment record
        attachment = MessageAttachment(
            original_filename=filename,
            content_type=content_type,
            file_size=file_size,
            file_type="image",
            status="pending",
            file_path="",
            workspace_id=workspace_id,
            chat_id=chat_id,
            message_id=None,
            user_id=user_id,
        )

        db.add(attachment)
        await db.commit()
        await db.refresh(attachment)

        # Generate S3 file path
        file_path = attachment.generate_file_path(uuid.UUID(workspace_id), uuid.UUID(chat_id))
        attachment.file_path = file_path

        # Upload to S3
        s3_client = get_s3_client()
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=file_path,
            Body=plot_bytes,
            ContentType=content_type,
        )

        # Mark as uploaded
        attachment.status = "uploaded"
        await db.commit()

        log.info(f"Plot uploaded successfully: {file_path}")

        # Use a custom scheme placeholder that will be replaced with fresh presigned URL on chat history fetch
        # This matches how other attachments work - URLs are regenerated each time, never stored
        # Format: plane-attachment://<attachment_id>/<chat_id>
        placeholder_url = f"plane-attachment://{attachment.id}/{chat_id}"

        return placeholder_url, str(attachment.id)

    except Exception as e:
        log.error(f"Error uploading plot to S3: {e}")
        return None, None


def create_plotting_tools(
    workspace_id: str,
    chat_id: str,
    user_id: str,
    db: AsyncSession,
) -> List:
    """
    Create LangChain plotting tools with access to current execution context.

    Args:
        workspace_id: Workspace UUID
        chat_id: Chat UUID
        user_id: User UUID
        db: Database session

    Returns:
        List of LangChain tool functions
    """

    @tool
    async def create_bar_chart(
        title: str,
        labels: List[str],
        values: List[float],
        x_label: Optional[str] = None,
        y_label: Optional[str] = None,
        horizontal: Optional[bool] = False,
    ) -> str:
        """Create a bar chart visualization from data.

        Use this tool when you want to compare values across different categories.
        Good for: work item counts by state, priority distribution, assignee workload.

        Args:
            title: Chart title (e.g., "Work Items by State")
            labels: Category labels (e.g., ["Backlog", "In Progress", "Done"])
            values: Numeric values for each category (e.g., [10, 5, 8])
            x_label: Optional label for X-axis
            y_label: Optional label for Y-axis
            horizontal: If True, create horizontal bar chart

        Returns:
            Markdown image link to the generated chart, or error message
        """
        try:
            if not labels or not values:
                return "Error: labels and values are required"
            if len(labels) != len(values):
                return "Error: labels and values must have the same length"

            _apply_modern_style()
            fig, ax = plt.subplots(figsize=(11, 6.5))

            # Get colors for each bar
            colors = [MODERN_COLORS[i % len(MODERN_COLORS)] for i in range(len(labels))]

            # Calculate offset for value labels
            max_val = max(values) if values else 1
            offset = max_val * 0.02

            if horizontal:
                # Horizontal bar chart
                y_positions = range(len(labels))
                bars = _create_gradient_bars(ax, y_positions, values, colors, width=0.65, horizontal=True)
                ax.set_yticks(y_positions)
                ax.set_yticklabels(labels)
                ax.invert_yaxis()  # Top to bottom
                ax.set_xlim(0, max_val * 1.15)  # Room for labels
                if x_label:
                    ax.set_xlabel(x_label, fontweight="medium")
                if y_label:
                    ax.set_ylabel(y_label, fontweight="medium")
                _add_value_labels(ax, bars, values, horizontal=True, offset=offset)
                ax.xaxis.grid(True, linestyle="--", alpha=0.5, color=CHART_GRID)
                ax.yaxis.grid(False)
            else:
                # Vertical bar chart
                x_positions = range(len(labels))
                bars = _create_gradient_bars(ax, x_positions, values, colors, width=0.65)
                ax.set_xticks(x_positions)
                ax.set_xticklabels(labels)
                ax.set_ylim(0, max_val * 1.15)  # Room for labels
                if x_label:
                    ax.set_xlabel(x_label, fontweight="medium")
                if y_label:
                    ax.set_ylabel(y_label, fontweight="medium")
                # Rotate labels if many categories
                if len(labels) > 5:
                    plt.xticks(rotation=35, ha="right")
                _add_value_labels(ax, bars, values, horizontal=False, offset=offset)
                ax.yaxis.grid(True, linestyle="--", alpha=0.5, color=CHART_GRID)
                ax.xaxis.grid(False)

            ax.set_title(title, fontsize=16, fontweight="bold", color=CHART_TEXT, pad=20)
            _add_chart_footer(fig)

            plot_bytes = _generate_plot_bytes(fig)

            # Upload to S3
            filename = f"bar_chart_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png"
            url, _attachment_id = await upload_plot_to_s3(plot_bytes, filename, workspace_id, chat_id, user_id, db)

            if url:
                return f"![{title}]({url})"
            else:
                return "Error: Failed to upload chart to storage"

        except Exception as e:
            log.error(f"Error creating bar chart: {e}")
            return f"Error creating bar chart: {str(e)}"

    @tool
    async def create_pie_chart(
        title: str,
        labels: List[str],
        values: List[float],
        show_percentages: Optional[bool] = True,
    ) -> str:
        """Create a pie chart visualization from data.

        Use this tool when you want to show proportions or percentages of a whole.
        Good for: priority distribution, state distribution, work item type breakdown.

        Args:
            title: Chart title (e.g., "Work Items by Priority")
            labels: Category labels (e.g., ["Urgent", "High", "Medium", "Low"])
            values: Numeric values for each category (e.g., [5, 15, 20, 10])
            show_percentages: If True, display percentage on each slice

        Returns:
            Markdown image link to the generated chart, or error message
        """
        try:
            if not labels or not values:
                return "Error: labels and values are required"
            if len(labels) != len(values):
                return "Error: labels and values must have the same length"

            # Filter out zero values to avoid empty slices
            filtered = [(l, v) for l, v in zip(labels, values) if v > 0]
            if not filtered:
                return "Error: All values are zero, cannot create pie chart"

            filtered_labels, filtered_values = zip(*filtered)
            labels = list(filtered_labels)
            values = list(filtered_values)

            _apply_modern_style()
            fig, ax = plt.subplots(figsize=(11, 8))

            colors = [MODERN_COLORS[i % len(MODERN_COLORS)] for i in range(len(labels))]

            def autopct_format(pct):
                return f"{pct:.1f}%" if show_percentages and pct > 4 else ""

            # Create pie with modern styling
            wedges, _texts, autotexts = ax.pie(  # type: ignore[misc]
                values,
                colors=colors,
                autopct=autopct_format,
                startangle=90,
                pctdistance=0.75,
                explode=[0.02] * len(values),  # Slight separation
                wedgeprops={"linewidth": 2, "edgecolor": CHART_BG},  # White borders
                textprops={"fontsize": 11},
            )

            # Style the percentage text
            for autotext in autotexts:
                autotext.set_color("white")
                autotext.set_fontweight("bold")
                autotext.set_fontsize(11)

            ax.set_title(title, fontsize=16, fontweight="bold", color=CHART_TEXT, pad=25)

            # Modern legend on the right
            legend_labels = [f"{l}  ({v:,.0f})" for l, v in zip(labels, values)]
            legend = ax.legend(
                wedges,
                legend_labels,
                title="Categories",
                loc="center left",
                bbox_to_anchor=(1.05, 0.5),
                frameon=False,
                fontsize=10,
            )
            legend.get_title().set_fontweight("bold")
            legend.get_title().set_color(CHART_TEXT)

            _add_chart_footer(fig)

            plot_bytes = _generate_plot_bytes(fig)

            # Upload to S3
            filename = f"pie_chart_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png"
            url, _attachment_id = await upload_plot_to_s3(plot_bytes, filename, workspace_id, chat_id, user_id, db)

            if url:
                return f"![{title}]({url})"
            else:
                return "Error: Failed to upload chart to storage"

        except Exception as e:
            log.error(f"Error creating pie chart: {e}")
            return f"Error creating pie chart: {str(e)}"

    @tool
    async def create_line_chart(
        title: str,
        x_values: List[str],
        y_values: List[float],
        x_label: Optional[str] = None,
        y_label: Optional[str] = None,
        show_markers: Optional[bool] = True,
        fill_area: Optional[bool] = False,
    ) -> str:
        """Create a line chart visualization from data.

        Use this tool when you want to show trends over time or sequential data.
        Good for: burndown charts, velocity trends, daily/weekly progress.

        Args:
            title: Chart title (e.g., "Sprint Burndown")
            x_values: X-axis values (e.g., dates or labels: ["Day 1", "Day 2", "Day 3"])
            y_values: Y-axis numeric values (e.g., [50, 45, 38, 30])
            x_label: Optional label for X-axis
            y_label: Optional label for Y-axis
            show_markers: If True, show data point markers
            fill_area: If True, fill area under the line

        Returns:
            Markdown image link to the generated chart, or error message
        """
        try:
            if not x_values or not y_values:
                return "Error: x_values and y_values are required"
            if len(x_values) != len(y_values):
                return "Error: x_values and y_values must have the same length"

            _apply_modern_style()
            fig, ax = plt.subplots(figsize=(12, 6.5))

            color = MODERN_COLORS[0]  # Primary indigo
            x_positions = range(len(x_values))

            # Area fill with gradient effect
            if fill_area:
                ax.fill_between(x_positions, y_values, alpha=0.15, color=color, zorder=1)
                ax.fill_between(x_positions, y_values, alpha=0.08, color=color, zorder=1)

            # Main line with modern styling
            line_width = 3
            ax.plot(x_positions, y_values, color=color, linewidth=line_width, zorder=3, solid_capstyle="round")

            # Add markers with white fill
            if show_markers:
                ax.scatter(x_positions, y_values, color=color, s=80, zorder=4, edgecolors=CHART_BG, linewidths=2.5)

            ax.set_xticks(x_positions)
            ax.set_xticklabels(x_values)

            if x_label:
                ax.set_xlabel(x_label, fontweight="medium")
            if y_label:
                ax.set_ylabel(y_label, fontweight="medium")

            ax.set_title(title, fontsize=16, fontweight="bold", color=CHART_TEXT, pad=20)

            # Subtle grid
            ax.yaxis.grid(True, linestyle="--", alpha=0.5, color=CHART_GRID, zorder=0)
            ax.xaxis.grid(False)

            # Set y-axis to start from 0 if all values are positive
            if min(y_values) >= 0:
                ax.set_ylim(bottom=0)

            # Rotate x labels if many data points
            if len(x_values) > 7:
                plt.xticks(rotation=35, ha="right")

            _add_chart_footer(fig)

            plot_bytes = _generate_plot_bytes(fig)

            # Upload to S3
            filename = f"line_chart_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png"
            url, _attachment_id = await upload_plot_to_s3(plot_bytes, filename, workspace_id, chat_id, user_id, db)

            if url:
                return f"![{title}]({url})"
            else:
                return "Error: Failed to upload chart to storage"

        except Exception as e:
            log.error(f"Error creating line chart: {e}")
            return f"Error creating line chart: {str(e)}"

    @tool
    async def create_stacked_bar_chart(
        title: str,
        categories: List[str],
        series_data: Dict[str, List[float]],
        x_label: Optional[str] = None,
        y_label: Optional[str] = None,
    ) -> str:
        """Create a stacked bar chart visualization from data.

        Use this tool when you want to compare values across categories with multiple series.
        Good for: state breakdown by assignee, priority by module, work items by state per sprint.

        Args:
            title: Chart title (e.g., "Work Items by State per Assignee")
            categories: X-axis category labels (e.g., ["Alice", "Bob", "Charlie"])
            series_data: Dictionary mapping series names to values for each category
                         (e.g., {"Backlog": [3, 5, 2], "In Progress": [2, 1, 4], "Done": [5, 3, 6]})
            x_label: Optional label for X-axis
            y_label: Optional label for Y-axis

        Returns:
            Markdown image link to the generated chart, or error message
        """
        try:
            if not categories or not series_data:
                return "Error: categories and series_data are required"

            # Validate all series have correct length
            for series_name, values in series_data.items():
                if len(values) != len(categories):
                    return f"Error: series '{series_name}' has {len(values)} values but {len(categories)} categories expected"

            _apply_modern_style()
            fig, ax = plt.subplots(figsize=(12, 7))

            x_positions = np.arange(len(categories))
            bar_width = 0.65
            bottom = np.zeros(len(categories))

            series_names = list(series_data.keys())
            colors = [MODERN_COLORS[i % len(MODERN_COLORS)] for i in range(len(series_names))]

            bars_list = []
            for i, (series_name, values) in enumerate(series_data.items()):
                bars = ax.bar(x_positions, values, bar_width, bottom=bottom, label=series_name, color=colors[i], edgecolor="none", zorder=3)
                bars_list.append(bars)
                bottom = bottom + np.array(values)

            ax.set_xticks(x_positions)
            ax.set_xticklabels(categories)

            if x_label:
                ax.set_xlabel(x_label, fontweight="medium")
            if y_label:
                ax.set_ylabel(y_label, fontweight="medium")

            ax.set_title(title, fontsize=16, fontweight="bold", color=CHART_TEXT, pad=20)

            # Subtle grid
            ax.yaxis.grid(True, linestyle="--", alpha=0.5, color=CHART_GRID, zorder=0)
            ax.xaxis.grid(False)

            # Modern legend
            legend = ax.legend(loc="upper right", frameon=False, fontsize=10)
            for text in legend.get_texts():
                text.set_color(CHART_TEXT)

            # Rotate x labels if many categories
            if len(categories) > 5:
                plt.xticks(rotation=35, ha="right")

            _add_chart_footer(fig)

            plot_bytes = _generate_plot_bytes(fig)

            # Upload to S3
            filename = f"stacked_bar_chart_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png"
            url, _attachment_id = await upload_plot_to_s3(plot_bytes, filename, workspace_id, chat_id, user_id, db)

            if url:
                return f"![{title}]({url})"
            else:
                return "Error: Failed to upload chart to storage"

        except Exception as e:
            log.error(f"Error creating stacked bar chart: {e}")
            return f"Error creating stacked bar chart: {str(e)}"

    @tool
    async def create_histogram_chart(
        title: str,
        data: List[float],
        x_label: Optional[str] = None,
        y_label: Optional[str] = None,
    ) -> str:
        """Create a histogram chart visualization from data.

        Use this tool when you want to visualize the distribution of a single variable.
        Good for: showing frequency of issue counts, time spent, etc.

        Args:
            title: Chart title (e.g., "Distribution of Issue Counts")
            data: List of numerical data points
            x_label: Optional label for X-axis
            y_label: Optional label for Y-axis

        Returns:
            Markdown image link to the generated chart, or error message
        """
        try:
            if not data:
                return "Error: data is required"

            _apply_modern_style()
            fig, ax = plt.subplots(figsize=(12, 7))

            ax.hist(data, bins=10, edgecolor="white", alpha=0.75, color=MODERN_COLORS[0], zorder=3)

            if x_label:
                ax.set_xlabel(x_label, fontweight="medium")
            if y_label:
                ax.set_ylabel(y_label, fontweight="medium")

            ax.set_title(title, fontsize=16, fontweight="bold", color=CHART_TEXT, pad=20)

            # Subtle grid
            ax.yaxis.grid(True, linestyle="--", alpha=0.5, color=CHART_GRID, zorder=0)
            ax.xaxis.grid(False)

            _add_chart_footer(fig)

            plot_bytes = _generate_plot_bytes(fig)

            # Upload to S3
            filename = f"histogram_chart_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png"
            url, _attachment_id = await upload_plot_to_s3(plot_bytes, filename, workspace_id, chat_id, user_id, db)

            if url:
                return f"![{title}]({url})"
            else:
                return "Error: Failed to upload chart to storage"

        except Exception as e:
            log.error(f"Error creating histogram chart: {e}")
            return f"Error creating histogram chart: {str(e)}"

    tools = [
        create_bar_chart,
        create_pie_chart,
        create_line_chart,
        create_stacked_bar_chart,
    ]

    return tools


def get_plotting_tools(
    workspace_id: str,
    chat_id: str,
    user_id: str,
    db: AsyncSession,
) -> List:
    """
    Get all plotting tools configured with execution context.

    Args:
        workspace_id: Workspace UUID
        chat_id: Chat UUID
        user_id: User UUID
        db: Database session

    Returns:
        List of LangChain tool functions
    """
    tools = create_plotting_tools(
        workspace_id=workspace_id,
        chat_id=chat_id,
        user_id=user_id,
        db=db,
    )

    # Verify consistency with PLOTTING_TOOL_NAMES constant
    # This ensures the constant used for streaming optimization matches actual tools
    actual_names = {t.name for t in tools}
    if actual_names != PLOTTING_TOOL_NAMES:
        log.info(f"PLOTTING_TOOL_NAMES mismatch. Expected: {actual_names}. Found: {PLOTTING_TOOL_NAMES}")

    return tools
