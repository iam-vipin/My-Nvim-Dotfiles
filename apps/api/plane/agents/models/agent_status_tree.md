stateDiagram-v2
    [*] --> CREATED: Agent Run Created
    
    CREATED --> IN_PROGRESS: Activity ACTION/THOUGHT/PROMPT(signal≠STOP)
    
    IN_PROGRESS --> IN_PROGRESS: Activity ACTION/THOUGHT/RESPONSE(not STOPPING)/PROMPT(signal≠STOP)
    IN_PROGRESS --> AWAITING: Activity ELICITATION
    IN_PROGRESS --> STOPPING: Activity PROMPT(signal=STOP)
    IN_PROGRESS --> FAILED: Activity ERROR
    
    AWAITING --> IN_PROGRESS: Activity ACTION/THOUGHT/RESPONSE/PROMPT(signal≠STOP)
    AWAITING --> STOPPING: Activity PROMPT(signal=STOP)
    AWAITING --> FAILED: Activity ERROR
    
    STOPPING --> STOPPED: Activity RESPONSE
    STOPPING --> FAILED: Activity ERROR
    
    FAILED --> [*]: ended_at set
    STOPPED --> [*]: ended_at, stopped_at, stopped_by set
    COMPLETED --> [*]: ended_at set
    
    note right of IN_PROGRESS
        Working State
        Agent is processing
    end note
    
    note right of AWAITING
        Paused State
        Waiting for user input
        (ELICITATION)
    end note
    
    note right of STOPPING
        Graceful Shutdown
        Stop requested
        (PROMPT with STOP signal)
    end note
    
    note right of FAILED
        Terminal State
        Error occurred
        Sets: ended_at, error_metadata
    end note
    
    note right of STOPPED
        Terminal State
        Stopped by user/system
        Sets: ended_at, stopped_at, stopped_by
    end note