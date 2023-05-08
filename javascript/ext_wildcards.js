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
        let wcFound = wildcardFiles.find(x => x[1].toLowerCase() === wcFile);
        // Use found wildcard file or look in external wildcard files
        let wcPair = wcFound || wildcardExtFiles.find(x => x[1].toLowerCase() === wcFile);

        let wildcards = (await readFile(`${wcPair[0]}/${wcPair[1]}.txt`)).split("\n")
            .filter(x => x.trim().length > 0 && !x.startsWith('#'));  // Remove empty lines and comments

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
        // Get final results
        tempResults.forEach(wcFile => {
            let result = new AutocompleteResult(wcFile[1].trim(), ResultType.wildcardFile);
            result.meta = "Wildcard file";
            finalResults.push(result);
        });

        return finalResults;
    }
}

async function load() {
    if (wildcardFiles.length === 0 && wildcardExtFiles.length === 0) {
        try {
            let wcFileArr = (await readFile(`${tagBasePath}/temp/wc.txt`)).split("\n");
            let wcBasePath = wcFileArr[0].trim(); // First line should be the base path
            wildcardFiles = wcFileArr.slice(1)
                .filter(x => x.trim().length > 0) // Remove empty lines
                .map(x => [wcBasePath, x.trim().replace(".txt", "")]); // Remove file extension & newlines

            // To support multiple sources, we need to separate them using the provided "-----" strings
            let wcExtFileArr = (await readFile(`${tagBasePath}/temp/wce.txt`)).split("\n");
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
}

function sanitize(tagType, text) {
    if (tagType === ResultType.wildcardFile) {
        return `__${text}__`;
    } else if (tagType === ResultType.wildcardTag) {
        return text.replace(/^.*?: /g, "");
    }
    return null;
}

function keepOpenIfWildcard(tagType, sanitizedText, newPrompt, textArea) {
    // If it's a wildcard, we want to keep the results open so the user can select another wildcard
    if (tagType === ResultType.wildcardFile) {
        hideBlocked = true;
        autocomplete(textArea, newPrompt, sanitizedText);
        setTimeout(() => { hideBlocked = false; }, 100);
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