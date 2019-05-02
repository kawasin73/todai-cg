# コンピュータグラフィクス論

東京大学理学部情報科学科のコンピュータグラフィクス論の課題です。

http://research.nii.ac.jp/~takayama/teaching/utokyo-iscg-2019/

## 課題

### 課題1

パラメトリック曲線に関する何らかのデモを実装する

課題PDF : http://research.nii.ac.jp/~takayama/teaching/utokyo-iscg-2019/assignments/iscg-2019-assignment-1-spline.pdf
サンプル : https://utokyo-iscg-2019-assigment-spline.glitch.me/

## 開発

```bash
$ brew install git caddy
$ git clone https://github.com/kawasin73/todai-cg.git ./repo_name
$ cd ./repo_name
$ ./import.sh
$ caddy -host localhost -root ./public -port 3000
$ open http://localhost:3000
```

## LICENSE

MIT
