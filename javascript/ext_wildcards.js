// Regex
const WC_REGEX = new RegExp(/__([^,]+)__([^, ]*)/g);

// Trigger conditions
const WC_TRIGGER = () => TAC.Globals.CFG.useWildcards && [...TAC.Globals.tagword.matchAll(new RegExp(WC_REGEX.source.replaceAll("__", escapeRegExp(TAC.Globals.CFG.wcWrap)), "g"))].length > 0;
const WC_FILE_TRIGGER = () => TAC.Globals.CFG.useWildcards && (TAC.Globals.tagword.startsWith(TAC.Globals.CFG.wcWrap) && !TAC.Globals.tagword.endsWith(TAC.Globals.CFG.wcWrap) || TAC.Globals.tagword === TAC.Globals.CFG.wcWrap);

class WildcardParser extends BaseTagParser {
    async parse() {
        // Show wildcards from a file with that name
        let wcMatch = [...TAC.Globals.tagword.matchAll(new RegExp(WC_REGEX.source.replaceAll("__", escapeRegExp(TAC.Globals.CFG.wcWrap)), "g"))];
        let wcFile = wcMatch[0][1];
        let wcWord = wcMatch[0][2];

        // Look in normal wildcard files
        let wcFound = TAC.Globals.wildcardFiles.filter(x => x[1].toLowerCase() === wcFile);
        if (wcFound.length === 0) wcFound = null;
        // Use found wildcard file or look in external wildcard files
        let wcPairs = wcFound || TAC.Globals.wildcardExtFiles.filter(x => x[1].toLowerCase() === wcFile);

        if (!wcPairs) return [];

        let wildcards = [];
        for (let i = 0; i < wcPairs.length; i++) {
            const basePath = wcPairs[i][0];
            const fileName = wcPairs[i][1];
            if (!basePath || !fileName) return;

            // YAML wildcards are already loaded as json, so we can get the values directly.
            // basePath is the name of the file in this case, and fileName the key
            if (basePath.endsWith(".yaml")) {
                const getDescendantProp = (obj, desc) => {
                    const arr = desc.split("/");
                    while (arr.length) {
                      obj = obj[arr.shift()];
                    }
                    return obj;
                }
                wildcards = wildcards.concat(getDescendantProp(TAC.Globals.yamlWildcards[basePath], fileName));
            } else {
                const fileContent = (await TacUtils.fetchAPI(`tacapi/v1/wildcard-contents?basepath=${basePath}&filename=${fileName}.txt`, false))
                    .split("\n")
                    .filter(x => x.trim().length > 0 && !x.startsWith('#'));  // Remove empty lines and comments
                wildcards = wildcards.concat(fileContent);
            }
        }

        if (TAC.Globals.CFG.sortWildcardResults)
            wildcards.sort((a, b) => a.localeCompare(b));

        let finalResults = [];
        let tempResults = wildcards.filter(x => (wcWord !== null && wcWord.length > 0) ? x.toLowerCase().includes(wcWord) : x) // Filter by tagword
        tempResults.forEach(t => {
            let result = new AutocompleteResult(t.trim(), ResultType.wildcardTag);
            result.meta = wcFile;
            finalResults.push(result);
        });

        return finalResults;
    }
}

class WildcardFileParser extends BaseTagParser {
    parse() {
        // Show available wildcard files
        let tempResults = [];
        if (TAC.Globals.tagword !== TAC.Globals.CFG.wcWrap) {
            let lmb = (x) => x[1].toLowerCase().includes(TAC.Globals.tagword.replace(TAC.Globals.CFG.wcWrap, ""))
            tempResults = TAC.Globals.wildcardFiles.filter(lmb).concat(TAC.Globals.wildcardExtFiles.filter(lmb)) // Filter by tagword
        } else {
            tempResults = TAC.Globals.wildcardFiles.concat(TAC.Globals.wildcardExtFiles);
        }

        let finalResults = [];
        const alreadyAdded = new Map();
        // Get final results
        tempResults.forEach(wcFile => {
            // Skip duplicate entries incase multiple files have the same name or yaml category
            if (alreadyAdded.has(wcFile[1])) return;

            let result = null;
            if (wcFile[0].endsWith(".yaml")) {
                result = new AutocompleteResult(wcFile[1].trim(), ResultType.yamlWildcard);
                result.meta = "YAML wildcard collection";
            } else {
                result = new AutocompleteResult(wcFile[1].trim(), ResultType.wildcardFile);
                result.meta = "Wildcard file";
                result.sortKey = wcFile[2].trim();
            }

            finalResults.push(result);
            alreadyAdded.set(wcFile[1], true);
        });

        finalResults.sort(TacUtils.getSortFunction());

        return finalResults;
    }
}

