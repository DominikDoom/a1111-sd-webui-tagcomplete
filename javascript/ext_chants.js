const CHANT_REGEX = /<(?!e:|h:|l:)[^,> ]*>?/g;
const CHANT_TRIGGER = () => TAC_CFG.chantFile && TAC_CFG.chantFile !== "None" && tagword.match(CHANT_REGEX);

class ChantParser extends BaseTagParser {
    parse() {
        // Show Chant
        let tempResults = [];
        if (tagword !== "<" && tagword !== "<c:") {
            let searchTerm = tagword.replace("<chant:", "").replace("<c:", "").replace("<", "");
            let filterCondition = x => x.terms.toLowerCase().includes(searchTerm) || x.name.toLowerCase().includes(searchTerm);
            tempResults = chants.filter(x => filterCondition(x)); // Filter by tagword
        } else {
            tempResults = chants;
        }

        // Add final results
        let finalResults = [];
        tempResults.forEach(t => {
            let result = new AutocompleteResult(t.content.trim(), ResultType.chant)
            result.meta = "Chant";
            result.aliases = t.name;
            result.category = t.color;
            finalResults.push(result);
        });

        return finalResults;
    }
}

async function load() {
    if (TAC_CFG.chantFile && TAC_CFG.chantFile !== "None") {
        try {
            chants = await readFile(`${tagBasePath}/${TAC_CFG.chantFile}?`, true);
        } catch (e) {
            console.error("Error loading chants.json: " + e);
        }
    } else {
        chants = [];
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
QUEUE_AFTER_CONFIG_CHANGE.push(load);