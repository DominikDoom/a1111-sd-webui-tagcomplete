// Utility functions for tag autocomplete

// Parse the CSV file into a 2D array. Doesn't use regex, so it is very lightweight.
// We are ignoring newlines in quote fields since we expect one-line entries and parsing would break for unclosed quotes otherwise
function parseCSV(str) {
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

// Load file
async function readFile(filePath, json = false, cache = false) {
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

// Load CSV
async function loadCSV(path) {
    let text = await readFile(path);
    return parseCSV(text);
}

// Fetch API
async function fetchTacAPI(url, json = true, cache = false) {
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

async function postTacAPI(url, body = null) {
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

async function putTacAPI(url, body = null) {
    let response = await fetch(url, { method: "PUT", body: body });
    
    if (response.status != 200) {
        console.error(`Error putting to API endpoint "${url}": ` + response.status, response.statusText);
        return null;
    }

    return await response.json();
}

// Extra network preview thumbnails
async function getTacExtraNetworkPreviewURL(filename, type) {
    try {
        // Fetch the preview JSON
        const previewJSON = await fetchTacAPI(`tacapi/v1/thumb-preview/${filename}?type=${type}`, true, true);

        if (previewJSON?.url) {
            const properURL = `sd_extra_networks/thumb?filename=${previewJSON.url}`;
            const response = await fetch(properURL);
            if (response.status === 200) {
                return properURL;
            } else {
                const blobResponse = await fetch(`tacapi/v1/thumb-preview-blob/${filename}?type=${type}`);
                if (!blobResponse.ok) {
                    throw new Error('Failed to fetch thumbnail blob.');
                }
                const blob = await blobResponse.blob();
                return URL.createObjectURL(blob);
            }
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching thumbnail:', error);
        return null;
    }
}
lastStyleRefresh = 0;
// Refresh style file if needed
async function refreshStyleNamesIfChanged() {
    // Only refresh once per second
    currentTimestamp = new Date().getTime();
    if (currentTimestamp - lastStyleRefresh < 1000) return;
    lastStyleRefresh = currentTimestamp;

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

// Debounce function to prevent spamming the autocomplete function
var dbTimeOut;
const debounce = (func, wait = 300) => {
    return function (...args) {
        if (dbTimeOut) {
            clearTimeout(dbTimeOut);
        }

        dbTimeOut = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    }
}

// Difference function to fix duplicates not being seen as changes in normal filter
function difference(a, b) {
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

// Object flatten function adapted from https://stackoverflow.com/a/61602592
// $roots keeps previous parent properties as they will be added as a prefix for each prop.
// $sep is just a preference if you want to seperate nested paths other than dot.
function flatten(obj, roots = [], sep = ".") {
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

// Calculate biased tag score based on post count and frequent usage
function calculateUsageBias(result, count, uses) {
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
// Beautify return type for easier parsing
function mapUseCountArray(useCounts, posAndNeg = false) {
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
// Call API endpoint to increase bias of tag in the database
function increaseUseCount(tagName, type, negative = false) {
    postTacAPI(`tacapi/v1/increase-use-count?tagname=${tagName}&ttype=${type}&neg=${negative}`);
}
// Get use count of tag from the database
async function getUseCount(tagName, type, negative = false) {
    const response = await fetchTacAPI(`tacapi/v1/get-use-count?tagname=${tagName}&ttype=${type}&neg=${negative}`, true, false);
    // Guard for no db
    if (response == null) return null;
    // Result
    return response["result"];
}
async function getUseCounts(tagNames, types, negative = false) {
    // While semantically weird, we have to use POST here for the body, as urls are limited in length
    const body = JSON.stringify({"tagNames": tagNames, "tagTypes": types, "neg": negative});
    const response = await postTacAPI(`tacapi/v1/get-use-count-list`, body)
    // Guard for no db
    if (response == null) return null;
    // Results
    return mapUseCountArray(response["result"]);
}
async function getAllUseCounts() {
    const response = await fetchTacAPI(`tacapi/v1/get-all-use-counts`);
    // Guard for no db
    if (response == null) return null;
    // Results
    return mapUseCountArray(response["result"], true);
}
async function resetUseCount(tagName, type, resetPosCount, resetNegCount) {
    await putTacAPI(`tacapi/v1/reset-use-count?tagname=${tagName}&ttype=${type}&pos=${resetPosCount}&neg=${resetNegCount}`);
}

function createTagUsageTable(tagCounts) {
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

// Sliding window function to get possible combination groups of an array
function toNgrams(inputArray, size) {
    return Array.from(
        { length: inputArray.length - (size - 1) }, //get the appropriate length
        (_, index) => inputArray.slice(index, index + size) //create the windows
    );
}

function escapeRegExp(string, wildcardMatching = false) {
    if (wildcardMatching) {
        // Escape all characters except asterisks and ?, which should be treated separately as placeholders.
        return string.replace(/[-[\]{}()+.,\\^$|#\s]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
    }
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
function escapeHTML(unsafeText) {
    let div = document.createElement('div');
    div.textContent = unsafeText;
    return div.innerHTML;
}

// For black/whitelisting
function updateModelName() {
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

// From https://stackoverflow.com/a/61975440, how to detect JS value changes
function observeElement(element, property, callback, delay = 0) {
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

// Sort functions
function getSortFunction() {
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

// Queue calling function to process global queues
async function processQueue(queue, context, ...args) {
    for (let i = 0; i < queue.length; i++) {
        await queue[i].call(context, ...args);
    }
}
// The same but with return values
async function processQueueReturn(queue, context, ...args)
{
    let qeueueReturns = [];
    for (let i = 0; i < queue.length; i++) {
        let returnValue = await queue[i].call(context, ...args);
        if (returnValue)
            qeueueReturns.push(returnValue);
    }
    return qeueueReturns;
}
// Specific to tag completion parsers
async function processParsers(textArea, prompt) {
    // Get all parsers that have a successful trigger condition
    let matchingParsers = PARSERS.filter(parser => parser.triggerCondition());
    // Guard condition
    if (matchingParsers.length === 0) {
        return null;
    }

    let parseFunctions = matchingParsers.map(parser => parser.parse);
    // Process them and return the results
    return await processQueueReturn(parseFunctions, null, textArea, prompt);
}