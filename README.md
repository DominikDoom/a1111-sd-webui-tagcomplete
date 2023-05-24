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
- If the prompt popup has broken styling for you or doesn't appear at all (like [this](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/7bbfdd54-fc23-4bfc-85af-24704b139b3a)), make sure to update your openpose-editor extension if you have it installed. It is known to cause issues with other extensions in older versions.

## Screenshots & Demo videos
<details>
<summary>Click to expand</summary>
Basic usage (with keyboard navigation):

https://user-images.githubusercontent.com/34448969/200128020-10d9a8b2-cea6-4e3f-bcd2-8c40c8c73233.mp4

Wildcard script support:

https://user-images.githubusercontent.com/34448969/200128031-22dd7c33-71d1-464f-ae36-5f6c8fd49df0.mp4

Dark and Light mode supported, including tag colors:

![results_dark](https://user-images.githubusercontent.com/34448969/200128214-3b6f21b4-9dda-4acf-820e-5df0285c30d6.png)
![results_light](https://user-images.githubusercontent.com/34448969/200128217-bfac8b60-6673-447b-90fd-dc6326f1618c.png)
</details>

## Installation
### Using the built-in extension list
1. Open the Extensions tab
2. Open the Available sub-tab
3. Click "Load from:"
4. Find "Booru tag autocompletion" in the list
   - The extension was one of the first available, so selecting "oldest first" will show it high up in the list.
5. Click "Install" on the right side

![Load from index](https://user-images.githubusercontent.com/34448969/223537209-24c7623e-7410-427e-857f-9da936aadb21.png)
![Order by oldest](https://user-images.githubusercontent.com/34448969/223537231-48e982b8-0920-48c5-87e5-8c81ebbb5fe3.png)
![Install](https://user-images.githubusercontent.com/34448969/223537336-5c02ccb1-233d-4e0d-9e73-d1b889252c49.png)


### Manual clone
```bash
git clone "https://github.com/DominikDoom/a1111-sd-webui-tagcomplete.git" extensions/tag-autocomplete
```
(The second argument specifies the name of the folder, you can choose whatever you like).

## Additional completion support
### Wildcards
Autocompletion also works with wildcard files used by https://github.com/AUTOMATIC1111/stable-diffusion-webui-wildcards or other similar scripts/extensions.
Completion is triggered by typing `__` (double underscore). It will first show a list of your wildcard files, and upon choosing one, the replacement options inside that file.
This enables you to either insert categories to be replaced by the script, or directly choose one and use wildcards as a sort of categorized custom tag system.

![Wildcard files](https://user-images.githubusercontent.com/34448969/223534518-8488c2e1-d9e5-4870-844f-adbf3bfb1eee.png)
![Wildcard replacements](https://user-images.githubusercontent.com/34448969/223534534-69597907-59de-4ba8-ae83-b01386570124.png)


Wildcards are searched for in every extension folder, as well as the `scripts/wildcards` folder to support legacy versions. This means that you can combine wildcards from multiple extensions. Nested folders are also supported if you have grouped your wildcards in that way.

### Embeddings, Lora & Hypernets
Completion for these three types is triggered by typing `<`. By default it will show all three mixed together, but further filtering can be done in the following way:
- `<e:` will only show embeddings
- `<l:` or `<lora:` will only show Lora
- `<h:` or `<hypernet:` will only show Hypernetworks

#### Embedding type filtering
Embeddings trained for Stable Diffusion 1.x or 2.x models respectively are incompatible with the other type. To make it easier to find valid embeds, they are categorized by "v1 Embedding" and "v2 Embedding", including a slight color difference. You can also filter your search to include only v1 or v2 embeddings by typing `<v1/2` or `<e:v1/2` followed by the actual search term.

For example:

![Embedding version filter](https://user-images.githubusercontent.com/34448969/223533883-d99c04b7-a199-4f56-a4e5-242eee9726a2.png)

### Chants
Chants are longer prompt presets. The name is inspired by some early prompt collections from Chinese users, which often were called along the lines of "Spellbook", "Codex", etc. The prompt snippets from such documents were fittingly called spells or chants for this reason.

Similar to embeddings and loras, this feature is triggered by typing the `<`, `<c:` or `<chant:` commands. For instance, when you enter `<c:HighQuality` in the prompt box and select it, the following prompt text will be inserted:
```
(masterpiece, best quality, high quality, highres, ultra-detailed),
```


Chants can be added in JSON files following this format:
```json
[
    {
        "name": "Basic-NegativePrompt",
        "terms": "Negative,Low,Quality",
        "content": "(worst quality, low quality, normal quality)",
        "color": 3
    },
    {
        "name": "Basic-HighQuality",
        "terms": "Best,High,Quality",
        "content": "(masterpiece, best quality, high quality, highres, ultra-detailed)",
        "color": 1
    },
    {
        "name": "Basic-Start",
        "terms": "Basic, Start, Simple, Demo",
        "content": "(masterpiece, best quality, high quality, highres), 1girl, extremely beautiful detailed face, ...",
        "color": 5
    }
]
```
The file can then be selected using the "Chant file" settings dropdown if it is located inside the extension's `tags` folder.

A chant object has four fields:
- `name` - Display name
- `terms` - Search terms
- `content` - The actual prompt content
- `color` - Color, using the same category color system as normal tags

### Umi AI tags
https://github.com/Klokinator/Umi-AI is a feature-rich wildcard extension similar to Unprompted or Dynamic Wildcards.
In recent releases, it uses YAML-based wildcard tags to enable a complex chaining system,for example `<[preset][--female][sfw][species]>` will choose the preset category, exclude female related tags, further narrow it down with the following categories, and then choose one random fill-in matching all these criteria at runtime. Completion is triggered by `<[` and then each following new unclosed bracket, e.g. `<[xyz][`, until closed by `>`.

Tag Autocomplete can recommend these options in a smart way, meaning while you continue to add category tags, it will only show results still matching what comes before.
It also shows how many fill-in tags are available to choose from for that combo in place of the tag post count, enabling a quick overview and filtering of the large initial set.

Most of the credit goes to [@ctwrs](https://github.com/ctwrs) here, they contributed a lot as one of the Umi developers.

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
| extras | Options for additional tag files / aliases / translations. More info below. |
| chantFile | The file to use for chants (longer prompt presets / shortcuts). |
| keymap | Customizable hotkeys. |
| colors | Customizable tag colors. More info below. |
### Colors
Tag type colors can be specified by changing the JSON code in the tag autocomplete settings.
The format is standard JSON, with the object names corresponding to the tag filenames (without the .csv) they should be used for.
The first value in the square brackets is for dark, the second for light mode. Color names and hex codes should both work.
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
This can also be used to add new color sets for custom tag files.
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
