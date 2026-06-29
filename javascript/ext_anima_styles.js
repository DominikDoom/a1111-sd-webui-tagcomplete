const ANIMA_STYLE_REGEX = /^@[^,\s]*/;
const ANIMA_STYLE_TRIGGER = () => TAC_CFG.useAnimaStyles && tagword.match(ANIMA_STYLE_REGEX);

class AnimaStyleParser extends BaseTagParser {
    async parse() {
        await loadAnimaStylesIfNeeded();

        const searchTerm = tagword.slice(1); // Remove leading @
        let tempResults = animaStyles;

        if (searchTerm.length > 0) {
            const regex = new RegExp(escapeRegExp(searchTerm, true), 'i');
            tempResults = animaStyles.filter(x =>
                regex.test(x[0].toLowerCase()) ||
                regex.test(x[0].toLowerCase().replaceAll(" ", "_"))
            );
        }

        return tempResults.map(t => {
            const result = new AutocompleteResult(t[0].trim(), ResultType.animaStyle);
            result.meta = t[1] ? String(t[1]) : "Anima Style";
            result.category = 1; // Artist color coding
            return result;
        });
    }
}

async function loadAnimaStylesIfNeeded(force = false) {
    // BUG-2 guard: runs from QUEUE_FILE_LOAD for every user on every page load.
    // Skip entirely when disabled to avoid a needless readFile 404 and full allTags scan.
    if (!TAC_CFG?.useAnimaStyles) return;

    if (animaStyles.length > 0 && !force) return;

    // BUG-1: readFile returns null on missing file (does NOT throw) and [] for empty file.
    // Check explicitly instead of relying on try/catch.
    const data = await readFile(`${tagBasePath}/temp/anima_styles.json`, true);
    if (data && data.length > 0) {
        animaStyles = data.map(x => [x.name, x.post_count]);
    } else {
        // Fall back to CSV type=1 (Artist) tags
        animaStyles = allTags
            .filter(t => parseInt(t[1]) === 1)
            .map(t => [t[0], t[2]]);
    }
}

function sanitize(tagType, text) {
    if (tagType === ResultType.animaStyle) {
        return `@${text}`;
    }
    return null;
}

PARSERS.push(new AnimaStyleParser(ANIMA_STYLE_TRIGGER));
QUEUE_FILE_LOAD.push(loadAnimaStylesIfNeeded);
QUEUE_SANITIZE.push(sanitize);
