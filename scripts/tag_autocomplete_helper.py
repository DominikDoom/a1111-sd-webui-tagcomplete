# This helper script scans folders for wildcards and embeddings and writes them
# to a temporary file to expose it to the javascript side

from pathlib import Path

# The path to the folder containing the wildcards and embeddings
FILE_DIR = Path().absolute()
WILDCARD_PATH = FILE_DIR.joinpath('scripts/wildcards')
EMB_PATH = FILE_DIR.joinpath('embeddings')
# The path to the temporary file
TEMP_PATH = FILE_DIR.joinpath('tags/temp')


def get_wildcards():
    """Returns a list of all wildcards. Works on nested folders."""
    wildcard_files = list(WILDCARD_PATH.rglob("*.txt"))
    resolved = [str(w.relative_to(WILDCARD_PATH)) for w in wildcard_files]
    return resolved


def get_embeddings():
    """Returns a list of all embeddings"""
    return [str(e.relative_to(EMB_PATH)) for e in EMB_PATH.glob("**/*") if e.suffix in {".bin", ".pt"}]


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
    write_to_temp_file('emb.txt', [])

# Write wildcards to wc.txt if found
if WILDCARD_PATH.exists():
    wildcards = get_wildcards()
    if wildcards:
        write_to_temp_file('wc.txt', wildcards)

# Write embeddings to emb.txt if found
if EMB_PATH.exists():
    embeddings = get_embeddings()
    if embeddings:
        write_to_temp_file('emb.txt', embeddings)
