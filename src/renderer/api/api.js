/**
 * Created by liyixin on 2019/11/13.
 */
import uuid from 'uuid';
import router from '../router'
import store from "../store"

const message = {
  //ui->node->cloud
  get_init_status: "get_init_status",
  search_customer: "search_customer",
  get_equipment_admin: "get_equipment_admin",
  register_customer: "register_customer",
  submit_order: "submit_order",
  get_order: "get_order",
  update_order_status: "update_order_status",
  get_customer_product: "get_customer_product",
  get_equipment_product: "get_equipment_product",
  //pick_up_product:            "pick_up_product",
  take_off_product: "take_off_product",
  replenish_product: "replenish_product",
  get_equipment_info: "get_equipment_info",
  req_pay: "req_pay",
  req_get_pay_status: "req_get_pay_status",
  req_cancel_pay: "req_cancel_pay",
  measure_product:"measure_product",
  measure_channel:"measure_channel",
  update_order_status_list: 'update_order_status_list', 
  stop_measure_channel: 'stop_measure_channel', 
  query_checker_rescource: 'query_checker_rescource',
  update_checker_photo: 'update_checker_photo',
  is_drug_take_away: 'is_drug_take_away',
  get_replenish_order: 'get_replenish_order',
  submit_replenish_order: 'submit_replenish_order',
  query_equipment_warning: 'query_equipment_warning',
  close_equipment_function: 'close_equipment_function',

  //ui->node->sdk
  read_idcard: "read_idcard",
  stop_read_idcard: "stop_read_idcard",
  print_ticket: "print_ticket",
  scanqrcode: "scanqrcode",
  stop_scan_qrcode: "stop_scan_qrcode",
  pick_up_product: "pick_up_product",
  operate_vendor: "operate_vendor",
  facematch_photo: "facematch_photo",
  facematch_video: "facematch_video",
  stop_facematch_video: "stop_facematch_video",
  start_maintenance_mode: "start_maintenance_mode",
  stop_maintenance_mode: "stop_maintenance_mode",
  operate_light: "operate_light",
  operate_light_v2: "operate_light_v2",
  operate_light_v3: "operate_light_v3",
  operate_track: "operate_track",
  pick_up_product_v2: "pick_up_product_v2",
  read_card_no: "read_card_no",
  query_fault_drug_channel: 'query_fault_drug_channel',
  remove_fault_drug_channel: 'remove_fault_drug_channel',
  start_read_card_no: 'start_read_card_no',
  stop_read_card_no: 'stop_read_card_no',
  axis_check: 'axis_check',
  door_check: 'door_check',

  maintenanc_pick_up_product: "maintenanc_pick_up_product",
  maintenanc_operate_caterpilla_light:"maintenanc_operate_caterpilla_light"

};

