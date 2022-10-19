<template>
  <div class="container">
    <div class="header">
      <top-nav @right-button="clickRightButton" @remind-patient="remindPatient"  :title-text="pageName" :remaining="180" :show-left-button="false"></top-nav>
    </div>
    <div class="content">
      <div class="item" v-for="(item, idx) in list" :key="idx">
        <div class="item-header">
          <div class="text text1">
            <div style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">处方号：{{item.presc_no}}</div>
          </div>
          <div class="text text2"><span v-show="!!!item.fold">单价</span></div>
            <div class="text text2"><span v-show="!!!item.fold">数量</span></div>
            <div class="text text2"><span v-show="!!!item.fold">金额</span></div>
          <div class="text3" @click="fold(item)">
            <div>{{!!!item.fold ? '收起' : '展开'}}</div>
            <img class="image" :src="require(item.fold?'../assets/images/down.png':'../assets/images/up.png')" />
          </div>
        </div>
        <div class="item-content" v-show="!!!item.fold" v-for="(product, index0) in item.productInfo" :key="index0">
          <div class="product" v-show="product.enough">
            <div class="text1">
              <div style="width: 1rem;flex-shrink:0;height:1rem;background-color:#f2f3f6; margin-right: .3rem;">
                <img v-if="product.home_thumb" :src="$conf.resource+product.home_thumb" style="width: 1rem;height: 1rem;" />
              </div>
              <div style="flex-grow:1;line-height:1;">{{product.drug_name || '--'}}</div>  
            </div>
            <div class="text2">&yen;{{(product.unitPrice || product.price) || '-'}}</div>
            <div class="text2">{{(product.num || product.quantity) || '0'}}</div>
            <div class="text2">&yen;{{(product.amount) || '0.00'}}</div>    
          </div>  
        </div>
        <div class="item-footer"></div>
      </div>
    </div>
    <div class="footer">
      <div class="summary">本次您共取 <span style="color: #FF5D2B">{{kind}}</span> 种，<span style="color: #FF5D2B">{{count}}</span> 盒药品</div>
      <div class="btn" @click="closeDoor('custom')" :style="{background: count ? '#4A90E2':'#cccccc'}">请核对药品，关闭舱门</div> 
    </div>
    <div class="countdown" v-show="countdownVisible">
      <div>{{countdownSecond}}s</div>
      <div>正在关闭舱门...</div>
    </div>
  </div>
</template>

