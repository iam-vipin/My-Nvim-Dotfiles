[DRAFT]

# Documenting the creation of the KIT

## Overview
The KIT is a modular framework for building AI-powered features for Plane.so

## Architecture
> **Intution**: Building agents with LLM (large language model) as its core controller. There would be a single planning agent, which is the processing unit of the whole system, just like the human brain. Limbs are controlled by brain but sometime there might be involuntary movements, which can be muscle memory.

### LLM Backend:
This is the basic component that will be used by every agent. Creating request and parsing response will be done by this component. There can be multiple backend all switched by the user anytime. There might also be task where we need to make parallel requests to same backend, for that we need to use async backends. Example: making different agents to work together on same task Sequentiall

This implementation allows:
- Use different models for different LLM instances.
- Set unique system prompts for each LLM.
- Choose between synchronous and asynchronous operations based on your needs.
- Easily integrate with different types of agents without exposing the async nature if not needed.


```py
from pi.services.llm import LLM # LLM client for every agents
from pi.services.llm import LLMModel # LLMModel contains all available models implemented in KIT

model = LLMModel.GPT_4O_MINI # choose available model
system = "You are SQL expert." # Create a system prompt
```


```py
# Synchronous usage
llm = LLM('gpt')
llm.setup(model=model, system=system)
response = llm.invoke("Explain SQL in simple terms.")
print(response.content)
```

```py
# Asynchronous usage
async def async_example():
    llm = LLM("gpt")
    await llm.asetup(model=model, system=system)
    response = await llm.ainvoke("Explain SQL in simple terms.")
    return response.content

import asyncio
asyncio.run(async_example())
```

```py
# few shot example
messages = [
    {"role": "user", "content": "hello, how are you"},
    {"role": "assistant", "content": "I am fine thank you"},
]
llm.setup(model=model, system=system)
llm.invoke(prompt="something ...", messages=messages)
```

```py
# Streaming response
# pass `stream = True` to get streaming response
async def main():
    llm = LLM("gpt")
    await llm.asetup(model=LLMModel.GPT_4O_MINI, system=SYSTEM)
    res = await llm.ainvoke(prompt="What is the difference between a SQL query and a PQL query?", stream=True)
    async for chunk in res.aistream_response:
        print(chunk, end="")
asyncio.run(main())
```

```py
# changing the backend
## Say we implemented 'claude' and 'pplx' backends
## See llm/base.py for the implementation

cllm = LLM('claude')
cllm.setup(model=model, system=system)
cllm.invoke("Explain SQL in simple terms.")

pllm = LLM('pplx')
pllm.setup(model=model, system=system)
pllm.invoke("Explain SQL in simple terms.")
```

-----------------------
below are not implemented yet  
### Brain:
 Command Pattern (as you mentioned)
 Strategy Pattern (for Task Manager)
 Observer Pattern (for Watchdog)

### Agents:
 Factory Pattern (for agent creation)
 State Pattern (for agent states)

### System:
 Publish-Subscribe Pattern (for inter-component communication)
 Adapter Pattern (for external integrations)
 Facade Pattern (for simplifying complex operations)

### Task Structures:
 Composite Pattern (for hierarchical tasks)
 Chain of Responsibility (for task delegation)
