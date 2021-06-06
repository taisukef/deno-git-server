# deno-git-server

A configurable git server written in Deno

## install

```
deno run -A --unstable https://taisukef.github.io/deno-git-server/GitServer.js
```
runs on localhost:7005

## usage

make some dir
```
git init
touch a.txt
git add .
git commit -m test
git remote add origin http://localhost:7005/nn
git push --set-upstream origin master
```
