// Create our TAC namespace
var TAC = TAC || {};

/**
 * @typedef {Object} TAC.CFG
 * @property {string} tagFile - Tag filename
 * @property {{ global: boolean, txt2img: boolean, img2img: boolean, negativePrompts: boolean, thirdParty: boolean, modelList: string, modelListMode: "Blacklist"|"Whitelist" }} activeIn - Settings for which parts of the UI the tag completion is active in.
 * @property {boolean} slidingPopup - Move completion popup together with text cursor
 * @property {number} maxResults - Maximum results
 * @property {boolean} showAllResults - Show all results
 * @property {number} resultStepLength - How many results to load at once
 * @property {number} delayTime - Time in ms to wait before triggering completion again
 * @property {boolean} useWildcards - Search for wildcards
 * @property {boolean} sortWildcardResults - Sort wildcard file contents alphabetically
 * @property {boolean} useEmbeddings - Search for embeddings
 * @property {boolean} includeEmbeddingsInNormalResults - Include embeddings in normal tag results
 * @property {boolean} useHypernetworks - Search for hypernetworks
 * @property {boolean} useLoras - Search for Loras
 * @property {boolean} useLycos - Search for LyCORIS/LoHa
 * @property {boolean} useLoraPrefixForLycos - Use the '<lora:' prefix instead of '<lyco:' for models in the LyCORIS folder
 * @property {boolean} showWikiLinks - Show '?' next to tags, linking to its Danbooru or e621 wiki page
 * @property {boolean} showExtraNetworkPreviews - Show preview thumbnails for extra networks if available
 * @property {string} modelSortOrder - Model sort order
 * @property {boolean} frequencySort - Locally record tag usage and sort frequent tags higher
 * @property {string} frequencyFunction - Function to use for frequency sorting
 * @property {number} frequencyMinCount - Minimum number of uses for a tag to be considered frequent
 * @property {number} frequencyMaxAge - Maximum days since last use for a tag to be considered frequent
 * @property {number} frequencyRecommendCap - Maximum number of recommended tags
 * @property {boolean} frequencyIncludeAlias - Frequency sorting matches aliases for frequent tags
 * @property {boolean} useStyleVars - Search for webui style names
 * @property {boolean} replaceUnderscores - Replace underscores with spaces on insertion
 * @property {string} replaceUnderscoresExclusionList - Underscore replacement exclusion list
 * @property {boolean} escapeParentheses - Escape parentheses on insertion
 * @property {boolean} appendComma - Append comma on tag autocompletion
 * @property {boolean} appendSpace - Append space on tag autocompletion
 * @property {boolean} alwaysSpaceAtEnd - Always append space if inserting at the end of the textbox
 * @property {string} wildcardCompletionMode - How to complete nested wildcard paths
 * @property {string} modelKeywordCompletion - Try to add known trigger words for LORA/LyCO models
 * @property {string} modelKeywordLocation - Where to insert the trigger keyword
 * @property {string} wcWrap - Wrapper characters for wildcard tags.
 * @property {{ searchByAlias: boolean, onlyShowAlias: boolean }} alias - Alias-related settings.
 * @property {{ translationFile: string, oldFormat: boolean, searchByTranslation: boolean, liveTranslation: boolean }} translation - Translation-related settings.
 * @property {{ extraFile: string, addMode: "Insert before"|"Insert after" }} extra - Extra file-related settings.
 * @property {string} chantFile - Chant filename
 * @property {number} extraNetworksDefaultMultiplier - Default multiplier for extra networks.
 * @property {string} extraNetworksSeparator - Separator used for extra networks.
 * @property {{ MoveUp: string, MoveDown: string, JumpUp: string, JumpDown: string, JumpToStart: string, JumpToEnd: string, ChooseSelected: string, ChooseFirstOrSelected: string, Close: string }} keymap - Custom key mappings for tag completion.
 * @property {{ [filename: string]: { [category: string]: string[] } }} colorMap - Color mapping for tag categories.
 */
