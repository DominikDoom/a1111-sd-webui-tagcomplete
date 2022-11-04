# Booru tag autocompletion for A1111

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/DominikDoom/a1111-sd-webui-tagcomplete)](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/releases)

## [中文文档](./README_ZH.md)

This custom script serves as a drop-in extension for the popular [AUTOMATIC1111 web UI](https://github.com/AUTOMATIC1111/stable-diffusion-webui) for Stable Diffusion.

It displays autocompletion hints for recognized tags from "image booru" boards such as Danbooru, which are primarily used for browsing Anime-style illustrations.
Since some Stable Diffusion models were trained using this information, for example [Waifu Diffusion](https://github.com/harubaru/waifu-diffusion), using exact tags in prompts can often improve composition and help to achieve a wanted look.

I created this script as a convenience tool since it reduces the need of switching back and forth between the web UI and a booru site to copy-paste tags.

You can either clone / download the files manually as described [below](#installation), or use a pre-packaged version from [Releases](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/releases).

## Common Problems & Known Issues:
- The browser might cache old versions of the script, config, or embedding/wildcard lists. Try hitting `CTRL+F5` to clear the cache if you have issues.
- If `replaceUnderscores` is active, the script will currently only partially replace edited tags containing multiple words in brackets.
For example, editing `atago (azur lane)`, it would be replaced with e.g. `taihou (azur lane), lane)`, since the script currently doesn't see the second part of the bracket as the same tag. So in those cases you should delete the old tag beforehand.

## Screenshots
Demo video (with keyboard navigation):

https://user-images.githubusercontent.com/34448969/195344430-2b5f9945-b98b-4943-9fbc-82cf633321b1.mp4

Wildcard script support:

https://user-images.githubusercontent.com/34448969/195632461-49d226ae-d393-453d-8f04-1e44b073234c.mp4

Dark and Light mode supported, including tag colors:

![tagtypes](https://user-images.githubusercontent.com/34448969/195177127-f63949f8-271d-4767-bccd-f1b5e818a7f8.png)
![tagtypes_light](https://user-images.githubusercontent.com/34448969/195180061-ceebcc25-9e4c-424f-b0c9-ba8e8f4f17f4.png)

## Installation
### As an extension (recommended)
Either clone the repo into your extensions folder:
```bash
git clone "https://github.com/DominikDoom/a1111-sd-webui-tagcomplete.git" extensions/tag-autocomplete
```
(The second argument specifies the name of the folder, you can choose whatever you like).

Or create a folder there manually and place the `javascript`, `scripts` and `tags` folders in it.

### In the root folder (old)
Copy the `javascript`, `scripts` and `tags` folder into your web UI installation root. It will run automatically the next time the web UI is started.

---

In both configurations, the tags folder contains `config.json` and the tag data the script uses for autocompletion. By default, Danbooru and e621 tags are included.
After scanning for embeddings and wildcards, the script will also create a `temp` directory here which lists the found files so they can be accessed in the browser side of the script. You can delete the temp folder without consequences as it will be recreated on the next startup.

### Important:
The script needs **all three folders** to work properly.

## Wildcard & Embedding support
Autocompletion also works with wildcard files used by [this script](https://github.com/jtkelm2/stable-diffusion-webui-1/blob/master/scripts/wildcards.py) of the same name or other similar scripts/extensions. This enables you to either insert categories to be replaced by the script, or even replace them with the actual wildcard file content in the same step. Wildcards are searched for in every extension folder as well as the `scripts/wildcards` folder to support legacy versions. This means that you can combine wildcards from multiple extensions. Nested folders are also supported if you have grouped your wildcards in that way.

It also scans the embeddings folder and displays completion hints for the names of all .pt and .bin files inside if you start typing `<`. Note that some normal tags also use < in Kaomoji (like ">_<" for example), so the results will contain both.

## Config
The config contains the following settings and defaults:
```json
{
	"tagFile": "danbooru.csv",
	"activeIn": {
		"txt2img": true,
		"img2img": true,
		"negativePrompts": true
	},
	"hideUIOptions": false,
	"maxResults": 5,
	"resultStepLength": 500,
	"delayTime": 100,
	"showAllResults": false,
	"useLeftRightArrowKeys": false,
	"replaceUnderscores": true,
	"escapeParentheses": true,
	"appendComma": true,
	"useWildcards": true,
	"useEmbeddings": true,
	"alias": {
		"searchByAlias": true,
		"onlyShowAlias": false
	},
	"extra": {
		"extraFile": "",
		"onlyAliasExtraFile": false
	},
	"colors": {
		"danbooru": {
			"-1": ["red", "maroon"],
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
| hideUIOptions | Allows to hide the added GUI options at the top of the page to adjust active and comma settings without restarting. |
| maxResults | How many results to show max. For the default tag set, the results are ordered by occurence count. For embeddings and wildcards it will show all results in a scrollable list. |
| resultStepLength | Allows to load results in smaller batches of the specified size for better performance in long lists or if showAllResults is true. |
| delayTime | Specifies how much to wait in milliseconds before triggering autocomplete. Helps prevent too frequent updates while typing. |
| showAllResults | If true, will ignore maxResults and show all results in a scrollable list. **Warning:** can lag your browser for long lists. |
| useLeftRightArrowKeys | If true, left and right arrows will select the first/last result in the popup instead of moving the cursor in the textbox. |
| replaceUnderscores | If true, undescores are replaced with spaces on clicking a tag. Might work better for some models. |
| escapeParentheses | If true, escapes tags containing () so they don't contribute to the web UI's prompt weighting functionality. |
| appendComma | Specifies the starting value of the "Append commas" UI switch. If UI options are disabled, this will always be used. |
| useWildcards | Used to toggle the wildcard completion functionality. |
| useEmbeddings | Used to toggle the embedding completion functionality. |
| alias | Options for aliases and translating tags. More info in the section below. |
| extras | Options for additional tag files / aliases / translations. More info in the section below. |
| colors | Contains customizable colors for the tag types, you can add new ones here for custom tag files (same name as filename, without the .csv). The first value is for dark, the second for light mode. Color names and hex codes should both work.|

### Aliases, Translations & Extra tags
Like on Booru sites, tags can have one or multiple aliases which redirect to the actual value on completion. These will be searchable / shown according to the settings in `config.json`:
- `searchByAlias` - Whether to search for the alias or only the actual tag.
- `onlyShowAlias` - Shows only the alias instead of `alias -> actual`. Only for displaying, the inserted text at the end is still the actual tag.

The alias feature can also be used for translation, since translating just adds another alias for the respective tag.
Example with full and partial chinese tag sets:

![translation](https://user-images.githubusercontent.com/34448969/196175839-8aaacb26-5c90-48e3-be65-647a0b444ead.png)
![translation_mixed](https://user-images.githubusercontent.com/34448969/196176233-76d4cb5f-16cf-4800-a69b-adb64a79ca8b.png)

Aliases and translations can be added in multiple ways, which is where the "Extra" file comes into play.
1. Directly in the main tag file. Simply add a fourth value, separated by comma, containing the translation for the tag in that row.
2. As an extra file containing only the translated tag rows (so still including the english Tag name and tag type). Will be matched to the English tags in the main file based on the name & type, so might be slow for large translation files.
3. As an extra file with `onlyTranslationExtraFile` true. With this configuration, the extra file has to include *only* the translation itself. That means it is purely index based, assigning the translations to the main tags is really fast but also needs the lines to match (including empty lines). If the order or amount in the main file changes, the translations will potentially not match anymore.

So your CSV values would look like this for each method:
|            |          1             |       2                  |       3            |
|------------|------------------------|--------------------------|--------------------|
| Main file  | `tag,type,count,alias` | `tag,type,count`         | `tag,type,count`   |
| Extra file | -                      | `tag,type,(count),alias` | `alias`            |

Count in the extra file is optional, since there isn't always a post count for custom tag sets.
Methods 1 & 2 can also be mixed, in which case translations in the extra file will have priority over those in the main file if they translate the same tag.

The extra files can also be used to just add new / custom tags not included in the main set, provided `onlyTranslationExtraFile` is false.
If an extra tag doesn't match any existing tag, it will be added to the list as a new tag instead.

## CSV tag data
The script expects a CSV file with tags saved in the following way:
```csv
<name>,<type>,<postCount>,"<aliases>"
```
Example:
```csv
1girl,0,4114588,"1girls,sole_female"
solo,0,3426446,"female_solo,solo_female"
highres,5,3008413,"high_res,high_resolution,hires"
long_hair,0,2898315,longhair
commentary_request,5,2610959,
```
Notably, it does not expect column names in the first row and both count and aliases are technically optional,
although count is always included in the default data.

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
