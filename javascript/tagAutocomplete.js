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
    "--live-translation-rt": ["whitesmoke", "#222"],
    "--live-translation-color-1": ["lightskyblue", "#2d89ef"],
    "--live-translation-color-2": ["palegoldenrod", "#eb5700"],
    "--live-translation-color-3": ["darkseagreen", "darkgreen"],
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
    .autocompleteResults {
        position: absolute;
        z-index: 999;
        max-width: calc(100% - 1.5rem);
        margin: 5px 0 0 0;
        background-color: var(--results-bg) !important;
        border: var(--results-border-width) solid var(--results-border-color) !important;
        border-radius: 12px !important;
        overflow-y: var(--results-overflow-y);
        overflow-x: hidden;
        word-break: break-word;
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
        white-space: break-spaces;
    }
    .acMetaText {
        position: relative;
        flex-grow: 1;
        text-align: end;
        padding: 0 0 0 15px;
        white-space: nowrap;
        color: var(--meta-text-color);
    }
    .acWikiLink {
        padding: 0.5rem;
        margin: -0.5rem 0 -0.5rem -0.5rem;
    }
    .acWikiLink:hover {
        text-decoration: underline;
    }
    .acListItem.acEmbeddingV1 {
        color: var(--embedding-v1-color);
    }
    .acListItem.acEmbeddingV2 {
        color: var(--embedding-v2-color);
    }
    .acRuby {
        padding: var(--input-padding);
        color: #888;
        font-size: 0.8rem;
        user-select: none;
    }
    .acRuby > ruby {
        display: inline-flex;
        flex-direction: column-reverse;
        margin-top: 0.5rem;
        vertical-align: bottom;
        cursor: pointer;
    }
    .acRuby > ruby::hover {
        text-decoration: underline;
        text-shadow: 0 0 10px var(--live-translation-color-1);
    }
    .acRuby > :nth-child(3n+1) {
        color: var(--live-translation-color-1);
    }
    .acRuby > :nth-child(3n+2) {
        color: var(--live-translation-color-2);
    }
    .acRuby > :nth-child(3n+3) {
        color: var(--live-translation-color-3);
    }
    .acRuby > ruby > rt {
        line-height: 1rem;
        padding: 0px 5px 0px 0px;
        text-align: left;
        font-size: 1rem;
        color: var(--live-translation-rt);
    }
