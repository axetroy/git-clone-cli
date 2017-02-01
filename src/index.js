// system
const spawn = require('child_process').spawn;
const process = require('process');
const path = require('path');
const fs = require('fs');

// 3th
const program = require('commander');
const Promise = require('bluebird');
const GitUrlParse = require("git-url-parse");
const co = require('co');
const fsx = require('fs-extra');
const argv = require('yargs').argv;

process.on('uncaughtException', function (err) {
  process.stderr.write(errToStr(err) + '\n');
  process.exit(1)
});

const optionsList = [
  "verbose",
  "quiet",
  "progress",
  // "checkout",
  "bare",
  "mirror",
  "local",
  "hardlinks",
  "config",
  "recursive",
  // "submodules",
  "job"
];

program
  .version(require(path.join(__dirname, '../package.json')).version)
  .description('a cli tool for pull github repo')
  .option('-v, --verbose', '更加详细')
  .option('-q, --quiet', '更加安静')
  .option('--progress', '更加详细')
  // .option('-n, --no-checkout', '不创建一个检出')
  .option('--bare', '创建一个纯仓库')
  .option('--mirror', '创建一个镜像仓库（也是纯仓库）')
  .option('-l, --local', '从本地仓库克隆')
  // .option('--no-hardlinks', '不使用本地硬链接，始终复制')
  .option('--recursive', '在克隆时初始化子模组')
  // .option('--recurse-submodules', '在克隆时初始化子模组')
  .option('-j, --jobs <n>', '并发克隆的子模组的数量')
  .option('-c, --config <key=value>', '在新仓库中设置配置信息')
  .option(' -4, --ipv4', '只使用 IPv4 地址')
  .option(' -6, --ipv6', '只使用 IPv6 地址')
  .usage('<repo> [options]')
  .action(function (repoUrl, command) {
    // console.log(command);
    parseRepo(repoUrl || '', function (repo) {
      if (!repo.owner || !repo.full_name) throw new Error('Invalid repo url: ' + repo.source);
      let cwd = process.cwd();
      const paths = {
        temp: path.join(cwd, '.git-clone-temp')
      };
      co(function *() {

        paths.authorDir = yield findDistDir(cwd, '@' + repo.owner);
        paths.authorDir = paths.authorDir || paths.join(cwd, '@' + repo.owner);
        paths.dist = path.join(paths.authorDir, repo.name);
        paths.tempDist = path.join(paths.temp, repo.name);

        // clear cache
        yield emptyDir(paths.temp);

        // get git clone arguments
        let amgs = [];
        optionsList.forEach(function (key) {
          let value = command[key];
          if (value) {
            if (value === true) return amgs.push('--' + key);
            amgs.push(key);
            amgs.push(value);
          }
        });

        // pull repo to temp dir
        process.stdout.write(`clone repo ${repo.href} ...\n`);
        yield spawnShell('git', ['clone'].concat(amgs).concat([repo.href]), {
          cwd: paths.temp
        });

        // ensure the owner dir
        yield ensureDir(paths.authorDir);

        // remove repo dir
        yield removeDir(paths.dist);

        // move repo from temp to dist
        yield moveDir(paths.tempDist, paths.dist);

        // clear temp
        yield removeDir(paths.temp);

        process.stdout.write(`clone repo to ${paths.dist}\n`);
      }).catch(function (err) {
        process.stderr.write(errToStr(err));
        process.stderr.write('\n');
      });
    });
  })
  .parse(process.argv);

function parseRepo(url, callback) {
  let result = GitUrlParse(url);
  if (result && Object.keys(result).length > 0) {
    callback(result);
  }
}

function ensureDir(dir) {
  return new Promise(function (resolve, reject) {
    fsx.ensureDir(dir, function (err) {
      try {
        err ? reject(err) : resolve(dir);
      } catch (err) {
        reject(err);
      }
    });
  });
}

function moveDir(fromDir, toDir) {
  return new Promise(function (resolve, reject) {
    fsx.move(fromDir, toDir, function (err) {
      try {
        err ? reject(err) : resolve();
      } catch (err) {
        reject(err);
      }
    })
  });
}

function emptyDir(dir) {
  return new Promise(function (resolve, reject) {
    fsx.emptyDir(dir, function (err) {
      err ? reject(err) : resolve();
    });
  });
}

function removeDir(dir) {
  return new Promise(function (resolve, reject) {
    fsx.remove(dir, function (err) {
      try {
        err ? reject(err) : resolve(dir);
      } catch (err) {
        reject(err);
      }
    });
  });
}

function spawnShell(commander, argv, config) {
  return new Promise(function (resolve, reject) {
    let data = '';

    let child = spawn(commander, argv, config);

    child.stdout.on('data', function (chunk) {
      chunk = chunk + '';
      data += chunk;
      process.stdout.write(chunk);
    });

    child.stderr.on('data', function (err) {
      process.stderr.write(err + '');
    });

    child.on('error', reject);

    child.on('exit', code => {
      code === 0 ? resolve(data) : reject();
    });

  });
}

function errToStr(err) {
  return err instanceof Error ? err.stack : err + '';
}

function readDir(dir) {
  return new Promise(function (resolve, reject) {
    fs.readdir(dir, function (err, files) {
      if (err) return reject(err);
      return resolve(files);
    })
  });
}

function stat(path) {
  return new Promise(function (resolve, reject) {
    fs.stat(path, function (err, stat) {
      if (err) return reject(err);
      return resolve(stat);
    });
  });
}

function findDistDir(dirPath, author) {
  return co(function*() {
    let files = yield readDir(dirPath);
    let dir = files.includes(author);
    let dist = path.join(dirPath, author);
    // not found the file or dir
    if (!dir) {
      // file root
      if (dirPath === '/') return null;
      return yield findDistDir(path.join(dirPath, '../'), author);
    }
    let statInfo = yield stat(dist);
    // is a file not a dir
    if (!statInfo.isDirectory()) {
      return yield findDistDir(path.join(dirPath, '../'), author);
    }
    return dist;
  }).catch(function (err) {
    process.stderr.write(errToStr(err) + '\n');
  });
}