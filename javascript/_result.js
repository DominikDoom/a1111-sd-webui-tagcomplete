// Result data type for cleaner use of optional completion result properties

// Type enum
const ResultType = Object.freeze({
    "tag": 1,
    "embedding": 2,
    "wildcardTag": 3,
    "wildcardFile": 4,
    "yamlWildcard": 5,
    "hypernetwork": 6,
    "lora": 7
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