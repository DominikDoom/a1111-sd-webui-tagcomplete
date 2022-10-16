# Booru tag autocompletion for A1111

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/DominikDoom/a1111-sd-webui-tagcomplete)](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/releases)

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
	"replaceUnderscores": true,
	"escapeParentheses": true,
	"useWildcards": true,
	"useEmbeddings": true,
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
| replaceUnderscores | If true, undescores are replaced with spaces on clicking a tag. Might work better for some models. |
| escapeParentheses | If true, escapes tags containing () so they don't contribute to the web UI's prompt weighting functionality. |
| useWildcards | Used to toggle the wildcard completion functionality. |
| useEmbeddings | Used to toggle the embedding completion functionality. |
| colors | Contains customizable colors for the tag types, you can add new ones here for custom tag files (same name as filename, without the .csv). The first value is for dark, the second for light mode. Color names and hex codes should both work.|

### CSV tag data
The script expects a CSV file with tags saved in the following way:
```csv
1girl,0
solo,0
highres,5
long_hair,0
```
Notably, it does not expect column names in the first row.
The first value needs to be the tag name, while the second value specifies the tag type.
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
