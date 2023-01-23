# deno-git-server

A configurable git server written in Deno

## install

1. Install [Git](https://github.com/git/git) and [Deno](https://deno.land)
2. Type this in your console
```
deno run -A https://taisukef.github.io/deno-git-server/GitServer.js
```
runs on localhost:7005

## usage

make some dir
```
git init
```
commit some file
```
touch a.txt
git add .
git commit -m test
```
push to deno-git-server
```
git remote add origin http://localhost:7005/test
git push --set-upstream origin master
```
or
```
git push http://localhost:7005/test master
```

## links

- [Git](https://github.com/git/git)
- [Deno](https://github.com/denoland)
- [node-git-server](https://www.npmjs.com/package/node-git-server)
- [blog](https://fukuno.jig.jp/3237)
