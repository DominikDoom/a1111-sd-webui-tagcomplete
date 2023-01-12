var CFG = null;

const styleColors = {
    "--results-bg": ["#0b0f19", "#ffffff"],
    "--results-border-color": ["#4b5563", "#e5e7eb"],
    "--results-border-width": ["1px", "1.5px"],
    "--results-bg-odd": ["#111827", "#f9fafb"],
    "--results-hover": ["#1f2937", "#f5f6f8"],
    "--results-selected": ["#374151", "#e5e7eb"],
    "--meta-text-color": ["#6b6f7b", "#a2a9b4"],
    "--embedding-v1-color": ["lightsteelblue", "#2b5797"],
    "--embedding-v2-color": ["skyblue", "#2d89ef"],
}
const browserVars = {
    "--results-overflow-y": {
        "firefox": "scroll",
        "other": "auto"
    }
}
// Style for new elements. Gets appended to the Gradio root.
const autocompleteCSS = `
    #quicksettings [id^=setting_tac] {
        background-color: transparent;
        min-width: fit-content;
        align-self: center;
    }
    #quicksettings [id^=setting_tac] > label > span {
        margin-bottom: 0px;
    }
    [id^=refresh_tac] {
        max-width: 2.5em;
        min-width: 2.5em;
        height: 2.4em;
    }
    .autocompleteResults {
        position: absolute;
        z-index: 999;
        margin: 5px 0 0 0;
        background-color: var(--results-bg) !important;
        border: var(--results-border-width) solid var(--results-border-color) !important;
        border-radius: 12px !important;
        overflow-y: var(--results-overflow-y);
        overflow-x: hidden;
    }
    .autocompleteResultsList > li:nth-child(odd) {
        background-color: var(--results-bg-odd);
    }
    .autocompleteResultsList > li {
        list-style-type: none;
        padding: 10px;
        cursor: pointer;
    }
    .autocompleteResultsList > li:hover {
        background-color: var(--results-hover);
    }
    .autocompleteResultsList > li.selected {
        background-color: var(--results-selected);
    }
    .resultsFlexContainer {
        display: flex;
    }
    .acListItem {
        overflow: hidden;
        white-space: nowrap;
    }
    .acMetaText {
        position: relative;
        text-align: end;
        padding: 0 0 0 15px;
        flex-grow: 1;
        color: var(--meta-text-color);
    }
    .acListItem.acEmbeddingV1 {
        color: var(--embedding-v1-color);
    }
    .acListItem.acEmbeddingV2 {
        color: var(--embedding-v2-color);
    }
`;

var tagBasePath = "";
var allTags = [];
var translations = new Map();

async function loadTags(c) {
    // Load main tags and aliases
    if (allTags.length === 0 && c.tagFile && c.tagFile !== "None") {
        try {
            allTags = await loadCSV(`${tagBasePath}/${c.tagFile}?${new Date().getTime()}`);
        } catch (e) {
            console.error("Error loading tags file: " + e);
            return;
        }
        if (c.extra.extraFile && c.extra.extraFile !== "None") {
            try {
                extras = await loadCSV(`${tagBasePath}/${c.extra.extraFile}?${new Date().getTime()}`);
                if (c.extra.onlyAliasExtraFile) {
                    // This works purely on index, so it's not very robust. But a lot faster.
                    for (let i = 0, n = extras.length; i < n; i++) {
                        if (extras[i][0]) {
                            let aliasStr = allTags[i][3] || "";
                            let optComma = aliasStr.length > 0 ? "," : "";
                            allTags[i][3] = aliasStr + optComma + extras[i][0];
                        }
                    }
                } else {
                    extras.forEach(e => {
                        let hasCount = e[2] && e[3] || (!isNaN(e[2]) && !e[3]);
                        // Check if a tag in allTags has the same name & category as the extra tag
                        if (tag = allTags.find(t => t[0] === e[0] && t[1] == e[1])) {
                            if (hasCount && e[3] || isNaN(e[2])) { // If the extra tag has a translation / alias, add it to the normal tag
                                let aliasStr = tag[3] || "";
                                let optComma = aliasStr.length > 0 ? "," : "";
                                let alias = hasCount && e[3] || isNaN(e[2]) ? e[2] : e[3];
                                tag[3] = aliasStr + optComma + alias;
                            }
                        } else {
                            let count = hasCount ? e[2] : null;
                            let aliases = hasCount && e[3] ? e[3] : e[2];
                            // If the tag doesn't exist, add it to allTags
                            let newTag = [e[0], e[1], count, aliases];
                            allTags.push(newTag);
                        }
                    });
                }
            } catch (e) {
                console.error("Error loading extra file: " + e);
                return;
            }
        }
    }
}

async function loadTranslations(c) {
    if (c.translation.translationFile && c.translation.translationFile !== "None") {
        try {
            let tArray = await loadCSV(`${tagBasePath}/${c.translation.translationFile}?${new Date().getTime()}`);
            tArray.forEach(t => {
                if (c.translation.oldFormat)
                    translations.set(t[0], t[2]);
                else
                    translations.set(t[0], t[1]);
            });
        } catch (e) {
            console.error("Error loading translations file: " + e);
            return;
        }
    }
}

