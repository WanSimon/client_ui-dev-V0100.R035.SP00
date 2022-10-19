<template>
  <div class="debug">
    <top-nav :title-text="pageName" :show-left-button="true" :show-right-button="false" :clearRemain="true"></top-nav>
    <div class="box01">
      <div class="left">
        <div class="box01-com">
          <div class="box01-com-left">药仓</div>
          <div class="box01-com-right">
            <button :disabled="btnDisabled.openDoor" class="btn" @click="openDoor">打开舱门</button>
            <button :disabled="btnDisabled.closeDoor" class="btn" @click="closeDoor">关闭舱门</button>
            <button class="btn" @click="clearText">清空控制台输出</button>
          </div>
        </div>
        <div class="box01-com">
          <div class="box01-com-left">设备自检</div>
          <div class="box01-com-right">
            <button :disabled="btnDisabled.axisCheck" class="btn" @click="axisCheck">三轴传感器检测</button>
            <button :disabled="btnDisabled.doorCheck" class="btn" @click="doorCheck">设备仓门检测</button>
          </div>
        </div>
        <div class="box01-com">
          <div class="box01-com-left">回收仓</div>
          <div class="box01-com-right">
            <button :disabled="btnDisabled.openFlap" class="btn" @click="openFlap">打开挡板</button>
          </div>
        </div>
        <div class="box01-com">
          <div class="box01-com-left">盘点</div>
          <div class="box01-com-right">
            <div style="width: 100%;height:.6rem;display: flex;align-items: center;">
              <el-select class="el-custom" v-model="row"  placeholder="请选择" style="width: 1.5em">
                <el-option v-for="item in rows" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
              <div class="box01-font2">层</div>
              <el-select class="el-custom" v-model="col"  placeholder="请选择" style="margin-left: .1rem;width: 1.5em">
                <el-option v-for="item in cols" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
              <div class="box01-font2">列</div>
              <button :disabled="btnDisabled.measure" style="margin-left: 10px;" class="btn" @click="measure">盘点</button>
            </div>
          </div>
        </div>
        <div class="box01-com">
          <div class="box01-com-left">取药</div>
          <div class="box01-com-right">
            <div style="width: 100%;height:.6rem;display: flex;align-items: center; margin-bottom: 5px;">
              <el-select class="el-custom" v-model="product.row"  placeholder="请选择" style="width: 1.5em">
                <el-option v-for="item in rows" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
              <div class="box01-font2">层</div>
              <el-select class="el-custom" v-model="product.col"  placeholder="请选择" style="margin-left: .1rem;width: 1.5em">
                <el-option v-for="item in cols" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
              <div class="box01-font2">列</div>
              <el-input-number v-model="product.count" :min="1" label="个数" style="margin-left: .1rem; width:140px;"></el-input-number>
              <el-checkbox style="margin-left: .1rem; font-size: .20rem;font-weight: 600; color: #666666;" class="el-custom" v-model="product.check" true-label=1 false-label=0>复核</el-checkbox>
            </div>
            <button :disabled="btnDisabled.pickup" class="btn" @click="pickup">取药</button>
          </div>
        </div>
        <div class="box01-com">
          <div class="box01-com-left">履带</div>
          <div class="box01-com-right">
            <div style="width: 100%;height:.6rem;display: flex;align-items: center; margin-bottom: 5px;">
              <el-select class="el-custom" v-model="track.row"  placeholder="请选择" style="width: 1.5em">
                <el-option v-for="item in rows" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
              <div class="box01-font2">层</div>
              <el-select class="el-custom" v-model="track.col"  placeholder="请选择" style="margin-left: .1rem;width: 1.5em">
                <el-option v-for="item in cols" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
              <div class="box01-font2">列</div>
              <el-input-number v-model="track.duration" :min="-1" label="持续时间" style="margin-left: .1rem; width:140px;"></el-input-number>
            </div>
            <button :disabled="btnDisabled.testTrack1" class="btn" @click="testTrack(1)">滚动</button>
            <button :disabled="btnDisabled.testTrack0" class="btn" @click="testTrack(0)">停止</button>
          </div>
        </div>
        <div class="box01-com">
          <div class="box01-com-left">指示灯</div>
          <div class="box01-com-right">
            <div style="width: 100%;height:.6rem;display: flex;align-items: center; margin-bottom: 5px;">
              <el-select class="el-custom" v-model="light.row"  placeholder="请选择" style="width: 1.5em">
                <el-option v-for="item in rows" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
              <div class="box01-font2">层</div>
              <el-select class="el-custom" v-model="light.col"  placeholder="请选择" style="margin-left: .1rem;width: 1.5em">
                <el-option v-for="item in cols" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
              <div class="box01-font2">列</div>
            </div>
            <button :disabled="btnDisabled.testLight1" class="btn" @click="testLight(1)">开指示灯</button>
            <button :disabled="btnDisabled.testLight0" class="btn" @click="testLight(0)">关指示灯</button>
          </div>
        </div>
        <div class="box01-com">
          <div class="box01-com-left">身份证读卡</div>
          <div class="box01-com-right">
            <div v-if="!status.reading" class="btn" @click="read_idcard">开始读取</div>
            <div v-else class="btn">读取中...</div>
          </div>
        </div>
        <div class="box01-com">
          <div class="box01-com-left">二维码扫描</div>
          <div class="box01-com-right">
            <div v-if="!status.scaning" class="btn" @click="scanqrcode">开始扫描</div>
            <div v-else class="btn">扫描中...</div>
          </div>
        </div>
        <div class="box01-com">
          <div class="box01-com-left">打印机</div>
          <div class="box01-com-right">
            <button :disabled="btnDisabled.print" class="btn" @click="print">打印小票</button>
          </div>
        </div>
        <div class="box01-com">
          <div class="box01-com-left">关闭程序</div>
          <div class="box01-com-right">
            <button class="btn" @click="toDesk">返回桌面</button>
          </div>
        </div>
        <div class="box01-com">
          <div class="box01-com-left" data-id="105">回收仓传感器</div>
          <div class="box01-com-right">
            <button :disabled="btnDisabled.switchFunction.btn_1_105" class="btn" @click="switchFunction(0, 'M', 105, '回收仓传感器')">开启功能</button>
            <button :disabled="btnDisabled.switchFunction.btn_0_105" class="btn" @click="switchFunction(1, 'M', 105, '回收仓传感器')">关闭功能</button>
          </div>
        </div>
        <div class="box01-com">
          <div class="box01-com-left" data-id="106">防夹手灯珠检测</div>
          <div class="box01-com-right">
            <button :disabled="btnDisabled.switchFunction.btn_1_106" class="btn" @click="switchFunction(0, 'M', 106, '防夹手灯珠检测')">开启功能</button>
            <button :disabled="btnDisabled.switchFunction.btn_0_106" class="btn" @click="switchFunction(1, 'M', 106, '防夹手灯珠检测')">关闭功能</button>
          </div>
        </div>
        <div class="box01-com">
          <div class="box01-com-left" data-id="107">药斗光栅检测</div>
          <div class="box01-com-right">
            <button :disabled="btnDisabled.switchFunction.btn_1_107" class="btn" @click="switchFunction(0, 'M', 107, '药斗光栅检测')">开启功能</button>
            <button :disabled="btnDisabled.switchFunction.btn_0_107" class="btn" @click="switchFunction(1, 'M', 107, '药斗光栅检测')">关闭功能</button>
          </div>
        </div>
        <div class="box01-com">
          <div class="box01-com-left" data-id="109">药未取走检测</div>
          <div class="box01-com-right">
            <button :disabled="btnDisabled.switchFunction.btn_1_109" class="btn" @click="switchFunction(0, 'M', 109, '药未取走检测')">开启功能</button>
            <button :disabled="btnDisabled.switchFunction.btn_0_109" class="btn" @click="switchFunction(1, 'M', 109, '药未取走检测')">关闭功能</button>
          </div>
        </div>
      </div>
      <div class="right" id="message" v-html="text"></div>
    </div>
  </div>
