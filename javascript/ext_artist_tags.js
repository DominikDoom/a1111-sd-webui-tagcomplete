// Artist (type:1) tag completion via the '@' trigger.
// Filters the already-loaded tag set (allTags) down to artist tags.
// The optional '@' prefix on insertion is handled centrally in insertTextAtCursor
// (TAC_CFG.artistInsertAt), so it composes with the underscore/parenthesis insertion settings.

const ARTIST_TAG_REGEX = /^@[^,\s]*/;
const ARTIST_TAG_TRIGGER = () => TAC_CFG.artistAtTrigger && tagword.match(ARTIST_TAG_REGEX);

class ArtistTagParser extends BaseTagParser {
    parse() {
        const searchTerm = tagword.slice(1); // Remove leading @
        let tempResults = allTags.filter(t => parseInt(t[1]) === 1); // Artist tags only

        if (searchTerm.length > 0) {
            const regex = new RegExp(escapeRegExp(searchTerm, true), 'i');
            const searchByAlias = TAC_CFG.alias.searchByAlias;
            tempResults = tempResults.filter(t =>
                regex.test(t[0].toLowerCase()) ||
                regex.test(t[0].toLowerCase().replaceAll(" ", "_")) ||
                (searchByAlias && t[3] && regex.test(t[3].toLowerCase()))
            );
        }

        // Reuse the normal tag result type so color coding, escaping and frequency tracking
        // behave identically to regular completions. The '@' prefix (if enabled) is added later.
        // result.aliases is intentionally left unset: the '@' in the global tagword would break
        // the alias display matching.
        return tempResults.map(t => {
            const result = new AutocompleteResult(t[0].trim(), ResultType.tag);
            result.category = parseInt(t[1]);
            result.count = t[2];
            return result;
        });
    }
}

PARSERS.push(new ArtistTagParser(ARTIST_TAG_TRIGGER));
