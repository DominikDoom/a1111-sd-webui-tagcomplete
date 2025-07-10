const STYLE_REGEX = /(\$(\d*)\(?)[^$|\[\],\s]*\)?/;
const STYLE_TRIGGER = () => TAC.Globals.CFG.useStyleVars && tagword.match(STYLE_REGEX);

var lastStyleVarIndex = "";

class StyleParser extends BaseTagParser {
   async parse() {
        // Refresh if needed
        await TacUtils.refreshStyleNamesIfChanged();

        // Show styles
        let tempResults = [];
        let matchGroups = tagword.match(STYLE_REGEX);
        
        // Save index to insert again later or clear last one
        lastStyleVarIndex = matchGroups[2] ? matchGroups[2] : "";

        if (tagword !== matchGroups[1]) {
            let searchTerm = tagword.replace(matchGroups[1], "");
            
            let filterCondition = x => {
                let regex = new RegExp(TacUtils.escapeRegExp(searchTerm, true), 'i');
                return regex.test(x[0].toLowerCase()) || regex.test(x[0].toLowerCase().replaceAll(" ", "_"));
            };
            tempResults = styleNames.filter(x => filterCondition(x)); // Filter by tagword
        } else {
            tempResults = styleNames;
        }

        // Add final results
        let finalResults = [];
        tempResults.forEach(t => {
            let result = new AutocompleteResult(t[0].trim(), ResultType.styleName)
            result.meta = "Style";
            finalResults.push(result);
        });

        return finalResults;
    }
}

async function load(force = false) {
    if (styleNames.length === 0 || force) {
        try {
            styleNames = (await TacUtils.loadCSV(`${tagBasePath}/temp/styles.txt`))
                .filter(x => x[0]?.trim().length > 0) // Remove empty lines
                .filter(x => x[0] !== "None") // Remove "None" style
                .map(x => [x[0].trim()]); // Trim name
        } catch (e) {
            console.error("Error loading styles.txt: " + e);
        }
    }
}

function sanitize(tagType, text) {
    if (tagType === ResultType.styleName) {
        if (text.includes(" ")) {
            return `$${lastStyleVarIndex}(${text})`;
        } else {
            return`$${lastStyleVarIndex}${text}`
        }
    }
    return null;
}

PARSERS.push(new StyleParser(STYLE_TRIGGER));

// Add our utility functions to their respective queues
QUEUE_FILE_LOAD.push(load);
QUEUE_SANITIZE.push(sanitize);
