<template>
  <div class="container">
    <div class="header">
      <top-nav :title-text="constData[mod].title" :remaining="180" :show-left-button="true"></top-nav>
    </div>
    <div class="content">
      <div class="read-content">
        <div class="msg" v-show="noPresc"><div class="text">您当前没有待取药品</div></div>
        <div class="legend">
          <img :src="constData[mod].image" style="height:100%;width:100%;display:block;" />
        </div> 
        <div class="tips">
          <div v-if="mod == 'idcard'">请将二代<span style="color:rgb(74, 144, 226);">身份证</span>放置在“身份证读取”区域进行识别</div>  
          <div v-else-if="mod == 'medical'">请将<span style="color:rgb(74, 144, 226);">医保卡</span>插入医保卡读取区域</div>  
          <div v-else-if="mod == 'electronic'">请打开电子医保卡，将<span style="color:rgb(74, 144, 226);">电子医保卡</span>二维码对准扫描区域</div>  
        </div> 
      </div>
    </div>
    <div class="position1"></div>  
  </div>
</template>

<script>
import { audioPlay } from "../js/util";
import API from '@/api/cloud';


export default {
  name: "scan",
  data(){
    return {
      constData: {
        idcard: {
          title: '身份证取药',
          image: require('../assets/images/read_idcard.png'),
          audio: '/请将身份证放置在扫描区域内.mp3',
        }, 
        medical: {
          title: '医保卡取药',
          image: require('../assets/images/read_medical.png'),
          audio: '/请将医保卡插入医保卡读取区域.mp3',
        }, 
        electronic: {
          title: '电子医保卡取药',
          image: require('../assets/images/read_electronic.png'),
          audio: '/请打开电子医保卡将电子医保卡二维码对准扫描区域.mp3',
        }
      },
      mod: 'idcard',
      reading: false, //读身份证|二维码标识 
      unload: false,  //页面销毁标识 
      timer: null,    //读取医保卡timer
      interval: 500,  //读医保卡时间间隔
      noPresc: false, //是否显示没有待取药品信息
    }
  },
  computed:{
    
  },
  methods: {
    //页面初始化
    init(){
      let self = this;
      if('idcard' == self.mod){
        //监听身份证读卡器通知
        self.api.on_notify_read_idcard = async body => {
          self.log.info('rev notify_read_idcard ', body);
          if(body && body.status == 0){
            //停止读身份证
            await self.stopReadIdcard();
            //成功
            self.scanSuccess(body.idcardinfo.idcardno);
          }
        }; 
        //开始读取身份证
        self.startReadIdcard(); 
      }else if('medical' == self.mod){
        self.startReadMedical().then(() => {
          if(self.reading) self.readMedical();
        });
      }else if('electronic' == self.mod){
        //监听二维码扫描仪通知
        self.api.on_notify_qrcode = async body => {
          self.log.info('rev notify_qrcode ', body);
          if(body && body.status == 0){
            //停止扫描二维码
            await self.stopReadElectronic();
            //成功
            self.scanSuccess(body.qrcodeinfo.str);
          }   
        };
        //开始扫描二维码
        self.startReadElectronic();
      }
    },
    //离开页面调用
    async destruct(){
      let self = this;
      if('idcard' == self.mod){
        self.api.on_notify_read_idcard = null;
        if(self.reading) await self.stopReadIdcard(); 
      }else if('medical' == self.mod){
        if(self.timer) clearTimeout(this.timer);
        if(self.reading) await self.stopReadMedical(); 
      }else if('electronic' == self.mod){
        self.api.on_notify_qrcode = null;
        if(self.reading) await self.stopReadElectronic();
      }
    },
    //开始读取身份证
    async startReadIdcard(){
      try{
        await this.api.read_idcard();
        this.reading = true;
      }catch(e){
        this.log.error('read idcard failed! e = %s', e);
      }
    },
    //停止读取身份证
    async stopReadIdcard(){
      try{
        await this.api.stop_read_idcard();
        this.reading = false;
      }catch (e){
        this.log.error('stop read idcard failed!e=',e);
      }
    },
    //开始读医保卡
    async readMedical(){
      let self = this;
      try{
        let data = await self.api.readCardNo(1);
        self.log.info('read card no success, data = %s', data)
        await self.stopReadMedical();
        self.scanSuccess(data.card_no);
      }catch(e){
        self.log.error('read card no err, %s', e);
        if(!self.unload){
          self.timer = setTimeout(async () => {
            await self.readMedical();
          }, self.interval);
        }
      }
    },
    //开始读电子医保卡(二维码)
    async startReadElectronic(){
      try{
        await this.api.scanqrcode();
        this.reading = true;
      }catch(e){
        this.log.error('start read electronic failed! e = %s', e);
      }
    },
    //停止读电子医保卡(二维码)
    async stopReadElectronic(){
      try{
        await this.api.stop_scan_qrcode();
        this.reading = false;
      }catch (e){
        this.log.error('stop read electronic failed!e=',e);
      }
    },
    //读取数据成功
    async scanSuccess(data){
      this.log.info('read card data = %s', data);
      let equipment_id = '';
      try{
        let equipmentInfo = this.$store.state.equipmentInfo;
        if(equipmentInfo && equipmentInfo.id) {
          equipment_id = equipmentInfo.id
        }else{
          let info = await this.api.get_equipment_info();
          if(info.equipment_info){
            this.$store.dispatch("addEquipmentInfo", info.equipment_info);
            if(info.equipmentInfo.id) equipment_id = info.equipmentInfo.id
          }
        }
      }catch(e){
        this.log.info('get_equipment_info error', e.message);
      }
      //发送请求获取处方信息
      let cardType = {idcard: 'id_card', medical: 'medicare_card', electronic: 'health_card'};
	    let list = await API.getOrderPresc({ equipment_id, card_no: data, card_type: cardType[this.mod]});
      this.log.info('get order presc list = ', JSON.stringify(list));
      if(this.unload) return;
      if(!Array.isArray(list.order_presc_info) || !list.order_presc_info.length){
        audioPlay(__static + '/很抱歉您当前没有可取的药品.mp3');
        return;  
      }
      this.$router.push({name:'prescList', params:{ prescList: list.order_presc_info }});
    },
    //开始读医保卡
    async startReadMedical(){
      try{
        await this.api.start_read_card_no();
        this.reading = true;
      }catch (e){
        this.log.error('start read medical failed!e=',e);
      }
    },
    //停止读医保卡
    async stopReadMedical(){
      try{
        await this.api.stop_read_card_no();
        this.reading = false;
      }catch (e){
        this.log.error('stop read medical failed!e=',e);
      }
    },
  },
  created(){
    let self = this;
    self.mod = (self.$route.params && self.$route.params.type && self.constData.hasOwnProperty(self.$route.params.type)) ? self.$route.params.type : 'idcard';
  },
  async mounted(){
    let self = this;
    audioPlay(__static + self.constData[self.mod].audio);
    self.init();
  },
  beforeDestroy(){
    this.unload = true;
    this.destruct();
  }
}
</script>