const notify = {
  notify_read_idcard: "notify_read_idcard",
  notify_facematch_video: "notify_facematch_video",
  notify_pick_up_product: "notify_pick_up_product",
  notify_temperature_humidity: "notify_temperature_humidity",
  notify_equipment_status: "notify_equipment_status",
  notify_operate_vendor: "notify_operate_vendor",
  notify_equipment_info_change: "notify_equipment_info_change",
  notify_qrcode: "notify_qrcode",
  notify_measure_channel:"notify_measure_channel",
  notify_take_off_product:"notify_take_off_product",
  notify_self_check: 'notify_self_check',
  notify_update_checker_photo: 'notify_update_checker_photo',
  notify_reminder_fault_exist: 'notify_reminder_fault_exist',
  notify_equipment_shutdown: 'notify_equipment_shutdown',
  notify_equipment_error_detail: 'notify_equipment_error_detail',
};
//0:正常;1:异常;2:离线;3:停用
const DeviceStatus = {
  Normal: 0,
  Abnormal: 1,
  Offline: 2,
  Stop: 3
};
const TradeType = {
  //微信JSAPI
  WX_JSAPI: 1,
  //微信原生
  WX_NATIVE: 2,
  //微信APP
  WX_APP: 3,
  // 付款码支付(暂不支持)
  WX_MICROPAY: 4,
  // H5支付(暂不支持)
  WX_MWEB: 5,

  // 阿里条码支付
  ALI_BARCODE: 10,
  // 阿里扫码支付
  ALI_NATIVE: 11,
  // 阿里移动支付
  ALI_APP: 12,
  // 阿里手机网站支付
  ALI_WAP: 13,
  // 阿里即时到账
  ALI_INSTANT: 14,
  // 阿里刷脸支付
  ALI_FACEPAY: 15,
};
const PayStatus = {
  //未支付
  PS_NoPay: 0,
  //已支付
  PS_SUCCESS: 1,
  //支付中
  PS_WAITING: 2,
  //支付失败
  PS_Failed: 3,
  //已退款
  PS_Refunded: 4,
  //已过期
  PS_EXPIRED: 5,
  //已取消
  PS_CANCLED: 6
};
const OrderStatus = {
  //未支付
  OS_NoPay: 0,
  //已支付
  OS_Paied: 1,
  //已取药
  OS_Taked: 2
};
const PickUpType = {
  //扫码取货
  COMMON: 0,
  //扫码取货
  CODE: 1
};
const BuyWay = {
  //直接购买
  Buy: 0,
  //自助购药
  Take: 1
};
const OrderResource = {
  //平台
  OSRC_Platform: 0,
  //第三方
  OSRC_Third: 1,
  //药机
  OSRC_Equipment: 2,
};
const category = [
  {
    id: "2ed44d50-464c-11ea-b057-6c0b8482137a",
    name: "保健品"
  },
  {
    id: "ec507da4-464d-11ea-b057-6c0b8482137a",
    name: "保健酒"
  },
];
const PrescPickupStatus = {
  //待取
  PS_NoPick:0,
  //取药成功
  PS_SUCCESS:1,
  //取药失败
  PS_Failed:2
};

class API {
  constructor(url) {
    this.url = url;
    this._requests = {};
    this._requestIndex = 1;
    this._timeout = 10000;
    //全局变量 存储舱门开关状态
    this.doorOpen = false;
    //全局变量 存储模式 1：正常模式  2：维护模式（未认证通过） 3：维护模式（认证通过）
    this.mode = 1;
    this.TradeType = Object.freeze(TradeType);
    this.PayStatus = Object.freeze(PayStatus);
    this.category = Object.freeze(category);
    this.OrderStatus = Object.freeze(OrderStatus);
    this.DeviceStatus = Object.freeze(DeviceStatus);
    this.OrderResource = Object.freeze(OrderResource);
    this.BuyWay = Object.freeze(BuyWay);
    this.PickUpType = Object.freeze(PickUpType);
    this.PrescPickupStatus = Object.freeze(PrescPickupStatus);
  }

  open() {
    let self = this;
    self.ws = new WebSocket(this.url);
    self.ws.onopen = async () => {
      setTimeout(()=>{
        this.init();
      },3000);
      self.isopen = true;
      log.log("connect to server");
    };
    self.ws.onclose = () => {
      log.log("disconnect!");
      self.isopen = false;
      setTimeout(() => {
        self.open();
      }, 1000);
    };
    self.ws.onerror = (err) => {
      log.error('ws onerror', err.message || '');
    };
    self.ws.onmessage = (msg) => {
      if (msg.data && msg.data instanceof Blob) {
        if (this.on_notify_face_blob)
          //人脸对比数据 以二进制数据流传输
          this.on_notify_face_blob(msg.data);
        return;
      }
      msg = JSON.parse(msg.data);
      if (!msg || !msg.msgid || !msg.invokeid) {
        log.error("drop unknow message!", JSON.stringify(msg));
        return false;
      }

      //请求回应
      if (msg.invokeid && message.hasOwnProperty(msg.msgid)) {
        let req = self._requests[msg.invokeid];
        if (req) {
          delete self._requests[msg.invokeid];
          if (msg.errcode !== 0) {
            log.error("response err,err=%s", JSON.stringify(msg));
            req.reject(new Error(msg.errmsg || 'response err'));
          } else {
            if('get_equipment_info' != msg.msgid && 'get_equipment_product' != msg.msgid) log.debug('recv response, msgid=%s, invokeid=%s, body=%s', msg.msgid, msg.invokeid, JSON.stringify(msg.body || {}));
            req.resolve(msg.body);
          }
        }
      }
      //通知
      else if (msg.invokeid && notify.hasOwnProperty(msg.msgid)) {
        self.onNotify(msg);
      } else {
        log.error("drop unknow message! %s", JSON.stringify(msg));
      }
    };
  }

