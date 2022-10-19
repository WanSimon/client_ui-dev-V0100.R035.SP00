<template>
  <div class="soldOut" @click="keyVisible =false">
    <top-nav @right-button="clickRightButton" :title-text="pageName" :show-left-button="true" :show-right-button="false" :clearRemain="true"></top-nav>
    <div class="container" >
      <div class="search-input">
        <div class="search-image"></div>
        <input class="search-txt" v-model="search_txt"  @focus="onFocus({target: $event.target})"   placeholder="请输入需要查找的药品名首字母" type="text"/>
        <div class="search-btn" @click="search()">查询</div>
      </div>
      <div class="table-head" style="margin-top: .2rem; flex-shrink:0;">
        <table>
          <colgroup>
            <col style="width: 10%" />
            <col style="width: 30%" />
            <col style="width: 13%" />
            <col style="width: 13%" />
            <col style="width: 10%" />
            <col style="width: 12%" />
            <col style="width: 12%" />
          </colgroup>
          <thead>
          <tr>
            <th>层/列</th>
            <th>商品名称</th>
            <th>摆放方式</th>
            <th>(库存)(容量)</th>
            <th>锁定库存</th>
            <th>单个下架</th>
            <th>药道下架</th>
          </tr>
          </thead>
        </table>
      </div>
      <div class="line" style=" flex-shrink:0;"></div>
      <div class="table-body" style=" flex-grow:1;">
        <table>
          <colgroup>
            <col style="width: 10%" />
            <col style="width: 30%" />
            <col style="width: 13%" />
            <col style="width: 13%" />
            <col style="width: 10%" />
            <col style="width: 12%" />
            <col style="width: 12%" />
          </colgroup>
          <tbody>
          <tr :class="{'dv-bg':index%2==0}" v-for="item,index in list" :key="index">
            <td>({{item.y+1}},{{item.x+1}}）</td>
            <td><a href="javascript:;" @click="detail(item)">{{item.name}}</a></td>
            <td>
              <div style="width: .6rem;height:.6rem;margin: 0.05rem auto;" @click.stop="viewImage(item)">
                <img style="width: 100%;height: 100%" :src="$conf.resource+item.show_image" />
              </div>
            </td>
            <td>(<span style="color: #00CC00">{{item.real_stock}}</span>)({{item.upper_limit}})</td>
            <td><span :style="(item.lock_stock||0)>0?'color: red':null">{{item.lock_stock}}</span></td>
            <td><a v-show="(item.real_stock - (item.lock_stock||0) )>0" href="javascript:;" @click="showAlert(item.slot_no,1,item.name)">单个下架</a></td>
            <td><a v-show="item.real_stock>0" href="javascript:;" @click="showAlert(item.slot_no,-1,item.name)">药道下架</a></td>
          </tr>
          </tbody>
        </table>
      </div>
      <div class="btn-all-soldout" @click="showAlert(-1,-1)">全部下架</div>
      <div class="variable" style="flex-shrink: 0;">
        <full-Keyboard :option="keyboardOption" @key-value="getInputValue" @close="closeFullKeyboard"></full-Keyboard>
      </div>
    </div>

    <div class="mask" v-show="alertVisible">
      <div class="close-alert" @click="hideAlert"></div>
      <div class="dv-alert">
        <div class="close" @click="hideAlert"></div>
        <div class="dv-alert-text" style="top:1.19rem">{{alertText1}}</div>
        <div class="dv-alert-text" style="top:1.75rem">{{alertText2}}</div>
        <div class="alert-cancel" @click="hideAlert">取消</div>
        <div class="alert-confirm" @click="optConfirm()">确定</div>
      </div>
    </div>

    <div class="mask" v-show="ingVisible">
      <div class="dv-alert" style="height: 3rem">
        <div class="dv-alert-text" style="top:1.19rem">下架中,请耐心等待。。。</div>
      </div>
    </div>

    <div class="mask" v-show="msgVisible">
      <div class="dv-msg">{{msg}}</div>
    </div>

    <div class="mask" v-show="detailVisible" @click.stop="detailVisible=false">
      <div class="dv-detail" @click.stop="">
        <div class="dv-detail-title">药品详情</div>
        <div class="dv-line"></div>
        <div class="dv-detail-info">
          <div class="dv-detail-left">
            <img style="width: 100%;height: 100%" :src="$conf.resource+item.home_thumb" />
          </div>
          <div class="dv-detail-right">
            <div class="dv-detail-list">
              药品名称：<span>{{item.name}}</span>
            </div>
            <div class="dv-detail-list">
              国际条码：<span>{{item.bar_code}}</span>
            </div>
            <div class="dv-detail-list">
              批&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp次：<span>{{item.batch}}</span>
            </div>
            <div class="dv-detail-list">
              批&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp号：<span>{{item.batch_number}}</span>
            </div>
            <div class="dv-detail-list">
              生产厂家：<span>{{item.manufacturer}}</span>
            </div>
            <div class="dv-detail-list">
              规&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp格：<span>{{item.specification}}</span>
            </div>
          </div>
        </div>
        <div class="dv-barcode">
          <svg id="barcode"></svg>
        </div>
        <div class="dv-warning">
          提示：请先扫码，并按指示灯放药
        </div>
      </div>
    </div>

    <div class="mask" v-show="imageVisible" @click.stop="imageVisible=false">
      <div class="image-content">
        <div class="image-item">
          <img v-if="item.show_image" :src="$conf.resource+item.show_image" style="width: 100%;height: 100%" />
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  import _ from 'lodash';
  import JsBarcode from 'jsbarcode';
  import FullKeyboard from '@/components/FullKeyboard.vue';
  import pinyin from '../../js/pinyin'

  export default {
    name: "soldOut",
    data(){
      return {
        pageName: "药品下架",
        list:[],
        allList:[],
        alertVisible:false,
        msgVisible:false,
        detailVisible:false,
        imageVisible: false,
        keyVisible:false,
        alertText1:'',
        alertText2:'',
        opObj:{},
        msg:'',
        ingVisible:false,
        item:{},
        search_txt:"",
        keys:'QWERTYUIOPASDFGHJKLZXCVBNM0',
        keyboardOption: {
          show: false,
          sourceDom: '',
          status: 1,
          position: 'relative',
        },
        keyboardTarget: '',
      }
    },
    components: { FullKeyboard },
    methods:{
      clickRightButton(){
        this.$router.back(-1);
      },
      //全键盘输入
      getInputValue(val) {
        let doc = this.keyboardTarget;
        doc.focus();
        var startPos = doc.selectionStart;
        var endPos = doc.selectionEnd;
        let txt = this.search_txt;
        txt = String(txt);
        let inputTxt = '';
        if(val === 'delete'){
          if(startPos != endPos){
            inputTxt = txt.substring(0, startPos) + txt.substring(endPos);
          }else{
            inputTxt = txt.substring(0, startPos - 1) + txt.substring(endPos); 
          }
        }else{
          inputTxt = txt.substring(0, startPos) + val + txt.substring(endPos)
        }
        this.search_txt = inputTxt.toUpperCase();
      },
      //唤起全键盘
      onFocus({target}) {
        this.keyboardTarget = target;
        this.$set(this.keyboardOption, 'show', true);
        this.$set(this.keyboardOption, 'sourceDom', target);
      },
      //关闭全键盘
      closeFullKeyboard(){
        this.$set(this.keyboardOption, 'show', false);  
      },
      viewImage(item){
        this.item = item;
        this.imageVisible = true;
      },
      hideAlert(){
        this.alertText1 = '';
        this.alertText2 = '';
        this.alertVisible = false;
        this.opObj= {};
      },
      showAlert(slot_no,product_count,name){
        if(slot_no == -1 && product_count ==-1){
          this.alertText1 = '是否确认全部下架?';
          this.alertText2 = '';
        }
        else if(product_count == -1){
          this.alertText1 = '是否确认药道下架?';
          this.alertText2 = name;
        }
        else {
          this.alertText1 = '是否确认单个下架?';
          this.alertText2 = name;
        }
        this.opObj= {
          slot_no,product_count
        };
        this.alertVisible = true;
      },
      hideMsg(){
        setTimeout(()=>{this.msgVisible = false;},5000);
      },
      showMsg(msg){
        this.ingVisible = false;
        this.alertVisible = false;
        this.msg = msg;
        this.msgVisible = true;
        this.hideMsg();
      },
      async optConfirm(){
        //药道下架
        if(this.opObj.slot_no != -1 && this.opObj.product_count ==-1){
          try {
            await this.api.take_off_product(this.$store.state.adminAccount.op_account_id||'',this.opObj.slot_no,this.opObj.product_count);
            this.showMsg('药道下架成功，请取走药物！');
          }
          catch (e){
            this.log.error('药道下架失败');
            this.showMsg('药道下架失败，请检查！');
          }
        }
        //全部下架
        else if(this.opObj.slot_no == -1 && this.opObj.product_count ==-1){
          try {
            await this.api.take_off_product(this.$store.state.adminAccount.op_account_id||'',this.opObj.slot_no,this.opObj.product_count);
            this.showMsg('全部下架成功，请取走药物！');
          }
          catch (e){
            this.log.error('药道下架失败');
            this.showMsg('全部下架失败，请检查！');
          }
        }
        else {
          //单个下架
          try{
            this.alertVisible = false;
            this.ingVisible = true;
            await this.api.take_off_product(this.$store.state.adminAccount.op_account_id||'',this.opObj.slot_no,this.opObj.product_count);
          }
          catch (e){
            this.showMsg('下架失败');
            this.logs.error('下架失败',e);
          }
        }
        this.getList();
      },
      async getList(){
        //获取设备信息
        let info = await this.api.get_equipment_info();
        if(info.equipment_info){
          //存储设备信息
          this.$store.dispatch("addEquipmentInfo",info.equipment_info);
        }
        try {
          let drug_channel = this.$store.state.equipmentInfo.drug_channel;
          let slot_product_list_info = this.$store.state.equipmentInfo.equipment_product_info.slot_product_list_info;
          let slot_info_list = drug_channel.slot_info_list;
          let list = [];
          slot_product_list_info.map((item)=>{
			      item.product_display_info = item.product_display_info || {};
            let obj = {};
            obj.slot_no = item.slot_no;
            obj.real_stock = item.real_stock;
            obj.lock_stock = item.lock_stock;
            obj.upper_limit = item.upper_limit;
            let slotItem = _.find(slot_info_list,(slot)=>slot.slot_no == item.slot_no);
            if(slotItem){
              obj.x = slotItem.x;
              obj.y = slotItem.y;
            }
            obj.name = item.merchant_product_info.product_info.name;
            obj.bar_code = item.merchant_product_info.product_info.bar_code;
            obj.batch = item.merchant_product_info.batch;
            obj.batch_number = item.merchant_product_info.batch_number;
            obj.manufacturer = item.merchant_product_info.product_info.manufacturer;
            obj.specification = item.merchant_product_info.product_info.specification;
            obj.home_thumb = item.merchant_product_info.product_info.home_thumb;
            obj.show_image = item.product_display_info.show_image;
            obj.pinyin = pinyin.instance.initialTreatment(obj.name);
            list.push(obj);
          });
          this.list = list.sort((a,b)=>{
            if(a.y!==b.y) return a.y- b.y;
            else return a.x - b.x;
          });
          this.allList = [...list];
        }
        catch (e){
          this.log.error('初始化药道信息失败',e);
        }
      },
      detail(item){
        this.item = item;
        if(item.bar_code){
          //JsBarcode("#barcode").options({font: "OCR-B"}).EAN13(item.bar_code.trim(), {fontSize: 14, textMargin: 0}).render();
          JsBarcode("#barcode" ,item.bar_code.trim(), {fontSize: 14, textMargin: 0}).render();
        }
        this.detailVisible = true;
      },
      search(){
        let txt = this.search_txt.trim();
        if(txt){
          txt = txt.toUpperCase();
          this.list = this.allList.filter(item=>item.pinyin.indexOf(txt)!==-1);
        }
        else this.list = [...this.allList];
      },
      inputKey(key){
        if(key==='0'){
          this.search_txt =  this.search_txt.length>0?this.search_txt.slice(0,this.search_txt.length-1):""
        }else {
          this.search_txt +=key;
        }
        this.search();
      }
    },

    async mounted(){

      await this.getList();
      // 扫码枪扫描回调函数
      //定义售货机出货通知
      this.api.on_notify_take_off_product = async (msg)=>{
        this.log.info("将取货仓物品置入回收仓！");
        this.getList();
        //出货状态(0:出货失败;1:开始出货;2:出货成功)
        if(msg && msg.status == 0){
          //出货识别  锁住程序 todo
          this.log.error('单个下架失败');
          this.showMsg('单个下架失败，请检查！');
        }
        //出货成功
        if(msg && msg.status == 2 && msg.isfinished == true){
          this.showMsg('下架成功');
          //await this.api.operate_vendor(6,1);
          this.log.info("将取货仓物品置入回收仓！");
        }
      };

    },
    async destroyed(){
      
    }
  }
</script>

<style lang="scss" scoped>
  .table-head table, .table-body table, .table-foot table{
    width: 96%;
    margin: 0 auto;
    text-align: center;
    border-spacing:0;
    table-layout: fixed;
  }

  .table-body{
    margin-top: .3rem;
    overflow-y: auto;
  }
  .table-body table tr td{
    height: .5rem;
    line-height: .5rem;
    color:rgba(51,51,51,1);
    font-size: .28rem;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .dv-bg{
    background:rgba(65,187,255,0.15);
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
    text-align: center;
  }
  .line{
    height: .2rem;
    border-bottom: 1px #cecece dashed;
  }
  
  .close{
    position: absolute;
    top: .4rem;
    right: .4rem;
    background: url(../../assets/close.png) 0 0  no-repeat;
    background-size:100% auto;
    width: .6rem;
    height: .6rem;
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
  .close-alert{
    position: absolute;
    top:0;
    right: 0;
    left: 0;
    bottom: 0;
    opacity: 1;
    z-index: 100;
  }
  .dv-alert{
    position: absolute;
    width: 8.6rem;
    height: 5rem;
    left:5.3rem;
    top:2.9rem;
    background:rgba(255,255,255,1);
    border-radius:.28rem;
    z-index: 101;
  }
  .dv-msg{
    position: absolute;
    left:6.9rem;
    top:4.26rem;
    width:5.4rem;
    height:2.28rem;
    background:rgba(0,0,0,0.6);
    border-radius:28px;
    z-index: 101;
    text-align: center;
    line-height: 2.28rem;
    font-size:.4rem;
    font-weight:500;
    color:rgba(255,255,255,1);
  }
  .alert-confirm{
    position: absolute;
    right:1.1rem;
    bottom: .9rem;
    width:2.8rem;
    height:1.1rem;
    background:linear-gradient(90deg,rgba(115,222,255,1) 0%,rgba(63,186,255,1) 100%);
    border-radius:.65rem;
    text-align: center;
    line-height: 1.1rem;
    font-size:.36rem;
    font-weight:500;
    color:rgba(255,255,255,1);
  }
  .alert-cancel{
    position: absolute;
    left:1.1rem;
    bottom: .9rem;
    width:2.8rem;
    height:1.1rem;
    background:rgba(255,255,255,1);
    border:.02rem solid rgba(115,222,255,1);
    border-radius:.65rem;
    text-align: center;
    line-height: 1.1rem;
    font-size:.36rem;
    font-weight:500;
    color:rgba(115,222,255,1);
  }
  .dv-alert-text{
    position: absolute;
    width: 100%;
    text-align: center;
    font-size:.4rem;
    font-weight:500;
    color:rgba(51,51,51,1);
  }
  .dv-detail{
    position: absolute;
    width: 9.3rem;
    height: 9.36rem;
    left:4.95rem;
    bottom:0rem;
    background:rgba(255,255,255,1);
    border-radius:.28rem .28rem 0 0;
    z-index: 101;
  }
  .dv-detail-title{
    position: absolute;
    text-align: center;
    top:.4rem;
    width: 100%;
    font-size: .48rem;
    font-weight: 600;
    color: #333333;
  }
  .dv-detail-info{
    position: absolute;
    top:2.4rem;
    height: 3rem;
    width: 100%;
  }
  .dv-detail-left{
    float: left;
    height: 3rem;
    width: 3rem;
    margin-left: .5rem;

  }
  .dv-detail-right{
    float: left;
    height: 3rem;
    width: 5.3rem;
    margin-left: .3rem;
  }
  .dv-detail-list{
    width: 100%;
    height: .55rem;
    font-size: .28rem;
    font-weight: 500;
    color: #999999;
    line-height: .55rem;
    text-align: left;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .dv-detail-list span{
    font-weight: 400;
    color: #333333;
  }
  .dv-barcode{
    position: absolute;
    text-align: center;
    top:6rem;
    width: 100%;
  }
  .dv-warning{
    position: absolute;
    text-align: center;
    top:8rem;
    width: 100%;
    font-size: .28rem;
    font-weight: 400;
    color: red;
  }
  .dv-line{
    position: absolute;
    top:1.6rem;
    left: .65rem;
    width: 8rem;
    height: .03rem;
    background: #F5F5F5;
  }
  input::-webkit-input-placeholder{
    color:rgba(174,174,174,1);
    background: #fff;
  }
  input:focus{
    outline: none;
  }
  .dv-keyboard{
    position: absolute;
    top:.74rem;
    left: .52rem;
    width: 3.8rem;
    height: 1.85rem;
    padding: 0rem .2rem;
    background:  #B7B7B7;
    border-radius: .08rem;
  }
  .key {
    color: #666;
    display: inline-block;
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
    margin: .04rem;
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
    background: url(../../assets/del2.png) 0 0  no-repeat;
    background-size:100% auto;
    width: 100%;
    height:100%;
  }
  .del:hover{
    background: url(../../assets/del3.png) 0 0  no-repeat;
    background-size:100% auto;
  }
  .image-content{
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    .image-item{
      max-width: 80vw;
    }
  }


.soldOut{
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family:PingFang-SC-Medium,PingFang-SC;
  background: rgba(255,255,255,0.49) url('../../assets/images/bg.png') no-repeat fixed;
  background-position-y: bottom ;
  background-size: contain;
  .container{
    flex-grow: 1;
    padding-top:.2rem;
    display: flex;
    flex-direction: column;
    .search-input{
      flex-shrink: 0;
      box-sizing: border-box;
      width:9rem;
      height:.7rem;
      background:rgba(255,255,255,1);
      border-radius:.4rem;
      border:.04rem solid rgba(65,187,255,1);
      display: flex;
      align-items: center;
      align-self: flex-end;
      margin-right: 1rem;
      .search-image{
        background: url(../../assets/search_black.png) 0 0 no-repeat;
        background-size:100% 100%;
        width: .5rem;
        height: .5rem;
        margin-left: .1rem;
      }
      .search-txt{
        flex-grow: 1;
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
        background: #fff;
      }
      input:focus{
        outline: none;
      }
      .search-btn{
        width:1.5rem;
        background:rgba(65,187,255,1);
        border-radius:0px .4rem .4rem 0px;
        font-size:.32rem;
        font-family:PingFang-SC-Medium,PingFang-SC;
        font-weight:500;
        color:rgba(255,255,255,1);
        line-height:.7rem;
        letter-spacing:.02rem;
        text-align: center;
        height: .7rem;
        margin-right: -0.04rem;
      }
    }
    .btn-all-soldout{
      flex-shrink: 0;
      margin: .2rem 0 .3rem 0;
      width:4.8rem;
      height:1.1rem;
      background:rgba(255,255,255,1);
      border-radius:.65rem;
      border:.04rem solid rgba(63,186,255,1);
      font-size:.36rem;
      text-align: center;
      line-height: 1.1rem;
      font-weight:500;
      color:rgba(63,186,255,1);
      align-self: center;
    }
  }
}  
</style>
