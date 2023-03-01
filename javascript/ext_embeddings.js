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

            let filterCondition = x => x[0].toLowerCase().includes(searchTerm) || x[0].toLowerCase().replaceAll(" ", "_").includes(searchTerm);

            if (versionString)
                tempResults = embeddings.filter(x => filterCondition(x) && x[1] && x[1] === versionString); // Filter by tagword
            else
                tempResults = embeddings.filter(x => filterCondition(x)); // Filter by tagword
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

async function load() {
    if (embeddings.length === 0) {
        try {
            embeddings = (await readFile(`${tagBasePath}/temp/emb.txt`)).split("\n")
                .filter(x => x.trim().length > 0) // Remove empty lines
                .map(x => x.trim().split(",")); // Split into name, version type pairs
        } catch (e) {
            console.error("Error loading embeddings.txt: " + e);
        }
    }
}

function sanitize(tagType, text) {
    if (tagType === ResultType.embedding) {
        return text.replace(/^.*?: /g, "");
    }
    return null;
}

PARSERS.push(new EmbeddingParser(EMB_TRIGGER));

// Add our utility functions to their respective queues
QUEUE_FILE_LOAD.push(load);
QUEUE_SANITIZE.push(sanitize);