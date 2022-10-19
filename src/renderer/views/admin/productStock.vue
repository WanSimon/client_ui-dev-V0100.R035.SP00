<template>
  <div class="container">
    <top-nav @right-button="clickRightButton" :title-text="pageName" :show-left-button="true" :show-right-button="false" :clearRemain="true"></top-nav>
    <div class="header">
      <div style="width:.8rem; flex-shrink:0;">序号</div>
      <div class="item" style="width: 10px;">药品名</div>
      <div class="item" style="width: 30px;">预警原因</div>
      <div class="item" style="width: 1rem;flex-shrink:0;">预警时间</div>
    </div>
    <div class="content">
      <div class="slot-card" v-for="(item, idx) in listData" :key="idx">
        <div style="width:.8rem; flex-shrink:0;">{{idx + 1}}</div>
        <div class="item" style="width: 10px;">{{item.product_name}}</div>
        <div class="item" style="width: 30px;">{{item.content}}</div>
        <div class="item" style="width: 1rem;flex-shrink:0;">{{item.start_time | dateFormat}}</div>
      </div>
      <div class="empty">
        <div v-show="0 == loaded">数据加载中</div>
        <div v-show="2 == loaded">加载失败, <span style="font-weight:600;" @click="reload">点击重新加载</span></div>
        <div v-show="(1 == loaded) && !listData.length">暂无数据</div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
   name: "drugImage",
    data(){
      return {
        pageName: "药品库存预警",
        listData: [],
        loaded: 0,
        btnDisabled:{ resolve:true },
      }
    },
    filters: {
      dateFormat(timestamp) {
        if(isNaN(Number(timestamp))) return '-';
        timestamp = Number(timestamp);
        if(-1 !== String(timestamp).indexOf('.')){
          timestamp = timestamp * 1000;
        }
        return moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
      }
    }, 
    methods:{
      clickRightButton(){
        this.$router.push({name: 'fault'});
      },
      async loadData(){
        let self = this;
        try{
          let data = await self.api.query_equipment_warning('lack_warning_kind_product');
          self.listData = data.warning_info_list || [];
          self.loaded = 1;
        }catch(e){
          self.loaded = 2;
          self.log.error(e);
        }
      },
      reload(){
        this.loaded = 0;
        this.loadData();
      },
    },
    async created(){
      let self = this;
      try{
        if(!self.$store.state.equipmentInfo || !self.$store.state.equipmentInfo.equipment_product_info){
          let info = await this.api.get_equipment_info();
          if(info.equipment_info){
            self.$store.commit("addEquipmentInfo", info.equipment_info);
          } 
        }
        await self.loadData();
      }catch(e){
        self.log.error('productStock page created err, ', e);
      }
    },
    mounted(){
      let self = this;
      // this.api.on_notify_update_checker_photo = body => {
      //   body = body || {};
      //   let idx = this.listData.findIndex(item => item.barcode == body.barcode);
      //   if(-1 !== idx){
      //     this.$set(this.listData[idx], 'status', '1');
      //     this.$forceUpdate();
      //   }
      // }
    },
    beforeDestroy(){
      //this.api.on_notify_update_checker_photo = null;
    },
}
</script>

<style lang="scss" scoped>
.el-custom /deep/ .el-checkbox__inner{
  height: .28rem;
  width: .28rem;
  border-color: #979797;
}
.el-custom /deep/ .el-checkbox__inner::after{
  top: .05rem;
  left: .1rem;
  width: 4px;
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
.container{
  font-size: .24rem;
  color: #333333;
  display: flex;
  flex-direction: column;
  background: rgba(255,255,255,0.49) url('../../assets/images/bg.png') no-repeat fixed;
  background-position-y: bottom ;
  background-size: contain;
  height: 100vh;
  .header{
    font-weight: 600;
    height: .6rem;
    text-align: center;
    background: #E7EFFD;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    .item{
      flex-grow: 1;
    }
  }
  .content{
    flex-grow: 1;
    //background-color: #FFFFFF;
    overflow-y: auto;
    .slot-card{
      display: flex;
      align-items: center;
      text-align: center;
      padding: .1rem 0;
      background-color: #FFF;
      .item{
        flex-grow: 1;
        .btn{
          margin: 0 auto;
          width: 1.2rem;
          background: #FFFFFF;
          border-radius: .3rem;
          border: .02rem solid #4A90E2;
          font-size: .2rem;
          color: rgba(74, 144, 226, 1);
          line-height: .4rem;
        }
      }
      .status1{
        color: #4A90E2;
      }
    }
    .slot-card:nth-child(odd){
      background-color: rgba(104,105,105,.15);
    }
    .empty{
      margin: .2rem;
      text-align: center;
      color: #808080;
    }
  }
  .footer{
    height: .8rem; 
    flex-shrink:0;
    background:#EEEEEE;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .btn{
      width: 2.2rem;
      line-height: .8rem;
      background: #4A90E2;
      font-size: .36rem;
      font-weight: bold;
      color: #FFFFFF;
      text-align: center;
    }
    .btn-disabled{
      background-color: #979797;
    }
  }
}
</style>