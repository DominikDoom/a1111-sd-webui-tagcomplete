![tag_autocomplete_light](https://user-images.githubusercontent.com/34448969/208306863-90bbd663-2cb4-47f1-a7fe-7b662a7b95e2.png)

# Booru tag autocompletion for A1111

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/DominikDoom/a1111-sd-webui-tagcomplete)](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/releases)

## [English Document](./README.md), [中文文档](./README_ZH.md)

このカスタムスクリプトは、Stable Diffusion向けの人気のweb UIである、[AUTOMATIC1111 web UI](https://github.com/AUTOMATIC1111/stable-diffusion-webui)の拡張機能として利用できます。

主にアニメ系イラストを閲覧するための掲示板「Danbooru」などで利用されているタグの自動補完ヒントを表示するための拡張機能となります。  
[Waifu Diffusion](https://github.com/harubaru/waifu-diffusion)など、この情報を使って学習させたStable Diffusionモデルもあるため、正確なタグをプロンプトに使用することで、構図を改善し、思い通りの画像が生成できるようになります。

web UIに内蔵されている利用可能な拡張機能リストを使用してインストールするか、[以下の説明](#インストール)に従ってファイルを手動でcloneするか、または[リリース](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/releases)からパッケージ化されたバージョンを使用することができます。

## よく発生する問題 & 発見されている課題:
- ブラウザの設定によっては、古いバージョンのスクリプトがキャッシュされていることがあります。アップデート後に新機能が表示されない場合などには、`CTRL+F5`でキャッシュを利用せずにサイトを強制的にリロードしてみてください。
- プロンプトのポップアップのスタイルが崩れていたり、全く表示されない場合（[このような場合](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/assets/34448969/7bbfdd54-fc23-4bfc-85af-24704b139b3a)）、openpose-editor拡張機能をインストールしている場合は、必ずアップデートしてください。古いバージョンでは、他の拡張機能との間で問題が発生することが知られています。

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

## インストール
### 内蔵されている拡張機能リストを用いた方法
1. Extensions タブを開く
2. Available タブを開く
3. "Load from:" をクリック
4. リストの中から "Booru tag autocompletion" を探す
   - この拡張機能は最初から利用可能だったものなので、 "oldest first" を選択すると、リストの上位に表示されます。
5. 右側にある "Install" をクリック

![Load from index](https://user-images.githubusercontent.com/34448969/223537209-24c7623e-7410-427e-857f-9da936aadb21.png)
![Order by oldest](https://user-images.githubusercontent.com/34448969/223537231-48e982b8-0920-48c5-87e5-8c81ebbb5fe3.png)
![Install](https://user-images.githubusercontent.com/34448969/223537336-5c02ccb1-233d-4e0d-9e73-d1b889252c49.png)


### 手動でcloneする方法
```bash
git clone "https://github.com/DominikDoom/a1111-sd-webui-tagcomplete.git" extensions/tag-autocomplete
```
（第2引数でフォルダ名を指定可能なので、好きな名前を指定しても良いでしょう）

## 追加で有効化できる補完機能
### ワイルドカード

自動補完は、https://github.com/AUTOMATIC1111/stable-diffusion-webui-wildcards 、または他の類似のスクリプト/拡張機能で使用されるワイルドカードファイルでも利用可能です。補完は `__` (ダブルアンダースコア) と入力することで開始されます。最初にワイルドカードファイルのリストが表示され、1つを選択すると、そのファイル内の置換オプションが表示されます。
これにより、スクリプトによって置換されるカテゴリを挿入するか、または直接1つを選択して、ワイルドカードをカテゴリ化されたカスタムタグシステムのようなものとして使用することができます。

![Wildcard files](https://user-images.githubusercontent.com/34448969/223534518-8488c2e1-d9e5-4870-844f-adbf3bfb1eee.png)
![Wildcard replacements](https://user-images.githubusercontent.com/34448969/223534534-69597907-59de-4ba8-ae83-b01386570124.png)


ワイルドカードはすべての拡張機能フォルダと、古いバージョンをサポートするための `scripts/wildcards` フォルダで検索されます。これは複数の拡張機能からワイルドカードを組み合わせることができることを意味しています。ワイルドカードをグループ化した場合、ネストされたフォルダもサポートされます。

### Embeddings, Lora & Hypernets
これら3つのタイプの補完は、`<`と入力することで行われます。デフォルトでは3つとも混在して表示されますが、以下の方法でさらにフィルタリングを行うことができます：
- `<e:` は、embeddingsのみを表示します。
- `<l:` 、または `<lora:` はLoraのみを表示します。
- `<h:` 、または `<hypernet:` はHypernetworksのみを表示します

#### Embedding type filtering
Stable Diffusion 1.xまたは2.xモデル用にそれぞれトレーニングされたembeddingsは、他のタイプとの互換性がありません。有効なembeddingsを見つけやすくするため、若干の色の違いも含めて「v1 Embedding」と「v2 Embedding」で分類しています。また、`<v1/2`または`<e:v1/2`に続けて実際の検索のためのキーワードを入力すると、v1またはv2embeddingsのみを含むように検索を絞り込むことができます。

例:

![Embedding version filter](https://user-images.githubusercontent.com/34448969/223533883-d99c04b7-a199-4f56-a4e5-242eee9726a2.png)

### Chants（詠唱）
Chants（詠唱）は、より長いプロンプトプリセットです。この名前は、中国のユーザーによる初期のプロンプト集からヒントを得たもので、しばしば「Spellbook」「Codex」などと呼ばれていました（※呪文書のような意味）。  
このような文書から得られるプロンプトのスニペットは、このような理由から呪文や詠唱と呼ばれるにふさわしいものでした。

EmbeddingsやLoraと同様に、この機能は `<`, `<c:`, `<chant:` コマンドを入力することで発動します。例えば、プロンプトボックスに `<c:HighQuality` と入力して選択すると、次のようなプロンプトテキストが挿入されます：

```
(masterpiece, best quality, high quality, highres, ultra-detailed),
```


Chants（詠唱）は、以下のフォーマットに従ってJSONファイルで追加することができます：:
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
このファイルが拡張機能の `tags` フォルダ内にある場合、settings内の"Chant file"ドロップダウンから選択することができます。

chantオブジェクトは4つのフィールドを持ちます：
- `name` - 表示される名称
- `terms` - 検索キーワード
- `content` - 実際に挿入されるプロンプト
- `color` - 表示される色。通常のタグと同じカテゴリーカラーシステムを使用しています。

### Umi AI tags
https://github.com/Klokinator/Umi-AI は、Unprompted や Dynamic Wildcards に似た、機能豊富なワイルドカード拡張です。  
例えば `<[preset][--female][sfw][species]>` はプリセットカテゴリーを選び、女性関連のタグを除外し、さらに次のカテゴリーで絞り込み、実行時にこれらすべての条件に一致するランダムなフィルインを1つ選び出します。補完は `<[`] とそれに続く新しい開く括弧、例えば `<[xyz][`] で始まり、 `>` で閉じるまで続きます。

タグの自動補完は、これらのオプションをスマートに提案していきます。つまり、カテゴリータグの追加を続けても、その前に来たものと一致する結果だけが表示されるのです。
また、タグの投稿数の代わりに、そのコンボから選択可能なフィルインタグの数を表示し、大規模になる初期内容に対して迅速な概要とフィルタリングを可能にします。

ほとんどの功績は[@ctwrs](https://github.com/ctwrs)によるものです。この方はUmiの開発者の一人として多くの貢献をしています。

## Settings

この拡張機能には、大量の設定＆カスタマイズ性が組み込まれています:

![image](https://user-images.githubusercontent.com/34448969/204093162-99c6a0e7-8183-4f47-963b-1f172774f527.png)

| 設定項目	| 説明 |
|---------|-------------|
| tagFile | 使用するタグファイルを指定します。お好みのタグデータベースを用意することができますが、このスクリプトはDanbooruタグを想定して開発されているため、他の構成では正常に動作しない場合があります。|
| activeIn | txt2img、img2img、またはその両方のネガティブプロンプトのスクリプトを有効、または無効にすることができます。 |
| maxResults | 最大何件の結果を表示するか。デフォルトのタグセットでは、結果は出現回数順に表示されます。embeddingsとワイルドカードの場合は、スクロール可能なリストですべての結果を表示します。 |
| resultStepLength | 長いリストやshowAllResultsがtrueの場合に、指定したサイズの小さなバッチで結果を読み込むことができるようにします。 |
| delayTime | オートコンプリートを起動するまでの待ち時間をミリ秒単位で指定できます。これは入力中に頻繁に補完内容が更新されるのを防ぐのに役立ちます。 |
| showAllResults | trueの場合、maxResultsを無視し、すべての結果をスクロール可能なリストで表示します。**警告:** 長いリストの場合、ブラウザが遅くなることがあります。 |
| replaceUnderscores | trueにした場合、タグをクリックしたときに `_`（アンダースコア）が ` `（スペース）に置き換えられます。モデルによっては便利になるかもしれません。 |
| escapeParentheses | trueの場合、()を含むタグをエスケープして、Web UIのプロンプトの重み付け機能に影響を与えないようにします。 |
| appendComma | UIスイッチ "Append commas "の開始される値を指定することができます。UIのオプションが無効の場合、常にこの値が使用されます。 |
| useWildcards | ワイルドカード補完機能の切り替えに使用します。 |
| useEmbeddings | embedding補完機能の切り替えに使用します。 |
| alias | エイリアスに関するオプションです。詳しくは下のセクションをご覧ください。 |
| translation | 翻訳用のオプションです。詳しくは下のセクションをご覧ください。 |
| extras | タグファイル/エイリアス/翻訳を追加するためのオプションです。詳しくは下記をご覧ください。 |
| chantFile | chants（長いプロンプト・プリセット/ショートカット）に使用するためファイルです。 |
| keymap | カスタマイズ可能なhotkeyを設定するために利用します。 |
| colors | タグの色をカスタマイズできます。詳しくは下記をご覧ください。 |
### Colors
タグタイプに関する色は、タグ自動補完設定のためのJSONコードを変更することで指定することができます。  
フォーマットは標準的なJSONで、オブジェクト名は、それらが使用されるタグのファイル名（.csvを除く）に対応しています。  
角括弧の中の最初の値はダークモード、2番目の値はライトモードです。色の名称と16進数、どちらも使えるはずです。

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
また、カスタムタグファイルの新しいカラーセットを追加する際にも使用できます。
数字はタグの種類を指定するもので、タグのソースに依存します。例として、[CSV tag data](#csv-tag-data)を参照してください。

### エイリアス, 翻訳 & Extra tagsについて
#### エイリアス
Booruのサイトのように、タグは1つまたは複数のエイリアスを持つことができ、完了時に実際の値へリダイレクトされて入力されます。これらは `config.json` の設定をもとに検索/表示されます：
- `searchByAlias` - エイリアスも検索対象とするか、実際のタグのみを検索対象とするかを設定します
- `onlyShowAlias` - `alias -> actual` の代わりに、エイリアスのみを表示します。表示のみで、最後に挿入されるテキストは実際のタグのままです。

#### 翻訳
タグとエイリアスの両方を翻訳するために使用することができ、また翻訳による検索を可能にするための、追加のファイルを翻訳セクションに追加することができます。  
このファイルは、`<英語のタグ/エイリアス>,<翻訳>`という形式のCSVである必要がありますが、3列のフォーマットを使用する古いファイルとの後方互換性のために、`oldFormat`をオンにすると代わりにそれを使うことができます。

中国語の翻訳例：

![IME-input](https://user-images.githubusercontent.com/34448969/200126551-2264e9cc-abb2-4450-9afa-43f362a77ab0.png)
![english-input](https://user-images.githubusercontent.com/34448969/200126513-bf6b3940-6e22-41b0-a369-f2b4640f87d6.png)

#### Extra file
エクストラファイルは、メインセットに含まれない新しいタグやカスタムタグを追加するために使用されます。  
[CSV tag data](#csv-tag-data)にある通常のタグのフォーマットと同じですが、ひとつだけ例外があります：
カスタムタグにはカウントがないため、3列目（0から数える場合は2列目）はタグの横に表示される灰色のメタテキストに使用されます。
空欄のままだと、「カスタムタグ」と表示されます。

これは同梱されるextra-quality-tags.csvファイルを使用した例で、非常に基本的な内容となります：

![image](https://user-images.githubusercontent.com/34448969/218264276-cd77ba8e-62d8-41a2-b03c-6c04887ee18b.png)

カスタムタグを通常のタグの前に追加するか、後に追加するかは、設定で選択することができます。

## CSV tag data
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
