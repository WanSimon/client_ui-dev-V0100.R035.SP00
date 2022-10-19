<template>
  <div class="product-list">
    <top-nav @right-button="clickRightButton" :title-text="pageName" :remaining="180" :show-left-button="false" :show-right-button="true"></top-nav>
    <div class="container">
      <div class="left">
        <ul>
          <li :class="{'active':category=='all'}" @click="switchCategory('all')">全部药品分类</li>
          <li v-for="item in categoryList" :key = "item.id" @click="switchCategory(item.id)" :class="{'active':category==item.id}" >{{item.name}}</li>
        </ul>
      </div>
      <div class="right">
        <div class="search" style="font-size: .2rem; color:red; text-align:center;">
          <div class="search-input">
            <div class="search-image"></div>
            <input class="search-txt" v-model="search_txt" readonly  @click.stop="keyVisible =!keyVisible" placeholder="请输入需要查找的药品名首字母" type="text"/>
            <div class="search-btn" @click="search()">查询</div>
            <div v-show="keyVisible" id="keyboard" @click.stop="" class="dv-keyboard">
              <div v-for="key in keys" class="key" :key="key"  @click="inputKey(key)">{{key==0?"0":key}}
                <div class="del" v-if="key==0"></div>
              </div>
            </div>
          </div>
          <div @click="cartVisible = !cartVisible" class="cart-image">
            <div v-show="cartData.cartProductCount>0" style="position: absolute;width: .3rem;height: .3rem;background: #FF5C2A;left: .4rem;color:#fff;border-radius: 50%;">
              {{cartData.cartProductCount}}
            </div>
          </div>
        </div>
        <div class="content">
          <section class="item" v-for="item in productData" :key="item.merchant_product_info.merchant_product_id">
            <div v-show="(item.real_stock - (item.lock_stock||0))<1" class="shadowSold"></div>
            <div class="badge">
              <div class="b-item" style="background:#41BBFF" v-show="item.merchant_product_info.product_type == 1 || item.merchant_product_info.product_type == 3 || item.merchant_product_info.product_type == 5 || item.merchant_product_info.product_type == 6">医保药</div>
              <div class="b-item" style="background:#7DD741" v-show="item.merchant_product_info.product_type == 2 || item.merchant_product_info.product_type == 4">非医保药</div>
              <div class="b-item" style="background:#FF5C2A" v-show="item.merchant_product_info.product_type == 3 || item.merchant_product_info.product_type == 4">处方药</div>
              <div class="b-item" style="background:#03D8A2" v-show="item.merchant_product_info.product_type == 5 || item.merchant_product_info.product_type == 7">甲类非处方</div>
              <div class="b-item" style="background:#F8B923" v-show="item.merchant_product_info.product_type == 6 || item.merchant_product_info.product_type == 8">乙类非处方</div>
            </div>
            <img class="img"
                  @click="getInfo(item)"
                  :src="$conf.resource+item.merchant_product_info.product_info.home_thumb" />
            <p class="title">{{item.merchant_product_info.product_info.name}}</p>
            <p class="price">
              <span class="original highlight-color">&yen;{{item.merchant_product_info.price | moneyParse}}</span>
              <span class="member">会员价：&yen;{{item.merchant_product_info.customer_price | moneyParse}}</span>
              <span v-show="item.cartNum>0" class="reduce" @click="reduceCart(item)"></span>
              <span v-show="item.cartNum>0" class="num">{{item.cartNum || 0}}</span>
              <span class="add" @click ="addCart(item)" ></span>
            </p>
          </section>
        </div>
      </div>
      <div class="mask" v-show="cartVisible">
        <div class="close-cart" @click="cartVisible = false"></div>
        <div class="cart">
          <div class="cart-container">
            <div class="cart-header">
              <div class="cart-header-title">已选商品</div>
              <div class="cart-header-action">
                <span class="cart-empty" @click="clearCart()">清空</span>
              </div>
            </div>
            <div class="cart-content">
              <div class="cart-product-item" v-show = "cartData.cartProduct.length!==0" v-for="item in cartData.cartProduct" :key="item.merchant_product_id">
                <div class="product-info">
                  <section>
                    <img class="product-img" :src="$conf.resource+item.merchant_product_info.product_info.home_thumb" />
                  </section>
                  <hgroup>
                    <p style="height: .4rem;line-height: .4rem; font-size: .24rem; color: #303133;overflow: hidden;">
                      {{item.merchant_product_info.product_info.name}}
                    </p>
                    <p style="height: .4rem;line-height: .4rem;overflow: hidden;">
                      <span style="color: #FF5C2A; font-size: .18rem;">&yen;{{item.merchant_product_info.price | moneyParse}}</span>
                      <span style="color: #909399; font-size: .16rem;">会员价：&yen;{{item.merchant_product_info.customer_price | moneyParse}}</span>
                    </p>
                  </hgroup>
                </div>
                <div class="product-action">
                  <span class="product-action-reduce" @click="reduceProduct(item)"></span>
                  <span>{{item.cartNum}}</span>
                  <span class="product-action-add" @click="addProduct(item)"></span>
                </div>
              </div>
              <div v-show = "cartData.cartProduct.length===0">
                <div class="dv-cart-empty" ></div>
                <div class="dv-cart-empty-font">购物车里什么也没有~</div>
              </div>
            </div>
            <div class="product-summary" v-show = "cartData.cartProduct.length!==0">
              <div style="font-size: .22rem;">共 <span class="highlight-color">{{cartData.cartProductCount}}</span> 件商品</div>
              <div style="text-align: right;font-size: .22rem;">
                <p style="font-size: .28rem;">合计： &yen;{{cartData.cartProductPrice | moneyParse}}</p>
                <p style="font-size: .22rem;">会员价：<span class="highlight-color">&yen; {{cartData.cartProductCustomerPrice | moneyParse}}</span></p>
              </div>
            </div>
            <div class="cart-footer" :class="{'cart-footer-disable':cartData.cartProductCount==0}"  @click="submitOrder">提交订单</div>
          </div>
        </div>
      </div>
      <div class="mask" v-show="infoVisible">
        <div class="close-cart" @click="infoVisible = false"></div>
        <div class="dv-info">
          <div class="close" @click="infoVisible = false"></div>
          <div class="img-info" id ="img_info">
            <img v-for="item in selProduct.merchant_product_info.product_info.image_list"
                  class="img-item"
                  :src="$conf.resource+item.id"
                  :key = "item.id"/>
          </div>
          <div class="alert-cancel" @click="infoVisible = false">返回</div>
          <div class="alert-confirm" @click ="addCart(selProduct)"  >加入购物车</div>
        </div>
      </div>
    </div>
    <app-mask :is-visible="appMaskVisible">
      <app-confirm :is-visible.sync="appMaskVisible" :message-text="confirmMessage"></app-confirm>
    </app-mask>
  </div>
