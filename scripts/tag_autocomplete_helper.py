# This helper script scans folders for wildcards and embeddings and writes them
# to a temporary file to expose it to the javascript side

import glob
from pathlib import Path

import gradio as gr
import yaml
from modules import script_callbacks, scripts, sd_hijack, shared

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


def get_wildcards():
    """Returns a list of all wildcards. Works on nested folders."""
    wildcard_files = list(WILDCARD_PATH.rglob("*.txt"))
    resolved = [w.relative_to(WILDCARD_PATH).as_posix(
    ) for w in wildcard_files if w.name != "put wildcards here.txt"]
    return resolved


def get_ext_wildcards():
    """Returns a list of all extension wildcards. Works on nested folders."""
    wildcard_files = []

    for path in WILDCARD_EXT_PATHS:
        wildcard_files.append(path.relative_to(FILE_DIR).as_posix())
        wildcard_files.extend(p.relative_to(path).as_posix() for p in path.rglob("*.txt") if p.name != "put wildcards here.txt")
        wildcard_files.append("-----")

    return wildcard_files


def get_ext_wildcard_tags():
    """Returns a list of all tags found in extension YAML files found under a Tags: key."""
    wildcard_tags = {} # { tag: count }
    yaml_files = []
    for path in WILDCARD_EXT_PATHS:
        yaml_files.extend(p for p in path.rglob("*.yml"))
        yaml_files.extend(p for p in path.rglob("*.yaml"))
    count = 0
    for path in yaml_files:
        try:
            with open(path, encoding="utf8") as file:
                data = yaml.safe_load(file)
                for item in data:
                    if data[item] and 'Tags' in data[item]:
                        wildcard_tags[count] = ','.join(data[item]['Tags'])
                        count += 1
                    else:
                        print('Issue with tags found in ' + path.name + ' at item ' + item)
        except yaml.YAMLError as exc:
            print(exc)
    # Sort by count
    sorted_tags = sorted(wildcard_tags.items(), key=lambda item: item[1], reverse=True)
    output = []
    for tag, count in sorted_tags:
        output.append(f"{tag},{count}")
    return output


def get_embeddings(sd_model):
    """Write a list of all embeddings with their version"""

    # Version constants
    V1_SHAPE = 768
    V2_SHAPE = 1024
    emb_v1 = []
    emb_v2 = []
    results = []

    try:
        # Get embedding dict from sd_hijack to separate v1/v2 embeddings
        emb_type_a = sd_hijack.model_hijack.embedding_db.word_embeddings
        emb_type_b = sd_hijack.model_hijack.embedding_db.skipped_embeddings
        # Get the shape of the first item in the dict
        emb_a_shape = -1
        emb_b_shape = -1
        if (len(emb_type_a) > 0):
            emb_a_shape = next(iter(emb_type_a.items()))[1].shape
        if (len(emb_type_b) > 0):
            emb_b_shape = next(iter(emb_type_b.items()))[1].shape

        # Add embeddings to the correct list
        if (emb_a_shape == V1_SHAPE):
            emb_v1 = list(emb_type_a.keys())
        elif (emb_a_shape == V2_SHAPE):
            emb_v2 = list(emb_type_a.keys())

        if (emb_b_shape == V1_SHAPE):
            emb_v1 = list(emb_type_b.keys())
        elif (emb_b_shape == V2_SHAPE):
            emb_v2 = list(emb_type_b.keys())

        # Get shape of current model
        #vec = sd_model.cond_stage_model.encode_embedding_init_text(",", 1)
        #model_shape = vec.shape[1]
        # Show relevant entries at the top
        #if (model_shape == V1_SHAPE):
        #    results = [e + ",v1" for e in emb_v1] + [e + ",v2" for e in emb_v2]
        #elif (model_shape == V2_SHAPE):
        #    results = [e + ",v2" for e in emb_v2] + [e + ",v1" for e in emb_v1]
        #else:
        #    raise AttributeError # Fallback to old method
        results = sorted([e + ",v1" for e in emb_v1] + [e + ",v2" for e in emb_v2], key=lambda x: x.lower())
    except AttributeError:
        print("tag_autocomplete_helper: Old webui version or unrecognized model shape, using fallback for embedding completion.")
        # Get a list of all embeddings in the folder
        all_embeds = [str(e.relative_to(EMB_PATH)) for e in EMB_PATH.rglob("*") if e.suffix in {".bin", ".pt", ".png",'.webp', '.jxl', '.avif'}]
        # Remove files with a size of 0
        all_embeds = [e for e in all_embeds if EMB_PATH.joinpath(e).stat().st_size > 0]
        # Remove file extensions
        all_embeds = [e[:e.rfind('.')] for e in all_embeds]
        results = [e + "," for e in all_embeds]

    write_to_temp_file('emb.txt', results)

