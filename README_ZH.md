![tag_autocomplete_light_zh](https://user-images.githubusercontent.com/34448969/208307331-430696b4-e854-4458-b9e9-f6a6594f19e1.png)

# Booru tag autocompletion for A1111

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/DominikDoom/a1111-sd-webui-tagcomplete)](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/releases)
## [English Document](./README.md)

## 功能概述

本脚本为 [AUTOMATIC1111 web UI](https://github.com/AUTOMATIC1111/stable-diffusion-webui)的自定义脚本,能在输入Tag时提供booru风格（如Danbooru）的TAG自动补全。因为有一些模型是基于这种TAG风格训练的（例如[Waifu Diffusion](https://github.com/harubaru/waifu-diffusion)），因此使用这些Tag能获得较为精确的效果。

这个脚本的创建是为了减少因复制Tag在Web UI和 booru网站的反复切换。
你可以按照[以下方法](#installation)下载或拷贝文件，也可以使用[Releases](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/releases)中打包好的文件。

## 常见问题 & 已知缺陷:
- 当`replaceUnderscores`选项开启时, 脚本只会替换Tag的一部分如果Tag包含多个单词,比如将`atago (azur lane)`修改`atago`为`taihou`并使用自动补全时.会得到 `taihou (azur lane), lane)`的结果, 因为脚本没有把后面的部分认为成同一个Tag。

## 演示与截图
演示视频(使用了键盘导航):

https://user-images.githubusercontent.com/34448969/200128020-10d9a8b2-cea6-4e3f-bcd2-8c40c8c73233.mp4

Wildcard支持演示:

https://user-images.githubusercontent.com/34448969/200128031-22dd7c33-71d1-464f-ae36-5f6c8fd49df0.mp4

深浅色主题支持,包括Tag的颜色:

![results_dark](https://user-images.githubusercontent.com/34448969/200128214-3b6f21b4-9dda-4acf-820e-5df0285c30d6.png)
![results_light](https://user-images.githubusercontent.com/34448969/200128217-bfac8b60-6673-447b-90fd-dc6326f1618c.png)

## 安装
### 作为一种扩展（推荐）
要么把它克隆到你的扩展文件夹里
```bash
git clone "https://github.com/DominikDoom/a1111-sd-webui-tagcomplete.git" extensions/tag-autocomplete
```
(第二个参数指定文件夹的名称，你可以选择任何你喜欢的东西）。

或者手动创建一个文件夹，将 `javascript`、`scripts`和`tags`文件夹放在其中。

### 在根目录下（过时的方法）
这种安装方法适用于添加扩展系统之前的旧版webui，在目前的版本上是行不通的。

---
在这两种配置中，标签文件夹包含`colors.json`和脚本用于自动完成的标签数据。
默认情况下，Tag数据包括`Danbooru.csv`和`e621.csv`。

在扫描过`/embeddings`和wildcards后，会将列表存放在`tags/temp`文件夹下。删除该文件夹不会有任何影响，下次启动时它会重新创建。

### 注意:
本脚本的允许需要**全部的三个文件夹**。

## [Wildcard](https://github.com/jtkelm2/stable-diffusion-webui-1/blob/master/scripts/wildcards.py) &  Embedding 支持
自动补全同样适用于 [Wildcard](https://github.com/jtkelm2/stable-diffusion-webui-1/blob/master/scripts/wildcards.py)中所述的通配符文件(后面有演示视频)。这将使你能够插入Wildcard脚本需要的通配符，更进一步的，你还可以插入通配符文件内的某个具体Tag。

当输入`__`字符时，`/scripts/wildcards`文件夹下的通配符文件会列出到自动补全，当你选择某个具体通配符文件时,会列出其中的所有的具体Tag,但如果你仅需要选择某个通配符，请按下空格。

当输入`<`字符时，`embeddings`文件夹下的`.pt`和`.bin`文件会列出到自动完成。需要注意的是，一些颜文字也会包含`<`(比如`>_<`),所以它们也会出现在结果中。

现在这项功能默认是启用的，并会自动扫描`/embeddings`和`/scripts/wildcards`文件夹，不再需要使用`tags/wildcardNames.txt`文件了，早期版本的用户可以将它删除。

## 配置文件
该扩展有大量的配置和可定制性的内建：

![image](https://user-images.githubusercontent.com/34448969/204093162-99c6a0e7-8183-4f47-963b-1f172774f527.png)

| 设置	| 描述 |
|---------|-------------|
| tagFile | 指定要使用的标记文件。您可以提供您喜欢的自定义标签数据库，但由于该脚本是在考虑 Danbooru 标签的情况下开发的，因此它可能无法与其他配置一起正常工作。|
| activeIn | 允许有选择地（取消）激活 txt2img、img2img 和两者的否定提示的脚本。|
| maxResults | 最多显示多少个结果。对于默认标记集，结果按出现次数排序。对于嵌入和通配符，它​​将在可滚动列表中显示所有结果。 |
| showAllResults | 如果为真，将忽略 maxResults 并在可滚动列表中显示所有结果。 **警告：** 对于长列表，您的浏览器可能会滞后。 |
| resultStepLength | 允许以指定大小的小批次加载结果，以便在长列表中获得更好的性能，或者在showAllResults为真时。 |
| delayTime | 指定在触发自动完成之前要等待多少毫秒。有助于防止打字时过于频繁的更新。 |
| replaceUnderscores | 如果为 true，则在单击标签时将取消划线替换为空格。对于某些型号可能会更好。|
| escapeParentheses | 如果为 true，则转义包含 () 的标签，因此它们不会对 Web UI 的提示权重功能做出贡献。 |
| useWildcards | 用于切换通配符完成功能。 |
| useEmbeddings | 用于切换嵌入完成功能。 |
| alias | 标签别名的选项。更多信息在下面的部分。 |
| translation | 用于翻译标签的选项。更多信息在下面的部分。 |
| extras | 附加标签文件/翻译的选项。更多信息在下面的部分。|

### colors.json (标签颜色)
此外，标签类型的颜色可以使用扩展的`tags`文件夹中单独的`colors.json`文件来指定。
你也可以在这里为自定义标签文件添加新的（与文件名相同，不带 .csv）。第一个值是暗模式，第二个值是亮模式。颜色名称和十六进制代码都被支持。
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
数字是指定标签的类型，这取决于标签的来源。例如，见[CSV tag data](#csv-tag-data)。

### 别名，翻译&新增Tag
#### 别名
像Booru网站一样，标签可以有一个或多个别名，完成后重定向到实际值。这些将根据`config.json`中的设置进行搜索/显示。
- `searchByAlias` - 是否也要搜索别名，或只搜索实际的标签。
- `onlyShowAlias` - 只显示别名，不显示 `别名->实际`。仅用于显示，最后的文本仍然是实际的标签。

#### 翻译
可以在翻译部分添加一个额外的文件，它将被用来翻译标签和别名，同时也可以通过翻译进行搜索。
这个文件需要是CSV格式的`<英语标签/别名>,<翻译>`，但为了向后兼容使用三栏格式的旧的额外文件，你可以打开`oldFormat`来代替它。

完整和部分中文标签集的示例：

![IME-input](https://user-images.githubusercontent.com/34448969/200126551-2264e9cc-abb2-4450-9afa-43f362a77ab0.png)
![english-input](https://user-images.githubusercontent.com/34448969/200126513-bf6b3940-6e22-41b0-a369-f2b4640f87d6.png)

**重要的是**
从最近的更新来看，用旧的Extra文件方式添加的翻译只能作为一个别名使用，如果输入该翻译的英文标签，将不再可见。

可以通过多种方式添加别名，这就是额外文件发挥作用的地方。
1. 作为仅包含已翻译标签行的额外文件（因此仍包括英文标签名称和标签类型）。将根据名称和类型与主文件中的英文标签匹配，因此对于大型翻译文件可能会很慢。
2. 作为 `onlyAliasExtraFile` 为 true 的额外文件。使用此配置，额外文件必须包含*仅*翻译本身。这意味着它完全基于索引，将翻译分配给主要标签非常快，但也需要匹配行（包括空行）。如果主文件中的顺序或数量发生变化，则翻译可能不再匹配。

因此，对于每种方法，您的 CSV 值将如下所示：
|            |       1                  |       2                  |
|------------|--------------------------|--------------------------|
| Main file  | `tag,type,count,(alias)` | `tag,type,count,(alias)` |
| Extra file | `tag,type,(count),alias` | `alias`                  |

额外文件中的计数是可选的，因为自定义标签集并不总是有帖子计数。
如果额外的标签与任何现有标签都不匹配，它将作为新标签添加到列表中。

### CSV tag data
本脚本的Tag文件格式如下，你可以安装这个格式制作自己的Tag文件:
```csv
1girl,0,4114588,"1girls,sole_female"
solo,0,3426446,"female_solo,solo_female"
highres,5,3008413,"high_res,high_resolution,hires"
long_hair,0,2898315,longhair
commentary_request,5,2610959,
```
值得注意的是，不希望在第一行有列名，而且count和aliases在技术上都是可选的。
尽管count总是包含在默认数据中。多个别名也需要用逗号分隔，但要用字符串引号包裹，以免破坏CSV解析。
编号系统遵循 Danbooru 的 [tag API docs](https://danbooru.donmai.us/wiki_pages/api%3Atags):
| Value	| Description |
|-------|-------------|
|0	    | General     |
|1	    | Artist      |
|3	    | Copyright   |
|4	    | Character   |
|5	    | Meta        |

类似的还有e621：
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
