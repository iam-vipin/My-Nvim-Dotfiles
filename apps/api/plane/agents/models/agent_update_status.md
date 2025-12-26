flowchart TD
    Start([Activity Saved]) --> UpdateStatus[update_run_status called]
    
    UpdateStatus --> CheckType{Activity Type?}
    
    CheckType -->|ACTION or THOUGHT| Action[Status = IN_PROGRESS]
    Action --> SaveRun[Save Agent Run]
    
    CheckType -->|ERROR| Error[Status = FAILED<br/>ended_at = now<br/>error_metadata = signal_metadata]
    Error --> SaveRun
    
    CheckType -->|RESPONSE| ResponseCheck{Current Status<br/>= STOPPING?}
    ResponseCheck -->|Yes| Stopped[Status = STOPPED<br/>stopped_at = now<br/>stopped_by = user<br/>ended_at = now]
    ResponseCheck -->|No| ResponseProgress[Status = IN_PROGRESS]
    Stopped --> SaveRun
    ResponseProgress --> SaveRun
    
    CheckType -->|ELICITATION| Elicit[Status = AWAITING]
    Elicit --> SaveRun
    
    CheckType -->|PROMPT| PromptCheck{Signal = STOP?}
    PromptCheck -->|Yes| Stopping[Status = STOPPING]
    PromptCheck -->|No| PromptProgress[Status = IN_PROGRESS]
    Stopping --> SaveRun
    PromptProgress --> SaveRun
    
    CheckType -->|Other| Default[Status = IN_PROGRESS]
    Default --> SaveRun
    
    SaveRun --> End([End])
    
    style Start stroke:#4caf54,stroke-width:3px
    style End stroke:#4caf50,stroke-width:3px
    
    style Action stroke:#2196f3,stroke-width:2px
    style ResponseProgress stroke:#2196f3,stroke-width:2px
    style PromptProgress stroke:#2196f3,stroke-width:2px
    style Default stroke:#2196f3,stroke-width:2px
    
    style Elicit stroke:#fbc023,stroke-width:2px
    style Stopping stroke:#ff5722,stroke-width:2px
    style Stopped stroke:#f44336,stroke-width:2px
    style Error stroke:#c62828,stroke-width:2px
    
    style CheckType stroke:#9c27b0,stroke-width:2px
    style ResponseCheck stroke:#9c27b0,stroke-width:2px
    style PromptCheck stroke:#9c27b0,stroke-width:2px
    
    style SaveRun stroke:#388e3c,stroke-width:2px