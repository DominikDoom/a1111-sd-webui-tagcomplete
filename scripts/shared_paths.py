from pathlib import Path

from modules import scripts, shared

try:
    from modules.paths import extensions_dir, script_path

    # Webui root path
    FILE_DIR = Path(script_path)

    # The extension base path
    EXT_PATH = Path(extensions_dir)
except ImportError:
    # Webui root path
    FILE_DIR = Path().absolute()
    # The extension base path
    EXT_PATH = FILE_DIR.joinpath("extensions")

# Tags base path
TAGS_PATH = Path(scripts.basedir()).joinpath("tags")

# The path to the folder containing the wildcards and embeddings
WILDCARD_PATH = FILE_DIR.joinpath("scripts/wildcards")
EMB_PATH = Path(shared.cmd_opts.embeddings_dir)
HYP_PATH = Path(shared.cmd_opts.hypernetwork_dir)

try:
    LORA_PATH = Path(shared.cmd_opts.lora_dir)
except AttributeError:
    LORA_PATH = None

try:
    LYCO_PATH = Path(shared.cmd_opts.lyco_dir_backcompat)
except AttributeError:
    LYCO_PATH = None


def find_ext_wildcard_paths():
    """Returns the path to the extension wildcards folder"""
    found = list(EXT_PATH.glob("*/wildcards/"))
    # Try to find the wildcard path from the shared opts
    try:
        from modules.shared import opts
    except ImportError:  # likely not in an a1111 context
        opts = None

    # Append custom wildcard paths
    custom_paths = [
        getattr(shared.cmd_opts, "wildcards_dir", None),    # Cmd arg from the wildcard extension
        getattr(opts, "wildcard_dir", None),                # Custom path from sd-dynamic-prompts
    ]
    for path in [Path(p) for p in custom_paths if p is not None]:
        if path.exists():
            found.append(path)

    return found


# The path to the extension wildcards folder
WILDCARD_EXT_PATHS = find_ext_wildcard_paths()

# The path to the temporary files
# In the webui root, on windows it exists by default, on linux it doesn't
STATIC_TEMP_PATH = FILE_DIR.joinpath("tmp")
TEMP_PATH = TAGS_PATH.joinpath("temp")  # Extension specific temp files

# Make sure these folders exist
if not TEMP_PATH.exists():
    TEMP_PATH.mkdir()
if not STATIC_TEMP_PATH.exists():
    STATIC_TEMP_PATH.mkdir()
