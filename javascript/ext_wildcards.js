// Regex
const WC_REGEX = /\b__([^, ]+)__([^, ]*)\b/g;

// Trigger conditions
const WC_TRIGGER = () => CFG.useWildcards && [...tagword.matchAll(WC_REGEX)].length > 0;
const WC_FILE_TRIGGER = () => CFG.useWildcards && (tagword.startsWith("__") && !tagword.endsWith("__") || tagword === "__");

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

        let wildcards = (await readFile(`${wcPair[0]}/${wcPair[1]}.txt?${new Date().getTime()}`)).split("\n")
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

// Register the parsers
PARSERS.push(new WildcardParser(WC_TRIGGER));
PARSERS.push(new WildcardFileParser(WC_FILE_TRIGGER));