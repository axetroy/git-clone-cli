# 一个cli工具，代替git clone

克隆一个项目，一个作者，一个项目目录

**Maintain** 项目已经不再维护，有更好的 repository Manage [projj](https://github.com/popomore/projj)
# Install
```bash
npm install @axetroy/git-clone -g
```

# Usage

```bash
  Usage: git-clone <repo> [options]

  a cli tool for pull github repo

  Options:

    -h, --help                output usage information
    -V, --version             output the version number
    -v, --verbose             更加详细
    -q, --quiet               更加安静
    --progress                更加详细
    --bare                    创建一个纯仓库
    --mirror                  创建一个镜像仓库（也是纯仓库）
    -l, --local               从本地仓库克隆
    --recursive               在克隆时初始化子模组
    -j, --jobs <n>            并发克隆的子模组的数量
    -c, --config <key=value>  在新仓库中设置配置信息
    -4, --ipv4                只使用 IPv4 地址
    -6, --ipv6                只使用 IPv6 地址

```

### Why we need this?

因为我发现当项目多了之后，很容易搞混乱，参考go的包管理方式，根据作者进行分类。

毕竟我是手痒，到处见好玩的就clone的人:(

### How it work?

1. 向上查找拥有者的目录，比如目录@axetroy，查找至根目录，如果没有，则在当前工作目录创建
2. 查找在拥有者目录中，是否已存在该项目

  2.1. 如果没有，则
  
  2.2. 如果有，则询问是否要替换
  
3. 克隆项目至一个临时的缓存目录
4. 复制克隆的项目到最终目录
