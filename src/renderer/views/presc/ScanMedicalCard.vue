<template>
  <div class="container">
    <div class="header">
      <top-nav :title-text="title" :remaining="180" :show-left-button="true"></top-nav>
    </div>
    <div class="content">
      <div class="read-content">
        <div class="msg" v-show="noPresc"><div class="text">您当前没有待取药品</div></div>
        <div class="legend">
          <img :src="image" style="height:100%;width:100%;display:block;" />
        </div> 
        <div class="tips">
          <div>请将<span style="color:rgb(74, 144, 226);">医保卡</span>插入医保卡读取区域</div>
        </div> 
      </div>
    </div>
    <div class="position1"></div>  
  </div>
</template>

<script>
import { audioPlay } from "@/js/util";
import API from '@/api/cloud';
const fs = require('fs');

export default {
  name: "scanQrcode",
  data(){
    return {
      code: '',
      title: '医保卡取药',
      image: require('../../assets/images/read_medical.png'),
      audio: '/请将医保卡插入医保卡读取区域.mp3',
      mod: 'medical',
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
    inputNum(num){
      this.code+=num.toString();
    },
    //页面初始化
    init(){
      let self = this;
      self.startReadMedical().then(() => {
        if(self.reading) self.readMedical();
      });
    },
    //离开页面调用
    async destruct(){
      let self = this;
      if(self.timer) clearTimeout(this.timer);
      if(self.reading) await self.stopReadMedical(); 
    },
    //读医保卡
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
      /*
      let cardType = {idcard: 'id_card', medical: 'medicare_card', electronic: 'health_card'};
	    let list = await API.getOrderPresc({ equipment_id, card_no: data, card_type: cardType[this.mod]});
      this.log.info('get order presc list = ', JSON.stringify(list));
      if(this.unload) return;
      if(!Array.isArray(list.order_presc_info) || !list.order_presc_info.length){
        audioPlay(__static + '/很抱歉您当前没有可取的药品.mp3');
        return;  
      }*/
			let testData = [];
			try{
				testData = fs.readFileSync("D:/xy/node/static/presc.json", "utf8");
				testData = JSON.parse(testData);
			}catch(e){
				this.log.info('fs get presc err ', JSON.stringify(e.message));
				testData = []
			}
			if(!Array.isArray(testData) || !testData.length){
				this.$toast('您当前没有待取药品!', { position: 'top' });
				return;  
			}
      this.$router.push({name:'prescList', params:{ list: testData, code: data }});
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
  },
  async mounted(){
    let self = this;
    audioPlay(__static + self.audio);
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
  background: rgba(255,255,255,0.49) url('../../assets/images/bg.png') no-repeat fixed;
  background-position-y: bottom ;
  background-size: contain;
  //background: none;
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
    background-image: url('../../assets/images/poi_01.png');
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