async function syncOptions() {
    let newCFG = {
        // Main tag file
        tagFile: opts["tac_tagFile"],
        // Active in settings
        activeIn: {
            global: opts["tac_active"],
            txt2img: opts["tac_activeIn.txt2img"],
            img2img: opts["tac_activeIn.img2img"],
            negativePrompts: opts["tac_activeIn.negativePrompts"],
            thirdParty: opts["tac_activeIn.thirdParty"],
            modelList: opts["tac_activeIn.modelList"],
            modelListMode: opts["tac_activeIn.modelListMode"]
        },
        // Results related settings
        maxResults: opts["tac_maxResults"],
        showAllResults: opts["tac_showAllResults"],
        resultStepLength: opts["tac_resultStepLength"],
        delayTime: opts["tac_delayTime"],
        useWildcards: opts["tac_useWildcards"],
        useEmbeddings: opts["tac_useEmbeddings"],
        // Insertion related settings
        replaceUnderscores: opts["tac_replaceUnderscores"],
        escapeParentheses: opts["tac_escapeParentheses"],
        appendComma: opts["tac_appendComma"],
        // Alias settings
        alias: {
            searchByAlias: opts["tac_alias.searchByAlias"],
            onlyShowAlias: opts["tac_alias.onlyShowAlias"]
        },
        // Translation settings
        translation: {
            translationFile: opts["tac_translation.translationFile"],
            oldFormat: opts["tac_translation.oldFormat"],
            searchByTranslation: opts["tac_translation.searchByTranslation"],
        },
        // Extra file settings
        extra: {
            extraFile: opts["tac_extra.extraFile"],
            onlyAliasExtraFile: opts["tac_extra.onlyAliasExtraFile"]
        }
    }

    if (CFG && CFG.colors) {
        newCFG["colors"] = CFG.colors;
    }
    if (newCFG.alias.onlyShowAlias) {
        newCFG.alias.searchByAlias = true; // if only show translation, enable search by translation is necessary
    }

    // Reload tags if the tag file changed
    if (!CFG || newCFG.tagFile !== CFG.tagFile || newCFG.extra.extraFile !== CFG.extra.extraFile) {
        allTags = [];
        await loadTags(newCFG);
    }
    // Reload translations if the translation file changed
    if (!CFG || newCFG.translation.translationFile !== CFG.translation.translationFile) {
        translations.clear();
        await loadTranslations(newCFG);
    }

    // Update CSS if maxResults changed
    if (CFG && newCFG.maxResults !== CFG.maxResults) {
        gradioApp().querySelectorAll(".autocompleteResults").forEach(r => {
            r.style.maxHeight = `${newCFG.maxResults * 50}px`;
        });
    }

    // Apply changes
    CFG = newCFG;
}

// Create the result list div and necessary styling
function createResultsDiv(textArea) {
    let resultsDiv = document.createElement("div");
    let resultsList = document.createElement('ul');

    let textAreaId = getTextAreaIdentifier(textArea);
    let typeClass = textAreaId.replaceAll(".", " ");

    resultsDiv.style.maxHeight = `${CFG.maxResults * 50}px`;
    resultsDiv.setAttribute('class', `autocompleteResults ${typeClass}`);
    resultsList.setAttribute('class', 'autocompleteResultsList');
    resultsDiv.appendChild(resultsList);

    return resultsDiv;
}

// The selected tag index. Needs to be up here so hide can access it.
var selectedTag = null;
var previousTags = [];

// Show or hide the results div
function isVisible(textArea) {
    let textAreaId = getTextAreaIdentifier(textArea);
    let resultsDiv = gradioApp().querySelector('.autocompleteResults' + textAreaId);
    return resultsDiv.style.display === "block";
}
function showResults(textArea) {
    let textAreaId = getTextAreaIdentifier(textArea);
    let resultsDiv = gradioApp().querySelector('.autocompleteResults' + textAreaId);
    resultsDiv.style.display = "block";
}
function hideResults(textArea) {
    let textAreaId = getTextAreaIdentifier(textArea);
    let resultsDiv = gradioApp().querySelector('.autocompleteResults' + textAreaId);
    resultsDiv.style.display = "none";
    selectedTag = null;
}

var currentModelHash = "";
// Function to check activation criteria
function isEnabled() {
    if (CFG.activeIn.global) {
        let modelList = CFG.activeIn.modelList
            .split(",")
            .map(x => x.trim())
            .filter(x => x.length > 0);
        
        if (CFG.activeIn.modelListMode === "blacklist") {
            // If the current model is in the blacklist, disable
            return !modelList.includes(currentModelHash);
        } else {
            // If the current model is in the whitelist, enable.
            // An empty whitelist is ignored.
            return modelList.length === 0 || modelList.includes(currentModelHash);
        }
    } else {
        return false;
    }
}

