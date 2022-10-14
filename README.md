# Booru tag autocompletion for A1111

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/DominikDoom/a1111-sd-webui-tagcomplete)](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/releases)

# 中文教程

## 项目地址和来源
插件原仓库 https://github.com/DominikDoom/a1111-sd-webui-tagcomplete
魔改后仓库 https://github.com/sgmklp/a1111-sd-webui-tagcomplete (和谐Tag文件去这里取，有能力的可以去给颗star吗☛☚)
Tag来源 https://github.com/zcyzcy88/TagTable

## 提示词使用方法
仅支持英文提示词
仅支持英文提示词
仅支持英文提示词
将三个文件夹复制到WebUI的目录下即可，输入时就会有提示词
中文Tag分类使用方法
输入两个英文下划线开启（_）

## 如何制作自己的中文Tag文件
在 \scripts\wildcards 目录下新建txt文件即可，文件名将会被识别为分类
格式为 tag >> 翻译
最后将文件名写入 \tags\ wildcardNames.txt 文件下即可
更新文件后记得从设置重启WenUI刷新文件

# 英文原文

This custom script serves as a drop-in extension for the popular [AUTOMATIC1111 web UI](https://github.com/AUTOMATIC1111/stable-diffusion-webui) for Stable Diffusion.

It displays autocompletion hints for recognized tags from "image booru" boards such as Danbooru, which are primarily used for browsing Anime-style illustrations.
Since some Stable Diffusion models were trained using this information, for example [Waifu Diffusion](https://github.com/harubaru/waifu-diffusion), using exact tags in prompts can often improve composition and help to achieve a wanted look.

I created this script as a convenience tool since it reduces the need of switching back and forth between the web UI and a booru site to copy-paste tags.

You can either clone / download the files manually as described [below](#installation), or use a pre-packaged version from [Releases](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/releases).

### NEW - Wildcard support
Autocompletion also works with wildcard files used by [this script](https://github.com/jtkelm2/stable-diffusion-webui-1/blob/master/scripts/wildcards.py) of the same name (demo video further down). This enables you to either insert categories to be replaced by the script, or even replace them with the actual wildcard file content in the same step.
#### Important:
Since not everyone has the script, it is **disabled by default**. Edit the config to enable it and uncomment / add the filenames you use in `wildcardNames.txt`.
As per the instructions of the wildcard script, the files are expected in `/scripts/wildcards/`, it will likely fail if you have another folder structure.

### Known Issues:
If `replaceUnderscores` is active, the script will currently only partly replace edited tags containing multiple words in brackets.
For example, editing `atago (azur lane)`, it would be replaced with e.g. `taihou (azur lane), lane)`, since the script currently doesn't see the second part of the bracket as the same tag. So in those cases you should delete the old tag beforehand.

Also, at least for now there's no way to turn the script off from the ui, but I plan to get around to that eventually.

## Screenshots
Demo video (with keyboard navigation):

https://user-images.githubusercontent.com/34448969/195344430-2b5f9945-b98b-4943-9fbc-82cf633321b1.mp4

Wildcard script support:

https://user-images.githubusercontent.com/34448969/195632461-49d226ae-d393-453d-8f04-1e44b073234c.mp4

Dark and Light mode supported, including tag colors:

![tagtypes](https://user-images.githubusercontent.com/34448969/195177127-f63949f8-271d-4767-bccd-f1b5e818a7f8.png)
![tagtypes_light](https://user-images.githubusercontent.com/34448969/195180061-ceebcc25-9e4c-424f-b0c9-ba8e8f4f17f4.png)


## Installation
Simply put `tagAutocomplete.js` into the **`javascript`** folder of your web UI installation (**NOT** the `scripts` folder where most other scripts are installed). It will run automatically the next time the web UI is started.
For the script to work, you also need to download the `tags` folder from this repo and paste it and its contents into the web UI root, or create them there manually.

The folder structure should look similar to this at the end:

![image](https://user-images.githubusercontent.com/34448969/195697260-526a1ab8-4a63-4b8b-a9bf-ae0f3eef780f.png)

The tags folder contains `config.json` and the tag data the script uses for autocompletion. By default, Danbooru and e621 tags are included.

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
	"useWildcards": false,
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
| maxResults | How many results to show max. For the default tag set, the results are ordered by occurence count. |
| replaceUnderscores | If true, undescores are replaced with spaces on clicking a tag. Might work better for some models. |
| escapeParentheses | If true, escapes tags containing () so they don't contribute to the web UI's prompt weighting functionality. |
| useWildcards | Used to toggle the recently added wildcard completion functionality. Also needs `wildcardNames.txt` to contain proper file names for your wildcard files. |
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
