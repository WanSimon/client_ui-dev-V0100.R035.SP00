<template>
  <div class="idcard">
    <top-nav :title-text="pageName" :remaining="180" :show-left-button="false" :show-right-button="true"></top-nav>
    <div class="box01"></div>
    <div class="box03">请将身份证放置在扫描区域内</div>
  </div>
</template>

<script>
  import {audioPlay} from "../js/util";
  export default {
    name: "idcard",
    data(){
      return {
        pageName: "身份验证",
        reading:false,
      }
    },
    async mounted(){
      audioPlay(__static +'/请将身份证放置在扫描区域内.mp3');
      try{
        await this.api.read_idcard();
        this.reading = true;
      }catch (e){
        this.log.error('read idcard failed!e=',e);
      }

      // setTimeout(() => {
      //   this.$router.push({ name: 'customerProductList' });
      //   //this.$router.push({ name: 'productList' });
      // }, 5000);

      this.api.on_notify_read_idcard = async (body)=>{
        //(0:成功;1:开始读取;2:读取中;3:用户终止读取;-8:连接身份证读卡器异常;-65535:程序未初始化;-1:其他)
        if(body && body.status == 0){
          await this.stopReadIdcard();
          this.reading = false;
          //base64数据
          let photo = body.idcardinfo.photo;
          let idcard = body.idcardinfo.idcardno;
          //存储操作人信息
          this.$store.dispatch("addAccount",{photo,idcard});
          //维护模式
          if(this.api.mode === 2){
            //校验设备管理员身份
            try{
              let eqt_admin = await this.api.get_equipment_admin({ id_card: idcard });
              let op_account_id = eqt_admin.account_info.id;
              this.api.mode = 3;
              //存储操作人信息
              this.$store.dispatch("addAdminAccount",{photo,idcard,op_account_id});
              //设置模式
              await this.api.start_maintenance_mode(op_account_id);

              this.$router.push({
                name: 'admin',
                params: {op_account_id}
              })
            }catch (e){
              //todo 提示框
              this.log.error('设备管理员身份验证失败',e);
            }
          }
          //正常模式
          else if(this.api.mode === 1){
            let openFaceRecongnition = (this.$store.state.systemConf.hasOwnProperty('faceRecognition')) ? this.$store.state.systemConf.faceRecognition : this.$conf.faceRecognition;
            if(openFaceRecongnition){
              //开启了人脸识别
              this.$router.push({
                name: 'faceRecognition',
                params: {photo,idcard,type:this.$route.params.type}
              });
            }else{
              //关闭了人脸识别
              if('pickupCode' == this.$route.params.type){
                this.$router.push({ name: 'pickupCode' });
              }else{
                this.$router.push({ name: 'productList' }); 
              }
            }
          }
        }
      };
    },
    methods:{
      async stopReadIdcard(){
        try{
          await this.api.stop_read_idcard();
        }catch (e){
          this.log.error('stop read idcard failed!e=',e);
        }
      }
    },
    async beforeDestroy(){
      this.api.on_notify_read_idcard = null;
      if(this.reading) this.stopReadIdcard();
    }
  }
</script>

<style scoped>
  .idcard {
    height: 100vh;
    background: #FFFFFF url('../assets/images/bg.png') no-repeat fixed;
    background-position-y: bottom ;
    background-size: contain;
  }
  .box01 {
    position: absolute;
    left: 6.98rem;
    top: 3.98rem;
    background: url(../assets/idcard02.png) 0 0  no-repeat;
    background-size:100% auto;
    width: 5.24rem;
    height: 4.09rem;
  }
  .box03 {
    position: absolute;
    top:3.1rem;
    text-align: center;
    width: 100%;
    font-size:.38rem;
    font-family:PingFang-SC-Medium,PingFang-SC;
    font-weight:500;
    color:rgba(51,51,51,1);
    line-height:.53rem;
  }
</style>
