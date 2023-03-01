const HYP_REGEX = /<(?!e:|l:)[^,> ]*>?/g;
const HYP_TRIGGER = () => CFG.useHypernetworks && tagword.match(HYP_REGEX);

class HypernetParser extends BaseTagParser {
    parse() {
        // Show hypernetworks
        let tempResults = [];
        if (tagword !== "<" && tagword !== "<h:" && tagword !== "<hypernet:") {
            let searchTerm = tagword.replace("<hypernet:", "").replace("<h:", "").replace("<", "");
            let filterCondition = x => x.toLowerCase().includes(searchTerm) || x.toLowerCase().replaceAll(" ", "_").includes(searchTerm);
            tempResults = hypernetworks.filter(x => filterCondition(x)); // Filter by tagword
        } else {
            tempResults = hypernetworks;
        }

        // Add final results
        let finalResults = [];
        tempResults.forEach(t => {
            let result = new AutocompleteResult(t.trim(), ResultType.hypernetwork)
            result.meta = "Hypernetwork";
            finalResults.push(result);
        });

        return finalResults;
    }
}

async function load() {
    if (hypernetworks.length === 0) {
        try {
            hypernetworks = (await readFile(`${tagBasePath}/temp/hyp.txt`)).split("\n")
                .filter(x => x.trim().length > 0) //Remove empty lines
                .map(x => x.trim()); // Remove carriage returns and padding if it exists
        } catch (e) {
            console.error("Error loading hypernetworks.txt: " + e);
        }
    }
}

function sanitize(tagType, text) {
    if (tagType === ResultType.hypernetwork) {
        return `<hypernet:${text}:${CFG.extraNetworksDefaultMultiplier}>`;
    }
    return null;
}

PARSERS.push(new HypernetParser(HYP_TRIGGER));

// Add our utility functions to their respective queues
QUEUE_FILE_LOAD.push(load);
QUEUE_SANITIZE.push(sanitize);