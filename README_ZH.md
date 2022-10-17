# Booru tag autocompletion for A1111

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/DominikDoom/a1111-sd-webui-tagcomplete)](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/releases)
## [English Document](./README.md)

## 功能概述

本脚本为 [AUTOMATIC1111 web UI](https://github.com/AUTOMATIC1111/stable-diffusion-webui)的自定义脚本,能在输入Tag时提供booru风格（如Danbooru）的TAG自动补全。因为有一些模型是基于这种TAG风格训练的（例如[Waifu Diffusion](https://github.com/harubaru/waifu-diffusion)），因此使用这些Tag能获得较为精确的效果。

这个脚本的创建是为了减少因复制Tag在Web UI和 booru网站的反复切换。
你可以按照[以下方法](#installation)下载或拷贝文件，也可以使用[Releases](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/releases)中打包好的文件。

## 常见问题 & 已知缺陷:
* 浏览器可能因为缓存无法更新脚本、设置、embedding/wildcard列表，尝试使用`CRTL+F5`清空浏览器缓存并重新加载
- 当`replaceUnderscores`选项开启时, 脚本只会替换Tag的一部分如果Tag包含多个单词,比如将`atago (azur lane)`修改`atago`为`taihou`并使用自动补全时.会得到 `taihou (azur lane), lane)`的结果, 因为脚本没有把后面的部分认为成同一个Tag。

## [Wildcard](https://github.com/jtkelm2/stable-diffusion-webui-1/blob/master/scripts/wildcards.py) &  Embedding 支持
自动补全同样适用于 [Wildcard](https://github.com/jtkelm2/stable-diffusion-webui-1/blob/master/scripts/wildcards.py)中所述的通配符文件(后面有演示视频)。这将使你能够插入Wildcard脚本需要的通配符，更进一步的，你还可以插入通配符文件内的某个具体Tag。

当输入`__`字符时，`/scripts/wildcards`文件夹下的通配符文件会列出到自动补全，当你选择某个具体通配符文件时,会列出其中的所有的具体Tag,但如果你仅需要选择某个通配符，请按下空格。

当输入`<`字符时，`embeddings`文件夹下的`.pt`和`.bin`文件会列出到自动完成。需要注意的是，一些颜文字也会包含`<`(比如`>_<`),所以它们也会出现在结果中。

现在这项功能默认是启用的，并会自动扫描`/embeddings`和`/scripts/wildcards`文件夹，不再需要使用`tags/wildcardNames.txt`文件了，早期版本的用户可以将它删除。

## 演示与截图
演示视频(使用了键盘导航):

https://user-images.githubusercontent.com/34448969/195344430-2b5f9945-b98b-4943-9fbc-82cf633321b1.mp4

Wildcard支持演示:

https://user-images.githubusercontent.com/34448969/195632461-49d226ae-d393-453d-8f04-1e44b073234c.mp4

深浅色主题支持,包括Tag的颜色:

![tagtypes](https://user-images.githubusercontent.com/34448969/195177127-f63949f8-271d-4767-bccd-f1b5e818a7f8.png)
![tagtypes_light](https://user-images.githubusercontent.com/34448969/195180061-ceebcc25-9e4c-424f-b0c9-ba8e8f4f17f4.png)

## 安装
只需要将`javascript``scripts`和`tags`文件夹复制到你的Web UI安装根目录下.下次启动Web UI时它将自动启动。

`tags`文件夹下包含`config.json`（用于设置）和Tag数据（.csv格式）。默认情况下，Tag数据包括`Danbooru.csv`和`e621.csv`。

在扫描过`/embeddings`和`/scripts/wildcards`后，会将列表存放在`tags/temp`文件夹下。删除该文件夹不会有任何影响，下次启动时它会重新创建。
### 注意:
本脚本的允许需要**全部的三个文件夹**。

## 配置文件
配置文件（config.json）的默认值如下：
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
	"showAllResults": false,
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
| 设置	| 描述 |
|---------|-------------|
| tagFile | 指定要使用的标记文件。您可以提供您喜欢的自定义标签数据库，但由于该脚本是使用 Danbooru 标签开发的，因此它可能无法与其他配置一起正常工作。|
| activeIn | 允许有选择地（取消）激活 txt2img、img2img 和两者的否定提示的脚本。 |
| maxResults | 最多显示多少个结果。对于默认标记集，结果按出现次数排序。对于嵌入和通配符，它​​将在可滚动列表中显示所有结果。 |
| replaceUnderscores | 如果为 true，则在单击标签时将取消划线替换为空格。对于某些型号可能会更好。 |
| escapeParentheses | 如果为 true，则转义包含 () 的标签，因此它们不会对 Web UI 的提示权重功能做出贡献。 |
| useWildcards | 用于切换通配符完成功能。 |
| useEmbeddings | 用于切换嵌入完成功能。 |
| colors | 包含标签类型的可自定义颜色，您可以在此处为自定义标签文件添加新颜色（与文件名相同，不带 .csv）。第一个值是暗模式，第二个值是亮模式。颜色名称和十六进制代码都应该有效。|

### CSV tag data
本脚本的Tag文件格式如下，你可以安装这个格式制作自己的Tag文件:
```csv
1girl,0
solo,0
highres,5
long_hair,0
```
值得注意的是，它不希望第一行中有列名。
第一个值需要是标签名称，而第二个值指定标签类型。
编号系统遵循 Danbooru 的 [tag API docs](https://danbooru.donmai.us/wiki_pages/api%3Atags):
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

标记类型用于为结果列表中的条目着色.
