<template>
  <div class="container">
    <div class="content">
      <div class="logo">
        <img src="../assets/love2x.png" style="width:100%;height:100%" />
      </div>
      <div class="company">心药数字智慧药房</div>
      <div class="init">正在连接机械结构串口</div>
      <div class="wait">请稍等片刻…</div>
      <div class="copyright">&copy;未来健康医疗科技（苏州）有限公司保留所有权利</div>
    </div>
    <div class="egg" @click="addClickIndex()"></div>
    <!-- 管理员输入密码退出app -->
    <app-quit :is-visible.sync="showDialog"></app-quit>
  </div>
</template>

<script>
  import AppQuit from '@/components/AppQuit.vue';

  export default {
    name: 'start',
    data () {
      return {
        timer: null,
        clickIndex: 0,
        showDialog: false,
        timer2: null,
        currentPath: this.$route.path,
      }
    },
    components:{ AppQuit },
    methods:{
      addClickIndex(){
        if(this.timer2) clearTimeout(this.timer2);
        this.clickIndex++;
        this.timer2 = setTimeout(()=>{
          this.clickIndex = 0;
        }, 5000);
        if(this.clickIndex > 5) {
          this.showDialog = true;
          this.clickIndex = 0;
        }
      },
    },
    async mounted(){
      //清空购物篮
      this.$store.dispatch("empty");

      this.timer = setInterval( async()=>{
        try {
          let data = await this.api.get_init_status();
          if(data && data.hasOwnProperty('network_status') && data.hasOwnProperty('equipment_status') && data.hasOwnProperty('programe_status')){
            if(data.network_status ==1 && data.equipment_status == this.api.DeviceStatus.Normal && data.programe_status == 1){
              this.log.log('device init success.');
              if(this.currentPath == this.$route.path) this.$router.push({name: 'home', params: {'log': `page timer event [mounted], page name [start]`}});
            }else{
              this.log.error('device init fail',data);
            }
          }
        }catch (e){
          this.log.error('获取设备状态失败,',e);
        }
      }, 2000);
    },

    async destroyed(){
      if(this.timer) clearInterval(this.timer);
    }
  }
</script>

<style lang="scss" scoped>
  .container{
    height: 100vh;
    background-color: #4A90E2;
    background-image: url('../assets/love.png');
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-size: 8.53rem 7.04rem;
    background-position: 0 1.88rem;
    .content{
      padding-left: 10.92rem;
      font-family: PingFang-SC-Regular, PingFang-SC;
      color: #FFFFFF;
      .logo{
        padding-top: 2.2rem;
        width: 1.60rem;
        height: 1.17rem;
      }
      .company{
        font-family: PingFangSC-Semibold, PingFang SC;
        font-size: .42rem;
        font-weight: 600;
        line-height: .59rem;
        letter-spacing: 2px;
        padding-top: .33rem;
      }
      .init{
        font-size: .24rem;
        font-weight: 400;
        line-height: .33rem;
        padding-top: 2.82rem;
      }
      .wait{
        font-size: .24rem;
        font-weight: 400;
        line-height: .33rem;
        padding-top: .1rem;
      }
      .copyright{
        font-size: .24rem;
        font-weight: 400;
        line-height: .33rem;
        padding-top: .6rem;
      }
    }
  }
  .egg{
    position: fixed;
    right: 0rem;
    bottom: 0rem;
    width: 1rem;
    height: 1rem;
    z-index: 1000;
  }
</style>
