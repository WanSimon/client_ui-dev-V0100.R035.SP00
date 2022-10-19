<template>
  <div class="shoppingList">
    <!-- 返回首页需要二次确认 -->
    <top-nav @right-button="clickRightButton" :title-text="pageName" :remaining="180" :show-left-button="true" :show-right-button="true"></top-nav>
    <div class="container">
      <div class="table-head">
        <table>
          <colgroup>
            <col style="width: 45%" />
            <col style="width: 15%" />
            <col style="width: 15%" />
            <col style="width: 25%" />
          </colgroup>
          <thead>
          <tr>
            <th style="text-align: left;">药品名称</th>
            <th>单价</th>
            <th>数量</th>
            <th>金额</th>
          </tr>
          </thead>
        </table>
      </div>
      <div class="line"></div>
      <div class="table-body">
        <table>
          <colgroup>
            <col style="width: 45%" />
            <col style="width: 15%" />
            <col style="width: 15%" />
            <col style="width: 25%" />
          </colgroup>
          <tbody>
          <tr v-for="item,index in cartData.cartProduct" :key="index">
            <td class="text-left">{{item.merchant_product_info.product_info.name}}</td>
            <td>&yen;{{item.merchant_product_info.price | moneyParse}}</td>
            <td>{{item.cartNum}}</td>
            <td>&yen;{{item.merchant_product_info.price * item.cartNum | moneyParse}}</td>
          </tr>
          </tbody>
        </table>
      </div>
      <div class="line"></div>
      <div class="table-foot">
        <table>
          <colgroup>
            <col style="width: 45%" />
            <col style="width: 15%" />
            <col style="width: 15%" />
            <col style="width: 25%" />
          </colgroup>
          <thead>
          <tr>
            <td class="text-left">种类：{{cartData.cartProduct.length}}</td>
            <td></td>
            <td>总数：{{cartData.cartProductCount}}</td>
            <td style="text-align: right;padding-right: 1rem">
              <div>合计：&yen;{{cartData.cartProductPrice | moneyParse}}</div>
            </td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td style="text-align: right;padding-right: 1rem">
              <div>会员价：<span class="highlight-color">&yen;{{cartData.cartProductCustomerPrice | moneyParse}}</span></div>
              <div style="font-size: .24rem; color: #909399;margin-top: .2rem">优惠：&yen;{{cartData.cartProductPrice-cartData.cartProductCustomerPrice | moneyParse }}</div>
            </td>
          </tr>
          </thead>
        </table>
      </div>

      <div class="confirm-btn" :class="{'btnDisabled': btnDisabled.confirm}" @click="confirm()">确认</div>
      <div class="mask" v-show="payVisible">
        <div class="close-cart" @click="payVisible=false"></div>
        <div class="mask-dv">
          <div class="close" @click="payVisible=false"></div>
          <div class="amount">应付金额：<span class="highlight-color">&yen;{{cartData.cartProductPrice | moneyParse}}</span></div>
          <div class="qrcode-box" :class="[mode=='wx'?'bg_wx':'bg_ali']" >
            <div :class="[mode=='wx'?'pay_wx':'pay_ali']" ></div>
            <div class="qrcode-box2">
              <canvas id="QRCode"></canvas>
            </div>
            <div class="desc">扫一扫付款</div>

          </div>
          <div :class="[mode=='wx'?'sel-pay':null]" class="logo_wx" @click ="switchMode('wx')" >
            <div v-show="mode=='wx'" class="dv-radius"></div>
          </div>
          <div :class="[mode=='ali'?'sel-pay':null]" class="logo_ali" @click ="switchMode('ali')" >
            <div v-show="mode=='ali'" class="dv-radius"></div>
          </div>
          <div class="service">客服：{{phone}}</div>
          <div class="mark">请选择支付方式</div>
        </div>
      </div>

      <div class="mask" v-show="successVisible">
        <div class="mask-dv">
          <div class="mask-txt">支付成功</div>
          <div class="mask-line"></div>
          <div class="mask-success"></div>
          <div class="mask-box" style="top:6.46rem;">感谢您的购买</div>
          <div class="mask-box" style="top:7rem;">{{successCountDown}}s</div>
        </div>
      </div>

      <div class="mask" v-show="failVisible">
        <div class="mask-dv">
          <div class="mask-txt">支付失败</div>
          <div class="mask-line"></div>
          <div class="mask-fail"></div>
          <div class="mask-box" style="top:5.96rem;">请点击返回按钮重新扫描二维码</div>
          <div class="mask-box" style="top:6.46rem;">进行订单支付</div>
          <div class="mask-back" @click="failVisible = false"> 返回</div>
        </div>
      </div>
    </div>

    <app-mask :is-visible="appMaskVisible">
      <app-confirm :is-visible.sync="appMaskVisible" :message-text="confirmMessage"></app-confirm>
    </app-mask>
  </div>