def get_hypernetworks():
    """Write a list of all hypernetworks"""

    # Get a list of all hypernetworks in the folder
    hyp_paths = [Path(h) for h in glob.glob(HYP_PATH.joinpath("**/*").as_posix(), recursive=True)]
    all_hypernetworks = [str(h.name) for h in hyp_paths if h.suffix in {".pt"}]
    # Remove file extensions
    return sorted([h[:h.rfind('.')] for h in all_hypernetworks], key=lambda x: x.lower())

def get_lora():
    """Write a list of all lora"""

    # Get a list of all lora in the folder
    lora_paths = [Path(l) for l in glob.glob(LORA_PATH.joinpath("**/*").as_posix(), recursive=True)]
    all_lora = [str(l.name) for l in lora_paths if l.suffix in {".safetensors", ".ckpt", ".pt"}]
    # Remove file extensions
    return sorted([l[:l.rfind('.')] for l in all_lora], key=lambda x: x.lower())

def get_lyco():
    """Write a list of all LyCORIS/LOHA from https://github.com/KohakuBlueleaf/a1111-sd-webui-lycoris"""

    # Get a list of all LyCORIS in the folder
    lyco_paths = [Path(ly) for ly in glob.glob(LYCO_PATH.joinpath("**/*").as_posix(), recursive=True)]
    all_lyco = [str(ly.name) for ly in lyco_paths if ly.suffix in {".safetensors", ".ckpt", ".pt"}]
    # Remove file extensions
    return sorted([ly[:ly.rfind('.')] for ly in all_lyco], key=lambda x: x.lower())

def write_tag_base_path():
    """Writes the tag base path to a fixed location temporary file"""
    with open(STATIC_TEMP_PATH.joinpath('tagAutocompletePath.txt'), 'w', encoding="utf-8") as f:
        f.write(TAGS_PATH.relative_to(FILE_DIR).as_posix())


def write_to_temp_file(name, data):
    """Writes the given data to a temporary file"""
    with open(TEMP_PATH.joinpath(name), 'w', encoding="utf-8") as f:
        f.write(('\n'.join(data)))


csv_files = []
csv_files_withnone = []
def update_tag_files():
    """Returns a list of all potential tag files"""
    global csv_files, csv_files_withnone
    files = [str(t.relative_to(TAGS_PATH)) for t in TAGS_PATH.glob("*.csv")]
    csv_files = files
    csv_files_withnone = ["None"] + files

json_files = []
json_files_withnone = []
def update_json_files():
    """Returns a list of all potential json files"""
    global json_files, json_files_withnone
    files = [str(j.relative_to(TAGS_PATH)) for j in TAGS_PATH.glob("*.json")]
    json_files = files
    json_files_withnone = ["None"] + files


# Write the tag base path to a fixed location temporary file
# to enable the javascript side to find our files regardless of extension folder name
if not STATIC_TEMP_PATH.exists():
    STATIC_TEMP_PATH.mkdir(exist_ok=True)

write_tag_base_path()
update_tag_files()
update_json_files()

# Check if the temp path exists and create it if not
if not TEMP_PATH.exists():
    TEMP_PATH.mkdir(parents=True, exist_ok=True)

# Set up files to ensure the script doesn't fail to load them
# even if no wildcards or embeddings are found
write_to_temp_file('wc.txt', [])
write_to_temp_file('wce.txt', [])
write_to_temp_file('wcet.txt', [])
write_to_temp_file('hyp.txt', [])
write_to_temp_file('lora.txt', [])
write_to_temp_file('lyco.txt', [])
# Only reload embeddings if the file doesn't exist, since they are already re-written on model load
if not TEMP_PATH.joinpath("emb.txt").exists():
    write_to_temp_file('emb.txt', [])

# Write embeddings to emb.txt if found
if EMB_PATH.exists():
    # Get embeddings after the model loaded callback
    script_callbacks.on_model_loaded(get_embeddings)

def refresh_temp_files():
    write_temp_files()
    get_embeddings(shared.sd_model)

