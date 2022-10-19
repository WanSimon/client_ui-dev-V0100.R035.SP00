<template>
  <div class="container">
    <div class="header">
      <top-nav :title-text="title" :remaining="180" :show-left-button="true"></top-nav>
    </div>
    <div class="content">
      <div class="left-item">
        <div class="title">刷卡识别</div>
        <div class="image"><img :src="image" class="img" /></div>
        <div class="desc">请将二代<span style="color:rgb(74, 144, 226);">身份证</span>放置在“身份证读取”区域进行识别, 或手动输入身份证号</div>
      </div>
      <div class="right-item">
        <div class="title">手动输入</div>
        <div class="code">
          <div class="input">{{code}}</div>
        </div>
        <div class="calc">
          <div class="d-k__content">
            <div class="d-k-item" @click="inputNum(1)">1</div> 
            <div class="d-k-item" @click="inputNum(2)">2</div> 
            <div class="d-k-item" @click="inputNum(3)">3</div> 
            <div class="d-k-item" @click="inputNum(4)">4</div> 
            <div class="d-k-item" @click="inputNum(5)">5</div> 
            <div class="d-k-item" @click="inputNum(6)">6</div> 
            <div class="d-k-item" @click="inputNum(7)">7</div> 
            <div class="d-k-item" @click="inputNum(8)">8</div> 
            <div class="d-k-item" @click="inputNum(9)">9</div> 
            <div class="d-k-item" @click="inputNum('X')">X</div>
            <div class="d-k-item" @click="inputNum(0)">0</div> 
            <div class="d-k-item d-k-item-btn" @click="del"><img src="@/assets/del.png" /></div>
          </div>
          <div class="btn" :class="[code.length==0 ? '' : 'btn2']" @click="doSubmit">确认取药</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { audioPlay, debounce } from "@/js/util";
import API from '@/api/cloud';
const fs = require('fs');