</template>

<script>
  import uuid from 'uuid';
  import QRCode from "qrcode"; //引入生成二维码插件
  import moment from 'moment';
  import { mapGetters } from 'vuex';
  import { audioPlay, debounce} from "../js/util";
  import AppMask from '@/components/AppMask.vue';
  import AppConfirm from '@/components/AppConfirm.vue';

  export default {
    name: "shoppingList",
    computed:{
      ...mapGetters(['phone'])
    },
    data(){
      return {
        appMaskVisible: false,
        confirmMessage: '您确定要放弃购买吗？',
        pageName: "核对订单",
        payVisible:false,
        cartData:{
          cartProduct:[],
          cartProductCount:0,
          cartProductPrice:0,
          cartProductCustomerPrice:0
        },
        getPayStatusTimer:null,
        successVisible:false,
        failVisible:false,
        successCountDown:3,
        //默认微信支付
        mode:'wx',
        wx_pay_url:'',
        ali_pay_url:'',
        //是否取药
        is_pickup:false,
        switchEnd:true,
        unload: false,
        currentPath: this.$route.path,
        btnDisabled: {confirm: true},
      }
    },
    components:{
      AppMask, AppConfirm
    },
    methods:{
      //nav 组件中的回到首页按钮
      clickRightButton(){
        let self = this;
        self.appMaskVisible = true;
      },
      async switchMode(mode){
        if(!this.switchEnd) return;
        this.switchEnd = false;
        if(mode=='ali' && this.mode =='wx'){
          this.mode = 'ali';
          if(!this.ali_pay_url) await this.pay();
          await this.getQrcode(this.ali_pay_url);
        }else if(mode=='wx' && this.mode =='ali') {
          this.mode = 'wx';
          if(!this.wx_pay_url) await this.pay();
          await this.getQrcode(this.wx_pay_url);
        }
        this.switchEnd = true;
      },
      confirm: debounce(async function(){
        try{
          if(this.btnDisabled.confirm) {
            this.log.debug('shoppingList click confirm func too fast');
            return;
          }
          this.$set(this.btnDisabled, 'confirm', true);
          audioPlay(__static +'/请选择支付方式.mp3');
          this.log.debug('shoppingList confirm event start');
          if(!this.wx_pay_url && !this.ali_pay_url) {
            await this.submitOrder();
            if(this.mode == 'wx') {
              await this.getQrcode(this.wx_pay_url);
            }
            else await this.getQrcode(this.ali_pay_url);
          }
          else {
            if(this.wx_pay_url){
              this.mode = 'wx';
              await this.getQrcode(this.wx_pay_url);
            }else if(this.ali_pay_url){
              this.mode = 'ali';
              this.log.info(this.ali_pay_url)
              await this.getQrcode(this.ali_pay_url);
            }
          }
          this.payVisible = true;
          this.$set(this.btnDisabled, 'confirm', false);
          this.log.debug('shoppingList confirm event end');
        }catch(e){
          this.$toast('提交订单失败');
          this.order_id = uuid.v4();
          this.$set(this.btnDisabled, 'confirm', false);
          this.log.error('shoppingList confirm event error %s', e.message); 
        }
      }),
      getQrcode(url){
        return new Promise((resolve,reject)=>{
          // 获取页面的canvas
          let qrcodeDoc = document.getElementById("QRCode");
          // 将获取到的数据（val）画到msg（canvas）上
          QRCode.toCanvas(qrcodeDoc, url, (error)=> {
            if(error) {
              this.log.error('QRCode error %s', error.message || '');
              reject(error);
            }else{
              resolve();
            }
          });
        });
      },
      async submitOrder(){
        let order_detail_info_list = [];
        this.cartData.cartProduct.map((item)=>{
          order_detail_info_list.push({
            merchant_product_id:item.merchant_product_info.merchant_product_id,
            amount:item.merchant_product_info.price * item.cartNum,
            customer_amount:item.merchant_product_info.customer_price * item.cartNum,
            unit_price:item.merchant_product_info.price,
            customer_price:item.merchant_product_info.customer_price,
            product_count:item.cartNum
          });
        });
        let orderInfo = {
          id:this.order_id,
          //实际支付金额
          amount: this.cartData.cartProductPrice,
          customer_amount: this.cartData.cartProductPrice,
          pay_amount: this.cartData.cartProductPrice,
          pay_status:this.api.PayStatus.PS_NoPay,
          order_status:this.api.OrderStatus.OS_NoPay,
          inner_order_no: this.trade_no,
          id_card:this.$store.state.account.idcard,
          pick_up_type:this.api.PickUpType.COMMON,
          order_source:this.api.OrderResource.OSRC_Equipment,
          buy_way:this.api.BuyWay.Buy,
          order_detail_info_list
        };
        try {
          //下订单
          await this.api.submit_order(orderInfo);
          await this.pay();
          await this.getPayStatus();
        }
        catch (e){
          this.log.error('提交订单失败',e);
        }
      },
      async getPayStatus(){
        let self = this;
        //加try catch的原因是出现过获取订单状态超时时, 会一直卡在付款页面
        let res;
        try{
          res = await self.api.req_get_pay_status(this.trade_no);
        }catch(e){
          self.log.error('req_get_pay_status error = ', e);
          res = {status: self.api.PayStatus.PS_NoPay};
        }
        //支付成功
        if(res.status == self.api.PayStatus.PS_SUCCESS){
          //取药
          try{
            await self.pickup();
          }catch (e){
            self.log.error(e);
            return false;
          }
          self.payVisible = false;
          self.successVisible = true;
          if(!self.unload){
            self.successTimer = setInterval(()=>{
              if(self.successCountDown>1){
                self.successCountDown = self.successCountDown-1;
              }else {
                clearInterval(self.successTimer);
                if(self.currentPath == self.$route.path) self.$router.push({name:'waiting',params:{list:self.list,order_id:self.order_id,trade_no:self.trade_no}});
              }
            },1000);
          }
        }else if(res.status == self.api.PayStatus.PS_Failed){
          self.failVisible = true;
        }else if(res.status == self.api.PayStatus.PS_NoPay){
          if(self.getPayStatusTimer) clearTimeout(self.getPayStatusTimer);
          if(self.unload) return;
          self.getPayStatusTimer = setTimeout(async()=>{
            await self.getPayStatus();
          },1000);
        }
      },
      //取药
      async pickup(){
        let self = this;
        self.log.log('开始取药');
        try{
          let list = self.cartData.cartProduct.map((item)=>{
            return{
              merchant_product_id:item.merchant_product_info.merchant_product_id,
              product_count:item.cartNum
            };
          });
          await self.api.pick_up_product( this.order_id,0 ,list);
          self.is_pickup = true;
          return true;
        }
        catch (e){
          self.log.error('设备取药失败',e);
          return false;
        }
      },
      //调用支付平台接口
      async pay(){
        let pay_info = {
          trade_no:this.trade_no,
          total_fee: this.cartData.cartProductPrice,
          trade_type: this.mode =='ali'?this.api.TradeType.ALI_NATIVE : this.api.TradeType.WX_NATIVE,
          comment: '小药机-药品'
        };
        let res = await this.api.req_pay(pay_info);
        if(this.mode =='wx'){
          this.wx_pay_url = res.pay_url;
        }
        else {
          this.ali_pay_url = res.pay_url;
        }
      },
    },
    async mounted(){
      audioPlay(__static +'/请确认您的订单.mp3');
      this.cartData.cartProductCount = this.$store.state.cartData.cartProductCount;
      this.cartData.cartProductPrice = this.$store.state.cartData.cartProductPrice;
      this.cartData.cartProductCustomerPrice = this.$store.state.cartData.cartProductCustomerPrice;
      this.cartData.cartProduct = this.$store.state.cartData.cartProduct.filter(item=>item.cartNum!=0);
      //生成订单id
      this.trade_no = uuid.v4().replace(/-/g, '');
      this.order_id = uuid.v4();
      this.$set(this.btnDisabled, 'confirm', false);
    },
    beforeDestroy(){
      this.unload = true;
      if(this.successTimer) clearInterval(this.successTimer);
    },
    async destroyed(){
      if(this.getPayStatusTimer){
        clearTimeout(this.getPayStatusTimer);
      }
      if(this.successTimer){
        clearInterval(this.successTimer);
      }
    },

  }
