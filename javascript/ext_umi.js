const UMI_PROMPT_REGEX = /<[^\s]*?\[[^,<>]*[\]|]?>?/gi;
const UMI_TAG_REGEX = /(?:\[|\||--)([^<>\[\]\-|]+)/gi;

const UMI_TRIGGER = () => TAC.Globals.CFG.useWildcards && [...TAC.Globals.tagword.matchAll(UMI_PROMPT_REGEX)].length > 0;

class UmiParser extends BaseTagParser {
    parse(textArea, prompt) {
        // We are in a UMI yaml tag definition, parse further
        let umiSubPrompts = [...prompt.matchAll(UMI_PROMPT_REGEX)];

        let umiTags = [];
        let umiTagsWithOperators = []

        const insertAt = (str,char,pos) => str.slice(0,pos) + char + str.slice(pos);

        umiSubPrompts.forEach(umiSubPrompt => {
            umiTags = umiTags.concat([...umiSubPrompt[0].matchAll(UMI_TAG_REGEX)].map(x => x[1].toLowerCase()));

            const start = umiSubPrompt.index;
            const end = umiSubPrompt.index + umiSubPrompt[0].length;
            if (textArea.selectionStart >= start && textArea.selectionStart <= end) {
                umiTagsWithOperators = insertAt(umiSubPrompt[0], '###', textArea.selectionStart - start);
            }
        });

        // Safety check since UMI parsing sometimes seems to trigger outside of an UMI subprompt and thus fails
        if (umiTagsWithOperators.length === 0) {
            return null;
        }

        const promptSplitToTags = umiTagsWithOperators.replace(']###[', '][').split("][");

        const clean = (str) => str
            .replaceAll('>', '')
            .replaceAll('<', '')
            .replaceAll('[', '')
            .replaceAll(']', '')
            .trim();

        const matches = promptSplitToTags.reduce((acc, curr) => {
            let isOptional = curr.includes("|");
            let isNegative = curr.startsWith("--");
            let out;
            if (isOptional) {
                out = {
                    hasCursor: curr.includes("###"),
                    tags: clean(curr).split('|').map(x => ({ 
                        hasCursor: x.includes("###"), 
                        isNegative: x.startsWith("--"),
                        tag: clean(x).replaceAll("###", '').replaceAll("--", '')
                    }))
                };
                acc.optional.push(out);
                acc.all.push(...out.tags.map(x => x.tag));
            } else if (isNegative) {
                out = {
                    hasCursor: curr.includes("###"),
                    tags: clean(curr).replaceAll("###", '').split('|'),
                };
                out.tags = out.tags.map(x => x.startsWith("--") ? x.substring(2) : x);
                acc.negative.push(out);
                acc.all.push(...out.tags);
            } else {
                out = {
                    hasCursor: curr.includes("###"),
                    tags: clean(curr).replaceAll("###", '').split('|'),
                };
                acc.positive.push(out);
                acc.all.push(...out.tags);
            }
            return acc;
        }, { positive: [], negative: [], optional: [], all: [] });

        //console.log({ matches })

        const filteredWildcards = (tagword) => {
            const wildcards = TAC.Globals.umiWildcards.filter(x => {
                let tags = x[1];
                const matchesNeg =
                    matches.negative.length === 0
                    || matches.negative.every(x => 
                        x.hasCursor 
                        || x.tags.every(t => !tags[t])
                    );
                if (!matchesNeg) return false;
                const matchesPos =
                    matches.positive.length === 0
                    || matches.positive.every(x =>
                        x.hasCursor
                        || x.tags.every(t => tags[t])
                    );
                if (!matchesPos) return false;
                const matchesOpt =
                    matches.optional.length === 0
                    || matches.optional.some(x =>
                        x.tags.some(t =>
                            t.hasCursor
                            || t.isNegative
                                ? !tags[t.tag]
                                : tags[t.tag]
                    ));
                if (!matchesOpt) return false;
                return true;
            }).reduce((acc, val) => {
                Object.keys(val[1]).forEach(tag => acc[tag] = acc[tag] + 1 || 1);
                return acc;
            }, {});

            return Object.entries(wildcards)
                .sort((a, b) => b[1] - a[1])
                .filter(x =>
                    x[0] === tagword
                    || !matches.all.includes(x[0])
                );
        }

        if (umiTags.length > 0) {
            // Get difference for subprompt
            let tagCountChange = umiTags.length - TAC.Globals.umiPreviousTags.length;
            let diff = TacUtils.difference(umiTags, TAC.Globals.umiPreviousTags);
            TAC.Globals.umiPreviousTags = umiTags;

            // Show all condition
            let showAll = TAC.Globals.tagword.endsWith("[") || TAC.Globals.tagword.endsWith("[--") || TAC.Globals.tagword.endsWith("|");

            // Exit early if the user closed the bracket manually
            if ((!diff || diff.length === 0 || (diff.length === 1 && tagCountChange < 0)) && !showAll) {
                if (!TAC.Globals.hideBlocked) hideResults(textArea);
                return;
            }

            let umiTagword = tagCountChange < 0 ? '' : diff[0] || '';
            let tempResults = [];
            if (umiTagword && umiTagword.length > 0) {
                umiTagword = umiTagword.toLowerCase().replace(/[\n\r]/g, "");
                TAC.Globals.originalTagword = TAC.Globals.tagword;
                TAC.Globals.tagword = umiTagword;
                let filteredWildcardsSorted = filteredWildcards(umiTagword);
                let searchRegex = new RegExp(`(^|[^a-zA-Z])${TacUtils.escapeRegExp(umiTagword)}`, 'i')
                let baseFilter = x => x[0].toLowerCase().search(searchRegex) > -1;
                let spaceIncludeFilter = x => x[0].toLowerCase().replaceAll(" ", "_").search(searchRegex) > -1;
                tempResults = filteredWildcardsSorted.filter(x => baseFilter(x) || spaceIncludeFilter(x)) // Filter by tagword

                // Add final results
                let finalResults = [];
                tempResults.forEach(t => {
                    let result = new AutocompleteResult(t[0].trim(), ResultType.umiWildcard)
                    result.count = t[1];
                    finalResults.push(result);
                });

                finalResults = finalResults.sort((a, b) => b.count - a.count);
                return finalResults;
            } else if (showAll) {
                let filteredWildcardsSorted = filteredWildcards("");

                // Add final results
                let finalResults = [];
                filteredWildcardsSorted.forEach(t => {
                    let result = new AutocompleteResult(t[0].trim(), ResultType.umiWildcard)
                    result.count = t[1];
                    finalResults.push(result);
                });

                TAC.Globals.originalTagword = TAC.Globals.tagword;
                TAC.Globals.tagword = "";

                finalResults = finalResults.sort((a, b) => b.count - a.count);
                return finalResults;
            }
        } else {
            let filteredWildcardsSorted = filteredWildcards("");

            // Add final results
            let finalResults = [];
            filteredWildcardsSorted.forEach(t => {
                let result = new AutocompleteResult(t[0].trim(), ResultType.umiWildcard)
                result.count = t[1];
                finalResults.push(result);
            });

            TAC.Globals.originalTagword = TAC.Globals.tagword;
            TAC.Globals.tagword = "";

            finalResults = finalResults.sort((a, b) => b.count - a.count);
            return finalResults;
        }
    }
}

function updateUmiTags(tagType, sanitizedText, newPrompt, textArea) {
    // If it was a umi wildcard, also update the TAC.Globals.umiPreviousTags
    if (tagType === ResultType.umiWildcard && TAC.Globals.originalTagword.length > 0) {
        let umiSubPrompts = [...newPrompt.matchAll(UMI_PROMPT_REGEX)];

        let umiTags = [];
        umiSubPrompts.forEach(umiSubPrompt => {
            umiTags = umiTags.concat([...umiSubPrompt[0].matchAll(UMI_TAG_REGEX)].map(x => x[1].toLowerCase()));
        });

        TAC.Globals.umiPreviousTags = umiTags;

        hideResults(textArea);

        return true;
    }
    return false;
}

async function load() {
    if (TAC.Globals.umiWildcards.length === 0) {
        try {
            let umiTags = (await TacUtils.readFile(`${TAC.Globals.tagBasePath}/temp/umi_tags.txt`)).split("\n");
            // Split into tag, count pairs
            TAC.Globals.umiWildcards = umiTags.map(x => x
                .trim()
                .split(","))
                .map(([i, ...rest]) => [
                    i,
                    rest.reduce((a, b) => {
                        a[b.toLowerCase()] = true;
                        return a;
                    }, {}),
                ]);
        } catch (e) {
            console.error("Error loading umi wildcards: " + e);
        }
    }
}

function sanitize(tagType, text) {
    // Replace underscores only if the umi tag is not using them
    if (tagType === ResultType.umiWildcard && !TAC.Globals.umiWildcards.includes(text)) {
        return text.replaceAll("_", " "); 
    }
    return null;
}

// Add UMI parser
TAC.Ext.PARSERS.push(new UmiParser(UMI_TRIGGER));

// Add our utility functions to their respective queues
TAC.Ext.QUEUE_FILE_LOAD.push(load);
TAC.Ext.QUEUE_SANITIZE.push(sanitize);
TAC.Ext.QUEUE_AFTER_INSERT.push(updateUmiTags);