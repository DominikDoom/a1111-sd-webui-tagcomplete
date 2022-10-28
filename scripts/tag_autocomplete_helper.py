# This helper script scans folders for wildcards and embeddings and writes them
# to a temporary file to expose it to the javascript side

from pathlib import Path
from modules import scripts

# Webui root path
FILE_DIR = Path().absolute()

# The extension base path
EXT_PATH = FILE_DIR.joinpath('extensions')

# Tags base path
def get_tags_base_path():
    script_path = Path(scripts.basedir())
    if (script_path.is_relative_to(EXT_PATH)):
        return script_path.joinpath('tags')
    else:
        return FILE_DIR.joinpath('tags')

TAGS_PATH = get_tags_base_path()

# The path to the folder containing the wildcards and embeddings
WILDCARD_PATH = FILE_DIR.joinpath('scripts/wildcards')
EMB_PATH = FILE_DIR.joinpath('embeddings')

def find_ext_wildcard_paths():
    """Returns the path to the extension wildcards folder"""
    found = list(EXT_PATH.rglob('**/wildcards/'))
    return found

# The path to the extension wildcards folder
WILDCARD_EXT_PATHS = find_ext_wildcard_paths()

# The path to the temporary files
TEMP_PATH = TAGS_PATH.joinpath('temp')

def get_wildcards():
    """Returns a list of all wildcards. Works on nested folders."""
    wildcard_files = list(WILDCARD_PATH.rglob("*.txt"))
    resolved = [w.relative_to(WILDCARD_PATH).as_posix() for w in wildcard_files if w.name != "put wildcards here.txt"]
    return resolved

def get_ext_wildcards():
    """Returns a list of all extension wildcards. Works on nested folders."""
    wildcard_files = []

    for path in WILDCARD_EXT_PATHS:
        wildcard_files.append(path.relative_to(FILE_DIR).as_posix())
        wildcard_files.extend(p.relative_to(path).as_posix() for p in path.rglob("*.txt") if p.name != "put wildcards here.txt")
        wildcard_files.append("-----")

    return wildcard_files


def get_embeddings():
    """Returns a list of all embeddings"""
    return [str(e.relative_to(EMB_PATH)) for e in EMB_PATH.glob("**/*") if e.suffix in {".bin", ".pt", ".png"}]

def write_tag_base_path():
    """Writes the tag base path to a fixed location temporary file"""
    with open(FILE_DIR.joinpath('tmp/tagAutocompletePath.txt'), 'w', encoding="utf-8") as f:
        f.write(TAGS_PATH.relative_to(FILE_DIR).as_posix())

def write_to_temp_file(name, data):
    """Writes the given data to a temporary file"""
    with open(TEMP_PATH.joinpath(name), 'w', encoding="utf-8") as f:
        f.write(('\n'.join(data)))


# Write the tag base path to a fixed location temporary file
# to enable the javascript side to find our files regardless of extension folder name
write_tag_base_path()

# Check if the temp path exists and create it if not
if not TEMP_PATH.exists():
    TEMP_PATH.mkdir(parents=True, exist_ok=True)

# Set up files to ensure the script doesn't fail to load them
# even if no wildcards or embeddings are found
write_to_temp_file('wc.txt', [])
write_to_temp_file('wce.txt', [])
write_to_temp_file('emb.txt', [])

# Write wildcards to wc.txt if found
if WILDCARD_PATH.exists():
    wildcards = [WILDCARD_PATH.relative_to(FILE_DIR).as_posix()] + get_wildcards()
    if wildcards:
        write_to_temp_file('wc.txt', wildcards)

# Write extension wildcards to wce.txt if found
if WILDCARD_EXT_PATHS is not None:
    wildcards_ext = get_ext_wildcards()
    if wildcards_ext:
        write_to_temp_file('wce.txt', wildcards_ext)

# Write embeddings to emb.txt if found
if EMB_PATH.exists():
    embeddings = get_embeddings()
    if embeddings:
        write_to_temp_file('emb.txt', embeddings)
