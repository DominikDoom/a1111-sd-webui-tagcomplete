async function load() {
    let modelKeywordParts = (await readFile(`tmp/modelKeywordPath.txt`)).split(",")
    modelKeywordPath = modelKeywordParts[0];
    let customFileExists = modelKeywordParts[1] === "True";

    if (modelKeywordPath.length > 0 && modelKeywordDict.size === 0) {
        try {
            let csv_lines = [];
            // Only add default keywords if wanted by the user
            if (TAC_CFG.modelKeywordCompletion !== "Only user list")
                csv_lines = (await loadCSV(`${modelKeywordPath}/lora-keyword.txt`));
            // Add custom user keywords if the file exists
            if (customFileExists)
                csv_lines = csv_lines.concat((await loadCSV(`${modelKeywordPath}/lora-keyword-user.txt`)));

            if (csv_lines.length === 0) return;

            csv_lines = csv_lines.filter(x => x[0].trim().length > 0 && x[0].trim()[0] !== "#") // Remove empty lines and comments
            console.log(csv_lines)

            // Add to the dict
            csv_lines.forEach(parts => {
                const hash = parts[0];
                const keywords = parts[1].replaceAll("| ", ", ").replaceAll("|", ", ").trim();
                const lastSepIndex = parts[2]?.lastIndexOf("/") + 1 || parts[2]?.lastIndexOf("\\") + 1 || 0;
                const name = parts[2]?.substring(lastSepIndex).trim() || "none"

                if (modelKeywordDict.has(hash) && name !== "none") {
                    // Add a new name key if the hash already exists
                    modelKeywordDict.get(hash).set(name, keywords);
                } else {
                    // Create new hash entry
                    let map = new Map().set(name, keywords);
                    modelKeywordDict.set(hash, map);
                }
            });
        } catch (e) {
            console.error("Error loading model-keywords list: " + e);
        }
    }
}

QUEUE_FILE_LOAD.push(load);