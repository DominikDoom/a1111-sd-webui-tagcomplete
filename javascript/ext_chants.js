const CHANT_REGEX = /<(?!e:|h:|l:)[^,> ]*>?/g;
const CHANT_TRIGGER = () => TAC_CFG.useChants && tagword.match(CHANT_REGEX);

class ChantParser extends BaseTagParser {
    parse() {
        // Show Chant
        let tempResults = [];
        if (tagword !== "<" && tagword !== "<c:") {
            let searchTerm = tagword.replace("<c:", "").replace("<", "");
            let filterCondition = x => x.term.toLowerCase().includes(searchTerm);
            tempResults = loras.filter(x => filterCondition(x)); // Filter by tagword
        } else {
            tempResults = chants;
        }

        // Add final results
        let finalResults = [];
        tempResults.forEach(t => {
            let result = new AutocompleteResult(t.content.trim(), ResultType.chant)
            result.meta = t.name + " Chant";
            finalResults.push(result);
        });

        return finalResults;
    }
}

async function load() {
    if (chants.length === 0) {
        try {
            chants = await readFile(`${tagBasePath}/chants.json`, true);
        } catch (e) {
            console.error("Error loading chants.txt: " + e);
        }
    }
}

function sanitize(tagType, text) {
    if (tagType === ResultType.chant) {
        return text.replace(/^.*?: /g, "");
    }
    return null;
}

PARSERS.push(new ChantParser(CHANT_TRIGGER));

// Add our utility functions to their respective queues
QUEUE_FILE_LOAD.push(load);
QUEUE_SANITIZE.push(sanitize);