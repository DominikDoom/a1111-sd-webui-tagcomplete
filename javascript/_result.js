// Result data type for cleaner use of optional completion result properties

// Type enum
const ResultType = Object.freeze({
    "tag": 1,
    "extra": 2,
    "embedding": 3,
    "wildcardTag": 4,
    "wildcardFile": 5,
    "yamlWildcard": 6,
    "hypernetwork": 7,
    "lora": 8,
    "lyco": 9,
    "chant": 10
});

// Class to hold result data and annotations to make it clearer to use
class AutocompleteResult {
    // Main properties
    text = "";
    type = ResultType.tag;

    // Additional info, only used in some cases
    category = null;
    count = null;
    aliases = null;
    meta = null;

    // Constructor
    constructor(text, type) {
        this.text = text;
        this.type = type;
    }
}