export default {
  name: "scanIdcard",
  data(){
    return {
      code: '',
      title: '身份证取药',
      image: require('../../assets/images/read_idcard.png'),
      audio: '/请将身份证放置在扫描区域内.mp3',
      mod: 'idcard',
      reading: false, //读身份证|二维码标识 
      unload: false,  //页面销毁标识 
      timer: null,    //读取医保卡timer
      interval: 500,  //读医保卡时间间隔
      noPresc: true, //是否显示没有待取药品信息
    }
  },
  computed:{
    
  },
  methods: {
    del(){
      if(this.code.length>0){
        this.code = this.code.slice(0,this.code.length-1);
      }
    },
    inputNum(num){
      this.code += String(num);
    },
    doSubmit:debounce(function() {
      if(!this.code.length) return;
      this.log.info('customer input card_no, data = %s', this.code);
      this.scanSuccess(this.code);
    }),
    //页面初始化
    init(){
      let self = this;
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
    },
    //离开页面调用
    async destruct(){
      let self = this;
      self.api.on_notify_read_idcard = null;
      if(self.reading) await self.stopReadIdcard(); 
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
    //读取数据成功
    async scanSuccess(data){
      this.log.info('read card data = %s', data);
      let equipment_id = '';
      let merchant_id = '';
      try{
        let equipmentInfo = this.$store.state.equipmentInfo;
        if(equipmentInfo && equipmentInfo.id) {
          equipment_id = equipmentInfo.id;
          if(equipmentInfo.equipment_group_info) merchant_id = equipmentInfo.equipment_group_info.merchant_id;
        }else{
          let info = await this.api.get_equipment_info();
          if(info.equipment_info){
            this.$store.dispatch("addEquipmentInfo", info.equipment_info);
            if(info.equipmentInfo.id) {
              equipment_id = info.equipmentInfo.id;
              if(info.equipment_info.equipment_group_info) merchant_id = info.equipment_info.equipment_group_info.merchant_id;
            }
          }
        }
      }catch(e){
        this.log.info('get_equipment_info error', e.message);
      }
      //发送请求获取处方信息
      /*
	    let list = await API.getPrescList({ card_no: data, equipment_id, merchant_id });
      this.log.info('get order presc list = ', JSON.stringify(list));
      if(this.unload) return;
      if(!Array.isArray(list) || !list.length){
        audioPlay(__static + '/很抱歉您当前没有可取的药品.mp3');
        this.$toast('您当前没有待取药品!', { position: 'top' });
        return;  
      }
      */
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
  },
  created(){
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
  .content{
    position: relative;
    padding: .6rem 1.77rem 0 1.77rem;
    display: flex;
    justify-content: space-between;
    .left-item{
      width:7.82rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background-color: #FFFFFF;
      border-radius: .08rem;
      opacity: 0.99;
      .image{
        display: flex;
        align-items: center;
        justify-content: center;
        .img{
          width: 5.28rem;
          height: 4.12rem;
        }
      }
      .desc{
        font-size: .32rem;
        font-family: PingFang-SC-Medium, PingFang-SC;
        font-weight: 500;
        color: #333333;
        line-height: .45rem;
        text-align: center;
        padding: 0 .37rem .2rem .37rem;
      }
    }
    .right-item{
      width: 6rem;
      background-color: #FFFFFF;
      margin-right: .39rem;
      border-radius: .08rem;
      .code{
        display: flex;
        justify-content: space-between;
        margin: .3rem 0;
        font-size: .52rem;
        font-family: PingFang-SC-Bold, PingFang-SC;
        font-weight: bold;
        color: #333333;
        .input{
          height: .9rem;
          background: #FFFFFF;
          border-radius: .08rem;
          border: .03rem solid #BEBEBE;
          text-align: center;
          line-height: .9rem;
          width: 100%;
          overflow: hidden;
          padding: 0 .1rem;
        }
        .c-item{
          width: .9rem;
          height: .9rem;
          background: #FFFFFF;
          border-radius: .08rem;
          border: .03rem solid #BEBEBE;
          text-align: center;
          line-height: .9rem;
        }
        .active{
          border: .03rem solid #3FBAFF;  
        }
      }
      .calc{
        background: #EAF9FF;
        border-radius: .05rem;
        padding-bottom: .1rem;
        .d-k__content{
          display: flex;
          flex-wrap: wrap;
          background-color: #EAF9FF;;
          padding: .05rem;
          .d-k-item{
            font-family: PingFang-SC-Medium, PingFang-SC;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: .48rem;
            font-weight: 500;
            height: .8rem;
            margin: .05rem;
            width: calc(calc(100% / 3) - .1rem);
            background-color: #FCFDFE;
            text-align: center;
            color: #3FBAFF;
          }
          .d-k-item:hover{
            background-color: #E7EFFD;
          }
          .d-k-item-btn{
            img{
              width: .43rem;
              height: .3rem;
            }
          }
          .d-k-item-btn2{
            font-size: .36rem;
            font-family: PingFang-SC-Medium, PingFang-SC;
            font-weight: 500;
            color: #3FBAFF;
          }
        }
        .btn{
          height: 1rem;
          background: #CECECE;
          border-radius: .05rem;
          font-size:.38rem;
          font-weight:500;
          text-align: center;
          line-height: 1rem;
          margin: 0 .1rem;
          color: #FFFFFF;
        }
        .btn2{
          background: linear-gradient(90deg,rgba(115,222,255,1) 0%,rgba(63,186,255,1) 100%);
        }
      }
    }
    .title{
      flex-shrink: 0;
      font-size: .48rem;
      font-family: PingFangSC-Semibold, PingFang SC;
      font-weight: 600;
      color: #333333;
      line-height: .67rem;
      text-align: center;
      padding-bottom: .3rem;
    }
  }
  .msg{
    position: absolute;
    left: 0;
    right: 0;
    top: .4rem;
    text-align: center;
    height: .6rem;
    display: flex;
    justify-content: center;
    z-index: 2;
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
}
</style>