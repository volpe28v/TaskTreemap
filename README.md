# TaskTreemap 
テキスト入力でお手軽にタスクの規模と進捗を Treemap で可視化する

### デモページ
https://tasktreemap.herokuapp.com/?id=demo

![demo](https://user-images.githubusercontent.com/754962/36104915-9f668812-1056-11e8-8993-366010816837.png)


### Usage
* URL に ?id=hoge を追加すると新規ページが作成され、同ページを開いているブラウザに更新がリアルタイムに反映される

* スペース区切り、もしくはタブ区切りで「タスクデータ(複数行可能)」を記述する
* タスクをダブルクリックすると状態遷移する。(Todo → Doing → Done → Todo)
* タスクをロングクリックすると Waiting へ遷移する
* 上部のアサイン名をタスクにドラッグするとアサイン可能
* バーンダウンの「Apply to n sprints」をクリックすると Done → Closed に状態遷移する。

* Alt + Click or Shift + Click でレイアウト切り替え(3種類)
* [Status] <-> [assignee] ボタンでタスクのグルーピング表示切り替え
* [Done] チェックボックスで Done の表示非表示切り替え

### タスクデータフォーマット
|タスク名|規模|進捗(Optinal)|アサイン名(Optinal)|
|---|---|---|---|
|タスク1|30|Todo|ほげさん|
|タスク2|40|Doing|ふがさん|
|タスク3|50|Done||
|タスク4|60|||

- `---` で区切り行

### バーンダウンチャートフォーマット
|要素|説明|
|---|---|
|4|スプリント数|
|785/785|初期計画規模 [残り]/[総数]|
|585/785|1スプリント規模 [残り]/[総数]|
|517/785|2スプリント規模 [残り]/[総数]|
|   :   ||

### Technology
* Vue.js
* d3.js
* socket.io

### Ready
必要なもの

* node.js
* mongodb

```
$ npm install
```

### Build
```
$ npm run build
```

### Run
```
$ npm run start
```

### Access
http://localhost:3000/?id=page_name

page_name: 任意のページ名文字列

### Basic認証
```
$ BASIC_AUTH_USER=user BASIC_AUTH_PASS=pass npm run start
```

* BASIC_AUTH_USER ユーザ名
* BASIC_AUTH_PASS パスワード
