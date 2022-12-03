JavaScriptでPNGのチャンク共通部分を読む

　PNGはシグネチャからはじまり以降はチャンクと呼ばれる定形バイナリ配列になっている。このチャンクを読む。

<!-- more -->

# ブツ

* [DEMO][]
* [リポジトリ][]

[DEMO]:https://ytyaru.github.io/Html.PNG.Chunk.IHDR.20221202171226
[リポジトリ]:https://github.com/ytyaru/Html.PNG.Chunk.IHDR.20221202171226

```sh
NAME='Html.PNG.Chunk.IHDR.20221202171226'
git clone https://github.com/ytyaru/$NAME
cd $NAME/docs
./server.sh
```

1. ターミナルを起動する
1. 上記コマンドを叩く
1. 起動したブラウザでHTTPSを実行する（Chromiumの場合は以下）
	1. `この接続ではプライバシーが保護されません`ページが表示される
	1. `詳細設定`をクリックする
	1. `localhost にアクセスする（安全ではありません）`リンクをクリックする
1. ファイルを選ぶ（次のうちいずれかの方法で）
	* 任意ファイルをドラッグ＆ドロップする
	* ファイル選択ダイアログボタンを押してファイルを選択する
1. PNG判定が実行される
	* もしPNGなら`このファイルはPNG形式です😄`と表示され、PNG画像が表示される
	* もしPNGでないなら`このファイルはPNG形式でない！`と表示される

　テスト用PNG画像はリポジトリの`./docs/asset/image/monar-mark-gold.png`にある。非PNGファイルは適当に`README.md`を使えばいい。

## 前回まで

* [Html.Canvas.toDataURL.20221129184336][]
* [Html.PNG.Signature.20221202103208][]
* [Html.PNG.Chunk.IHDR.20221202171226][]

[Html.Canvas.toDataURL.20221129184336]:https://github.com/ytyaru/Html.Canvas.toDataURL.20221129184336
[Html.PNG.Signature.20221202103208]:https://github.com/ytyaru/Html.PNG.Signature.20221202103208
[Html.PNG.Chunk.IHDR.20221202171226]:https://github.com/ytyaru/Html.PNG.Chunk.IHDR.20221202171226

# 目標

* [png-file-chunk-inspector][]

[png-file-chunk-inspector]:https://www.nayuki.io/page/png-file-chunk-inspector

　上記のようにPNGファイルのチャンクを読みたい。今回はチャンクの共通部分を読む。

# 概要

　PNGファイルは先頭が[シグネチャ][]ではじまり、以降はすべて[チャンク][]とよばれる形式のバイナリデータになる。

* [シグネチャ][]
* [チャンク][]

[PNGファイルシグネチャ]:https://www.w3.org/TR/png/#5PNG-file-signature
[チャンクのレイアウト]:https://www.w3.org/TR/png/#5Chunk-layout

サイズ|データ種別|値の例
------|----------|------
8|PNGファイルシグネチャ|`89 50 4E 47 0D 0A 1A 0A`
N|チャンク|`...`
N|チャンク|`...`
N|チャンク|`...`

　チャンクは必ず次のようなバイナリ配列である。

種類|サイズ|意味
----|------|----
length|4|このチャンクのデータ長
type|4|チャンク種別（ASCII4字）
data|N|チャンクのデータ
[CRC][]|4|データ破損チェック用（`type`と`data`から算出する）

　チャンクにはいくつかの種類があり、それぞれ`type`に固有の識別名がASCIIコードで入る。`data`部分は可変であり、ここにそのチャンク固有のデータが入る。各チャンクについては[チャンク一覧][]を参照。

[チャンク一覧]:https://www.w3.org/TR/png/#4Concepts.FormatTypes
[CRC]:https://ja.wikipedia.org/wiki/%E5%B7%A1%E5%9B%9E%E5%86%97%E9%95%B7%E6%A4%9C%E6%9F%BB

　このうち必須チャンクは`IHDR`,`IDAT`,`IEND`。つまりPNGファイルは次のような順のバイナリ配列となる。

byte|データ
----|------
8|シグネチャ
25|`IHDR`
N|`IDAT`
12|`IEND`

　他にもドット絵などでインデックスカラーを使うなら`PLTE`, `tRNS`といったチャンクがある。各チャンクは順序がある程度指定されており、以下のような順になる。

1. シグネチャ
1. `IHDR`
1. `PLTE`
1. `tRNS`
1. `IDAT`
1. `IEND`

## `IHDR`

種類|サイズ|値
----|------|---
length|4|`13`
type|4|`49 48 44 52`
width|4|`1`〜
height|4|`1`〜
bitDepth|1|`1`,`2`,`4`,`8`,`16`
colorType|1|`0`,`2`,`3`,`4`,`6`
compressionMethod|1|`0`
filterMethod|1|`0`
interlaceMethod|1|`0`,`1`
[CRC][]|4|チェックサム計算値

　`colorType`と`bitDepth`の対応表は以下。