  //初始化执行
  async init(){
    try {
      //设备信息变更
      let info = await this.get_equipment_info();
      if(info && info.equipment_info){
        //存储设备信息
        store.dispatch("addEquipmentInfo",info.equipment_info);
        //存储人脸识别开关
        if(info.equipment_info.config_json){
          store.commit('changeSystemConf', {key: 'faceRecognition', value: info.equipment_info.config_json.faceRecognition == '1'});
        }
      }
      // 启用扫描枪监听
      this.watchScan();
    }
    catch (e) {
      log.error('get_equipment_info failed,e=',e);
    }
  }

  //监听扫码枪
  watchScan() {
    let keycode = "";
    let lastTime = null;
    let nextTime = null;
    let lastCode = null;
    let nextCode = null;
    document.onkeydown = async (e) => {
      if (this.mode !== 3) {
        return;
      }
      //兼容性处理
      if (window.event) {
        nextCode = e.keyCode;
      } else if (e.which) {
        nextCode = e.which;
      }
      //获取当前时间
      nextTime = new Date().getTime();
      //回车字符
      if (nextCode == 13 && keycode != "" && nextTime - lastTime <= 30) {
        // 扫码枪扫描回调函数
        this.on_notify_scan && this.on_notify_scan(keycode);

        keycode = "";
        lastCode = null;
        lastTime = null;
      } else {
        //此处可以增加限制nextCode的种类例如数字
        if (lastCode == null && lastTime == null) {//初始字母
          //增加限制nextCode的种类例如数字
          if(nextCode>47 && nextCode<58 ) {
            keycode = String.fromCharCode(nextCode);
          }
        } else if (lastCode != null && lastTime != null && nextTime - lastTime <= 30) {
          //增加限制nextCode的种类例如数字
          if(nextCode>47 && nextCode<58 ) {
            keycode += String.fromCharCode(nextCode);
          }
        } else {//手动输入
          keycode = "";
          lastCode = null;
          lastTime = null;
        }
        lastCode = nextCode;
        lastTime = nextTime;
      }
    }
  }

  async onNotify(msg) {
    if(notify.notify_facematch_video != msg.msgid && notify.notify_read_idcard != msg.msgid && notify.notify_reminder_fault_exist != msg.msgid){
      log.debug('recv notify msgid=%s, data=%s', msg.msgid, JSON.stringify(msg.body || {}));
    }
    switch (msg.msgid) {
      //身份证信息
      case notify.notify_read_idcard:
        if (this.on_notify_read_idcard)
          await this.on_notify_read_idcard(msg.body || {});
        break;
      //人脸识别
      case notify.notify_facematch_video:
        if (this.on_notify_facematch_video)
          await this.on_notify_facematch_video(msg.body || {});
        break;
      case notify.notify_pick_up_product:
        if (this.on_notify_pick_up_product)
          await this.on_notify_pick_up_product(msg.body || {});
        break;
      case notify.notify_temperature_humidity:
        if (this.on_notify_temperature_humidity)
          await this.on_notify_temperature_humidity(msg.body);
        break;
      case notify.notify_equipment_status:
        if (this.on_notify_equipment_status)
          await this.on_notify_equipment_status(msg.body);
        break;
      case notify.notify_operate_vendor:
        if (this.on_notify_operate_vendor)
          await this.on_notify_operate_vendor(msg.body);
        break;
      //设备信息变更
      case notify.notify_equipment_info_change:
        if (this.on_notify_equipment_info_change) {
          await this.on_notify_equipment_info_change();
        }
        break;
      case notify.notify_qrcode:
        if(this.on_notify_qrcode){
          await this.on_notify_qrcode(msg.body||{});
        }
        break;
      case notify.notify_measure_channel:
        if(this.on_notify_measure_channel){
          await this.on_notify_measure_channel(msg.body||{});
        }
        break;
      case notify.notify_take_off_product:
        if (this.on_notify_take_off_product)
          await this.on_notify_take_off_product(msg.body || {});
        break;
      case notify.notify_reminder_fault_exist:
        if (this.on_notify_reminder_fault_exist)
          this.on_notify_reminder_fault_exist(msg.body || {});
        break;
      default:
        if(notify.hasOwnProperty(msg.msgid) && this[`on_${notify[msg.msgid]}`]){
          await this[`on_${notify[msg.msgid]}`](msg.body || {});
        }
        break;
    }
  }

