<template>
  <div class="container">
    <top-nav @right-button="clickRightButton" :title-text="pageName" :show-left-button="true" :show-right-button="false"></top-nav>
    <div class="header">
      <div class="item" style="width: 1rem;flex-grow:0;">
        <el-checkbox class="el-custom" v-model="allSelected" @change="selectAll()"></el-checkbox>
      </div>
      <div class="item" style="width: 20px;">药道号</div>
      <div class="item" style="width: 25px;">层|列</div>
      <div class="item" style="width: 30px;">故障原因</div>
      <div class="item" style="width: 25px;">故障时间</div>
      <div class="item" style="width: 20px;">操作</div>
    </div>
    <div class="content">
      <div class="slot-card" v-for="item in listData" :key="item.slot">
        <div class="item" style="width: 1rem;flex-grow:0;">
          <el-checkbox class="el-custom" v-model="item.checked" @change="selectOne(item)"></el-checkbox>
        </div>
        <div class="item" style="width: 20px;">{{item.slot_no}}</div>
        <div class="item" style="width: 25px;">{{item.y}}层{{item.x}}列</div>
        <div class="item" style="width: 30px;">{{$conf.slotNoFaultCode[item.fault_code] || item.fault_code}}</div>
        <div class="item" style="width: 25px;">{{item.fault_time | dateFormat}}</div>
        <div class="item" style="width: 20px;" @click="resolve(item)">
          <div class="btn">处理</div>
        </div>
      </div>
      <div class="empty">
        <div v-show="0 == loaded">数据加载中</div>
        <div v-show="2 == loaded">加载失败, <span style="font-weight:600;" @click="reload">点击重新加载</span></div>
        <div v-show="(1 == loaded) && !listData.length">暂无数据</div>
      </div>
    </div>
    <div class="footer">
      <div class="btn" :class="{'btn-disabled': btnDisabled.batchResolve}" @click="batchResolve">批量处理</div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
   name: "slotNo",
    data(){
      return {
        pageName: "故障药道",
        allSelected: false,
        listData: [],
        loaded: 0,
        btnDisabled: { batchResolve: true }
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
        this.$router.back(-1);
      },
      selectAll(){
        let self = this;
        this.listData.map(item => {
          self.$set(item, 'checked', self.allSelected);
        });
        this.$set(this.btnDisabled, 'batchResolve',  !self.allSelected);
      },
      selectOne(item){
        let len = this.listData.filter(it => it.checked);
        if(!item.checked){
          this.allSelected = false;
        }else{
          this.allSelected = len.length === this.listData.length;
        }
        this.$set(this.btnDisabled, 'batchResolve',  !len.length);
      },
      async resolve(item){
        try{
          let slot_no = [item.slot_no];
          await this.api.remove_fault_drug_channel(slot_no);
          this.listData = this.listData.filter(it => it.slot_no != item.slot_no);
        }catch(e){
          this.log.error(e);
        }
      },
      async batchResolve(){
        let self = this;
        if(self.btnDisabled.batchResolve) return;
        self.$set(self.btnDisabled, 'batchResolve',  true);
        try{
          let selected = [];
          self.listData.map(item => {
            if(item.checked) selected.push(item.slot_no)
          });
          if(!selected.length) return;
          await self.api.remove_fault_drug_channel(selected);
          self.listData = self.listData.filter(it => !selected.includes(it.slot_no));
          self.$set(self.btnDisabled, 'batchResolve',  false);
        }catch(e){
          self.$set(self.btnDisabled, 'batchResolve',  false);
          self.log.error(e);
        }
      },
      async loadData(){
        try{
          let self = this;
          let data = await self.api.query_fault_drug_channel();
          self.listData = data.fault_slot_list || [];
          if(Array.isArray(self.listData) && !self.listData.length) self.$store.commit('addNotice', [{error_type_code: self.$conf.slotErrorTypeCode, error_flag: 0}]);
          self.loaded = 1;
        }catch(e){
          this.loaded = 2;
          this.log.error(e);
        }
      },
      reload(){
        this.loaded = 0;
        this.loadData();
      },
    },
    async created(){
      this.loadData();
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
    }
    .slot-card:nth-child(odd){
      background-color: #f4f5f6;
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