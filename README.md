![tag_autocomplete_light](https://user-images.githubusercontent.com/34448969/208306863-90bbd663-2cb4-47f1-a7fe-7b662a7b95e2.png)

<div align="center">

# SD WebUI Tag Autocomplete
## English • [简体中文](./README_ZH.md) • [日本語](./README_JA.md)

Booru style tag autocompletion for the AUTOMATIC1111 Stable Diffusion WebUI

[![Github Release][release-shield]][release-url]
[![stargazers][stargazers-shield]][stargazers-url]
[![contributors][contributors-shield]][contributors-url]
[![forks][forks-shield]][forks-url]
[![issues][issues-shield]][issues-url]

[Changelog][release-url] •
[Known Issues](#%EF%B8%8F-common-problems--known-issues) •
[Report Bug][issues-url] •
[Request Feature][issues-url]
</div>
<br/>

# 📄 Description

Tag Autocomplete is an extension for the popular [AUTOMATIC1111 web UI](https://github.com/AUTOMATIC1111/stable-diffusion-webui) for Stable Diffusion.

It displays autocompletion hints for recognized tags from "image booru" boards such as Danbooru, which are primarily used for browsing Anime-style illustrations.
Since some Stable Diffusion models were trained using this information, for example [Waifu Diffusion](https://github.com/harubaru/waifu-diffusion) and many of the NAI-descendant models or merges, using exact tags in prompts can often improve composition and consistency.

You can install it using the inbuilt available extensions list, clone the files manually as described [below](#-installation), or use a pre-packaged version from [Releases](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/releases).

<br/>

# ✨ Features
- 🚀 Instant completion hints while typing (under normal circumstances)
- ⌨️ Keyboard navigation
- 🌒 Dark & Light mode support
- 🛠️ Many [settings](#%EF%B8%8F-settings) and customizability
- 🌍 [Translation support](#translations) for tags, with optional live preview for the full prompt
   - **Note:** Translation files are provided by the community, see [here](#list-of-translations) for a list of translations I know of.

Tag autocomplete supports built-in completion for:
- 🏷️ **Danbooru & e621 tags** (Top 100k by post count, as of November 2022)
- ✳️ [**Wildcards**](#wildcards)
- ➕ [**Extra network**](#extra-networks-embeddings-hypernets-lora) filenames, including
   - Textual Inversion embeddings [(jump to readme section)]
   - Hypernetworks
   - LoRA
   - LyCORIS / LoHA
- 🪄 [**Chants**](#chants) (custom format for longer prompt presets)
- 🏷️ "[**Extra file**](#extra-file)", one set of customizable extra tags


Additionally, some support for other third party extensions exists:
<details>
<summary>Click to expand</summary>

- [Image Browser][image-browser-url] - Filename & EXIF keyword search
- [Multidiffusion Upscaler][multidiffusion-url] - Regional Prompts
- [Dataset Tag Editor][tag-editor-url] - Caption, Interrogate Result, Edit Tags & Edit Caption
- [WD 1.4 Tagger][wd-tagger-url] - Additional & Excluded tags
- [Umi AI][umi-url] - Completion for YAML wildcards
</details>
<br/>

# 🖼️ Screenshots & Demo videos
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
<br/>

# 📦 Installation
## Using the built-in extension list
1. Open the `Extensions` tab
2. Open the `Available` sub-tab
3. Click **Load from**
4. Find **Booru tag autocompletion** in the list
   - The extension was one of the first available, so selecting "oldest first" will show it high up in the list.
   - Alternatively, use <kbd>CRTL</kbd> + <kbd>F</kbd> to search for the text on the page
5. Click **Install** on the right side

![Load from index](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/b9b860c1-2e77-41b1-aa5c-a44e252f1a40)
![Order by oldest](https://user-images.githubusercontent.com/34448969/223537231-48e982b8-0920-48c5-87e5-8c81ebbb5fe3.png)
![Install](https://user-images.githubusercontent.com/34448969/223537336-5c02ccb1-233d-4e0d-9e73-d1b889252c49.png)


## Manual clone
```bash
git clone "https://github.com/DominikDoom/a1111-sd-webui-tagcomplete.git" extensions/tag-autocomplete
```
(The second argument specifies the name of the folder, you can choose whatever you like).

<br/>

# ❇️ Additional completion support
## Wildcards
Autocompletion also works with wildcard files used by https://github.com/AUTOMATIC1111/stable-diffusion-webui-wildcards or other similar scripts/extensions.
Completion is triggered by typing `__` (double underscore). It will first show a list of your wildcard files, and upon choosing one, the replacement options inside that file.
This enables you to either insert categories to be replaced by the script, or directly choose one and use wildcards as a sort of categorized custom tag system.

![Wildcard files](https://user-images.githubusercontent.com/34448969/223534518-8488c2e1-d9e5-4870-844f-adbf3bfb1eee.png)
![Wildcard replacements](https://user-images.githubusercontent.com/34448969/223534534-69597907-59de-4ba8-ae83-b01386570124.png)


Wildcards are searched for in every extension folder, as well as the `scripts/wildcards` folder to support legacy versions. This means that you can combine wildcards from multiple extensions. Nested folders are also supported if you have grouped your wildcards in that way.

## Extra networks (Embeddings, Hypernets, LoRA, ...)
Completion for these types is triggered by typing `<`. By default it will show them all mixed together, but further filtering can be done in the following way:
- `<e:` will only show embeddings
- `<l:` will only show LoRA and LyCORIS
   - Or `<lora:` and `<lyco:` respectively for the long form
- `<h:` or `<hypernet:` will only show Hypernetworks

### Embedding type filtering
Embeddings trained for Stable Diffusion 1.x or 2.x models respectively are incompatible with the other type. To make it easier to find valid embeds, they are categorized by "v1 Embedding" and "v2 Embedding", including a slight color difference. You can also filter your search to include only v1 or v2 embeddings by typing `<v1/2` or `<e:v1/2` followed by the actual search term.

For example:

![Embedding version filter](https://user-images.githubusercontent.com/34448969/223533883-d99c04b7-a199-4f56-a4e5-242eee9726a2.png)

## Chants
Chants are longer prompt presets. The name is inspired by some early prompt collections from Chinese users, which often were called along the lines of "Spellbook", "Codex", etc. The prompt snippets from such documents were fittingly called spells or chants for this reason.

Similar to embeddings and loras, this feature is triggered by typing the `<`, `<c:` or `<chant:` commands. For instance, when you enter `<c:HighQuality` in the prompt box and select it, the following prompt text will be inserted:
```
(masterpiece, best quality, high quality, highres, ultra-detailed),
```


Chants can be added in JSON files following this format:
<details>
<summary>Chant format (click to expand)</summary>

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
</details>
<br/>

The file can then be selected using the "Chant file" settings dropdown if it is located inside the extension's `tags` folder.

A chant object has four fields:
- `name` - Display name
- `terms` - Search terms
- `content` - The actual prompt content
- `color` - Color, using the same category color system as normal tags

## Umi AI tags
https://github.com/Klokinator/Umi-AI is a feature-rich wildcard extension similar to Unprompted or Dynamic Wildcards.
In recent releases, it uses YAML-based wildcard tags to enable a complex chaining system,for example `<[preset][--female][sfw][species]>` will choose the preset category, exclude female related tags, further narrow it down with the following categories, and then choose one random fill-in matching all these criteria at runtime. Completion is triggered by `<[` and then each following new unclosed bracket, e.g. `<[xyz][`, until closed by `>`.

Tag Autocomplete can recommend these options in a smart way, meaning while you continue to add category tags, it will only show results still matching what comes before.
It also shows how many fill-in tags are available to choose from for that combo in place of the tag post count, enabling a quick overview and filtering of the large initial set.

Most of the credit goes to [@ctwrs](https://github.com/ctwrs) here, they contributed a lot as one of the Umi developers.

# 🛠️ Settings

The extension has a large amount of configuration & customizability built in. Most should be self-explanatory, but for a detailed description click on a section below.

<!-- Filename -->
<details>
<summary>Tag filename</summary>

The main tag file the script uses. Included by default are `danbooru.csv` and `e621.csv`. While you can add custom tags here, the vast majority of models are not trained on anything other than these two (mostly danbooru), so it will not have much benefit.

You can also set it to `None` if you want to use other functionality of the extension (e.g. Wildcard or LoRA completion), but aren't interested in the normal tags.

![tagfile](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/2b37c581-aeb1-4642-b0a4-c93c4c059a7a)
</details>
<!-- Active In -->
<details>
<summary>"Active in" settings</summary>

Specifies where tag autocomplete should attach itself to and listen for changes.
Negative prompts follow the settings for txt2img & img2img, so they will only be active if their "parent" is active.

![activeIn](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/936538c9-2ed0-4254-8e91-9f2ed1af0ccf)
</details>
<!-- Blacklist -->
<details>
<summary>Black / Whitelist</summary>

While the above options can turn off tag autocomplete globally, sometimes you might want to enable or disable it only for specific models. For example, if most of your models are Anime ones, you could add your photorealistic models, that weren't trained on booru tags and don't benefit from it, to the blacklist, which will automatically disable it after you switch to these models. You can use both the model name (including file extension) and their webui hashes (both short and long form).

`Blacklist` will exclude all specified models, while `Whitelist` will only activate it for these and stay off by default. One exception is an empty whitelist, which will be ignored (making it the same as an empty blacklist).

![blacklist](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/13e46ce5-fe6d-4d15-98ac-cfe30ca419e9)
</details>
<!-- Move Popup -->
<details>
<summary>Move completion popup with cursor</summary>

This option enables or disables the floating popup to follow the position of your cursor, like it would do in an IDE. The script tries to reserve enough room for the popup to prevent squishing on the right side, but that doesn't always work for longer tags. If disabled, the popup will stay on the left.

![movePopup](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/26e6050f-a70e-49a3-add0-2b58cdef37a2)
	
![movePopup_on](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/f10a3c16-ce49-4bdb-a106-2810d5343bd7)
![movePopup_off](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/469f0a79-3839-4ad2-8dc0-4a1298ffff05)
</details>
<!-- Results Count -->
<details>
<summary>Result count</summary>

Settings for the amount of results to show at once.
If `Show all results` is active, it will show a scrollable list instead of cutting it off after the number specified in `Maximum results`. For performance reasons, in that case not all are loaded at once, but instead in blocks. The block size is dictated by `How many results to load at once`. Once you reach the bottom, the next block will load (but that should rarely happen).

Notably, `Maximum results` will still have an influence if `Show all results` is used, since it dictates the height of the popup before scrolling begins.

![resultsCount](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/f9ffeb4b-6c82-48ed-a204-f4658e335f7e)
</details>
<!-- Delay time -->
<details>
<summary>Completion delay</summary>

Depending on the configuration, real time tag completion can get computationally expensive.
This option sets a "debounce" delay in milliseconds (1000ms = 1s), during which no second completion will get queried. This might especially be useful if you type very fast.

![delay](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/d1718dc1-32c3-4075-80aa-b6caebcafa05)
</details>
<!-- Search for -->
<details>
<summary>"Search for" settings</summary>

Pretty self explanatory, enables or disables certain completion types.

Umi AI wildcards are included in the normal wildcard option here, although they use a different format, since their usage intention is similar.

![searchFor](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/9e7c27eb-68fb-47cd-a7c7-333476374c58)
</details>
<!-- Wiki links -->
<details>
<summary>"?" Wiki links</summary>

If this option is turned on, it will show a `?` link next to the tag. Clicking this will try to open the wiki page for that tag on danbooru or e621, depending on which tag file you use.

> ⚠️ Warning:
>
> Danbooru and e621 are external sites and include a lot of NSFW content, which might show in the list of examples for a tag on its wiki page. Because of this, the option is disabled by default.

![wikiLink](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/733e1ba8-89e1-4c2b-8c4e-2d23352bd3d7)
</details>
<!-- Insertion -->
<details>
<summary>Completion settings</summary>

These settings specify how the text will be inserted.

Booru sites mostly use underscores in tags instead of spaces, but during preprocessing most models replaced this back with spaces since the CLIP encoder used in Stable diffusion was trained on natural language. Thus, by default tag autocomplete will as well.

Parentheses are used as control characters in the webui to give more attention / weight to a specific part of the prompt, so tags including parentheses are escaped (`\( \)`) by default to not influence that.

Depending on the last setting, tag autocomplete will append a comma and space after inserting a tag, which may help for rapid completion of multiple tags in a row.

![insertEscape](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/d28557be-6c75-43fd-bf17-c0609223b384)
</details>
<!-- Wildcard path mode -->
<details>
<summary>Wildcard path completion</summary>

Some collections of wildcards are organized in nested subfolders.
They are listed with the full path to the file, like "hair/colors/light/..." or "clothing/male/casual/..." etc.

In these cases it is often hard to type the full path manually, but you still want to narrow the selection before further scrolling in the list.
For this, a partial completion of the path can be triggered with <kbd>Tab</kbd> (or the custom hotkey for `ChooseSelectedOrFirst`) if the results to choose from are all paths. 

This setting determines the mode it should use for completion:
- To next folder level:
   - Completes until the next `/` in the path, preferring your selection as the way forward
   - If you want to directly choose an option, <kbd>Enter</kbd> / the `ChooseSelected` hotkey will skip it and fully complete.
- To first difference:
   - Completes until the first difference in the results and waits for additional info
   - E.g. if you have "/sub/folder_a/..." and "/sub/folder_b/...", completing after typing "su" will insert everything up to "/sub/folder_" and stop there until you type a or b to clarify.
   - If you selected something with the arrow keys (regardless of pressing Enter or Tab), it will skip it and fully complete.
- Always fully:
   - As the name suggests, disables the partial completion behavior and inserts the full path under all circumstances like with normal tags.

![insertWildcardPath](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/ed354bd1-3f23-4fb1-a638-ac3b7a213fc5)
</details>
<!-- Alias -->
<details>
<summary>Alias settings</summary>

Tags often are referred to with multiple aliases. If `Search by alias` is turned on, those will be included in the search results, which might help if you are unsure of the correct tag. They will still get replaced by the actual tag they are linked to on insertion, since that is what the models were trained on.

`Only show alias` sets if you want to see only the alias or also the tag it maps to
(shown as `<alias> ➝ <actual>`)

![alias](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/f2087510-67cf-448d-88f7-81eb677412b5)
</details>
<!-- Translations -->
<details>
<summary>Translation settings</summary>

Tag Autocomplete has support for tag translations specified in a separate file (`Translation filename`). You can search for tags using those translations, meaning that if you don't know the English tagword and have a translation file in your native language, you can use that instead.

It also has a legacy format option for some old files used in the community, as well as an experimental live translation preview for the whole prompt so you can easily find and edit tags afterwards.

For more details, see the [section on translations](#translations) below.

![translation](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/a860c5dc-7428-46ac-a8a8-5d1b2b773a60)
</details>
<!-- Extra file -->
<details>
<summary>Extra file settings</summary>

Specifies a set of extra tags that get appended either before or after the regular results, as specified here. Mostly useful for small custom tag sets such as the commonly used quality tags (masterpiece, best quality, etc.)

If you want completion for longer presets or even whole prompts, have a look at [Chants](#chants) instead.

![extraFile](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/14c28af2-b3cb-42b1-a13e-ee0c688a4a5d)
</details>
<!-- Chants -->
<details>
<summary>Chant filename</summary>

Chants are longer presets or even whole prompts that can be selected & inserted at once, similar to the built in styles dropdown of the webui. They do offer some additional features though, and are faster to use.

For more info, see the section on [Chants](#chants) above.
	
![chants](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/e8045d41-a776-49b3-8298-c879097661a4)
</details>
<!-- Hotkeys -->
<details>
<summary>Hotkeys</summary>

You can specify the hotkeys for most keyboard navigation features here.
Should be one of the key names specified in https://www.w3.org/TR/uievents-key/#named-key-attribute-value.

Function explanation:
- Move Up / Down: Select the next tag
- Jump Up / Down: Move by five places at once
- Jump to Start / End: Jump to the top or bottom of the list
- ChooseSelected: Select the highlighted tag, or close popup if nothing was selected
- ChooseSelectedOrFirst: Same as above, but default to the first result if nothing was selected
- Close: Closes the popup

![hotkeys](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/7e9bafd7-d5bd-4e1f-a1eb-f08bebba1423)
</details>
<!-- Colors -->
<details>
<summary>Colors</summary>

Here, you can change the default colors used for different tag categories. They were chosen to be similar to the category colors of their source site.

The format is standard JSON
- The object names correspond to the tag filename they should be used for.
- The numbers are specifying the tag type, which is dependent on the tag source. For more info, see [CSV tag data](#csv-tag-data).
- The first value in the square brackets is for dark, the second for light mode. HTML color names and hex codes should both work.

This can also be used to add new color sets for custom tag files.
	
![colors](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/b9b66d8d-5619-4bd3-bdb6-053a01540d71)
</details>
<!-- Temp files refresh -->
<details>
<summary>Refresh TAC temp files</summary>

This is a "fake" setting, meaning it doesn't actually configure anything. Rather, it is a small hack to abuse the refresh button developers can add to webui options. Clicking on the refresh button next to this setting will force tag autocomplete to recreate and reload some temporary internal files, which normally only happens on restarting the UI.

Tag autocomplete depends on these files for various functionality, especially related to extra networks and wildcard completion. This setting can be used to rebuild the lists if you have, for example, added a few new LoRAs into the folder and don't want to restart the UI to get tag autocomplete to list them.

You can also add this to your quicksettings bar to have the refresh button available at all times.

![fakeRefresh](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/9eb87446-a635-4623-89b5-a76ab39e879a)
</details>
<br/>

# Translations
An additional file can be added in the translation section, which will be used to translate both tags and aliases and also enables searching by translation.
This file needs to be a CSV in the format `<English tag/alias>,<Translation>`, but for backwards compatibility with older files that used a three column format, you can turn on `Translation file uses old 3-column translation format instead of the new 2-column one` to support them. In that case, the second column will be unused and skipped during parsing.

Example with Chinese translation:

![IME-input](https://user-images.githubusercontent.com/34448969/200126551-2264e9cc-abb2-4450-9afa-43f362a77ab0.png)
![english-input](https://user-images.githubusercontent.com/34448969/200126513-bf6b3940-6e22-41b0-a369-f2b4640f87d6.png)

## List of translations
- [🇨🇳 Chinese tags](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/discussions/23) by @HalfMAI, using machine translation and manual correction for the most common tags (uses legacy format)
- [🇨🇳 Chinese tags](https://github.com/sgmklp/tag-for-autocompletion-with-translation) by @sgmklp, smaller set of manual translations based on https://github.com/zcyzcy88/TagTable

> ### 🫵 I need your help!
> Translations are a community effort. If you have translated a tag file or want to create one, please open a Pull Request or Issue so your link can be added here.
> Please make sure the quality is alright though, machine translation gets a lot of stuff wrong even for the most common tags.

## Live preview
> ⚠️ Warning:
>
> This feature is still experimental, you might encounter some bugs when using it.

This will show a live preview of all detected tags in the prompt, both correctly separated by commas as well as in a longer sentence. It can detect up to three-word pairs in natural sentences, preferring perfect multi-word matches over single tags.

Above the detected tags will be their translation from the translation file, so if you aren't sure what the English tag means, you can easily find it there even after they have been inserted into the prompt (instead of just in the popup during completion).

The option defaults to off, but you can activate it by choosing a translation file and checking "Show live tag translation below prompt".
It will not affect the normal functionality if it is off.

Example with Chinese translation:

![image](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/bbc0b860-78f6-498f-91f9-33cf840716f7)

Clicking on a detected tag will also select it in the prompt for quick editing.

![image](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/c6380106-e1e2-4da9-a819-7808ff30e8f5)

#### ⚠️ Known issues with live translation:
The translation updates when the user types or pastes text, but not if the action happens programmatically (e.g. applying a style or loading from PNG Info / Image Browser). This can be worked around by typing something manually after the programmatic edit.

# Extra file
An extra file can be used to add new / custom tags not included in the main set.
The format is identical to the normal tag format shown in [CSV tag data](#csv-tag-data) below, with one exception:
Since custom tags likely have no count, column three (or two if counting from zero) is instead used for the gray meta text displayed next to the tag.
If left empty, it will instead show "Custom tag".

An example with the included (very basic) extra-quality-tags.csv file:

![image](https://user-images.githubusercontent.com/34448969/218264276-cd77ba8e-62d8-41a2-b03c-6c04887ee18b.png)

Whether the custom tags should be added before or after the normal tags can be chosen in the settings.

# CSV tag data
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


## ⚠️ Common Problems & Known Issues:
- Depending on your browser settings, sometimes an old version of the script can get cached. Try
<kbd>CTRL</kbd> + <kbd>F5</kbd>
to force-reload the site without cache if e.g. a new feature doesn't appear for you after an update.
- If the prompt popup has broken styling for you or doesn't appear at all (like [this](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/7bbfdd54-fc23-4bfc-85af-24704b139b3a)), make sure to update your **openpose-editor** extension if you have it installed. It is known to cause issues with other extensions in older versions.


<!-- Variable declarations for shorter main text -->
[release-shield]: https://img.shields.io/github/v/release/DominikDoom/a1111-sd-webui-tagcomplete?logo=github&style=
[release-url]: https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/releases

[contributors-shield]: https://img.shields.io/github/contributors/DominikDoom/a1111-sd-webui-tagcomplete
[contributors-url]: https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/graphs/contributors

[forks-shield]: https://img.shields.io/github/forks/DominikDoom/a1111-sd-webui-tagcomplete
[forks-url]: https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/network/members

[stargazers-shield]: https://img.shields.io/github/stars/DominikDoom/a1111-sd-webui-tagcomplete
[stargazers-url]: https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/stargazers

[issues-shield]: https://img.shields.io/github/issues/DominikDoom/a1111-sd-webui-tagcomplete
[issues-url]: https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/issues/new/choose

<!-- Links for feature section -->
[image-browser-url]: https://github.com/AlUlkesh/stable-diffusion-webui-images-browser
[multidiffusion-url]: https://github.com/pkuliyi2015/multidiffusion-upscaler-for-automatic1111
[tag-editor-url]: https://github.com/toshiaki1729/stable-diffusion-webui-dataset-tag-editor
[wd-tagger-url]: https://github.com/toriato/stable-diffusion-webui-wd14-tagger
[umi-url]: https://github.com/Klokinator/Umi-AI
