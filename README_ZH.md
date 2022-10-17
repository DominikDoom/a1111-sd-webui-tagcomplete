# Booru tag autocompletion for A1111

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/DominikDoom/a1111-sd-webui-tagcomplete)](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/releases)
## [English Document](./README.md)

## 功能概述

本脚本为 [AUTOMATIC1111 web UI](https://github.com/AUTOMATIC1111/stable-diffusion-webui)的自定义脚本,能在输入Tag时提供booru风格（如Danbooru）的TAG自动补全。因为有一些模型是基于这种TAG风格训练的（例如[Waifu Diffusion](https://github.com/harubaru/waifu-diffusion)），因此使用这些Tag能获得较为精确的效果。

这个脚本的创建是为了减少因复制Tag在Web UI和 booru网站的反复切换。
你可以按照[以下方法](#installation)下载或拷贝文件，也可以使用[Releases](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/releases)中打包好的文件。

## [Wildcard](https://github.com/jtkelm2/stable-diffusion-webui-1/blob/master/scripts/wildcards.py) &  Embedding 支持
自动补全同样适用于 [Wildcard](https://github.com/jtkelm2/stable-diffusion-webui-1/blob/master/scripts/wildcards.py)中所述的通配符文件(后面有演示视频)。这将使你能够插入Wildcard脚本需要的通配符，更进一步的，你还可以插入通配符文件内的某个具体Tag。

当输入`__`字符时，`/scripts/wildcards`文件夹下的通配符文件会列出到自动补全，当你选择某个具体通配符文件时,会列出其中的所有的具体Tag,但如果你仅需要选择某个通配符，请按下空格。

当输入`<`字符时，`embeddings`文件夹下的`.pt`和`.bin`文件会列出到自动完成。需要注意的是，一些颜文字也会包含`<`(比如`>_<`),所以它们也会出现在结果中。

现在这项功能默认是启用的，并会自动扫描`/embeddings`和`/scripts/wildcards`文件夹，不再需要使用``
Both are now enabled by default and scan the `/embeddings` and `/scripts/wildcards` folders automatically.

### Known Issues:
If `replaceUnderscores` is active, the script will currently only partly replace edited tags containing multiple words in brackets.
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
