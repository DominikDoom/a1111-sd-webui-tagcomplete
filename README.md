# Booru tag autocompletion for A1111

This custom script serves as a drop-in extension for the popular [AUTOMATIC1111 web UI](https://github.com/AUTOMATIC1111/stable-diffusion-webui) for Stable Diffusion.

It displays autocompletion hints for recognized tags from "image booru" boards such as Danbooru, which are primarily used for browsing Anime-style illustrations.
Since some Stable Diffusion models were trained using this information, for example [Waifu Diffusion](https://github.com/harubaru/waifu-diffusion), using exact tags in prompts can often improve composition and help to achieve a wanted look.

I created this script as a convenience tool since it reduces the need of switching back and forth between the web UI and a booru site to copy-paste tags.

You can either download the files manually as described below, or use a pre-packaged version from [Releases](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/releases).

(Note: e621 tags aren't added to the releases yet since coloring is broken for them at the moment).

### Disclaimer:
This script is definitely not optimized, and it's not very intelligent. The tags are simply recommended based on their natural order in the CSV, which is their respective image count for the default Danbooru tag list. Also, at least for now, neither keyboard selection for tags nor completion for negative or img2img prompt textboxes is supported, and there's no way to turn the feature off from the ui, but I plan to get around to those features eventually.

## Screenshots
Demo video

https://user-images.githubusercontent.com/34448969/195185810-547d8d0a-bf87-465d-91f1-7fb5c3259c3f.mp4

Dark and Light mode supported, including tag colors:

![tagtypes](https://user-images.githubusercontent.com/34448969/195177127-f63949f8-271d-4767-bccd-f1b5e818a7f8.png)
![tagtypes_light](https://user-images.githubusercontent.com/34448969/195180061-ceebcc25-9e4c-424f-b0c9-ba8e8f4f17f4.png)


## Installation
Simply put `tagAutocomplete.js` into the `javascript` folder of your web UI installation. It will run automatically the next time the web UI is started.
For the script to work, you also need to download the `tags` folder from this repo and paste it and its contents into the web UI root, or create them there manually.

The tags folder contains two files: `config.json` and `danbooru.csv`. This is the data the script uses for autocompletion.

### Config
The config contains the following settings and defaults:
```json
{
	"tagFile": "danbooru.csv",
	"maxResults": 5,
	"replaceUnderscores": true
}
```
| Setting	| Description |
|---------|-------------|
| tagFile | Specifies the tag file to use. You can provide a custom tag database of your liking, but since the script was developed with Danbooru tags in mind, it might not work properly with other configurations.|
| maxResults | How many results to show max. For the default tag set, the results are ordered by occurence count. |
| replaceUnderscores | If true, undescores are replaced with spaces on clicking a tag. Might work better for some models. |

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

The tag type is used for coloring entries in the result list.
