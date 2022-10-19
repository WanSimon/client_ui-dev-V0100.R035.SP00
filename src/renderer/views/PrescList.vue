<template>
  <div class="container">
    <div class="header">
      <top-nav :title-text="pageName" :remaining="180" :show-left-button="false"></top-nav>
    </div>
    <div class="content">
      <div class="item" v-for="(item, idx) in list" :key="idx">
        <div class="item-header">
          <div class="text text1">
            <div style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">处方号：{{item.presc_no}}</div>
          </div>
          <div class="text text2"><span v-show="!!!item.fold">单价</span></div>
            <div class="text text2"><span v-show="!!!item.fold">数量</span></div>
            <div class="text text2"><span v-show="!!!item.fold">金额</span></div>
          <div class="text3" @click="fold(item)">
            <div>{{!!!item.fold ? '收起' : '展开'}}</div>
            <img class="image" :src="require(item.fold?'../assets/images/down.png':'../assets/images/up.png')" />
          </div>
        </div>
        <div class="item-content" v-show="!!!item.fold" v-for="(product, index0) in item.productInfo" :key="index0">
          <div class="product" :class="{'product-enough': !!!product.enough}">
            <div class="text1">
              <div style="width: 1rem;flex-shrink:0;height:1rem;background-color:#f2f3f6; margin-right: .3rem;">
                <img v-if="product.home_thumb" :src="$conf.resource+product.home_thumb" style="width: 1rem;height: 1rem;" />
              </div>
              <div style="flex-grow:1;line-height:1;">{{(product.drug_name || '--')}}</div>  
            </div>
            <div class="text2">&yen;{{(product.unitPrice || product.price) || '-'}}</div>
            <div class="text2">{{(product.num || product.quantity) || '0'}}</div>
            <div class="text2">&yen;{{product.amount || '0.00'}}</div>    
          </div>  
        </div>
        <div class="item-footer">
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="summary">本次您共取 <span style="color: #FF5D2B">{{kind}}</span> 种，<span style="color: #FF5D2B">{{count}}</span> 盒药品</div>
      <div class="btn" @click="confirm" :style="{background: count ? '#4A90E2':'#cccccc'}">确认取药</div> 
    </div>
    <div class="err-message" v-show="messageVisible"><i class="el-icon-warning"></i>&nbsp;&nbsp;{{messageText}}</div>
  </div>
</template>

