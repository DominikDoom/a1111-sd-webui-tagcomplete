var CFG = null;

const styleColors = {
    "--results-bg": ["#0b0f19", "#ffffff"],
    "--results-border-color": ["#4b5563", "#e5e7eb"],
    "--results-border-width": ["1px", "1.5px"],
    "--results-bg-odd": ["#111827", "#f9fafb"],
    "--results-hover": ["#1f2937", "#f5f6f8"],
    "--results-selected": ["#374151", "#e5e7eb"],
    "--post-count-color": ["#6b6f7b", "#a2a9b4"]
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
        margin: 0 5px;
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
    .acPostCount {
        position: relative;
        text-align: end;
        padding: 0 0 0 15px;
        flex-grow: 1;
        color: var(--post-count-color);
    }
`;

// Parse the CSV file into a 2D array. Doesn't use regex, so it is very lightweight.
function parseCSV(str) {
    var arr = [];
    var quote = false;  // 'true' means we're inside a quoted field

    // Iterate over each character, keep track of current row and column (of the returned array)
    for (var row = 0, col = 0, c = 0; c < str.length; c++) {
        var cc = str[c], nc = str[c + 1];        // Current character, next character
        arr[row] = arr[row] || [];             // Create a new row if necessary
        arr[row][col] = arr[row][col] || '';   // Create a new column (start with empty string) if necessary

        // If the current character is a quotation mark, and we're inside a
        // quoted field, and the next character is also a quotation mark,
        // add a quotation mark to the current column and skip the next character
        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }

        // If it's just one quotation mark, begin/end quoted field
        if (cc == '"') { quote = !quote; continue; }

        // If it's a comma and we're not in a quoted field, move on to the next column
        if (cc == ',' && !quote) { ++col; continue; }

        // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
        // and move on to the next row and move to column 0 of that new row
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }

        // If it's a newline (LF or CR) and we're not in a quoted field,
        // move on to the next row and move to column 0 of that new row
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }

        // Otherwise, append the current character to the current column
        arr[row][col] += cc;
    }
    return arr;
}

// Load file
async function readFile(filePath, json = false) {
    let response = await fetch(`file=${filePath}`);

    if (response.status != 200) {
        console.error(`Error loading file "${filePath}": ` + response.status, response.statusText);
        return null;
    }

    if (json)
        return await response.json();
    else
        return await response.text();
}

// Load CSV
async function loadCSV(path) {
    let text = await readFile(path);
    return parseCSV(text);
}

var tagBasePath = "";
var allTags = [];
var translations = new Map();

async function loadTags(c) {
    // Load main tags and aliases
    if (allTags.length === 0) {
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
            thirdParty: opts["tac_activeIn.thirdParty"]
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

// Debounce function to prevent spamming the autocomplete function
var dbTimeOut;
const debounce = (func, wait = 300) => {
    return function (...args) {
        if (dbTimeOut) {
            clearTimeout(dbTimeOut);
        }

        dbTimeOut = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    }
}

// Difference function to fix duplicates not being seen as changes in normal filter
function difference(a, b) {
    if (a.length == 0) {
        return b;
    }
    if (b.length == 0) {
        return a;
    }

    return [...b.reduce((acc, v) => acc.set(v, (acc.get(v) || 0) - 1),
        a.reduce((acc, v) => acc.set(v, (acc.get(v) || 0) + 1), new Map())
    )].reduce((acc, [v, count]) => acc.concat(Array(Math.abs(count)).fill(v)), []);
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

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
function escapeHTML(unsafeText) {
    let div = document.createElement('div');
    div.textContent = unsafeText;
    return div.innerHTML;
}

const WEIGHT_REGEX = /[([]([^,()[\]:| ]+)(?::(?:\d+(?:\.\d+)?|\.\d+))?[)\]]/g;
const TAG_REGEX = /(<[^\t\n\r,>]+>?|[^\s,|<>]+|<)/g
const WC_REGEX = /\b__([^, ]+)__([^, ]*)\b/g;
const UMI_PROMPT_REGEX = /<[^\s]*?\[[^,<>]*[\]|]?>?/gi;
const UMI_TAG_REGEX = /(?:\[|\||--)([^<>\[\]\-|]+)/gi;
let hideBlocked = false;

// On click, insert the tag into the prompt textbox with respect to the cursor position
function insertTextAtCursor(textArea, result, tagword) {
    let text = result[0];
    let tagType = result[1];

    let cursorPos = textArea.selectionStart;
    var sanitizedText = text

    // Replace differently depending on if it's a tag or wildcard
    if (tagType === "wildcardFile") {
        sanitizedText = "__" + text.replace("Wildcards: ", "") + "__";
    } else if (tagType === "wildcardTag") {
        sanitizedText = text.replace(/^.*?: /g, "");
    } else if (tagType === "yamlWildcard" && !yamlWildcards.includes(text)) {
        sanitizedText = text.replaceAll("_", " "); // Replace underscores only if the yaml tag is not using them
    } else if (tagType === "embedding") {
        sanitizedText = `<${text.replace(/^.*?: /g, "")}>`;
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
    if (CFG.appendComma && tagType !== "wildcardFile" && tagType !== "yamlWildcard") {
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
    if (tagType === "yamlWildcard" && originalTagword.length > 0) {
        let editStart = Math.max(cursorPos - tagword.length, 0);
        let editEnd = Math.min(cursorPos + tagword.length, originalTagword.length);
        let surrounding = originalTagword.substring(editStart, editEnd);
        let match = surrounding.match(new RegExp(escapeRegExp(`${tagword}`), "i"));
        let insert = surrounding.replace(match, sanitizedText);

        let modifiedTagword = prompt.substring(0, editStart) + insert + prompt.substring(editEnd);
        let umiSubPrompts = [...newPrompt.matchAll(UMI_PROMPT_REGEX)];

        let umiTags = [];
        umiSubPrompts.forEach(umiSubPrompt => {
            umiTags = umiTags.concat([...umiSubPrompt[0].matchAll(UMI_TAG_REGEX)].map(x => x[1].toLowerCase()));
        });

        umiPreviousTags = umiTags;

        console.log("updated: " + umiPreviousTags)
        hideResults(textArea);
    }

    // Hide results after inserting
    if (tagType === "wildcardFile") {
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
        if (result[3] && !result[0].includes(tagword)) { // Alias
            let splitAliases = result[3].split(",");
            let bestAlias = splitAliases.find(a => a.toLowerCase().includes(tagword));

            // search in translations if no alias matches
            if (!bestAlias) {
                let tagOrAlias = pair => pair[0] === result[0] || result[3].split(",").includes(pair[0]);
                var tArray = [...translations];
                if (tArray) {
                    var translationKey = [...translations].find(pair => tagOrAlias(pair) && pair[1].includes(tagword));
                    if (translationKey)
                        bestAlias = translationKey[0];
                }
            }

            displayText = escapeHTML(bestAlias);

            // Append translation for alias if it exists and is not what the user typed
            if (translations.has(bestAlias) && translations.get(bestAlias) !== bestAlias && bestAlias !== result[0])
                displayText += `[${translations.get(bestAlias)}]`;

            if (!CFG.alias.onlyShowAlias && result[0] !== bestAlias)
                displayText += " ➝ " + result[0];
        } else { // No alias
            displayText = escapeHTML(result[0]);
        }

        // Append translation for result if it exists
        if (translations.has(result[0]))
            displayText += `[${translations.get(result[0])}]`;

        // Print search term bolded in result
        itemText.innerHTML = displayText.replace(tagword, `<b>${tagword}</b>`);

        // Add post count & color if it's a tag
        // Wildcards & Embeds have no tag type
        if (!result[1].startsWith("wildcard") && result[1] !== "embedding") {
            if (!result[1].startsWith("yaml")) {
                // Set the color of the tag
                let tagType = result[1];
                let colorGroup = tagColors[tagFileName];
                // Default to danbooru scheme if no matching one is found
                if (!colorGroup)
                    colorGroup = tagColors["danbooru"];

                // Set tag type to invalid if not found
                if (!colorGroup[tagType])
                    tagType = "-1";

                itemText.style = `color: ${colorGroup[tagType][mode]};`;
            }

            // Post count
            if (result[2] && !isNaN(result[2])) {
                let postCount = result[2];
                let formatter;

                // Danbooru formats numbers with a padded fraction for 1M or 1k, but not for 10/100k
                if (postCount >= 1000000 || (postCount >= 1000 && postCount < 10000))
                    formatter = Intl.NumberFormat("en", { notation: "compact", minimumFractionDigits: 1, maximumFractionDigits: 1 });
                else
                    formatter = Intl.NumberFormat("en", {notation: "compact"});
    
                let formattedCount = formatter.format(postCount);
    
                let countDiv = document.createElement("div");
                countDiv.textContent = formattedCount;
                countDiv.classList.add("acPostCount");
                flexDiv.appendChild(countDiv);
            }
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
    if (!CFG.activeIn.global) return;

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

        results = wildcards.filter(x => (wcWord !== null && wcWord.length > 0) ? x.toLowerCase().includes(wcWord) : x) // Filter by tagword
            .map(x => [wcFile + ": " + x.trim(), "wildcardTag"]); // Mark as wildcard
    } else if (CFG.useWildcards && (tagword.startsWith("__") && !tagword.endsWith("__") || tagword === "__")) {
        // Show available wildcard files
        let tempResults = [];
        if (tagword !== "__") {
            let lmb = (x) => x[1].toLowerCase().includes(tagword.replace("__", ""))
            tempResults = wildcardFiles.filter(lmb).concat(wildcardExtFiles.filter(lmb)) // Filter by tagword
        } else {
            tempResults = wildcardFiles.concat(wildcardExtFiles);
        }
        results = tempResults.map(x => ["Wildcards: " + x[1].trim(), "wildcardFile"]); // Mark as wildcard
    } else if (CFG.useWildcards && [...tagword.matchAll(UMI_PROMPT_REGEX)].length > 0) {
        // We are in a UMI yaml tag definition, parse further
        let umiSubPrompts = [...prompt.matchAll(UMI_PROMPT_REGEX)];
        
        let umiTags = [];
        let umiTagsWithOperators = []
        umiSubPrompts.forEach(umiSubPrompt => {
            umiTags = umiTags.concat([...umiSubPrompt[0].matchAll(UMI_TAG_REGEX)].map(x => x[1].toLowerCase()));
            umiTagsWithOperators = umiTagsWithOperators.concat([...umiSubPrompt[0].matchAll(UMI_TAG_REGEX)]);
        });

        // UMI tag matching for narrowed down tag counts
        const partition = (arr, predicate) => arr.reduce((acc, val, i, arr) => {
            acc[predicate(val, i, arr) ? 0 : 1].push(val);
            return acc;
        }, [[], []]);

        const [positiveAndOptional, negative] = partition(umiTagsWithOperators, x => !x[0].startsWith("--"));

        const [positive, optional] = partition(
            positiveAndOptional,
            (x, i, arr) => 
                x[0].startsWith("[")
                && x.input.endsWith("|"), // bad condition, find a better one
        ); 
            
        const matches = {
            neg: negative.map(x => x[1].toLowerCase()),
            pos: positive.map(x => x[1].toLowerCase()),
            opt: optional.map(x => x[1].toLowerCase())
        };

        const filteredWildcards = (tagword) => {
            // TODO; fix optional tagword matching, rn the top level is too greedy and makes finding out if this is an optional tagword impossible
            const tagwordIsOptional = matches.opt.includes(tagword);
            console.log('tagwordIsOptional', tagwordIsOptional)
            const wildcards = yamlWildcards.filter(x => {
                let tags = x[1];
                const matchesNeg = matches.neg.length === 0 || matches.neg.every(x => x === tagword || !tags[x]);
                if (!matchesNeg) return false;
                const matchesPos = matches.pos.length === 0 || matches.pos.every(x => x === tagword || tags[x]);
                if (!matchesPos) return false;
                const matchesOpt = matches.opt.length === 0 || tagwordIsOptional || matches.opt.some(x => x !== tagword && tags[x]);
                if (!matchesOpt) return false;
                return true;
            }).reduce((acc, val) => {
                Object.keys(val[1]).forEach(tag => acc[tag] = acc[tag] + 1 || 1);
                return acc;
            }, {});
            console.log(wildcards);

            return Object.entries(wildcards).sort((a, b) => b[1] - a[1]).filter(x => x[0] === tagword || !umiTags.includes(x[0]));
        }
        
        if (umiTags.length > 0) {
            // Get difference for subprompt
            let tagCountChange = umiTags.length - umiPreviousTags.length;
            let diff = difference(umiTags, umiPreviousTags);
            umiPreviousTags = umiTags;

            // Show all condition
            let showAll = tagword.endsWith("[") || tagword.endsWith("[--") || tagword.endsWith("|");

            console.log(tagword, umiTags, diff, tagCountChange, umiTagsWithOperators)

            // Exit early if the user closed the bracket manually
            if ((!diff || diff.length === 0 || (diff.length === 1 && tagCountChange < 0)) && !showAll) {
                if (!hideBlocked) hideResults(textArea);
                return;
            }

            let umiTagword = diff[0];
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
                results = tempResults.map(x => [x[0].trim(), "yamlWildcard", x[1]]); // Mark as yaml wildcard
            } else if (showAll) {
                let filteredWildcardsSorted = filteredWildcards("");
                results = filteredWildcardsSorted.map(x => [x[0].trim(), "yamlWildcard", x[1]]); // Mark as yaml wildcard
                originalTagword = tagword;
                tagword = "";
            }
        } else {
            let filteredWildcardsSorted = filteredWildcards("");
            results = filteredWildcardsSorted.map(x => [x[0].trim(), "yamlWildcard", x[1]]); // Mark as yaml wildcard
            originalTagword = tagword;
            tagword = "";
        }
    } else if (CFG.useEmbeddings && tagword.match(/<[^,> ]*>?/g)) {
        // Show embeddings
        let tempResults = [];
        if (tagword !== "<") {
            tempResults = embeddings.filter(x => x.toLowerCase().includes(tagword.replace("<", ""))) // Filter by tagword
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
        genericResults = allTags.filter(x => x[0].toLowerCase().search(searchRegex) > -1).slice(0, CFG.maxResults);
        results = genericResults.concat(tempResults.map(x => ["Embeddings: " + x.trim(), "embedding"])); // Mark as embedding
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

            results = allTags.filter(fil);
        }
        // Slice if the user has set a max result count
        if (!CFG.showAllResults) {
            results = results.slice(0, CFG.maxResults);
        }
    }

    // Guard for empty results
    if (!results.length) {
        hideResults(textArea);
        return;
    }

    showResults(textArea);
    addResultsToList(textArea, results, tagword, true);
}

var oldSelectedTag = null;
function navigateInList(textArea, event) {
    // Return if the function is deactivated in the UI
    if (!CFG.activeIn.global) return;

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
                .map(x => x.replace(".bin", "").replace(".pt", "").replace(".png", "")); // Remove file extensions
        } catch (e) {
            console.error("Error loading embeddings.txt: " + e);
        }
    }

    // Find all textareas
    let textAreas = getTextAreas();

    // Add event listener to apply settings button so we can mirror the changes to our internal config
    let applySettingsButton = gradioApp().querySelector("#tab_settings > div > .gr-button-primary");
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