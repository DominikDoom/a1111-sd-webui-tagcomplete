const LORA_REGEX = /<(?!e:|h:|c:)[^,> ]*>?/g;
const LORA_TRIGGER = () => TAC_CFG.useLoras && tagword.match(LORA_REGEX);

class LoraParser extends BaseTagParser {
    parse() {
        // Show lora
        let tempResults = [];
        if (tagword !== "<" && tagword !== "<l:" && tagword !== "<lora:") {
            let searchTerm = tagword.replace("<lora:", "").replace("<l:", "").replace("<", "");
            let filterCondition = x => x.toLowerCase().includes(searchTerm) || x.toLowerCase().replaceAll(" ", "_").includes(searchTerm);
            tempResults = loras.filter(x => filterCondition(x[0])); // Filter by tagword
        } else {
            tempResults = loras;
        }

        // Add final results
        let finalResults = [];
        tempResults.forEach(t => {
            let result = new AutocompleteResult(t[0].trim(), ResultType.lora)
            result.meta = "Lora";
            result.hash = t[1];
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
                .map(x => [x[0]?.trim(), x[1]]); // Trim filenames and return the name, hash pairs
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

        const lastDot = text.lastIndexOf(".");
        const lastSlash = text.lastIndexOf("/");
        const name = text.substring(lastSlash + 1, lastDot);

        return `<lora:${name}:${multiplier}>`;
    }
    return null;
}

PARSERS.push(new LoraParser(LORA_TRIGGER));

// Add our utility functions to their respective queues
QUEUE_FILE_LOAD.push(load);
QUEUE_SANITIZE.push(sanitize);