(function StyleExtension() {
    const STYLE_REGEX = /(\$(\d*)\(?)[^$|\[\],\s]*\)?/;
    const STYLE_TRIGGER = () => TAC.CFG.useStyleVars && TAC.Globals.tagword.match(STYLE_REGEX);

    var lastStyleVarIndex = "";

    class StyleParser extends TAC.BaseTagParser {
        async parse() {
            // Refresh if needed
            await TAC.Utils.refreshStyleNamesIfChanged();

            // Show styles
            let tempResults = [];
            let matchGroups = TAC.Globals.tagword.match(STYLE_REGEX);

            // Save index to insert again later or clear last one
            lastStyleVarIndex = matchGroups[2] ? matchGroups[2] : "";

            if (TAC.Globals.tagword !== matchGroups[1]) {
                let searchTerm = TAC.Globals.tagword.replace(matchGroups[1], "");

                let filterCondition = (x) => {
                    let regex = new RegExp(TAC.Utils.escapeRegExp(searchTerm, true), "i");
                    return (
                        regex.test(x[0].toLowerCase()) ||
                        regex.test(x[0].toLowerCase().replaceAll(" ", "_"))
                    );
                };
                tempResults = TAC.Globals.styleNames.filter((x) => filterCondition(x)); // Filter by tagword
            } else {
                tempResults = TAC.Globals.styleNames;
            }

            // Add final results
            let finalResults = [];
            tempResults.forEach((t) => {
                let result = new TAC.AutocompleteResult(t[0].trim(), TAC.ResultType.styleName);
                result.meta = "Style";
                finalResults.push(result);
            });

            return finalResults;
        }
    }

    async function load(force = false) {
        if (TAC.Globals.styleNames.length === 0 || force) {
            try {
                TAC.Globals.styleNames = (
                    await TAC.Utils.loadCSV(`${TAC.Globals.tagBasePath}/temp/styles.txt`)
                )
                    .filter((x) => x[0]?.trim().length > 0) // Remove empty lines
                    .filter((x) => x[0] !== "None") // Remove "None" style
                    .map((x) => [x[0].trim()]); // Trim name
            } catch (e) {
                console.error("Error loading styles.txt: " + e);
            }
        }
    }

    function sanitize(tagType, text) {
        if (tagType === TAC.ResultType.styleName) {
            if (text.includes(" ")) {
                return `$${lastStyleVarIndex}(${text})`;
            } else {
                return `$${lastStyleVarIndex}${text}`;
            }
        }
        return null;
    }

    TAC.Ext.PARSERS.push(new StyleParser(STYLE_TRIGGER));

    // Add our utility functions to their respective queues
    TAC.Ext.QUEUE_FILE_LOAD.push(load);
    TAC.Ext.QUEUE_SANITIZE.push(sanitize);
})();
