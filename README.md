# Booru tag autocompletion for A1111

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/DominikDoom/a1111-sd-webui-tagcomplete)](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/releases)

## [中文文档](./README_ZH.md)

This custom script serves as a drop-in extension for the popular [AUTOMATIC1111 web UI](https://github.com/AUTOMATIC1111/stable-diffusion-webui) for Stable Diffusion.

It displays autocompletion hints for recognized tags from "image booru" boards such as Danbooru, which are primarily used for browsing Anime-style illustrations.
Since some Stable Diffusion models were trained using this information, for example [Waifu Diffusion](https://github.com/harubaru/waifu-diffusion), using exact tags in prompts can often improve composition and help to achieve a wanted look.

I created this script as a convenience tool since it reduces the need of switching back and forth between the web UI and a booru site to copy-paste tags.

You can either clone / download the files manually as described [below](#installation), or use a pre-packaged version from [Releases](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/releases).

## Common Problems & Known Issues:
- The browser might cache old versions of the script, config, or embedding/wildcard lists. Try hitting `CTRL+F5` to clear the cache.
- If `replaceUnderscores` is active, the script will currently only partly replace edited tags containing multiple words in brackets.
For example, editing `atago (azur lane)`, it would be replaced with e.g. `taihou (azur lane), lane)`, since the script currently doesn't see the second part of the bracket as the same tag. So in those cases you should delete the old tag beforehand.

### Wildcard & Embedding support
Autocompletion also works with wildcard files used by [this script](https://github.com/jtkelm2/stable-diffusion-webui-1/blob/master/scripts/wildcards.py) of the same name (demo video further down). This enables you to either insert categories to be replaced by the script, or even replace them with the actual wildcard file content in the same step.

It also scans the embeddings folder and displays completion hints for the names of all .pt and .bin files inside if you start typing `<`. Note that some normal tags also use < in Kaomoji (like ">_<" for example), so the results will contain both.

Both are now enabled by default and scan the `/embeddings` and `/scripts/wildcards` folders automatically.

## Screenshots
Demo video (with keyboard navigation):

https://user-images.githubusercontent.com/34448969/195344430-2b5f9945-b98b-4943-9fbc-82cf633321b1.mp4

Wildcard script support:

https://user-images.githubusercontent.com/34448969/195632461-49d226ae-d393-453d-8f04-1e44b073234c.mp4

Dark and Light mode supported, including tag colors:

![tagtypes](https://user-images.githubusercontent.com/34448969/195177127-f63949f8-271d-4767-bccd-f1b5e818a7f8.png)
![tagtypes_light](https://user-images.githubusercontent.com/34448969/195180061-ceebcc25-9e4c-424f-b0c9-ba8e8f4f17f4.png)

## Installation
Simply copy the `javascript`, `scripts` and `tags` folder into your web UI installation root. It will run automatically the next time the web UI is started.

The tags folder contains `config.json` and the tag data the script uses for autocompletion. By default, Danbooru and e621 tags are included.
After scanning for embeddings and wildcards, the script will also create a `temp` directory here which lists the found files so they can be accessed in the browser side of the script. You can delete the temp folder without consequences as it will be recreated on the next startup.
### Important:
The script needs **all three folders** to work properly.

### Config
The config contains the following settings and defaults:
```json
{
	"tagFile": "danbooru.csv",
	"activeIn": {
		"txt2img": true,
		"img2img": true,
		"negativePrompts": true
	},
	"maxResults": 5,
	"showAllResults": false,
	"replaceUnderscores": true,
	"escapeParentheses": true,
	"useWildcards": true,
	"useEmbeddings": true,
	"translation": {
		"searchByTranslation": true,
		"onlyShowTranslation": false
	},
	"extra": {
		"extraFile": "",
		"onlyTranslationExtraFile": false
	},
	"colors": {
		"danbooru": {
			"0": ["lightblue", "dodgerblue"],
			"1": ["indianred", "firebrick"],
			"3": ["violet", "darkorchid"],
			"4": ["lightgreen", "darkgreen"],
			"5": ["orange", "darkorange"]
		},
		"e621": {
			"-1": ["red", "maroon"],
			"0": ["lightblue", "dodgerblue"],
			"1": ["gold", "goldenrod"],
			"3": ["violet", "darkorchid"],
			"4": ["lightgreen", "darkgreen"],
			"5": ["tomato", "darksalmon"],
			"6": ["red", "maroon"],
			"7": ["whitesmoke", "black"],
			"8": ["seagreen", "darkseagreen"]
		}
	}
}
```
| Setting	| Description |
|---------|-------------|
| tagFile | Specifies the tag file to use. You can provide a custom tag database of your liking, but since the script was developed with Danbooru tags in mind, it might not work properly with other configurations.|
| activeIn | Allows to selectively (de)activate the script for txt2img, img2img, and the negative prompts for both. |
| maxResults | How many results to show max. For the default tag set, the results are ordered by occurence count. For embeddings and wildcards it will show all results in a scrollable list. |
| showAllResults | If true, will ignore maxResults and show all results in a scrollable list. **Warning:** can lag your browser for long lists. |
| replaceUnderscores | If true, undescores are replaced with spaces on clicking a tag. Might work better for some models. |
| escapeParentheses | If true, escapes tags containing () so they don't contribute to the web UI's prompt weighting functionality. |
| useWildcards | Used to toggle the wildcard completion functionality. |
| useEmbeddings | Used to toggle the embedding completion functionality. |
| translation | Options for translating tags. More info in the section below. |
| extras | Options for additional tag files / translations. More info in the section below. |
| colors | Contains customizable colors for the tag types, you can add new ones here for custom tag files (same name as filename, without the .csv). The first value is for dark, the second for light mode. Color names and hex codes should both work.|

### Translations & Extra tags
With the recent update it is now possible to add translations to the tags. These will be searchable / shown according to the settings in `config.json`:
- `searchByTranslation` - Whether to search for the translated term as well or only the English tag.
- `onlyShowTranslation` - Replaces the English tag with its translation if it has one. Only for displaying, the inserted text at the end is still the English tag.

Example with full and partial chinese tag sets:

![translation](https://user-images.githubusercontent.com/34448969/196175839-8aaacb26-5c90-48e3-be65-647a0b444ead.png)
![translation_mixed](https://user-images.githubusercontent.com/34448969/196176233-76d4cb5f-16cf-4800-a69b-adb64a79ca8b.png)

Translations can be added in multiple ways, which is where the "Extra" file comes into play.
1. Directly in the main tag file. Simply add a third value, separated by comma, containing the translation for the tag in that row.
2. As an extra file containing only the translated tag rows (so still including the english Tag name and tag type). Will be matched to the English tags in the main file based on the name & type, so might be slow for large translation files.
3. As an extra file with `onlyTranslationExtraFile` true. With this configuration, the extra file has to include *only* the translation itself. That means it is purely index based, assigning the translations to the main tags is really fast but also needs the lines to match (including empty lines). If the order or amount in the main file changes, the translations will potentially not match anymore.

So your CSV values would look like this for each method:
|            |          1          |       2            |       3       |
|------------|---------------------|--------------------|---------------|
| Main file  | `tag,0,translation` | `tag,0`            | `tag,0`       |
| Extra file | -                   | `tag,0,translation`| `translation` |

Methods 1 & 2 can also be mixed, in which case translations in the extra file will have priority over those in the main file if they translate the same tag.

The extra files can also be used to just add new / custom tags not included in the main set, provided `onlyTranslationExtraFile` is false.
If an extra tag doesn't match any existing tag, it will be added to the list as a new tag instead.

### CSV tag data
The script expects a CSV file with tags saved in the following way:
```csv
1girl,0
solo,0
highres,5
long_hair,0
```
Notably, it does not expect column names in the first row.
The first value needs to be the tag name, while the second value specifies the tag type. An optional third value will be interpreted as a translation as described in the section above.
The numbering system follows the [tag API docs](https://danbooru.donmai.us/wiki_pages/api%3Atags) of Danbooru:
| Value	| Description |
|-------|-------------|
|0	    | General     |
|1	    | Artist      |
|3	    | Copyright   |
|4	    | Character   |
|5	    | Meta        |

or of e621:
| Value	| Description |
|-------|-------------|
|-1	    | Invalid     |
|0	    | General     |
|1	    | Artist      |
|3	    | Copyright   |
|4	    | Character   |
|5	    | Species     |
|6	    | Invalid     |
|7	    | Meta        |
|8	    | Lore        |

The tag type is used for coloring entries in the result list.