const HYP_REGEX = /<(?!e:|l:)[^,> ]*>?/g;
const HYP_TRIGGER = () => CFG.useHypernetworks && tagword.match(HYP_REGEX);

class HypernetParser extends BaseTagParser {
    parse() {
        // Show hypernetworks
        let tempResults = [];
        if (tagword !== "<" && tagword !== "<h:") {
            let searchTerm = tagword.replace("<h:", "").replace("<", "");
            tempResults = hypernetworks.filter(x => x.toLowerCase().includes(searchTerm)); // Filter by tagword
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

PARSERS.push(new HypernetParser(HYP_TRIGGER));

// Add load function to the queue
QUEUE_FILE_LOAD.push(load);