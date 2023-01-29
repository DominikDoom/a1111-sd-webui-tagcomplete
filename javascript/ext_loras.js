const LORA_REGEX = /<(?!e:|h:)[^,> ]*>?/g;
const LORA_TRIGGER = () => CFG.useLoras && tagword.match(LORA_REGEX);

class LoraParser extends BaseTagParser {
    parse() {
        // Show lora
        let tempResults = [];
        if (tagword !== "<" && tagword !== "<l:") {
            let searchTerm = tagword.replace("<l:", "").replace("<", "");
            tempResults = loras.filter(x => x.toLowerCase().includes(searchTerm)); // Filter by tagword
        } else {
            tempResults = loras;
        }

        // Add final results
        let finalResults = [];
        tempResults.forEach(t => {
            let result = new AutocompleteResult(t.trim(), ResultType.lora)
            result.meta = "Lora";
            finalResults.push(result);
        });

        return finalResults;
    }
}

PARSERS.push(new LoraParser(LORA_TRIGGER));