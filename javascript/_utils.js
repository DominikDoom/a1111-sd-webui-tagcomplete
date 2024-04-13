// Utility functions for tag autocomplete

class TacUtils {
    /**
     * Parses a CSV file into a 2D array. Doesn't use regex, so it is very lightweight.
     * We are ignoring newlines in quote fields since we expect one-line entries and parsing would break for unclosed quotes otherwise
     * @param {String} str - The CSV string to parse (likely from a file with multiple lines)
     * @returns {string[][]} A 2D array of CSV entries (rows and columns of that row)
     */
    static parseCSV(str) {
        const arr = [];
        let quote = false;  // 'true' means we're inside a quoted field

        // Iterate over each character, keep track of current row and column (of the returned array)
        for (let row = 0, col = 0, c = 0; c < str.length; c++) {
            let cc = str[c], nc = str[c+1];        // Current character, next character
            arr[row] = arr[row] || [];             // Create a new row if necessary
            arr[row][col] = arr[row][col] || '';   // Create a new column (start with empty string) if necessary

            // If the current character is a quotation mark, and we're inside a
            // quoted field, and the next character is also a quotation mark,
            // add a quotation mark to the current column and skip the next character
            if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }

            // If it's just one quotation mark, begin/end quoted field
            if (cc == '"') { quote = !quote; continue; }

            // If it's a comma and we're not in a quoted field, move on to the next column
            if (cc == ',' && !quote) { ++col; continue; }

            // If it's a newline (CRLF), skip the next character and move on to the next row and move to column 0 of that new row
            if (cc == '\r' && nc == '\n') { ++row; col = 0; ++c; quote = false; continue; }

            // If it's a newline (LF or CR) move on to the next row and move to column 0 of that new row
            if (cc == '\n') { ++row; col = 0; quote = false; continue; }
            if (cc == '\r') { ++row; col = 0; quote = false; continue; }

            // Otherwise, append the current character to the current column
            arr[row][col] += cc;
        }
        return arr;
    }

    /** Wrapper function to read a file from a path, using Gradio's "file="" accessor API
     * @param {String} filePath - The path to the file
     * @param {Boolean} json - Whether to parse the file as JSON
     * @param {Boolean} cache - Whether to cache the response
     * @returns {Promise<String | any>} The file content as a string or JSON object (if json is true)
     */
    static async readFile(filePath, json = false, cache = false) {
        if (!cache)
            filePath += `?${new Date().getTime()}`;

        let response = await fetch(`file=${filePath}`);

        if (response.status != 200) {
            console.error(`Error loading file "${filePath}": ` + response.status, response.statusText);
            return null;
        }

        if (json)
            return await response.json();
        else
            return await response.text();
    }

    /** Wrapper function to read a file from the path and parse it as CSV
     * @param {String} path - The path to the CSV file
     * @returns {Promise<String[][]>} A 2D array of CSV entries
     */
    static async loadCSV(path) {
        let text = await this.readFile(path);
        return this.parseCSV(text);
    }

    /**
     * Calls the TAC API for a GET request
     * @param {String} url - The URL to fetch from
     * @param {Boolean} json - Whether to parse the response as JSON or plain text
     * @param {Boolean} cache - Whether to cache the response
     * @returns {Promise<any | String>} JSON or text response from the API, depending on the "json" parameter
     */
    static async fetchAPI(url, json = true, cache = false) {
        if (!cache) {
            const appendChar = url.includes("?") ? "&" : "?";
            url += `${appendChar}${new Date().getTime()}`
        }

        let response = await fetch(url);

        if (response.status != 200) {
            console.error(`Error fetching API endpoint "${url}": ` + response.status, response.statusText);
            return null;
        }

        if (json)
            return await response.json();
        else
            return await response.text();
    }

    /**
     * Posts to the TAC API
     * @param {String} url - The URL to post to
     * @param {String} body - (optional) The body of the POST request as a JSON string
     * @returns JSON response from the API
     */
    static async postAPI(url, body = null) {
        let response = await fetch(url, {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: body
        });

        if (response.status != 200) {
            console.error(`Error posting to API endpoint "${url}": ` + response.status, response.statusText);
            return null;
        }

        return await response.json();
    }

    /**
     * Puts to the TAC API
     * @param {String} url - The URL to post to
     * @param {String} body - (optional) The body of the PUT request as a JSON string
     * @returns JSON response from the API
     */
    static async putAPI(url, body = null) {
        let response = await fetch(url, { method: "PUT", body: body });
        
        if (response.status != 200) {
            console.error(`Error putting to API endpoint "${url}": ` + response.status, response.statusText);
            return null;
        }

        return await response.json();
    }

    /**
     * Get a preview image URL for a given extra network file.
     * Uses the official webui endpoint if available, otherwise creates a blob URL.
     * @param {String} filename - The filename of the extra network file
     * @param {String} type - One of "embed", "hyper", "lora", or "lyco", to determine the lookup location
     * @returns {Promise<String>} URL to a preview image for the extra network file, if available
     */
    static async getExtraNetworkPreviewURL(filename, type) {
        const previewJSON = await this.fetchAPI(`tacapi/v1/thumb-preview/${filename}?type=${type}`, true, true);
        if (previewJSON?.url) {
            const properURL = `sd_extra_networks/thumb?filename=${previewJSON.url}`;
            if ((await fetch(properURL)).status == 200) {
                return properURL;
            } else {
                // create blob url
                const blob = await (await fetch(`tacapi/v1/thumb-preview-blob/${filename}?type=${type}`)).blob();
                return URL.createObjectURL(blob);
            }
        } else {
            return null;
        }
    }

    static lastStyleRefresh = 0;
    /**
     * Refreshes the styles.txt file if it has changed since the last check.
     * Checks at most once per second to prevent spamming the API.
     */
    static async refreshStyleNamesIfChanged() {
        // Only refresh once per second
        let currentTimestamp = new Date().getTime();
        if (currentTimestamp - lastStyleRefresh < 1000) return;
        this.lastStyleRefresh = currentTimestamp;

        const response = await fetch(`tacapi/v1/refresh-styles-if-changed?${new Date().getTime()}`)
        if (response.status === 304) {
            // Not modified
        } else if (response.status === 200) {
            // Reload
            QUEUE_FILE_LOAD.forEach(async fn => {
                if (fn.toString().includes("styleNames"))
                    await fn.call(null, true);
            })
        } else {
            // Error
            console.error(`Error refreshing styles.txt: ` + response.status, response.statusText);
        }
    }

    static dbTimeOut;
    /**
     * Generic debounce function to prevent spamming the autocompletion during fast typing
     * @param {Function} func - The function to debounce
     * @param {Number} wait - The debounce time in milliseconds
     * @returns {Function} The debounced function
     */
    static debounce = (func, wait = 300) => {
        return function (...args) {
            if (this.dbTimeOut) {
                clearTimeout(this.dbTimeOut);
            }

            this.dbTimeOut = setTimeout(() => {
                func.apply(this, args);
            }, wait);
        }
    }

    /**
     * Calculates the difference between two arrays (order-sensitive).
     * Fixes duplicates not being seen as changes in a normal filter function.
     * @param {Array} a 
     * @param {Array} b 
     * @returns {Array} The difference between the two arrays
     */
    static difference(a, b) {
        if (a.length == 0) {
            return b;
        }
        if (b.length == 0) {
            return a;
        }

        return [...b.reduce((acc, v) => acc.set(v, (acc.get(v) || 0) - 1),
            a.reduce((acc, v) => acc.set(v, (acc.get(v) || 0) + 1), new Map())
        )].reduce((acc, [v, count]) => acc.concat(Array(Math.abs(count)).fill(v)), []);
    }

    /**
     * Object flatten function adapted from https://stackoverflow.com/a/61602592
     * @param {*} obj - The object to flatten
     * @param {Array} roots - Keeps previous parent properties as they will be added as a prefix for each prop.
     * @param {String} sep - Just a preference if you want to seperate nested paths other than dot.
     * @returns The flattened object
     */
    static flatten(obj, roots = [], sep = ".") {
        return Object.keys(obj).reduce(
            (memo, prop) =>
            Object.assign(
                // create a new object
                {},
                // include previously returned object
                memo,
                Object.prototype.toString.call(obj[prop]) === "[object Object]"
                ? // keep working if value is an object
                    flatten(obj[prop], roots.concat([prop]), sep)
                : // include current prop and value and prefix prop with the roots
                    { [roots.concat([prop]).join(sep)]: obj[prop] }
            ),
            {}
        );
    }

    /**
     * Calculate biased tag score based on post count and frequent usage
     * @param {AutocompleteResult} result - The unbiased result
     * @param {Number} count - The post count (or similar base metric)
     * @param {Number} uses - The usage count
     * @returns {Number} The biased score for sorting
     */
    static calculateUsageBias(result, count, uses) {
        // Check setting conditions
        if (uses < TAC_CFG.frequencyMinCount) {
            uses = 0;
        } else if (uses != 0) {
            result.usageBias = true;
        }

        switch (TAC_CFG.frequencyFunction) {
            case "Logarithmic (weak)":
                return Math.log(1 + count) + Math.log(1 + uses);
            case "Logarithmic (strong)":
                return Math.log(1 + count) + 2 * Math.log(1 + uses);
            case "Usage first":
                return uses;
            default:
                return count;
        }
    }
    /**
     * Utility function to map the use count array from the database to a more readable format,
     * since FastAPI omits the field names in the response.
     * @param {Array} useCounts 
     * @param {Boolean} posAndNeg - Whether to include negative counts
     */
    static mapUseCountArray(useCounts, posAndNeg = false) {
        return useCounts.map(useCount => {
            if (posAndNeg) {
                return {
                    "name": useCount[0],
                    "type": useCount[1],
                    "count": useCount[2],
                    "negCount": useCount[3],
                    "lastUseDate": useCount[4]
                }
            }
            return {
                "name": useCount[0],
                "type": useCount[1],
                "count": useCount[2],
                "lastUseDate": useCount[3]
            }
        });
    }
    /**
     * Calls API endpoint to increase the count of a tag in the database.
     * Not awaited as it is non-critical and can be executed as fire-and-forget.
     * @param {String} tagName - The name of the tag 
     * @param {ResultType} type - The type of the tag as mapped in {@link ResultType}
     * @param {Boolean} negative - Whether the tag was typed in a negative prompt field
     */
    static increaseUseCount(tagName, type, negative = false) {
        this.postAPI(`tacapi/v1/increase-use-count?tagname=${tagName}&ttype=${type}&neg=${negative}`);
    }

    /**
     * Get the use count of a tag from the database
     * @param {String} tagName - The name of the tag
     * @param {ResultType} type - The type of the tag as mapped in {@link ResultType}
     * @param {Boolean} negative - Whether we are currently in a negative prompt field
     * @returns {Promise<Number>} The use count of the tag
     */
    static async getUseCount(tagName, type, negative = false) {
        return (await this.fetchAPI(`tacapi/v1/get-use-count?tagname=${tagName}&ttype=${type}&neg=${negative}`, true, false))["result"];
    }
    /**
     * Retrieves the use counts of multiple tags at once from the database for improved performance
     * during typing.
     * @param {String[]} tagNames - An array of tag names
     * @param {ResultType[]} types - An array of tag types as mapped in {@link ResultType}
     * @param {Boolean} negative - Whether we are currently in a negative prompt field
     * @returns {Promise<Array>} The use count array mapped to named fields by {@link mapUseCountArray}
     */
    static async getUseCounts(tagNames, types, negative = false) {
        // While semantically weird, we have to use POST here for the body, as urls are limited in length
        const body = JSON.stringify({"tagNames": tagNames, "tagTypes": types, "neg": negative});
        const rawArray = (await this.postAPI(`tacapi/v1/get-use-count-list`, body))["result"]
        return this.mapUseCountArray(rawArray);
    }
    /**
     * Gets all use counts existing in the database.
     * @returns {Array} The use count array mapped to named fields by {@link mapUseCountArray}
     */
    static async getAllUseCounts() {
        const rawArray = (await this.fetchAPI(`tacapi/v1/get-all-use-counts`))["result"];
        return this.mapUseCountArray(rawArray, true);
    }
    /**
     * Resets the use count of the given tag back to zero.
     * @param {String} tagName - The name of the tag
     * @param {ResultType} type - The type of the tag as mapped in {@link ResultType}
     * @param {Boolean} resetPosCount - Whether to reset the positive count
     * @param {Boolean} resetNegCount - Whether to reset the negative count
     */
    static async resetUseCount(tagName, type, resetPosCount, resetNegCount) {
        await TacUtils.putAPI(`tacapi/v1/reset-use-count?tagname=${tagName}&ttype=${type}&pos=${resetPosCount}&neg=${resetNegCount}`);
    }

    /**
     * Creates a table to display an overview of tag usage statistics.
     * Currently unused.
     * @param {Array} tagCounts - The use count array to use, mapped to named fields by {@link mapUseCountArray} 
     * @returns 
     */
    static createTagUsageTable(tagCounts) {
        // Create table
        let tagTable = document.createElement("table");
        tagTable.innerHTML =
        `<thead>
            <tr>
                <td>Name</td>
                <td>Type</td>
                <td>Count(+)</td>
                <td>Count(-)</td>
                <td>Last used</td>
            </tr>
        </thead>`;
        tagTable.id = "tac_tagUsageTable"

        tagCounts.forEach(t => {
            let tr = document.createElement("tr");
            
            // Fill values
            let values = [t.name, t.type-1, t.count, t.negCount, t.lastUseDate]
            values.forEach(v => {
                let td = document.createElement("td");
                td.innerText = v;
                tr.append(td);
            });
            // Add delete/reset button
            let delButton = document.createElement("button");
            delButton.innerText = "🗑️";
            delButton.title = "Reset count";
            tr.append(delButton);
            
            tagTable.append(tr)
        });

        return tagTable;
    }

    /**
     * Sliding window function to get possible combination groups of an array
     * @param {Array} inputArray 
     * @param {Number} size 
     * @returns {Array[]} ngram permutations of the input array
     */
    static toNgrams(inputArray, size) {
        return Array.from(
            { length: inputArray.length - (size - 1) }, //get the appropriate length
            (_, index) => inputArray.slice(index, index + size) //create the windows
        );
    }

    /**
     * Escapes a string for use in a regular expression.
     * @param {String} string 
     * @param {Boolean} wildcardMatching - Wildcard matching mode doesn't escape asterisks and question marks as they are handled separately there. 
     * @returns {String} The escaped string
     */
    static escapeRegExp(string, wildcardMatching = false) {
        if (wildcardMatching) {
            // Escape all characters except asterisks and ?, which should be treated separately as placeholders.
            return string.replace(/[-[\]{}()+.,\\^$|#\s]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
        }
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }
    /**
     * Escapes a string for use in HTML to not break formatting.
     * @param {String} unsafeText 
     * @returns {String} The escaped HTML string
     */
    static escapeHTML(unsafeText) {
        let div = document.createElement('div');
        div.textContent = unsafeText;
        return div.innerHTML;
    }

    /** Updates {@link currentModelName} to the current model */
    static updateModelName() {
        let sdm = gradioApp().querySelector("#setting_sd_model_checkpoint");
        let modelDropdown =  sdm?.querySelector("input") || sdm?.querySelector("select");
        if (modelDropdown) {
            currentModelName = modelDropdown.value;
        } else {
            // Fallback for intermediate versions
            modelDropdown = sdm?.querySelector("span.single-select");
            currentModelName = modelDropdown?.textContent || "";
        }
    }

    /**
     * From https://stackoverflow.com/a/61975440.
     * Detects value changes in an element that were triggered programmatically
     * @param {HTMLElement} element - The DOM element to observe
     * @param {String} property - The object property to observe 
     * @param {Function} callback - The callback function to call when the property changes
     * @param {Number} delay - The delay in milliseconds to wait before calling the callback
     */
    static observeElement(element, property, callback, delay = 0) {
        let elementPrototype = Object.getPrototypeOf(element);
        if (elementPrototype.hasOwnProperty(property)) {
            let descriptor = Object.getOwnPropertyDescriptor(elementPrototype, property);
            Object.defineProperty(element, property, {
                get: function() {
                    return descriptor.get.apply(this, arguments);
                },
                set: function () {
                    let oldValue = this[property];
                    descriptor.set.apply(this, arguments);
                    let newValue = this[property];
                    if (typeof callback == "function") {
                        setTimeout(callback.bind(this, oldValue, newValue), delay);
                    }
                    return newValue;
                }
            });
        }
    }

    /**
     * Returns a matching sort function based on the current configuration
     * @returns {((a: any, b: any) => number)}
     */
    static getSortFunction() {
        let criterion = TAC_CFG.modelSortOrder || "Name";

        const textSort = (a, b, reverse = false) => {
            // Assign keys so next sort is faster
            if (!a.sortKey) {
                a.sortKey = a.type === ResultType.chant
                    ? a.aliases
                    : a.text;
            }
            if (!b.sortKey) {
                b.sortKey = b.type === ResultType.chant
                    ? b.aliases
                    : b.text;
            }

            return reverse ? b.sortKey.localeCompare(a.sortKey) : a.sortKey.localeCompare(b.sortKey);
        }
        const numericSort = (a, b, reverse = false) => {
            const noKey = reverse ? "-1" : Number.MAX_SAFE_INTEGER;
            let aParsed = parseFloat(a.sortKey || noKey);
            let bParsed = parseFloat(b.sortKey || noKey);

            if (aParsed === bParsed) {
                return textSort(a, b, false);
            }
            
            return reverse ? bParsed - aParsed : aParsed - bParsed;
        }

        return (a, b) => {
            switch (criterion) {
                case "Date Modified (newest first)":
                    return numericSort(a, b, true);
                case "Date Modified (oldest first)":
                    return numericSort(a, b, false);
                default:
                    return textSort(a, b);
            }
        }
    }

    /**
     * Queue calling function to process global queues
     * @param {Array} queue - The queue to process
     * @param {*} context - The context to call the functions in (null for global)
     * @param  {...any} args - Arguments to pass to the functions
     */
    static async processQueue(queue, context, ...args) {
        for (let i = 0; i < queue.length; i++) {
            await queue[i].call(context, ...args);
        }
    }
    /** The same as {@link processQueue}, but can accept and return results from the queued functions. */
    static async processQueueReturn(queue, context, ...args)
    {
        let qeueueReturns = [];
        for (let i = 0; i < queue.length; i++) {
            let returnValue = await queue[i].call(context, ...args);
            if (returnValue)
                qeueueReturns.push(returnValue);
        }
        return qeueueReturns;
    }
    /**
     * A queue processing function specific to tag completion parsers
     * @param {HTMLTextAreaElement} textArea - The current text area used by TAC
     * @param {String} prompt - The current prompt
     * @returns The results of the parsers
     */
    static async processParsers(textArea, prompt) {
        // Get all parsers that have a successful trigger condition
        let matchingParsers = PARSERS.filter(parser => parser.triggerCondition());
        // Guard condition
        if (matchingParsers.length === 0) {
            return null;
        }

        let parseFunctions = matchingParsers.map(parser => parser.parse);
        // Process them and return the results
        return await this.processQueueReturn(parseFunctions, null, textArea, prompt);
    }
}