  async on_notify_equipment_status(body) {
    if (body.status != this.DeviceStatus.Normal) {
      log.error('设备状态异常,status=', body.status);
      router.push('/');
    }
  }

  async on_notify_temperature_humidity(body) {
    if (body.temperature_humidity_info) {
      store.dispatch("setTemperatureHumidity",body.temperature_humidity_info);
    }
  }

  async on_notify_equipment_info_change() {
    //设备信息变更
    let info = await this.get_equipment_info();
    if(info && info.equipment_info){
      //存储设备信息
      store.dispatch("addEquipmentInfo",info.equipment_info);
      if(info.equipment_info.config_json){
        store.commit('changeSystemConf', {key: 'faceRecognition', value: info.equipment_info.config_json.faceRecognition == '1'});
      }
    }
  }

  request(msgid, body) {
    let self = this;
    return new Promise((resolve, reject) => {
      let seq = guid22();
      //if (self._requestIndex > 10000) self._requestIndex = 1;
      let msg = {
        invokeid: seq,
        msgid: msgid
      };
      msg.body = body || {};
      self._requests[seq] = {
        createTime: new Date().getTime(),
        outOfTime: new Date().getTime() + self._timeout,
        resolve: resolve,
        reject: reject
      };
      if (self.ws.readyState === WebSocket.OPEN){
        log.debug('send message msgid=%s, invokeid=%s, data=%s', msgid, seq, JSON.stringify(msg.body));
        self.ws.send(JSON.stringify(msg));
      }else{
        return reject(new Error(`ws close, msgid = ${msgid}, invokeid = ${seq}`));
      }
      setTimeout(() => {
        reject(new Error(`timeout, msgid = ${msgid}, invokeid = ${seq}`));
      }, self._timeout);
    });
  }

  /**
   * 获取初始化状态
   * */
  async get_init_status() {
    return this.request(message.get_init_status);
  }

  /**
   * 获取会员信息
   * @param phone 手机号
   * @param id_card 身份证号码
   * */
  async search_customer(phone, id_card) {
    return this.request(message.search_customer, {phone, id_card});
  }

  /**
   * 获取设备管理员
   * @param id_card 身份证号码
   * */
  async get_equipment_admin( obj ) {
    return this.request(message.get_equipment_admin, obj);
  }

  /**
   * 注册会员
   * @param openid 微信号
   * @param mobile 会员信息(手机键
   * @param password 密码(md5加密)
   * @param name 真实姓名
   * @param nick_name 昵称
   * @param avatar 头像(base64)
   * @param sex 性别
   * @param location 所在地
   * @param id_card 身份证号
   * */
  async register_customer(openid, mobile, password, name, nick_name, avatar, sex, location, id_card) {
    return this.register_customer(openid, mobile, password, name, nick_name, avatar, sex, location, id_card)
  }

