// Result data type for cleaner use of optional completion result properties

// Type enum
TAC.ResultType = Object.freeze({
    "tag": 1,
    "extra": 2,
    "embedding": 3,
    "wildcardTag": 4,
    "wildcardFile": 5,
    "yamlWildcard": 6,
    "umiWildcard": 7,
    "hypernetwork": 8,
    "lora": 9,
    "lyco": 10,
    "chant": 11,
    "styleName": 12
});

// Class to hold result data and annotations to make it clearer to use
TAC.AutocompleteResult = class AutocompleteResult {
    // Main properties
    text = "";
    type = TAC.ResultType.tag;

    // Additional info, only used in some cases
    category = null;
    count = Number.MAX_SAFE_INTEGER;
    usageBias = null;
    aliases = null;
    meta = null;
    hash = null;
    sortKey = null;

    // Constructor
    constructor(text, type) {
        this.text = text;
        this.type = type;
    }
}