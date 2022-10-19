<template>
  <div class="pickupCode">
    <top-nav :title-text="pageName" :remaining="180" :show-left-button="false" :show-right-button="true"></top-nav>
    <div class="content">
      <div class="left-item">
        <div class="title">扫码二维码</div>
        <div class="image"><img src="../assets/qrscan.png" style="width:100%;height:100%;" /></div>
        <div class="desc">请将二维码对准扫描区</div>
      </div>
      <div class="right-item">
        <div class="title">手动输入</div>
        <div class="code">
          <div class="c-item" :class="{'active': code.length > 0}">{{code[0] || ''}}</div>
          <div class="c-item" :class="{'active': code.length > 1}">{{code[1] || ''}}</div>
          <div class="c-item" :class="{'active': code.length > 2}">{{code[2] || ''}}</div>
          <div class="c-item" :class="{'active': code.length > 3}">{{code[3] || ''}}</div>
          <div class="c-item" :class="{'active': code.length > 4}">{{code[4] || ''}}</div>
          <div class="c-item" :class="{'active': code.length > 5}">{{code[5] || ''}}</div>
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
            <div class="d-k-item d-k-item-btn2" @click="clear">清空</div>
            <div class="d-k-item" @click="inputNum(0)">0</div> 
            <div class="d-k-item d-k-item-btn" @click="del"><img src="@/assets/del.png" /></div>
          </div>
          <div class="btn" :class="[code.length==0 ? '' : 'btn2']" @click="pickup">确认取药</div>
        </div>
      </div>
    </div>

    <div class="mask" v-show="alertVisible">
      <div class="close-alert" @click="alertVisible=false"></div>
      <div class="dv-alert">
        <div class="close" @click="alertVisible=false"></div>
        <div class="dv-alert-text" style="top:1.19rem">{{alertText1}}</div>
        <div class="dv-alert-text" style="top:1.75rem">{{alertText2}}</div>
        <div class="alert-confirm" @click="alertVisible=false">确定</div>
      </div>
    </div>
  </div>
</template>

<script>
  import {audioPlay} from "../js/util";
  export default {
    name: "pickupCode",
    data(){
      return {
        pageName: "扫码取药",
        code:'',
        alertVisible:false,
        alertText1:"",
        alertText2:"",
        isScaning:false,
        currentPath: this.$route.path
      }
    },
    methods:{
      inputNum(num){
        this.code+=num.toString();
      },
      del(){
        if(this.code.length>0){
          this.code = this.code.slice(0,this.code.length-1);
        }
      },
      clear(){
        this.code = "";
      },
      async pickup(){
        if(this.code.length==0) return;
        try{
          let data = await this.api.get_customer_product(this.code);
          if(this.currentPath == this.$route.path) this.$router.push({name:'customerProductList',params:{code:this.code,list:data.pick_up_product_list_info,order_id:data.order_id,lock_product:data.lock_product}});
        }
        catch (e){
          //todo -1 区分取货码错误 和 货架缺货 以及其他系统错误
          if(e && e.errcode == 2){
            this.alertVisible = true;
            this.alertText1 = '取药码不存在';
            this.alertText2 = '请核对后重新输入';
            audioPlay(__static +'/取药码不存在.mp3');
          }
          else if(e && e.errcode == -100 || e.errcode == -101){
            this.alertVisible = true;
            this.alertText1 = '药品库存不足';
            this.alertText2 = '请去其他药柜取药';
            audioPlay(__static +'/药品库存不足请前往其他药机取药.mp3');
          }
          else if(e && e.errcode == 17){
            this.alertVisible = true;
            this.alertText1 = '取药码已过期';
            this.alertText2 = '';
            audioPlay(__static +'/您的取药码已过期.mp3');
          }
          else {
            this.alertVisible = true;
            this.alertText1 = '系统错误';
            this.alertText2 = '请联系客服';
          }
        }
      },
      async startScan(){
        try{
          await this.api.scanqrcode();
        }
        catch (e) {
          this.log.error('scanqrcode fail,e=',e);
        }
      },
      async stopScan(){
        try{
          await this.api.stop_scan_qrcode();
        }
        catch (e) {
          this.log.error('stop_scan_qrcode fail,e=',e);
        }
      }
    },
    async mounted(){
      audioPlay(__static +'/请扫描二维码或者手动输入取药码.mp3');
      this.api.on_notify_qrcode = async (body)=>{
        //状态(0:成功;2:处于打开状态;-1:失败;-3:开启扫描仪照明失败;-8:初始化异常;-65535:程序未初始化)
        if(body.status == 0 && body.qrcodeinfo && body.qrcodeinfo.str){
          this.code = body.qrcodeinfo.str;
          this.pickup();
        }
      };
      this.startScan();
    },
    async destroyed(){
      this.stopScan();
    }
  }
</script>

<style lang="scss" scoped>
.pickupCode{
  font-family: PingFangSC-Semibold, PingFang SC;
  display: flex;
  flex-direction: column;
  height: 100vh;
  .content{
    // flex-grow: 1;
    padding: .6rem 2.2rem 0 2.2rem;
    display: flex;
    justify-content: space-between;
    .left-item{
      width: 5.28rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .image{
        width: 5.28rem;
        height: 4.12rem;
      }
      .desc{
        font-size: .38rem;
        font-family: PingFang-SC-Medium, PingFang-SC;
        font-weight: 500;
        color: #333333;
        line-height: .53rem;
        text-align: center;
        padding-bottom: .23rem;
      }
    }
    .right-item{
      width: 6.4rem;
      .code{
        display: flex;
        justify-content: space-between;
        margin: .3rem 0;
        font-size: .52rem;
        font-family: PingFang-SC-Bold, PingFang-SC;
        font-weight: bold;
        color: #333333;
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
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: .48rem;
            font-weight: 500;
            height: 1rem;
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
      font-size: .48rem;
      font-family: PingFangSC-Semibold, PingFang SC;
      font-weight: 600;
      color: #333333;
      line-height: .67rem;
      text-align: center;
    }
  }
}
</style>

<style scoped>
  .mask{
    position: absolute;
    top:0;
    right: 0;
    left: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, .6);
    z-index: 100;
  }
  .close-alert{
    position: absolute;
    top:0;
    right: 0;
    left: 0;
    bottom: 0;
    opacity: 1;
    z-index: 100;
  }
  .dv-alert{
    position: absolute;
    width: 8.6rem;
    height: 5rem;
    left:5.3rem;
    top:2.9rem;
    background:rgba(255,255,255,1);
    border-radius:.28rem;
  }
  .alert-confirm{
    position: absolute;
    left:2.9rem;
    bottom: .9rem;
    width:2.8rem;
    height:1.1rem;
    background:linear-gradient(90deg,rgba(115,222,255,1) 0%,rgba(63,186,255,1) 100%);
    border-radius:.65rem;
    text-align: center;
    line-height: 1.1rem;
    font-size:.36rem;
    font-weight:500;
    color:rgba(255,255,255,1);
  }
  .dv-alert-text{
    position: absolute;
    width: 100%;
    text-align: center;
    font-size:.4rem;
    font-weight:500;
    color:rgba(51,51,51,1);
  }
</style>
