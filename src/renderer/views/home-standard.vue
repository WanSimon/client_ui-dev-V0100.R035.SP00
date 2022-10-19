<template>
  <div class="container">
    <div class="header">
      <div class="location">
        <img class="image" src="@/assets/images/location.png" />
        <div class="address">{{addr}}</div>  
      </div> 
      <div class="equipment">
        <div class="temperature" v-show="temperature">
          <img src="@/assets/images/temperature.png" /> 
          <span>{{temperature | dataFormat('&#8451;')}}</span>
        </div> 
        <div class="humidity" v-show="humidity">
          <img src="@/assets/images/humidity.png" /> 
          <span>{{humidity | dataFormat('%')}}</span>
        </div> 
      </div> 
    </div> 
    <div class="title">
      <div class="title1">欢迎使用智慧药房</div>
      <div class="title2">Welcome To Intelligent Pharmacy</div>
    </div>
    <div class="content">
      <div class="item">
        <img class="image" src="@/assets/self_help.png" @click="toSelfHelp('selfHelp')" /> 
        <div class="text">自购取药</div>  
      </div> 
      <div class="item">
        <img class="image" src="@/assets/scan.png" @click="toSelfHelp('pickupCode')" /> 
        <div class="text">扫码取药</div>  
      </div> 
    </div>
    <div class="position1"></div>
    <div class="position2" @click.stop="addClickIndex"></div>
    <!-- <div class="position3">
      <div class="text1">苏州心药数字智慧医疗科技有限公司</div>
      <div class="text2">XinYao Digital Intelligent Healthcare Technology Co,Ltd</div>
    </div> -->
    <div class="position4" v-show="noticeList.length" @click.stop="noticeVisible=true"><img style="width:100%;height:100%;" src="@/assets/images/home_warning.png" /></div>
    <div class="mask" v-show="noticeVisible">
      <div class="notice-container">
        <div style="height:1.5rem;flex-shrink:0;"></div>
        <div class="notice-content">
          <div class="notice-item" v-for="(item, idx) in noticeList" :key="idx">{{item.error_content}}</div>
          <div class="notice-empty" v-show="!noticeList.length">暂无数据</div>
        </div>
        <div class="notice-footer" @click.stop="noticeVisible=false">我知道了</div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  export default {
    name: "home",
    data(){
      return {
        clickIndex:0,
        timer:null,
        noticeVisible: false,
      }
    },
    computed:{
      ...mapGetters(['addr', 'temperature', 'humidity', 'noticeList'])
    },
    filters: {
      dataFormat(msg, suffix='') {
        if('' == msg || null === msg || undefined === msg) return '';
        return `${msg}${suffix}`;
      }
    },
    created(){
      let self = this;
      self.$store.commit('reduceNotice');
      //此事件销毁页面时无需置为null
      // self.api.on_notify_reminder_fault_exist = body => {
      //   if(Array.isArray(body.equipment_fault_list) && body.equipment_fault_list.length) self.$store.commit('addNotice', body.equipment_fault_list);
      // }
      //每1分钟检查一次noticeList
      const timer = setInterval(() => {
        self.$store.commit('reduceNotice');
      }, 60000);
      self.$once("hook:beforeDestroy", () => { 
        clearInterval(timer);
      });
    },
    async mounted(){
      //清空购物篮
      this.$store.dispatch("empty");
      if(this.api.mode == 3){
        // 退出维护模式
        try{
          await this.api.stop_maintenance_mode();
        }catch (e){
          this.log.error('[Home Page]退出维护模式失败', e);
        }
      }
      //还原状态
      this.api.mode = 1;
    },
    methods:{
      toSelfHelp(type){
        this.$router.push({name:'idcard', params:{type}});
        //this.$router.push({name:'admin'});
      },
      //点击3下进入维护模式（未认证）
      toMode2(){
        this.api.mode = 2;
        this.$router.push('/idcard');
      },
      addClickIndex(){
        if(this.timer) clearTimeout(this.timer);
        this.clickIndex++;
        this.timer = setTimeout(()=>{
          this.clickIndex = 0;
        }, 5000);
        if(this.clickIndex>5) this.toMode2();
      },
    },
    async destroyed(){
      if(this.timer) clearTimeout(this.timer);
    }
  }
</script>

