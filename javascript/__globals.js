// Create our TAC namespace
var TAC = TAC || {};

TAC.Globals = new function() {
    // Core components
    this.CFG = {
        // Main tag file
        tagFile,
        // Active in settings
        activeIn: {
            global,
            txt2img,
            img2img,
            negativePrompts,
            thirdParty,
            modelList,
            modelListMode
        },
        // Results related settings
        slidingPopup,
        maxResults,
        showAllResults,
        resultStepLength,
        delayTime,
        useWildcards,
        sortWildcardResults,
        useEmbeddings,
        includeEmbeddingsInNormalResults,
        useHypernetworks,
        useLoras,
        useLycos,
        useLoraPrefixForLycos,
        showWikiLinks,
        showExtraNetworkPreviews,
        modelSortOrder,
        frequencySort,
        frequencyFunction,
        frequencyMinCount,
        frequencyMaxAge,
        frequencyRecommendCap,
        frequencyIncludeAlias,
        useStyleVars,
        // Insertion related settings
        replaceUnderscores,
        replaceUnderscoresExclusionList,
        escapeParentheses,
        appendComma,
        appendSpace,
        alwaysSpaceAtEnd,
        wildcardCompletionMode,
        modelKeywordCompletion,
        modelKeywordLocation,
        wcWrap: "__", // to support custom wrapper chars set by dp_parser
        // Alias settings
        alias: {
            searchByAlias,
            onlyShowAlias
        },
        // Translation settings
        translation: {
            translationFile,
            oldFormat,
            searchByTranslation,
            liveTranslation,
        },
        // Extra file settings
        extra: {
            extraFile,
            addMode
        },
        // Chant file settings
        chantFile,
        // Settings not from tac but still used by the script
        extraNetworksDefaultMultiplier,
        extraNetworksSeparator,
        // Custom mapping settings
        keymap: {
            "MoveUp": "ArrowUp",
            "MoveDown": "ArrowDown",
            "JumpUp": "PageUp",
            "JumpDown": "PageDown",
            "JumpToStart": "Home",
            "JumpToEnd": "End",
            "ChooseSelected": "Enter",
            "ChooseFirstOrSelected": "Tab",
            "Close": "Escape"
        },
        colorMap: {
            "filename": { "category": ["light","dark"] }
        }
    }
    this.tagBasePath = "";
    this.modelKeywordPath = "";
    this.tacSelfTrigger = false;

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
};

/// Extendability system:
/// Provides "queues" for other files of the script (or really any js)
/// to add functions to be called at certain points in the script.
/// Similar to a callback system, but primitive.
TAC.Parsers = new function() {
    // Queues
    this.QUEUE_AFTER_INSERT = [];
    this.QUEUE_AFTER_SETUP = [];
    this.QUEUE_FILE_LOAD = [];
    this.QUEUE_AFTER_CONFIG_CHANGE = [];
    this.QUEUE_SANITIZE = [];

    // List of parsers to try
    this.PARSERS = [];
}