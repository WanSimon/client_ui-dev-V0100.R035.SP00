<template>
  <div class="container">
    <div class="header">
      <div class="logo">
        <img class="image1"  src="@/assets/images/logo1.png" />
        <img class="image2"  src="@/assets/images/logo2.png" />
      </div>
      <div class="equipment">
        <div class="temperature" v-show="temperature">
          <img src="@/assets/images/temperature.png" /> 
          <span>{{temperature | dataFormat('&nbsp;&#8451;')}}</span>
        </div> 
        <div class="humidity" v-show="humidity">
          <img src="@/assets/images/humidity.png" /> 
          <span>{{humidity | dataFormat('&nbsp;%')}}</span>
        </div>
        <div class="clock">
          <span id="clock">{{clock}}</span>  
        </div> 
      </div> 
    </div> 
    <div class="title">
      <div class="title1">欢迎使用发热门诊药房</div>
      <div class="title2">Welcome to the fever clinic pharmacy</div>
    </div>
    <div class="content">
      <div class="item">
        <img class="image" src="@/assets/self_help.png" @click="toSelfHelp('selfHelp')" />
        <div class="text">自购药</div>   
      </div>
      <div class="item">
        <img class="image" src="@/assets/images/id_card.png" @click="toSelfHelp('idcard')" /> 
        <div class="text">身份证取药</div>  
      </div>  
      <div class="item">
        <img class="image" src="@/assets/images/medical_card.png" @click="toSelfHelp('medical')" />  
        <div class="text">医保卡取药</div>   
      </div>  
      <div class="item">
        <img class="image" src="@/assets/images/electronic_card.png" @click="toSelfHelp('electronic')" />
        <div class="text">二维码取药</div>   
      </div>  
    </div> 
    <div class="position1"></div>
    <div class="position2" @click.stop="addClickIndex"></div>
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

    <app-mask :is-visible="appMaskVisible">
      <div class="admin-form">
        <div class="form-type" @click.stop="switchLogin"></div>
        <div class="form-tips">扫描身份证登录</div>
        <div class="form-legend">管理员账号登录</div>
        <div class="form-control">
          <!-- <div class="form-label">管理帐号</div> -->
          <div class="form-input account">
            <input class="input" @focus.stop="onFocus({target: $event.target, key: 'account_login_id'})" v-model="admin.account_login_id" type="text" placeholder="请输入管理员帐号" /> 
          </div>
        </div>
        <div class="form-control">
          <!-- <div class="form-label">管理密码</div> -->
          <div class="form-input password">
            <input class="input" @focus.stop="onFocus({target: $event.target, key: 'account_pwd'})" v-model="admin.account_pwd" type="password" placeholder="请输入管理员密码" /> 
          </div>
        </div>
        <div class="form-actions">
          <div class="btn-cancel" @click.stop="closeLogin">取消</div>
          <div class="btn-confirm" @click.stop="doLogin">确定</div>
        </div>
      </div>
    </app-mask>
    <full-Keyboard :option="keyboardOption" @key-value="getInputValue" @close="closeFullKeyboard"></full-Keyboard>
  </div>
</template>

<script>
import AppMask from '@/components/AppMask.vue';
import FullKeyboard from '@/components/FullKeyboard.vue';
import { debounce } from "../js/util";
import { mapGetters } from 'vuex';
import md5 from 'js-sha1';
import mixin from '@/mixins/mixin';

