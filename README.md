# TaskTreemap 
テキスト入力でお手軽にタスクの規模と進捗を Treemap で可視化する

### デモページ
https://tasktreemap.herokuapp.com/?id=demo

![demo](https://user-images.githubusercontent.com/754962/31043080-a34dab70-a5f0-11e7-8861-38211a53da11.png)

### Usage
* URL に ?id=hoge を追加すると新規ページが作成され、同ページを開いているブラウザに更新がリアルタイムに反映される
* スペース区切り、もしくはタブ区切りで「タスクデータ(複数行可能)」を記述する
* タスクをダブルクリックすると状態遷移する。(Todo → Doing → Done → Todo)
* タスクをロングクリックすると Waiting へ遷移する
* 上部のアサイン名をタスクにドラッグするとアサイン可能

### タスクデータフォーマット
|タスク名|規模|進捗(Optinal)|アサイン名(Optinal)|
|---|---|---|---|
|タスク1|30|Todo|ほげさん|
|タスク2|40|Doing|ふがさん|
|タスク3|50|Done||
|タスク4|60|||

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