async function load() {
    if (TAC.Globals.wildcardFiles.length === 0 && TAC.Globals.wildcardExtFiles.length === 0) {
        try {
            let wcFileArr = await TacUtils.loadCSV(`${TAC.Globals.tagBasePath}/temp/wc.txt`);
            if (wcFileArr && wcFileArr.length > 0) {
                let wcBasePath = wcFileArr[0][0].trim(); // First line should be the base path
                TAC.Globals.wildcardFiles = wcFileArr.slice(1)
                    .filter(x => x[0]?.trim().length > 0) //Remove empty lines
                    .map(x => [wcBasePath, x[0]?.trim().replace(".txt", ""), x[1]]); // Remove file extension & newlines
            }

            // To support multiple sources, we need to separate them using the provided "-----" strings
            let wcExtFileArr = await TacUtils.loadCSV(`${TAC.Globals.tagBasePath}/temp/wce.txt`);
            let splitIndices = [];
            for (let index = 0; index < wcExtFileArr.length; index++) {
                if (wcExtFileArr[index][0].trim() === "-----") {
                    splitIndices.push(index);
                }
            }
            // For each group, add them to the wildcardFiles array with the base path as the first element
            for (let i = 0; i < splitIndices.length; i++) {
                let start = splitIndices[i - 1] || 0;
                if (i > 0) start++; // Skip the "-----" line
                let end = splitIndices[i];

                let wcExtFile = wcExtFileArr.slice(start, end);
                if (wcExtFile && wcExtFile.length > 0) {
                    let base = wcExtFile[0][0].trim() + "/";
                    wcExtFile = wcExtFile.slice(1)
                        .filter(x => x[0]?.trim().length > 0) //Remove empty lines
                        .map(x => [base, x[0]?.trim().replace(base, "").replace(".txt", ""), x[1]]);
                    TAC.Globals.wildcardExtFiles.push(...wcExtFile);
                }
            }

            // Load the yaml wildcard json file and append it as a wildcard file, appending each key as a path component until we reach the end
            TAC.Globals.yamlWildcards = await TacUtils.readFile(`${TAC.Globals.tagBasePath}/temp/wc_yaml.json`, true);

            // Append each key as a path component until we reach a leaf
            Object.keys(TAC.Globals.yamlWildcards).forEach(file => {
                const flattened = TacUtils.flatten(TAC.Globals.yamlWildcards[file], [], "/");
                Object.keys(flattened).forEach(key => {
                    TAC.Globals.wildcardExtFiles.push([file, key]);
                });
            });
        } catch (e) {
            console.error("Error loading wildcards: " + e);
        }
    }
}

function sanitize(tagType, text) {
    if (tagType === ResultType.wildcardFile || tagType === ResultType.yamlWildcard) {
        return `${TAC.Globals.CFG.wcWrap}${text}${TAC.Globals.CFG.wcWrap}`;
    } else if (tagType === ResultType.wildcardTag) {
        return text;
    }
    return null;
}

function keepOpenIfWildcard(tagType, sanitizedText, newPrompt, textArea) {
    // If it's a wildcard, we want to keep the results open so the user can select another wildcard
    if (tagType === ResultType.wildcardFile || tagType === ResultType.yamlWildcard) {
        TAC.Globals.hideBlocked = true;
        setTimeout(() => { TAC.Globals.hideBlocked = false; }, 450);
        return true;
    }
    return false;
}

// Register the parsers
TAC.Ext.PARSERS.push(new WildcardParser(WC_TRIGGER));
TAC.Ext.PARSERS.push(new WildcardFileParser(WC_FILE_TRIGGER));

// Add our utility functions to their respective queues
TAC.Ext.QUEUE_FILE_LOAD.push(load);
TAC.Ext.QUEUE_SANITIZE.push(sanitize);
TAC.Ext.QUEUE_AFTER_INSERT.push(keepOpenIfWildcard);