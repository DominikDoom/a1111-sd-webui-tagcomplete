const EMB_REGEX = /<(?!l:|h:|c:)[^,> ]*>?/g;
const EMB_TRIGGER = () => TAC.CFG.useEmbeddings && (TAC.Globals.tagword.match(EMB_REGEX) || TAC.CFG.includeEmbeddingsInNormalResults);

class EmbeddingParser extends BaseTagParser {
    parse() {
        // Show embeddings
        let tempResults = [];
        if (TAC.Globals.tagword !== "<" && TAC.Globals.tagword !== "<e:") {
            let searchTerm = TAC.Globals.tagword.replace("<e:", "").replace("<", "");
            let versionString;
            if (searchTerm.startsWith("v1") || searchTerm.startsWith("v2")) {
                versionString = searchTerm.slice(0, 2);
                searchTerm = searchTerm.slice(2);
            } else if (searchTerm.startsWith("vxl")) {
                versionString = searchTerm.slice(0, 3);
                searchTerm = searchTerm.slice(3);
            }

            let filterCondition = x => {
                let regex = new RegExp(TacUtils.escapeRegExp(searchTerm, true), 'i');
                return regex.test(x[0].toLowerCase()) || regex.test(x[0].toLowerCase().replaceAll(" ", "_"));
            };

            if (versionString)
                tempResults = TAC.Globals.embeddings.filter(x => filterCondition(x) && x[2] && x[2].toLowerCase() === versionString.toLowerCase()); // Filter by tagword
            else
                tempResults = TAC.Globals.embeddings.filter(x => filterCondition(x)); // Filter by tagword
        } else {
            tempResults = TAC.Globals.embeddings;
        }

        // Add final results
        let finalResults = [];
        tempResults.forEach(t => {
            let lastDot = t[0].lastIndexOf(".") > -1 ? t[0].lastIndexOf(".") : t[0].length;
            let lastSlash = t[0].lastIndexOf("/") > -1 ? t[0].lastIndexOf("/") : -1;
            let name = t[0].trim().substring(lastSlash + 1, lastDot);

            let result = new TAC.AutocompleteResult(name, TAC.ResultType.embedding)
            result.sortKey = t[1];
            result.meta = t[2] + " Embedding";
            finalResults.push(result);
        });

        return finalResults;
    }
}

async function load() {
    if (TAC.Globals.embeddings.length === 0) {
        try {
            TAC.Globals.embeddings = (await TacUtils.loadCSV(`${TAC.Globals.tagBasePath}/temp/emb.txt`))
                .filter(x => x[0]?.trim().length > 0) // Remove empty lines
                .map(x => [x[0].trim(), x[1], x[2]]); // Return name, sortKey, hash tuples
        } catch (e) {
            console.error("Error loading embeddings.txt: " + e);
        }
    }
}

function sanitize(tagType, text) {
    if (tagType === TAC.ResultType.embedding) {
        return text;
    }
    return null;
}

TAC.Ext.PARSERS.push(new EmbeddingParser(EMB_TRIGGER));

// Add our utility functions to their respective queues
TAC.Ext.QUEUE_FILE_LOAD.push(load);
TAC.Ext.QUEUE_SANITIZE.push(sanitize);