<script>
  import {audioPlay} from "../js/util";
  import {mapGetters} from "vuex";

  export default {
    name: "prescList",
    data() {
      return {
        pageName:"选取处方",
        msg:"您当前没有待取药品",
        list:[],
        kind: 0,
        count: 0,
        //设备库存
        stock: [],
        //购物篮
        cart:[],
        //错误提示
        messageVisible: false,
        messageText: '未知错误',
        btnLoading: false,
      }
    },
    computed:{
      ...mapGetters(['phone'])
    },
    methods:{
      calc(){
        let count = 0;
        let kind = new Set();
        for(let i=0; i<this.list.length; i++){
          let orderInfo = this.list[i];
          for(let k=0; k < orderInfo.productInfo.length; k++){
            let drug = orderInfo.productInfo[k];
            if(!drug.enough) continue;
            kind.add(drug.drug_code);
            count += parseInt(drug.quantity);
          }
        }
        this.$set(this, 'kind', kind.size);
        this.$set(this, 'count', count);
      },
      fold(item){
        this.$set(item, 'fold', !item.fold);
      },
      async print(){
        try{
          let info = {
            ticket_title: this.$conf.ticketTitle || '未来健康智慧药房',
            phone:this.phone,
            isSuccess: true,
            prescList: this.list,
          };
          await this.api.print_ticket(info, 1);
        }catch (e){
          this.log.error('print failed,e=', e.message);
        }
      },
      async confirm(){
        if(this.btnLoading) return;
        this.btnLoading = true;
        let todoList = this.list.filter(item => item.allFlag > 0);
        if(this.count===0 || !todoList.length) {
          if(this.list.length){
            audioPlay(__static +'/请去药房取药.mp3');
            this.print();
          }
          return;
        }
        try{
          let pickUpInfo = [];
          for(let k=0; k < todoList[0].productInfo.length; k++){
            let drug = todoList[0].productInfo[k];
            if(!drug.enough) continue;
            let idx = pickUpInfo.findIndex(ele => ele.merchant_product_id === drug.merchant_product_id);
            if(-1 !== idx){
              pickUpInfo[idx].product_count += (parseInt(drug.quantity) || 0); 
            }else{
              pickUpInfo.push({
                merchant_product_id: drug.merchant_product_id,
                product_count: (parseInt(drug.quantity) || 0)
              });  
            }
          }
          await this.api.pick_up_product(todoList[0].presc_no, 0, pickUpInfo);
          this.$router.push({name:'prescWait', params:{list: todoList, all: this.list, kind: this.kind, count: this.count}});
        }catch (e) {
          this.log.error('pick_up_product fail, e=%s', e.message);
          this.messageVisible = true;
          let message = e.errmsg && (-1 != e.errmsg.indexOf('no enough product')) ? '库存不足' : '取药失败' ;
          this.messageText = message;
          setTimeout(() => {
            this.messageVisible = false;
            this.btnLoading = false;
          }, 5000);
        }
      },
      //获取药机库存
      async getStock(){
        let stock = {};
        let equipment_product = await this.api.get_equipment_product();
        let product_list = equipment_product.slot_product_list_info;
        this.log.info('get stock data=%s', JSON.stringify(product_list));
        for(let i=0;i<product_list.length;i++){
          let barcode = product_list[i].merchant_product_info.merchant_product_no.trim().toUpperCase();
					barcode = product_list[i].merchant_product_info.merchant_product_id.trim().toUpperCase();
          if(stock[barcode]) {
            stock[barcode].stock += product_list[i].real_stock;
          }else {
            stock[barcode] = {};
            stock[barcode].stock = product_list[i].real_stock;
            stock[barcode].merchant_product_id = product_list[i].merchant_product_info.merchant_product_id;
            stock[barcode].home_thumb = product_list[i].merchant_product_info.product_info.home_thumb;
          }
        }
        this.stock = stock;
      },
    },
    created(){
      if(this.$route.params && this.$route.params.code){
        this.currentId = this.$route.params.code;
      }
    },
    async mounted(){
      try{
        await this.getStock();
        let list = this.$route.params.list || [];
        for(let i=0; i<list.length; i++){
          let orderInfo = list[i];
          //处方中药品的条数
          let orderItemAmount = 0;
          let len = orderInfo.productInfo.length;
          for(let k=0; k < len; k++){
            let drug = orderInfo.productInfo[k];
            let product_no = String(drug.drug_code).trim().toUpperCase();
            let num = drug.quantity;
            //默认药品足够
            drug.enough = true;
            //散装数量错误,直接定义为药品不足
            if(drug.errFlag){
              drug.enough = false;
              continue;
            }
            if(this.stock[product_no]){
              drug.merchant_product_id = this.stock[product_no].merchant_product_id;
              drug.home_thumb = this.stock[product_no].home_thumb;
              if(this.stock[product_no].stock < num || num <= 0) {
                drug.enough = false;
              }
            }else{
              drug.enough = false;
            }
            //药品足够时扣药机库存
            if(drug.enough) {
              orderItemAmount++;
              this.stock[product_no].stock -= num;
            }
          }
          orderInfo.allFlag = orderItemAmount == 0 ? 0 : ((orderItemAmount == len) ? 2 : 1);
        }
        this.list = list.sort((a, b) => {
          return b.allFlag - a.allFlag;
        });
        //console.info(this.list.map(item => item.PrescNo));
        this.log.info('prescList page mounted list data = %s', JSON.stringify(this.list));
        this.calc();
      }catch(e){
        this.log.error('prescList page mounted err = %s', e);
      }
    }
  }
</script>

