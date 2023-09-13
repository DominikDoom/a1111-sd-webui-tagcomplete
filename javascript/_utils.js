// Utility functions for tag autocomplete

// Parse the CSV file into a 2D array. Doesn't use regex, so it is very lightweight.
function parseCSV(str) {
    var arr = [];
    var quote = false;  // 'true' means we're inside a quoted field

    // Iterate over each character, keep track of current row and column (of the returned array)
    for (var row = 0, col = 0, c = 0; c < str.length; c++) {
        var cc = str[c], nc = str[c + 1];        // Current character, next character
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

        // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
        // and move on to the next row and move to column 0 of that new row
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }

        // If it's a newline (LF or CR) and we're not in a quoted field,
        // move on to the next row and move to column 0 of that new row
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }

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
async function fetchAPI(url, json = true, cache = false) {
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

async function postAPI(url, body) {
    let response = await fetch(url, { method: "POST", body: body });

    if (response.status != 200) {
        console.error(`Error posting to API endpoint "${url}": ` + response.status, response.statusText);
        return null;
    }

    return await response.json();
}

// Extra network preview thumbnails
async function getExtraNetworkPreviewURL(filename, type) {
    const previewJSON = await fetchAPI(`tacapi/v1/thumb-preview/${filename}?type=${type}`, true, true);
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


// Sliding window function to get possible combination groups of an array
function toNgrams(inputArray, size) {
    return Array.from(
        { length: inputArray.length - (size - 1) }, //get the appropriate length
        (_, index) => inputArray.slice(index, index + size) //create the windows
    );
}

function escapeRegExp(string) {
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
    return (a, b) => {
        let textHolderA = a.type === ResultType.chant ? a.aliases : a.text;
        let textHolderB = b.type === ResultType.chant ? b.aliases : b.text;

        switch (criterion) {
            case "Date Modified":
                let aParsed = parseFloat(a.sortKey || "-1");
                let bParsed = parseFloat(b.sortKey || "-1");

                if (aParsed === bParsed) {
                    let aKey = a.sortKey || textHolderA;
                    let bKey = b.sortKey || textHolderB;
                    return aKey.localeCompare(bKey);
                }
                
                return bParsed - aParsed;
            default:
                let aKey = a.sortKey || textHolderA;
                let bKey = b.sortKey || textHolderB;
                return aKey.localeCompare(bKey);
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