  /**
   * 提交订单
   * @param id 订单id
   * @param inner_order_no 内部编号
   * @param outer_order_no 外部编号
   * @param serial_no 流水号
   * @param merchant_id 商户id
   * @param equipment_id 设备id
   * @param amount 金额
   * @param customer_amount 会员金额
   * @param pay_amount 实际支付金额
   * @param pay_type 支付方式
   * @param pay_status 支付状态
   * @param buy_way 购买方式
   * @param order_source 订单来源
   * @param customer_id 会员id
   * @param pick_up_code 取货码
   * @param pick_up_type 取货方式
   * @param pay_order_no 支付订单编号
   * @param id_card 身份证号码
   * @param medical_insurance_card 医保卡号
   * @param {Array} order_detail_info_list 订单详情 [{
					//订单id
					"id":"dafaf",
					//商品编号
					"product_id:"dafaf",
					//批次
					"batch_number:"34343434",
					//批号
					"batch:"34343434",
					//金额
					"amount:"50,
					//会员价
					"customer_amount:"60,
					//单价
					"unit_price:"70,
					//会员单价
					"customer_price:"80,
					//数量
					"product_count:"90
				}]
   * */
  async submit_order(order_info) {
    return this.request(message.submit_order, {order_info});
  }

  /**
   * 查询订单
   * @param order_id 消息ID
   * */
  async get_order(order_id) {
    return this.request(message.get_order, {order_id});
  }

  /**
   * 支付请求
   * @param trade_type 交易类型(暂时仅支持微信公众号支付和阿里手机网站支付)
   * @param trade_no 订单号
   * @param total_fee 订单金额
   * @param comment  备注
   * */
  async req_pay(pay_info) {
    return this.request(message.req_pay, {pay_info});
  }

  /**
   * 请求支付状态
   * @param trade_no 订单号
   * */
  async req_get_pay_status(trade_no) {
    return this.request(message.req_get_pay_status, {trade_no});
  }

  /**
   * 更新订单状态
   * @param order_id 订单ID
   * @param status 订单状态
   * */
  async update_order_status(order_id, status) {
    return this.request(message.update_order_status, {order_id, status});
  }

  async update_order_status_list(order_status_list) {
    return this.request(message.update_order_status_list, {order_status_list});
  }

  /**
   * 取消支付
   * @param trade_no 订单号
   * */
  async cancel_pay(trade_no) {
    return this.request(message.req_cancel_pay, {trade_no});
  }

  /**
   * 获取客户商品
   * @param pick_up_code 提货码
   * */
  async get_customer_product(pick_up_code) {
    return this.request(message.get_customer_product, {pick_up_code});
  }

  /**
   * 获取设备商品信息
   * @param {Array} merchant_product_id_list 商品id(为空时表示所有)
   * */
  async get_equipment_product(merchant_product_id_list) {
    return this.request(message.get_equipment_product, {merchant_product_id_list: merchant_product_id_list || []});
  }

  /**
   * 下架商品
   * @param op_account_id 操作人账号
   * @param slot_no 药道号(slot_no:-1,product_count:-1为一键清库存;slot_no:2,product_count:-1为清药道;slot_no:3,product_count:1为单盒下架)
   * @param product_count 数量
   * */
  async take_off_product(op_account_id, slot_no, product_count) {
    return this.request(message.take_off_product, {op_account_id, slot_no, product_count});
  }

  /**
   * 补货商品
   * @param bar_code
   * */
  async replenish_product(bar_code) {
    return this.request(message.replenish_product, {bar_code});
  }

  /**
   * 查询设备
   * */
  async get_equipment_info() {
    return this.request(message.get_equipment_info);
  }

  /**
   * 读取身份证
   * */
  async read_idcard() {
    return this.request(message.read_idcard);
  }

  /**
   * 停止读取身份证
   * */
  async stop_read_idcard() {
    return this.request(message.stop_read_idcard);
  }

  /**
   * 打印小票
   * @param ticket_info 小票信息
   * @param ticket_type 小票类型 0自购要小票 1处方药小票
   * */
  async print_ticket(ticket_info, ticket_type = 0) {
    return this.request(message.print_ticket, { ticket_info, ticket_type });
  }


  /**
   * 扫描二维码
   * */
  async scanqrcode() {
    return this.request(message.scanqrcode);
  }

  /**
   * 停止扫描二维码
   * */
  async stop_scan_qrcode() {
    return this.request(message.stop_scan_qrcode);
  }

  /**
   * 售货机出货
   * @param order_id 订单号
   * @param lock_product 锁定标识(0:不锁定库存;1:锁定库存)
   * @param {Array} merchant_product_list 例如：[{
				"merchant_product_id":"fdasfdsf",
				"count":1
			}]
   * */
  async pick_up_product(order_id, lock_product,merchant_product_list) {
    return this.request(message.pick_up_product, {order_id, lock_product,merchant_product_list});
  }

