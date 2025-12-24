# Third-party imports
import strawberry

# Strawberry imports
from strawberry.scalars import JSON


@strawberry.type
class WorkItemPageType:
    id: str
    name: str
    logo_props: JSON
    is_global: bool
    access: int