const WEIGHT_REGEX = /[([]([^,()[\]:| ]+)(?::(?:\d+(?:\.\d+)?|\.\d+))?[)\]]/g;
const TAG_REGEX = /(<[^\t\n\r,>]+>?|[^\s,|<>]+|<)/g
const WC_REGEX = /\b__([^, ]+)__([^, ]*)\b/g;
const UMI_PROMPT_REGEX = /<[^\s]*?\[[^,<>]*[\]|]?>?/gi;
const UMI_TAG_REGEX = /(?:\[|\||--)([^<>\[\]\-|]+)/gi;
const MODEL_HASH_REGEX = /\[(.+)\]/g;
let hideBlocked = false;

// On click, insert the tag into the prompt textbox with respect to the cursor position
function insertTextAtCursor(textArea, result, tagword) {
    let text = result.text;
    let tagType = result.type;

    let cursorPos = textArea.selectionStart;
    var sanitizedText = text

    // Replace differently depending on if it's a tag or wildcard
    if (tagType === ResultType.wildcardFile) {
        sanitizedText = "__" + text.replace("Wildcards: ", "") + "__";
    } else if (tagType === ResultType.wildcardTag) {
        sanitizedText = text.replace(/^.*?: /g, "");
    } else if (tagType === ResultType.yamlWildcard && !yamlWildcards.includes(text)) {
        sanitizedText = text.replaceAll("_", " "); // Replace underscores only if the yaml tag is not using them
    } else if (tagType === ResultType.embedding) {
        sanitizedText = `${text.replace(/^.*?: /g, "")}`;
    } else {
        sanitizedText = CFG.replaceUnderscores ? text.replaceAll("_", " ") : text;
    }

    if (CFG.escapeParentheses) {
        sanitizedText = sanitizedText
            .replaceAll("(", "\\(")
            .replaceAll(")", "\\)")
            .replaceAll("[", "\\[")
            .replaceAll("]", "\\]");
    }

    var prompt = textArea.value;

    // Edit prompt text
    let editStart = Math.max(cursorPos - tagword.length, 0);
    let editEnd = Math.min(cursorPos + tagword.length, prompt.length);
    let surrounding = prompt.substring(editStart, editEnd);
    let match = surrounding.match(new RegExp(escapeRegExp(`${tagword}`), "i"));
    let afterInsertCursorPos = editStart + match.index + sanitizedText.length;

    var optionalComma = "";
    if (CFG.appendComma && ![ResultType.wildcardFile, ResultType.yamlWildcard].includes(tagType)) {
        optionalComma = surrounding.match(new RegExp(`${escapeRegExp(tagword)}[,:]`, "i")) !== null ? "" : ", ";
    }

    // Replace partial tag word with new text, add comma if needed
    let insert = surrounding.replace(match, sanitizedText + optionalComma);

    // Add back start
    var newPrompt = prompt.substring(0, editStart) + insert + prompt.substring(editEnd);
    textArea.value = newPrompt;
    textArea.selectionStart = afterInsertCursorPos + optionalComma.length;
    textArea.selectionEnd = textArea.selectionStart

    // Since we've modified a Gradio Textbox component manually, we need to simulate an `input` DOM event to ensure its
    // internal Svelte data binding remains in sync.
    textArea.dispatchEvent(new Event("input", { bubbles: true }));

    // Update previous tags with the edited prompt to prevent re-searching the same term
    let weightedTags = [...newPrompt.matchAll(WEIGHT_REGEX)]
            .map(match => match[1]);
    let tags = newPrompt.match(TAG_REGEX)
    if (weightedTags !== null) {
        tags = tags.filter(tag => !weightedTags.some(weighted => tag.includes(weighted)))
            .concat(weightedTags);
    }
    previousTags = tags;

    // If it was a yaml wildcard, also update the umiPreviousTags
    if (tagType === ResultType.yamlWildcard && originalTagword.length > 0) {
        let umiSubPrompts = [...newPrompt.matchAll(UMI_PROMPT_REGEX)];

        let umiTags = [];
        umiSubPrompts.forEach(umiSubPrompt => {
            umiTags = umiTags.concat([...umiSubPrompt[0].matchAll(UMI_TAG_REGEX)].map(x => x[1].toLowerCase()));
        });

        umiPreviousTags = umiTags;

        hideResults(textArea);
    }

    // Hide results after inserting
    if (tagType === ResultType.wildcardFile) {
        // If it's a wildcard, we want to keep the results open so the user can select another wildcard
        hideBlocked = true;
        autocomplete(textArea, prompt, sanitizedText);
        setTimeout(() => { hideBlocked = false; }, 100);
    } else {
        hideResults(textArea);
    }
}

function addResultsToList(textArea, results, tagword, resetList) {
    let textAreaId = getTextAreaIdentifier(textArea);
    let resultDiv = gradioApp().querySelector('.autocompleteResults' + textAreaId);
    let resultsList = resultDiv.querySelector('ul');

    // Reset list, selection and scrollTop since the list changed
    if (resetList) {
        resultsList.innerHTML = "";
        selectedTag = null;
        resultDiv.scrollTop = 0;
        resultCount = 0;
    }

    // Find right colors from config
    let tagFileName = CFG.tagFile.split(".")[0];
    let tagColors = CFG.colors;
    let mode = gradioApp().querySelector('.dark') ? 0 : 1;
    let nextLength = Math.min(results.length, resultCount + CFG.resultStepLength);

    for (let i = resultCount; i < nextLength; i++) {
        let result = results[i];
        let li = document.createElement("li");

        let flexDiv = document.createElement("div");
        flexDiv.classList.add("resultsFlexContainer");
        li.appendChild(flexDiv);

        let itemText = document.createElement("div");
        itemText.classList.add("acListItem");
        flexDiv.appendChild(itemText);

        let displayText = "";
        // If the tag matches the tagword, we don't need to display the alias
        if (result.aliases && !result.text.includes(tagword)) { // Alias
            let splitAliases = result.aliases.split(",");
            let bestAlias = splitAliases.find(a => a.toLowerCase().includes(tagword));

            // search in translations if no alias matches
            if (!bestAlias) {
                let tagOrAlias = pair => pair[0] === result.text || splitAliases.includes(pair[0]);
                var tArray = [...translations];
                if (tArray) {
                    var translationKey = [...translations].find(pair => tagOrAlias(pair) && pair[1].includes(tagword));
                    if (translationKey)
                        bestAlias = translationKey[0];
                }
            }

            displayText = escapeHTML(bestAlias);

            // Append translation for alias if it exists and is not what the user typed
            if (translations.has(bestAlias) && translations.get(bestAlias) !== bestAlias && bestAlias !== result.text)
                displayText += `[${translations.get(bestAlias)}]`;

            if (!CFG.alias.onlyShowAlias && result.text !== bestAlias)
                displayText += " ➝ " + result.text;
        } else { // No alias
            displayText = escapeHTML(result.text);
        }

        // Append translation for result if it exists
        if (translations.has(result.text))
            displayText += `[${translations.get(result.text)}]`;

        // Print search term bolded in result
        itemText.innerHTML = displayText.replace(tagword, `<b>${tagword}</b>`);

        // Add post count & color if it's a tag
        // Wildcards & Embeds have no tag category
        if (![ResultType.wildcardFile, ResultType.wildcardTag, ResultType.embedding].includes(result.type)) {
            if (result.category) {
                // Set the color of the tag
                let cat = result.category;
                let colorGroup = tagColors[tagFileName];
                // Default to danbooru scheme if no matching one is found
                if (!colorGroup)
                    colorGroup = tagColors["danbooru"];

                // Set tag type to invalid if not found
                if (!colorGroup[cat])
                    cat = "-1";

                itemText.style = `color: ${colorGroup[cat][mode]};`;
            }

            // Post count
            if (result.count && !isNaN(result.count)) {
                let postCount = result.count;
                let formatter;

                // Danbooru formats numbers with a padded fraction for 1M or 1k, but not for 10/100k
                if (postCount >= 1000000 || (postCount >= 1000 && postCount < 10000))
                    formatter = Intl.NumberFormat("en", { notation: "compact", minimumFractionDigits: 1, maximumFractionDigits: 1 });
                else
                    formatter = Intl.NumberFormat("en", {notation: "compact"});
    
                let formattedCount = formatter.format(postCount);
    
                let countDiv = document.createElement("div");
                countDiv.textContent = formattedCount;
                countDiv.classList.add("acMetaText");
                flexDiv.appendChild(countDiv);
            }
        } else if (result.meta) { // Check if it is an embedding we have version info for
            let metaDiv = document.createElement("div");
            metaDiv.textContent = result.meta;
            metaDiv.classList.add("acMetaText");

            // Add version info classes if it is an embedding
            if (result.type === ResultType.embedding) {
                if (result.meta.startsWith("v1"))
                    itemText.classList.add("acEmbeddingV1");
                else if (result.meta.startsWith("v2"))
                    itemText.classList.add("acEmbeddingV2");
            }
                
            flexDiv.appendChild(metaDiv);
        }

        // Add listener
        li.addEventListener("click", function () { insertTextAtCursor(textArea, result, tagword); });
        // Add element to list
        resultsList.appendChild(li);
    }
    resultCount = nextLength;
}

function updateSelectionStyle(textArea, newIndex, oldIndex) {
    let textAreaId = getTextAreaIdentifier(textArea);
    let resultDiv = gradioApp().querySelector('.autocompleteResults' + textAreaId);
    let resultsList = resultDiv.querySelector('ul');
    let items = resultsList.getElementsByTagName('li');

    if (oldIndex != null) {
        items[oldIndex].classList.remove('selected');
    }

    // make it safer
    if (newIndex !== null) {
        items[newIndex].classList.add('selected');
    }

    // Set scrolltop to selected item if we are showing more than max results
    if (items.length > CFG.maxResults) {
        let selected = items[newIndex];
        resultDiv.scrollTop = selected.offsetTop - resultDiv.offsetTop;
    }
}

var wildcardFiles = [];
var wildcardExtFiles = [];
var yamlWildcards = [];
var umiPreviousTags = [];
var embeddings = [];
var results = [];
var tagword = "";
var originalTagword = "";
var resultCount = 0;
async function autocomplete(textArea, prompt, fixedTag = null) {
    // Return if the function is deactivated in the UI
    if (!isEnabled()) return;

    // Guard for empty prompt
    if (prompt.length === 0) {
        hideResults(textArea);
        return;
    }

    if (fixedTag === null) {
        // Match tags with RegEx to get the last edited one
        // We also match for the weighting format (e.g. "tag:1.0") here, and combine the two to get the full tag word set
        let weightedTags = [...prompt.matchAll(WEIGHT_REGEX)]
            .map(match => match[1]);
        let tags = prompt.match(TAG_REGEX)
        if (weightedTags !== null && tags !== null) {
            tags = tags.filter(tag => !weightedTags.some(weighted => tag.includes(weighted) && !tag.startsWith("<[")))
                .concat(weightedTags);
        }

        let tagCountChange = tags.length - previousTags.length;
        let diff = difference(tags, previousTags);
        previousTags = tags;

        // Guard for no difference / only whitespace remaining / last edited tag was fully removed
        if (diff === null || diff.length === 0 || (diff.length === 1 && tagCountChange < 0)) {
            if (!hideBlocked) hideResults(textArea);
            return;
        }

        tagword = diff[0]

        // Guard for empty tagword
        if (tagword === null || tagword.length === 0) {
            hideResults(textArea);
            return;
        }
    } else {
        tagword = fixedTag;
    }

    results = [];
    tagword = tagword.toLowerCase().replace(/[\n\r]/g, "");

    if (CFG.useWildcards && [...tagword.matchAll(WC_REGEX)].length > 0) {
        // Show wildcards from a file with that name
        wcMatch = [...tagword.matchAll(WC_REGEX)]
        let wcFile = wcMatch[0][1];
        let wcWord = wcMatch[0][2];

        var wcPair;

        // Look in normal wildcard files
        if (wcFound = wildcardFiles.find(x => x[1].toLowerCase() === wcFile))
            wcPair = wcFound;
        else // Look in extensions wildcard files
            wcPair = wildcardExtFiles.find(x => x[1].toLowerCase() === wcFile);

        let wildcards = (await readFile(`${wcPair[0]}/${wcPair[1]}.txt?${new Date().getTime()}`)).split("\n")
            .filter(x => x.trim().length > 0 && !x.startsWith('#'));  // Remove empty lines and comments


        let tempResults = wildcards.filter(x => (wcWord !== null && wcWord.length > 0) ? x.toLowerCase().includes(wcWord) : x) // Filter by tagword
        tempResults.forEach(t => {
            let result = new AutocompleteResult(t.trim(), ResultType.wildcardTag);
            result.meta = wcFile;
            results.push(result);
        });
    } else if (CFG.useWildcards && (tagword.startsWith("__") && !tagword.endsWith("__") || tagword === "__")) {
        // Show available wildcard files
        let tempResults = [];
        if (tagword !== "__") {
            let lmb = (x) => x[1].toLowerCase().includes(tagword.replace("__", ""))
            tempResults = wildcardFiles.filter(lmb).concat(wildcardExtFiles.filter(lmb)) // Filter by tagword
        } else {
            tempResults = wildcardFiles.concat(wildcardExtFiles);
        }

        // Add final results
        tempResults.forEach(wcFile => {
            let result = new AutocompleteResult(wcFile[1].trim(), ResultType.wildcardFile);
            result.meta = "Wildcard file";
            results.push(result);
        })
    } else if (CFG.useWildcards && [...tagword.matchAll(UMI_PROMPT_REGEX)].length > 0) {
        // We are in a UMI yaml tag definition, parse further
        let umiSubPrompts = [...prompt.matchAll(UMI_PROMPT_REGEX)];
        
        let umiTags = [];
        let umiTagsWithOperators = []

        const insertAt = (str,char,pos) => str.slice(0,pos) + char + str.slice(pos);

        umiSubPrompts.forEach(umiSubPrompt => {
            umiTags = umiTags.concat([...umiSubPrompt[0].matchAll(UMI_TAG_REGEX)].map(x => x[1].toLowerCase()));
            
            const start = umiSubPrompt.index;
            const end = umiSubPrompt.index + umiSubPrompt[0].length;
            if (textArea.selectionStart >= start && textArea.selectionStart <= end) {
                umiTagsWithOperators = insertAt(umiSubPrompt[0], '###', textArea.selectionStart - start);
            }
        });

        const promptSplitToTags = umiTagsWithOperators.replace(']###[', '][').split("][");

        const clean = (str) => str
            .replaceAll('>', '')
            .replaceAll('<', '')
            .replaceAll('[', '')
            .replaceAll(']', '')
            .trim();

        const matches = promptSplitToTags.reduce((acc, curr) => {
            isOptional = curr.includes("|");
            isNegative = curr.startsWith("--");
            let out;
            if (isOptional) {
                out = {
                    hasCursor: curr.includes("###"),
                    tags: clean(curr).split('|').map(x => ({ 
                        hasCursor: x.includes("###"), 
                        isNegative: x.startsWith("--"),
                        tag: clean(x).replaceAll("###", '').replaceAll("--", '')
                    }))
                };
                acc.optional.push(out);
                acc.all.push(...out.tags.map(x => x.tag));
            } else if (isNegative) {
                out = {
                    hasCursor: curr.includes("###"),
                    tags: clean(curr).replaceAll("###", '').split('|'),
                };
                out.tags = out.tags.map(x => x.startsWith("--") ? x.substring(2) : x);
                acc.negative.push(out);
                acc.all.push(...out.tags);
            } else {
                out = {
                    hasCursor: curr.includes("###"),
                    tags: clean(curr).replaceAll("###", '').split('|'),
                };
                acc.positive.push(out);
                acc.all.push(...out.tags);
            }
            return acc;
        }, { positive: [], negative: [], optional: [], all: [] });

        //console.log({ matches })

        const filteredWildcards = (tagword) => {
            const wildcards = yamlWildcards.filter(x => {
                let tags = x[1];
                const matchesNeg =
                    matches.negative.length === 0
                    || matches.negative.every(x => 
                        x.hasCursor 
                        || x.tags.every(t => !tags[t])
                    );
                if (!matchesNeg) return false;
                const matchesPos =
                    matches.positive.length === 0
                    || matches.positive.every(x =>
                        x.hasCursor
                        || x.tags.every(t => tags[t])
                    );
                if (!matchesPos) return false;
                const matchesOpt =
                    matches.optional.length === 0
                    || matches.optional.some(x =>
                        x.tags.some(t =>
                            t.hasCursor
                            || t.isNegative
                                ? !tags[t.tag]
                                : tags[t.tag]
                    ));
                if (!matchesOpt) return false;
                return true;
            }).reduce((acc, val) => {
                Object.keys(val[1]).forEach(tag => acc[tag] = acc[tag] + 1 || 1);
                return acc;
            }, {});

            return Object.entries(wildcards)
                .sort((a, b) => b[1] - a[1])
                .filter(x =>
                    x[0] === tagword
                    || !matches.all.includes(x[0])
                );
        }
        
        if (umiTags.length > 0) {
            // Get difference for subprompt
            let tagCountChange = umiTags.length - umiPreviousTags.length;
            let diff = difference(umiTags, umiPreviousTags);
            umiPreviousTags = umiTags;

            // Show all condition
            let showAll = tagword.endsWith("[") || tagword.endsWith("[--") || tagword.endsWith("|");

            // Exit early if the user closed the bracket manually
            if ((!diff || diff.length === 0 || (diff.length === 1 && tagCountChange < 0)) && !showAll) {
                if (!hideBlocked) hideResults(textArea);
                return;
            }

            let umiTagword = diff[0] || '';
            let tempResults = [];
            if (umiTagword && umiTagword.length > 0) {
                umiTagword = umiTagword.toLowerCase().replace(/[\n\r]/g, "");
                originalTagword = tagword;
                tagword = umiTagword;
                let filteredWildcardsSorted = filteredWildcards(umiTagword);
                let searchRegex = new RegExp(`(^|[^a-zA-Z])${escapeRegExp(umiTagword)}`, 'i')
                let baseFilter = x => x[0].toLowerCase().search(searchRegex) > -1;
                let spaceIncludeFilter = x => x[0].toLowerCase().replaceAll(" ", "_").search(searchRegex) > -1;
                tempResults = filteredWildcardsSorted.filter(x => baseFilter(x) || spaceIncludeFilter(x)) // Filter by tagword

                // Add final results
                tempResults.forEach(t => {
                    let result = new AutocompleteResult(t[0].trim(), ResultType.yamlWildcard)
                    result.count = t[1];
                    results.push(result);
                });
            } else if (showAll) {
                let filteredWildcardsSorted = filteredWildcards("");
                
                // Add final results
                filteredWildcardsSorted.forEach(t => {
                    let result = new AutocompleteResult(t[0].trim(), ResultType.yamlWildcard)
                    result.count = t[1];
                    results.push(result);
                });
        
                originalTagword = tagword;
                tagword = "";
            }
        } else {
            let filteredWildcardsSorted = filteredWildcards("");
                
            // Add final results
            filteredWildcardsSorted.forEach(t => {
                let result = new AutocompleteResult(t[0].trim(), ResultType.yamlWildcard)
                result.count = t[1];
                results.push(result);
            });

            originalTagword = tagword;
            tagword = "";
        }
    } else if (CFG.useEmbeddings && tagword.match(/<[^,> ]*>?/g)) {
        // Show embeddings
        let tempResults = [];
        if (tagword !== "<") {
            let searchTerm = tagword.replace("<", "")
            let versionString;
            if (searchTerm.startsWith("v1") || searchTerm.startsWith("v2")) {
                versionString = searchTerm.slice(0, 2);
                searchTerm = searchTerm.slice(2);
            }
            if (versionString)
                tempResults = embeddings.filter(x => x[0].toLowerCase().includes(searchTerm) && x[1] && x[1] === versionString); // Filter by tagword
            else
                tempResults = embeddings.filter(x => x[0].toLowerCase().includes(searchTerm)); // Filter by tagword
        } else {
            tempResults = embeddings;
        }
        // Since some tags are kaomoji, we have to still get the normal results first.
        // Create escaped search regex with support for * as a start placeholder
        let searchRegex;
        if (tagword.startsWith("*")) {
            tagword = tagword.slice(1);
            searchRegex = new RegExp(`${escapeRegExp(tagword)}`, 'i');
        } else {
            searchRegex = new RegExp(`(^|[^a-zA-Z])${escapeRegExp(tagword)}`, 'i');
        }
        let genericResults = allTags.filter(x => x[0].toLowerCase().search(searchRegex) > -1).slice(0, CFG.maxResults);

        // Add final results
        tempResults.forEach(t => {
            let result = new AutocompleteResult(t[0].trim(), ResultType.embedding)
            result.meta = t[1] + " Embedding";
            results.push(result);
        });
        genericResults.forEach(g => {
            let result = new AutocompleteResult(g[0].trim(), ResultType.tag)
            result.category = g[1];
            result.count = g[2];
            result.aliases = g[3];
            results.push(result);
        });
    } else {
        // Create escaped search regex with support for * as a start placeholder
        let searchRegex;
        if (tagword.startsWith("*")) {
            tagword = tagword.slice(1);
            searchRegex = new RegExp(`${escapeRegExp(tagword)}`, 'i');
        } else {
            searchRegex = new RegExp(`(^|[^a-zA-Z])${escapeRegExp(tagword)}`, 'i');
        }    
        // If onlyShowAlias is enabled, we don't need to include normal results
        if (CFG.alias.onlyShowAlias) {
            results = allTags.filter(x => x[3] && x[3].toLowerCase().search(searchRegex) > -1);
        } else {
            // Else both normal tags and aliases/translations are included depending on the config
            let baseFilter = (x) => x[0].toLowerCase().search(searchRegex) > -1;
            let aliasFilter = (x) => x[3] && x[3].toLowerCase().search(searchRegex) > -1;
            let translationFilter = (x) => (translations.has(x[0]) && translations.get(x[0]).toLowerCase().search(searchRegex) > -1)
                || x[3] && x[3].split(",").some(y => translations.has(y) && translations.get(y).toLowerCase().search(searchRegex) > -1);
            
            let fil;
            if (CFG.alias.searchByAlias && CFG.translation.searchByTranslation)
                fil = (x) => baseFilter(x) || aliasFilter(x) || translationFilter(x);
            else if (CFG.alias.searchByAlias && !CFG.translation.searchByTranslation)
                fil = (x) => baseFilter(x) || aliasFilter(x);
            else if (CFG.translation.searchByTranslation && !CFG.alias.searchByAlias)
                fil = (x) => baseFilter(x) || translationFilter(x);
            else
                fil = (x) => baseFilter(x);

            // Add final results
            allTags.filter(fil).forEach(t => {
                let result = new AutocompleteResult(t[0].trim(), ResultType.tag)
                result.category = t[1];
                result.count = t[2];
                result.aliases = t[3];
                results.push(result);
            });
        }
        // Slice if the user has set a max result count
        if (!CFG.showAllResults) {
            results = results.slice(0, CFG.maxResults);
        }
    }

    // Guard for empty results
    if (!results.length) {
        //console.log('No results found for "' + tagword + '"');
        hideResults(textArea);
        return;
    }

    showResults(textArea);
    addResultsToList(textArea, results, tagword, true);
}

var oldSelectedTag = null;
function navigateInList(textArea, event) {
    // Return if the function is deactivated in the UI or the current model is excluded due to white/blacklist settings
    if (!isEnabled()) return;

    validKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", "Enter", "Tab", "Escape"];

    if (!validKeys.includes(event.key)) return;
    if (!isVisible(textArea)) return
    // Return if ctrl key is pressed to not interfere with weight editing shortcut
    if (event.ctrlKey || event.altKey) return;

    oldSelectedTag = selectedTag;

    switch (event.key) {
        case "ArrowUp":
            if (selectedTag === null) {
                selectedTag = resultCount - 1;
            } else {
                selectedTag = (selectedTag - 1 + resultCount) % resultCount;
            }
            break;
        case "ArrowDown":
            if (selectedTag === null) {
                selectedTag = 0;
            } else {
                selectedTag = (selectedTag + 1) % resultCount;
            }
            break;
        case "PageUp":
            if (selectedTag === null || selectedTag === 0) {
                selectedTag = resultCount - 1;
            } else {
                selectedTag = (Math.max(selectedTag - 5, 0) + resultCount) % resultCount;
            }
            break;
        case "PageDown":
            if (selectedTag === null || selectedTag === resultCount - 1) {
                selectedTag = 0;
            } else {
                selectedTag = Math.min(selectedTag + 5, resultCount - 1) % resultCount;
            }
            break;
        case "Home":
            selectedTag = 0;
            break;
        case "End":
            selectedTag = resultCount - 1;
            break;
        case "ArrowLeft":
            selectedTag = 0;
            break;
        case "ArrowRight":
            selectedTag = resultCount - 1;
            break;
        case "Enter":
            if (selectedTag !== null) {
                insertTextAtCursor(textArea, results[selectedTag], tagword);
            }
            break;
        case "Tab":
            if (selectedTag === null) {
                selectedTag = 0;
            }
            insertTextAtCursor(textArea, results[selectedTag], tagword);
            break;
        case "Escape":
            hideResults(textArea);
            break;
    }
    if (selectedTag === resultCount - 1
        && (event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        addResultsToList(textArea, results, tagword, false);
    }
    // Update highlighting
    if (selectedTag !== null)
        updateSelectionStyle(textArea, selectedTag, oldSelectedTag);

    // Prevent default behavior
    event.preventDefault();
    event.stopPropagation();
}

// One-time setup, triggered from onUiUpdate
async function setup() {
    // Load colors
    CFG["colors"] = (await readFile(`${tagBasePath}/colors.json?${new Date().getTime()}`, true));

    // Load wildcards
    if (wildcardFiles.length === 0) {
        try {
            let wcFileArr = (await readFile(`${tagBasePath}/temp/wc.txt?${new Date().getTime()}`)).split("\n");
            let wcBasePath = wcFileArr[0].trim(); // First line should be the base path
            wildcardFiles = wcFileArr.slice(1)
                .filter(x => x.trim().length > 0) // Remove empty lines
                .map(x => [wcBasePath, x.trim().replace(".txt", "")]); // Remove file extension & newlines

            // To support multiple sources, we need to separate them using the provided "-----" strings
            let wcExtFileArr = (await readFile(`${tagBasePath}/temp/wce.txt?${new Date().getTime()}`)).split("\n");
            let splitIndices = [];
            for (let index = 0; index < wcExtFileArr.length; index++) {
                if (wcExtFileArr[index].trim() === "-----") {
                    splitIndices.push(index);
                }
            }
            // For each group, add them to the wildcardFiles array with the base path as the first element
            for (let i = 0; i < splitIndices.length; i++) {
                let start = splitIndices[i - 1] || 0;
                if (i > 0) start++; // Skip the "-----" line
                let end = splitIndices[i];

                let wcExtFile = wcExtFileArr.slice(start, end);
                let base = wcExtFile[0].trim() + "/";
                wcExtFile = wcExtFile.slice(1)
                    .filter(x => x.trim().length > 0) // Remove empty lines
                    .map(x => x.trim().replace(base, "").replace(".txt", "")); // Remove file extension & newlines;

                wcExtFile = wcExtFile.map(x => [base, x]);
                wildcardExtFiles.push(...wcExtFile);
            }
        } catch (e) {
            console.error("Error loading wildcards: " + e);
        }
    }
    // Load yaml wildcards
    if (yamlWildcards.length === 0) {
        try {
            let yamlTags = (await readFile(`${tagBasePath}/temp/wcet.txt?${new Date().getTime()}`)).split("\n");
            // Split into tag, count pairs
            yamlWildcards = yamlTags.map(x => x
                .trim()
                .split(","))
                .map(([i, ...rest]) => [
                    i,
                    rest.reduce((a, b) => {
                        a[b.toLowerCase()] = true;
                        return a;
                    }, {}),
                ]);
        } catch (e) {
            console.error("Error loading yaml wildcards: " + e);
        }
    }
    // Load embeddings
    if (embeddings.length === 0) {
        try {
            embeddings = (await readFile(`${tagBasePath}/temp/emb.txt?${new Date().getTime()}`)).split("\n")
                .filter(x => x.trim().length > 0) // Remove empty lines
                .map(x => x.trim().split(",")); // Split into name, version type pairs
        } catch (e) {
            console.error("Error loading embeddings.txt: " + e);
        }
    }

    // Find all textareas
    let textAreas = getTextAreas();

    // Add event listener to apply settings button so we can mirror the changes to our internal config
    let applySettingsButton = gradioApp().querySelector("#tab_settings #settings_submit") || gradioApp().querySelector("#tab_settings > div > .gr-button-primary");
    applySettingsButton.addEventListener("click", () => {
        // Wait 500ms to make sure the settings have been applied to the webui opts object
        setTimeout(async () => { 
            await syncOptions();
        }, 500);
    });
    // Add change listener to our quicksettings to change our internal config without the apply button for them
    let quicksettings = gradioApp().querySelector('#quicksettings');
    let commonQueryPart = "[id^=setting_tac] > label >";
    quicksettings.querySelectorAll(`${commonQueryPart} input, ${commonQueryPart} textarea, ${commonQueryPart} select`).forEach(e => {
        e.addEventListener("change", () => {
            setTimeout(async () => { 
                await syncOptions();
            }, 500);
        });
    });
    // Add change listener to model dropdown to react to model changes
    let modelDropdown = gradioApp().querySelector("#setting_sd_model_checkpoint select");
    currentModelHash = [...modelDropdown.value.matchAll(MODEL_HASH_REGEX)][0][1]; // Set initial model hash
    modelDropdown.addEventListener("change", () => {
        setTimeout(() => {
            currentModelHash = [...modelDropdown.value.matchAll(MODEL_HASH_REGEX)][0][1];
        }, 100);
    });

    // Not found, we're on a page without prompt textareas
    if (textAreas.every(v => v === null || v === undefined)) return;
    // Already added or unnecessary to add
    if (gradioApp().querySelector('.autocompleteResults.p')) {
        if (gradioApp().querySelector('.autocompleteResults.n') || !CFG.activeIn.negativePrompts) {
            return;
        }
    } else if (!CFG.activeIn.txt2img && !CFG.activeIn.img2img) {
        return;
    }

    textAreas.forEach(area => {
        // Return if autocomplete is disabled for the current area type in config
        let textAreaId = getTextAreaIdentifier(area);
        if ((!CFG.activeIn.img2img && textAreaId.includes("img2img"))
            || (!CFG.activeIn.txt2img && textAreaId.includes("txt2img"))
            || (!CFG.activeIn.negativePrompts && textAreaId.includes("n"))
            || (!CFG.activeIn.thirdParty && textAreaId.includes("thirdParty"))) {
            return;
        }

        // Only add listeners once
        if (!area.classList.contains('autocomplete')) {
            // Add our new element
            var resultsDiv = createResultsDiv(area);
            area.parentNode.insertBefore(resultsDiv, area.nextSibling);
            // Hide by default so it doesn't show up on page load
            hideResults(area);

            // Add autocomplete event listener
            area.addEventListener('input', debounce(() => autocomplete(area, area.value), CFG.delayTime));
            // Add focusout event listener
            area.addEventListener('focusout', debounce(() => hideResults(area), 400));
            // Add up and down arrow event listener
            area.addEventListener('keydown', (e) => navigateInList(area, e));
            // CompositionEnd fires after the user has finished IME composing
            // We need to block hide here to prevent the enter key from insta-closing the results
            area.addEventListener('compositionend', () => {
                hideBlocked = true;
                setTimeout(() => { hideBlocked = false; }, 100);
            });

            // Add class so we know we've already added the listeners
            area.classList.add('autocomplete');
        }
    });

    // Add style to dom
    let acStyle = document.createElement('style');
    //let css = gradioApp().querySelector('.dark') ? autocompleteCSS_dark : autocompleteCSS_light;
    let mode = gradioApp().querySelector('.dark') ? 0 : 1;
    // Check if we are on webkit
    let browser = navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ? "firefox" : "other";
    
    let css = autocompleteCSS;
    // Replace vars with actual values (can't use actual css vars because of the way we inject the css)
    Object.keys(styleColors).forEach((key) => {
        css = css.replace(`var(${key})`, styleColors[key][mode]);
    })
    Object.keys(browserVars).forEach((key) => {
        css = css.replace(`var(${key})`, browserVars[key][browser]);
    })
    
    if (acStyle.styleSheet) {
        acStyle.styleSheet.cssText = css;
    } else {
        acStyle.appendChild(document.createTextNode(css));
    }
    gradioApp().appendChild(acStyle);
}

onUiUpdate(async () => {
    if (Object.keys(opts).length === 0) return;
    if (CFG) return;

    // Get our tag base path from the temp file
    tagBasePath = await readFile(`tmp/tagAutocompletePath.txt?${new Date().getTime()}`);
    // Load config from webui opts
    await syncOptions();
    // Rest of setup
    setup();
});
