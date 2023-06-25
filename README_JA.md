![tag_autocomplete_light](https://user-images.githubusercontent.com/34448969/208306863-90bbd663-2cb4-47f1-a7fe-7b662a7b95e2.png)

<div align="center">

# SD WebUI Tag Autocomplete
## [English Document](./README.md), [中文文档](./README_ZH.md), 日本語

Booruスタイルタグを自動補完するためのAUTOMATIC1111 Stable Diffusion WebUI用拡張機能

[![Github Release][release-shield]][release-url]
[![stargazers][stargazers-shield]][stargazers-url]
[![contributors][contributors-shield]][contributors-url]
[![forks][forks-shield]][forks-url]
[![issues][issues-shield]][issues-url]

[変更内容][release-url] •
[確認されている問題](#%EF%B8%8F-よくある問題また現在確認されている問題) •
[バグを報告する][issues-url] •
[機能追加に関する要望][issues-url]
</div>
<br/>

# 📄 説明

Tag AutocompleteはStable Diffusion向けの人気のweb UIである、[AUTOMATIC1111 web UI](https://github.com/AUTOMATIC1111/stable-diffusion-webui)の拡張機能として利用できます。

主にアニメ系イラストを閲覧するための掲示板「Danbooru」などで利用されているタグの自動補完ヒントを表示するための拡張機能となります。  
例えば[Waifu Diffusion](https://github.com/harubaru/waifu-diffusion)やNAIから派生した多くのモデルやマージなど、Stable Diffusionモデルの中にはこの情報を使って学習されたものもあるため、プロンプトに正確なタグを使用することで、多くのケースで構図を改善した思い通りの画像が生成できるようになります。

組み込みの利用可能な拡張機能リストを使ってインストールしたり、[下記](#-インストール)の説明に従って手動でファイルをcloneしたり、[Releases](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/releases)にあるパッケージ済みのバージョンを使うことができます。

<br/>

# ✨ Features
- 🚀 タイピング中に補完のためのヒントを表示 (通常時)
- ⌨️ キーボードナビゲーション
- 🌒 ダーク＆ライトモードのサポート
- 🛠️ 多くの[設定](#%EF%B8%8F-設定)とカスタマイズ性を提供
- 🌍 [翻訳サポート](#翻訳)タグ、オプションでプロンプトのライブ プレビュー付き
   - 私が知っている翻訳のリストは[こちら](#翻訳リスト)を参照してください。

タグの自動補完は組み込まれている補完内容をサポートしています：
- 🏷️ **Danbooru & e621 tags** (投稿数上位100k、2022年11月現在)
- ✳️ [**ワイルドカード**](#ワイルドカード)
- ➕ [**Extra networks**](#extra-networks-embeddings-hypernets-lora-) filenames, including
   - Textual Inversion embeddings
   - Hypernetworks
   - LoRA
   - LyCORIS / LoHA
- 🪄 [**Chants（詠唱）**](#chants詠唱) (長いプロンプトプリセット用のカスタムフォーマット)
- 🏷️ "[**Extra file**](#extra-file)", カスタマイズ可能なextra tagsセット


さらに、サードパーティの拡張機能にも対応しています：
<details>
<summary>クリックして開く</summary>

- [Image Browser][image-browser-url] - ファイル名とEXIFキーワードによる検索
- [Multidiffusion Upscaler][multidiffusion-url] - 地域別のプロンプト
- [Dataset Tag Editor][tag-editor-url] - キャプション, 結果の確認, タグの編集 & キャプションの編集
- [WD 1.4 Tagger][wd-tagger-url] - 追加と除外タグ
- [Umi AI][umi-url] - YAMLワイルドカードの補完
</details>
<br/>

## スクリーンショット & デモ動画
<details>
<summary>クリックすると開きます</summary>
基本的な使い方 (キーボード操作を用いたもの):

https://user-images.githubusercontent.com/34448969/200128020-10d9a8b2-cea6-4e3f-bcd2-8c40c8c73233.mp4

ワイルドカードをサポート:

https://user-images.githubusercontent.com/34448969/200128031-22dd7c33-71d1-464f-ae36-5f6c8fd49df0.mp4

タグカラーを含むDarkモードとLightモードに対応:

![results_dark](https://user-images.githubusercontent.com/34448969/200128214-3b6f21b4-9dda-4acf-820e-5df0285c30d6.png)
![results_light](https://user-images.githubusercontent.com/34448969/200128217-bfac8b60-6673-447b-90fd-dc6326f1618c.png)
</details>

# 📦 インストール
## 内蔵されている拡張機能リストを用いた方法
1. Extensions タブを開く
2. Available タブを開く
3. "Load from:" をクリック
4. リストの中から "Booru tag autocompletion" を探す
   - この拡張機能は最初から利用可能だったものなので、 "oldest first" を選択すると、リストの上位に表示されます。
5. 右側にある "Install" をクリック

![Load from index](https://user-images.githubusercontent.com/34448969/223537209-24c7623e-7410-427e-857f-9da936aadb21.png)
![Order by oldest](https://user-images.githubusercontent.com/34448969/223537231-48e982b8-0920-48c5-87e5-8c81ebbb5fe3.png)
![Install](https://user-images.githubusercontent.com/34448969/223537336-5c02ccb1-233d-4e0d-9e73-d1b889252c49.png)


## 手動でcloneする方法
```bash
git clone "https://github.com/DominikDoom/a1111-sd-webui-tagcomplete.git" extensions/tag-autocomplete
```
（第2引数でフォルダ名を指定可能なので、好きな名前を指定しても良いでしょう）

# ❇️ 追加で有効化できる補完機能
## ワイルドカード

自動補完は、https://github.com/AUTOMATIC1111/stable-diffusion-webui-wildcards 、または他の類似のスクリプト/拡張機能で使用されるワイルドカードファイルでも利用可能です。補完は `__` (ダブルアンダースコア) と入力することで開始されます。最初にワイルドカードファイルのリストが表示され、1つを選択すると、そのファイル内の置換オプションが表示されます。
これにより、スクリプトによって置換されるカテゴリを挿入するか、または直接1つを選択して、ワイルドカードをカテゴリ化されたカスタムタグシステムのようなものとして使用することができます。

![Wildcard files](https://user-images.githubusercontent.com/34448969/223534518-8488c2e1-d9e5-4870-844f-adbf3bfb1eee.png)
![Wildcard replacements](https://user-images.githubusercontent.com/34448969/223534534-69597907-59de-4ba8-ae83-b01386570124.png)


ワイルドカードはすべての拡張機能フォルダと、古いバージョンをサポートするための `scripts/wildcards` フォルダで検索されます。これは複数の拡張機能からワイルドカードを組み合わせることができることを意味しています。ワイルドカードをグループ化した場合、ネストされたフォルダもサポートされます。

## Extra networks (Embeddings, Hypernets, LoRA, ...)
これら3つのタイプの補完は、`<`と入力することで行われます。デフォルトでは3つとも混在して表示されますが、以下の方法でさらにフィルタリングを行うことができます：
- `<e:` は、embeddingsのみを表示します。
- `<l:` は、LoRAとLyCORISのみを表示します。
  - または `<lora:` と　`<lyco:` で入力することも可能です
- `<h:` 、または `<hypernet:` はHypernetworksのみを表示します

### Embedding type filtering
Stable Diffusion 1.xまたは2.xモデル用にそれぞれトレーニングされたembeddingsは、他のタイプとの互換性がありません。有効なembeddingsを見つけやすくするため、若干の色の違いも含めて「v1 Embedding」と「v2 Embedding」で分類しています。また、`<v1/2`または`<e:v1/2`に続けて実際の検索のためのキーワードを入力すると、v1またはv2embeddingsのみを含むように検索を絞り込むことができます。

例:

![Embedding version filter](https://user-images.githubusercontent.com/34448969/223533883-d99c04b7-a199-4f56-a4e5-242eee9726a2.png)

## Chants（詠唱）
Chants（詠唱）は、より長いプロンプトプリセットです。この名前は、中国のユーザーによる初期のプロンプト集からヒントを得たもので、しばしば「呪文書」（原文は「Spellbook」「Codex」）などと呼ばれていました。  
このような文書から得られるプロンプトのスニペットは、このような理由から呪文や詠唱と呼ばれるにふさわしいものでした。

EmbeddingsやLoraと同様に、この機能は `<`, `<c:`, `<chant:` コマンドを入力することで発動します。例えば、プロンプトボックスに `<c:HighQuality` と入力して選択すると、次のようなプロンプトテキストが挿入されます：

```
(masterpiece, best quality, high quality, highres, ultra-detailed),
```

Chants（詠唱）は、以下のフォーマットに従ってJSONファイルで追加することができます：:

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

このファイルが拡張機能の `tags` フォルダ内にある場合、settings内の"Chant file"ドロップダウンから選択することができます。

chantオブジェクトは4つのフィールドを持ちます：
- `name` - 表示される名称
- `terms` - 検索キーワード
- `content` - 実際に挿入されるプロンプト
- `color` - 表示される色。通常のタグと同じカテゴリーカラーシステムを使用しています。

## Umi AI tags
https://github.com/Klokinator/Umi-AI は、Unprompted や Dynamic Wildcards に似た、機能豊富なワイルドカード拡張です。  
例えば `<[preset][--female][sfw][species]>` はプリセットカテゴリーを選び、女性関連のタグを除外し、さらに次のカテゴリーで絞り込み、実行時にこれらすべての条件に一致するランダムなフィルインを1つ選び出します。補完は `<[`] とそれに続く新しい開く括弧、例えば `<[xyz][`] で始まり、 `>` で閉じるまで続きます。

タグの自動補完は、これらのオプションをスマートに提案していきます。つまり、カテゴリータグの追加を続けても、その前に来たものと一致する結果だけが表示されるのです。
また、タグの投稿数の代わりに、そのコンボから選択可能なフィルインタグの数を表示し、大規模になる初期内容に対して迅速な概要とフィルタリングを可能にします。

ほとんどの功績は[@ctwrs](https://github.com/ctwrs)によるものです。この方はUmiの開発者の一人として多くの貢献をしています。

# 🛠️ 設定

この拡張機能には多くの設定とカスタマイズ機能が組み込まれています。ほとんどのことははっきりしていますが、詳細な説明は以下のセクションをクリックしてください。

<!-- Filename -->
<details>
<summary>Tag filename</summary>

スクリプトが使用するメインのタグファイルとなります。デフォルトでは `danbooru.csv` と `e621.csv` が含まれており、ここにカスタムタグを追加することもできますが、大半のモデルはこの2つ以外（主にdanbooru）では学習していないため、あまり意味はありません。

拡張機能の他の機能（ワイルドカードやLoRA補完など）を使いたいが、通常のタグには興味がない場合は、`None`に設定することも可能です。

![tagfile](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/2b37c581-aeb1-4642-b0a4-c93c4c059a7a)
</details>

<!-- Active In -->
<details>
<summary>"Active in" の設定</summary>

タグのオートコンプリートがどこにアタッチされ、変更を受け付けるかを指定します。
ネガティブプロンプトはtxt2imgとimg2imgの設定に従うので、"親 "がアクティブな場合にのみアクティブとなります。

![activeIn](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/936538c9-2ed0-4254-8e91-9f2ed1af0ccf)
</details>

<!-- Blacklist -->
<details>
<summary>Black / Whitelist</summary>

このオプションは、タグのオートコンプリートをグローバルにオフにすることができますが、特定のモデルに対してのみ有効または無効にしたい場合もあります。  
例えば、あなたのモデルのほとんどがアニメモデルである場合、boorタグでトレーニングされておらず、その恩恵を受けないフォトリアリスティックモデルをブラックリストに追加し、これらのモデルに切り替えた後に自動的に無効にすることができます。モデル名(拡張子を含む)とwebuiハッシュ(短い形式と長い形式の両方)の両方を使用できます。

`Blacklist`は指定したすべてのモデルを除外しますが、`Whitelist`はこれらのモデルに対してのみ有効で、デフォルトではオフのままです。例外として、空のホワイトリストは無視されます（空のブラックリストと同じです）。

![blacklist](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/13e46ce5-fe6d-4d15-98ac-cfe30ca419e9)
</details>
<!-- Move Popup -->
<details>
<summary>カーソルで補完ポップアップを移動</summary>

このオプションは、IDEで行われるような、カーソルの位置に追従するフローティングポップアップを有効または無効にします。スクリプトはポップアップが右側でつぶれないように十分なスペースを確保しようとしますが、長いタグでは必ずしもうまくいきません。無効にした場合、ポップアップは左側に表示されます。

![movePopup](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/26e6050f-a70e-49a3-add0-2b58cdef37a2)
	
![movePopup_on](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/f10a3c16-ce49-4bdb-a106-2810d5343bd7)
![movePopup_off](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/469f0a79-3839-4ad2-8dc0-4a1298ffff05)
</details>
<!-- Results Count -->
<details>
<summary>結果の数</summary>

一度に表示する結果の量を設定できます。  
`Show all results`が有効な場合、`Maximum results`で指定された数で切り捨てられるのではなく、スクロール可能なリストが表示されます。パフォーマンス上の理由から、この場合はすべてを一度に読み込むのではなく、ブロック単位で読み込みます。ブロックの大きさは`How many results to load at once`によって決まります。一番下に到達すると、次のブロックがロードされます（しかし、そんなことはめったには起こらないと思います）。

特筆すべきこととして、`Show all results` が使用される場合でも、`Maximum results` は影響を及ぼします。これは、スクロールが開始される前のポップアップの高さを制限するからです。

![resultsCount](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/f9ffeb4b-6c82-48ed-a204-f4658e335f7e)
</details>
<!-- Delay time -->
<details>
<summary>補完の遅れについて</summary>

設定によっては、リアルタイムのタグ補完は計算量が多くなることがあります。  
このオプションは debounce による遅延をミリ秒単位で設定します（1000ミリ秒 = 1秒）。このオプションは、入力が非常に速い場合に特に有効です。

![delay](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/d1718dc1-32c3-4075-80aa-b6caebcafa05)
</details>
<!-- Search for -->
<details>
<summary>"Search for" に関する設定</summary>

特定の補完タイプを有効または無効にします。

Umi AIワイルドカードは、使用目的が似ているため、異なるフォーマットを使用しますが、ここでは通常のワイルドカードオプションに含まれます。

![searchFor](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/9e7c27eb-68fb-47cd-a7c7-333476374c58)
</details>
<!-- Wiki links -->
<details>
<summary>"?" Wiki links</summary>

このオプションがオンになっている場合、タグの横に `?` リンクが表示されます。これをクリックすると、danbooruまたはe621のそのタグのWikiページを開こうとします。

> ⚠️ 警告：
>
> Danbooruとe621は外部サイトであり、多くのNSFWコンテンツを含んでいます。このため、このオプションはデフォルトで無効になっています。

![wikiLink](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/733e1ba8-89e1-4c2b-8c4e-2d23352bd3d7)
</details>
<!-- Insertion -->
<details>
<summary>補完設定</summary>

これらの設定で、テキストの挿入方法を指定できます。

Booruのサイトでは、タグにスペースの代わりにアンダースコアを使用することがほとんどですが、Stable diffusionで使用されているCLIPエンコーダーは自然言語でトレーニングされているため、前処理中にほとんどのモデルがこのアンダースコアをスペースに置き換えました。したがって、デフォルトではタグのオートコンプリートも同じようになります。

括弧は、プロンプトの特定の部分をより注目/重視するために、Webuiの制御文字として使用されるため、デフォルトでは括弧を含むタグはエスケープされます (`\( \)`) 。

最後の設定によりますが、タグのオートコンプリートはタグを挿入した後にカンマとスペースを追加します。

![insertEscape](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/d28557be-6c75-43fd-bf17-c0609223b384)
</details>
<!-- Wildcard path mode -->
<details>
<summary>ワイルドカードのパス補完</summary>

ワイルドカードのいくつかのコレクションは、ネストしたサブフォルダに整理されています。  
それらは、"hair/colors/light/... " や "clothing/male/casual/... " などのように、ファイルへのフルパスとともにリストアップされています。

このような場合、手動でフルパスを入力するのは難しいことが多いのですが、それでもリストをさらにスクロールする前に選択範囲を狭めたいものです。  
この場合、選択する結果がすべてのパスであれば、<kbd>Tab</kbd>（または`ChooseSelectedOrFirst`のカスタムホットキー）でパスの部分補完をトリガーすることが可能です。

この設定は、補完に使用するモードを決定します:
- 次のフォルダレベルまで:
   - パス内の次の/まで補完し、選択したものを進む方向として優先します
   - オプションを直接選択したい場合は、<kbd>Enter</kbd> キーまたは `ChooseSelected` ホットキーを使用してスキップし、完全に補完します。
- 最初の差分まで:
   - 結果内の最初の違いまで補完し、追加の情報を待ちます
   - 例："/sub/folder_a/..." と "/sub/folder_b/..." がある場合、"su" と入力した後に補完すると、"/sub/folder_" まですべてを挿入し、a または b を入力して明確にするまでそこで停止します。
   - 矢印キーで何かを選択した場合（EnterキーやTabキーを押すかどうかに関係なく）、それをスキップして完全に補完します。
- 常に全て:
   - 名前が示すように、部分的な補完動作を無効にし、通常のタグのようにすべての状況下で完全なパスを挿入します。

![insertWildcardPath](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/ed354bd1-3f23-4fb1-a638-ac3b7a213fc5)
</details>
<!-- Alias -->
<details>
<summary>Alias 設定</summary>

タグはしばしば複数の別名(Alias)で参照されます。`Search by alias`がオンになっている場合、それらは検索結果に含まれ、正しいタグがわからない場合に役立ちます。この場合でも、挿入時にリンクされている実際のタグに置き換えられます。

`Only show alias` セットは、エイリアスのみを表示したい場合、またはそのエイリアスがマップするタグも表示したい場合に使用します。
(`<alias> ➝ <actual>`として表示されます)

![alias](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/f2087510-67cf-448d-88f7-81eb677412b5)
</details>
<!-- Translations -->
<details>
<summary>翻訳設定</summary>

Tag Autocompleteは、別のファイル（`Translation filename`）で指定されたタグの翻訳をサポートしています。つまり、英語のタグ名が分からなくても、自身の言語の翻訳ファイルがあれば、それを代わりに使うことができます。

また、コミュニティで使用されている古いファイルのためのレガシーフォーマットオプションや、プロンプト全体のライブ翻訳プレビューなど実験的な機能もあります。

詳細については、以下の [翻訳に関するセクション](#翻訳) を参照してください。

![translation](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/a860c5dc-7428-46ac-a8a8-5d1b2b773a60)
</details>
<!-- Extra file -->
<details>
<summary>Extra ファイル設定</summary>

ここで指定したように、通常の結果の前後に追加される追加タグのセットを指定します。一般的に使用される品質タグ (`masterpiece, best quality,` など) のような小さなカスタムタグセットに便利です。

長いプリセットやプロンプト全体を補完したい場合は、代わりに [Chants（詠唱）](#chants詠唱) を参照してください。

![extraFile](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/14c28af2-b3cb-42b1-a13e-ee0c688a4a5d)
</details>
<!-- Chants -->
<details>
<summary>Chant ファイル名</summary>

Chantとは、長いプリセット、あるいはプロンプト全体を一度に選択して挿入できるもので、Webuiに内蔵されているスタイルのドロップダウンに似ています。Chantにはいくつかの追加機能があり、より速く使用することができます。

詳しくは上記の[Chants（詠唱）](#chants詠唱)のセクションを参照してください。
	
![chants](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/e8045d41-a776-49b3-8298-c879097661a4)
</details>
<!-- Hotkeys -->
<details>
<summary>Hotkeys</summary>

ほとんどのキーボードナビゲーション機能のホットキーをここで指定できます。  
https://www.w3.org/TR/uievents-key/#named-key-attribute-value

機能の説明
- Move Up / Down：次のタグを選択
- Jump Up / Down：一度に5箇所移動する。
- Jump to Start / End： リストの先頭または末尾にジャンプ
- ChooseSelected ハイライトされたタグを選択するか、何も選択されていない場合はポップアップを閉じます。
- ChooseSelectedOrFirst:上記と同じですが、何も選択されていない場合、デフォルトで最初の結果が選択されます。
- Close ポップアップを閉じる

![hotkeys](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/7e9bafd7-d5bd-4e1f-a1eb-f08bebba1423)
</details>
<!-- Colors -->
<details>
<summary>Colors</summary>

ここでは、異なるタグカテゴリーに使用されるデフォルトの色を変更することができます。これらは、ソースサイトのカテゴリの色に似ているように選択されています。

フォーマットは標準的なJSON
- オブジェクト名は、タグのファイル名に対応しています。
- 数字はタグの種類を表し、タグのソースに依存します。詳細については、[CSV tag data](#csv-tag-data)を参照してください。
- 角括弧内の最初の値はダークモード、2番目の値はライトモードです。HTMLの色名と16進数コードのどちらでも使えます。

これは、カスタムタグ・ファイルに新しいカラーセットを追加するためにも使用できます。
	
![colors](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/b9b66d8d-5619-4bd3-bdb6-053a01540d71)
</details>
<!-- Temp files refresh -->
<details>
<summary>TACの一時作成ファイルのリフレッシュ</summary>

これは "フェイク"設定で、実際には何も設定しません。むしろ、開発者がwebuiのオプションに追加できる更新ボタンを悪用するための小さなハックです。この設定の隣にある更新ボタンをクリックすると、タグオートコンプリートにいくつかの一時的な内部ファイルを再作成・再読み込みさせます。

タグオートコンプリートは様々な機能、特に余分なネットワークとワイルドカード補完に関連するこれらのファイルに依存しています。この設定は、例えば新しいLoRAをいくつかフォルダに追加し、タグ・オートコンプリートにリストを表示させるためにUIを再起動したくない場合に、リストを再構築するために使用できます。

また、この設定をクイック設定バーに追加することで、いつでも更新ボタンを利用できるようになります。

![fakeRefresh](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/9eb87446-a635-4623-89b5-a76ab39e879a)
</details>
<br/>

# 翻訳
タグとエイリアスの両方を翻訳するために使用することができ、また翻訳による検索を可能にするための、追加のファイルを翻訳セクションに追加することができます。  
このファイルは、`<English tag/alias>,<Translation>`という形式のCSVである必要がありますが、3列のフォーマットを使用する古いファイルとの後方互換性のために、`oldFormat`をオンにすると、代わりに新しい2列の翻訳形式ではなく、古い3列の翻訳形式を使用するようになります。  
その場合、2番目のカラムは使用されず、パース時にスキップされます。

中国語の翻訳例：

![IME-input](https://user-images.githubusercontent.com/34448969/200126551-2264e9cc-abb2-4450-9afa-43f362a77ab0.png)
![english-input](https://user-images.githubusercontent.com/34448969/200126513-bf6b3940-6e22-41b0-a369-f2b4640f87d6.png)

## 翻訳リスト
- [🇨🇳 Chinese tags](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/discussions/23) by @HalfMAI, 最も一般的なタグを機械翻訳と手作業で修正（レガシーフォーマットを使用）
- [🇨🇳 Chinese tags](https://github.com/sgmklp/tag-for-autocompletion-with-translation) by @sgmklp, [こちら](https://github.com/zcyzcy88/TagTable)をベースにして、より小さくした手動での翻訳セット。

> ### 🫵 あなたの助けが必要です！
> 翻訳はコミュニティの努力により支えられています。もしあなたがタグファイルを翻訳したことがある場合、または作成したい場合は、あなたの成果をここに追加できるように、Pull RequestまたはIssueを開いてください。
> 機械翻訳は、最も一般的なタグであっても、多くのことを間違えてしまいます。

## ライブ・プレビュー
> ⚠️ 警告:
>
> この機能はまだ実験的なもので、使用中にバグに遭遇するかもしれません。

この機能はプロンプト内のすべての検出されたタグのライブプレビューを表示します。検出されたタグは、カンマで正しく区切られたものと長い文章の中にあるものの両方が表示されます。自然な文章では3単語まで検出することができ、1つのタグよりも複数単語の完全な一致を優先します。

検出されたタグの上には翻訳ファイルからの訳文が表示されるので、英語のタグの意味がよく分からない場合でも、プロンプトにタグが挿入された後でも（完了時のポップアップではなく）簡単に見つけることができます。

このオプションはデフォルトではオフになっていますが、翻訳ファイルを選択し、「Show live tag translation below prompt」をチェックすることで有効にすることができます。
オフでも通常の機能には影響しません。

中国語翻訳時の例:

![image](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/bbc0b860-78f6-498f-91f9-33cf840716f7)

検出されたタグをクリックすると、そのタグがプロンプトで選択され、素早く編集できます。

![image](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/c6380106-e1e2-4da9-a819-7808ff30e8f5)

#### ⚠️ ライブ翻訳に関する確認されている問題：
ユーザーがテキストを入力または貼り付けると翻訳が更新されますが、プログラムによる操作（スタイルの適用やPNG Info / Image Browserからの読み込みなど）では更新されません。これは、プログラムによる編集の後に手動で何かを入力することで回避できます。

# Extra file
エクストラファイルは、メインセットに含まれない新しいタグやカスタムタグを追加するために使用されます。  
[CSV tag data](#csv-tag-data)にある通常のタグのフォーマットと同じですが、ひとつだけ例外があります：
カスタムタグにはカウントがないため、3列目（0から数える場合は2列目）はタグの横に表示される灰色のメタテキストに使用されます。
空欄のままだと、「カスタムタグ」と表示されます。

これは同梱されるextra-quality-tags.csvファイルを使用した例で、非常に基本的な内容となります：

![image](https://user-images.githubusercontent.com/34448969/218264276-cd77ba8e-62d8-41a2-b03c-6c04887ee18b.png)

カスタムタグを通常のタグの前に追加するか、後に追加するかは、設定で選択することができます。

# CSV tag data
このスクリプトは、以下の方法で保存されたタグ付きCSVファイルを想定しています:
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
注目すべきは、最初の行にカラム名を記載していないことと、count と aliases の両方が技術的にはオプションであることです、  
ただし、countは常にデフォルトデータに含まれています。複数のエイリアスは同様にカンマで区切る必要がありますが、CSVの解析に支障がないようにダブルクオーテーションで囲みます。

番号の付け方についてはDanbooruの[tag API docs](https://danbooru.donmai.us/wiki_pages/api%3Atags)を参照してください:
| Value	| Description |
|-------|-------------|
|0	| General     |
|1	| Artist      |
|3	| Copyright   |
|4	| Character   |
|5	| Meta        |

また、e621についても同様です:
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

タグの種類は、結果の一覧のエントリーの色付けに使用されます。

## ⚠️ よくある問題、また現在確認されている問題:
- お使いのブラウザの設定によっては、古いバージョンのスクリプトがキャッシュされることがあります。例えば、アップデート後に新機能が表示されない場合は、キャッシュを使わずにサイトを強制的にリロードするために、
<kbd>CTRL</kbd> + <kbd>F5</kbd>
を試してください。
- プロンプトのポップアップが壊れたスタイルで表示されるか、全く表示されない場合（[このような場合](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/7bbfdd54-fc23-4bfc-85af-24704b139b3a)）、openpose-editor 拡張機能がインストールされている場合は更新してください。古いバージョンでは他の拡張機能との間で問題が生じることが知られています。

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