`colorType`|`bitDepth`|意味
-----------|----------|----
`0`|`1`,`2`,`4`,`8`,`16`|グレースケール
`2`|`8`,`16`|トゥルーカラー
`3`|`1`,`2`,`4`,`8`|インデックスカラー
`4`|`8`,`16`|グレースケール＋αチャンネル
`6`|`8`,`16`|トゥルーカラー＋αチャンネル

## `PLET`

種類|サイズ|値
----|------|---
length|4|`0`
type|4|`50 4C 54 45`（`80 76 84 69`）
0-R|1|`00`
0-G|1|`00`
0-B|1|`00`
N-R|1|`00`
N-G|1|`00`
N-B|1|`00`
[CRC][]|4|計算値

　0番目のパレットから順に色をセットしていく。色はRGBの3要素あり、それぞれ1バイトで表現する。

　もし`IHDR`の`colorType`が`3`で`bitDepth`が`8`なら、256色ある。ただしそれより少ない色数のデータであってもよい。色はRGBという3つの要素で表す。`0-R`が0番目のR、`0-G`が0番目のG、`0-B`が0番目のB。以降は同様に1番目の色、2番目の色とつづく。

* [PLTE][]

[PLTE]:https://www.w3.org/TR/png/#11PLTE

## `tRNS`

種類|サイズ|値
----|------|---
length|4|`0`
type|4|``（116 82 78 83）
0-A|1|`00`
N-A|1|`00`
[CRC][]|4|計算値

　0番目のパレットに対して順に透明度をセットしていく。1バイトで表現する。

　`0-A`はパレット0番目の色に対する透明度。`00`は完全透明であり、`FF`は完全不透明。

　`0-A`から順に`1-A`,`2-A`となり、最大で`2**IHDR.bitDepth`数だけ作成できる。8bitなら256個。

　ふつうは`0`番目のパレットだけを完全透明にする使い方をする。これにより背景1色だけを完全透明にした画像が作れる。全ピクセルに透明度をもたせる方式よりもはるかに少ないデータ量で実現できる。

　半透明を用意することもできる。ただし`tRNS`の仕様上、透明度があるパレット色を連番にすることで必要最小限のサイズにできることに注意する。もし飛び飛びのパレット番号に設定する必要があるなら、透明度が必要な最後のパレット番号までのサイズが必要になる。

## `IDAT`

種類|サイズ|値
----|------|--
length|4|`0`
type|4|`49 45 4E 44`
data|N|`FF`...
[CRC][]|4|計算値

## `IEND`

種類|サイズ|値
----|------|--
length|4|`0`
type|4|`49 45 4E 44`
[CRC][]|4|計算値

# `IHDR`を読む

　`IHDR`はシグネチャの直後に来る。サイズは25バイト固定。つまり先頭から`8`〜`33`バイトの範囲にある。

1. 先頭8バイトのシグネチャを読んでPNGであると判定したなら
1. `IHDR`チャンクを読む

　`IHDR`を読むクラスを作成する。`show()`でコンソール出力、`toHtml()`でHTMLテーブル作成する。

```javascript
const ihdr = new IHDR(new DataView(await file.arrayBuffer()))
ihdr.show()
ihdr.toHtml()
```

　`IHDR`クラスの実装は以下。`constructor()`でPNG画像ファイルの[DataView][]を受け取り、解析して、キャストし、プロパティ変数にセットしている。

```javascript
export class IHDR {
    KEYS = ['length', 'type', 'width', 'height', 'bitDepth', 'colorType', 'compressionMethod', 'filterMethod', 'interlaceMethod', 'crc']
    constructor(dataView) {
        const SIG_SZ = 8
        this.length = dataView.getUint32(SIG_SZ)
        this.type = new TextDecoder('ascii').decode(new Uint8Array([
            dataView.getUint8(SIG_SZ + 4),
            dataView.getUint8(SIG_SZ + 5),
            dataView.getUint8(SIG_SZ + 6),
            dataView.getUint8(SIG_SZ + 7),
        ]))
        this.width = dataView.getUint32(SIG_SZ + 8)
        this.height = dataView.getUint32(SIG_SZ + 12)
        this.bitDepth = dataView.getUint8(SIG_SZ + 16)
        this.colorType = dataView.getUint8(SIG_SZ + 17)
        this.compressionMethod = dataView.getUint8(SIG_SZ + 18)
        this.filterMethod = dataView.getUint8(SIG_SZ + 19)
        this.interlaceMethod = dataView.getUint8(SIG_SZ + 20)
        this.crc = dataView.getUint32(SIG_SZ + 21)
    }
    show() {
        for (const prop of this.KEYS) { console.log(`${prop}: ${Reflect.get(this, prop)}`) }
    }
    toHtml() {
        const table = document.createElement('table')
        const caption = document.createElement('caption')
        caption.textContent = this.type
        table.appendChild(caption)
        for (const prop of this.KEYS) {
            const tr = document.createElement('tr')
            const th = document.createElement('th')
            const td = document.createElement('td')
            th.textContent = prop
            td.textContent = Reflect.get(this, prop)
            tr.appendChild(th)
            tr.appendChild(td)
            table.appendChild(tr)
        }
        return table
    }
}
```

　`IHDR`チャンクはシグネチャの直後にくるため先頭からのバイト位置が固定である。なので一番カンタンに取得できるチャンク。

