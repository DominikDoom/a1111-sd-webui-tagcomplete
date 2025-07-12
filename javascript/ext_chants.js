(function ChantExtension() {
    const CHANT_REGEX = /<(?!e:|h:|l:)[^,> ]*>?/g;
    const CHANT_TRIGGER = () =>
        TAC.CFG.chantFile && TAC.CFG.chantFile !== "None" && TAC.Globals.tagword.match(CHANT_REGEX);

    class ChantParser extends TAC.BaseTagParser {
        parse() {
            // Show Chant
            let tempResults = [];
            if (TAC.Globals.tagword !== "<" && TAC.Globals.tagword !== "<c:") {
                let searchTerm = TAC.Globals.tagword
                    .replace("<chant:", "")
                    .replace("<c:", "")
                    .replace("<", "");
                let filterCondition = (x) => {
                    let regex = new RegExp(TacUtils.escapeRegExp(searchTerm, true), "i");
                    return regex.test(x.terms.toLowerCase()) || regex.test(x.name.toLowerCase());
                };
                tempResults = TAC.Globals.chants.filter((x) => filterCondition(x)); // Filter by tagword
            } else {
                tempResults = TAC.Globals.chants;
            }

            // Add final results
            let finalResults = [];
            tempResults.forEach((t) => {
                let result = new TAC.TAC.AutocompleteResult(t.content.trim(), TAC.ResultType.chant);
                result.meta = "Chant";
                result.aliases = t.name;
                result.category = t.color;
                finalResults.push(result);
            });

            return finalResults;
        }
    }

    async function load() {
        if (TAC.CFG.chantFile && TAC.CFG.chantFile !== "None") {
            try {
                TAC.Globals.chants = await TacUtils.readFile(
                    `${TAC.Globals.tagBasePath}/${TAC.CFG.chantFile}?`,
                    true
                );
            } catch (e) {
                console.error("Error loading chants.json: " + e);
            }
        } else {
            TAC.Globals.chants = [];
        }
    }

    function sanitize(tagType, text) {
        if (tagType === TAC.ResultType.chant) {
            return text;
        }
        return null;
    }

    TAC.Ext.PARSERS.push(new ChantParser(CHANT_TRIGGER));

    // Add our utility functions to their respective queues
    TAC.Ext.QUEUE_FILE_LOAD.push(load);
    TAC.Ext.QUEUE_SANITIZE.push(sanitize);
    TAC.Ext.QUEUE_AFTER_CONFIG_CHANGE.push(load);
})();
