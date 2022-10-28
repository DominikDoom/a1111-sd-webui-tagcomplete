# This helper script scans folders for wildcards and embeddings and writes them
# to a temporary file to expose it to the javascript side

from pathlib import Path

# The path to the folder containing the wildcards and embeddings
FILE_DIR = Path().absolute()
WILDCARD_PATH = FILE_DIR.joinpath('scripts/wildcards')
EMB_PATH = FILE_DIR.joinpath('embeddings')

EXT_PATH = FILE_DIR.joinpath('extensions')

def find_ext_wildcard_path():
    """Returns the path to the extension wildcards folder"""
    found = list(EXT_PATH.rglob('**/wildcards/'))[0]
    return found

WILDCARD_EXT_PATH = find_ext_wildcard_path()

# The path to the temporary file
TEMP_PATH = FILE_DIR.joinpath('tags/temp')

def get_wildcards():
    """Returns a list of all wildcards. Works on nested folders."""
    wildcard_files = list(WILDCARD_PATH.rglob("*.txt"))
    resolved = [w.relative_to(WILDCARD_PATH).as_posix() for w in wildcard_files if w.name != "put wildcards here.txt"]
    return resolved

def get_ext_wildcards():
    """Returns a list of all extension wildcards. Works on nested folders."""
    wildcard_files = list(WILDCARD_EXT_PATH.rglob("*.txt"))
    resolved = [w.relative_to(WILDCARD_EXT_PATH).as_posix() for w in wildcard_files if w.name != "put wildcards here.txt"]
    return resolved


def get_embeddings():
    """Returns a list of all embeddings"""
    return [str(e.relative_to(EMB_PATH)) for e in EMB_PATH.glob("**/*") if e.suffix in {".bin", ".pt", ".png"}]


def write_to_temp_file(name, data):
    """Writes the given data to a temporary file"""
    with open(TEMP_PATH.joinpath(name), 'w', encoding="utf-8") as f:
        f.write(('\n'.join(data)))


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
if WILDCARD_EXT_PATH.exists():
    wildcards_ext = [WILDCARD_EXT_PATH.relative_to(FILE_DIR).as_posix()] + get_ext_wildcards()
    if wildcards_ext:
        write_to_temp_file('wce.txt', wildcards_ext)

# Write embeddings to emb.txt if found
if EMB_PATH.exists():
    embeddings = get_embeddings()
    if embeddings:
        write_to_temp_file('emb.txt', embeddings)