  /**
   * 售货机操作
   * @param container_num  柜号
   * @param operateType 动作指令（1：打开取货仓门，2：关闭取货仓门，3：打开取货仓灯光，4：关闭取货仓灯光，5：将升降梯中物品置入取货仓，6：将取货仓物品置入回收仓）
   * */
  async operate_vendor(operateType, container_num) {
    return this.request(message.operate_vendor, {container_num, operateType});
  }

  /**
   * 人脸检测图片对比
   * @param path_image 图片路径（建议使用现场采集的图片base64）
   * @param path_sfz  图片路径（建议使用身份证图片base64）
   * @param threshold_score 活体检测阈值，推荐0.75
   * */
  async facematch_photo(path_image, path_sfz, threshold_score) {
    return this.request(message.facematch_photo, {path_image, path_sfz, threshold_score});
  }

  /**
   * 人脸检测视频识别
   * @param image 需要对比的照片(base64)
   * @param draw_rectangle 是否绘制人脸框（0：不绘制、1：绘制）
   * @param threshold 人脸识别通过的分数（阈值推荐0.8）
   * @param need_liveness 活体检测阈值（0:不检测，大于0：活体检测）（阈值推荐0.75）
   * */
  async facematch_video(image, draw_rectangle, threshold, need_liveness) {
    return this.request(message.facematch_video, {image, draw_rectangle, threshold, need_liveness});
  }

  /**
   * 停止人脸检测视频识别
   * */
  async stop_facematch_video() {
    return this.request(message.stop_facematch_video);
  }

  /**
   * 进入维护模式
   * */
  async start_maintenance_mode(op_account_id) {
    return this.request(message.start_maintenance_mode, {op_account_id});
  }

  /**
   * 退出维护模式
   * */
  async stop_maintenance_mode() {
    return this.request(message.stop_maintenance_mode);
  }

  /**
   * 关闭舱门
   * */
  async closeDoor() {
    if (!this.doorOpen) return;
    try {
      await this.operate_vendor(2);
      this.doorOpen = false;
      return true;
    } catch (e) {
      log.error('关舱门失败', e);
    }
  }

  /**
   * 打开舱门
   * */
  async openDoor() {
    try {
      await this.operate_vendor(1);
      this.doorOpen = true;
    } catch (e) {
      log.error('打开舱门失败', e);
      throw e;
    }
  }

  /**
   * 灯操作
   * //柜号
   "container_num":1,
   "slot_no":1,
   //0:关闭、1:打开
   "opentype":1
   * */
  async optLight(container_num, slot_no, opentype) {
    try {
      let operationinfo = {container_num, slot_no, opentype};
      await this.request(message.operate_light, {operationinfo});
    } catch (e) {
      log.error('灯操作失败', e);
    }
  }

  async optLightV3(x, y, opentype) {
    try {
      await this.request(message.operate_light_v3, {x, y, switch: opentype});
      return true;
    } catch (e) {
      log.error('灯操作失败', e);
    }
  }



  /**
   * 灯操作
   * @param {Array} close_slot_no
   * @param {Array} open_slot_no
   * */
  async optLightV2({container_num, close_slot_no, open_slot_no}) {
    try {
      let operationinfo = {container_num, close_slot_no, open_slot_no};
      await this.request(message.operate_light_v2, {operationinfo});
    } catch (e) {
      log.error('灯操作失败', e);
    }
  }

  /**
   * 操作履带
   **/
  async operateTrack(option) {
    try {
      await this.request(message.operate_track, option);
      return true;
    } catch (e) {
      log.error('履带操作失败', e);
    }
  }

  async pick_up_product_v2(data) {
    try{
      await this.request(message.pick_up_product_v2, data);
      return true;
    }catch(e){
      log.error('出药失败', e);
    }
  }

