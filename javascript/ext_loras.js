const LORA_REGEX = /<(?!e:|h:|c:)[^,> ]*>?/g;
const LORA_TRIGGER = () => TAC.CFG.useLoras && TAC.Globals.tagword.match(LORA_REGEX);

class LoraParser extends BaseTagParser {
    parse() {
        // Show lora
        let tempResults = [];
        if (TAC.Globals.tagword !== "<" && TAC.Globals.tagword !== "<l:" && TAC.Globals.tagword !== "<lora:") {
            let searchTerm = TAC.Globals.tagword.replace("<lora:", "").replace("<l:", "").replace("<", "");
            let filterCondition = x => {
                let regex = new RegExp(TacUtils.escapeRegExp(searchTerm, true), 'i');
                return regex.test(x.toLowerCase()) || regex.test(x.toLowerCase().replaceAll(" ", "_"));
            };
            tempResults = TAC.Globals.loras.filter(x => filterCondition(x[0])); // Filter by tagword
        } else {
            tempResults = TAC.Globals.loras;
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
    if (TAC.Globals.loras.length === 0) {
        try {
            TAC.Globals.loras = (await TacUtils.loadCSV(`${TAC.Globals.tagBasePath}/temp/lora.txt`))
                .filter(x => x[0]?.trim().length > 0) // Remove empty lines
                .map(x => [x[0]?.trim(), x[1], x[2]]); // Trim filenames and return the name, sortKey, hash pairs
        } catch (e) {
            console.error("Error loading lora.txt: " + e);
        }
    }
}

async function sanitize(tagType, text) {
    if (tagType === ResultType.lora) {
        let multiplier = TAC.CFG.extraNetworksDefaultMultiplier;
        let info = await TacUtils.fetchAPI(`tacapi/v1/lora-info/${text}`)
        if (info && info["preferred weight"]) {
            multiplier = info["preferred weight"];
        }

        return `<lora:${text}:${multiplier}>`;
    }
    return null;
}

TAC.Ext.PARSERS.push(new LoraParser(LORA_TRIGGER));

// Add our utility functions to their respective queues
TAC.Ext.QUEUE_FILE_LOAD.push(load);
TAC.Ext.QUEUE_SANITIZE.push(sanitize);