`;

async function loadTags(c) {
    // Load main tags and aliases
    if (allTags.length === 0 && c.tagFile && c.tagFile !== "None") {
        try {
            allTags = await loadCSV(`${tagBasePath}/${c.tagFile}`);
        } catch (e) {
            console.error("Error loading tags file: " + e);
            return;
        }
    }
    await loadExtraTags(c);
}

async function loadExtraTags(c) {
    if (c.extra.extraFile && c.extra.extraFile !== "None") {
        try {
            extras = await loadCSV(`${tagBasePath}/${c.extra.extraFile}`);
            // Add translations to the main translation map for extra tags that have them
            extras.forEach(e => {
                if (e[4]) translations.set(e[0], e[4]);
            });
        } catch (e) {
            console.error("Error loading extra file: " + e);
            return;
        }
    }
}

async function loadTranslations(c) {
    if (c.translation.translationFile && c.translation.translationFile !== "None") {
        try {
            let tArray = await loadCSV(`${tagBasePath}/${c.translation.translationFile}`);
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
        slidingPopup: opts["tac_slidingPopup"],
        maxResults: opts["tac_maxResults"],
        showAllResults: opts["tac_showAllResults"],
        resultStepLength: opts["tac_resultStepLength"],
        delayTime: opts["tac_delayTime"],
        useWildcards: opts["tac_useWildcards"],
        useEmbeddings: opts["tac_useEmbeddings"],
        useHypernetworks: opts["tac_useHypernetworks"],
        useLoras: opts["tac_useLoras"],
	useLycos: opts["tac_useLycos"],
        showWikiLinks: opts["tac_showWikiLinks"],
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
            liveTranslation: opts["tac_translation.liveTranslation"],
        },
        // Extra file settings
        extra: {
            extraFile: opts["tac_extra.extraFile"],
            addMode: opts["tac_extra.addMode"]
        },
        // Settings not from tac but still used by the script
        extraNetworksDefaultMultiplier: opts["extra_networks_default_multiplier"],
        extraNetworksSeparator: opts["extra_networks_add_text_separator"],
        // Custom mapping settings
        keymap: JSON.parse(opts["tac_keymap"]),
        colorMap: JSON.parse(opts["tac_colormap"])
    }
    if (newCFG.alias.onlyShowAlias) {
        newCFG.alias.searchByAlias = true; // if only show translation, enable search by translation is necessary
    }

    // Reload translations if the translation file changed
    if (!CFG || newCFG.translation.translationFile !== CFG.translation.translationFile) {
        translations.clear();
        await loadTranslations(newCFG);
        await loadExtraTags(newCFG);
    }
    // Reload tags if the tag file changed (after translations so extra tag translations get re-added)
    if (!CFG || newCFG.tagFile !== CFG.tagFile || newCFG.extra.extraFile !== CFG.extra.extraFile) {
        allTags = [];
        await loadTags(newCFG);
    }

    // Update CSS if maxResults changed
    if (CFG && newCFG.maxResults !== CFG.maxResults) {
        gradioApp().querySelectorAll(".autocompleteResults").forEach(r => {
            r.style.maxHeight = `${newCFG.maxResults * 50}px`;
        });
    }

    // Remove ruby div if live preview was disabled
    if (newCFG.translation.liveTranslation === false) {
        [...gradioApp().querySelectorAll('.acRuby')].forEach(r => {
            r.remove();
        });
    }

    // Apply changes
    CFG = newCFG;

    // Callback
    await processQueue(QUEUE_AFTER_CONFIG_CHANGE, null);
}

// Create the result list div and necessary styling
function createResultsDiv(textArea) {
    let resultsDiv = document.createElement("div");
    let resultsList = document.createElement("ul");

    let textAreaId = getTextAreaIdentifier(textArea);
    let typeClass = textAreaId.replaceAll(".", " ");

    resultsDiv.style.maxHeight = `${CFG.maxResults * 50}px`;
    resultsDiv.setAttribute("class", `autocompleteResults${typeClass} notranslate`);
    resultsDiv.setAttribute("translate", "no");
    resultsList.setAttribute("class", "autocompleteResultsList");
    resultsDiv.appendChild(resultsList);

    return resultsDiv;
}

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

    if (CFG.slidingPopup) {
        let caretPosition = getCaretCoordinates(textArea, textArea.selectionEnd).left;
        let offset = Math.min(textArea.offsetLeft - textArea.scrollLeft + caretPosition, textArea.offsetWidth - resultsDiv.offsetWidth);
    
        resultsDiv.style.left = `${offset}px`;
    } else {
        if (resultsDiv.style.left)
            resultsDiv.style.removeProperty("left");
    }
}
function hideResults(textArea) {
    let textAreaId = getTextAreaIdentifier(textArea);
    let resultsDiv = gradioApp().querySelector('.autocompleteResults' + textAreaId);
    
    if (!resultsDiv) return;
    
    resultsDiv.style.display = "none";
    selectedTag = null;
}

// Function to check activation criteria
function isEnabled() {
    if (CFG.activeIn.global) {
        // Skip check if the current model was not correctly detected, since it could wrongly disable the script otherwise
        if (!currentModelName || !currentModelHash) return true;
        
        let modelList = CFG.activeIn.modelList
            .split(",")
            .map(x => x.trim())
            .filter(x => x.length > 0);
        
        let shortHash = currentModelHash.substring(0, 10);
        let modelNameWithoutHash = currentModelName.replace(/\[.*\]$/g, "").trim();
        if (CFG.activeIn.modelListMode.toLowerCase() === "blacklist") {
            // If the current model is in the blacklist, disable
            return modelList.filter(x => x === currentModelName || x === modelNameWithoutHash || x === currentModelHash || x === shortHash).length === 0;
        } else {
            // If the current model is in the whitelist, enable.
            // An empty whitelist is ignored.
            return modelList.length === 0 || modelList.filter(x => x === currentModelName || x === modelNameWithoutHash || x === currentModelHash || x === shortHash).length > 0;
        }
    } else {
        return false;
    }
}

const WEIGHT_REGEX = /[([]([^()[\]:|]+)(?::(?:\d+(?:\.\d+)?|\.\d+))?[)\]]/g;
const POINTY_REGEX = /<[^\s,<](?:[^\t\n\r,<>]*>|[^\t\n\r,> ]*)/g;
const COMPLETED_WILDCARD_REGEX = /__[^\s,_][^\t\n\r,_]*[^\s,_]__[^\s,_]*/g;
const NORMAL_TAG_REGEX = /[^\s,|<>)\]]+|</g;
const RUBY_TAG_REGEX = /[\w\d<][\w\d' \-?!/$%]{2,}>?/g;
const TAG_REGEX = new RegExp(`${POINTY_REGEX.source}|${COMPLETED_WILDCARD_REGEX.source}|${NORMAL_TAG_REGEX.source}`, "g");

// On click, insert the tag into the prompt textbox with respect to the cursor position
async function insertTextAtCursor(textArea, result, tagword) {
    let text = result.text;
    let tagType = result.type;

    let cursorPos = textArea.selectionStart;
    var sanitizedText = text

    // Run sanitize queue and use first result as sanitized text
    sanitizeResults = await processQueueReturn(QUEUE_SANITIZE, null, tagType, text);

    if (sanitizeResults && sanitizeResults.length > 0) {
        sanitizedText = sanitizeResults[0];
    } else {
        sanitizedText = CFG.replaceUnderscores ? text.replaceAll("_", " ") : text;

        if (CFG.escapeParentheses && tagType === ResultType.tag) {
            sanitizedText = sanitizedText
                .replaceAll("(", "\\(")
                .replaceAll(")", "\\)")
                .replaceAll("[", "\\[")
                .replaceAll("]", "\\]");
        }
    }

    var prompt = textArea.value;

    // Edit prompt text
    let editStart = Math.max(cursorPos - tagword.length, 0);
    let editEnd = Math.min(cursorPos + tagword.length, prompt.length);
    let surrounding = prompt.substring(editStart, editEnd);
    let match = surrounding.match(new RegExp(escapeRegExp(`${tagword}`), "i"));
    let afterInsertCursorPos = editStart + match.index + sanitizedText.length;

    var optionalSeparator = "";
    let extraNetworkTypes = [ResultType.hypernetwork, ResultType.lora];
    let noCommaTypes = [ResultType.wildcardFile, ResultType.yamlWildcard].concat(extraNetworkTypes);
    if (CFG.appendComma && !noCommaTypes.includes(tagType)) {
        optionalSeparator = surrounding.match(new RegExp(`${escapeRegExp(tagword)}[,:]`, "i")) !== null ? "" : ", ";
    } else if (extraNetworkTypes.includes(tagType)) {
        // Use the dedicated separator for extra networks if it's defined, otherwise fall back to space
        optionalSeparator = CFG.extraNetworksSeparator || " ";
    }

    // Replace partial tag word with new text, add comma if needed
    let insert = surrounding.replace(match, sanitizedText + optionalSeparator);

    // Add back start
    var newPrompt = prompt.substring(0, editStart) + insert + prompt.substring(editEnd);
    textArea.value = newPrompt;
    textArea.selectionStart = afterInsertCursorPos + optionalSeparator.length;
    textArea.selectionEnd = textArea.selectionStart

    // Since we've modified a Gradio Textbox component manually, we need to simulate an `input` DOM event to ensure it's propagated back to python.
    // Uses a built-in method from the webui's ui.js which also already accounts for event target
    updateInput(textArea);

    // Update previous tags with the edited prompt to prevent re-searching the same term
    let weightedTags = [...newPrompt.matchAll(WEIGHT_REGEX)]
            .map(match => match[1]);
    let tags = newPrompt.match(TAG_REGEX)
    if (weightedTags !== null) {
        tags = tags.filter(tag => !weightedTags.some(weighted => tag.includes(weighted)))
            .concat(weightedTags);
    }
    previousTags = tags;

    // Callback
    let returns = await processQueueReturn(QUEUE_AFTER_INSERT, null, tagType, sanitizedText, newPrompt, textArea);
    // Return if any queue function returned true (has handled hide/show already)
    if (returns.some(x => x === true))
        return;

    // Hide results after inserting, if it hasn't been hidden already by a queue function
    if (!hideBlocked && isVisible(textArea)) {
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
    let tagColors = CFG.colorMap;
    let mode = document.querySelector('.dark') ? 0 : 1;
    let nextLength = Math.min(results.length, resultCount + CFG.resultStepLength);

    for (let i = resultCount; i < nextLength; i++) {
        let result = results[i];

        // Skip if the result is null or undefined
        if (!result)
            continue;

        let li = document.createElement("li");

        let flexDiv = document.createElement("div");
        flexDiv.classList.add("resultsFlexContainer");
        li.appendChild(flexDiv);

        let itemText = document.createElement("div");
        itemText.classList.add("acListItem");

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

        // Add wiki link if the setting is enabled and a supported tag set loaded
        if (CFG.showWikiLinks
            && (result.type === ResultType.tag)
            && (tagFileName.toLowerCase().startsWith("danbooru") || tagFileName.toLowerCase().startsWith("e621"))) {
            let wikiLink = document.createElement("a");
            wikiLink.classList.add("acWikiLink");
            wikiLink.innerText = "?";

            let linkPart = displayText;
            // Only use alias result if it is one
            if (displayText.includes("➝"))
                linkPart = displayText.split(" ➝ ")[1];
            
            // Set link based on selected file
            let tagFileNameLower = tagFileName.toLowerCase();
            if (tagFileNameLower.startsWith("danbooru")) {
                wikiLink.href = `https://danbooru.donmai.us/wiki_pages/${linkPart}`;
            } else if (tagFileNameLower.startsWith("e621")) {
                wikiLink.href = `https://e621.net/wiki_pages/${linkPart}`;
            }
            
            wikiLink.target = "_blank";
            flexDiv.appendChild(wikiLink);
        }

        flexDiv.appendChild(itemText);

        // Add post count & color if it's a tag
        // Wildcards & Embeds have no tag category
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

            flexDiv.style = `color: ${colorGroup[cat][mode]};`;
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
        } else if (result.meta) { // Check if there is meta info to display
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

    if (resetList)
        resultDiv.scrollTop = 0;
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

function updateRuby(textArea, prompt) {
    if (!CFG.translation.liveTranslation) return;

    let ruby = gradioApp().querySelector('.acRuby' + getTextAreaIdentifier(textArea));
    if (!ruby) {
        let textAreaId = getTextAreaIdentifier(textArea);
        let typeClass = textAreaId.replaceAll(".", " ");
        ruby = document.createElement("div");
        ruby.setAttribute("class", `acRuby${typeClass} notranslate`);
        textArea.parentNode.appendChild(ruby);
    }
    
    ruby.innerText = prompt;

    let bracketEscapedPrompt = prompt.replaceAll("\\(", "$").replaceAll("\\)", "%");

    let rubyTags = bracketEscapedPrompt.match(RUBY_TAG_REGEX);
    if (!rubyTags) return;

    rubyTags.sort((a, b) => b.length - a.length);
    rubyTags = new Set(rubyTags);

    const prepareTag = (tag) => {
        tag = tag.replaceAll("$", "\\(").replaceAll("%", "\\)");

        let unsanitizedTag = tag
            .replaceAll(" ", "_")
            .replaceAll("\\(", "(")
            .replaceAll("\\)", ")");
        
        const translation = translations?.get(tag) || translations?.get(unsanitizedTag); 
        
        let escapedTag = escapeRegExp(tag);
        return { tag, escapedTag, translation };
    }

    const replaceOccurences = (text, tuple) => {
        let { tag, escapedTag, translation } = tuple;
        let searchRegex = new RegExp(`(?<!<ruby>)(?:\\b)${escapedTag}(?:\\b|$|(?=[,|: \\t\\n\\r]))(?!<rt>)`, "g");
        return text.replaceAll(searchRegex, `<ruby>${escapeHTML(tag)}<rt>${translation}</rt></ruby>`);
    }

    let html = escapeHTML(prompt);

    // First try to find direct matches
    [...rubyTags].forEach(tag => {
        let tuple = prepareTag(tag);
        
        if (tuple.translation) {
            html = replaceOccurences(html, tuple);
        } else {
            let subTags = tuple.tag.split(" ").filter(x => x.trim().length > 0);
            // Return if there is only one word
            if (subTags.length === 1) return;
            
            let subHtml = tag.replaceAll("$", "\\(").replaceAll("%", "\\)");

            let translateNgram = (windows) => {
                windows.forEach(window => {
                    let combinedTag = window.join(" ");
                    let subTuple = prepareTag(combinedTag);

                    if (subTuple.tag.length <= 2) return;

                    if (subTuple.translation) {
                        subHtml = replaceOccurences(subHtml, subTuple);
                    }
                });
            }
    
            // Perform n-gram sliding window search
            translateNgram(toNgrams(subTags, 3));
            translateNgram(toNgrams(subTags, 2));
            translateNgram(toNgrams(subTags, 1));

            let escapedTag = escapeRegExp(tuple.tag);
            
            let searchRegex = new RegExp(`(?<!<ruby>)(?:\\b)${escapedTag}(?:\\b|$|(?=[,|: \\t\\n\\r]))(?!<rt>)`, "g");
            html = html.replaceAll(searchRegex, subHtml);
        }
    });

    ruby.innerHTML = html;

    // Add listeners for auto selection
    const childNodes = [...ruby.childNodes];
    [...ruby.children].forEach(child => {
        const textBefore = childNodes.slice(0, childNodes.indexOf(child)).map(x => x.childNodes[0]?.textContent || x.textContent).join("")
        child.onclick = () => rubyTagClicked(child, textBefore, prompt, textArea);
    });
}

function rubyTagClicked(node, textBefore, prompt, textArea) {
    let selectionText = node.childNodes[0].textContent;

    // Find start and end position of the tag in the prompt
    let startPos = prompt.indexOf(textBefore) + textBefore.length;
    let endPos = startPos + selectionText.length;

    // Select in text area
    textArea.focus();
    textArea.setSelectionRange(startPos, endPos);
}

async function autocomplete(textArea, prompt, fixedTag = null) {
    // Return if the function is deactivated in the UI
    if (!isEnabled()) return;

    // Guard for empty prompt
    if (prompt.length === 0) {
        hideResults(textArea);
        previousTags = [];
        tagword = "";
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

        // Guard for no tags
        if (!tags || tags.length === 0) {
            previousTags = [];
            tagword = "";
            hideResults(textArea);
            return;
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

    // Process all parsers
    let resultCandidates = await processParsers(textArea, prompt);
    // If one ore more result candidates match, use their results
    if (resultCandidates && resultCandidates.length > 0) {
        // Flatten our candidate(s)
        results = resultCandidates.flat();
        // If there was more than one candidate, sort the results by text to mix them
        // instead of having them added in the order of the parsers
        let shouldSort = resultCandidates.length > 1;
        if (shouldSort) {
            results = results.sort((a, b) => a.text.localeCompare(b.text));

            // Since some tags are kaomoji, we have to add the normal results in some cases
            if (tagword.startsWith("<") || tagword.startsWith("*<")) {
                // Create escaped search regex with support for * as a start placeholder
                let searchRegex;
                if (tagword.startsWith("*")) {
                    tagword = tagword.slice(1);
                    searchRegex = new RegExp(`${escapeRegExp(tagword)}`, 'i');
                } else {
                    searchRegex = new RegExp(`(^|[^a-zA-Z])${escapeRegExp(tagword)}`, 'i');
                }
                let genericResults = allTags.filter(x => x[0].toLowerCase().search(searchRegex) > -1).slice(0, CFG.maxResults);

                genericResults.forEach(g => {
                    let result = new AutocompleteResult(g[0].trim(), ResultType.tag)
                    result.category = g[1];
                    result.count = g[2];
                    result.aliases = g[3];
                    results.push(result);
                });
            }
        }
    } else { // Else search the normal tag list
        // Create escaped search regex with support for * as a start placeholder
        let searchRegex;
        if (tagword.startsWith("*")) {
            tagword = tagword.slice(1);
            searchRegex = new RegExp(`${escapeRegExp(tagword)}`, 'i');
        } else {
            searchRegex = new RegExp(`(^|[^a-zA-Z])${escapeRegExp(tagword)}`, 'i');
        }

        // Both normal tags and aliases/translations are included depending on the config
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

        // Add extras
        if (CFG.extra.extraFile) {
            let extraResults = [];

            extras.filter(fil).forEach(e => {
                let result = new AutocompleteResult(e[0].trim(), ResultType.extra)
                result.category = e[1] || 0; // If no category is given, use 0 as the default
                result.meta = e[2] || "Custom tag";
                result.aliases = e[3] || "";
                extraResults.push(result);
            });

            if (CFG.extra.addMode === "Insert before") {
                results = extraResults.concat(results);
            } else {
                results = results.concat(extraResults);
            }
        }
        
        // Slice if the user has set a max result count
        if (!CFG.showAllResults) {
            results = results.slice(0, CFG.maxResults);
        }
    }

    // Guard for empty results
    if (!results || results.length === 0) {
        //console.log('No results found for "' + tagword + '"');
        hideResults(textArea);
        return;
    }

    addResultsToList(textArea, results, tagword, true);
    showResults(textArea);
}

function navigateInList(textArea, event) {
    // Return if the function is deactivated in the UI or the current model is excluded due to white/blacklist settings
    if (!isEnabled()) return;
    
    let keys = CFG.keymap;

    // Close window if Home or End is pressed while not a keybinding, since it would break completion on leaving the original tag
    if ((event.key === "Home" || event.key === "End") && !Object.values(keys).includes(event.key)) {
        hideResults(textArea);
        return;
    }

    // All set keys that are not None or empty are valid
    // Default keys are: ArrowUp, ArrowDown, PageUp, PageDown, Home, End, Enter, Tab, Escape
    validKeys = Object.values(keys).filter(x => x !== "None" && x !== "");

    if (!validKeys.includes(event.key)) return;
    if (!isVisible(textArea)) return
    // Return if ctrl key is pressed to not interfere with weight editing shortcut
    if (event.ctrlKey || event.altKey) return;

    oldSelectedTag = selectedTag;

    switch (event.key) {
        case keys["MoveUp"]:
            if (selectedTag === null) {
                selectedTag = resultCount - 1;
            } else {
                selectedTag = (selectedTag - 1 + resultCount) % resultCount;
            }
            break;
        case keys["MoveDown"]:
            if (selectedTag === null) {
                selectedTag = 0;
            } else {
                selectedTag = (selectedTag + 1) % resultCount;
            }
            break;
        case keys["JumpUp"]:
            if (selectedTag === null || selectedTag === 0) {
                selectedTag = resultCount - 1;
            } else {
                selectedTag = (Math.max(selectedTag - 5, 0) + resultCount) % resultCount;
            }
            break;
        case keys["JumpDown"]:
            if (selectedTag === null || selectedTag === resultCount - 1) {
                selectedTag = 0;
            } else {
                selectedTag = Math.min(selectedTag + 5, resultCount - 1) % resultCount;
            }
            break;
        case keys["JumpToStart"]:
            selectedTag = 0;
            break;
        case keys["JumpToEnd"]:
            selectedTag = resultCount - 1;
            break;
        case keys["ChooseSelected"]:
            if (selectedTag !== null) {
                insertTextAtCursor(textArea, results[selectedTag], tagword);
            } else {
                hideResults(textArea);
                return;
            }
            break;
        case keys["ChooseFirstOrSelected"]:
            if (selectedTag === null) {
                selectedTag = 0;
            }
            insertTextAtCursor(textArea, results[selectedTag], tagword);
            break;
        case keys["Close"]:
            hideResults(textArea);
            break;
    }
    if (selectedTag === resultCount - 1
        && (event.key === keys["MoveUp"] || event.key === keys["MoveDown"] || event.key === keys["JumpToStart"] || event.key === keys["JumpToEnd"])) {
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
    // Load external files needed by completion extensions
    await processQueue(QUEUE_FILE_LOAD, null);

    // Find all textareas
    let textAreas = getTextAreas();

    // Add event listener to apply settings button so we can mirror the changes to our internal config
    let applySettingsButton = gradioApp().querySelector("#tab_settings #settings_submit") || gradioApp().querySelector("#tab_settings > div > .gr-button-primary");
    applySettingsButton?.addEventListener("click", () => {
        // Wait 500ms to make sure the settings have been applied to the webui opts object
        setTimeout(async () => { 
            await syncOptions();
        }, 500);
    });
    // Add change listener to our quicksettings to change our internal config without the apply button for them
    let quicksettings = gradioApp().querySelector('#quicksettings');
    let commonQueryPart = "[id^=setting_tac] > label >";
    quicksettings?.querySelectorAll(`${commonQueryPart} input, ${commonQueryPart} textarea, ${commonQueryPart} select`).forEach(e => {
        e.addEventListener("change", () => {
            setTimeout(async () => { 
                await syncOptions();
            }, 500);
        });
    });

    // Add mutation observer for the model hash text to also allow hash-based blacklist again
    let modelHashText = gradioApp().querySelector("#sd_checkpoint_hash");
    if (modelHashText) {
        currentModelHash = modelHashText.title
        let modelHashObserver = new MutationObserver((mutationList, observer) => {
            for (const mutation of mutationList) {
                if (mutation.type === "attributes" && mutation.attributeName === "title") {
                    currentModelHash = mutation.target.title;
                    let modelDropdown = gradioApp().querySelector("#setting_sd_model_checkpoint span.single-select")
                    if (modelDropdown) {
                        currentModelName = modelDropdown.textContent;
                    } else {
                        // Fallback for older versions
                        modelDropdown = gradioApp().querySelector("#setting_sd_model_checkpoint select");
                        currentModelName = modelDropdown.value;
                    }
                }
            }
        });
        modelHashObserver.observe(modelHashText, { attributes: true });
    }

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
            area.addEventListener('input', () => {
                debounce(autocomplete(area, area.value), CFG.delayTime);
                updateRuby(area, area.value);
            });
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
    //let mode = gradioApp().querySelector(".dark") ? 0 : 1;
    let mode = document.querySelector(".dark") ? 0 : 1;
    // Check if we are on webkit
    let browser = navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ? "firefox" : "other";
    
    let css = autocompleteCSS;
    // Replace vars with actual values (can't use actual css vars because of the way we inject the css)
    Object.keys(styleColors).forEach((key) => {
        css = css.replaceAll(`var(${key})`, styleColors[key][mode]);
    })
    Object.keys(browserVars).forEach((key) => {
        css = css.replaceAll(`var(${key})`, browserVars[key][browser]);
    })
    
    if (acStyle.styleSheet) {
        acStyle.styleSheet.cssText = css;
    } else {
        acStyle.appendChild(document.createTextNode(css));
    }
    gradioApp().appendChild(acStyle);

    // Callback
    await processQueue(QUEUE_AFTER_SETUP, null);
}
let loading = false;
onUiUpdate(async () => {
    if (loading) return;
    if (Object.keys(opts).length === 0) return;
    if (CFG) return;
    loading = true;
    // Get our tag base path from the temp file
    tagBasePath = await readFile(`tmp/tagAutocompletePath.txt`);
    // Load config from webui opts
    await syncOptions();
    // Rest of setup
    setup();
    loading = false;
});