<style lang="scss" scoped>
.container{
  display: flex;
  flex-direction: column;
  position: relative;
  background: #EEEEEE;
  background-position-y: bottom ;
  background-size: contain;
  height: 100vh;
  .header{
    height: auto;
    flex-shrink: 0;
    background-color: #4A90E2;
  }
  .content{
    height: 1rem;
    flex-grow: 1;
    overflow-y: scroll;
    .item:last-child{
      margin-bottom: .4rem;
    }
    .item{
      margin: .4rem .6rem 0 .6rem;
      padding-bottom: .2rem;
      background-color: #FFFFFF;
      border-radius: .08rem;
      opacity: 0.99;
      .item-header{
        display: flex;
        padding: .3rem;
        font-size: .32rem;
        justify-content: space-between;
        .text{
          font-size: .32rem;
          font-family: PingFangSC-Semibold, PingFang SC;
          font-weight: 600;
          color: #333333;
          line-height: .45rem;
          letter-spacing: 1px;
        }
        .text1{
          width: 8rem;
          display: flex;
          align-items: center;
          overflow: hidden;
          .image{
            width: .36rem;
            height: .36rem;
            margin-right: .2rem;
          }
        }
        .text2{
          width: 2.7rem;
          text-align: center;
        }
        .text3{
          width: auto;
          font-size: .2rem;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #666666;
          display: flex;
          align-items: center;
          .image{
            width: .5rem;
            height: .5rem;
          }
        }
      }
      .item-content{
        padding: 0 .2rem;
        font-size: .32rem;
        border-top: solid 1px #F5F5F5;
        .item-header2{
          display: flex;
          padding: .3rem 0;
          font-size: .28rem;
          .text{
            font-size: .28rem;
            font-family: PingFangSC-Semibold, PingFang SC;
            font-weight: 600;
            color: #333333;
            line-height: .45rem;
            letter-spacing: 1px;
          }
          .text1{
            width: 8rem;
            display: flex;
            align-items: center;
            overflow: hidden;
            .image{
              width: .36rem;
              height: .36rem;
              margin-right: .2rem;
            }
          }
          .text2{
            width: 2.7rem;
            text-align: center;
          }
          .text3{
            width: auto;
            font-size: .2rem;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #666666;
            display: flex;
            align-items: center;
            .image{
              width: .5rem;
              height: .5rem;
            }
          }
        }
        .product{
          display: flex;
          padding: .1rem .1rem;
          margin: .1rem 0;
          font-size: .26rem;
          .text1{
            width: 8rem;
            display: flex;
            overflow: hidden;
            .image{
              width: .36rem;
              height: .36rem;
              margin-right: .2rem;
            }
          }
          .text2{
            width: 2.7rem;
            text-align: center;
          }
        }
        .product-enough{
          background-color: #DCDCDC;
        }
      }
      .item-footer{
        min-height: 1px;
        .enough{
          display: flex;
          align-items: center;
          padding: .07rem .3rem;
          background-color: rgb(242, 242, 242);
          border-bottom-right-radius: .08rem;
          border-bottom-left-radius: .08rem;
          .image{
            width: .28rem;
            height: .25rem;
            margin-right: .2rem;
          }
          .msg{
            font-size: .18rem;
            font-family: PingFang-SC-Medium, PingFang-SC;
            font-weight: 500;
            color: #333333;
            line-height: .25rem;
          }
        }
      }
    }
    
  }
  .footer{
    height: 1rem;
    flex-shrink: 0;  
    background: #EEEEEE;
    opacity: 0.99;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .summary{
      font-size: .32rem;
      font-family: PingFangSC-Semibold, PingFang SC;
      font-weight: 600;
      color: #333333;
      letter-spacing: .01rem;
      min-width: 1px;
    }
    .btn{
      width: 3.84rem;
      height: 1rem;
      line-height: 1rem;
      font-size: .36rem;
      font-family: PingFang-SC-Bold, PingFang-SC;
      font-weight: bold;
      color: #FFFFFF;
      text-align: center; 
    }
  }
  .err-message{
    position: fixed;
    top: 2rem;
    left: 50%;
    font-size: .24rem;
    z-index: 2000;
    max-width: 4rem;
    transform: translateX(-50%);
    background-color: #fdf6ec;
    border-color: #fdf6ec;
    color: #E6A23C;
    padding: .3rem .3rem .3rem .4rem;
    border-radius: .04rem;
  }
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
</style>

<style scoped>
  .prescList {
    height: 100vh;
    background: #F9F9F9;
    overflow: hidden;
  }
  .box01{
    height: calc(100vh - 2.6em);
    padding: .4rem .4rem 0 .4rem;
    overflow: auto;
  }
  .box01::-webkit-scrollbar {/*滚动条整体样式*/

    width: .1rem;     /*高宽分别对应横竖滚动条的尺寸*/

    height: .01rem;

  }
  .box01::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
    border-radius: .1rem;
    -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
    background: #535353;
  }
  .box01::-webkit-scrollbar-track {/*滚动条里面轨道*/
    -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
    border-radius: 10px;
    background: #EDEDED;
  }
  .box01-1{
    margin-bottom: .4rem;
    border-radius: .28rem;
    position: relative;
  }
  .box01-1-1{
    width: 100%;
    height: 1.05rem;
    line-height: 1.05rem;
    font-size: .32rem;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: #333333;
    text-align: left;
  }
  .box01-1-1-1{
    width: .86rem;
  }
  .box01-1-1-2{
    width: 6rem;
  }
  .box01-1-1-3{
    width: 3rem;
    text-align: center;
  }
  .box01-1-1-4{
    float: right;
    height: 1.05rem;
  }
  .box01-1-1-com{
    float: left;
    height: 1.05rem;
  }
  .box01-1-2{
    margin: 0 .86rem;
    width: 16.5rem;
    height: .02rem;
    background: #F5F5F5;
  }
  .box01-1-3{
    height: 1.2rem;
    font-size: .26rem;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #333333;
    line-height: 1rem;
    padding-bottom: .2rem;;
  }
  .box01-1-4{
    height: .4rem;
    font-size: .18rem;
    font-family: PingFang-SC-Medium, PingFang-SC;
    font-weight: 500;
    color: #333333;
    line-height: .4rem;
  }
  .box01-1-4-1{

  }
  .box02{
    position: absolute;
    width: 19.2rem;
    height: 1rem;
    bottom: 0;
  }
  .box02-1{
    position: absolute;
    height: 1rem;
    line-height: 1rem;
    bottom: 0;
    left: 1.45rem;
    font-size: .32rem;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: #333333;
    letter-spacing: .01rem;
  }
  .box02-2{
    position: absolute;
    width: 3.84rem;
    height: 1rem;
    line-height: 1rem;
    right: 0;
    bottom: 0;
    font-size: .36rem;
    font-family: PingFang-SC-Bold, PingFang-SC;
    font-weight: bold;
    color: #FFFFFF;
    text-align: center;
  }
</style>
