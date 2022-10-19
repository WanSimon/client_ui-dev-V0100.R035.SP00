<template>
  <div class="faceRecognition">
    <top-nav :title-text="pageName" :remaining="180" :show-left-button="false" :show-right-button="true"></top-nav>
    <div class="box02"></div>
    <div class="scan"></div>
    <div class="box01" style="border:.05rem solid rgba(115,222,255,.5);">
      <img v-show="!!img_src" style="width: 100%;height: 100%" alt="" :src="img_src" />
      <!-- <canvas id="divPic" style="width: 100%;height: 100%;display: block;" ></canvas> -->
      <div v-show="face_success" class="box06">
        <div class="box07"></div>
        <div  class="box08">识别成功</div>
      </div>
    </div>
    <div class="box04">
      <img class="photo" :src="photo" alt="" />
    </div>
    <div class="box03" @click="$router.push('/home')">取消</div>
  </div>
  <!--<someComponent></someComponent>-->
</template>

<script>
  import {audioPlay} from "../js/util";
  export default {
    name: "faceRecognition",

    data(){
      return {
        photo:"",
        img_src:"",
        recognitionResult: false, //人脸识别结果
        pageName:"人脸识别",
        width:0,
        height:0,
        step:0,
        last_buffer:null,
        face_success:false,
        picFree: true,
        currentPath: this.$route.path,
      }
    },
    component: {
    },
    methods:{
      toSelfHelp(){
        this.$router.push('/idcard');
      },
      onNotify(){
        this.api.on_notify_facematch_video = async msg => {
          if(!msg.facematchinfo || !msg.facematchinfo.data) return;
          this.img_src = msg.facematchinfo.data;
          if(msg.facematchinfo.is_result == 1 && !this.recognitionResult){
            this.recognitionResult = true;
            if(this.api.mode === 2){
              //进入维护模式
              try{
                let op_account_id = this.$route.params.op_account_id;
                await this.api.start_maintenance_mode(op_account_id);
                this.api.mode = 3;
                this.face_success = true;
                setTimeout(()=>{
                  if(this.currentPath == this.$route.path) this.$router.push({name: 'admin',params:{op_account_id:this.$route.params.op_account_id}});
                },1000);
              }catch (e){
                this.log.error('进入维护模式失败',e)
              }
            } else if(this.api.mode === 1){
              //正常模式
              if(this.$route.params.type=='pickupCode'){
                this.face_success = true;
                setTimeout(()=>{
                  if(this.currentPath == this.$route.path) this.$router.push({name: 'pickupCode'});
                },1000);
              }else {
                this.face_success = true;
                setTimeout(()=>{
                  if(this.currentPath == this.$route.path) this.$router.push({name: 'productList'});
                },1000);
              }
            }
          }
        };
      },
      showPicture(data,width,height,step){
        if(!width || !height || !step) return;
        function getDataPosition(x,y)
        {
          return y*step+x*3;
        }
        function getImagePosition(x,y){
          return y*width*4+x*4;
        }
        let c = document.getElementById("divPic");
        //创建image对象
        c.width = width;
        c.height = height;
        let ctx = c.getContext("2d");
        let imgData = ctx.createImageData(width, height);

        for (let y = 0; y < height; y ++) {
          for(let x=0;x<width;x++){
            let posImage=getImagePosition(x,y);
            let posData=getDataPosition(x,y);
            imgData.data[posImage+0]=data[posData+2];
            imgData.data[posImage+1]=data[posData+1];
            imgData.data[posImage+2]=data[posData+0];
            imgData.data[posImage+3]=255;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        data = null;
      }
    },
    async mounted(){
      audioPlay(__static +'/请调整姿势进行人脸识别.mp3');
      let photo = this.$route.params.photo;
      this.photo = 'data:image/png;base64,'+ photo;
      this.onNotify();
      //人脸识别请求
      try{
        let data = await this.api.facematch_video(photo,1,this.$conf.faceScore,0);
      }
      catch (e){
        this.log.error('face match video failed!e=%s',e);
      }

    },
    async destroyed(){
      this.last_buffer = null;
      this.api.on_notify_face_blob = null;
      this.api.on_notify_facematch_video = null;
      //停止人脸识别
      try {
        await this.api.stop_facematch_video();
      }
      catch (e){
        this.log.error('停止人脸识别失败',e);
      }
    }
  }
</script>

<style scoped>
  .faceRecognition {
    height: 100vh;
  }
  .box01{
    position: absolute;
    left: 2rem;
    bottom: 1.4rem;
    width: 8rem;
    height: 6rem;
  }
  .scan{
    z-index: 100;
    position: absolute;
    left: 2rem;
    bottom: 1.4rem;
    width: 8rem;
    height: 6rem;
    background: linear-gradient(#03a9f4, #03a9f4), linear-gradient(90deg, #ffffff33 1px, transparent 0, transparent 19px), linear-gradient(#ffffff33 1px, transparent 0, transparent 19px), linear-gradient(transparent, #2196f3);
    background-size: 100% 1.5%, 10% 100%, 100% 10%, 100% 100%;
    background-repeat: no-repeat, repeat, repeat, repeat;
    background-position: 0 0, 0 0, 0 0, 0 0;
    clip-path: polygon(0% 0%, 100% 0%, 100% 1.5%, 0% 1.5%);
    animation: move 2s linear infinite;
  }
  @keyframes move {
    to{
      background-position: 0 100%, 0 0, 0 0, 0 0;
      clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
    }
  }

  .box02 {
    position: absolute;
    bottom: 0;
    background: url(../assets/back02.png) 0 0  no-repeat;
    background-size:100% auto;
    width: 100%;
    height: 6.35rem;
  }
  .box03{
    position: absolute;
    left: 11.5rem;
    bottom: 1.4rem;
    width:4.8rem;
    height:1.1rem;
    background:linear-gradient(90deg,rgba(115,222,255,1) 0%,rgba(63,186,255,1) 100%);
    border-radius:.65rem;
    font-size:.38rem;
    font-family:PingFang-SC-Medium,PingFang-SC;
    font-weight:500;
    color:rgba(255,255,255,1);
    line-height:1.1rem;
    letter-spacing:2px;
    text-align: center;
  }
  .box04{
    position: absolute;
    left: 11.91rem;
    top: 2.4rem;
    width: 4rem;
    height: 5rem;
    background:rgba(255,255,255,1);
    text-align: center;
  }
  .photo{
    margin-top:1.2rem;
    width: 2.6rem;
    height: 3.64rem;
  }
  .box06{
    position: absolute;
    top: 2.5rem;
    width: 100%;
    height: 1rem;
    background:rgba(255,255,255,1);
    text-align: center;
    z-index: 100;
  }
  .box07{
    position: absolute;
    left: 2.7rem;
    top:.25rem;
    background: url(../assets/icon_success.png) 0 0  no-repeat;
    background-size:100% auto;
    width: .5rem;
    height: .5rem;
  }
  .box08{
    position: absolute;
    left: 3.45rem;
    height: 1rem;
    line-height: 1rem;
    font-weight:500;
    color:rgba(85,210,101,1);
    font-size:.4rem;
  }
</style>
