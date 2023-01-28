var CFG = null;

var tagBasePath = "";
var allTags = [];
var translations = new Map();

var currentModelHash = "";
var currentModelName = "";

var wildcardFiles = [];
var wildcardExtFiles = [];
var yamlWildcards = [];
var umiPreviousTags = [];
var embeddings = [];
var hypernetworks = [];
var loras = [];
var results = [];
var tagword = "";
var originalTagword = "";
var resultCount = 0;

var selectedTag = null;
var oldSelectedTag = null;
var previousTags = [];