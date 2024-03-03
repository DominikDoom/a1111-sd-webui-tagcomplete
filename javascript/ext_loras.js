const LORA_REGEX = /<(?!e:|h:|c:)[^,> ]*>?/g;
const LORA_TRIGGER = () => TAC_CFG.useLoras && tagword.match(LORA_REGEX);

function escapeRegex(text) {
    // Escape all characters except asterisks.
    return text.replace(/[-[\]{}()+.,\\^$|#\s]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
}
class LoraParser extends BaseTagParser {
    parse() {
        // Show lora
        let tempResults = [];
        if (tagword !== "<" && tagword !== "<l:" && tagword !== "<lora:") {
            let searchTerm = tagword.replace("<lora:", "").replace("<l:", "").replace("<", "");
            let filterCondition = x => {
                let regex = new RegExp(escapeRegex(searchTerm), 'i');
                return regex.test(x.toLowerCase()) || regex.test(x.toLowerCase().replaceAll(" ", "_"));
            };
            tempResults = loras.filter(x => filterCondition(x[0])); // Filter by tagword
        } else {
            tempResults = loras;
        }

        // Add final results
        let finalResults = [];
        tempResults.forEach(t => {
            const text = t[0].trim();
            let lastDot = text.lastIndexOf(".") > -1 ? text.lastIndexOf(".") : text.length;
            let lastSlash = text.lastIndexOf("/") > -1 ? text.lastIndexOf("/") : -1;
            let name = text.substring(lastSlash + 1, lastDot);

            let result = new AutocompleteResult(name, ResultType.lora)
            result.meta = "Lora";
            result.sortKey = t[1];
            result.hash = t[2];
            finalResults.push(result);
        });

        return finalResults;
    }
}

async function load() {
    if (loras.length === 0) {
        try {
            loras = (await loadCSV(`${tagBasePath}/temp/lora.txt`))
                .filter(x => x[0]?.trim().length > 0) // Remove empty lines
                .map(x => [x[0]?.trim(), x[1], x[2]]); // Trim filenames and return the name, sortKey, hash pairs
        } catch (e) {
            console.error("Error loading lora.txt: " + e);
        }
    }
}

async function sanitize(tagType, text) {
    if (tagType === ResultType.lora) {
        let multiplier = TAC_CFG.extraNetworksDefaultMultiplier;
        let info = await fetchAPI(`tacapi/v1/lora-info/${text}`)
        if (info && info["preferred weight"]) {
            multiplier = info["preferred weight"];
        }

        return `<lora:${text}:${multiplier}>`;
    }
    return null;
}

PARSERS.push(new LoraParser(LORA_TRIGGER));

// Add our utility functions to their respective queues
QUEUE_FILE_LOAD.push(load);
QUEUE_SANITIZE.push(sanitize);
