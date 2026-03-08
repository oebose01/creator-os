from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class Tool(BaseModel):
    """A tool that an agent can invoke."""

    name: str
    description: str
    input_schema: Dict[str, Any]  # JSON schema
    output_schema: Dict[str, Any]


class Agent(ABC):
    """Base class for all agents."""

    @abstractmethod
    async def run(self, input: Any, context: Dict[str, Any]) -> Any:
        """Execute the agent with given input and context."""
        pass  # pragma: no cover


class Plugin(BaseModel):
    """A plugin that provides agents and tools."""

    name: str
    version: str
    core_api_version: str  # Must match CORE_API_VERSION
    agents: List[Agent]
    tools: List[Tool]

    model_config = ConfigDict(arbitrary_types_allowed=True)  # Allow Agent instances


class StateStore(ABC):
    """Abstract storage for conversation state, feedback, etc."""

    @abstractmethod
    async def get(self, key: str) -> Optional[Any]:
        pass  # pragma: no cover

    @abstractmethod
    async def set(self, key: str, value: Any) -> None:
        pass  # pragma: no cover

    @abstractmethod
    async def delete(self, key: str) -> None:
        pass  # pragma: no cover


class EventBus(ABC):
    """Publish-subscribe for internal events."""

    @abstractmethod
    async def publish(self, event: str, data: Any) -> None:
        pass  # pragma: no cover

    @abstractmethod
    def subscribe(self, event: str, callback) -> None:
        pass  # pragma: no cover