</template>

<script>
  import _ from 'lodash';
  import {audioPlay} from "../js/util";
  import AppMask from '@/components/AppMask.vue';
  import AppConfirm from '@/components/AppConfirm.vue';

  export default {
    name: "productList",
    filters:{
    },
    data(){
      return {
        appMaskVisible: false,
        confirmMessage: '您确定要放弃购买吗？',
        keyVisible:false,
        keys:'QWERTYUIOPASDFGHJKLZXCVBNM0',
        pageName: "药品列表",
        //购物车中数据
        cartData:{
          cartProduct: [],
          //购物篮总商品数
          cartProductCount:0,
          //购物篮商品总价
          cartProductPrice:0,
          //购物篮商品会员总价
          cartProductCustomerPrice:0,
        },
        allProduct:[],
        //药品列表
        productData: [],
        //购物车是否可见
        cartVisible: false,
        //
        categoryList:[],
        category:'all',
        search_txt:"",
        alertVisible:false,
        infoVisible:false,
        selProduct:{
          merchant_product_info:{
            product_info:{
              image_list:[]
            }
          }
        }
      }
    },
    components:{
      AppMask, AppConfirm
    },
    methods:{
      //nav 组件中的回到首页按钮
      clickRightButton(){
        let self = this;
        self.appMaskVisible = true;
      },
      clearCart(){
        this.cartData={
          cartProduct: [],
            //购物篮总商品数
            cartProductCount:0,
            //购物篮商品总价
            cartProductPrice:0,
            //购物篮商品会员总价
            cartProductCustomerPrice:0,
        };
        this.allProduct.map((item)=>{item.cartNum = 0});
        this.productData.map((item)=>{item.cartNum = 0});
      },
      getInfo(selProduct){
        this.selProduct = selProduct;
        this.infoVisible = true;
        this.$nextTick(()=>{
          document.getElementById('img_info').scrollTop = 0;
        });
      },
      addCart(product){
        //处方药不能购买
        if(product.merchant_product_info && product.merchant_product_info.product_type == 4){
          audioPlay(__static +'/很抱歉处方药不能购买.mp3');
          return;
        }
        //判断购物中是否有该药品
        let cartProduct = _.find(this.cartData.cartProduct,(item)=>{
          return (item.merchant_product_info.merchant_product_id === product.merchant_product_info.merchant_product_id );
        });
        if(cartProduct){
          //购物车该药品数量小于实际库存
          if(cartProduct.cartNum< (cartProduct.real_stock - (cartProduct.lock_stock||0))){
            cartProduct.cartNum++;
            if(product.cartNum) product.cartNum++;
            else product.cartNum = 1;
          }

        }
        else {
          //库存为0
          if((product.real_stock - (product.lock_stock||0))<1) return;
          this.cartData.cartProduct.push({...product,cartNum:1});
          if(product.cartNum) product.cartNum++;
          else product.cartNum = 1;
        }
        this.calc();
        this.infoVisible = false
      },
      reduceCart(product){
        //判断购物中是否有该药品
        let cartProduct = _.find(this.cartData.cartProduct,(item)=>{
          return (item.merchant_product_info.merchant_product_id === product.merchant_product_info.merchant_product_id );
        });
        if(cartProduct){
          //购物车该药品数量小于实际库存
          if(cartProduct.cartNum>0){
            cartProduct.cartNum--;
            if(product.cartNum) product.cartNum--;
            else product.cartNum = 0;
            this.calc();
          }
        }

      },
      resetProduct(item){
        let index1 = this.allProduct.findIndex((product, idx, arr) => {
          return item.merchant_product_info.merchant_product_id ==  product.merchant_product_info.merchant_product_id;
        });
        if(-1 !== index1) this.$set(this.allProduct[index1], 'cartNum', item.cartNum);
        let index2 = this.productData.findIndex((product, idx, arr) => {
          return item.merchant_product_info.merchant_product_id ==  product.merchant_product_info.merchant_product_id;
        });
        if(-1 !== index2) this.$set(this.productData[index2], 'cartNum', item.cartNum);
      },
      reduceProduct(item){
        if(item.cartNum>0){
          //item.cartNum--;
          this.$set(item, 'cartNum', item.cartNum - 1);
          this.calc();
          this.resetProduct(item);
        }
      },
      addProduct(item){
        //购物车该药品数量小于实际库存
        if(item.cartNum< (item.real_stock - item.lock_stock)){
          //item.cartNum++;
          this.$set(item, 'cartNum', item.cartNum + 1);
          this.calc();
          this.resetProduct(item);
        }
      },
      initCategory(){
        this.categoryList = this.api.category;
      },
      calc(){
        let count = 0;
        let price = 0;
        let customer_price = 0;
        //过滤为0的数据
        let filterData = this.cartData.cartProduct.filter( item => {
          return item.cartNum > 0;
        });
        this.$set(this.cartData, 'cartProduct', filterData);

        this.cartData.cartProduct.map((item)=>{
          count += item.cartNum;
          price += item.merchant_product_info.price * item.cartNum;
          customer_price += item.merchant_product_info.customer_price * item.cartNum;
        });
        this.$set(this.cartData, 'cartProductCount', count);
        this.$set(this.cartData, 'cartProductPrice', price);
        this.$set(this.cartData, 'cartProductCustomerPrice', customer_price);
        //缓存数据
        this.$store.dispatch("modifyCart",this.cartData);
      },
      submitOrder(){
        if(this.cartData.cartProductCount == 0) return;
        this.$router.push( { name: 'shoppingList' });
      },
      switchCategory(category_id){
        this.category = category_id;
        if(category_id == 'all'){
          this.productData = this.allProduct;
        }
        else {
          this.productData = this.allProduct.filter((item)=>{
            if(item.merchant_product_info && item.merchant_product_info.product_info && item.merchant_product_info.product_info.category_list_info){
              let category_list_info = item.merchant_product_info.product_info.category_list_info;
              if(category_list_info.id == this.category ||category_list_info.parent_id ==this.category ){
                return true;
              } else {
                return false;
              }
            }
            else return false;
          });
        }
      },
      search(){
        this.keyVisible = false;
        let txt = this.search_txt.replace(/(^\s*)|(\s*$)/g, "");
        if(txt){
          this.productData = this.allProduct.filter((item)=>{
            if(item.merchant_product_info && item.merchant_product_info.product_info && item.merchant_product_info.product_info.name){
              let name = item.merchant_product_info.product_info.name;
              if(name.indexOf(txt)>-1) return true;
              else   return false;
            }
            else {
              return false;
            }
          });
        }
        else {
          this.productData = this.allProduct;
        }
      },
      inputKey(key){
        if(key === '0'){
          this.search_txt =  this.search_txt.length >0 ? this.search_txt.slice(0, this.search_txt.length-1) : "";
        }else {
          this.search_txt += key;
        }
      },
    },
    async mounted(){
      audioPlay(__static +'/请选择您所需要的药品.mp3');
      //初始化购物篮
      this.cartData = this.$store.state.cartData;
      this.initCategory();
      //获取商品列表
      try{
        let data = await this.api.get_equipment_product();
        this.productData = data.slot_product_list_info.sort((a,b)=>{return ((b.real_stock- (b.lock_stock||0)) - (a.real_stock - (a.lock_stock||0)))});
        this.allProduct =  data.slot_product_list_info.sort((a,b)=>{return ((b.real_stock- (b.lock_stock||0)) - (a.real_stock - (a.lock_stock||0)))});
        //初始化cartNum
        this.cartData.cartProduct.map((item)=>{
          let cartProduct = _.find(this.allProduct,(p)=>{
            return (p.merchant_product_info.merchant_product_id === item.merchant_product_info.merchant_product_id );
          });
          if(cartProduct) cartProduct.cartNum = item.cartNum;
        });

      }
      catch (e){
          this.log.error('get products failed,e=%s',e);
      }

    }
  }
