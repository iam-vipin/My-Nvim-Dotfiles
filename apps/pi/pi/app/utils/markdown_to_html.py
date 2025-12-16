from markdown_it import MarkdownIt
from mdit_py_plugins.container import container_plugin
from mdit_py_plugins.deflist import deflist_plugin
from mdit_py_plugins.footnote import footnote_plugin
from mdit_py_plugins.tasklists import tasklists_plugin

md = (
    MarkdownIt("commonmark", {"typographer": True})
    .enable("table")
    .enable("strikethrough")
    .use(tasklists_plugin)
    .use(footnote_plugin)
    .use(container_plugin, name="callout")
    .use(deflist_plugin)
)


def md_to_html(markdown_text: str) -> str:
    if not markdown_text:
        return ""

    html = md.render(markdown_text)

    return html
