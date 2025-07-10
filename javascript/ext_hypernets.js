const HYP_REGEX = /<(?!e:|l:|c:)[^,> ]*>?/g;
const HYP_TRIGGER = () => TAC.Globals.CFG.useHypernetworks && TAC.Globals.tagword.match(HYP_REGEX);

class HypernetParser extends BaseTagParser {
    parse() {
        // Show hypernetworks
        let tempResults = [];
        if (TAC.Globals.tagword !== "<" && TAC.Globals.tagword !== "<h:" && TAC.Globals.tagword !== "<hypernet:") {
            let searchTerm = TAC.Globals.tagword.replace("<hypernet:", "").replace("<h:", "").replace("<", "");
            let filterCondition = x => {
                let regex = new RegExp(TacUtils.escapeRegExp(searchTerm, true), 'i');
                return regex.test(x.toLowerCase()) || regex.test(x.toLowerCase().replaceAll(" ", "_"));
            };
            tempResults = TAC.Globals.hypernetworks.filter(x => filterCondition(x[0])); // Filter by tagword
        } else {
            tempResults = TAC.Globals.hypernetworks;
        }

        // Add final results
        let finalResults = [];
        tempResults.forEach(t => {
            let result = new AutocompleteResult(t[0].trim(), ResultType.hypernetwork)
            result.meta = "Hypernetwork";
            result.sortKey = t[1];
            finalResults.push(result);
        });

        return finalResults;
    }
}

async function load() {
    if (TAC.Globals.hypernetworks.length === 0) {
        try {
            TAC.Globals.hypernetworks = (await TacUtils.loadCSV(`${TAC.Globals.tagBasePath}/temp/hyp.txt`))
                .filter(x => x[0]?.trim().length > 0) //Remove empty lines
                .map(x => [x[0]?.trim(), x[1]]); // Remove carriage returns and padding if it exists
        } catch (e) {
            console.error("Error loading hypernetworks.txt: " + e);
        }
    }
}

function sanitize(tagType, text) {
    if (tagType === ResultType.hypernetwork) {
        return `<hypernet:${text}:${TAC.Globals.CFG.extraNetworksDefaultMultiplier}>`;
    }
    return null;
}

TAC.Ext.PARSERS.push(new HypernetParser(HYP_TRIGGER));

// Add our utility functions to their respective queues
TAC.Ext.QUEUE_FILE_LOAD.push(load);
TAC.Ext.QUEUE_SANITIZE.push(sanitize);
