async function load() {
    let modelKeywordParts = (await readFile(`tmp/modelKeywordPath.txt`)).split(",")
    modelKeywordPath = modelKeywordParts[0];
    let customFileExists = modelKeywordParts[1] === "True";

    if (modelKeywordPath.length > 0 && modelKeywordDict.size === 0) {
        try {
            let lines = (await readFile(`${modelKeywordPath}/lora-keyword.txt`)).split("\n");
            // Add custom user keywords if the file exists
            if (customFileExists)
                lines = lines.concat((await readFile(`${modelKeywordPath}/lora-keyword-user.txt`)).split("\n"));

            lines = lines.filter(x => x.trim().length > 0 && x.trim()[0] !== "#") // Remove empty lines and comments
            
            // Add to the dict
            lines.forEach(line => {
                const parts = line.split(",");
                const hash = parts[0];
                const keywords = parts[1].replaceAll("| ", ", ").replaceAll("|", ", ").trim();

                modelKeywordDict.set(hash, keywords);
            });
        } catch (e) {
            console.error("Error loading model-keywords list: " + e);
        }
    }
}

QUEUE_FILE_LOAD.push(load);