// Style for new elements. Gets appended to the Gradio root.
const autocompleteCSS_dark = `
    #autocompleteResults {
        position: absolute;
        z-index: 999;
        margin: 5px 0 0 0;
        background-color: #0b0f19 !important;
        border: 1px solid #4b5563 !important;
        border-radius: 12px !important;
        overflow: hidden;
    }
    #autocompleteResultsList > li:nth-child(odd) {
        background-color: #111827;
    }
    #autocompleteResultsList > li {
        list-style-type: none;
        padding: 10px;
        cursor: pointer;
    }
    #autocompleteResultsList > li:hover {
        background-color: #1f2937;
    }
    #autocompleteResultsList > li.selected {
        background-color: #374151;
    }
`;
const autocompleteCSS_light = `
    #autocompleteResults {
        position: absolute;
        z-index: 999;
        margin: 5px 0 0 0;
        background-color: #ffffff !important;
        border: 1.5px solid #e5e7eb !important;
        border-radius: 12px !important;
        overflow: hidden;
    }
    #autocompleteResultsList > li:nth-child(odd) {
        background-color: #f9fafb;
    }
    #autocompleteResultsList > li {
        list-style-type: none;
        padding: 10px;
        cursor: pointer;
    }
    #autocompleteResultsList > li:hover {
        background-color: #f5f6f8;
    }
    #autocompleteResultsList > li.selected {
        background-color: #e5e7eb;
    }
`;

var acConfig = null;

