<template>
  <div class="fault">
    <top-nav @right-button="clickRightButton" :title-text="pageName" :remaining="3600" :show-left-button="true" :show-right-button="true"></top-nav>
    <div class="container">
      <div class="block2">
        <div class="item2 item2-1" :class="{'active': !!badgeObj.SlotFaultStatus}" @click="viewFault('slot')">
          <img class="item2-image" src="@/assets/images/fault-1.png" />
          <div>故障药道</div>
        </div>
        <div class="item2 item2-2" :class="{'active': !!badgeObj.CheckerResourceStatus}" @click="viewFault('drugImage')">
          <img class="item2-image" src="@/assets/images/fault-2.png" />
          <div>复核图片故障</div>
        </div>
        <div class="item2 item2-3" :class="{'active': !!badgeObj.ProductLack}" @click="viewFault('equipmentFault')">
          <img class="item2-image" src="@/assets/images/fault-3.png" />
          <div>设备故障</div>
        </div>
        <div class="item2 item2-4" :class="{'active': !!badgeObj.ProductExpired}" @click="viewFault('stock')">
          <img class="item2-image" src="@/assets/images/fault-4.png" />
          <div>库存预警</div>
        </div>
        <div class="item2 item2-5" :class="{'active': !!badgeObj.EquipmentError}" @click="viewFault('expired')">
          <img class="item2-image" src="@/assets/images/fault-5.png" />
          <div>有效期预警</div>
        </div>
      </div>
      <div>
      </div>
    </div>
    
  </div>
</template>

<script>
  import { debounce } from "@/js/util";
  import { mapGetters } from 'vuex';

  export default {
    name: "fault",
    data(){
      return {
        pageName:"设备故障信息",
      }
    },
    components: {},
    computed:{
      ...mapGetters(['noticeList']),
      badgeObj: function(){
        let obj = {};
        this.noticeList.map(item => {
          if(this.$conf.faultTypeCodeLabel.hasOwnProperty(item.error_type_code)) obj[this.$conf.faultTypeCodeLabel[item.error_type_code]] = true;
          return item;
        });
        return obj;
      },
    },
    methods:{
      clickRightButton(){
        this.$router.push({name: 'admin'});
      },
      viewFault: debounce(function(name){
        this.$router.push({ name });  
      }),
    },
    async mounted(){
      
    },
    async beforeDestroy(){
    }
  }
</script>

<style lang="scss" scoped>
  .fault {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100vh;
    background: rgba(255,255,255,0.49) url('../../assets/images/bg.png') no-repeat fixed;
    background-position-y: bottom ;
    background-size: contain;
    font-family: PingFangSC-Medium, PingFang SC;
    .container{
      height: calc(100vh - 1.2rem);
      display: flex;
      justify-content: center;
      flex-direction: column;
      min-height: 4.6rem;
      .block2{
        display: flex;
        width: 100%;
        justify-content: center;
        margin: .2rem 0;
        .active{
          position: relative;
        }
        .active::after{
          position: absolute;
          top: 0;
          left: 0;
          width: .8rem;
          height: .8rem;
          content: "";
          background: url('../../assets/images/fault-active.png') no-repeat;
          background-size: cover;
        }
        .item2{
          width: 2.45rem;
          height: 1.8rem;
          border-radius: .2rem;
          font-weight: 500;
          margin: 0 .2rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: .32rem;
          font-weight: 500;
          color: #FFFFFF;
        }
        .item2-1{
          background-color: #E69165;
        }
        .item2-2{
          background-color: #307FF5;
        }
        .item2-3{
          background-color: #1EBFB5;
        }
        .item2-4{
          background-color: #F0C441;
        }
        .item2-5{
          background-color: #7166E6;
        }
        .item2-image{
          width: .75rem;
          height: .75rem; 
          margin-bottom: .15rem;
        }
      }
    }
  }
</style>