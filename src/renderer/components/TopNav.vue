<template>
  <div class="nav-header">
    <div class="fixed-placeholder" v-if="isFixed"></div>
    <div class="top-nav" :class="{'is-fixed': isFixed}">  
      <div class="right-button" @click="rightButton">
        <div class="right-image">
          <img src="@/assets/images/back.png" style="width:100%;height:100%;display:block;" />   
        </div>
        <div class="right-text">
          返回<span v-if="!clearRemain">({{remainingTime}}s)</span>
        </div>
      </div>
      <div class="title-text">{{titleText}}</div>
      <div class="right-button">
        <span>{{clock}}</span>
      </div>
    </div>
  </div>
</template>
<script>
  import mixin from '@/mixins/mixin';

  export default{
    name: 'TopNav',
    data () {
      return {
        timer: null,
        remainingTime: 180,
        unload: false,
      }
    },
    props:{
      //nav title
      titleText: {
        type: String,
        default: '身份验证'
      },
      //是否显示左侧返回按钮
      showLeftButton: {
        type: Boolean,
        default: false
      },
      //是否显示右侧home按钮
      showRightButton: {
        type: Boolean,
        default: true
      },
      //nav是否fixed
      isFixed: {
        type: Boolean,
        default: false
      }, 
      //倒计时
      remaining: {
        type: Number,
        default: 180,
      }, 
      //是否清除倒计时
      clearRemain: {
        type: Boolean,
        default: false,
      },
    },
    mixins: [ mixin ],
    mounted(){
      let self = this;
      self.remainingTime  = self.remaining;
      if(self.showRightButton){
        let remindPatient = self.$conf.remindPatient.map(item => {
          item = +item || 0;
          if(item) return self.remaining - item;
          return 0;
        }).filter(item => item > 0);
        self.timer = setInterval(() => {
          if(self.unload){
            clearInterval(self.timer);
            return;
          }
          self.remainingTime--;
          if(remindPatient.includes(self.remainingTime) && self.$listeners['remind-patient']) self.$emit('remind-patient');
          if(self.remainingTime <= 0){
            if(!self.unload) self.$router.push({name: 'home', params: {'log': `nav timer event, page title [${this.titleText}]`}});
          }
        }, 1000);
        self.$once("hook:beforeDestroy", () => { self.log.info('hook:beforeDestroy: top nav destroy'); clearInterval(self.timer); });
      }
    },
    watch:{
      clearRemain(val) {
        if(val){
          this.timer && clearInterval(this.timer);
        }
      }
    },
    methods:{
      leftButton(){
        let self = this;
        if(self.$listeners['left-button']){
          self.$emit('left-button');
        }else{
          self.$router.back(-1);
        }
      }, 
      rightButton(){
        let self = this;
        if(self.$listeners['right-button']){
          self.$emit('right-button');
        }else{
          self.$router.push({name: 'home', params: {'log': `nav click event [goHome], page name [${self.titleText}]`}})
        }
      },
    },
    beforeDestroy(){
      this.unload = true;
      if(this.timer) clearInterval(this.timer);
    }
  }
</script>

<style lang="scss" scoped>
  .nav-header{
    flex-shrink: 0;
    text-align: center;
    background-color: #4A90E2;
    height: 1.2rem;
    padding: 0 .37rem;
  }
  .fixed-placeholder{
    height: 1.2rem;
  }
  .nav-header .is-fixed{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2;
    height: .45rem;
    padding: .2rem;
    background-color: #4A90E2;
  }
  .top-nav{
    display: flex; 
    align-items: center; 
    justify-content: center;
    z-index: 2;
    position: relative;
    height: 1.2rem;
    justify-content: space-between;
  }
  .top-nav .left-button{
    flex-shrink: 0;
    width: .5rem;
    height:.5rem;
    z-index: 3;
  }
  .top-nav .right-button{
    flex-shrink: 0;
    width: auto;
    height:.5rem;
    z-index: 3;
    display: flex;
    align-items: center;
    font-size: .34rem;
    font-family: PingFang-SC-Bold, PingFang-SC;
    color: rgba(255,255,255,1);
  }
  .right-button .right-image{
    flex-shrink: 0;
    width: .36rem;
    height:.3rem;
  }
  .right-button .right-text{
    flex-shrink: 0;
    margin-left: .1rem;
    font-size: .36rem;
    font-family: PingFang-SC-Bold, PingFang-SC;
    font-weight: 500;
    color: rgba(255,255,255,1);
    //line-height: .50rem;
    letter-spacing: 1px;
  }
  .title-text{
    position: absolute;
    left: 50%;
    top: 0;
    margin-left: -25%;
    width: 50%;
    height: 1.20rem;
    background: #4A90E2;
    text-align: center;
    font-size:.60rem;
    font-family: PingFang-SC-Bold, PingFang-SC;
    font-weight: bold;
    color:rgba(255,255,255,1);
    line-height: 1.20rem;
    letter-spacing:2px;
    flex-grow: 1;
    text-overflow:ellipsis;
    white-space:nowrap;
    overflow:hidden;
  }
</style>