// Parse the CSV file into a 2D array. Doesn't use regex, so it is very lightweight.
function parseCSV(str) {
    var arr = [];
    var quote = false;  // 'true' means we're inside a quoted field

    // Iterate over each character, keep track of current row and column (of the returned array)
    for (var row = 0, col = 0, c = 0; c < str.length; c++) {
        var cc = str[c], nc = str[c+1];        // Current character, next character
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
function readFile(filePath) {
    let request = new XMLHttpRequest();
    request.open("GET", filePath, false);
    request.send(null);
    return request.responseText;
}

function loadCSV() {
    let text = readFile(`file/tags/${acConfig.tagFile}`);
    return parseCSV(text);
}

// Debounce function to prevent spamming the autocomplete function
var dbTimeOut;
const debounce = (func, wait = 300) => {
    return function(...args) {
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

    return [...b.reduce( (acc, v) => acc.set(v, (acc.get(v) || 0) - 1),
            a.reduce( (acc, v) => acc.set(v, (acc.get(v) || 0) + 1), new Map() ) 
    )].reduce( (acc, [v, count]) => acc.concat(Array(Math.abs(count)).fill(v)), [] );
}

// Create the result list div and necessary styling
function createResultsDiv() {
    let resultsDiv = document.createElement("div");
    let resultsList = document.createElement('ul');
    
    resultsDiv.setAttribute('id', 'autocompleteResults');
    resultsList.setAttribute('id', 'autocompleteResultsList');
    resultsDiv.appendChild(resultsList);

    return resultsDiv;
}

// The selected tag index. Needs to be up here so hide can access it.
var selectedTag = null;

// Show or hide the results div
var isVisible = false;
function showResults() {
    let resultsDiv = gradioApp().querySelector('#autocompleteResults');
    resultsDiv.style.display = "block";
    isVisible = true;
}
function hideResults() {
    let resultsDiv = gradioApp().querySelector('#autocompleteResults');
    resultsDiv.style.display = "none";
    isVisible = false;
    selectedTag = null;
}

// On click, insert the tag into the prompt textbox with respect to the cursor position
function insertTextAtCursor(text, tagword) {
    let promptTextbox = gradioApp().querySelector('#txt2img_prompt > label > textarea');
    let cursorPos = promptTextbox.selectionStart;
    let sanitizedText = acConfig.replaceUnderscores ? text.replaceAll("_", " ") : text;
    
    var prompt = promptTextbox.value;
    let optionalComma = (prompt[cursorPos] === "," || prompt[cursorPos + tagword.length] === ",") ? "" : ", ";

    // Edit prompt text
    let direction = prompt.substring(cursorPos, cursorPos + tagword.length) === tagword ? 1 : -1;
    if (direction === 1) {
        promptTextbox.value = prompt.substring(0, cursorPos) + sanitizedText + optionalComma + prompt.substring(cursorPos + tagword.length)
    } else {  
        promptTextbox.value = prompt.substring(0, cursorPos - tagword.length) + sanitizedText + optionalComma + prompt.substring(cursorPos)
    }
    prompt = promptTextbox.value;

    // Update cursor position to after the inserted text
    promptTextbox.selectionStart = cursorPos + sanitizedText.length;
    promptTextbox.selectionEnd = promptTextbox.selectionStart;

    // Hide results after inserting
    hideResults();

    // Update previous tags with the edited prompt to prevent re-searching the same term
    let tags = prompt.match(/[^, ]+/g);
    previousTags = tags;
}

function addResultsToList(results, tagword) {
    let resultsList = gradioApp().querySelector('#autocompleteResultsList');
    resultsList.innerHTML = "";

    // Find right colors from config
    let tagFileName = acConfig.tagFile.split(".")[0];
    let tagColors = acConfig.colors;
    //let colorIndex = Object.keys(tagColors).findIndex(key => key === tagFileName);
    //let colorValues = Object.values(tagColors)[colorIndex];

    let mode = gradioApp().querySelector('.dark') ? 0 : 1;

    for (let i = 0; i < results.length; i++) {
        let result = results[i];
        let li = document.createElement("li");
        li.innerHTML = result[0];

        // Set the color of the tag
        let tagType = result[1];
        li.style = `color: ${tagColors[tagFileName][tagType][mode]};`;
        // Add listener
        li.addEventListener("click", function() { insertTextAtCursor(result[0], tagword); });
        // Add element to list
        resultsList.appendChild(li);
    }
}

function updateSelectionStyle(num) {
    let resultsList = gradioApp().querySelector('#autocompleteResultsList');
    let items = resultsList.getElementsByTagName('li');

    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove('selected');
    }

    items[num].classList.add('selected');
}

allTags = [];
previousTags = [];
results = [];
tagword = "";
resultCount = 0;
function autocomplete(prompt) {
    // Guard for empty prompt
    if (prompt.length === 0) {
        hideResults();
        return;
    }

    // Match tags with RegEx to get the last edited one
    let tags = prompt.match(/[^, ]+/g);
    let diff = difference(tags, previousTags)
    previousTags = tags;

    // Guard for no difference / only whitespace remaining
    if (diff === undefined || diff.length === 0) {
        hideResults();
        return;
    }

    tagword = diff[0]

    // Guard for empty tagword
    if (tagword === undefined || tagword.length === 0) {
        hideResults();
        return;
    }
    
    results = allTags.filter(x => x[0].includes(tagword)).slice(0, acConfig.maxResults);
    resultCount = results.length;

    // Guard for empty results
    if (resultCount === 0) {
        hideResults();
        return;
    }

    showResults();
    addResultsToList(results, tagword);
}

function navigateInList(event) {
    validKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Escape"];

    if (!validKeys.includes(event.key)) return;
    if (!isVisible) return

    switch (event.key) {
        case "ArrowUp":
            if (selectedTag === null) {
                selectedTag = resultCount - 1;
            } else {
                selectedTag = (selectedTag - 1 + resultCount) % resultCount;
            }
            break;
        case "ArrowDown":
            if (selectedTag === null) {
                selectedTag = 0;
            } else {
                selectedTag = (selectedTag + 1) % resultCount;
            }
            break;
        case "ArrowLeft":
            selectedTag = 0;
            break;
        case "ArrowRight":
            selectedTag = resultCount - 1;
            break;
        case "Enter":
            if (selectedTag !== null) {
                insertTextAtCursor(results[selectedTag][0], tagword);
            }
            break;
        case "Escape":
            hideResults();
            break;
    }
    // Update highlighting
    if (selectedTag !== null)
        updateSelectionStyle(selectedTag);

    // Prevent default behavior
    event.preventDefault();
    event.stopPropagation();
}

onUiUpdate(function(){
    // One-time CSV setup
    if (acConfig === null) acConfig = JSON.parse(readFile("file/tags/config.json"));
    if (allTags.length === 0) allTags = loadCSV();

	let promptTextbox = gradioApp().querySelector('#txt2img_prompt > label > textarea');
	
    if (promptTextbox === null) return;
    if (gradioApp().querySelector('#autocompleteResults') != null) return;

    // Only add listeners once
    if (!promptTextbox.classList.contains('autocomplete')) {
        // Add our new element
        var resultsDiv = gradioApp().querySelector('#autocompleteResults') ?? createResultsDiv();
        promptTextbox.parentNode.insertBefore(resultsDiv, promptTextbox.nextSibling);
        // Hide by default so it doesn't show up on page load
        hideResults();
        
        // Add autocomplete event listener
        promptTextbox.addEventListener('input', debounce(() => autocomplete(promptTextbox.value), 100));
        // Add focusout event listener
        promptTextbox.addEventListener('focusout', debounce(() => hideResults(), 400));
        // Add up and down arrow event listener
        promptTextbox.addEventListener('keydown', (e) => navigateInList(e));

    

        // Add class so we know we've already added the listeners
        promptTextbox.classList.add('autocomplete');

        // Add style to dom
        let acStyle = document.createElement('style');

        let css = gradioApp().querySelector('.dark') ? autocompleteCSS_dark : autocompleteCSS_light;
        if (acStyle.styleSheet) {
            acStyle.styleSheet.cssText = css;
        } else {
            acStyle.appendChild(document.createTextNode(css));
        }
        gradioApp().appendChild(acStyle);
    }
});