<template>
  <div class="verifyProduct">
    <top-nav @remind-patient="remindPatient" :title-text="pageName" :remaining="180" :show-left-button="false" :show-right-button="true"></top-nav>
    <div class="container">
      <div class="table-head">
        <table>
          <colgroup>
            <col style="width: 20%" />
            <col style="width: 65%" />
            <col style="width: 15%" />
          </colgroup>
          <thead>
          <tr>
            <th style="text-align: left;">药品缩略图</th>
            <th style="text-align: left;">药品名称</th>
            <th>数量</th>
          </tr>
          </thead>
        </table>
      </div>
      <div class="line"></div>
      <div class="table-body">
        <table>
          <colgroup>
            <col style="width: 20%" />
            <col style="width: 65%" />
            <col style="width: 15%" />
          </colgroup>
          <tbody>
          <tr v-for="item,index in list" :key="index">
            <td style="text-align:left;">
              <img v-if="item.home_thumb" class="product-img" :src="$conf.resource + item.home_thumb" />
            </td>
            <td class="text-left">{{item.product_name}}</td>
            <td>{{item.product_count}}</td>
          </tr>
          </tbody>
        </table>
      </div>
      <div class="line"></div>
      <div class="table-foot">
        <table>
          <colgroup>
            <col style="width: 85%" />
            <col style="width: 15%" />
          </colgroup>
          <thead>
          <tr>
            <td class="text-left">种类：{{list.length}}</td>
            <td>总数：{{count}}</td>
          </tr>
          </thead>
        </table>
      </div>
      <div class="service">客服：{{phone}}</div>
      <div class="closeDoor" @click="closeDoor()">取药完毕，请关闭仓门</div>
    </div>

    <div class="box02"></div>
  </div>
</template>

<script>
  import {mapGetters} from "vuex";
  import {audioPlay} from "../js/util";
  export default {
    name: "verifyProduct",
    computed:{
      ...mapGetters(['phone'])
    },
    data(){
      return {
        pageName: "核对药品信息",
        payVisible:false,
        list:[],
        count:0,
        isDoorClose:true
      }
    },
    methods:{
      async remindPatient(){
        let self = this;
        try{
          let data = await self.api.is_drug_take_away();
          if('0' != data.status){
            audioPlay(__static + '/请尽快取走所购买的药品.mp3');
          }
        }catch(e){
          self.log.error('remindPatient error, ', e);
        }
      },
      async closeDoor(){
        try{
          await this.api.closeDoor();
          this.isDoorClose = true;
          this.$router.push({name: 'home', params: {'log': `page click event [closeDoor], page name [${this.pageName}]`}});
        }
        catch (e){
          this.log.error('关闭舱门失败！',e);
        }
      }
    },
    async mounted(){
      audioPlay(__static +'/请取走您的小票并核对您所购买的药品.mp3');
      this.list = this.$route.params.list||[];
      let data = [];
      try{
        data = await this.api.get_equipment_product();
      }catch(e){
        this.log.error('get_equipment_product error, ', e);
      }
      this.list.map((item)=>{
        this.count+=item.product_count;
        if(data.slot_product_list_info && Array.isArray(data.slot_product_list_info)){
          let idx = data.slot_product_list_info.findIndex((product) => {
            if(product.merchant_product_info){
              return item.merchant_product_id == product.merchant_product_info.merchant_product_id
            }
            return false;
          });
          if(-1 !== idx) this.$set(item, 'home_thumb', data.slot_product_list_info[idx].merchant_product_info.product_info.home_thumb);  
        }
      });

      await this.api.openDoor();
      this.isDoorClose = false;
    },

    async destroyed(){
      if(!this.isDoorClose) {
        try{
          await this.api.closeDoor();
        }
        catch (e){
          this.log.error('关闭舱门失败！',e);
        }
      }
    }
  }
</script>

<style scoped>
  .verifyProduct {
    height: 100vh;
    font-family:PingFang-SC-Medium,PingFang-SC;
  }
  .container{
    box-sizing: border-box;
    margin: 0 2.2rem;
    padding-top:.5rem;
  }
  .table-head table, .table-body table, .table-foot table{
    width: 96%;
    margin: 0 auto;
    text-align: center;
    border-collapse:separate;
    border-spacing:0 .15rem;
    table-layout: fixed;
  }

  .table-body{
    margin-top: .3rem;
    overflow-y: auto;
    max-height: 3.5rem;  /* TODO 高度根据实际情况自己确定 */
  }
  .table-body table tr td{
    color: #303133;
    font-size: .28rem;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .table-head table thead tr th{
    font-size: .32rem;
    font-weight: 600;
    color: #303133;
  }
  .table-foot table tr td{
    font-size: .32rem;
    font-weight: 600;
    color: #303133;
  }
  .line{
    height: .2rem;
    border-bottom: 1px #cecece dashed;
  }
  .text-left{
    text-align: left;
  }

  .box02 {
    position: absolute;
    bottom: 0;
    background: url(../assets/back02.png) 0 0  no-repeat;
    background-size:100% auto;
    width: 100%;
    height: 6.35rem;
    z-index: -1;
  }
  .highlight-color{
    color: #FF5D2B;
  }
  .service{
    position: absolute;
    bottom: 1rem;
    left: 4.3rem;
    width:4.8rem;
    height:1.1rem;
    background:rgba(255,255,255,1);
    border:.04rem solid;
    border-radius:.65rem;
    font-size:.36rem;
    font-weight:500;
    color:rgba(63,186,255,1);
    text-align: center;
    line-height: 1.1rem;
  }
  .closeDoor{
    position: absolute;
    bottom: 1rem;
    right: 4.3rem;
    width:4.8rem;
    height:1.1rem;
    background:linear-gradient(90deg,rgba(115,222,255,1) 0%,rgba(63,186,255,1) 100%);
    border-radius:.65rem;
    font-size:.36rem;
    font-weight:500;
    color:rgba(255,255,255,1);
    text-align: center;
    line-height: 1.1rem;
  }
  .product-img{
    width: .8rem;
    height: .8rem;
    display: inline-block;
    margin-right: .2rem;
    box-sizing: border-box;
  }
</style>
