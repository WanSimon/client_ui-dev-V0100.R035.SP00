<template>
  <div class="customerWaiting">
    <div class="progress-container">
      <div class="progress-content">
        <div class="progress-bar" :style="{width: percent}">
          <div class="progress-bar1"></div>  
          <div class="progress-bar2"></div> 
          <div class="progress-percent">
            <div class="progress-num">{{percent}}</div>
            <div class="progress-icon">
              <img class="image" src="../assets/images/pill.png" />
            </div>
          </div> 
        </div>
      </div>
      <div class="progress-text">正在为您取药，请耐心等候…</div>
      <div class="progress-tips" v-if="totalProduct > 0">已出药{{takenCount}}件 / 共{{totalProduct}}件</div>
    </div>
    
    <div class="mask" v-show="alertVisible">
      <div class="dv-alert">
        <div class="dv-alert-text" style="top:1.19rem">取药失败</div>
        <div class="box05"></div>
        <div class="box06">机器出现异常，请重新取药或联系客服</div>
        <div class="alert-cancel" >客服：{{phone}}</div>
        <div class="alert-confirm" @click="back()"><span v-if="!faultFlag">返回取药</span><span v-else>返回</span></div>
      </div>
    </div>
  </div>
</template>

<script>
  import API from '@/api/cloud';
  import {audioPlay} from "../js/util";
  import {mapGetters} from "vuex";
  import _ from 'lodash';
  export default {
    name: "customerWaiting",
    computed:{
      ...mapGetters(['phone','qr_code','addr'])
    },
    data(){
      return {
        pageName: "等待出药",
        music:null,
        alertVisible:false,
        percent: '0%', //取药百分比
        takenCount: 0,
        percentTimer: null,
        totalProduct: 0, //药品总数
        kind: 0, //药品种类
        nextPickUpList: [], //后续需要取药的订单数据
        list: [],
        all: [],
        backTimer: null,
        faultFlag: false,
        pickFlag: false
      }
    },
    props:[ 'equipmentFaultFlag' ],
    watch:{
      equipmentFaultFlag(n, v){
        this.log.info('presc wait:equipmentFaultFlag changed, n=%s, o=%s', n, v);
        this.faultFlag = true;
        let timer = setTimeout(() => {
          if(this.pickFlag){
            this.alertVisible = true;
            if(null !== this.backTimer) clearTimeout(this.backTimer);
            this.backTimer = setTimeout(()=>{
              if('/prescWait' == this.$route.path) this.$router.push({ name: 'CrashPage' });
            }, 30000);
          } else{
            if('/prescWait' == this.$route.path) this.$router.push({ name: 'CrashPage' });
          } 
        }, 5000);
        this.$once("hook:beforeDestroy", () => { clearTimeout(timer); });
      }
    },
    async mounted(){
      audioPlay(__static +'/正在为您取药中请稍等.mp3');
      setTimeout(()=>{
        this.music = audioPlay(__static +'/等待取药.mp3',"loop");
      },3000);
      this.list = this.$route.params.list||[];
      this.all = this.$route.params.all||[];
      this.totalProduct = this.$route.params.count;
      this.kind = this.$route.params.kind;
      this.nextPickUpList = this.list.slice(1);
      this.log.debug('nextPickUpList ', this.nextPickUpList);

      //20211210, 设备故障以后, 等待5秒接收取药失败通知, 如果没收到, 则转跳错误页面, 
      // this.$once('equipment-fault', () => {
      //   this.log.info('recv emit event equipment-fault');
      //   this.faultFlag = true;
      //   let timer = setTimeout(() => {
      //     if(this.pickFlag){
      //       this.alertVisible = true;
      //       if(null !== this.backTimer) clearTimeout(this.backTimer);
      //       this.backTimer = setTimeout(()=>{
      //         if('/prescWait' == this.$route.path) this.$router.push({ name: 'CrashPage' });
      //       }, 30000);
      //     } else{
      //       if('/prescWait' == this.$route.path) this.$router.push({ name: 'CrashPage' });
      //     } 
      //   }, 5000);
      //   this.$once("hook:beforeDestroy", () => { clearTimeout(timer); });
      // });
      
      //定义售货机出货通知
      this.api.on_notify_pick_up_product = async (msg)=>{
        if(msg && 2 == msg.status){
          this.ickFlag = false;
        }
        //出药成功，计算百分比
        if(msg && 2 == msg.status && this.totalProduct > 0 && msg.index >= 0){
          if(this.percentTimer) clearInterval(this.percentTimer);
          try{
            this.takenCount += parseInt(msg.count) || 0;
            let percent = Math.ceil((this.takenCount / this.totalProduct) * 100);
            percent = percent >= 100 ? 100 : percent;
            this.percentTimer = setInterval(() => {
              let o = parseInt(this.percent);
              if(o >= percent || o >= 100) clearInterval(this.percentTimer);  
              if(o < percent){
                let n = o + 1;
                n = n > 100 ? 100 : n;
                this.percent = `${n}%`;
              }
            }, 100);
          }catch(e){
            this.log.error('computed percent error', e);
          }
          if(msg.isfinished && this.takenCount == this.totalProduct){
            if(this.percentTimer) clearInterval(this.percentTimer);
            this.percent = '100%';
          }
        }
        //出货状态(0:出货失败;1:开始出货;2:出货成功)
        if(msg && msg.status == 0){
          //出货识别  锁住程序 todo
          this.log.error("出货失败！");
          this.pickFlag = true;
          audioPlay(__static +'/取药失败请重新取药或联系客服.mp3');
          this.print(false);
          if(this.faultFlag) return;
          this.alertVisible = true;
          if(null !== this.backTimer) clearTimeout(this.backTimer);
          this.backTimer = setTimeout(()=>{
            this.back(2);
          }, 30000);
        }
        //出货成功
        if(msg && msg.status == 2 && msg.isfinished == true){
          this.next();
        }
      };
    },
    methods:{
      async next(){
        let self = this;
        try{
          self.log.info('next pick up list = %s', JSON.stringify(self.nextPickUpList));
          if(self.nextPickUpList.length){
            let orderInfo = self.nextPickUpList[0];
            let pickUpInfo = [];
            for(let k=0; k < orderInfo.productInfo.length; k++){
              let drug = orderInfo.productInfo[k];
              if(!drug.enough) continue;
              let idx = pickUpInfo.findIndex(ele => ele.merchant_product_id === drug.merchant_product_id);
              if(-1 !== idx){
                pickUpInfo[idx].product_count += parseInt(drug.num);
              }else{
                pickUpInfo.push({
                  merchant_product_id: drug.merchant_product_id,
                  product_count: parseInt(drug.num)
                });  
              }
            }
            self.nextPickUpList = self.nextPickUpList.slice(1);
            await self.api.pick_up_product(orderInfo.presc_no, 0, pickUpInfo);
          }else{
            /*let sendData = self.list.map(item => {
              return {
                PrescNo: item.presc_no,
                allFlag: item.allFlag,
                drugArr: item.productInfo.map(it => {
                  return {
                    DrugCode: it.drug_code,
                    enough:it.enough
                  }
                }) 
              };
            });*/
            //await API.sendPrescResult({ prescList: sendData });
            //打印小票
            self.print();
            self.$router.push({ name:'prescCheck', params:{
              list: self.list,
              all: self.all,
              kind: self.kind,
              count: self.totalProduct
            }});
          }
        }catch(e){
          self.log.error('next func error,  ', e);
          audioPlay(__static +'/取药失败请重新取药或联系客服.mp3');
          self.print(false);
          self.alertVisible = true;
          self.api.operate_vendor(6,1).catch(e => {
            self.log.error('operate_vendor err=%s', e.message);
          });
          if(null !== self.backTimer) clearTimeout(self.backTimer);
          self.backTimer = setTimeout(()=>{
            self.back(2);
          },30000);
        }
      },
      //打印
      async print(ret = true){
        //获取商品列表
        try{
          let info = {
            ticket_title: this.$conf.ticketTitle || '未来健康智慧药房',
            phone:this.phone,
            isSuccess: ret,
            prescList: this.all,
          };
          await this.api.print_ticket(info, 1);
        }catch (e){
          this.log.error('print failed,e=', e.message);
        }
      },
      back(idx){
        if(this.faultFlag){
          this.$router.push({ name: 'CrashPage' });
        }else{
          this.$router.push({name: 'home', params: {'log': `page method [back] ${idx}, page name [${this.pageName}]`}});
        }
      }
    },
    async destroyed(){
      if(this.music) this.music.pause();
      this.music = null;
      if(null !== this.backTimer) clearTimeout(this.backTimer);
      if(this.percentTimer) clearInterval(this.percentTimer);
      this.api.on_notify_pick_up_product = null;
    }
  }
