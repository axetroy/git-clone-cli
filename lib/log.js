/**
 * Created by axetroy on 17-2-5.
 */
const process = require('process');
const logSymbols = require('log-symbols');
const colors = require('colors');

const log = {
  warn(msg){
    process.stdout.write(`${logSymbols.warning} ${'WARNING'.yellow}: ${msg}`);
  },
  info(msg){
    process.stdout.write(`${logSymbols.info} ${'INFO'.blue}: ${msg}`);
  },
  success(msg){
    process.stdout.write(`${logSymbols.success} ${'SUCCESS'.green}: ${msg}`);
  },
  error(msg){
    process.stderr.write(`${logSymbols.error} ${'ERROR'.red}: ${msg}`);
  }
};

module.exports = log;