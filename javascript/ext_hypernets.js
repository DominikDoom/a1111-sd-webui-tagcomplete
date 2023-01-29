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

PARSERS.push(new HypernetParser(HYP_TRIGGER));