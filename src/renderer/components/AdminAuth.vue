<template>
  <div class="d-k-mask" v-show="isVisible" @click.stop="doClose">
    <div class="d-k-container" @click.stop="">
      <div class="d-k__header">
        <div class="input-box">
          <div class="inpunt-box-item" v-for="(k, idx) in displayPwd" :key="idx" :class="{star: placeholder == k}">{{k}}</div>  
        </div>  
        <div class="tip-box">请输入管理员维护密码!</div>  
        <div class="operate-box">
          <div class="op-confirm" :class="{'canSubmit': canSubmit}" @click.stop="doSubmit">确定</div>  
        </div>  
      </div>
      <div class="d-k__content">
        <div class="d-k-item" @click.stop="doClick(1)">1</div> 
        <div class="d-k-item" @click.stop="doClick(2)">2</div> 
        <div class="d-k-item" @click.stop="doClick(3)">3</div> 
        <div class="d-k-item" @click.stop="doClick(4)">4</div> 
        <div class="d-k-item" @click.stop="doClick(5)">5</div> 
        <div class="d-k-item" @click.stop="doClick(6)">6</div> 
        <div class="d-k-item" @click.stop="doClick(7)">7</div> 
        <div class="d-k-item" @click.stop="doClick(8)">8</div> 
        <div class="d-k-item" @click.stop="doClick(9)">9</div> 
        <div class="d-k-item d-k-item-btn2" @click.stop="doClick('empty')">清空</div>
        <div class="d-k-item" @click.stop="doClick(0)">0</div> 
        <div class="d-k-item d-k-item-btn" @click.stop="doClick('back')"><img src="@/assets/images/backspace.png" /></div>
      </div>
    </div>
  </div>
</template>

<script>
  import { debounce } from "../js/util";

  export default {
    name: 'AdminAuth',
    data(){
      return {
        displayPwd: '',
        hidePwd: '',
        timer2: null,
        placeholder: '*',
      }
    },
    props:{
      isVisible: {
        type: Boolean,
        default: false
      },
    },
    computed: {
			canSubmit: function(){
				return !!this.hidePwd.length;
			},
		},
    methods:{
      //关闭dialog
      doClose(){
        this.$emit('update:isVisible', false);
      },
      //输入数字
      doClick: debounce(function(inputText){
        if(this.timer2) clearTimeout(this.timer2);
        if('empty' == inputText){
          this.displayPwd = '';
          this.hidePwd = '';
        }else if('back' == inputText){
          this.hidePwd = this.hidePwd.slice(0, -1);
          let len = this.hidePwd.length;
          if(len){
            this.displayPwd = this.placeholder.repeat(len - 1) + this.hidePwd.substr(len - 1);  
          }else{
            this.displayPwd = '';
          }
        }else{
          this.hidePwd += inputText;
          this.displayPwd = this.placeholder.repeat(this.displayPwd.length) + inputText;
        }
        this.timer2 = setTimeout(() => {
          this.displayPwd = this.placeholder.repeat(this.displayPwd.length);
        }, 3000);
      }, 100),
      //提交密码
      doSubmit: debounce(async function(){
        let self = this;
        if(!self.hidePwd.length){
          self.$toast('请输入管理员密码!', { position: 'top' });
          return;  
        }
        if(self.hidePwd == self.$conf.adminDebugPassword){
          if(self.$listeners['do-submit']){
            self.$emit('do-submit');
          }else{
            self.$router.push({name: 'debug'});
          }
        }else{
          self.$toast('密码不正确!', { position: 'top' })
          self.log.log('admin pwd err');
        }
      }),
    },
  }
</script>

<style lang="scss" scoped>
  .d-k-mask{
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    .d-k-container{
      width: 4.8rem;
      //background-color: rgba(199, 255, 255, 0.8);
      background-color: rgba(66, 126, 247, 0.8);
      .d-k__header{
        position: relative;
        margin: .1rem .1rem 0 .1rem; 
        background-color: #C7E1FF;
        background-color: #FFFFFF;
        overflow: hidden;
        border-radius: 0.08rem;
        .d-k_close{
          position: absolute;
          right: 0;
          top: 0;
          width: .4rem;
          height: .4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          .image{
            width: .4rem;
            height: .4rem;
          }
        }
        .input-box{
          overflow: hidden;
          margin: 0 .2rem;
          margin-top: .3rem;
          background: #FFFFFF;
          border: .03rem solid #00BFCE;
          border-radius: .08rem;
          height: .9rem;
          font-size: .52rem;
          font-family: PingFang-SC-Bold, PingFang-SC;
          font-weight: bold;
          color: #333333;
          display: flex;
          align-items: center;
          justify-content: center;
          .inpunt-box-item{
            margin-top: .2rem;
          }
          .inpunt-box-item:last-child{
            margin-top: 0;
          }
        }
        .star{
          margin-top: .2rem !important;  
        }
        .tip-box{
          font-size: .32rem;
          font-family: PingFang-SC-Bold, PingFang-SC;
          font-weight: bold;
          color: #999999;
          text-align: center;
          margin-top: .2rem;
          margin-bottom: .3rem;
        }
        .operate-box{
          margin-bottom: .4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: .36rem;
          font-family: PingFang-SC-Bold, PingFang-SC;
          font-weight: bold;
          color: #FFFFFF;
          .op-confirm{
            width: 2.8rem;
            height: .6rem;
            background: #CCCCCC;
            border-radius: .5rem;
            line-height: .6rem;
            text-align: center;
          }
          .canSubmit{
            background:#41bbff;
          }
        }
      }
      
      .d-k__content{
        display: flex;
        flex-wrap: wrap;
        padding: .05rem;
        .d-k-item{
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: .24rem;
          font-weight: 600;
          height: .8rem;
          margin: .05rem;
          width: calc(calc(100% / 3) - .1rem);
          background-color: #FCFDFE;
          text-align: center;
          border-radius: .08rem;
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
          font-size: 14px;
          color: #666666;
        }
      }
    }
  }
</style>