async function load() {
    let modelKeywordParts = (await TacUtils.readFile(`tmp/modelKeywordPath.txt`)).split(",")
    TAC.Globals.modelKeywordPath = modelKeywordParts[0];
    let customFileExists = modelKeywordParts[1] === "True";

    if (TAC.Globals.modelKeywordPath.length > 0 && TAC.Globals.modelKeywordDict.size === 0) {
        try {
            let csv_lines = [];
            // Only add default keywords if wanted by the user
            if (TAC.CFG.modelKeywordCompletion !== "Only user list")
                csv_lines = (await TacUtils.loadCSV(`${TAC.Globals.modelKeywordPath}/lora-keyword.txt`));
            // Add custom user keywords if the file exists
            if (customFileExists)
                csv_lines = csv_lines.concat((await TacUtils.loadCSV(`${TAC.Globals.modelKeywordPath}/lora-keyword-user.txt`)));

            if (csv_lines.length === 0) return;

            csv_lines = csv_lines.filter(x => x[0].trim().length > 0 && x[0].trim()[0] !== "#") // Remove empty lines and comments

            // Add to the dict
            csv_lines.forEach(parts => {
                const hash = parts[0];
                const keywords = parts[1]?.replaceAll("| ", ", ")?.replaceAll("|", ", ")?.trim();
                const lastSepIndex = parts[2]?.lastIndexOf("/") + 1 || parts[2]?.lastIndexOf("\\") + 1 || 0;
                const name = parts[2]?.substring(lastSepIndex).trim() || "none"

                if (TAC.Globals.modelKeywordDict.has(hash) && name !== "none") {
                    // Add a new name key if the hash already exists
                    TAC.Globals.modelKeywordDict.get(hash).set(name, keywords);
                } else {
                    // Create new hash entry
                    let map = new Map().set(name, keywords);
                    TAC.Globals.modelKeywordDict.set(hash, map);
                }
            });
        } catch (e) {
            console.error("Error loading model-keywords list: " + e);
        }
    }
}

TAC.Ext.QUEUE_FILE_LOAD.push(load);