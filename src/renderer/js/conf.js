let conf = {};

try{
  const fs = require('fs');
  conf = fs.readFileSync("D:/xy/node/static/conf.json", "utf8");
  conf = JSON.parse(conf);
}catch(e){
  conf = require('D:/xy/node/static/conf.json');
}

//故障药道错误代码
conf.slotNoFaultCode = {
  401: '气压低',
};

//管理员debug页面默认密码
if(!conf.hasOwnProperty('adminDebugPassword')) conf.adminDebugPassword = '123456789';

//防止漏药提醒
if(!conf.hasOwnProperty('remindPatient') || !Array.isArray(conf.remindPatient)) conf.remindPatient = [90];

//特殊药品处理
if(!conf.hasOwnProperty('specialDrugs')) conf.specialDrugs = { "869009690001370105": 20, "869009690000830008":20, "86900601000204040":20, "86903714001212000":12 };

//防止json文件中无defaultEquipmentInfo节点
if(!conf.defaultEquipmentInfo) conf.defaultEquipmentInfo = {};

//故障药道error_type_code
conf.slotErrorTypeCode = 301;

//故障码
conf.faultTypeCode = {
  ProductLack: 801,
  ProductExpired: 701,
  EquipmentError: 601,
  PrinterStatus: 501,
  SlotFaultStatus: 301,
  CheckerResourceStatus: 401
}
conf.faultTypeCodeLabel = {
  801: 'ProductLack',
  701: 'ProductExpired',
  601: 'EquipmentError',
  501: 'PrinterStatus',
  301: 'SlotFaultStatus',
  401: 'CheckerResourceStatus'
}

export default conf;