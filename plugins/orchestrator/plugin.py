from core.interfaces import Agent, Tool, Plugin
from core import CORE_API_VERSION
from typing import Any, Dict, List
from langgraph.graph import StateGraph, END
from typing import TypedDict

# Import tool functions from known plugins
from plugins.file_io.tools import read_file, write_file
from plugins.code_executor.tools import execute_python

# Map tool names to functions
_TOOL_FUNCTIONS = {
    "read_file": read_file,
    "write_file": write_file,
    "execute_python": execute_python,
    "echo": lambda message: message  # simple echo
}

class AgentState(TypedDict):
    input: Any
    output: Any
    tools: List[Tool]

def route_and_call_tool(state: AgentState) -> AgentState:
    """Node that finds the requested tool and executes its function."""
    input_data = state["input"]
    tools = state["tools"]

    if not isinstance(input_data, dict):
        state["output"] = "Input must be a dict with 'tool' and 'args'"
        return state

    tool_name = input_data.get("tool")
    args = input_data.get("args", {})

    # First, check if tool exists in the available tools list
    tool_names = [t.name for t in tools]
    if tool_name not in tool_names:
        state["output"] = f"Tool '{tool_name}' not found in available tools"
        return state

    # Then check if we have a function mapping for it
    if tool_name in _TOOL_FUNCTIONS:
        try:
            result = _TOOL_FUNCTIONS[tool_name](**args)
            state["output"] = result
        except Exception as e:
            state["output"] = f"Error executing tool: {str(e)}"
        return state

    # If it's in the list but no mapping (shouldn't happen if we keep mapping in sync)
    state["output"] = f"Tool '{tool_name}' found but no implementation"
    return state

class OrchestratorAgent(Agent):
    def __init__(self):
        builder = StateGraph(AgentState)
        builder.add_node("router", route_and_call_tool)
        builder.set_entry_point("router")
        builder.add_edge("router", END)
        self.graph = builder.compile()

    async def run(self, input: Any, context: Dict[str, Any]) -> Any:
        initial_state = {
            "input": input,
            "output": None,
            "tools": context.get("tools", [])
        }
        result = await self.graph.ainvoke(initial_state)
        return result["output"]

plugin = Plugin(
    name="orchestrator",
    version="0.1.0",
    core_api_version=CORE_API_VERSION,
    agents=[OrchestratorAgent()],
    tools=[]
)
