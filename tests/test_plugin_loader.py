import pytest
from core.plugin_loader import PluginLoader, PluginLoadError
from core import CORE_API_VERSION


def test_load_valid_plugin(tmp_path):
    """Load a plugin with correct core API version."""
    plugin_dir = tmp_path / "plugins"
    plugin_dir.mkdir()
    plugin_file = plugin_dir / "hello_plugin.py"

    # Write a minimal valid plugin
    plugin_file.write_text("""
from core.interfaces import Plugin, Agent, Tool
from core import CORE_API_VERSION

class DummyAgent(Agent):
    async def run(self, input, context):
        return "hello"

plugin = Plugin(
    name="hello",
    version="0.1.0",
    core_api_version=CORE_API_VERSION,
    agents=[DummyAgent()],
    tools=[]
)
""")

    loader = PluginLoader(plugin_dir)
    plugin = loader.load_plugin(plugin_file)

    assert plugin.name == "hello"
    assert plugin.version == "0.1.0"
    assert plugin.core_api_version == CORE_API_VERSION
    assert len(plugin.agents) == 1


def test_load_plugin_wrong_version(tmp_path):
    """Plugin with mismatched core API version should fail."""
    plugin_dir = tmp_path / "plugins"
    plugin_dir.mkdir()
    plugin_file = plugin_dir / "bad_plugin.py"

    plugin_file.write_text("""
from core.interfaces import Plugin, Agent, Tool
from core import CORE_API_VERSION

class DummyAgent(Agent):
    async def run(self, input, context):
        return "hello"

plugin = Plugin(
    name="bad",
    version="0.1.0",
    core_api_version="0.9.0",  # wrong
    agents=[DummyAgent()],
    tools=[]
)
""")

    loader = PluginLoader(plugin_dir)
    with pytest.raises(PluginLoadError, match="requires core API 0.9.0"):
        loader.load_plugin(plugin_file)


def test_load_plugin_missing_plugin_var(tmp_path):
    """Plugin file without 'plugin' variable should fail."""
    plugin_dir = tmp_path / "plugins"
    plugin_dir.mkdir()
    plugin_file = plugin_dir / "no_plugin.py"

    plugin_file.write_text("""
# no plugin variable
x = 1
""")

    loader = PluginLoader(plugin_dir)
    with pytest.raises(PluginLoadError, match="does not define a 'plugin' variable"):
        loader.load_plugin(plugin_file)


def test_load_plugin_not_a_plugin_instance(tmp_path):
    """Plugin file with 'plugin' variable not a Plugin instance should fail."""
    plugin_dir = tmp_path / "plugins"
    plugin_dir.mkdir()
    plugin_file = plugin_dir / "not_plugin_instance.py"

    plugin_file.write_text("""
from core.interfaces import Plugin, Agent, Tool
# plugin is a string, not a Plugin instance
plugin = "I am not a plugin"
""")

    loader = PluginLoader(plugin_dir)
    with pytest.raises(PluginLoadError, match="is not a Plugin instance"):
        loader.load_plugin(plugin_file)


def test_discover_plugins(tmp_path):
    """Discover should find .py files."""
    plugin_dir = tmp_path / "plugins"
    plugin_dir.mkdir()
    (plugin_dir / "a.py").touch()
    (plugin_dir / "b.py").touch()
    (plugin_dir / "not_plugin.txt").touch()

    loader = PluginLoader(plugin_dir)
    found = loader.discover_plugins()
    assert len(found) == 2
    assert all(f.suffix == ".py" for f in found)


def test_load_all(tmp_path):
    """load_all should load all valid plugins and skip invalid ones."""
    plugin_dir = tmp_path / "plugins"
    plugin_dir.mkdir()

    # Valid plugin
    (plugin_dir / "good.py").write_text("""
from core.interfaces import Plugin, Agent, Tool
from core import CORE_API_VERSION

class DummyAgent(Agent):
    async def run(self, input, context):
        return "hello"

plugin = Plugin(
    name="good",
    version="0.1.0",
    core_api_version=CORE_API_VERSION,
    agents=[DummyAgent()],
    tools=[]
)
""")

    # Invalid plugin (wrong version)
    (plugin_dir / "bad.py").write_text("""
from core.interfaces import Plugin, Agent, Tool

class DummyAgent(Agent):
    async def run(self, input, context):
        return "hello"

plugin = Plugin(
    name="bad",
    version="0.1.0",
    core_api_version="0.0.1",
    agents=[DummyAgent()],
    tools=[]
)
""")

    loader = PluginLoader(plugin_dir)
    plugins = loader.load_all()

    assert "good" in plugins
    assert "bad" not in plugins  # should be skipped due to error


def test_get_plugin(tmp_path):
    """After loading, get_plugin should return the plugin by name."""
    plugin_dir = tmp_path / "plugins"
    plugin_dir.mkdir()
    plugin_file = plugin_dir / "hello_plugin.py"

    plugin_file.write_text("""
from core.interfaces import Plugin, Agent, Tool
from core import CORE_API_VERSION

class DummyAgent(Agent):
    async def run(self, input, context):
        return "hello"

plugin = Plugin(
    name="hello",
    version="0.1.0",
    core_api_version=CORE_API_VERSION,
    agents=[DummyAgent()],
    tools=[]
)
""")

    loader = PluginLoader(plugin_dir)
    loader.load_all()
    plugin = loader.get_plugin("hello")
    assert plugin is not None
    assert plugin.name == "hello"
    assert loader.get_plugin("nonexistent") is None
