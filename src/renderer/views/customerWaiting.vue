<template>
  <div class="customerWaiting" style="overflow: hidden">
    <video width="100%" height="100%" autoplay="autoplay" loop="loop">
      <source src="../assets/waiting.mp4" type="video/mp4">
    </video>
    <div class="mask" v-show="alertVisible">
      <div class="dv-alert">
        <div class="dv-alert-text" style="top:1.19rem">取药失败</div>
        <div class="box05"></div>
        <div class="box06">机器出现异常，请重新取药或联系客服</div>
        <div class="alert-cancel" >客服：{{phone}}</div>
        <div class="alert-confirm" @click="back()">返回取药</div>
      </div>
    </div>
    <div class="process-container">
      <div class="process-content">
        <div class="process-bar">
          <div class="percent" :style="{width: percent}"></div>
        </div>
        <div class="process-tip" v-if="totalProduct > 0">已出药{{takenCount}}件/共{{totalProduct}}件</div>
      </div>
      <div class="process-text">{{percent}}</div>
    </div>
  </div>
</template>

<script>
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
        totalProduct: 0,
        currentPath: this.$route.path
      }
    },
    async mounted(){
      audioPlay(__static +'/正在为您取药中请稍等.mp3');
      setTimeout(()=>{
        this.music = audioPlay(__static +'/等待取药.mp3',"loop");
      },3000);
      this.list = this.$route.params.list||[];
      this.totalProduct = this.list.reduce((total, item) => {
        return total + item.product_count
      }, 0);
      //定义售货机出货通知
      this.api.on_notify_pick_up_product = async (msg)=>{
        //出药成功，计算百分比 msg.index = -1 表示复核失败
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
          audioPlay(__static +'/取药失败请重新取药或联系客服.mp3');
          this.alertVisible = true;
          setTimeout(()=>{
            if(this.currentPath == this.$route.path) this.back();
          },30000);
        }
        //出货成功
        if(msg && msg.status == 2 && msg.isfinished == true){
          //打印小票
          this.print();
          //订单状态更改接口
          this.api.update_order_status(this.$route.params.order_id,this.api.OrderStatus.OS_Taked);
          this.$router.push({name:'customerVerifyProduct',params:{list:this.list}});
        }
      };
    },
    methods:{
      //打印
      async print(){

        //获取商品列表
        try{
          let data = await this.api.get_equipment_product();
          this.allProduct =  data.slot_product_list_info;
          let product_info_list = [];
          let count = 0;
          let total_amount = 0;

          this.list.forEach((item)=>{
            let merchant_product_info = _.find(this.allProduct,(slot)=>slot.merchant_product_info.merchant_product_id == item.merchant_product_id);
            if(!merchant_product_info){
              //todo 取货时发现药机没有货
            }
            merchant_product_info = merchant_product_info.merchant_product_info;
            count+= item.product_count;
            total_amount += merchant_product_info.price*item.product_count;
            product_info_list.push({
              name:merchant_product_info.product_info.name,
              specification:merchant_product_info.product_info.specification,
              manufacturer:merchant_product_info.product_info.manufacturer,
              product_count:item.product_count,
              price:merchant_product_info.price,
              amount:merchant_product_info.price*item.product_count,
              batch_number:merchant_product_info.batch_number,
              expiration_date:merchant_product_info.product_info.expiration_date,
              approval_number:merchant_product_info.product_info.approval_number
            });
          });

          let info = {
            ticket_title: this.$conf.ticketTitle || '未来健康智慧药房',
            take_num:this.$route.params.code||'',
            total_product_count:count,
            total_amount:total_amount,
            addr:this.addr,
            phone:this.phone,
            wchat_qr_code:this.qr_code,
            product_info_list:product_info_list
          };
          await this.api.print_ticket(info);
        }
        catch (e){
          this.log.error('print failed,e=',e);
        }
      },
      back(){
        this.$router.push({name: 'home', params: {'log': `page click event [back], page name [${this.pageName}]`}});
      }
    },
    async destroyed(){
      this.music.pause();
      this.music = null;
      if(this.percentTimer) clearInterval(this.percentTimer);
      this.api.on_notify_pick_up_product = null;
    }
  }
</script>

<style scoped>
  .customerWaiting {
    height: 100vh;
    font-family:PingFangSC-Semibold,PingFang SC;
  }
  .process-container{
    position: absolute;
    right: .46rem;
    top: .8rem;
    display: flex;
  }
  .process-content{
    width: 4.8rem;
  }
  .process-bar{
    width: 4.8rem;
    height: .48rem;
    background-color: #D8D8D8;
    border-radius: .24rem;
    flex-shrink: 0;
  }
  .process-tip{
    height: .4rem;
    font-size: .28rem;
    font-family: PingFang-SC-Heavy, PingFang-SC;
    font-weight: 800;
    color: #7A6E73;
    line-height: .4rem;
    letter-spacing: 2px;
    margin-top: .2rem;
    text-align: center;
  }
  .percent{
    border-radius: .24rem / 50%;
    width: 0;
    height: 100%;
    background-image: linear-gradient(270deg, #9EFBFF 0%, #48A8FF 100%);
  }
  .process-text{
    font-size: .24rem;
    font-family: PingFang-SC-Heavy, PingFang-SC;
    background: linear-gradient(90deg, #0F73EE 0%, #22ACF8 100%);
    -webkit-background-clip: text;
    letter-spacing: 2px;
    color: transparent;
    margin-left: .22rem;
    font-weight: 800;
    line-height: .48rem;
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