</script>

<style lang="scss" scoped>
  .product-list{
    background: rgba(255,255,255,0.49) url('../assets/images/bg.png') no-repeat fixed;
    background-position-y: bottom ;
    background-size: cover;
    min-height: 100vh;
  }

  .product-list .img{
    display: block;
  }
  .product-list .container{
    height: calc(100vh - 1.2rem);
    display: flex;
    position: relative;
  }
  .container .left{
    width: 3rem;
    flex-shrink: 0;
    background-color: #3F424C;
    height: 100%;
    font-size:.36rem;
    text-align: center;
  }
  .container .left ul{
    height: 100%;
    overflow-y: auto;
  }
  .container .left ul li{
    padding: .16rem .1rem;
    color: #909399;
  }
  .container .left ul li.active{
    color: #303133;
    background-color: #fff;
  }
  /*.container .left ul li:first-child{
    background:linear-gradient(90deg,rgba(115,222,255,1) 0%,rgba(107,216,255,1) 100%);
    color:rgba(255,255,255,1);
  }*/
  .container .right{

    width: 3rem;
    flex-grow: 1;
    position: relative;
    padding-top: 1.08rem;
    overflow-y: auto;
    height: 100%;
    box-sizing: border-box;
  }
  .right .search{
    position: fixed;
    top: 1.2rem;
    left: 3rem;
    width: 100%;
    height: 1.08rem;
    z-index: 99;
  }
  .right .content{
    display: flex;
    flex-wrap: wrap;
  }

  /* (设计稿宽度 - 左侧宽度) / 3 , 除去左右侧空白, 大概算出每个item的宽度 */
  .right .content .item{
    width: 4.6rem;
    flex-shrink: 0;
    margin: .1rem ;
    font-size:.24rem;
    position: relative;
    padding: .2rem;
    background-color: rgba(255,255,255,0.8);
    border-radius: .04rem;
  }
  .shadowSold{
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: url('../assets/sold.png');
    background-size: 100% 100%;
    z-index: 50;
    border-radius: .04rem;
  }
  .item .img{
    margin: 0 auto;
    height: 2rem;
    height: 2rem;
    box-sizing: border-box;
  }
  .item .title{
    height: .32rem;
    line-height: .32rem;
    color: #303133;
    padding: .1rem .5rem 0 .5rem;
    text-align: left;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .item .price{
    color: #909399;
    text-align: left;
    padding: .1rem .5rem 0 .5rem;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    position: relative;
  }
  .item .price .original{
    font-size: .32rem;
  }
  .highlight-color{
    color: #FF5C2A;
  }
  .item .price .member{
    color: #909399;
    font-size: .26rem;
    padding-left: .2rem;
  }
  .price .add{
    position: absolute;
    height: .4rem;
    width: .4rem;
    border-radius: 50%;
    background: url('../assets/add.png');
    background-size: 100% 100%;
    bottom: 0;
    right: .1rem;
  }
  .price .num{
    position: absolute;
    height: .4rem;
    width: .3rem;
    background-size: 100% 100%;
    bottom: 0;
    right: .5rem;
    color: #FF5C2A;
    text-align: center;
  }
  .price .reduce{
    position: absolute;
    height: .4rem;
    width: .4rem;
    border-radius: 50%;
    background: url('../assets/reduce.png');
    background-size: 100% 100%;
    bottom: 0;
    right: .8rem;
  }

  .item .badge{
    width: 100%;
    height: .4rem;
    line-height: .4rem;
    font-size: .2rem;
    color: #ffffff;
    overflow: hidden;
    display: flex;
    margin-bottom: .05rem;
  }
  .badge .b-item{
    margin-right: .1rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding: 0 .3rem;
    border-radius: .25rem;
  }
  .badge .b-item:last-child{
    margin-right: 0;
  }

  .mask{
    position: absolute;
    top:0;
    right: 0;
    left: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, .6);
    z-index: 100;
  }
  .close-cart{
    position: absolute;
    top:0;
    right: 0;
    left: 0;
    bottom: 0;
    opacity: 1;
    z-index: 100;
  }
  .mask .cart{
    position: absolute;
    right: 0;
    bottom: 0;
    width: 8rem;
    height:8rem;
    background-color: #FFF;
    z-index: 101;
    border-top-left-radius: .4rem;
    border-top-right-radius: .4rem;
    padding: .4rem .5rem 0 .5rem;
    box-sizing: border-box;
  }
  .cart-container{
    position: relative;
    height: 100%;
  }
  .cart-container .cart-header{
    display: flex;
    justify-content: space-between;
    color: #303133;
  }
  .cart-header-title{
    font-weight: 600;
    font-size: .36rem;
    line-height: .42rem;
  }
  .cart-header-action{
    font-size: .32rem;
    line-height: .38rem;
  }
  .cart-empty::before{
    display: inline-block;
    width: .32rem;
    height: .32rem;
    margin-bottom: .06rem;
    content: '';
    background: url('../assets/cart-empty.png');
    background-size: 100% 100%;
    margin-right: .1rem;
    vertical-align: middle;
  }

  .cart-content{
    max-height: 4.5rem; /* 需要微调 */
    margin-top: .3rem;
    overflow-y: auto;
    margin-right: -.5rem;
    padding-right: .5rem;
  }
  .cart-content .cart-product-item{
    display: flex;
    justify-content: space-between;
    color: #303133;
    font-size: .24rem;
    align-items: center;
    margin-bottom: .15rem;
  }
  .dv-cart-empty{
    width: 3.24rem;
    height: 2rem;
    background: url(../assets/cart_null.png);
    background-size: 100% 100%;
    margin: 0 auto;
    margin-top: 1rem;
  }
  .dv-cart-empty-font{
    text-align: center;
    font-size:.24rem;
    font-family:PingFang-SC-Medium,PingFang-SC;
    font-weight:500;
    color:rgba(206,206,206,1);
    margin-top: .5rem;
  }
  .product-info{
    display: flex;
    align-items: center;
  }

  .cart-product-item .product-img{
    width: .8rem;
    height: .8rem;
    display: inline-block;
    margin-right: .2rem;
    box-sizing: border-box;
  }
  .product-action{
    display: flex;
    justify-content: space-between;
    align-items: center;
    width:1.8rem;
    flex-shrink: 0;
  }
  .product-action-add{
    height: .4rem;
    width: .4rem;
    border-radius: 50%;
    background: url(../assets/add.png);
    background-size: 100% 100%;
  }
  .product-action-reduce{
    height: .4rem;
    width: .4rem;
    border-radius: 50%;
    background: url(../assets/reduce.png);
    background-size: 100% 100%;
  }

  .cart-footer{
    position: absolute;
    height: 1.1rem;
    background:linear-gradient(90deg,#73DEFF 0%,#3FBAFF 100%);
    bottom: 0;
    left: -.5rem;
    right: -.5rem;
    color: #FFF;
    font-size: .36rem;
    line-height: 1.1rem;
    text-align: center;
  }
  .cart-footer-disable{
    background:rgba(225,225,225,1);
  }
  .cart-image{
    position: fixed;
    left: 17.95rem;
    top: 1.5rem;
    background: url(../assets/shop_empty.png) 0 0 no-repeat;
    background-size:100% 100%;
    width: .75rem;
    height: .75rem;
    z-index: 100;
  }
  .search-input{
    position: fixed;
    left: 8.31rem;
    top: 1.48rem;
    width:9rem;
    height:.7rem;
    background:rgba(255,255,255,1);
    border-radius:.4rem;
    border:.04rem solid rgba(65,187,255,1);
  }
  .search-image{
    position: fixed;
    left: 8.51rem;
    top: 1.63rem;
    background: url(../assets/search_black.png) 0 0 no-repeat;
    background-size:100% 100%;
    width: .5rem;
    height: .5rem;
  }
  .search-txt{
    position: absolute;
    left: .8rem;
    top:.2rem;
    height: .3rem;
    width: 6rem;
    border:0;
    font-size:.28rem;
    font-family:PingFang-SC-Medium,PingFang-SC;
    font-weight:500;

    line-height:.30rem;
  }

  input::-webkit-input-placeholder{
    color:rgba(174,174,174,1);
  }
  input:focus{
    outline: none;
  }
  .search-btn{
    position: absolute;
    right: -.01rem;
    width:1.5rem;
    height:.7rem;
    background:rgba(65,187,255,1);
    border-radius:0px .4rem .4rem 0px;

    font-size:.32rem;
    font-family:PingFang-SC-Medium,PingFang-SC;
    font-weight:500;
    color:rgba(255,255,255,1);
    line-height:.7rem;
    letter-spacing:.02rem;
  }
  .close{
    position: absolute;
    top: .4rem;
    right: .4rem;
    background: url(../assets/close.png) 0 0  no-repeat;
    background-size:100% auto;
    width: .6rem;
    height: .6rem;
  }
  .dv-info{
    position: absolute;
    width: 10rem;
    height: 8.8rem;
    left:4.6rem;
    bottom:1rem;
    background:rgba(255,255,255,1);
    border-radius:.28rem;
    z-index: 101;
  }
  .alert-confirm{
    position: absolute;
    right:1.3rem;
    bottom: .55rem;
    width:2.6rem;
    height:.6rem;
    background:linear-gradient(90deg,rgba(115,222,255,1) 0%,rgba(63,186,255,1) 100%);
    border-radius:.65rem;
    text-align: center;
    line-height: .6rem;
    font-size:.24rem;
    font-weight:500;
    color:rgba(255,255,255,1);
  }
  .alert-cancel{
    position: absolute;
    left:1.3rem;
    bottom: .55rem;
    width:2.6rem;
    height:.6rem;
    background:rgba(255,255,255,1);
    border:.02rem solid rgba(115,222,255,1);
    border-radius:.65rem;
    text-align: center;
    line-height:.6rem;
    font-size:.24rem;
    font-weight:500;
    color:rgba(115,222,255,1);
  }
  .img-info{
    width: 100%;
    position: absolute;
    top:1.1rem;
    height: 6.2rem;
    text-align: center;
    overflow-y: auto;
  }
  .img-item{
    margin: .15rem auto;
    width: 6rem;
    height: 6rem;
  }

  .dv-keyboard{
    position: absolute;
    top:.73rem;
    left: .45rem;
    width: 3.8rem;
    height: 1.85rem;
    padding: 0rem .2rem;
    background:  #B7B7B7;
    border-radius: .08rem;
    display: flex;
    flex-wrap: wrap;
    align-content:center;
    z-index: 999;
  }
  .key {
    color: #666;
    text-transform: uppercase;
    background: #f1f1f1;
    font-size: .18rem;
    line-height: .3rem;
    text-align: center;
    height: .3rem;
    width: .3rem;
    border-radius: .04rem;
    border: .02rem solid #e4e4e4;
    box-shadow: inset 0 0 .20rem white, 0 .05rem 0 #b1b1b1, 0 .06rem 0 .01rem #7e7e7e, 0 .08rem .05rem #a5a5a5;
    margin: .11rem .04rem;
    position: relative;
  }
  .key:hover{
    background: #181818;
    color: #fff;

  }
  .del{
    position: absolute;
    left: 0;
    top:0;
    background: url(../assets/del2.png) 0 0  no-repeat;
    background-size:100% auto;
    width: 100%;
    height:100%;
  }
  .del:hover{
    background: url(../assets/del3.png) 0 0  no-repeat;
    background-size:100% auto;
  }
</style>
