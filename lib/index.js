// system
const process = require('process');
const path = require('path');

// 3th
const program = require('commander');
const Promise = require('bluebird');
const GitUrlParse = require("git-url-parse");
const co = require('co');
const fs = Promise.promisifyAll(require('fs-extra'));
const argv = require('yargs').argv;
const confirm = require('confirm-simple');
const colors = require('colors');
const ora = require('ora');
const spawn = require('cross-spawn');

const log = require('./log');

process.on('uncaughtException', function (err) {
  process.stderr.write(errToStr(err) + '\n');
  process.exit(1)
});

process.on('exit', function (code) {
  let msg = `Process exit with Code ${code}\n`;
  code === 0 ? log.success(msg) : log.error(msg);
});

const gitOptionsList = [
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

const npmPackage = require(path.join(__dirname, '../package.json'));

const app = program
  .version(npmPackage.version)
  .description(npmPackage.description)
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
  .option('-4, --ipv4', '只使用 IPv4 地址')
  .option('-6, --ipv6', '只使用 IPv6 地址')
  .usage('<repo> [options]')
  .action(function (repoUrl, command) {
    this.__bootstrap__ = true;
    co(function *() {
      let repo = yield parseRepo(repoUrl);
      if (!repo.owner || !repo.full_name) return Promise.reject('Invalid repo url: ' + repo.source.red.underline);
      let cwd = process.cwd();
      const paths = {
        temp: path.join(cwd, '.git-clone-temp')
      };

      paths.authorDir = yield findDistDir(cwd, '@' + repo.owner);
      paths.authorDir = paths.authorDir || paths.join(cwd, '@' + repo.owner);
      paths.dist = path.join(paths.authorDir, repo.name);
      paths.tempDist = path.join(paths.temp, repo.name);

      const hasExistDistDir = yield isExistDir(paths.dist);

      if (hasExistDistDir) {
        log.warn(`Repo has exist in ${paths.dist.yellow.underline}\n`);
        const wantReplace = yield confirmMsg('Are you want to replace the old repo');
        wantReplace ? yield fs.removeAsync(paths.dist) : yield Promise.reject();
      }

      // clear cache
      yield fs.emptyDirAsync(paths.temp);

      // get git clone arguments
      let amgs = [];
      gitOptionsList.forEach(function (key) {
        let value = command[key];
        if (value) {
          if (value === true) return amgs.push('--' + key);
          amgs.push(key);
          amgs.push(value);
        }
      });

      // pull repo to temp dir
      yield spawnShell('git', ['clone'].concat(amgs).concat([repo.href]), {
        cwd: paths.temp
      });

      // ensure the owner dir
      yield fs.ensureDirAsync(paths.authorDir);

      // move repo from temp to dist
      yield fs.moveAsync(paths.tempDist, paths.dist);

      // clear temp
      yield fs.removeAsync(paths.temp);

      log.success(`clone repo to ${paths.dist.green.underline}\n`);
      process.exit(0);

    }).catch(function (err) {
      if (err) {
        log.error(errToStr(err));
        process.stderr.write('\n');
      }
      process.exit(1);
    });
  })
  .parse(process.argv);

function parseRepo(url) {
  return new Promise(function (resolve, reject) {
    let result = GitUrlParse(url);
    if (result && Object.keys(result).length > 0) {
      resolve(result);
    } else {
      reject({});
    }
  });
}

function spawnShell(commander, argv, config) {
  return new Promise(function (resolve, reject) {
    let data = '';

    let child = spawn(commander, argv, config);

    const spinner = ora(`Exec command ${(commander + ' ' + argv.join(' ')).underline.green}\n`).start();

    spinner.color = 'blue';
    spinner.text = 'Pulling the repo...';

    child.on('error', reject);

    child.on('exit', code => {
      spinner.stop();
      code === 0 ? resolve(data) : reject();
    });

  });
}

function errToStr(err) {
  return err instanceof Error ? err.stack : err + '';
}

function findDistDir(dirPath, author) {
  return co(function*() {
    let files = yield fs.readdirAsync(dirPath);
    let dir = files.includes(author);
    let dist = path.join(dirPath, author);
    // not found the file or dir
    if (!dir) {
      // file root
      if (dirPath === '/') return path.join(process.cwd(), author);
      return yield findDistDir(path.join(dirPath, '../'), author);
    }
    let statInfo = yield fs.statAsync(dist);
    // is a file not a dir
    if (!statInfo.isDirectory()) {
      return yield findDistDir(path.join(dirPath, '../'), author);
    }
    return dist;
  }).catch(function (err) {
    process.stderr.write(errToStr(err) + '\n');
  });
}

function confirmMsg(msg) {
  return new Promise(function (resolve, reject) {
    confirm(msg, function (ok) {
      ok ? resolve(true) : resolve(false);
    })
  });
}

function isExistDir(dir) {
  return fs.statAsync(dir).then(() => Promise.resolve(true)).catch(() => Promise.resolve(false));
}

if (!app.__bootstrap__) {
  app.help();
}