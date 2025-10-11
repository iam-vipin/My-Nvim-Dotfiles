import warnings

warnings.warn("Needs refactoring", DeprecationWarning)

from .initial_feed import get_all_file_paths
from .initial_feed import process_file
from .initial_feed import process_repo_contents

__all__ = [
    "process_repo_contents",
    "get_all_file_paths",
    "process_file",
]