<script>
  import { audioPlay } from "../js/util";

  export default {
    name: "prescList",
    data() {
      return {
        pageName: "核对处方",
        msg: "您当前没有待取药品",
        all: [],
        list:[],
        kind: 0,
        count: 0,
        isDoorClose: true,
        timer: null,
        appMaskVisible: false,
        confirmMessage: 'hello world',
        countdownVisible: false,
        countdownTimer: null,
        countdownSecond: 5,
      }
    },
    methods:{
      clickRightButton(){
        let self = this;
        self.log.debug('recv right-button event');
        self.countdownVisible = true;
        if(self.countdownTimer) clearInterval(self.countdownTimer);
        self.countdownTimer = setInterval(() => {
          self.countdownSecond--;
          if(self.countdownSecond <= 0){
            if(null !== self.countdownTimer) {
                clearInterval(self.countdownTimer);
                self.countdownTimer = null;
              }
            self.countdownVisible = false;
            self.$router.push({name: 'home', params: {'log': `click-right-button countdown timer`}});
          }
        }, 1000);
      },
      async remindPatient(){
        let self = this;
        self.log.debug('recv remindPatient event');
        if(null !== self.countdownTimer) return;
        try{
          let data = await self.api.is_drug_take_away();
          self.log.debug('recv is_drug_take_away data, ', data);
          if('0' != data.status){
            audioPlay(__static + '/请尽快取走所购买的药品.mp3');
          }else{
            if(self.timer){
              clearTimeout(self.timer);
              self.timer = null;
            }
            self.timer = setTimeout(() => {
              self.log.debug('remindPatient callback exec');
              self.closeDoor();  
            }, 10000);
          }
        }catch(e){
          self.log.error('remindPatient error, ', e);
        }
      },
      fold(item){
        this.$set(item, 'fold', !item.fold);
      },
      async closeDoor(flag = 'auto'){
        let self = this;
        try{
          if('custom' == flag){
            let data = await self.api.is_drug_take_away();
            if('0' != data.status){
              audioPlay(__static + '/请尽快取走所购买的药品.mp3');
              return;
            }
          }
        }catch(e){
          self.log.error('检测是否有漏药失败, err=%s', e.message);
        }
        try{
          self.countdownVisible = true;
          if(self.countdownTimer) clearInterval(self.countdownTimer);
          self.countdownTimer = setInterval(() => {
            self.countdownSecond--;
            if(self.countdownSecond <= 0){
              if(null !== self.countdownTimer) {
                clearInterval(self.countdownTimer);
                self.countdownTimer = null;
              }
              self.countdownVisible = false;
              self.$router.push({name: 'home', params: {'log': `closeDoor countdown timer`}});
            }
          }, 1000);
          audioPlay(__static + '/关舱门请注意.mp3');
          await self.api.closeDoor();
          self.isDoorClose = true;
          //self.$router.push({name: 'home', params: {'log': `page method [closeDoor], page name [${self.pageName}]`}});
        }catch (e){
          self.log.error('关闭舱门失败！err=%s',e.message);
        }
      },
    },
    created(){
      this.list = this.$route.params.list;
      this.all = this.$route.params.all;
      this.kind = this.$route.params.kind;
      this.count = this.$route.params.count; 
    },
    async mounted(){
      try{
        let flag = this.all.find(item => item.allFlag < 2);
        this.log.debug('judge play audio flag, %s', JSON.stringify(flag));
        if(flag){
          this.log.debug('play audio 请取走您的小票并核对您所购买的药品小票上显示未取药的药品请去药房取药.mp3');
          //需要去药房取药 请去药房取药
          audioPlay(__static + '/请取走您的小票并核对您所购买的药品小票上显示未取药的药品请去药房取药.mp3');
        }else{
          this.log.debug('play audio 请取走您的小票并核对您所购买的药品.mp3');
          //不需要去药房取药
          audioPlay(__static + '/请取走您的小票并核对您所购买的药品.mp3');
        }
        //打开舱门
        await this.api.openDoor();
        this.isDoorClose = false;
      }catch(e){
        this.log.error('打开舱门失败！err=%s',e.message);
      }
    },
    async destroyed(){
      if(this.timer) clearTimeout(this.timer);
      if(null !== this.countdownTimer) clearInterval(this.countdownTimer);
      if(!this.isDoorClose) {
        try{
          audioPlay(__static + '/关舱门请注意.mp3');
          await this.api.closeDoor();
        }catch (e){
          this.log.error('关闭舱门失败！err=%s',e.message);
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
.container{
  display: flex;
  flex-direction: column;
  position: relative;
  // background: #EEEEEE;
  background: #FFFFFF url('../assets/images/bg.png') no-repeat fixed;
  background-position-y: bottom ;
  background-size: contain;
  height: 100vh;
  .header{
    height: auto;
    flex-shrink: 0;
    background-color: #4A90E2;
  }
  .content{
    height: 1rem;
    flex-grow: 1;
    overflow-y: scroll;
    .item:last-child{
      margin-bottom: .4rem;
    }
    .item{
      margin: .4rem .6rem 0 .6rem;
      background-color: #FFFFFF;
      border-radius: .08rem;
      opacity: 0.99;
      .item-header{
        display: flex;
        padding: .3rem;
        font-size: .32rem;
        justify-content: space-between;
        .text{
          font-size: .32rem;
          font-family: PingFangSC-Semibold, PingFang SC;
          font-weight: 600;
          color: #333333;
          line-height: .45rem;
          letter-spacing: 1px;
        }
        .text1{
          width: 8rem;
          display: flex;
          align-items: center;
          overflow: hidden;
          .image{
            width: .36rem;
            height: .36rem;
            margin-right: .2rem;
          }
        }
        .text2{
          width: 2.7rem;
          text-align: center;
        }
        .text3{
          width: auto;
          font-size: .2rem;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #666666;
          display: flex;
          align-items: center;
          .image{
            width: .5rem;
            height: .5rem;
          }
        }
      }
      .item-content{
        padding: 0 .3rem;
        font-size: .32rem;
        border-top: solid 1px #F5F5F5;
        .item-header2{
          display: flex;
          padding: .3rem 0;
          font-size: .28rem;
          .text{
            font-size: .28rem;
            font-family: PingFangSC-Semibold, PingFang SC;
            font-weight: 600;
            color: #333333;
            line-height: .45rem;
            letter-spacing: 1px;
          }
          .text1{
            width: 8rem;
            display: flex;
            align-items: center;
            overflow: hidden;
            .image{
              width: .36rem;
              height: .36rem;
              margin-right: .2rem;
            }
          }
          .text2{
            width: 2.7rem;
            text-align: center;
          }
          .text3{
            width: auto;
            font-size: .2rem;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #666666;
            display: flex;
            align-items: center;
            .image{
              width: .5rem;
              height: .5rem;
            }
          }
        }
        .product{
          display: flex;
          margin: .2rem 0;
          font-size: .26rem;
          .text1{
            width: 8rem;
            display: flex;
            overflow: hidden;
            .image{
              width: .36rem;
              height: .36rem;
              margin-right: .2rem;
            }
          }
          .text2{
            width: 2.7rem;
            text-align: center;
          }
        }
      }
      .item-footer{
        min-height: 1px;
        .enough{
          display: flex;
          align-items: center;
          padding: .07rem .3rem;
          background-color: #FFFFFF;
          border-bottom-right-radius: .08rem;
          border-bottom-left-radius: .08rem;
          .image{
            width: .28rem;
            height: .25rem;
            margin-right: .2rem;
          }
          .msg{
            font-size: .18rem;
            font-family: PingFang-SC-Medium, PingFang-SC;
            font-weight: 500;
            color: #333333;
            line-height: .25rem;
          }
        }
      }
    }
    .item-enough{
      background-color: #DCDCDC;
    }
  }
  .footer{
    height: 1rem;
    flex-shrink: 0;  
    background: #EEEEEE;
    opacity: 0.99;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .summary{
      font-size: .32rem;
      font-family: PingFangSC-Semibold, PingFang SC;
      font-weight: 600;
      color: #333333;
      letter-spacing: .01rem;
    }
    .btn{
      width: 6rem;
      height: 1rem;
      line-height: 1rem;
      font-size: .36rem;
      font-family: PingFang-SC-Bold, PingFang-SC;
      font-weight: bold;
      color: #FFFFFF;
      text-align: center; 
    }
  }
}
::-webkit-scrollbar {
  width: .1rem; 
  height: .01rem;
}
::-webkit-scrollbar-thumb {
  border-radius: .1rem;
  box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
  background: #c5c4c4;
}
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
  border-radius: .1rem;
  background: #EEEEEE;
}
.countdown{
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  color: #FFFFFF;
  font-size: .32rem;
  flex-direction: column;
}
</style>

<style scoped>
  .prescList {
    height: 100vh;
    background: #F9F9F9;
    overflow: hidden;
  }
  .box01{
    height: calc(100vh - 2.6em);
    padding: .4rem .4rem 0 .4rem;
    overflow: auto;
  }
  .box01::-webkit-scrollbar {/*滚动条整体样式*/

    width: .1rem;     /*高宽分别对应横竖滚动条的尺寸*/

    height: .01rem;

  }
  .box01::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
    border-radius: .1rem;
    -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
    background: #535353;
  }
  .box01::-webkit-scrollbar-track {/*滚动条里面轨道*/
    -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
    border-radius: 10px;
    background: #EDEDED;
  }
  .box01-1{
    margin-bottom: .4rem;
    border-radius: .28rem;
    position: relative;
  }
  .box01-1-1{
    width: 100%;
    height: 1.05rem;
    line-height: 1.05rem;
    font-size: .32rem;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: #333333;
    text-align: left;
  }
  .box01-1-1-1{
    width: .86rem;
  }
  .box01-1-1-2{
    width: 6rem;
  }
  .box01-1-1-3{
    width: 3rem;
    text-align: center;
  }
  .box01-1-1-4{
    float: right;
    height: 1.05rem;
  }
  .box01-1-1-com{
    float: left;
    height: 1.05rem;
  }
  .box01-1-2{
    margin: 0 .86rem;
    width: 16.5rem;
    height: .02rem;
    background: #F5F5F5;
  }
  .box01-1-3{
    height: 1.2rem;
    font-size: .26rem;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #333333;
    line-height: 1rem;
    padding-bottom: .2rem;;
  }
  .box01-1-4{
    height: .4rem;
    font-size: .18rem;
    font-family: PingFang-SC-Medium, PingFang-SC;
    font-weight: 500;
    color: #333333;
    line-height: .4rem;
  }
  .box01-1-4-1{

  }
  .box02{
    position: absolute;
    width: 19.2rem;
    height: 1rem;
    bottom: 0;
  }
  .box02-1{
    position: absolute;
    height: 1rem;
    line-height: 1rem;
    bottom: 0;
    left: 1.45rem;
    font-size: .32rem;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: #333333;
    letter-spacing: .01rem;
  }
  .box02-2{
    position: absolute;
    width: 3.84rem;
    height: 1rem;
    line-height: 1rem;
    right: 0;
    bottom: 0;
    font-size: .36rem;
    font-family: PingFang-SC-Bold, PingFang-SC;
    font-weight: bold;
    color: #FFFFFF;
    text-align: center;
  }
</style>