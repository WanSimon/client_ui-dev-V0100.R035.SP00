<template>
  <div class="waiting waiting-container">
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
      <div class="progress-tips" v-if="$store.state.cartData && $store.state.cartData.cartProductCount">已出药{{takenCount}}件 / 共{{$store.state.cartData.cartProductCount}}件</div>
    </div>

    <div class="mask" v-show="alertVisible">
      <div class="dv-alert">
        <div class="dv-alert-text" style="top:1.19rem">取药失败</div>
        <div class="box05"></div>
        <div class="box06">机器出现异常，请再次尝试或联系客服</div>
        <div class="alert-cancel" >客服：{{phone}}</div>
        <div class="alert-confirm" @click="refund()">退款</div>
      </div>
    </div>

    <div class="mask" v-show="successVisible">
      <div class="dv-alert">
        <div class="mask-txt">退款成功</div>
        <div class="mask-line"></div>
        <div class="mask-success"></div>
        <div class="mask-box" style="top:6.46rem;">退款成功</div>
        <div class="mask-box" style="top:7rem;">{{successCountDown}}s</div>
      </div>
    </div>
  </div>
</template>

<script>
  import {audioPlay} from "@/js/util";
  import {mapGetters} from "vuex";
  export default {
    name: "waiting",
    computed:{
      ...mapGetters(['phone','qr_code','addr'])
    },
    data(){
      return {
        pageName: "等待出药",
        alertVisible:false,
        successVisible:false,
        successCountDown:5,
        isRefunding:false,
        music:null,
        percent: '0%', //取药百分比
        takenCount: 0,
        percentTimer: null,
        currentPath: this.$route.path,
        faultFlag: false,
        pickFlag: false,
        backTimer: false,
      }
    },
    props:[ 'equipmentFaultFlag' ],
    watch:{
      equipmentFaultFlag(n, v){
        this.log.info('wait:equipmentFaultFlag changed, n=%s, o=%s', n, v);
        this.faultFlag = true;
        let timer = setTimeout(() => {
          if(this.pickFlag){
            this.alertVisible = true;
            if(null !== this.backTimer) clearTimeout(this.backTimer);
            this.backTimer = setTimeout(()=>{
              if('/waiting' == this.$route.path) this.$router.push({ name: 'CrashPage' });
            }, 30000);
          } else{
            if('/waiting' == this.$route.path) this.$router.push({ name: 'CrashPage' });
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

      // this.$once('equipment-fault', () => {
      //   this.log.info('recv emit event equipment-fault');
      //   this.faultFlag = true;
      //   let timer = setTimeout(() => {
      //     if(this.pickFlag){
      //       this.alertVisible = true;
      //       if(null !== this.backTimer) clearTimeout(this.backTimer);
      //       this.backTimer = setTimeout(()=>{
      //         if('/waiting' == this.$route.path) this.$router.push({ name: 'CrashPage' });
      //       }, 30000);
      //     } else{
      //       if('/waiting' == this.$route.path) this.$router.push({ name: 'CrashPage' });
      //     } 
      //   }, 5000);
      //   this.$once("hook:beforeDestroy", () => { clearTimeout(timer); });
      // });

      //定义售货机出货通知
      this.api.on_notify_pick_up_product = async (msg)=>{
        if(msg && 2 == msg.status){
          this.ickFlag = false;
        }
        //出药成功，计算百分比 msg.index = -1 表示复核失败
        if(msg && 2 == msg.status && this.$store.state.cartData.cartProductCount > 0 && msg.index >= 0){
          if(this.percentTimer) clearInterval(this.percentTimer);
          try{
            this.takenCount += parseInt(msg.count) || 0;
            let percent = Math.ceil((this.takenCount / this.$store.state.cartData.cartProductCount) * 100);
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
          if(msg.isfinished && this.takenCount == this.$store.state.cartData.cartProductCount){
            if(this.percentTimer) clearInterval(this.percentTimer);
            this.percent = '100%';
          }
        }

        //出货状态(0:出货失败;1:开始出货;2:出货成功)
        if(msg && msg.status == 0){
          this.pickFlag = true;
          //出货识别  锁住程序 todo
          this.log.error("出货失败！ 机器故障标识=%s", JSON.stringify(this.faultFlag));
          if(this.faultFlag) return;
          audioPlay(__static +'/购药失败您可联系客服或选择退款.mp3');
          this.showRefund();
        }
        //出货成功
        if(msg && msg.status == 2 && msg.isfinished == true){
          //打印小票
          this.print();
          //订单状态更改接口
          this.api.update_order_status(this.$route.params.order_id,this.api.OrderStatus.OS_Taked);
          this.$router.push({name:'verifyProduct'});
        }
      }
    },
    methods:{
      //打印
      async print(){
        let product_info_list = [];
        this.$store.state.cartData.cartProduct.forEach((item)=>{
          if(item.cartNum===0) return false;
          let merchant_product_info = item.merchant_product_info;
          product_info_list.push({
            name:merchant_product_info.product_info.name,
            specification:merchant_product_info.product_info.specification,
            manufacturer:merchant_product_info.product_info.manufacturer,
            product_count:item.cartNum,
            price:merchant_product_info.price,
            amount:merchant_product_info.price*item.cartNum,
            batch_number:merchant_product_info.batch_number,
            expiration_date:merchant_product_info.product_info.expiration_date,
            approval_number:merchant_product_info.product_info.approval_number
          });
        });

        let info = {
          ticket_title:'心药智慧药房',
          //take_num:"",
          total_product_count:this.$store.state.cartData.cartProductCount,
          total_amount:this.$store.state.cartData.cartProductPrice,
          addr:this.addr,
          phone:this.phone,
          wchat_qr_code:this.qr_code,
          product_info_list:product_info_list
        };
        await this.api.print_ticket(info);
      },
      async refund(){
        if(this.isRefunding) return;
        this.isRefunding = true;
        try {
          await this.api.cancel_pay(this.$route.params.trade_no);
          this.alertVisible = false;
          this.successVisible = true;
          this.successTimer = setInterval(()=>{
            if(this.successCountDown>0){
              this.successCountDown = this.successCountDown-1;
            }else {
              clearInterval(this.successTimer);
              if(this.currentPath == this.$route.path){
                if(this.faultFlag){
                  this.$router.push({ name: 'CrashPage' });
                }else{
                  this.$router.push({name: 'home', params: {'log': `page timer event [refund], page name [${this.pageName}]`}});
                }
              }
            }
          },1000);
        }catch (e){
          this.isRefunding = false;
          this.log.error('退款失败:e=',e);
        }
      },
      showRefund(){
        this.alertVisible = true;
      }
    },
    beforeDestroy(){
      if(null !== this.backTimer) clearTimeout(this.backTimer);
    },
    async destroyed(){
      if(this.successTimer){
        clearInterval(this.successTimer);
      }
      if(this.percentTimer) clearInterval(this.percentTimer);
      this.music.pause();
      this.music = null;
      this.api.on_notify_pick_up_product = null;
    }

  }
</script>

<style lang="scss" scoped>
  .waiting-container{
    height: 100vh;
    font-family:PingFangSC-Semibold,PingFang SC;
    background: rgba(255,255,255,0.49) url('../assets/images/bg.png') no-repeat fixed;
    background-position-y: bottom ;
    background-size: cover;
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
  .mask-line{
    position: absolute;
    left: .64rem;
    top: 2.27rem;
    width:8rem;
    height:.03rem;
    background:rgba(245,245,245,1);
  }
  .mask-success {
    position: absolute;
    top: 2.73rem;
    left: 2.97rem;
    background: url(../assets/success.png) 0 0  no-repeat;
    background-size:100% auto;
    width: 3.47rem;
    height: 2.86rem;
  }
  .mask-box{
    position: absolute;
    width: 100%;
    text-align: center;
    font-size:.32rem;
    font-weight:500;
    color:rgba(153,153,153,1);
  }
  .mask-txt{
    position: absolute;
    width: 100%;
    top:.8rem;
    text-align: center;
    font-size:.48rem;
    font-weight:600;
    color:rgba(51,51,51,1);
  }
</style>
