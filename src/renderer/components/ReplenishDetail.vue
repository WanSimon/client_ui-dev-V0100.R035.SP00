<template>
  <div class="container">
    <div class="header">{{titleTxt}}</div>
    <div class="content">
      <div class="tab">
        <div class="item" :class="{'active': currentTab == 'drug'}" @click.stop="changeTab('drug')">按药品</div>
        <div class="item" :class="{'active': currentTab == 'slot'}" @click.stop="changeTab('slot')">按药道</div>
      </div>
      <div class="hd">
        <div class="index">{{currentTab == 'slot' ? '药道号' : '序号'}}</div>
        <div class="product">药品</div>
        <div class="image">图片</div>
        <div class="stock">补货前数量</div>
        <div class="stock">补货数量</div>
      </div>  
      <div class="list">
        <div class="item" v-for="(item, idx) in listData" :key="idx">
          <div class="index">{{currentTab == 'slot' ? item.slot_no : (idx + 1)}}</div>
          <div class="product">
            <template v-if="currentTab == 'drug'">
              <a href="javascript:;" @click="viewProduct(item)">{{item.name}}</a>
            </template>
            <template v-else>
              <span>{{item.name}}</span>
            </template>
          </div>
          <div class="image">
            <img style="width: .5rem;height: auto;margin: 0 auto;" :src="$conf.resource+item.home_thumb">
          </div>
          <div class="stock">{{item.real_stock}}</div>
          <div class="stock">{{item.actual_number}}</div> 
        </div> 
        <div class="empty" v-show="!listData.length">暂无数据</div> 
      </div>
    </div>
    <div class="footer">
      <div class="cancel" @click.stop="confirmReject">{{cancelTxt}}</div>
      <div v-if="$listeners['confirm-resolve']" class="confirm" @click.stop="confirmResolve">{{confirmTxt}}</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ReplenishDetail',
    data(){
      return {
        currentTab: 'drug' ,
        searchData: '', 
      }
    },
    props:{
      isVisible: {
        type: Boolean,
        default: false,
      },
      originData: {
        type: Array,
        default: ()=>[],
      },
      cancelTxt: {
        type: String,
        default: '取消',
      },
      confirmTxt: {
        type: String,
        default: '确认',
      },
      titleTxt: {
        type: String,
        default: '上次补货详情',
      },
    },
    computed:{
      listData: function(){
        let data = JSON.parse(JSON.stringify(this.originData));
        if('slot' == this.currentTab) {
          if(this.searchData){
            data = data.filter(item => item.merchant_product_id == this.searchData);
          }
          return data;
        }
        return data.reduce((prev, current) => {
          let idx = prev.findIndex(item => item.merchant_product_id == current.merchant_product_id);
          if(-1 === idx) return [...prev, current];
          prev[idx].real_stock += current.real_stock;
          prev[idx].actual_number += current.actual_number;
          return prev;
        }, []);
      },
    },
    methods:{
      changeTab(tab){
        this.currentTab = tab;
        this.searchData = '';
      },
      viewProduct(item){
        this.currentTab = 'slot';
        this.searchData = item.merchant_product_id;
      },
      //取消
      confirmReject(){
        this.$emit('update:isVisible', false);  
      },
      //确认
      confirmResolve(){
        let self = this;
        if(self.$listeners['confirm-resolve']){
          self.$emit('confirm-resolve');
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  .container{
    width: 75vw;
    height: 80vh;
    background: #FFFFFF;
    border-radius: .28rem;
    display: flex;
    flex-direction: column;
    .header{
      height: 1rem;
      flex-shrink: 0;
      font-size: .4rem;
      font-family: PingFang-SC-Medium, PingFang-SC;
      font-weight: 600;
      color: #333333;
      line-height: 1rem;
      text-align: center;
      border-bottom: 1px solid rgba(128, 128, 128, 0.1);
    }
    .content{
      flex-grow: 1;
      font-size: .28rem;
      font-family: PingFang-SC-Medium, PingFang-SC;
      font-weight: 500;
      display: flex;
      flex-direction: column;
      .tab{
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        font-size: .36rem;
        padding: .1rem 0;
        .item{
          padding: .1rem .3rem;
        }
        .active{
          color: #3FBAFF;
        }
      }
      .hd{
        padding: 0 .3rem;
        flex-shrink: 0;
        font-weight: 600;
        border-bottom: 1px dashed #cecece;
        padding: .2rem;
        display: flex;
        text-align: center;
        .index{
          width: 15%;
          flex-shrink: 0;
        }
        .product{
          width: 5%;
          flex-grow: 1;
        }
        .image{
          width: 1rem;
          flex-shrink: 0;
        }
        .stock{
          width: 20%;
          flex-shrink: 0;
        }
      }
      .list{
        padding: 0 .3rem;
        font-size: .28rem;
        overflow-y: auto;
        margin: .1rem 0;
        .item{
          display: flex;
          align-items: center;
          text-align: center;
          padding: .1rem 0;
          .index{
            width: 15%;
            flex-shrink: 0;
          }
          .image{
            width: 1rem;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .product{
            width: 5%;
            flex-grow: 1;
          }
          .stock{
            width: 20%;
            flex-shrink: 0;
          }
        }
        .item:nth-child(odd){
          background-color: #f4f5f6;
        }
        .empty{
          text-align: center;
          padding: .3rem 0;
          color: red;
        }
      }
    }
    .footer{
      padding: .3rem;
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      font-size: .36rem;
      font-family: PingFang-SC-Medium, PingFang-SC;
      font-weight: 500;
      border-top: 1px solid rgba(128, 128, 128, 0.1);
      .confirm{
        width: 2.8rem;
        height: .7rem;
        color: #FFFFFF;
        background: linear-gradient(90deg, #73DEFF 0%, #3FBAFF 100%);
        border-radius: .65rem;
        box-sizing: border-box;
        line-height: .7rem;
        text-align: center;
        margin: 0 .3rem;
      }
      .cancel{
        width: 2.8rem;
        height: .7rem;
        color: #3FBAFF;
        background: #FFFFFF;
        border: .04rem solid;
        border-radius: .65rem;
        box-sizing: border-box;
        line-height: .7rem;
        text-align: center;
        margin: 0 .3rem;
      }
    }
  }
</style>