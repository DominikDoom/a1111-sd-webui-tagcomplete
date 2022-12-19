// Utility functions to select text areas the script should work on,
// including third party options.
// Supported third party options so far:
// - Dataset Tag Editor

// Core text area selectors
const core = [
    "#txt2img_prompt > label > textarea",
    "#img2img_prompt > label > textarea",
    "#txt2img_neg_prompt > label > textarea",
    "#img2img_neg_prompt > label > textarea"
];

// Third party text area selectors
const thirdParty = {
    "dataset-tag-editor": {
        "base": "#tab_dataset_tag_editor_interface",
        "hasIds": false,
        "selectors": [
            "Caption of Selected Image",
            "Interrogate Result",
            "Edit Caption",
            "Edit Tags"
        ]
    }
}

function getTextAreas() {
    // First get all core text areas
    let textAreas = [...gradioApp().querySelectorAll(core.join(", "))];
    
    for (const [key, entry] of Object.entries(thirdParty)) {
        if (entry.hasIds) { // If the entry has proper ids, we can just select them
            textAreas = textAreas.concat([...gradioApp().querySelectorAll(entry.selectors.join(", "))]);
        } else { // Otherwise, we have to find the text areas by their adjacent labels
            let base = gradioApp().querySelector(entry.base);
			
            // Safety check
            if (!base) continue;
			
            let allTextAreas =  [...base.querySelectorAll("textarea")];
            
            // Filter the text areas where the adjacent label matches one of the selectors
            let matchingTextAreas = allTextAreas.filter(ta => [...ta.parentElement.childNodes].some(x => entry.selectors.includes(x.innerText)));
            textAreas = textAreas.concat(matchingTextAreas);
        }
    };

    return textAreas;
}

const thirdPartyIdSet = new Set();
// Get the identifier for the text area to differentiate between positive and negative
function getTextAreaIdentifier(textArea) {
    let txt2img_p = gradioApp().querySelector('#txt2img_prompt > label > textarea');
    let txt2img_n = gradioApp().querySelector('#txt2img_neg_prompt > label > textarea');
    let img2img_p = gradioApp().querySelector('#img2img_prompt > label > textarea');
    let img2img_n = gradioApp().querySelector('#img2img_neg_prompt > label > textarea');

    let modifier = "";
    switch (textArea) {
        case txt2img_p:
            modifier = ".txt2img.p";
            break;
        case txt2img_n:
            modifier = ".txt2img.n";
            break;
        case img2img_p:
            modifier = ".img2img.p";
            break;
        case img2img_n:
            modifier = ".img2img.n";
            break;
        default:
            // If the text area is not a core text area, it must be a third party text area
            // Add it to the set of third party text areas and get its index as a unique identifier
            if (!thirdPartyIdSet.has(textArea))
                thirdPartyIdSet.add(textArea);

            modifier = `.thirdParty.ta${[...thirdPartyIdSet].indexOf(textArea)}`;
            break;
    }
    return modifier;
}