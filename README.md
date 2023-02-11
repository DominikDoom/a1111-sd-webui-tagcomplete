![tag_autocomplete_light](https://user-images.githubusercontent.com/34448969/208306863-90bbd663-2cb4-47f1-a7fe-7b662a7b95e2.png)

# Booru tag autocompletion for A1111

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/DominikDoom/a1111-sd-webui-tagcomplete)](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/releases)

## [中文文档](./README_ZH.md)

This custom script serves as a drop-in extension for the popular [AUTOMATIC1111 web UI](https://github.com/AUTOMATIC1111/stable-diffusion-webui) for Stable Diffusion.

It displays autocompletion hints for recognized tags from "image booru" boards such as Danbooru, which are primarily used for browsing Anime-style illustrations.
Since some Stable Diffusion models were trained using this information, for example [Waifu Diffusion](https://github.com/harubaru/waifu-diffusion), using exact tags in prompts can often improve composition and help to achieve a wanted look.

You can install it using the inbuilt available extensions list, clone the files manually as described [below](#installation), or use a pre-packaged version from [Releases](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/releases).

## Common Problems & Known Issues:
- Depending on your browser settings, sometimes an old version of the script can get cached. Try `CTRL+F5` to force-reload the site without cache if e.g. a new feature doesn't appear for you after an update.
- If `replaceUnderscores` is active, the script will currently only partially replace edited tags containing multiple words in brackets.
For example, editing `atago (azur lane)`, it would be replaced with e.g. `taihou (azur lane), lane)`, since the script currently doesn't see the second part of the bracket as the same tag. So in those cases you should delete the old tag beforehand.

## Screenshots
Demo video (with keyboard navigation):

https://user-images.githubusercontent.com/34448969/200128020-10d9a8b2-cea6-4e3f-bcd2-8c40c8c73233.mp4

Wildcard script support:

https://user-images.githubusercontent.com/34448969/200128031-22dd7c33-71d1-464f-ae36-5f6c8fd49df0.mp4

Dark and Light mode supported, including tag colors:

![results_dark](https://user-images.githubusercontent.com/34448969/200128214-3b6f21b4-9dda-4acf-820e-5df0285c30d6.png)
![results_light](https://user-images.githubusercontent.com/34448969/200128217-bfac8b60-6673-447b-90fd-dc6326f1618c.png)

## Installation
### As an extension (recommended)
Either clone the repo into your extensions folder:
```bash
git clone "https://github.com/DominikDoom/a1111-sd-webui-tagcomplete.git" extensions/tag-autocomplete
```
(The second argument specifies the name of the folder, you can choose whatever you like).

Or create a folder there manually and place the `javascript`, `scripts` and `tags` folders in it.

### In the root folder (legacy)
This installation method is for old webui versions pre-extension system, it will not work on current versions!

---

In both configurations, the `tags` folder contains `colors.json` and the tag data the script uses for autocompletion. By default, Danbooru and e621 tags are included.
After scanning for embeddings and wildcards, the script will also create a `temp` directory here which lists the found files so they can be accessed in the browser side of the script. You can delete the temp folder without consequences as it will be recreated on the next startup.

### Important:
The script needs **all three folders** to work properly.

## Wildcard & Embedding support
Autocompletion also works with wildcard files used by [this script](https://github.com/jtkelm2/stable-diffusion-webui-1/blob/master/scripts/wildcards.py) of the same name or other similar scripts/extensions. This enables you to either insert categories to be replaced by the script, or even replace them with the actual wildcard file content in the same step. Wildcards are searched for in every extension folder as well as the `scripts/wildcards` folder to support legacy versions. This means that you can combine wildcards from multiple extensions. Nested folders are also supported if you have grouped your wildcards in that way.

It also scans the embeddings folder and displays completion hints for the names of all .pt, .bin and .png files inside if you start typing `<`. Note that some normal tags also use < in Kaomoji (like ">_<" for example), so the results will contain both.

## Settings

The extension has a large amount of configuration & customizability built in:

![image](https://user-images.githubusercontent.com/34448969/204093162-99c6a0e7-8183-4f47-963b-1f172774f527.png)

| Setting	| Description |
|---------|-------------|
| tagFile | Specifies the tag file to use. You can provide a custom tag database of your liking, but since the script was developed with Danbooru tags in mind, it might not work properly with other configurations.|
| activeIn | Allows to selectively (de)activate the script for txt2img, img2img, and the negative prompts for both. |
| maxResults | How many results to show max. For the default tag set, the results are ordered by occurence count. For embeddings and wildcards it will show all results in a scrollable list. |
| resultStepLength | Allows to load results in smaller batches of the specified size for better performance in long lists or if showAllResults is true. |
| delayTime | Specifies how much to wait in milliseconds before triggering autocomplete. Helps prevent too frequent updates while typing. |
| showAllResults | If true, will ignore maxResults and show all results in a scrollable list. **Warning:** can lag your browser for long lists. |
| replaceUnderscores | If true, undescores are replaced with spaces on clicking a tag. Might work better for some models. |
| escapeParentheses | If true, escapes tags containing () so they don't contribute to the web UI's prompt weighting functionality. |
| appendComma | Specifies the starting value of the "Append commas" UI switch. If UI options are disabled, this will always be used. |
| useWildcards | Used to toggle the wildcard completion functionality. |
| useEmbeddings | Used to toggle the embedding completion functionality. |
| alias | Options for aliases. More info in the section below. |
| translation | Options for translations. More info in the section below.  |
| extras | Options for additional tag files / aliases / translations. More info in the section below. |

### colors.json
Additionally, tag type colors can be specified using the separate `colors.json` file in the extension's `tags` folder.
You can also add new ones here for custom tag files (same name as filename, without the .csv). The first value is for dark, the second for light mode. Color names and hex codes should both work.
```json
{
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
```
The numbers are specifying the tag type, which is dependent on the tag source. For an example, see [CSV tag data](#csv-tag-data).

### Aliases, Translations & Extra tags
#### Aliases
Like on Booru sites, tags can have one or multiple aliases which redirect to the actual value on completion. These will be searchable / shown according to the settings in `config.json`:
- `searchByAlias` - Whether to also search for the alias or only the actual tag.
- `onlyShowAlias` - Shows only the alias instead of `alias -> actual`. Only for displaying, the inserted text at the end is still the actual tag.

#### Translations
An additional file can be added in the translation section, which will be used to translate both tags and aliases and also enables searching by translation.
This file needs to be a CSV in the format `<English tag/alias>,<Translation>`, but for backwards compatibility with older files that used a three column format, you can turn on `oldFormat` to use that instead.

Example with chinese translation:

![IME-input](https://user-images.githubusercontent.com/34448969/200126551-2264e9cc-abb2-4450-9afa-43f362a77ab0.png)
![english-input](https://user-images.githubusercontent.com/34448969/200126513-bf6b3940-6e22-41b0-a369-f2b4640f87d6.png)

#### Extra file
An extra file can be used to add new / custom tags not included in the main set.
The format is identical to the normal tag format shown in [CSV tag data](#csv-tag-data) below, with one exception:
Since custom tags likely have no count, column three (or two if counting from zero) is instead used for the gray meta text displayed next to the tag.
If left empty, it will instead show "Custom tag".

An example with the included (very basic) extra-quality-tags.csv file:

![image](https://user-images.githubusercontent.com/34448969/218264276-cd77ba8e-62d8-41a2-b03c-6c04887ee18b.png)

Whether the custom tags should be added before or after the normal tags can be chosen in the settings.

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
although count is always included in the default data. Multiple aliases need to be comma separated as well, but encased in string quotes to not break the CSV parsing.

The numbering system follows the [tag API docs](https://danbooru.donmai.us/wiki_pages/api%3Atags) of Danbooru:
| Value	| Description |
|-------|-------------|
|0	| General     |
|1	| Artist      |
|3	| Copyright   |
|4	| Character   |
|5	| Meta        |

or similarly for e621:
| Value	| Description |
|-------|-------------|
|-1	| Invalid     |
|0	| General     |
|1	| Artist      |
|3	| Copyright   |
|4	| Character   |
|5	| Species     |
|6	| Invalid     |
|7	| Meta        |
|8	| Lore        |

The tag type is used for coloring entries in the result list.