<style lang="scss" scoped>
  .container{
    position: relative;
    background: #4A90E2 url('../assets/images/bg.png') no-repeat fixed;
    background-position-y: bottom ;
    background-size: contain;
    min-height: 100vh;
    .header{
      display: flex;
      padding: .2rem .4rem .2rem .32rem;
      justify-content: space-between;
      align-items: center;
      .location{
        display: flex;
        color: #FFFFFF;
        align-items: center;
        img{
          width: .5rem;
          height: .5rem;
        }
        .address{
          height: .45rem;
          line-height: .45rem;
          font-size: .32rem;
          font-family: PingFang-SC-Medium, PingFang-SC;
          font-weight: 500;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
      .equipment{
        display: flex;
        font-size: .36rem;
        font-family: HelveticaNeue;
        color: #FFFFFF;
        line-height: .43rem;
        .temperature{
          display: flex;
          align-items: center;
          img{
            width: .5rem;
            height: .5rem;
          }
        }
        .humidity{
          display: flex;
          align-items: center;
          margin-left: .28rem;
          img{
            width: .5rem;
            height: .5rem;
          }
        }
      }
    }
    .title{
      padding-top: 1rem;
      padding-bottom: .87rem;
      text-align: center;
      .title1{
        font-size: .8rem;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
        color: #F9F9F9;
        line-height: 1.12rem;
        letter-spacing: 8px;
      }
      .title2{
        font-size: .36rem;
        font-family: PingFang-SC-Medium, PingFang-SC;
        font-weight: 500;
        color: #F9F9F9;
        line-height: .5rem;
        letter-spacing: 8px;
        opacity: .99;
        margin-top: .12rem;
      }
    }
    .content{
      display: flex;
      margin: 0 3.4rem;
      justify-content: space-between;
      justify-content: space-around;
      .item{
        display: flex;
        align-items: center;
        flex-direction: column;
        .image{
          width: 2.8rem;
          height: 2.82rem;
        }
        .text{
          font-size: .42rem;
          font-family: PingFangSC-Semibold, PingFang SC;
          font-weight: 600;
          color: #FFFFFF;
          line-height: .59rem;
          letter-spacing: .04rem;
          text-align: center;
          margin-top: .3rem;
        }
      } 
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
    .position2{
      position: absolute;
      right: 0;
      bottom: .5rem;
      width: 1rem;
      height: 1rem;
      opacity: 1;
      z-index: 100;
    }
    .position3{
      position: absolute;
      bottom: .3rem;
      left: .4rem;
      .text1{
        font-size: .28rem;
        font-family: PingFang-SC-Medium, PingFang-SC;
        font-weight: 500;
        color: #FFFFFF;
        line-height: .4rem;
        letter-spacing: 1px;
      }
      .text2{
        padding-top: .1rem;
        font-size: .2rem;
        font-family: PingFang-SC-Medium, PingFang-SC;
        font-weight: 500;
        color: #FFFFFF;
        line-height: .28rem;
        letter-spacing: 1px;
      }
    }
    .position4{
      position: fixed;
      bottom: .6rem;
      left: .6rem;
      width: 2.09rem;
      height: 1.25rem;
    }
    .mask{
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      .notice-container{
        width: 5rem;
        background: url('../assets/images/notice_bg.png') no-repeat;
        background-position-y: top;
        background-size: 5rem auto;
        max-height: 5rem;
        display: flex;
        flex-direction: column;
        .notice-content{
          flex-grow: 1;
          min-height: 1rem;
          overflow-y: auto;
          .notice-item{
            font-size: .24rem;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #999999;
            line-height: .33rem;
            padding: 0 .5rem 0 .7rem;
            margin-bottom: .1rem;
            position: relative;
          }
          .notice-item::before{
            position: absolute;
            content: "";
            left: .5rem;
            top: 50%;
            width: .06rem;
            height: .06rem;
            margin-top: -.03rem;
            background: #999999;
            border-radius: 50%;
          }
          .notice-empty{
            margin-top: .2rem;
            font-size: .24rem;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #999999;
            line-height: .33rem;
            padding: 0 .5rem 0 .5rem;
            text-align: center;
          }
        }
        .notice-footer{
          margin-top: .4rem;
          flex-shrink: 0;
          padding: .2rem 0;
          font-size: .28rem;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #FF6633;
          line-height: .4rem;
          text-align: center;
          border-top: 1px solid #D8D8D8;
        }
      }
    }
  }
</style>
