// Utility functions to select text areas the script should work on,
// including third party options.
// Supported third party options so far:
// - Dataset Tag Editor

// Core text area selectors
const core = [
    "#txt2img_prompt > label > textarea",
    "#img2img_prompt > label > textarea",
    "#txt2img_neg_prompt > label > textarea",
    "#img2img_neg_prompt > label > textarea",
    ".prompt > label > textarea"
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
    },
    "image browser": {
        "base": "#tab_image_browser",
        "hasIds": false,
        "selectors": [
            "Filename keyword search",
            "EXIF keyword search"
        ]
    },
    "tab_tagger": {
        "base": "#tab_tagger",
        "hasIds": false,
        "selectors": [
            "Additional tags (split by comma)",
            "Exclude tags (split by comma)"
        ]
    },
    "tiled-diffusion-t2i": {
        "base": "#txt2img_script_container",
        "hasIds": true,
        "onDemand": true,
        "selectors": [
            "[id^=MD-t2i][id$=prompt] textarea",
            "[id^=MD-t2i][id$=prompt] input[type='text']"
        ]
    },
    "tiled-diffusion-i2i": {
        "base": "#img2img_script_container",
        "hasIds": true,
        "onDemand": true,
        "selectors": [
            "[id^=MD-i2i][id$=prompt] textarea",
            "[id^=MD-i2i][id$=prompt] input[type='text']"
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

            let allTextAreas = [...base.querySelectorAll("textarea, input[type='text']")];

            // Filter the text areas where the adjacent label matches one of the selectors
            let matchingTextAreas = allTextAreas.filter(ta => [...ta.parentElement.childNodes].some(x => entry.selectors.includes(x.innerText)));
            textAreas = textAreas.concat(matchingTextAreas);
        }
    };

    return textAreas;
}

function addOnDemandObservers(setupFunction) {
    for (const [key, entry] of Object.entries(thirdParty)) {
        if (!entry.onDemand) continue;

        let base = gradioApp().querySelector(entry.base);
        if (!base) continue;
        
        let accordions = [...base?.querySelectorAll(".gradio-accordion")];
        if (!accordions) continue;

        accordions.forEach(acc => {
            let accObserver = new MutationObserver((mutationList, observer) => {
                for (const mutation of mutationList) {
                    if (mutation.type === "childList") {
                        let newChildren = mutation.addedNodes;
                        if (!newChildren) {
                            accObserver.disconnect();
                            continue;
                        }

                        newChildren.forEach(child => {
                            if (child.classList.contains("gradio-accordion") || child.querySelector(".gradio-accordion")) {
                                let newAccordions = [...child.querySelectorAll(".gradio-accordion")];
                                newAccordions.forEach(nAcc => accObserver.observe(nAcc, { childList: true }));
                            }
                        });

                        if (entry.hasIds) { // If the entry has proper ids, we can just select them
                            [...gradioApp().querySelectorAll(entry.selectors.join(", "))].forEach(x => setupFunction(x));
                        } else { // Otherwise, we have to find the text areas by their adjacent labels
                            let base = gradioApp().querySelector(entry.base);
                
                            // Safety check
                            if (!base) continue;
                
                            let allTextAreas = [...base.querySelectorAll("textarea, input[type='text']")];
                
                            // Filter the text areas where the adjacent label matches one of the selectors
                            let matchingTextAreas = allTextAreas.filter(ta => [...ta.parentElement.childNodes].some(x => entry.selectors.includes(x.innerText)));
                            matchingTextAreas.forEach(x => setupFunction(x));
                        }
                    }
                }
            });
            accObserver.observe(acc, { childList: true });
        });
    };
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