</script>

<style lang="scss" scoped>
  .shoppingList {
    height: 100vh;
    background: rgba(255,255,255,0.49) url('../assets/images/bg.png') no-repeat fixed;
    background-position-y: bottom ;
    background-size: cover;
    font-family:PingFang-SC-Medium,PingFang-SC;
  }
  .container{
    box-sizing: border-box;
    margin: 0 2.2rem;
    padding-top:.5rem;
  }
  .table-head table, .table-body table, .table-foot table{
    width: 96%;
    margin: 0 auto;
    text-align: center;
    border-collapse:separate;
    border-spacing:0 .15rem;
    table-layout: fixed;
  }

  .table-body{
    margin-top: .3rem;
    overflow-y: auto;
    max-height: 3.5rem;  /* TODO 高度根据实际情况自己确定 */
  }
  .table-body table tr td{
    color: #303133;
    font-size: .28rem;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .table-head table thead tr th{
    font-size: .32rem;
    font-weight: 600;
    color: #303133;
  }
  .table-foot table tr td{
    font-size: .32rem;
    font-weight: 600;
    color: #303133;
  }
  .line{
    height: .2rem;
    border-bottom: 1px #cecece dashed;
  }
  .text-left{
    text-align: left;
  }
  .text-center{
    text-align: center;
  }
  .text-right{
    text-align: right;
  }
  .highlight-color{
    color: #FF5D2B;
  }
  .confirm-btn{
    position: absolute;
    left:7.2rem;
    bottom: 1rem;
    width:4.8rem;
    height:1.1rem;
    background:linear-gradient(90deg,rgba(115,222,255,1) 0%,rgba(63,186,255,1) 100%);
    border-radius:.65rem;
    text-align: center;
    line-height: 1.1rem;
    font-size:.36rem;
    font-weight:500;
    color:rgba(255,255,255,1);
  }
  .btnDisabled{
    background-color: #979797;
    background-image: none;
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
  .close-cart{
    position: absolute;
    top:0;
    right: 0;
    left: 0;
    bottom: 0;
    opacity: 1;
    z-index: 100;
  }
  .mask .mask-dv{
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
  .mask-fail{
    position: absolute;
    top: 3.18rem;
    left: 3.54rem;
    background: url(../assets/fail.png) 0 0  no-repeat;
    background-size:100% auto;
    width: 2.2rem;
    height: 2.2rem;
  }
  .mask-box{
    position: absolute;
    width: 100%;
    text-align: center;
    font-size:.32rem;
    font-weight:500;
    color:rgba(153,153,153,1);
  }
  .mask-back{
    position: absolute;
    bottom: .6rem;
    left: 2.24rem;
    width:4.8rem;
    height:1.1rem;
    background:linear-gradient(90deg,rgba(115,222,255,1) 0%,rgba(63,186,255,1) 100%);
    border-radius:.65rem;
    text-align: center;
    font-weight:500;
    color:rgba(255,255,255,1);
    line-height: 1.1rem;
    font-size: .36rem;
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
  .close{
    position: absolute;
    top: .4rem;
    right: .4rem;
    background: url(../assets/close.png) 0 0  no-repeat;
    background-size:100% auto;
    width: .6rem;
    height: .6rem;
  }
  .amount{
    position: absolute;
    top:.8rem;
    width: 100%;
    text-align: center;
    font-size:.48rem;
    font-weight:600;
    color:rgba(51,51,51,1);
  }
  .qrcode-box{
    position: absolute;
    width:100%;
    height:4rem;
    top:2.26rem;
  }
  .bg_wx{
    background:rgba(79,144,87,1);
  }
  .bg_ali{
    background:rgba(57,143,234,1);
  }
  .qrcode-box2{
    position: absolute;
    top:.36rem;
    left:4.84rem;
    width:2.8rem!important;
    height:2.8rem!important;
    border:1px solid rgba(255,255,255,1);
    text-align: center;
    line-height: 2.8rem;
  }
  .pay1{

  }
  .pay_wx{
    position: absolute;
    top: 1.69rem;
    left: 1.25rem;
    width: 1.95rem;
    height: .62rem;
    background: url(../assets/wx_pay.png) 0 0  no-repeat;
    background-size:100% auto;
  }
  .pay_ali{
    position: absolute;
    top: 1.63rem;
    left: 1.25rem;
    width: 1.88rem;
    height: .67rem;
    background: url(../assets/ali_pay.png) 0 0  no-repeat;
    background-size:100% auto;
  }
  .dv-radius{
    position: absolute;
    right: -0.02rem;
    bottom:-0.02rem;
    width: .28rem;
    height: .28rem;
    background: url(../assets/radius.png) 0 0  no-repeat;
    background-size:100% auto;
  }
  .logo_wx{
    position: absolute;
    bottom: 1rem;
    left: 2.15rem;
    background: url(../assets/wx_logo.png) 0 0  no-repeat;
    background-size:100% auto;
    width: 2rem;
    height: .8rem;
    border: .03rem solid #e3e5ea;
    border-radius: .08rem;
  }
  .logo_ali{
    position: absolute;
    bottom: 1rem;
    right: 2.15rem;
    background: url(../assets/ali_logo.png) 0 0  no-repeat;
    background-size:100% auto;
    width: 2rem;
    height: .8rem;
    border: .03rem solid #e3e5ea;
    border-radius: .08rem;
  }
  .sel-pay{
    border-color: #FF8A00;
  }
  .service{
    position: absolute;
    bottom: .5rem;
    text-align: center;
    width: 100%;
    font-size: .2rem;
    color: rgba(153,153,153,1);
  }
  .desc{
    position: absolute;
    bottom: .25rem;
    left: 5.54rem;
    font-size: .28rem;
    color: rgba(255,255,255,1);
  }
  #QRCode{
    margin-top: .25rem;
    width: 2.3rem!important;
    height: 2.3rem!important;
  }
  .mark{
    position: absolute;
    top:6.66rem;
    width: 100%;
    font-size:.32rem;
    font-weight:500;
    color:rgba(153,153,153,1);
    text-align: center;
  }
</style>