  /**
   * 盘点商品
   * @param {string} op_account_id 操作人账号
   * @param {Object} slot_product_list :
   * [
   {
		        //药道号
		        "slot_no":1,
		        //数量
		        "product_count":1
		    }
   ]
   * */
  async measure_product(op_account_id,slot_product_list){
    return this.request(message.measure_product,{op_account_id,slot_product_list});
  }

  /**
   * 盘点药道
   * @param slot_no
   * */
  async measure_channel(slot_no){
    return this.request(message.measure_channel,{slot_no});
  }

  //停止盘点
  async stop_measure_channel(){
    return this.request(message.stop_measure_channel);
  }

  /**
   * 维护模式操作履带或指示灯
   * */
  async maintenanc_pick_up_product({x,y,slot_no,bar_code,count = 1}){
    return this.request(message.maintenanc_pick_up_product,{x,y,slot_no,bar_code,count});
  }

  /**
   * 维护模式操作履带或指示灯
   * @param device 1:履带  2：指示灯
   * @param operateType 1： 打开单个的履带或指示灯  0:  关闭单个的履带或指示灯  10: 打开单层的履带或指示灯  20: 关闭单层的履带或指示灯
   * */
  async maintenanc_operate_caterpilla_light({x,y,slot_no,device,operateType}){
    return this.request(message.maintenanc_operate_caterpilla_light,{x,y,slot_no,device,operateType});
  }

  /**
   * 读卡  医保卡诊疗卡等等
   * @param card_type  1医保卡   10诊疗卡
   * */
   async readCardNo(card_type = 1){
    return this.request(message.read_card_no, {card_type});
  }

  //查询故障药道
  query_fault_drug_channel() {
    return this.request(message.query_fault_drug_channel);
  }

  //处理故障药道
  remove_fault_drug_channel(slot_no) {
    return this.request(message.remove_fault_drug_channel, { slot_no });
  }

  //开始读取医保卡
  start_read_card_no(){
    return this.request(message.start_read_card_no);
  }

  //停止读取医保卡
  stop_read_card_no(){
    return this.request(message.stop_read_card_no);
  }

  //设备三轴传感器检测
  axis_check(){
    return this.request(message.axis_check);
  }

  //设备仓门检测
  door_check(){
    return this.request(message.door_check);
  }

  //查询复核资源异常请求
  query_checker_rescource(){
    return this.request(message.query_checker_rescource);
  }

  //更新设备复核图片异常
  update_checker_photo(){
    return this.request(message.update_checker_photo);
  }

  //请求检查药是否都从取药舱取走
  is_drug_take_away(){
    return this.request(message.is_drug_take_away);
  }

  //补货单数据查询
  get_replenish_order(replenish_no){
    return this.request(message.get_replenish_order, { replenish_no })
  }

  //提交补货单
  submit_replenish_order(replenish_no, replenish_detial_info_list, op_account_id){
    return this.request(message.submit_replenish_order, { replenish_no, replenish_detial_info_list, op_account_id });
  }

  //查询故障列表
  query_equipment_warning(warning_type){
    return this.request(message.query_equipment_warning, { warning_type });
  }

  //故障通知
  on_notify_reminder_fault_exist(body){
    if(Array.isArray(body.equipment_fault_list) && body.equipment_fault_list.length) store.commit('addNotice', body.equipment_fault_list);
  }

  //异常通知,影响机器使用的错误
  on_notify_equipment_shutdown(body){
    //log.info("store setEquipmentFault", JSON.stringify(body));
    //if(body) store.commit('setEquipmentFault', body); 
  }

  //
  on_notify_equipment_error_detail(body){
    log.info("store setEquipmentFault", JSON.stringify(body));
    if(body) store.commit('setEquipmentFault', body);
  }

  close_equipment_function(body){
    return this.request(message.close_equipment_function, { "err_level": body.err_level, "err_code": body.err_code, "err_operate": (body.hasOwnProperty("err_operate") ? body.err_operate : 1)  }); 
  }

}

export default API;


function guid22() {
  //生成24位guid
  let guid = new Buffer(uuid.v4('binary')).toString('base64');
  //转成base64，最后两位都是＝＝，所以截取掉。  并且替换特殊字符串
  return guid.replace(/\//g, '_').replace(/\+/g, '-').substring(0, 22);
}
