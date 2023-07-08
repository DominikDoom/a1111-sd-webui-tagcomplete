# This file provides support for the model-keyword extension to add known lora keywords on completion

import hashlib
from pathlib import Path

from scripts.shared_paths import EXT_PATH, STATIC_TEMP_PATH, TEMP_PATH

# Set up our hash cache
known_hashes_file = TEMP_PATH.joinpath("known_lora_hashes.txt")
known_hashes_file.touch()
file_needs_update = False

# Load the hashes from the file
hash_dict = {}


def load_hash_cache():
    with open(known_hashes_file, "r") as file:
        for line in file:
            name, hash, mtime = line.replace("\n", "").split(",")
            hash_dict[name] = (hash, mtime)


def update_hash_cache():
    global file_needs_update
    if file_needs_update:
        with open(known_hashes_file, "w") as file:
            for name, (hash, mtime) in hash_dict.items():
                file.write(f"{name},{hash},{mtime}\n")


# Copy of the fast inaccurate hash function from the extension
# with some modifications to load from and write to the cache
def get_lora_simple_hash(path):
    global file_needs_update
    mtime = str(Path(path).stat().st_mtime)
    filename = Path(path).name

    if filename in hash_dict:
        (hash, old_mtime) = hash_dict[filename]
        if mtime == old_mtime:
            return hash
    try:
        with open(path, "rb") as file:
            m = hashlib.sha256()

            file.seek(0x100000)
            m.update(file.read(0x10000))
            hash = m.hexdigest()[0:8]

            hash_dict[filename] = (hash, mtime)
            file_needs_update = True

            return hash
    except FileNotFoundError:
        return "NOFILE"


# Find the path of the original model-keyword extension
def write_model_keyword_path():
    # Ensure the file exists even if the extension is not installed
    mk_path = STATIC_TEMP_PATH.joinpath("modelKeywordPath.txt")
    mk_path.write_text("")

    base_keywords = list(EXT_PATH.glob("*/lora-keyword.txt"))
    custom_keywords = list(EXT_PATH.glob("*/lora-keyword-user.txt"))
    custom_found = custom_keywords is not None and len(custom_keywords) > 0
    if base_keywords is not None and len(base_keywords) > 0:
        with open(mk_path, "w", encoding="utf-8") as f:
            f.write(f"{base_keywords[0].parent.as_posix()},{custom_found}")
        return True
    else:
        print(
            "Tag Autocomplete: Could not locate model-keyword extension, LORA/LYCO trigger word completion will be unavailable."
        )
        return False