/** @type {TAC.CFG}  */
TAC.CFG = {
    // Main tag file
    tagFile: "",
    // Active in settings
    activeIn: {
        global: true,
        txt2img: true,
        img2img: true,
        negativePrompts: true,
        thirdParty: true,
        modelList: "",
        modelListMode: "Blacklist",
    },
    // Results related settings
    slidingPopup: true,
    maxResults: 8,
    showAllResults: false,
    resultStepLength: 500,
    delayTime: 100,
    useWildcards: true,
    sortWildcardResults: true,
    useEmbeddings: true,
    includeEmbeddingsInNormalResults: true,
    useHypernetworks: true,
    useLoras: true,
    useLycos: true,
    useLoraPrefixForLycos: true,
    showWikiLinks: false,
    showExtraNetworkPreviews: true,
    modelSortOrder: "Name",
    frequencySort: true,
    frequencyFunction: "Logarithmic (weak)",
    frequencyMinCount: 3,
    frequencyMaxAge: 30,
    frequencyRecommendCap: 10,
    frequencyIncludeAlias: false,
    useStyleVars: false,
    // Insertion related settings
    replaceUnderscores: true,
    replaceUnderscoresExclusionList: "0_0,(o)_(o),+_+,+_-,._.,<o>_<o>,<|>_<|>,=_=,>_<,3_3,6_9,>_o,@_@,^_^,o_o,u_u,x_x,|_|,||_||",
    escapeParentheses: true,
    appendComma: true,
    appendSpace: true,
    alwaysSpaceAtEnd: true,
    wildcardCompletionMode: "To next folder level",
    modelKeywordCompletion: "Never",
    modelKeywordLocation: "Start of prompt",
    wcWrap: "__", // to support custom wrapper chars set by dp_parser
    // Alias settings
    alias: {
        searchByAlias: true,
        onlyShowAlias: false,
    },
    // Translation settings
    translation: {
        translationFile: "None",
        oldFormat: false,
        searchByTranslation: true,
        liveTranslation: false,
    },
    // Extra file settings
    extra: {
        extraFile: "extra-quality-tags.csv",
        addMode: "Insert before",
    },
    // Chant file settings
    chantFile: "demo-chants.json",
    // Settings not from tac but still used by the script
    extraNetworksDefaultMultiplier: 1.0,
    extraNetworksSeparator: ", ",
    // Custom mapping settings
    keymap: {
        MoveUp: "ArrowUp",
        MoveDown: "ArrowDown",
        JumpUp: "PageUp",
        JumpDown: "PageDown",
        JumpToStart: "Home",
        JumpToEnd: "End",
        ChooseSelected: "Enter",
        ChooseFirstOrSelected: "Tab",
        Close: "Escape",
    },
    colorMap: {
        filename: { category: ["light", "dark"] },
    },
};

TAC.Globals = new (function () {
    // Core components
    this.tagBasePath = "";
    this.modelKeywordPath = "";
    this.selfTrigger = false;

    // Tag completion data loaded from files
    this.allTags = [];
    this.translations = new Map();
    this.extras = [];
    // Same for tag-likes
    this.wildcardFiles = [];
    this.wildcardExtFiles = [];
    this.yamlWildcards = [];
    this.umiWildcards = [];
    this.embeddings = [];
    this.hypernetworks = [];
    this.loras = [];
    this.lycos = [];
    this.modelKeywordDict = new Map();
    this.chants = [];
    this.styleNames = [];

    // Selected model info for black/whitelisting
    this.currentModelHash = "";
    this.currentModelName = "";

    // Current results
    this.results = [];
    this.resultCount = 0;

    // Relevant for parsing
    this.previousTags = [];
    this.tagword = "";
    this.originalTagword = "";
    this.hideBlocked = false;

    // Tag selection for keyboard navigation
    this.selectedTag = null;
    this.oldSelectedTag = null;
    this.resultCountBeforeNormalTags = 0;

    // Lora keyword undo/redo history
    this.textBeforeKeywordInsertion = "";
    this.textAfterKeywordInsertion = "";
    this.lastEditWasKeywordInsertion = false;
    this.keywordInsertionUndone = false;

    // UMI
    this.umiPreviousTags = [];
})();

/// Extendability system:
/// Provides "queues" for other files of the script (or really any js)
/// to add functions to be called at certain points in the script.
/// Similar to a callback system, but primitive.
TAC.Ext = new (function () {
    // Queues
    this.QUEUE_AFTER_INSERT = [];
    this.QUEUE_AFTER_SETUP = [];
    this.QUEUE_FILE_LOAD = [];
    this.QUEUE_AFTER_CONFIG_CHANGE = [];
    this.QUEUE_SANITIZE = [];

    // List of parsers to try
    this.PARSERS = [];
})();
