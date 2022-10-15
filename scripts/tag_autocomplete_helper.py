# This helper script scans folders for wildcards and embeddings and writes them
# to a temporary file to expose it to the javascript side

import os

# The path to the folder containing the wildcards and embeddings
FILE_DIR = os.path.dirname(os.path.realpath("__file__"))
WILDCARD_PATH = os.path.join(FILE_DIR, 'scripts/wildcards')
EMB_PATH = os.path.join(FILE_DIR, 'embeddings')
# The path to the temporary file
TEMP_PATH = os.path.join(FILE_DIR, 'tags/temp')


def get_wildcards():
    """Returns a list of all wildcards"""
    return filter(lambda f: f.endswith(".txt"), os.listdir(WILDCARD_PATH))


def get_embeddings():
    """Returns a list of all embeddings"""
    return filter(lambda f: f.endswith(".bin") or f.endswith(".pt"), os.listdir(EMB_PATH))


def write_to_temp_file(name, data):
    """Writes the given data to a temporary file"""
    with open(os.path.join(TEMP_PATH, name), 'w') as f:
        f.write(('\n'.join(data)))


# Check if the temp path exists and create it if not
if not os.path.exists(TEMP_PATH):
    os.makedirs(TEMP_PATH)
    # Set up files to ensure the script doesn't fail to load them
    # even if no wildcards or embeddings are found
    write_to_temp_file('wc.txt', [])
    write_to_temp_file('emb.txt', [])

# Write wildcards to wc.txt if found
if os.path.exists(WILDCARD_PATH):
    wildcards = get_wildcards()
    if wildcards:
        write_to_temp_file('wc.txt', wildcards)

# Write embeddings to emb.txt if found
if os.path.exists(EMB_PATH):
    embeddings = get_embeddings()
    if embeddings:
        write_to_temp_file('emb.txt', embeddings)