offset|length|16進数バイナリ|意味
------|------|--------------|----
0|8|`89 50 4E 47 0D 0A 1A 0A`|シグネチャ
9|4|`00 00 00 13`|`IHDR.length`
13|4|`49 48 44 52`|`IHDR.type`
17|4|`00 00 00 00`|`IHDR.width`
21|4|`00 00 00 00`|`IHDR.height`
25|1|`00`|`IHDR.bitDepth`
26|1|`00`|`IHDR.colorType`
27|1|`00`|`IHDR.compressionMethod`
28|1|`00`|`IHDR.filterMethod`
29|1|`00`|`IHDR.interlaceMethod`
30|4|`00 00 00 00`|`IHDR.crc`

　たとえば最初の`IHDR.length`解析について。これはPNGファイルの先頭にくるシグネチャ`89 50 4E 47 0D 0A 1A 0A`（8バイト）の直後につづく、最初のチャンク`IHDR`の最初のデータである。なので位置は先頭から8バイト目にある。そして`length`のデータは4バイトUInt32型である。つまり先頭から8バイト目にあるデータを4バイト幅のUInit32型で取得すればいい。

　[DataView][]の各取得APIは`get型名(オフセット)`となっている。オフセットには先頭から読み飛ばすバイト数を指定する。よって`IHDR.length`を取得するには先頭から8バイト読み飛ばしたUInit32型。として取得すればいい。以下のように。

```javascript
const SIG_SZ = 8
this.length = dataView.getUint32(SIG_SZ)
```

　次に`IHDR.type`を読む。これは`IHDR`2番目であり`length`や`crc`同様、全チャンク共通である。4文字文のASCII文字データが含まれる。ポイントは[TextDecoder][]を使ってバイナリから文字列型に変換していること。

[TextDecoder]:https://developer.mozilla.org/ja/docs/Web/API/TextDecoder

　[TextDecoder][]にデータを渡すときは[TypedArray][]型にする必要がある。ASCII文字は1字あたりUInit8型であり、これが4文字文あるので、`Uint8Array([A,B,C,D])`のようになる。引数の配列要素値はそれぞれ1字分データUInt8が入る。

```javascript
this.type = new TextDecoder('ascii').decode(new Uint8Array([
    dataView.getUint8(SIG_SZ + 4),
    dataView.getUint8(SIG_SZ + 5),
    dataView.getUint8(SIG_SZ + 6),
    dataView.getUint8(SIG_SZ + 7),
]))
```

　あとは型とオフセットを仕様どおりにしながら各プロパティを読み取ればいいだけ。

　`show()`や`toHtml()`では[Reflect][]を使っている。これは指定クラスのプロパティを文字列から参照するもの。コードをDRYに書きたかったので使った。

[Reflect]:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Reflect

































type|4|`49 48 44 52`
width|4|`1`〜
height|4|`1`〜
bit_depth|1|`1`,`2`,`4`,`8`,`16`
color_type|1|`0`,`2`,`3`,`4`,`6`
compression_method|1|`0`
filter_method|1|`0`
interlace_method|1|`0`,`1`
[CRC][]|4|チェックサム計算値


　バイナリは[DataView][]で読む。ファイルのバイナリデータは`drop`イベントや`input type="file"`で取得されたファイル`files[0]`（`file`）オブジェクトがもつ`arrayBuffer()`で取得する。

```javascript
fileInput.addEventListener('change', async(e)=>{
    await previewFile(e.target.files[0]);
});
```
```javascript
dropZone.addEventListener('drop', async(e)=>{
    var files = e.dataTransfer.files;
    if (files.length > 1) { return alert('開けるファイルは1つだけです。'); }
    fileInput.files = files;
    await previewFile(files[0]);
})
```


[Drag and Drop API]:https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
[input type="file" 要素]:https://developer.mozilla.org/ja/docs/Web/HTML/Element/input/file
[File]:https://developer.mozilla.org/ja/docs/Web/API/File
[Blob]:https://developer.mozilla.org/ja/docs/Web/API/Blob
[arrayBuffer()]:https://developer.mozilla.org/ja/docs/Web/API/Blob/arrayBuffer

[JavaScript の型付き配列]:https://developer.mozilla.org/ja/docs/Web/JavaScript/Typed_arrays
[TypedArray]:https://developer.mozilla.org/ja/docs/Web/JavaScript/Typed_arrays
[ArrayBuffer]:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
[DataView]:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/DataView
[Int8Array]:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Int8Array
[Uint8Array]:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
[Uint8ClampedArray]:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray
[Int16Array]:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Int16Array
[Uint16Array]:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Uint16Array
[Int32Array]:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
[Uint32Array]:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array
[Float32Array]:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
[Float64Array]:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Float64Array
[BigInt64Array]:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/BigInt64Array
[BigUint64Array]:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/BigUint64Array

[script要素]:https://developer.mozilla.org/ja/docs/Web/HTML/Element/script


[等価性の比較と同一性]:https://developer.mozilla.org/ja/docs/Web/JavaScript/Equality_comparisons_and_sameness