def write_temp_files():
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
        # Write yaml extension wildcards to wcet.txt if found
        wildcards_yaml_ext = get_ext_wildcard_tags()
        if wildcards_yaml_ext:
            write_to_temp_file('wcet.txt', wildcards_yaml_ext)

    if HYP_PATH.exists():
        hypernets = get_hypernetworks()
        if hypernets:
            write_to_temp_file('hyp.txt', hypernets)

    if LORA_PATH is not None and LORA_PATH.exists():
        lora = get_lora()
        if lora:
            write_to_temp_file('lora.txt', lora)

    if LYCO_PATH is not None and LYCO_PATH.exists():
        lyco = get_lyco()
        if lyco:
            write_to_temp_file('lyco.txt', lyco)


write_temp_files()

# Register autocomplete options
def on_ui_settings():
    TAC_SECTION = ("tac", "Tag Autocomplete")
    # Main tag file
    shared.opts.add_option("tac_tagFile", shared.OptionInfo("danbooru.csv", "Tag filename", gr.Dropdown, lambda: {"choices": csv_files_withnone}, refresh=update_tag_files, section=TAC_SECTION))
    # Active in settings
    shared.opts.add_option("tac_active", shared.OptionInfo(True, "Enable Tag Autocompletion", section=TAC_SECTION))
    shared.opts.add_option("tac_activeIn.txt2img", shared.OptionInfo(True, "Active in txt2img (Requires restart)", section=TAC_SECTION))
    shared.opts.add_option("tac_activeIn.img2img", shared.OptionInfo(True, "Active in img2img (Requires restart)", section=TAC_SECTION))
    shared.opts.add_option("tac_activeIn.negativePrompts", shared.OptionInfo(True, "Active in negative prompts (Requires restart)", section=TAC_SECTION))
    shared.opts.add_option("tac_activeIn.thirdParty", shared.OptionInfo(True, "Active in third party textboxes [Dataset Tag Editor] [Image Browser] [Tagger] [Multidiffusion Upscaler] (Requires restart)", section=TAC_SECTION))
    shared.opts.add_option("tac_activeIn.modelList", shared.OptionInfo("", "List of model names (with file extension) or their hashes to use as black/whitelist, separated by commas.", section=TAC_SECTION))
    shared.opts.add_option("tac_activeIn.modelListMode", shared.OptionInfo("Blacklist", "Mode to use for model list", gr.Dropdown, lambda: {"choices": ["Blacklist","Whitelist"]}, section=TAC_SECTION))
    # Results related settings
    shared.opts.add_option("tac_slidingPopup", shared.OptionInfo(True, "Move completion popup together with text cursor", section=TAC_SECTION))
    shared.opts.add_option("tac_maxResults", shared.OptionInfo(5, "Maximum results", section=TAC_SECTION))
    shared.opts.add_option("tac_showAllResults", shared.OptionInfo(False, "Show all results", section=TAC_SECTION))
    shared.opts.add_option("tac_resultStepLength", shared.OptionInfo(100, "How many results to load at once", section=TAC_SECTION))
    shared.opts.add_option("tac_delayTime", shared.OptionInfo(100, "Time in ms to wait before triggering completion again (Requires restart)", section=TAC_SECTION))
    shared.opts.add_option("tac_useWildcards", shared.OptionInfo(True, "Search for wildcards", section=TAC_SECTION))
    shared.opts.add_option("tac_useEmbeddings", shared.OptionInfo(True, "Search for embeddings", section=TAC_SECTION))
    shared.opts.add_option("tac_useHypernetworks", shared.OptionInfo(True, "Search for hypernetworks", section=TAC_SECTION))
    shared.opts.add_option("tac_useLoras", shared.OptionInfo(True, "Search for Loras", section=TAC_SECTION))
    shared.opts.add_option("tac_useLycos", shared.OptionInfo(True, "Search for LyCORIS/LoHa", section=TAC_SECTION))
    shared.opts.add_option("tac_showWikiLinks", shared.OptionInfo(False, "Show '?' next to tags, linking to its Danbooru or e621 wiki page (Warning: This is an external site and very likely contains NSFW examples!)", section=TAC_SECTION))
    # Insertion related settings
    shared.opts.add_option("tac_replaceUnderscores", shared.OptionInfo(True, "Replace underscores with spaces on insertion", section=TAC_SECTION))
    shared.opts.add_option("tac_escapeParentheses", shared.OptionInfo(True, "Escape parentheses on insertion", section=TAC_SECTION))
    shared.opts.add_option("tac_appendComma", shared.OptionInfo(True, "Append comma on tag autocompletion", section=TAC_SECTION))
    # Alias settings
    shared.opts.add_option("tac_alias.searchByAlias", shared.OptionInfo(True, "Search by alias", section=TAC_SECTION))
    shared.opts.add_option("tac_alias.onlyShowAlias", shared.OptionInfo(False, "Only show alias", section=TAC_SECTION))
    # Translation settings
    shared.opts.add_option("tac_translation.translationFile", shared.OptionInfo("None", "Translation filename", gr.Dropdown, lambda: {"choices": csv_files_withnone}, refresh=update_tag_files, section=TAC_SECTION))
    shared.opts.add_option("tac_translation.oldFormat", shared.OptionInfo(False, "Translation file uses old 3-column translation format instead of the new 2-column one", section=TAC_SECTION))
    shared.opts.add_option("tac_translation.searchByTranslation", shared.OptionInfo(True, "Search by translation", section=TAC_SECTION))
    shared.opts.add_option("tac_translation.liveTranslation", shared.OptionInfo(False, "Show live tag translation below prompt (WIP, expect some bugs)", section=TAC_SECTION))
    # Extra file settings
    shared.opts.add_option("tac_extra.extraFile", shared.OptionInfo("extra-quality-tags.csv", "Extra filename (for small sets of custom tags)", gr.Dropdown, lambda: {"choices": csv_files_withnone}, refresh=update_tag_files, section=TAC_SECTION))
    shared.opts.add_option("tac_extra.addMode", shared.OptionInfo("Insert before", "Mode to add the extra tags to the main tag list", gr.Dropdown, lambda: {"choices": ["Insert before","Insert after"]}, section=TAC_SECTION))
    # Chant settings
    shared.opts.add_option("tac_chantFile", shared.OptionInfo("demo-chants.json", "Chant filename (Chants are longer prompt presets)", gr.Dropdown, lambda: {"choices": json_files_withnone}, refresh=update_json_files, section=TAC_SECTION))
    # Custom mappings
    keymapDefault = """\
{
    "MoveUp": "ArrowUp",
    "MoveDown": "ArrowDown",
    "JumpUp": "PageUp",
    "JumpDown": "PageDown",
    "JumpToStart": "Home",
    "JumpToEnd": "End",
    "ChooseSelected": "Enter",
    "ChooseFirstOrSelected": "Tab",
    "Close": "Escape"
}\
"""
    colorDefault = """\
{
    "danbooru": {
        "-1": ["red", "maroon"],
        "0": ["lightblue", "dodgerblue"],
        "1": ["indianred", "firebrick"],
        "3": ["violet", "darkorchid"],
        "4": ["lightgreen", "darkgreen"],
        "5": ["orange", "darkorange"]
    },
    "e621": {
        "-1": ["red", "maroon"],
        "0": ["lightblue", "dodgerblue"],
        "1": ["gold", "goldenrod"],
        "3": ["violet", "darkorchid"],
        "4": ["lightgreen", "darkgreen"],
        "5": ["tomato", "darksalmon"],
        "6": ["red", "maroon"],
        "7": ["whitesmoke", "black"],
        "8": ["seagreen", "darkseagreen"]
    }
}\
"""
    keymapLabel = "Configure Hotkeys. For possible values, see https://www.w3.org/TR/uievents-key, or leave empty / set to 'None' to disable. Must be valid JSON."
    colorLabel = "Configure colors. See https://github.com/DominikDoom/a1111-sd-webui-tagcomplete#colors for info. Must be valid JSON."

    try:
        shared.opts.add_option("tac_keymap", shared.OptionInfo(keymapDefault, keymapLabel, gr.Code, lambda: {"language": "json", "interactive": True}, section=TAC_SECTION))
        shared.opts.add_option("tac_colormap", shared.OptionInfo(colorDefault, colorLabel, gr.Code, lambda: {"language": "json", "interactive": True}, section=TAC_SECTION))
    except AttributeError:
        shared.opts.add_option("tac_keymap", shared.OptionInfo(keymapDefault, keymapLabel, gr.Textbox, section=TAC_SECTION))
        shared.opts.add_option("tac_colormap", shared.OptionInfo(colorDefault, colorLabel, gr.Textbox, section=TAC_SECTION))

    shared.opts.add_option("tac_refreshTempFiles", shared.OptionInfo("Refresh TAC temp files", "Refresh internal temp files", gr.HTML, {}, refresh=refresh_temp_files, section=TAC_SECTION))
    
script_callbacks.on_ui_settings(on_ui_settings)
