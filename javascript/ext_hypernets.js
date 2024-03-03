const HYP_REGEX = /<(?!e:|l:|c:)[^,> ]*>?/g;
const HYP_TRIGGER = () => TAC_CFG.useHypernetworks && tagword.match(HYP_REGEX);

class HypernetParser extends BaseTagParser {
    parse() {
        // Show hypernetworks
        let tempResults = [];
        if (tagword !== "<" && tagword !== "<h:" && tagword !== "<hypernet:") {
            let searchTerm = tagword.replace("<hypernet:", "").replace("<h:", "").replace("<", "");
            let filterCondition = x => {
                let regex = new RegExp(escapeRegExp(searchTerm, true), 'i');
                return regex.test(x.toLowerCase()) || regex.test(x.toLowerCase().replaceAll(" ", "_"));
            };
            tempResults = hypernetworks.filter(x => filterCondition(x[0])); // Filter by tagword
        } else {
            tempResults = hypernetworks;
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
    if (hypernetworks.length === 0) {
        try {
            hypernetworks = (await loadCSV(`${tagBasePath}/temp/hyp.txt`))
                .filter(x => x[0]?.trim().length > 0) //Remove empty lines
                .map(x => [x[0]?.trim(), x[1]]); // Remove carriage returns and padding if it exists
        } catch (e) {
            console.error("Error loading hypernetworks.txt: " + e);
        }
    }
}

function sanitize(tagType, text) {
    if (tagType === ResultType.hypernetwork) {
        return `<hypernet:${text}:${TAC_CFG.extraNetworksDefaultMultiplier}>`;
    }
    return null;
}

PARSERS.push(new HypernetParser(HYP_TRIGGER));

// Add our utility functions to their respective queues
QUEUE_FILE_LOAD.push(load);
QUEUE_SANITIZE.push(sanitize);
