// Regex
const WC_REGEX = /\b__([^,]+)__([^, ]*)\b/g;

// Trigger conditions
const WC_TRIGGER = () => TAC_CFG.useWildcards && [...tagword.matchAll(WC_REGEX)].length > 0;
const WC_FILE_TRIGGER = () => TAC_CFG.useWildcards && (tagword.startsWith("__") && !tagword.endsWith("__") || tagword === "__");

class WildcardParser extends BaseTagParser {
    async parse() {
        // Show wildcards from a file with that name
        let wcMatch = [...tagword.matchAll(WC_REGEX)]
        let wcFile = wcMatch[0][1];
        let wcWord = wcMatch[0][2];

        // Look in normal wildcard files
        let wcFound = wildcardFiles.filter(x => x[1].toLowerCase() === wcFile);
        if (wcFound.length === 0) wcFound = null;
        // Use found wildcard file or look in external wildcard files
        let wcPairs = wcFound || wildcardExtFiles.filter(x => x[1].toLowerCase() === wcFile);

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
                wildcards = wildcards.concat(getDescendantProp(yamlWildcards[basePath], fileName));
            } else {
                const fileContent = (await fetchTacAPI(`tacapi/v1/wildcard-contents?basepath=${basePath}&filename=${fileName}.txt`, false))
                    .split("\n")
                    .filter(x => x.trim().length > 0 && !x.startsWith('#'));  // Remove empty lines and comments
                wildcards = wildcards.concat(fileContent);
            }
        }

        if (TAC_CFG.sortWildcardResults)
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
        if (tagword !== "__") {
            let lmb = (x) => x[1].toLowerCase().includes(tagword.replace("__", ""))
            tempResults = wildcardFiles.filter(lmb).concat(wildcardExtFiles.filter(lmb)) // Filter by tagword
        } else {
            tempResults = wildcardFiles.concat(wildcardExtFiles);
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

        finalResults.sort(getSortFunction());

        return finalResults;
    }
}

async function load() {
    if (wildcardFiles.length === 0 && wildcardExtFiles.length === 0) {
        try {
            let wcFileArr = await loadCSV(`${tagBasePath}/temp/wc.txt`);
            if (wcFileArr && wcFileArr.length > 0) {
                let wcBasePath = wcFileArr[0][0].trim(); // First line should be the base path
                wildcardFiles = wcFileArr.slice(1)
                    .filter(x => x[0]?.trim().length > 0) //Remove empty lines
                    .map(x => [wcBasePath, x[0]?.trim().replace(".txt", ""), x[1]]); // Remove file extension & newlines
            }

            // To support multiple sources, we need to separate them using the provided "-----" strings
            let wcExtFileArr = await loadCSV(`${tagBasePath}/temp/wce.txt`);
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
                    wildcardExtFiles.push(...wcExtFile);
                }
            }

            // Load the yaml wildcard json file and append it as a wildcard file, appending each key as a path component until we reach the end
            yamlWildcards = await readFile(`${tagBasePath}/temp/wc_yaml.json`, true);

            // Append each key as a path component until we reach a leaf
            Object.keys(yamlWildcards).forEach(file => {
                const flattened = flatten(yamlWildcards[file], [], "/");
                Object.keys(flattened).forEach(key => {
                    wildcardExtFiles.push([file, key]);
                });
            });
        } catch (e) {
            console.error("Error loading wildcards: " + e);
        }
    }
}

function sanitize(tagType, text) {
    if (tagType === ResultType.wildcardFile || tagType === ResultType.yamlWildcard) {
        return `__${text}__`;
    } else if (tagType === ResultType.wildcardTag) {
        return text;
    }
    return null;
}

function keepOpenIfWildcard(tagType, sanitizedText, newPrompt, textArea) {
    // If it's a wildcard, we want to keep the results open so the user can select another wildcard
    if (tagType === ResultType.wildcardFile || tagType === ResultType.yamlWildcard) {
        hideBlocked = true;
        setTimeout(() => { hideBlocked = false; }, 450);
        return true;
    }
    return false;
}

// Register the parsers
PARSERS.push(new WildcardParser(WC_TRIGGER));
PARSERS.push(new WildcardFileParser(WC_FILE_TRIGGER));

// Add our utility functions to their respective queues
QUEUE_FILE_LOAD.push(load);
QUEUE_SANITIZE.push(sanitize);
QUEUE_AFTER_INSERT.push(keepOpenIfWildcard);