</template>

<script>
  import _ from "lodash";
  import API from '@/api/local';

  export default {
    name: "debug",
    data(){
      return {
        pageName:"设备调试",
        photo: '',
        text:"",
        status:{
          scaning:false,
          reading:false,
        },
        channel:{
          aisleX:0,
          aisleY:0
        },
        rows: [{
          value:'all',
          label:'全部'
        }],
        row:'all',
        cols:[{
          value:'all',
          label:'全部'
        }],
        col:'all',
        pickup_num:1,
        lineBreak: '<br>',
        product: {
          row: 'all',
          col: 'all',
          count: 1,
          check: 0
        },
        track: {
          row: 'all',
          col: 'all',
          duration: 10
        },
        light: {
          row: 'all',
          col: 'all',
        },
        idcardTimer: null,
        qrcodeTimer: null,
        btnDisabled: {
          openDoor: false,
          closeDoor: false,
          axisCheck: false,
          doorCheck: false,
          openFlap: false,
          measure: false,
          pickup: false,
          testTrack1: false,
          testTrack0: false,
          testLight1: false,
          testLight0: false,
          print: false,
          switchFunction: {}
        }
      }
    },
    component: {
    },
    async mounted(){
      this.op_account_id = this.$route.params.op_account_id;
      this.api.on_notify_qrcode = async (body)=>{
        this.text += `二维码扫描仪返回结果：${JSON.stringify(body)}`;
        this.text += this.lineBreak;
        //状态(0:成功;2:处于打开状态;-1:失败;-3:开启扫描仪照明失败;-8:初始化异常;-65535:程序未初始化)
        if(body.status == 0 && body.qrcodeinfo && body.qrcodeinfo.str){
          let code = body.qrcodeinfo.str;
        }
        if(this.qrcodeTimer) clearTimeout(this.qrcodeTimer);
        this.stop_scan_qrcode();
      };
      this.api.on_notify_read_idcard = async (body)=>{
        this.text += `身份证读卡器返回结果：${JSON.stringify(body)}`;
        this.text += this.lineBreak;
        //(0:成功;1:开始读取;2:读取中;3:用户终止读取;-8:连接身份证读卡器异常;-65535:程序未初始化;-1:其他)
        if(body && body.status == 0){
          this.photo = 'data:image/png;base64,' + body.idcardinfo.photo;
        }
        if(this.idcardTimer) clearTimeout(this.idcardTimer);
        this.stop_read_idcard();
      };
      //接收盘点通知
      this.api.on_notify_measure_channel = (body)=>{
        this.$set(this.btnDisabled, 'measure', false);
        this.text += `盘点返回结果：${JSON.stringify(body)}`;
        this.text += this.lineBreak;
        let slot_no = body.slot_no;
        let count = body.count;
      };
      //接收二维码扫描仪通知
      this.api.on_notify_qrcode = body => {
        this.text += `二维码扫描仪返回结果：${JSON.stringify(body)}`;
        this.text += this.lineBreak;
      };
      //舱门指令通知
      this.api.on_notify_operate_vendor = body => {
        //（1：打开取货仓门，2：关闭取货仓门，3：打开取货仓灯光，4：关闭取货仓灯光，5：将升降梯中物品置入取货仓，6：将取货仓物品置入回收仓）
        this.$set(this.btnDisabled, 'openDoor', false);
        this.$set(this.btnDisabled, 'closeDoor', false);
        this.$set(this.btnDisabled, 'openFlap', false);
        const labelArr = {1: '打开取货仓门', 2: '关闭取货仓门', 3: '打开取货仓灯光', 4: '关闭取货仓灯光', 5: '将升降梯中物品置入取货仓', 6: '打开回收仓'};
        if(labelArr.hasOwnProperty(body.operateType)){
          this.text += `${labelArr[body.operateType]}` + (body.status != 0 ? '失败' : '成功'); 
        }else{
          this.text += `舱门指令返回结果：${JSON.stringify(body)}`;
        }
        this.text += this.lineBreak;  
      };
      //重置取药结束通知
      this.api.on_notify_pick_up_product = (msg) => {
        this.$set(this.btnDisabled, 'pickup', false);
      }
      //自检通知
      this.api.on_notify_self_check = body => {
        this.$set(this.btnDisabled, 'axisCheck', false);
        this.$set(this.btnDisabled, 'doorCheck', false);
        if(Array.isArray(body.fault_equipment_list) && !body.fault_equipment_list.length){
          this.text += `设备自检返回结果：成功`;  
        }else{
          this.text += `设备自检返回结果：${JSON.stringify(body.fault_equipment_list)}`;  
        }
        this.text += this.lineBreak;  
      }

      setTimeout(async ()=>{
        await this.getList();
        this.generRowCol();
      },1000);
    },
    methods:{
      //关闭exe返回桌面
      async toDesk(){
        try{
          //打开桌面
          let ret1 = await API.sendCommand({cmd:"restart", prog:["shell"]});
          this.text += '打开桌面指令执行结果：' + JSON.stringify(ret1);
          this.text += this.lineBreak;
          //展示AllwaysOn
          let ret2 = await API.sendCommand({cmd:"show", show:true});
          this.text += '展示AllwaysOn指令执行结果：' + JSON.stringify(ret2);
          this.text += this.lineBreak;
          //关闭UI
          let ret3 = await API.sendCommand({cmd:"pause", prog:["my-project.exe"]});
          this.text += '关闭UI指令执行结果：' + JSON.stringify(ret3);
          this.text += this.lineBreak;
        }catch(e){
          this.log.error('toDesk error', e);
          this.text += e.message || '操作失败!';
          this.text += this.lineBreak;
        }
      },
      //清控制台text
      clearText(){
        this.text = '';
      },
      //三轴传感器检测
      async axisCheck(){
        let self = this;
        self.$set(self.btnDisabled, 'axisCheck', true);
        try{
          await self.api.axis_check();
          self.text += '设备三轴传感器检测指令发送成功';
          self.text += self.lineBreak;
        }catch(e){
          self.$set(self.btnDisabled, 'axisCheck', false);
          self.text += '设备三轴传感器检测指令发送失败：' + JSON.stringify(e.message);
          self.text += self.lineBreak;
        }
      },
      //仓门检测
      async doorCheck(){
        let self = this;
        self.$set(self.btnDisabled, 'doorCheck', true);
        try{
          await self.api.door_check();
          self.text += '设备仓门检测指令发送成功';
          self.text += self.lineBreak;
        }catch(e){
          self.$set(self.btnDisabled, 'doorCheck', false);
          self.text += '设备仓门检测指令发送失败：' + JSON.stringify(e.message);
          self.text += self.lineBreak;
        }
      },
      //履带
      async testTrack(opt){
        try{
          if('all' == this.track.row){
            this.text += '目前只支持全部层';
            this.text += this.lineBreak;
            return ;
          }
          this.$set(this.btnDisabled, `testTrack${opt}`, true);
          let data = {x: this.track.col, y: this.track.row, duration: this.track.duration, opt: opt};
          if(0 == data.duration) data.duration = 10;
          if('all' == this.track.row) data.y = -1;
          if('all' == this.track.col) data.x = -1;
          let ret = await this.api.operateTrack(data);
          this.text += ret ? 'success' : 'failed';
          this.text += this.lineBreak;
          this.$set(this.btnDisabled, `testTrack${opt}`, false);
        }catch(e){
          this.$set(this.btnDisabled, `testTrack${opt}`, false);
          this.text += JSON.stringify(e.message);
          this.text += this.lineBreak;
        }
      },
      //灯带
      async testLight(opt){
        try{
          if('all' == this.light.row && 'all' == this.light.col){
            this.text += '目前不支持全部, 请至少选择一个层或列';
            this.text += this.lineBreak;
            return ;
          }
          this.$set(this.btnDisabled, `testLight${opt}`, true);
          let data = {...this.light};
          if('all' == this.light.row) data.row = -1;
          if('all' == this.light.col) data.col = -1;
          let ret = await this.api.optLightV3(data.col, data.row, opt);
          this.$set(this.btnDisabled, `testLight${opt}`, false);
          this.text += opt ? '打开灯带 ' : '关闭灯带 ';
          this.text += ret ? '成功' : '失败';
          this.text += this.lineBreak;
        }catch(e){
          this.$set(this.btnDisabled, `testLight${opt}`, false);
          this.text += JSON.stringify(e);
          this.text += this.lineBreak;
        }
      },
      async openFace(){
        try{
          if(!this.photo){
            this.text += '测试人脸识别前，请先测试身份证读卡功能';
            this.text += this.lineBreak;
            return;
          } 
          await this.api.facematch_video(this.photo, 1, this.$conf.faceScore, 0);
          this.text += '开始人脸识别...';
          this.text += this.lineBreak;
        }catch (e){
          this.text += '开始人脸识别失败 ' + JSON.stringify(e.message);
          this.text += this.lineBreak;
        }
      },
      async closeFace(){
        try{
          await this.api.stop_facematch_video();
          this.text += '关闭人脸识别成功';
          this.text += this.lineBreak;
        }catch (e){
          this.text += '关闭人脸识别失败 ' + JSON.stringify(e.message);
          this.text += this.lineBreak;
        }
      },
      //打开取药舱门
      async openDoor(){
        this.$set(this.btnDisabled, 'openDoor', true);
        try{
          let res = await this.api.openDoor();
          this.text += '打开取药舱舱门指令发送成功';
          this.text += this.lineBreak;
          this.$set(this.btnDisabled, 'openDoor', false);
        }
        catch (e) {
          this.$set(this.btnDisabled, 'openDoor', false);
          this.text += '打开取药舱舱门指令发送失败 ' + JSON.stringify(e.message);
          this.text += this.lineBreak;
          this.log.info('openDoor error ', e);
        }
      },
      //关闭取药舱门
      async closeDoor(){
        this.$set(this.btnDisabled, 'closeDoor', true);
        try{
          let res = await this.api.closeDoor();
          this.text += res ? '关闭取药舱舱门指令发送成功' : '关闭取药舱舱门指令发送失败';
          this.text += this.lineBreak;
          this.$set(this.btnDisabled, 'closeDoor', false);
        }
        catch (e) {
          this.$set(this.btnDisabled, 'closeDoor', false);
          this.text += '关闭取药舱舱门指令发送失败 ' + JSON.stringify(e.message);
          this.text += this.lineBreak;
        }
      },
      //打开回收舱门
      async openFlap(){
        this.$set(this.btnDisabled, 'openFlap', true);
        try{
          await this.api.operate_vendor(6,1);
          this.text += '打开回收舱挡板指令发送成功';
          this.text += this.lineBreak;
          this.$set(this.btnDisabled, 'openFlap', false);
        }
        catch (e) {
          this.$set(this.btnDisabled, 'openFlap', false);
          this.text += '打开回收舱挡板失败 ' + JSON.stringify(e.message);
          this.text += this.lineBreak;
        }
      },
      async scanqrcode(){
        try{
          if(this.status.scaning) return ;
          if(this.qrcodeTimer) clearTimeout(this.qrcodeTimer);
          await this.api.scanqrcode();
          this.$set(this.status, 'scaning', true);
          this.text += '开始扫码二维码...';
          this.text += this.lineBreak;
          this.qrcodeTimer = setTimeout(()=>{
            this.stop_scan_qrcode();
          },20000);
        }
        catch (e) {
          this.text +=  '扫码二维码失败 ' + JSON.stringify(e.message);
          this.text += this.lineBreak;
        }
      },
      async stop_scan_qrcode(){
        try{
          await this.api.stop_scan_qrcode();
          this.$set(this.status, 'scaning', false);
        }
        catch (e) {
          this.text += JSON.stringify(e.message);
          this.text += this.lineBreak;
        }
      },
      async read_idcard(){
        try{
          if(this.status.scaning) return ;
          if(this.qrcodeTimer) clearTimeout(this.qrcodeTimer);
          await this.api.read_idcard();
          this.$set(this.status, 'reading', true);
          this.text += '开始读取身份证...';
          this.text += this.lineBreak;
          this.idcardTimer = setTimeout(()=>{
            this.stop_read_idcard();
          },20000);
        }
        catch (e) {
          this.text += '读取身份证失败 ' + JSON.stringify(e.message);
          this.text += this.lineBreak;
        }
      },
      async stop_read_idcard(){
        try{
          await this.api.stop_read_idcard();
          this.$set(this.status, 'reading', false);
        }
        catch (e) {
          this.text += JSON.stringify(e.message);
          this.text += this.lineBreak;
        }
      },
      async print(){
        let info = {
          ticket_title: this.$conf.ticketTitle || '未来健康智慧药房',
          take_num:"234567",
          total_product_count:3,
          total_amount:6,
          addr:"www",
          phone:"18151110866",
          wchat_qr_code:"",
          product_info_list:[
            {
              name:"联苯咔唑凝胶",
              specification:"100g*20粒",
              manufacturer:"北京华邦制药有限公司",
              product_count:3,
              price:2,
              amount:6,
              batch_number:"20190501919",
              expiration_date:"20100705",
              approval_number:"wwww"
            },
            {
              name:"联苯咔唑凝胶",
              specification:"100g*20粒",
              manufacturer:"重庆华邦制药有限公司",
              product_count:3,
              price:2,
              amount:6,
              batch_number:"20190501919",
              expiration_date:"20100705",
              approval_number:"wwww"
            }
          ]
        };
        // let info = {
        //   "ticket_title": "郑州市第七人民医院",
        //   "phone": "13800138000",
        //   "isSuccess": true,
        //   "prescList": [{
        //     "CardNo": "410323199003239550",
        //     "PatId": "2021706",
        //     "PatNo": "0002021639",
        //     "PatName": "侯毅",
        //     "PatSex": "男",
        //     "PatAge": "30岁",
        //     "DiagnoDesc": "1.发热",
        //     "RecDispLoc": "FRMZYF-发热门诊药房",
        //     "PrescNo": "O20120103868",
        //     "AdmDate": "2020-12-01",
        //     "PrescMoney": "30.15",
        //     "WinDesc": "窗口一",
        //     "PrtInv": null,
        //     "Adm": "3323228",
        //     "Prt": "5894190",
        //     "allFlag": 2,
        //     "drugArr": [{
        //       "DrugCode": "869793040000400000",
        //       "DrugName": "金莲清热泡腾片[4g×12片]",
        //       "Qty": "1",
        //       "num": 1,
        //       "Unit": "盒(12)",
        //       "Dosage": "2片",
        //       "Common": "冲服",
        //       "Freq": "Tid",
        //       "Phdur": "1天",
        //       "Price": "30.15",
        //       "Manuactory": "天津中盛海天",
        //       "Specification": "4g×12片",
        //       "OrdRowID": "3220161||3",
        //       "BarCode": "6951784400040",
        //       "enough": true
        //     }]
        //   }]
        // };
        this.$set(this.btnDisabled, 'print', true);
        try{
          await this.api.print_ticket(info);
          this.text += '打印成功';
          this.text += this.lineBreak;
          this.$set(this.btnDisabled, 'print', false);
        }
        catch (e){
          this.$set(this.btnDisabled, 'print', false);
          this.text += '打印失败 ' + JSON.stringify(e.message);
          this.text += this.lineBreak;
          this.log.error("打印失败：",e);
        }
      },
      //盘点
      async measure(){
        if(this.row === 'all' || this.col === 'all'){
          this.text += '请先选择药道';
          this.text += this.lineBreak;
          return ;
        }
        this.$set(this.btnDisabled, 'measure', true);
        let slot_no = this.col + (this.row-1)*this.channel.aisleX;
        try{
          await this.api.measure_channel([slot_no]);
          this.text += '盘点指令发送成功';
          this.text += this.lineBreak;
        }catch (e) {
          this.$set(this.btnDisabled, 'measure', false);
          this.text += JSON.stringify(e);
          this.text += this.lineBreak;
        }
      },
      //取药
      async pickup(){
        if(this.product.row === 'all' || this.product.col === 'all'){
          this.text += '请先选择药道';
          this.text += this.lineBreak;
          return ;
        }
        if(!this.product.count){
          this.text += '请至少选择一个药品数量';
          this.text += this.lineBreak;
          return ; 
        }
        this.$set(this.btnDisabled, 'pickup', true);
        let data = {
          op_account_id: this.op_account_id,
          x: this.product.col,
          y: this.product.row,
          count: this.product.count,
          check: this.product.check
        };
        try{
          let ret = await this.api.pick_up_product_v2(data);
          this.text += ret ? '取药指令发送成功' : '取药指令发送失败';
          this.text += this.lineBreak;
        }catch (e) {
          this.$set(this.btnDisabled, 'pickup', false);
          this.text += JSON.stringify(e);
          this.text += this.lineBreak;
        }
      },
      async getList(){
        try{
          //获取设备信息
          let info = await this.api.get_equipment_info();
          if(info.equipment_info){
            //存储设备信息
            this.$store.dispatch("addEquipmentInfo",info.equipment_info);
          }
        }catch(e){}
        try {
          let drug_channel = this.$store.state.equipmentInfo.drug_channel;
          this.channel = {
            aisleX:drug_channel.aisleX,
            aisleY:drug_channel.aisleY
          };

        }
        catch (e){
          this.log.error('初始化药道信息失败',e);
        }
      },
      generRowCol(){
        let rows = [
          {
            value:'all',
            label:'全部'
          }
        ];
        for(let i=0;i<this.channel.aisleY;i++){
          rows.push({
            value: i+1,
            label: i+1
          });
        }
        let cols =  [
          {
            value:'all',
            label:'全部'
          }
        ];
        for(let i=0;i<this.channel.aisleX;i++){
          cols.push({
            value: i+1,
            label: i+1
          });
        }
        this.$set(this,'rows',rows);
        this.$set(this,'cols',cols);
      },
      //开启关闭功能
      async switchFunction(operate, level, code, label){
        try{
          this.$set(this.btnDisabled.switchFunction, `btn_${operate}_${code}`, true);
          let data = { "err_level": level, "err_code": code, "err_operate": operate }
          await this.api.close_equipment_function(data);
          this.text += `${'0' == operate  ? '开启' : '关闭'}${label}成功`;
          this.text += this.lineBreak;
          this.$set(this.btnDisabled.switchFunction, `btn_${operate}_${code}`, false);
        }catch (e){
          this.text += `${'0' == operate ? '开启' : '关闭'}${label}失败`;
          this.text += ' ' + JSON.stringify(e.message);
          this.text += this.lineBreak;
          this.$set(this.btnDisabled.switchFunction, `btn_${operate}_${code}`, false);
        }
      },
    },
    computed:{
    },
    watch:{
      text(val){
        this.$nextTick(() => {
          var container = this.$el.querySelector("#message");
          container.scrollTop = container.scrollHeight;
        });
      }
    },

    async destroyed(){
      if(this.status.scaning) this.stop_scan_qrcode();
      if(this.status.reading) this.stop_read_idcard();
      //清空通知
      this.api.on_notify_qrcode = null;
      this.api.on_notify_read_idcard = null;
      this.api.on_notify_measure_channel = null;
      this.api.on_notify_qrcode = null;
      this.api.on_notify_operate_vendor = null;
      this.api.on_notify_pick_up_product = null;
      this.api.on_notify_self_check = null;
    }
  }