<style lang="scss" scoped>
.container{
  display: flex;
  flex-direction: column;
  position: relative;
  background: rgba(255,255,255,0.49) url('../assets/images/bg.png') no-repeat fixed;
  background-position-y: bottom ;
  background-size: cover;
  height: 100vh;
  .header{
    height: auto;
    flex-shrink: 0;
  }
  .position1{
    position: absolute;
    left: 1.61rem;
    top: .97rem;
    width: 3.58rem;
    height: 3.58rem;
    background-image: url('../assets/images/poi_01.png');
    background-size: contain;
  }
  .content{
    margin-top: .2rem;
    display: flex;
    justify-content: center;
    .read-content{
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      width: 10.4rem;
      height: 9.2rem;
      background: #FFFFFF;
      border-radius: .08rem;
      opacity: 0.99;
      .msg{
        position: absolute;
        left: 0;
        right: 0;
        top: .4rem;
        text-align: center;
        height: .6rem;
        display: flex;
        justify-content: center;
        .text{
          padding: 0 0.45rem;
          background: rgba(0, 0, 0, 0.4);
          border-radius: .08rem;
          line-height: .6rem;
          font-size: .2rem;
          font-family: PingFang-SC-Bold, PingFang-SC;
          font-weight: bold;
          color: #FFFFFF;
        }
      }
      .tips{
        font-size: .32rem;
        font-family: PingFang-SC-Bold, PingFang-SC;
        font-weight: bold;
        color: #999999;
        line-height: .45rem;
        flex-shrink: 0;
        margin-bottom: .6rem;
      }
      .legend{
        margin-top: 1.37rem;
        width: 8.31rem;
        height: 6.13rem;
        flex-shrink: 0;
      }
    }
  }
}
</style>