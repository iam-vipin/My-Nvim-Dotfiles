from .agent_run import urlpatterns as agent_run_patterns
from .agent_run_activity import urlpatterns as agent_run_activity_patterns

urlpatterns = [
    *agent_run_patterns,
    *agent_run_activity_patterns,
]