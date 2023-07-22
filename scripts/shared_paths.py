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
    EXT_PATH = FILE_DIR.joinpath('extensions')

# Tags base path
TAGS_PATH = Path(scripts.basedir()).joinpath('tags')

# The path to the folder containing the wildcards and embeddings
WILDCARD_PATH = FILE_DIR.joinpath('scripts/wildcards')
EMB_PATH = Path(shared.cmd_opts.embeddings_dir)
HYP_PATH = Path(shared.cmd_opts.hypernetwork_dir)

try:
    LORA_PATH = Path(shared.cmd_opts.lora_dir)
except AttributeError:
    LORA_PATH = None
    
try:
    LYCO_PATH = Path(shared.cmd_opts.lyco_dir)
except AttributeError:
    LYCO_PATH = None

def find_ext_wildcard_paths():
    """Returns the path to the extension wildcards folder"""
    found = list(EXT_PATH.glob('*/wildcards/'))
    return found


# The path to the extension wildcards folder
WILDCARD_EXT_PATHS = find_ext_wildcard_paths()

# The path to the temporary files
STATIC_TEMP_PATH = FILE_DIR.joinpath('tmp') # In the webui root, on windows it exists by default, on linux it doesn't
TEMP_PATH = TAGS_PATH.joinpath('temp') # Extension specific temp files