</script>

<style lang="scss" scoped>
  .customerWaiting{
    height: 100vh;
    font-family:PingFangSC-Semibold,PingFang SC;
    background: #4A90E2 url('../assets/images/bg.png') no-repeat fixed;
    background-position-y: bottom ;
    background-size: contain;
    .progress-container{
      padding: 4rem 3.6rem 0 3.6rem;
      display: flex;
      flex-direction: column; 
      align-items: center;
      .progress-content{
        width: 100%;
        height: .72rem;
        background: #FFFFFF;
        border-radius: .35rem;
        box-sizing: border-box;
        padding: .08rem;
        .progress-bar{
          display: flex;
          flex-direction: column;
          height: 100%;
          min-width: .7rem !important;
          max-width: 100% !important;
          position: relative;
          .progress-bar1{
            border-radius: .35rem .35rem 0 0;
            height: 50%;
            background-color: #9EF374;
          }
          .progress-bar2{
            border-radius: 0 0 .35rem .35rem;
            height: 50%;
            background-color: #7FE24E;
          }
          .progress-percent{
            position: absolute;
            right: 0;
            top: -.8rem;
            height: .6rem;
            display: flex;
            align-items: center;
            justify-content: center;
            .progress-num{
              font-size: .42rem;
              font-family: PingFangSC-Medium, PingFang SC;
              font-weight: 500;
              color: #242F44;
            }
            .progress-icon{
              margin-left: .24rem;
              width: .6rem;
              height: .6rem;
              display: flex;
              align-items: center;
              justify-content: center;
              .image{
                width: 100%;
                height: 100%;
              }
            }
          }
        }
      }
      .progress-text{
        margin-top: 1rem;
        font-size: .46rem;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 600;
        color: #427EF7;
        line-height: .65rem;
      }
      .progress-tips{
        margin-top: .2rem;
        font-size: .32rem;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 600;
        color: #427EF7;
        line-height: .45rem;
      }
    }
  }
  .mask{
    position: absolute;
    top:0;
    right: 0;
    left: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, .6);
    z-index: 100;
  }
  .dv-alert{
    position: absolute;
    left: 4.95rem;
    bottom: 0;
    width: 9.3rem;
    height:9.36rem;
    background-color: #FFF;
    z-index: 101;
    border-top-left-radius: .4rem;
    border-top-right-radius: .4rem;
    box-sizing: border-box;
  }
  .box05{
    position: absolute;
    left: 2.78rem;
    top: 2.87rem;
    background: url(../assets/Bitmap.png) 0 0  no-repeat;
    background-size:100% 100%;
    width: 3.74rem;
    height: 2.88rem;
  }
  .box06{
    position: absolute;
    top:6.46rem;
    width: 100%;
    font-size:.32rem;
    font-weight:500;
    color:rgba(153,153,153,1);
    text-align: center;
  }
  .alert-confirm{
    position: absolute;
    right:1.1rem;
    bottom: .6rem;
    width:3.2rem;
    height:.8rem;
    background:linear-gradient(90deg,rgba(115,222,255,1) 0%,rgba(63,186,255,1) 100%);
    border-radius:.65rem;
    text-align: center;
    line-height: .8rem;
    font-size:.36rem;
    font-weight:500;
    color:rgba(255,255,255,1);
  }
  .alert-cancel{
    position: absolute;
    left:1.1rem;
    bottom: .6rem;
    width:3.2rem;
    height:.8rem;
    background:rgba(255,255,255,1);
    border:.02rem solid rgba(115,222,255,1);
    border-radius:.65rem;
    text-align: center;
    line-height: .8rem;
    font-size:.32rem;
    font-weight:500;
    color:rgba(115,222,255,1);
  }
  .dv-alert-text{
    position: absolute;
    width: 100%;
    text-align: center;
    font-size:.4rem;
    font-weight:600;
    color:rgba(51,51,51,1);
  }
</style>
