const LYCO_REGEX = /<(?!e:|h:|c:)[^,> ]*>?/g;
const LYCO_TRIGGER = () => TAC_CFG.useLycos && tagword.match(LYCO_REGEX);

class LycoParser extends BaseTagParser {
    parse() {
        // Show lyco
        let tempResults = [];
        if (tagword !== "<" && tagword !== "<l:" && tagword !== "<lyco:") {
            let searchTerm = tagword.replace("<lyco:", "").replace("<l:", "").replace("<", "");
            let filterCondition = x => x.toLowerCase().includes(searchTerm) || x.toLowerCase().replaceAll(" ", "_").includes(searchTerm);
            tempResults = lycos.filter(x => filterCondition(x[0])); // Filter by tagword
        } else {
            tempResults = lycos;
        }

        // Add final results
        let finalResults = [];
        tempResults.forEach(t => {
            const text = t[0].trim();
            let lastDot = text.lastIndexOf(".") > -1 ? text.lastIndexOf(".") : text.length;
            let lastSlash = text.lastIndexOf("/") > -1 ? text.lastIndexOf("/") : -1;
            let name = text.substring(lastSlash + 1, lastDot);

            let result = new AutocompleteResult(name, ResultType.lyco)
            result.meta = "Lyco";
            result.hash = t[1];
            finalResults.push(result);
        });

        return finalResults;
    }
}

async function load() {
    if (lycos.length === 0) {
        try {
            lycos = (await loadCSV(`${tagBasePath}/temp/lyco.txt`))
                .filter(x => x[0]?.trim().length > 0) // Remove empty lines
                .map(x => [x[0]?.trim(), x[1]]); // Trim filenames and return the name, hash pairs
        } catch (e) {
            console.error("Error loading lyco.txt: " + e);
        }
    }
}

async function sanitize(tagType, text) {
    if (tagType === ResultType.lyco) {
        let multiplier = TAC_CFG.extraNetworksDefaultMultiplier;
        let info = await fetchAPI(`tacapi/v1/lyco-info/${text}`)
        if (info && info["preferred weight"]) {
            multiplier = info["preferred weight"];
        }

        return `<lyco:${text}:${multiplier}>`;
    }
    return null;
}

PARSERS.push(new LycoParser(LYCO_TRIGGER));

// Add our utility functions to their respective queues
QUEUE_FILE_LOAD.push(load);
QUEUE_SANITIZE.push(sanitize);