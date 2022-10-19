<template>
  <div class="container">
    <top-nav @right-button="clickRightButton" :title-text="pageName" :show-left-button="true" :show-right-button="false" :clearRemain="true"></top-nav>
    <div class="search">
      <div class="input-div">
        <div class="btn" @click.stop="startScan"></div>
        <input class="input" ref="keyboard" @focus="onFocus" v-model="inputTxt" placeholder="请扫码或输入补货单号" type="text"/>
      </div>
      <div class="actions">
        <div class="btn-auto" @click.stop="generateOrderNo">自动生成补货单号</div>
        <div class="btn-next" :class="{'can-submit': !btnDisabled.doSubmit}" @click.stop="doSubmit">确定</div>
      </div>
    </div>
    <div class="process">
      <div class="step-unit">
        <img class="image" src="../../assets/images/step.png" />
        <div class="step">1</div>
        <div class="text">扫码或输入补货单号</div>
      </div>
      <div class="step-icon">
        <img class="image" src="../../assets/images/process.png" />
      </div>
      <div class="step-unit">
        <img class="image" src="../../assets/images/step.png" />
        <div class="step">2</div>
        <div class="text">点击开始补货</div>
      </div>
      <div class="step-icon">
        <img class="image" src="../../assets/images/process.png" />
      </div>
      <div class="step-unit">
        <img class="image" src="../../assets/images/step.png" />
        <div class="step">3</div>
        <div class="text">进行补货操作</div>
      </div>
      <div class="step-icon">
        <img class="image" src="../../assets/images/process.png" />
      </div>
      <div class="step-unit">
        <img class="image" src="../../assets/images/step.png" />
        <div class="step">4</div>
        <div class="text">核对药品数量，提交补货单</div>
      </div>
    </div>
    <full-Keyboard :option="keyboardOption" @key-value="getInputValue" @close="closeFullKeyboard"></full-Keyboard>
    <app-mask :is-visible="appMaskVisible">
      <replenish-detail :is-visible.sync="appMaskVisible" :origin-data="originData" @confirm-resolve="nextStep"></replenish-detail>
    </app-mask>
  </div>
</template>

<script>
import FullKeyboard from '@/components/FullKeyboard.vue';
import AppMask from '@/components/AppMask.vue';
import uuid from 'uuid';
import ReplenishDetail from '@/components/ReplenishDetail.vue';
import moment from 'moment';

export default {
  name: 'ReplenishmentProcess',
  data(){
    return {
      pageName: "补货流程",
      inputTxt: '',
      keyboardOption: {
        show: false,
        sourceDom: ''
      },
      appMaskVisible: false,
      //按钮相关
      btnDisabled:{ doSubmit:true },
      //已有的补货数据
      originData: [],
    }
  },
  components: { FullKeyboard, AppMask, ReplenishDetail },
  computed:{
  },
  methods:{
    //关闭全键盘
    closeFullKeyboard(){
      this.$set(this.keyboardOption, 'show', false);  
    },
    clickRightButton(){
      this.$router.push({name: 'admin'});
    },
    getInputValue(val) {
      let doc = this.$refs['keyboard'];
      doc.focus();
      var startPos = doc.selectionStart;
      var endPos = doc.selectionEnd;
      let txt = this.inputTxt;
      if(val === 'delete'){
        if(startPos != endPos){
          this.inputTxt = txt.substring(0, startPos) + txt.substring(endPos);
        }else{
          this.inputTxt = txt.substring(0, startPos - 1) + txt.substring(endPos); 
        }
      }else{
        this.inputTxt = txt.substring(0, startPos) + val + txt.substring(endPos)
      }
      this.$set(this.btnDisabled, 'doSubmit', !!!this.inputTxt);
    },
    onFocus() {
      this.$set(this.keyboardOption, 'show', true);
      this.$set(this.keyboardOption, 'sourceDom', this.$refs['keyboard']);
    },
    //自动生成补货单号
    generateOrderNo(){
      this.inputTxt = uuid.v4().replace(/-/g, '');
      this.$set(this.btnDisabled, 'doSubmit', !!!this.inputTxt);
    },
    async doSubmit(){
      let self = this;
      try{
        if(self.btnDisabled.doSubmit) return;
        self.$set(self.btnDisabled, 'doSubmit', true);
        let data = await self.api.get_replenish_order(self.inputTxt);
        self.log.debug('recv get_replenish_order data=%s, replenish_no=%s', JSON.stringify(data), self.inputTxt);
        if(data && data.equipment_replenish_info && Array.isArray(data.equipment_replenish_info.replenish_detial_info_list) && data.equipment_replenish_info.replenish_detial_info_list.length){
          let op_time = data.equipment_replenish_info.op_time * 1000;
          if(moment(op_time).format('YYYY-MM-DD') !== moment().format('YYYY-MM-DD')){
            self.$toast('补货单号操作间隔超过一天, 请联系管理员!');
            return;
          }
          self.originData = data.equipment_replenish_info.replenish_detial_info_list.map(item => {
            let obj = self.$store.state.equipmentInfo.equipment_product_info.slot_product_list_info.find(it => {
              return it.merchant_product_info.merchant_product_id == item.merchant_product_id;
            });
            if(obj) return {...item, name: obj.merchant_product_info.product_info.name, home_thumb: obj.merchant_product_info.product_info.home_thumb}
            return item;
          });
          self.appMaskVisible = true;
        }else{
          self.$router.push({name: 'measure', query: {no: self.inputTxt}});
        }
        self.$set(self.btnDisabled, 'doSubmit', false);
      }catch(e){
        self.$set(self.btnDisabled, 'doSubmit', false);
        self.log.error('replenishment doSubmit error, ', e);
      }
    },
    //下一步
    nextStep(){
      this.$router.push({name: 'measure', query: {no: this.inputTxt}});
    },
    //开始扫二维码
    async startScan(){
      try{
        await this.api.scanqrcode();
      } catch (e) {
        this.log.error('replenishment page scanqrcode fail, e=%s', e.message);
      }
    },
    async stopScan(){
      try{
        await this.api.stop_scan_qrcode();
      }catch (e) {
        this.log.error('replenishment page stop_scan_qrcode fail, e=%s', e.message);
      }
    }
  },
  async created(){
    let self = this;
    try{
      self.inputTxt = self.$route.query.no || '';
      self.$set(self.btnDisabled, 'doSubmit', !!!self.inputTxt);
      self.log.debug('replenishment page query no = %s, btn = %s', self.inputTxt, JSON.stringify(self.btnDisabled));
      if(!self.$store.state.equipmentInfo || !self.$store.state.equipmentInfo.equipment_product_info){
        let info = await this.api.get_equipment_info();
        if(info.equipment_info){
          self.$store.commit("addEquipmentInfo", info.equipment_info);
        } 
      }
    }catch(e){
      self.log.error('replenishment page created error, %s', e.message);
    }
  },
  mounted(){
    this.api.on_notify_qrcode = body => {
      if(body.status == 0 && body.qrcodeinfo && body.qrcodeinfo.str){
        this.inputTxt = body.qrcodeinfo.str;
        this.$set(this.btnDisabled, 'doSubmit', !!!this.inputTxt);
        this.stopScan();
      }
    }
  },
  beforeDestroy(){
    this.api.on_notify_qrcode = null;
    this.stopScan();
  },
}
</script>

