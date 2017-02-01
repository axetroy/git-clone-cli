# 一个cli工具，代替git clone

克隆一个项目，一个作者，一个项目目录

# Usage

```bash
$ npm install @axetroy/git-clone -g

git-clone <repo> <...arguments>
```

# Example

```bash
$ git-clone https://github.com/axetroy/anti-redirect.git

└── @axetroy
    └── anti-redirect
        ├── config.ts
        ├── dist
        │   ├── anti-redirect.min.user.js
        │   ├── anti-redirect.user.js
        │   ├── report.html
        │   └── stats.json
        ├── index.ts
        ├── lib
        │   ├── http.ts
        │   ├── log.ts
        │   ├── query.ts
        │   ├── redirect-on-request.ts
        │   └── redirect-on-url.ts
        ├── LICENSE
        ├── package.json
        ├── README.md
        ├── src
        │   ├── baidu.ts
        │   ├── baidu-video.ts
        │   ├── google.ts
        │   ├── sogou.ts
        │   ├── so.ts
        │   ├── tieba.ts
        │   ├── twitter.ts
        │   ├── weibo.ts
        │   ├── zhihu-daily.ts
        │   ├── zhihu.ts
        │   └── zhihu-zhuanlan.ts
        ├── tsconfig.json
        ├── webpack.config.js
        └── yarn.lock

5 directories, 28 files

$ git-clone https://github.com/axetroy/type-up.git

└── @axetroy
    ├── anti-redirect
    │   ├── config.ts
    │   ├── dist
    │   │   ├── anti-redirect.min.user.js
    │   │   ├── anti-redirect.user.js
    │   │   ├── report.html
    │   │   └── stats.json
    │   ├── index.ts
    │   ├── lib
    │   │   ├── http.ts
    │   │   ├── log.ts
    │   │   ├── query.ts
    │   │   ├── redirect-on-request.ts
    │   │   └── redirect-on-url.ts
    │   ├── LICENSE
    │   ├── package.json
    │   ├── README.md
    │   ├── src
    │   │   ├── baidu.ts
    │   │   ├── baidu-video.ts
    │   │   ├── google.ts
    │   │   ├── sogou.ts
    │   │   ├── so.ts
    │   │   ├── tieba.ts
    │   │   ├── twitter.ts
    │   │   ├── weibo.ts
    │   │   ├── zhihu-daily.ts
    │   │   ├── zhihu.ts
    │   │   └── zhihu-zhuanlan.ts
    │   ├── tsconfig.json
    │   ├── webpack.config.js
    │   └── yarn.lock
    └── type-up
        ├── dist
        │   ├── index.dart.js
        │   ├── index.dart.js.deps
        │   └── index.dart.js.map
        ├── gulp
        │   ├── config.js
        │   └── script.js
        ├── gulpfile.js
        ├── package.json
        ├── README.md
        ├── src
        │   ├── index.dart
        │   ├── keyBordMaps.dart
        │   ├── randomcCoordinate.dart
        │   └── stringToColor.dart
        └── yarn.lock

9 directories, 41 files
```

### Why we need this?

因为我发现当项目多了之后，很容易搞混乱，参考go的包管理方式，根据作者进行分类。

毕竟我是手痒，到处见好玩的就clone的人:(
