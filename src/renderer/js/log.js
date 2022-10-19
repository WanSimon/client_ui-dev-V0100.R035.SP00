const path = require('path');
const fs = require('fs');
const util = require('util');
const log = require('electron-log');
const processId = require('electron').remote.process.pid

const levelMap = {
  'info': 'I',
  'debug': 'D',
  'error': 'E',
  'warn': 'W',
  'verbose': 'T',
  'silly': 'T',
};

//error, warn, info, verbose, debug, silly
const options = {
  local: true,
  consoleLevel: 'silly',
  fileLevel: 'silly',
  fileMaxSize:  104857600,
  fileFormat: '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}',
  filepath: 'D:\\xy\\log\\',
}

class CustomLog{
  constructor(conf){
    this.conf = {...options, ...conf};
    this.log = console;
    this.init();
  }
  init(){
    let self = this;
    if(self.conf.local){
      self.log = log;
      self.log.transports.file.level = self.conf.fileLevel;
      self.log.transports.file.maxSize = self.conf.fileMaxSize;
      //self.log.transports.file.format = '[I] {h}:{i}:{s}.{ms}(0000000000000000):{text}';
      //格式化
      self.log.transports.file.format = logMessage => {
        let text = util.format.apply(util, logMessage.data);
        let dt = new Date(logMessage.date);
        let str = `${String(dt.getHours()).padStart(2, 0)}:${String(dt.getMinutes()).padStart(2, 0)}:${String(dt.getSeconds()).padStart(2, 0)}.${String(dt.getMilliseconds()).padStart(3, 0)}`;
        let pid = '0000000000000000';
        if(processId){
          pid = processId.toString(16).padStart(16, 0);
        }
        if(levelMap.hasOwnProperty(logMessage.level)){
          return `[${levelMap[logMessage.level]}] ${str}(${pid}):${text}`
        }else{
          return `[I] ${str}(${pid}):${text}`
        }
      };
      //按日期生成日志
      self.log.transports.file.resolvePath = variables => {
        let filename = self.getPrefix();
        return path.join(self.conf.filepath, `${filename}_00.log`);
      }
      //备份日志
      self.log.transports.file.archiveLog = file => {
        file = file.toString();
        const info = path.parse(file);
        try {
          let filename = self.getPrefix();
          let suffix = self.getSuffix();
          fs.renameSync(file, path.join(info.dir, filename + '_' + suffix + info.ext));
        } catch (e) {
          console.warn('Could not rotate log', e);
        }
      }
    }
  }
  getPrefix(){
    let date = new Date();
    return 'client_ui_' + date.getFullYear() + String(date.getMonth() + 1).padStart(2, 0) + String(date.getDate()).padStart(2, 0);
  }
  getSuffix(){
    let self = this;
    try{
      const files = fs.readdirSync(self.conf.filepath);
      let filename = this.getPrefix();
      let reg = new RegExp(`^${filename}.*\.log$`);
      let ret = [];
      files.forEach(file => {
        if(reg.test(file)){
          ret.push(file);
        }
      });
      ret = ret.sort((a, b) => {
        return a > b ? -1 : 1;
      });
      if(!ret.length) return '01';
      ret = ret[0].replace(`${filename}_`, '');
      ret = ret.split('.');
      if(!ret.length) return '01';
      ret = ret[0];
      ret = (+ret || 0) + 1;  
      return String(ret).padStart(2, 0);
    }catch(e){
      console.info('getSuffix error ', e);
      return '01';
    }
  }
}

export default new CustomLog({});