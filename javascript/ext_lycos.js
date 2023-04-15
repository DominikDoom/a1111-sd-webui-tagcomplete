const LYCO_REGEX = /<(?!e:|h:)[^,> ]*>?/g;
const LYCO_TRIGGER = () => CFG.useLycos && tagword.match(LYCO_REGEX);

class LycoParser extends BaseTagParser {
    parse() {
        // Show lyco
        let tempResults = [];
        if (tagword !== "<" && tagword !== "<l:" && tagword !== "<lyco:") {
            let searchTerm = tagword.replace("<lyco:", "").replace("<l:", "").replace("<", "");
            let filterCondition = x => x.toLowerCase().includes(searchTerm) || x.toLowerCase().replaceAll(" ", "_").includes(searchTerm);
            tempResults = lycos.filter(x => filterCondition(x)); // Filter by tagword
        } else {
            tempResults = lycos;
        }

        // Add final results
        let finalResults = [];
        tempResults.forEach(t => {
            let result = new AutocompleteResult(t.trim(), ResultType.lyco)
            result.meta = "Lyco";
            finalResults.push(result);
        });

        return finalResults;
    }
}

async function load() {
    if (lycos.length === 0) {
        try {
            lycos = (await readFile(`${tagBasePath}/temp/lyco.txt`)).split("\n")
                .filter(x => x.trim().length > 0) // Remove empty lines
                .map(x => x.trim()); // Remove carriage returns and padding if it exists
        } catch (e) {
            console.error("Error loading lyco.txt: " + e);
        }
    }
}

function sanitize(tagType, text) {
    if (tagType === ResultType.lyco) {
        return `<lyco:${text}:${CFG.extraNetworksDefaultMultiplier}>`;
    }
    return null;
}

PARSERS.push(new LycoParser(LYCO_TRIGGER));

// Add our utility functions to their respective queues
QUEUE_FILE_LOAD.push(load);
QUEUE_SANITIZE.push(sanitize);