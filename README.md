# コンピュータグラフィクス論

東京大学理学部情報科学科のコンピュータグラフィクス論の課題です。

授業URL: http://research.nii.ac.jp/~takayama/teaching/utokyo-iscg-2019/

デモURL: https://kawasin73-todai-cg.netlify.com/

## 課題

### 課題1

パラメトリック曲線に関する何らかのデモを実装する

- 課題PDF : http://research.nii.ac.jp/~takayama/teaching/utokyo-iscg-2019/assignments/iscg-2019-assignment-1-spline.pdf
- サンプル : https://utokyo-iscg-2019-assigment-spline.glitch.me/

デモ: https://kawasin73-todai-cg.netlify.com/subject1/

### 課題2

2D で Cyclic Coordinate Descent 法によって IK を実装せよ。

- 課題PDF : http://research.nii.ac.jp/~takayama/teaching/utokyo-iscg-2019/assignments/iscg-2019-assignment-2-ik.pdf
- サンプル : https://utokyo-iscg-2019-assigment-ik.glitch.me/

デモ: https://kawasin73-todai-cg.netlify.com/subject2/

### 課題3

カメラからレイを飛ばし、球もしくは三角形との交点を計算して、なんらかのシェーディングをした結果を表示する

- 課題PDF : http://research.nii.ac.jp/~takayama/teaching/utokyo-iscg-2019/assignments/iscg-2019-assignment-4-ray-tracing.pdf

デモ: http://glslsandbox.com/e#55605.0


### 課題2

バイラテラルフィルタを実装せよ。

- 課題PDF : http://research.nii.ac.jp/~takayama/teaching/utokyo-iscg-2019/assignments/iscg-2019-assignment-3-filter.pdf
- サンプル : https://utokyo-iscg-2019-assigment-filter.glitch.me/

デモ: https://kawasin73-todai-cg.netlify.com/subject4/

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
