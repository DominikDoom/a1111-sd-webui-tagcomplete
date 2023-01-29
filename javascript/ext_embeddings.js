const EMB_REGEX = /<(?!l:|h:)[^,> ]*>?/g;
const EMB_TRIGGER = () => CFG.useEmbeddings && tagword.match(EMB_REGEX);

class EmbeddingParser extends BaseTagParser {
    parse() {
        // Show embeddings
        let tempResults = [];
        if (tagword !== "<" && tagword !== "<e:") {
            let searchTerm = tagword.replace("<e:", "").replace("<", "");
            let versionString;
            if (searchTerm.startsWith("v1") || searchTerm.startsWith("v2")) {
                versionString = searchTerm.slice(0, 2);
                searchTerm = searchTerm.slice(2);
            }
            if (versionString)
                tempResults = embeddings.filter(x => x[0].toLowerCase().includes(searchTerm) && x[1] && x[1] === versionString); // Filter by tagword
            else
                tempResults = embeddings.filter(x => x[0].toLowerCase().includes(searchTerm)); // Filter by tagword
        } else {
            tempResults = embeddings;
        }

        // Add final results
        let finalResults = [];
        tempResults.forEach(t => {
            let result = new AutocompleteResult(t[0].trim(), ResultType.embedding)
            result.meta = t[1] + " Embedding";
            finalResults.push(result);
        });

        return finalResults;
    }
}

PARSERS.push(new EmbeddingParser(EMB_TRIGGER));