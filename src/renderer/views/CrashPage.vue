<template>
  <div class="container">
    <div class="content">
      <div class="" style="display:flex;align-items: center;margin: .8rem .8rem .3rem .8rem;">
        <div class="" style="width:2.49rem; height:2.29rem;margin-right:.5rem;flex-shrink: 0;">
          <img src="@/assets/images/error.png" style="width:100%;height:100%;" />
        </div>
        <div>
          <div>设备组件异常</div>
          <div>异常码：<span v-if="equipmentFault && equipmentFault.err_code">{{equipmentFault.err_code}}</span></div>
          <div>异常内容：<span v-if="equipmentFault && equipmentFault.err_msg">{{equipmentFault.err_msg}}</span></div>
        </div>
      </div>
      <div style="margin: 0 .8rem;">
        建议处理方式：<span v-if="equipmentFault && equipmentFault.err_solution_suggestion">{{equipmentFault.err_solution_suggestion}}</span>
      </div>
      <div style="display:flex;justify-content: center;">
        <!-- <div v-if="equipmentFault && equipmentFault.is_close_function_show">关闭该功能</div>
        <div v-if="equipmentFault && equipmentFault.is_reinit_show">设备初始化</div> -->
        <div v-if="equipmentFault && equipmentFault.is_close_function_show" style="padding: .1rem .2rem;background-color:#008AFF;border-radius: .2rem;margin:.5rem;font-weight:normal;color:#FFF;" @click="closeFun(equipmentFault)">关闭该功能</div>
        <div v-if="equipmentFault && equipmentFault.is_reinit_show" style="padding: .1rem .2rem;background-color:#008AFF;border-radius: .2rem;margin:.5rem;font-weight:normal;color:#FFF;" @click="initEqt(equipmentFault)">设备初始化</div>
      </div>
    </div>
    <div class="egg" @click="eggClick"></div>
    <app-mask :is-visible="showDialog">
      <admin-auth :is-visible="showDialog" @do-submit="doSubmit"></admin-auth>
    </app-mask>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import AdminAuth from '@/components/AdminAuth.vue';
import AppMask from '@/components/AppMask.vue';
import API from '@/api/local';

export default {
  name: "CrashPage",
  data(){
    return {
      showDialog: false,  
      clickIndex: 0,
      clickTimer: null,
      btnDisabled: false,
    }
  },
  components: { AppMask, AdminAuth },
  computed:{
    ...mapGetters(['equipmentFault'])  
  },
  methods:{
    doSubmit(){
      setTimeout(() => {
        this.$store.commit('setEquipmentFault', null); 
      }, 200);
      this.$router.push({name: 'home'});
    },
    eggClick(){
      if(null !== this.clickTimer) clearTimeout(this.clickTimer);
      this.clickIndex++;
      this.clickTimer = setTimeout(()=>{
        this.clickIndex = 0;
      }, 5000);
      if(this.clickIndex >= 5) {
        this.showDialog = true;
      }
    }, 
    async closeFun(data){
      if(this.btnDisabled){
        this.$toast('请等到操作执行完成!', { position: 'top' })
        return;
      }
      this.btnDisabled = true;
      try{
        if(data){
          await this.api.close_equipment_function(data);
        }
        this.btnDisabled = false;
				this.$toast(`操作成功`, { position: 'top' });
      }catch(e){
        this.$toast(`操作失败, 错误：${e.message}`, { position: 'top' })
        this.btnDisabled = false;
      }
    },
    async initEqt(data){
      if(this.btnDisabled){
        this.$toast('请等到操作执行完成!', { position: 'top' })
        return;
      }
      this.btnDisabled = true;
      try{
        await API.sendCommand({cmd:"restart", prog:["CoreService"]});
        this.btnDisabled = false;
				this.$toast(`操作成功`, { position: 'top' })
      }catch(e){
        this.$toast(`操作失败, 错误：${e.message}`, { position: 'top' })
        this.btnDisabled = false;
      }
    } 
  },
  created(){
    
  },
  mounted(){
  },
  beforeDestroy(){
    if(null !== this.clickTimer) clearTimeout(this.clickTimer);
  }
}
</script>

<style lang="scss" scoped>
  .container{
    position: relative;
    background: rgba(255,255,255,0.49) url('../assets/images/bg.png') no-repeat fixed;
    background-position-y: bottom ;
    background-size: cover;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    .content{
      width: 10rem;
      min-height: 5rem;
      background: #FFFFFF;
      border-radius: .08rem;
      opacity: 0.99;
      font-size: .32rem;
      font-family: PingFang-SC-Bold, PingFang-SC;
      font-weight: bold;
      color: #999999;
      line-height: .45rem;
      //display: flex;
      //flex-direction: column;
      //align-items: center;
    }
    .egg{
      position: absolute;
      right: 0;
      bottom: 0;
      width: 1rem;
      height: 1rem;
      opacity: 1;
      z-index: 100;
    }
  }  
</style>
