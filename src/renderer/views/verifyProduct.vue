<template>
  <div class="verifyProduct">
    <top-nav @remind-patient="remindPatient" :title-text="pageName" :remaining="180" :show-left-button="false" :show-right-button="true"></top-nav>
    <div class="container">
      <div class="table-head">
        <table>
          <colgroup>
            <col style="width: 15%" />
            <col style="width: 45%" />
            <col style="width: 15%" />
            <col style="width: 10%" />
            <col style="width: 15%" />
          </colgroup>
          <thead>
          <tr>
            <th>药品缩略图</th>
            <th style="text-align: left;">药品名称</th>
            <th>单价</th>
            <th>数量</th>
            <th>金额</th>
          </tr>
          </thead>
        </table>
      </div>
      <div class="line"></div>
      <div class="table-body">
        <table>
          <colgroup>
            <col style="width: 15%" />
            <col style="width: 45%" />
            <col style="width: 15%" />
            <col style="width: 10%" />
            <col style="width: 15%" />
          </colgroup>
          <tbody>
          <tr v-for="item,index in cartData.cartProduct" :key="index">
            <td style="text-align:left;">
              <img v-if="item.merchant_product_info.product_info.home_thumb" class="product-img" :src="$conf.resource + item.merchant_product_info.product_info.home_thumb" />
            </td>
            <td class="text-left">{{item.merchant_product_info.product_info.name}}</td>
            <td>&yen;{{item.merchant_product_info.price | moneyParse}}</td>
            <td>{{item.cartNum}}</td>
            <td>&yen;{{item.merchant_product_info.price * item.cartNum | moneyParse}}</td>
          </tr>
          </tbody>
        </table>
      </div>
      <div class="line"></div>
      <div class="table-foot">
        <table>
          <colgroup>
            <col style="width: 45%" />
            <col style="width: 15%" />
            <col style="width: 15%" />
            <col style="width: 25%" />
          </colgroup>
          <thead>
          <tr>
            <td class="text-left">种类：{{cartData.cartProduct.length}}</td>
            <td></td>
            <td>总数：{{cartData.cartProductCount}}</td>
            <td style="text-align: right;padding-right: 1rem">
              <div>合计：<span class="highlight-color">&yen;{{cartData.cartProductPrice | moneyParse}}</span></div>
            </td>
          </tr>
          </thead>
        </table>
      </div>
      <div class="service">客服：{{phone}}</div>
      <div class="closeDoor" @click="closeDoor()">取药完毕，请关闭仓门</div>
    </div>
  </div>
</template>

<script>
  import {audioPlay} from "../js/util";
  import { mapGetters } from 'vuex';
  export default {
    name: "verifyProduct",
    computed:{
      ...mapGetters(['phone'])
    },
    data(){
      return {
        pageName: "核对药品信息",
        payVisible:false,
        cartData:{
          cartProduct:[],
          cartProductCount:0,
          cartProductPrice:0
        },
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
        let self = this;
        try{
          let data = await self.api.is_drug_take_away();
          if('0' != data.status){
            audioPlay(__static + '/请尽快取走所购买的药品.mp3');
            return;
          }
        }catch(e){
          self.log.error('检测是否有漏药失败, err=%s', e.message);
        }
        try{
          audioPlay(__static +'/关舱门请注意.mp3');
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
      this.cartData = this.$store.state.cartData||{cartProduct:[],
          cartProductCount:0,
          cartProductPrice:0};
      this.cartData.cartProduct = this.cartData.cartProduct.filter(item=>item.cartNum>0);

      //打开舱门
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
    background: rgba(255,255,255,0.49) url('../assets/images/bg.png') no-repeat fixed;
    background-position-y: bottom ;
    background-size: cover;
  }
  .container{
    box-sizing: border-box;
    margin: 0 .8rem;
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
