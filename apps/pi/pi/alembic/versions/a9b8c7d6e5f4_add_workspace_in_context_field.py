from typing import Sequence
from typing import Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a9b8c7d6e5f4"
down_revision: Union[str, None] = "f4c8d9e1b2a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add workspace_in_context column to chats table (nullable for existing rows)
    op.add_column("chats", sa.Column("workspace_in_context", sa.Boolean(), nullable=True))


def downgrade() -> None:
    # Remove workspace_in_context column from chats table
    op.drop_column("chats", "workspace_in_context")
