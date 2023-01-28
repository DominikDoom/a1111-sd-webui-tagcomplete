// Core components
var CFG = null;
var tagBasePath = "";

// Tag completion data loaded from files
var allTags = [];
var translations = new Map();
// Same for tag-likes
var wildcardFiles = [];
var wildcardExtFiles = [];
var yamlWildcards = [];
var embeddings = [];
var hypernetworks = [];
var loras = [];

// Selected model info for black/whitelisting
var currentModelHash = "";
var currentModelName = "";

// Current results
var results = [];
var resultCount = 0;

// Relevant for parsing
var previousTags = [];
var tagword = "";
var originalTagword = "";

// Tag selection for keyboard navigation
var selectedTag = null;
var oldSelectedTag = null;

// UMI
var umiPreviousTags = [];

/// Extendability system:
/// Provides "queues" for other files of the script (or really any js)
/// to add functions to be called at certain points in the script.
/// Similar to a callback system, but primitive.

// Queues
var afterInsertQueue = [];
var afterSetupQueue = [];
var afterConfigChangeQueue = [];

// List of parsers to try
var parsers = [];