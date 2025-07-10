const LYCO_REGEX = /<(?!e:|h:|c:)[^,> ]*>?/g;
const LYCO_TRIGGER = () => TAC.CFG.useLycos && TAC.Globals.tagword.match(LYCO_REGEX);

class LycoParser extends BaseTagParser {
    parse() {
        // Show lyco
        let tempResults = [];
        if (TAC.Globals.tagword !== "<" && TAC.Globals.tagword !== "<l:" && TAC.Globals.tagword !== "<lyco:" && TAC.Globals.tagword !== "<lora:") {
            let searchTerm = TAC.Globals.tagword.replace("<lyco:", "").replace("<lora:", "").replace("<l:", "").replace("<", "");
            let filterCondition = x => {
                let regex = new RegExp(TacUtils.escapeRegExp(searchTerm, true), 'i');
                return regex.test(x.toLowerCase()) || regex.test(x.toLowerCase().replaceAll(" ", "_"));
            };
            tempResults = TAC.Globals.lycos.filter(x => filterCondition(x[0])); // Filter by tagword
        } else {
            tempResults = TAC.Globals.lycos;
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
            result.sortKey = t[1];
            result.hash = t[2];
            finalResults.push(result);
        });

        return finalResults;
    }
}

async function load() {
    if (TAC.Globals.lycos.length === 0) {
        try {
            TAC.Globals.lycos = (await TacUtils.loadCSV(`${TAC.Globals.tagBasePath}/temp/lyco.txt`))
                .filter(x => x[0]?.trim().length > 0) // Remove empty lines
                .map(x => [x[0]?.trim(), x[1], x[2]]); // Trim filenames and return the name, sortKey, hash pairs
        } catch (e) {
            console.error("Error loading lyco.txt: " + e);
        }
    }
}

async function sanitize(tagType, text) {
    if (tagType === ResultType.lyco) {
        let multiplier = TAC.CFG.extraNetworksDefaultMultiplier;
        let info = await TacUtils.fetchAPI(`tacapi/v1/lyco-info/${text}`)
        if (info && info["preferred weight"]) {
            multiplier = info["preferred weight"];
        }

        let prefix = TAC.CFG.useLoraPrefixForLycos ? "lora" : "lyco";
        return `<${prefix}:${text}:${multiplier}>`;
    }
    return null;
}

TAC.Ext.PARSERS.push(new LycoParser(LYCO_TRIGGER));

// Add our utility functions to their respective queues
TAC.Ext.QUEUE_FILE_LOAD.push(load);
TAC.Ext.QUEUE_SANITIZE.push(sanitize);
