# TaskTreemap 
タスクの規模と進捗を Treemap で可視化する

### Usage
* スペース区切り、もしくはタブ区切りで「タスクデータ(複数行可能)」を記述する
* Excel からコピペする場合はタブ区切りを使用する

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

### Ready
```
$ npm install
```

### Build
```
$ webpack
```