export default {
  name: "home",
  data(){
    return {
      clickIndex:0,
      timer:null,
      noticeVisible: false,
      appMaskVisible: false,
      admin:{
        account_login_id: '',
        account_pwd: '',
      },
      keyboardOption: {
        show: false,
        sourceDom: '',
        status: 0
      },
      keyboardItem: '',
      keyboardTarget: '',
      loginFlag: false,
      salt: 'xysz',
      clock: '',
    }
  },
  mixins: [ mixin ],
  components: { FullKeyboard, AppMask },
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
      //this.$router.push({name:'prescCheck', params:{ list: [], all: [], code: '123456' }});
      //this.$router.push({name:'scan', params:{ type }});
      if('selfHelp' == type){
        this.$router.push({name:'idcard', params:{type}});
        //this.$router.push({name:'verifyProduct'});
        //this.$router.push({
        //  name: 'admin',
        //  params: {op_account_id : 'xxxxxxxx'}
        //})
      }else{
        const name = {
          idcard: 'ScanIdcard',  
          medical: 'ScanMedicalCard',  
          electronic: 'ScanQrcode',  
        };
        this.$router.push({ name: name[type] });
      }
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
      if(this.clickIndex>5) {
        this.appMaskVisible = true;
        //this.toMode2();
      }
    },
    //关闭管理员登录框
    closeLogin(){
      this.appMaskVisible = false;
      this.admin = { account_login_id: '', account_pwd: '' };
      this.clickIndex = 0;
    },
    //管理员帐号密码登录
    doLogin: debounce(async function(){
      let self = this;
      if(self.loginFlag) return;
      self.loginFlag = true;
      try{
        if(!self.admin.account_login_id || !self.admin.account_pwd){
          self.$toast('请输入正确的帐号密码', { position: 'top' });
          self.loginFlag = false;
          return;
        }
        let eqt_admin = await self.api.get_equipment_admin({ account_login_id: self.admin.account_login_id, account_pwd: md5(`${self.admin.account_pwd}${self.salt}`) });
        let op_account_id = eqt_admin.account_info.id;
        //设置模式
        await self.api.start_maintenance_mode(op_account_id);
        self.api.mode = 3;
        //存储操作人信息
        self.$store.dispatch("addAdminAccount",{photo: '', idcard: '', op_account_id});
        self.loginFlag = false;
        self.$router.push({
          name: 'admin',
          params: {op_account_id}
        })
      }catch(e){
        self.loginFlag = false;
        self.log.error('admin login err, e = %s', e.message);
        self.$toast('登录失败!', { position: 'top' })
      }
    }),
    //管理员验证身份证登录
    switchLogin: debounce(function(){
      this.api.mode = 2;
      this.$router.push('/idcard');
    }),
    //触发键盘
    onFocus({target, key}){
      this.keyboardTarget = target;
      this.keyboardItem = key; 
      this.$set(this.keyboardOption, 'show', true);
      this.$set(this.keyboardOption, 'sourceDom', target);
    },
    //关闭全键盘
    closeFullKeyboard(){
      this.$set(this.keyboardOption, 'show', false);  
    },
    //全键盘输入
    getInputValue(val) {
      if(!this.keyboardTarget || !this.keyboardItem) return;
      let doc = this.keyboardTarget;
      doc.focus();
      var startPos = doc.selectionStart;
      var endPos = doc.selectionEnd;
      let txt = this.admin[this.keyboardItem];
      let inputTxt = '';
      if(val === 'delete'){
        if(startPos != endPos){
          inputTxt = txt.substring(0, startPos) + txt.substring(endPos);
        }else{
          inputTxt = txt.substring(0, startPos - 1) + txt.substring(endPos); 
        }
      }else{
        inputTxt = txt.substring(0, startPos) + val + txt.substring(endPos)
      }
      this.$set(this.admin, this.keyboardItem, inputTxt); 
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
      height: 1.2rem;
      box-sizing: border-box;
      justify-content: space-between;
      align-items: center;
      background: #FFFFFF;
      opacity: 0.5;
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
          font-weight: 600;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
      .logo{
        display: flex;
        position: relative;
        align-items: center;
        .image{
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          right: 0;
          width: 2.68rem;
          height: .75rem;  
        }
        .image1{
          width: .7rem;
          height: .57rem; 
        }
        .image2{
          width: 1.55rem;
          height: .36rem; 
          margin-left: .22rem;
        }
      }
      .equipment{
        display: flex;
        font-size: .34rem;
        font-family: PingFang-SC-Bold, PingFang-SC;;
        color: #0d54e8;
        font-weight: bold;
        line-height: .48rem;
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
        .clock{
          margin-left: .4rem;
        }
      }
    }
    .title{
      padding-top: 1rem;
      padding-bottom: .87rem;
      text-align: center;
      .title1{
        font-size: .8rem;
        font-family: PingFang-SC-Bold, PingFang-SC;
        font-weight: 600;
        color: #F9F9F9;
        line-height: 1.12rem;
        letter-spacing: 8px;
      }
      .title2{
        font-size: .36rem;
        font-family: PingFang-SC-Bold, PingFang-SC;
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
          width: 2.1rem;
          height: 2.115rem;
          animation: mymove 5s infinite;
          animation-direction: alternate;
          animation-timing-function: ease-in-out;
        }
        @keyframes mymove{
          0%{
            transform: scale(1);
          }
          25%{
            transform: scale(1.1);
          }
          50%{
            transform: scale(1);
          }
          75%{
            transform: scale(1.1);
          }
        }
        .text{
          font-size: .46rem;
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
      bottom: 0;
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
  .admin-form{
    font-family: PingFang-SC-Medium, PingFang-SC;
    padding: .2rem .7rem;
    font-size: .24rem;
    margin-top: -30vh;
    background-color: #FFFFFF;
    border-radius: .08rem;
    position: relative;
    .form-legend{
      font-weight: 600;
      padding: .1rem;
      text-align: center;
      margin-bottom: .2rem;
      margin-top: .15rem;
      font-size: .28rem;
      color: #333333;
      line-height: .4rem;
    }
    .form-control{
      margin: .1rem;
      display: flex;
      align-items: center;
      .form-label{
        margin-right: .15rem;
      }
      .form-input{
        flex-grow: 1;
        position: relative;
        .input{
          padding: .16rem .2rem .16rem .54rem;
          width: 4.6rem;
          box-sizing: border-box;
          font-size: .2rem;
          background: #E8F0FE;
          border: none;
          border-radius: .08rem;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #333333;
          line-height: .28rem;
          position: relative;
        }
        .input::-webkit-input-placeholder{
          background: #E8F0FE;
        }
      }
      .account::before{
        position: absolute;
        content: "";
        top: 0;
        left: 0;
        bottom: 0;
        width: .5rem;
        z-index: 2;
        background: url('../assets/images/admin-account.png') no-repeat center center;
        background-size: .2rem .22rem;
      }
      .password::before{
        position: absolute;
        content: "";
        top: 0;
        left: 0;
        bottom: 0;
        width: .5rem;
        z-index: 2;
        background: url('../assets/images/admin-pwd.png') no-repeat center center;
        background-size: .2rem .22rem;
      }
    }
    .form-type{
      width: .85rem;
      height: .85rem;
      position: absolute;
      right: 0;
      top: 0;
      background: url('../assets/images/20210928.png') no-repeat 100% 0;
      background-size: 100%;
    }
    .form-tips{
      width: 1.11rem;
      height: .26rem;
      position: absolute;
      right: .72rem;
      top: .17rem;
      font-size: .12rem;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #1677FF;
      line-height: .26rem;
      text-align: center;
      background: url('../assets/images/20210929.png') no-repeat 100% 0;
      background-size: 100%;
    }
    .form-actions{
      margin: .5rem 0 .2rem 0;
      display: flex;
      align-items: center;
      justify-content: space-around;
      font-size: .3rem;
      .btn-confirm{
        color: #FFFFFF;
        background: #4A90E2;
        border-radius: .4rem;
        text-align: center;
        width: 2rem;
        height: .6rem;
        border: .02rem solid #4A90E2;
        line-height: .6rem;
      }
      .btn-cancel{
        color: #4A90E2;
        background: #FFFFFF;
        border-radius: .4rem;
        box-sizing: border-box;
        text-align: center;
        width: 2rem;
        height: .6rem;
        border: .02rem solid #4A90E2;
        line-height: .6rem;
      }
    }
  }
</style>