</script>

<style scoped>
  .debug {
    height: 100vh;
    font-family: PingFangSC-Medium, PingFang SC;
    background: rgba(255,255,255,0.49) url('../../assets/images/bg.png') no-repeat fixed;
    background-position-y: bottom ;
    background-size: contain;
  }
  .box01{
    display: flex;
    height: calc(100% - 1.2rem);
  }
  .left{
    width: 55%;
    padding: .4rem;
    height: calc(100% - 0.8rem);
    background-color: #FFFFFF;
    overflow-y: auto;
  }
  .right{
    background:#000;
    width: 45%;
    padding: .05rem;
    font-size: .24rem;
    font-weight: 400;
    color: #FFFFFF;
    line-height: .33rem;
    white-space:normal;
    word-break:break-all;
    word-wrap:break-word;
    overflow-y: auto;
  }
  .el-custom /deep/ .el-input__icon{
    line-height: .48rem;
  }
  .el-custom /deep/ .el-input__inner{
    height: .48rem;
    line-height: .48rem;
  }
  .el-custom /deep/ .el-checkbox__inner{
    height: .28rem;
    width: .28rem;
    border-color: #979797;
  }
  .el-custom /deep/ .el-checkbox__inner::after{
    top: .05rem;
    left: .1rem;
    width: 4px;
  }
  .box01-com{
    padding: .1rem;
    border-bottom: .02rem solid #DCDCDC ;
    display: flex;
  }
  .box01-com-left{
    width: 1.8rem;
    min-width: 1.8rem;
    line-height: .48rem;
    font-size: .22rem;
    font-weight: 600;
    color: #666666;
  }
  .box01-com-right{
    flex-grow: 1;
    display: flex;
    flex-wrap: wrap;
  }
  .btn{
    width: 2rem;
    height: .48rem;
    background: #41bbff;
    border-radius: .06rem;
    line-height: .48rem;
    text-align: center;
    font-size: .22rem;
    font-weight: 500;
    color: #FFFFFF;
    margin-right: .2rem;
    border: none;
    font-family: PingFangSC-Medium, PingFang SC;
  }
  .btn:disabled{
    background: rgba(151, 151, 151, .6);
  }
  .box01-font2{
    font-size: .20rem;
    font-weight: 600;
    color: #666666;
    margin-left: .1rem;
  }
</style>