<style lang="scss" scoped>
.container{
  background: rgba(255,255,255,0.49) url('../../assets/images/bg.png') no-repeat fixed;
  background-position-y: bottom ;
  background-size: contain;
  height: 100vh;
  .search{
    display: flex;
    justify-content: space-between;
    height: .6rem;
    padding: .3rem .4rem;
    .input-div{
      position: relative;
      display: flex;
      align-items: center;
      border-radius: .3rem;
      border: 2px solid #4A90E2;
      height: .6rem;
      .input{
        font-size: .24rem;
        font-family: PingFang-SC-Medium, PingFang-SC;
        font-weight: 500;
        color: #333333;
        line-height: .33rem;
        width: 5.6rem;
        height: .33rem;
        background: rgba(255,255,255,0.1);
        background-color: transparent;
        box-sizing: border-box;
        border: none;
        margin-right: .3rem;
      }
      .input::-webkit-input-placeholder{
        background-color: rgba(255,255,255,0.1);
        color: rgba(#333333, 0.8);
      } 
      .btn{
        width: .62rem;
        height: .6rem;
        flex-shrink: 0;
        background: url('../../assets/images/scan_code.png') center center no-repeat;
        background-size: .28rem .28rem;
      }
    }
    .actions{
      font-size: .24rem;
      font-family: PingFangSC-Semibold, PingFang SC;
      font-weight: 600;
      color: #FFFFFF;
      line-height: .33rem;
      display: flex;
      align-items: center;
      .btn-auto{
        width: 3.6rem;
        height: .6rem;
        background: #72B935;
        border-radius: .3rem;
        text-align: center;
        line-height: .6rem;
      }
      .btn-next{
        width: 1.8rem;
        height: .6rem;
        background: #CCCCCC;
        border-radius: .3rem;
        text-align: center;
        line-height: .6rem;
        margin-left: .4rem;
      }
      .can-submit{
        background: #4A90E2;
      }
    }
  }
  .process{
    margin: .9rem 1rem 0 1rem;
    display: flex;
    justify-content: space-around;
    .step-unit {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 1.6rem; 
      flex-grow: 1;
      font-size: .32rem;
      font-family: PingFang-SC-Medium, PingFang-SC;
      font-weight: 500;
      color: #333333;
      line-height: .45rem;
      position: relative;
      .image{
        width: 1.6rem;
        height: 1.6rem;
      }
      .text{
        margin-top: .4rem;
      }
      .step{
        font-size: .6rem;
        font-family: PingFang-SC-Medium, PingFang-SC;
        font-weight: 500;
        color: #FFFFFF;
        width: 1.6rem;
        height: 1.6rem;
        position: absolute;
        left: 50%;
        top: 0;
        margin-left: -.8rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    .step-icon {
      width: .42rem; 
      height: .36rem;
      flex-shrink: 0; 
      display: flex;
      padding-top: .62rem;
      .image{
        width: .42rem; 
        height: .36rem;
      }
    }
  }
}
</style>