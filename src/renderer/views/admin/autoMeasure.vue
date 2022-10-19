<template>
  <div class="measure">
    <top-nav @right-button="clickLeftButton" :title-text="pageName" :remaining="3600" :show-left-button="true" :show-right-button="false"></top-nav>
    <div class="filter-container">
      <div class="filter-item">
        <div class="box01-font2" style="margin-left: .3rem;">药道</div>
        <el-select class="el-custom" v-model="searchData.row" @change="selectAll(false)"  placeholder="请选择" style="margin-left: .1rem;width: 2em">
          <el-option
            v-for="item in rows"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <div class="box01-font2">层</div>
        <el-select class="el-custom" v-model="searchData.col" @change="selectAll(false)"  placeholder="请选择" style="margin-left: .1rem;width: 2em">
          <el-option
            v-for="item in cols"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <div class="box01-font2">列</div>  
      </div> 
      <div class="filter-item">
        <div class="search-input">
          <div class="search-image"></div>
          <input class="search-txt" v-model="searchData.search_txt" @focus="onFocus({target: $event.target, key: 'search_txt'})" placeholder="请输入需要查找的药品名首字母" type="text"/>
        </div>
        <div class="box01-03 box01-font" @click="resetSearch()">重置</div>
        <div v-if="lastData.length" class="box01-03 box01-font" style="background-color:#4A90E2;" @click="appMaskVisible2=true">历史记录</div> 
      </div> 
    </div>
    <div class="table-header">
      <div style="width: 5%;display: flex;align-items: center;justify-content: center">
        <el-checkbox class="el-custom" v-model="allSelected" @change="selectAll()"></el-checkbox>
      </div>
      <div style="width: 10%;display: flex;align-items: center;justify-content: center">
        <el-select class="el-custom" v-model="searchData.measureStatus" @change="selectAll(false)" placeholder="请选择" style="margin-left: .1rem;width: 100%">
          <el-option
            v-for="item in measureStatusArr"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
      <div style="width: 25%;">商品信息</div>
      <div style="width: 12%;">摆放方式</div>
      <div style="width: 10%;">药道容量</div>
      <div style="width: 10%;">账面数量</div>
      <div style="width: 10%;">盘点数量</div>
      <div style="width: 18%;">实际数据</div>
    </div>

    <div class="table-body" id="tablebody" ref="seven">
      <div v-for="(item, idx) in allList" class="table-item box03-01" :key="`${item.x}-${item.y}`" :class="{'active-item': idx === focusItemIndex}" v-show=" (searchData.row==='all' || searchData.row===(item.y+1))
        && (searchData.col==='all' || searchData.col===(item.x+1))
        && (searchData.search_txt ==='' || item.pinyin.includes(searchData.search_txt))
        && (searchData.measureStatus == 0 || item.measureStatus == searchData.measureStatus)
        && (!searchData.filterBarCode || item.bar_code == searchData.filterBarCode)">
        <div style="width: 5%;">
          <el-checkbox class="el-custom" v-model="item.checked" @change="selectOne(item)"></el-checkbox>
        </div>
        <div style="width: 10%;">{{`${item.y+1}层${item.x+1}列`}}</div>
        <div style="width: 25%;" class="box03-02">
          <div style="width:40%;flex-shrink:0;display:flex;justify-content:flex-end;align-items: center;">
            <img style="width: .8rem;height: .8rem;margin-right: .2rem;" :src="$conf.resource+item.home_thumb">
          </div>
          <div style="width:60%;flex-shrink:0;font-size: .16rem; font-weight: 400;text-align: left;">
            <div class="one-line" style="font-weight: 600;color: #333333"><a href="javascript:;" @click.stop="detail(item)">{{item.name}}</a></div>
            <div class="one-line">国际条码：{{item.bar_code}}</div>
            <div class="one-line">规&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;格：{{item.specification}}</div>
          </div>
        </div>
        <div style="width: 12%; text-align:center;">
          <div class="box03-01-01" style="margin: 0 auto;"  @click.stop="viewImage(item)">
            <img style="width: 100%;height: 100%" :src="$conf.resource+item.show_image">
          </div> 
        </div>
        <div style="width: 10%;">{{item.upper_limit}}</div>
        <div style="width: 10%;">{{item.real_stock}}</div>
        <div style="width: 10%;">{{item.auto_measure_num}}</div>
        <div style="width: 18%;" class="box03-01-03">
          <div style="display:flex; width:100%;justify-content: space-around;align-items: center;">
            <div><el-input-number @focus.stop="onFocus({target: $event.target, key: item, index: idx})" v-model="item.measure_num" :min="0" :precision="0" :max="item.upper_limit" label="描述文字"></el-input-number></div>
            <div style="margin-right:5px;">
              <div v-if="item.measureStatus === MeasureStatus.measured" class="box03-01-03-02" style="color: #72B935;">已盘点</div>
              <div v-else-if="item.measureStatus === MeasureStatus.unMeasure" class="box03-01-03-02" style="color: #4A90E2;">未盘点</div>
              <div v-else-if="item.measureStatus === MeasureStatus.abnormal" class="box03-01-03-02" style="color: #E2090E;">异常</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="table-footer">
      <div class="box04-02"></div>
      <div style="margin-left: .2rem;">剩余 {{abnormalNum}} 个盘点异常药道待处理</div>
      <div style="width: 5rem">     <el-progress style="margin-left: .2rem;" :text-inside="true" :stroke-width="30" :percentage="measured_percent"></el-progress></div>

      <div style="margin-left: 1rem;">已选中 {{selectNum}} 个盘点异常药道</div>
      <div class="box04-04" :class="{'btn-disabled': btnDisabled.measure}" @click="beginMeasure">{{this.measuring?(btnDisabled.measure ? '盘点中...' : '停止盘点'):'开始盘点'}}</div>
      <div class="box04-03" @click="confirmMode">提交</div>
    </div>
    <div class="variable">
      <full-Keyboard :option="keyboardOption" @key-value="getInputValue" @close="closeFullKeyboard"></full-Keyboard>
    </div>
    <div class="mask" v-show="detailVisible" @click="detailVisible=false">
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
              批&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp次：<span>{{item.batch || ''}}</span>
            </div>
            <div class="dv-detail-list">
              批&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp号：<span>{{item.batch_number || ''}}</span>
            </div>
            <div class="dv-detail-list">
              生产厂家：<span>{{item.manufacturer || ''}}</span>
            </div>
            <div class="dv-detail-list">
              规&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp格：<span>{{item.specification || ''}}</span>
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
    <div class="select-slot-mask" v-show="selectSlotVisible" @click.stop="selectSlotVisible = !selectSlotVisible">
      <div class="select-container" @click.stop="">
        <div class="select-header">
          <div class="notice1">注意：该药品有多种批次号, 请选择同批次号对应的药道!</div>
          <div class="notice2" v-if="multiData.length">
            <div class="name">{{multiData[0].name || ''}}</div>
            <div class="barcode">{{multiData[0].bar_code}}</div>
          </div>
        </div>
        <div class="select-content">
          <div class="select-left">
            <div class="product-image" v-if="multiData.length"><img width="100%" height="100%" :src="$conf.resource+multiData[0].home_thumb" /></div>
          </div>
          <div class="select-right">
            <div class="select-slot-item" v-for="item in multiData" :key="item.uid">
              <div class="item-info">批次号：{{item.uid}}</div>
              <div class="item-btn" @click.stop="selectSlot(item)">选择药道</div>
            </div>
          </div>
        </div>
        <div class="select-empty" v-if="!multiData.length">未找到药品信息!</div>
      </div>
    </div>
    <!-- <full-Keyboard :option="keyboardOption" @key-value="getInputValue" @close="closeFullKeyboard"></full-Keyboard> -->
    <app-mask :is-visible="appMaskVisible">
      <app-confirm :is-visible.sync="appMaskVisible" :message-text="confirmMessage" @confirm-resolve="leftBack"></app-confirm>
    </app-mask>
    <app-mask :is-visible="appMaskVisible2">
      <replenish-detail :is-visible.sync="appMaskVisible2" :origin-data="lastData" :cancel-txt="`关闭`"></replenish-detail>
    </app-mask>
    <app-mask :is-visible="appMaskVisible3">
      <replenish-detail :is-visible.sync="appMaskVisible3" :origin-data="computedData" :title-txt="`请核对最终补货单药品数据`" :confirm-txt="`提交`" @confirm-resolve="doSubmit"></replenish-detail>
    </app-mask>

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
  import { mapGetters } from 'vuex';
  import {audioPlay} from "../../js/util";
  import _ from "lodash";
  import pinyin from "../../js/pinyin";
  import JsBarcode from "jsbarcode";
  import DragDialog from '@/directive/drag-dialog';
  import FullKeyboard from '@/components/FullKeyboard.vue';
  import AppMask from '@/components/AppMask.vue';
  import AppConfirm from '@/components/AppConfirm.vue';
  import uuid from 'uuid';
  import ReplenishDetail from '@/components/ReplenishDetail.vue';

  export default {
    name: "measure",
    data(){
      return {
        searchData:{
          row:'all',
          col:'all',
          search_txt:"",
          filterBarCode:null,
          measureStatus:0,
        },
        pageName:"药品盘点补货",
        rows: [{
          value:'all',
          label:'全部'
        }],
        cols:[{
          value:'all',
          label:'全部'
        }],
        keyVisible:false,
        keys:'QWERTYUIOPASDFGHJKLZXCVBNM0',
        allList:[],
        channel:{
          aisleX:0,
          aisleY:0
        },

        measureStatusArr:[
          {
            value:0,
            label:'全部药道',
          },
          {
            value:1,
            label:'未盘点药道',
          },
          {
            value:2,
            label:'已盘点药道',
          },
          {
            value:3,
            label:'异常药道',
          }
        ],
        allSelected:false,
        MeasureStatus:{
          unMeasure:1,
          measured:2,
          abnormal:3
        },
        measuring:false,
        selectNum:0,
        measureSlotNum:0,
        measureMap:new Map(),
        measured_percent:0,
        abnormalNum:0,
        // 存储亮着的灯
        open_slot_no:[],
        detailVisible:false,
        item:{},
        //存储多种批次号的药品药道信息
        multiData: [],
        selectSlotVisible: false,
        //停止盘点的timer
        stopTimer: null,
        keyboardOption: {
          show: false,
          sourceDom: '',
          status: 1,
          position: 'relative',
        },
        keyboardItem: '',
        keyboardTarget: '',
        appMaskVisible: false,
        confirmMessage: '您确定返回上一页面吗？',
        btnDisabled: { measure: true, doSubmit: false},
        replenish_no: '',
        lastData: [], //上一次补货单数据
        appMaskVisible2: false,
        imageVisible: false,
        computedData: [],//最后合并的补货单数据
        stockData: [], //要提交的库存数据
        appMaskVisible3: false,
        focusItemIndex: '',
      }
    },
    directives: { DragDialog },
    components: { FullKeyboard, AppMask, AppConfirm, ReplenishDetail },
    methods:{
      //全键盘输入
      getInputValue(val) {
        let doc = this.keyboardTarget;
        doc.focus();
        var startPos = doc.selectionStart;
        var endPos = doc.selectionEnd;
        let txt = '';
        if('search_txt' == this.keyboardItem){
          txt = this.searchData.search_txt;
        }else{
          txt = this.keyboardItem.measure_num || '';
        }
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
        if('search_txt' == this.keyboardItem){
          this.$set(this.searchData, 'search_txt', inputTxt.toUpperCase());
        }else{
          inputTxt = parseInt(inputTxt) || '';
          if(this.keyboardItem) this.$set(this.keyboardItem, 'measure_num', inputTxt); 
        }
      },
      //触发全键盘
      onFocus({target, key, index}) {
        this.keyboardItem = key; 
        this.keyboardTarget = target;
        this.$set(this.keyboardOption, 'show', true);
        this.$set(this.keyboardOption, 'sourceDom', target);
        this.focusItemIndex = index;
        this.$nextTick(() => {
          if(document.activeElement.tagName === 'INPUT'){
            document.activeElement.scrollIntoView({behavior: "smooth", block: "center"});
          }
        });
      },
      //关闭全键盘
      closeFullKeyboard(){
        this.$set(this.keyboardOption, 'show', false);  
      },
      //导航返回按钮
      clickLeftButton(){
        let self = this;
        self.appMaskVisible = true;
      },
      leftBack(){
        this.$router.push({name: 'replenishment', query:{no: this.replenish_no}});
      },
      //选择批次号对应的药道
      async selectSlot(item){
        try{
          let close_slot_no = this.open_slot_no;
          let open_slot_no = item.all_slot_no;
          await this.api.optLightV2({ close_slot_no, open_slot_no });
          this.open_slot_no = open_slot_no;
          this.multiData = [];
          this.selectSlotVisible = false;
        }catch(e){
          this.log.error('选择相同批次号药道放对应批次号药品错误, %s', e);
        }
      },
      //查看摆放方式图片
      viewImage(item){
        this.item = item || {};
        this.imageVisible = true;
      },
      //合并提交数据
      mergeData(origin1, origin2){
        let ret = [];
        ret = origin1.map(item => {
          let idx = origin2.findIndex(it => it.slot_no == item.slot_no);
          let obj = {...item}
          if(-1 !== idx) {
            obj.actual_number += origin2[idx].actual_number;
            origin2.splice(idx, 1); 
          }
          return obj;
        });
        ret.push(...origin2);
        return ret;
      },
      //提交补货单
      async doSubmit(){
        let self = this;
        if(self.btnDisabled.doSubmit) return;
        if(!self.computedData.length){
          self.log.debug('submit_replenish_order break, data is empty');
          return;
        }
        self.$set(self.btnDisabled, 'doSubmit', true);
        try{
          let postData = self.computedData.map(item => {
            return {
              slot_no: item.slot_no,
              merchant_product_id: item.merchant_product_id,
              real_stock: item.real_stock,
              actual_number: item.actual_number,
            };
          });
          await self.api.submit_replenish_order(self.replenish_no, postData, self.$store.state.adminAccount.op_account_id); 
          await self.api.measure_product(self.$store.state.adminAccount.op_account_id, self.stockData);
          self.$set(self.btnDisabled, 'doSubmit', false);
          self.$router.push({name: 'replenishment', query: {no: self.replenish_no}});
        }catch(e){
          self.$set(self.btnDisabled, 'doSubmit', false);
          self.log.error('submit_replenish_order error, %s', e.message);
        } 
      },
      generRowCol(){
        let rows = [{
          value:'all',
          label:'全部'
        }];
        for(let i=0;i<this.channel.aisleY;i++){
          rows.push({
            value: i+1,
            label: i+1
          });
        }
        let cols =  [ {
          value:'all',
          label:'全部'
        }];
        for(let i=0;i<this.channel.aisleX;i++){
          cols.push({
            value: i+1,
            label: i+1
          });
        }
        this.$set(this,'rows',rows);
        this.$set(this,'cols',cols);
      },
      async getList(){
        try {
          let drug_channel = this.$store.state.equipmentInfo.drug_channel;
          this.channel = {
            aisleX:drug_channel.aisleX,
            aisleY:drug_channel.aisleY
          };
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
            obj.merchant_product_id = item.merchant_product_info.merchant_product_id;
            //去掉前后空格,防止null和undefined
            obj.batch = (null === item.merchant_product_info.batch || undefined === item.merchant_product_info.batch) ? "" : String(item.merchant_product_info.batch).replace(/(^\s*)|(\s*$)/g, "");
            obj.batch_number = (null === item.merchant_product_info.batch_number || undefined === item.merchant_product_info.batch_number) ? "" : String(item.merchant_product_info.batch_number).replace(/(^\s*)|(\s*$)/g, "");
            obj.name = item.merchant_product_info.product_info.name;
            obj.bar_code = item.merchant_product_info.product_info.bar_code;
            obj.manufacturer = item.merchant_product_info.product_info.manufacturer;
            obj.specification = item.merchant_product_info.product_info.specification;
            obj.home_thumb = item.merchant_product_info.product_info.home_thumb;
            obj.show_image = item.product_display_info.show_image;
            obj.pinyin = pinyin.instance.initialTreatment(obj.name);
            obj.measureStatus = this.MeasureStatus.unMeasure;
            obj.checked = false;
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
      selectAll(flag){
        this.allList.map(item=>{
          if(flag !==undefined) this.allSelected = !!flag;
          item.checked = this.allSelected;
        });
      },
      selectOne(){
        this.selectNum = this.allList.filter(item=>item.checked && item.measureStatus == this.MeasureStatus.abnormal).length;
      },
      resetSearch(){
        this.searchData = {
          row:'all',
          col:'all',
          search_txt:"",
          filterBarCode:null,
          measureStatus:0,
        };
        this.selectAll(false);
      },
      // 自动盘点确认
      async confirmMode(){
        let slot_arr = this.allList.filter(item=> item.measure_num!==undefined && item.measureStatus !== this.MeasureStatus.measured);
        if(slot_arr.length===0) return ;
        let slot_product_list = slot_arr.map( item=>{ 
          return {
            slot_no:item.slot_no,
            actual_number: item.measure_num - item.real_stock,
            merchant_product_id: item.merchant_product_id,
            real_stock: item.real_stock,
            name: item.name,
            home_thumb: item.home_thumb,
          }
        });
        this.stockData = slot_arr.map(item => {
          return {
            slot_no: item.slot_no,
            product_count: item.measure_num
          };
        });
        this.computedData = this.mergeData(this.lastData, slot_product_list);
        this.appMaskVisible3 = true;
        // try{
        //   await this.api.measure_product(this.$route.params.op_account_id||'',slot_product_list);
        //   slot_arr.map(item=>{
        //     item.measureStatus = this.MeasureStatus.measured;
        //     item.real_stock = item.measure_num;
        //   });
        //   this.measureSlotNum =0;
        //   this.allList.map(item=>{
        //     if(item.measureStatus === this.MeasureStatus.measured) this.measureSlotNum++;
        //   });
        // }catch (e) {
        //   this.log.error('确认自动盘点error ', e);
        // }
        // this.calcNum();
      },
      // 开始盘点
      async beginMeasure(){
        if(this.btnDisabled.measure) return;
        //正在盘点，等待停止
        if(this.measuring) {
          try{
            await this.api.stop_measure_channel();
            this.measuring = false;
            this.$set(this.btnDisabled, 'measure', true);
            if(this.stopTimer) {
              clearTimeout(this.stopTimer);
              this.stopTimer = null;
            }
            this.stopTimer = setTimeout(() => {
              this.$set(this.btnDisabled, 'measure', false);
              this.stopTimer = null;
            }, 20000);
          }catch(e){
            this.log.error('stop_measure_channel errpr, e=%s', e.message);  
          }
          return;
        }
        //开始盘点
        let slot_arr = this.allList.filter(item=>!!item.checked).map(item => item.slot_no);
        if(!slot_arr.length){
          this.log.error('no selected slot');
          return;
        }
        this.measuring = true;
        try {
          this.log.info('开始盘点药道: %s', JSON.stringify(slot_arr));
          await this.api.measure_channel(slot_arr);
        } catch (e) {
          this.log.error('盘点请求失败, err=%s', e.message);
        }
      },
      // 计算盘点异常药道数 及 选中的异常药道数
      calcNum(){
        this.abnormalNum = this.allList.filter(item=>item.measureStatus==this.MeasureStatus.abnormal).length;
        this.selectNum = this.allList.filter(item=>item.checked && item.measureStatus == this.MeasureStatus.abnormal).length;
      },
      // 药品详情
      detail(item){
        this.item = item;
        if(item.bar_code){
          //JsBarcode("#barcode").options({font: "OCR-B"}).EAN13(item.bar_code.trim(), {fontSize: 14, textMargin: 0}).render();
          JsBarcode("#barcode" ,item.bar_code.trim(), {fontSize: 14, textMargin: 0}).render();
        }
        this.detailVisible = true;
      },
    },
    async mounted(){
      // 接收盘点通知
      this.api.on_notify_measure_channel = (body)=>{
        this.log.info('on_notify_measure_channel:', JSON.stringify(body));
        let slot_no = body.slot_no;
        let idx = this.allList.findIndex(item => item.slot_no == slot_no);
        if(-1 === idx){
          this.log.warn('measrue slot can not find:', slot_no);
          return;
        }
        let len = this.allList.filter(item=>!!item.checked).length;
        this.measured_percent = parseInt(body.index/len*100);
        this.$set(this.allList[idx], 'auto_measure_num', body.count);
        this.$set(this.allList[idx], 'measure_num', body.count);
        if(body.count != this.allList[idx].real_stock){
          // 异常
          this.$set(this.allList[idx], 'measureStatus', this.MeasureStatus.abnormal);
        }else{
          // 正常
          this.$set(this.allList[idx], 'measureStatus', this.MeasureStatus.measured);
          //this.$set(this.allList[idx], 'measure_num', body.count);
        }
        if(body.isfinished){
          this.measuring = false;
          if(this.stopTimer) {
            clearTimeout(this.stopTimer);
            this.stopTimer = null;
            this.$set(this.btnDisabled, 'measure', false);
          }
        }
        this.calcNum();
      };

      // 扫码枪扫描回调函数
      this.api.on_notify_scan = async (keycode)=>{
        this.log.info('收到扫码枪扫描结果:',keycode);
        try{
          if(keycode){
            //药不存在,直接提示错误; 药只存在于一个药道,直接亮灯上药; 药存在于多个药道,则查看批次号[批号batch_number批次batch]]
            let filterList = this.allList.filter(item=>item.bar_code == keycode);
            if(filterList.length===0) {
              audioPlay(__static + '/该药品不存在.mp3');
              this.log.info('该药品不存在！');
            }else{
              this.searchData.filterBarCode = keycode;
              this.selectAll(false);
              let close_slot_no = this.open_slot_no;
              let unique = [];
              for(let i=0; i<filterList.length; i++){
                let item = filterList[i];
                let str = `${item.batch_number}/${item.batch}`;
                if('/' == str) str = '(无)';
                let idx = unique.findIndex(it => {
                  return it.uid === str;
                });
                if(-1 === idx) {
                  unique.push({name: item.name, bar_code: item.bar_code, home_thumb: item.home_thumb, uid: str, all_slot_no: [item.slot_no]});
                }else{
                  unique[idx].all_slot_no.push(item.slot_no);
                }
              }
              if(!unique.length){
                this.log.error('somethig error');
              }else if(1 == unique.length){
                let open_slot_no = unique[0].all_slot_no;
                await this.api.optLightV2({ close_slot_no, open_slot_no });
                this.open_slot_no = open_slot_no;
              }else{
                this.multiData = unique;
                this.selectSlotVisible = true;
              }
            }
          }
        }catch(e){
          this.log.error('自动盘点页面扫码补货error ', e);
        }
      };
    },
    computed:{
    },
    async created(){
      let self = this;
      try{
        self.replenish_no = self.$route.query.no || (uuid.v4().replace(/-/g, ''));
        // if(!self.$store.state.equipmentInfo || !self.$store.state.equipmentInfo.equipment_product_info){
        //   let info = await this.api.get_equipment_info();
        //   if(info.equipment_info){
        //     self.$store.commit("addEquipmentInfo", info.equipment_info);
        //   } 
        // }
        let info = await this.api.get_equipment_info();
        if(info.equipment_info){
          self.$store.commit("addEquipmentInfo", info.equipment_info);
        } 
        await self.getList();
        self.generRowCol();
        self.$set(self.btnDisabled, 'measure', false);
        let data = await self.api.get_replenish_order(self.replenish_no);
        self.log.debug('recv get_replenish_order data=%s, replenish_no=%s', JSON.stringify(data), self.replenish_no);
        if(data && data.equipment_replenish_info && Array.isArray(data.equipment_replenish_info.replenish_detial_info_list) && data.equipment_replenish_info.replenish_detial_info_list.length){
          self.lastData = data.equipment_replenish_info.replenish_detial_info_list.map(item => {
            let obj = self.$store.state.equipmentInfo.equipment_product_info.slot_product_list_info.find(it => {
              return it.merchant_product_info.merchant_product_id == item.merchant_product_id;
            });
            if(obj) return {...item, name: obj.merchant_product_info.product_info.name, home_thumb: obj.merchant_product_info.product_info.home_thumb}
            return item;
          });
        }
      }catch(e){
        self.log.error('autoMeasure page created error, %s', e.message);
      }
    },
    async beforeDestroy(){
      this.api.on_notify_scan = null;
      this.api.on_notify_measure_channel = null;
      if(this.open_slot_no.length>0){
        // 关灯
        await this.api.optLightV2({close_slot_no:this.open_slot_no,open_slot_no:[]});
      }
    }
  }
</script>

<style scoped>
  

  .check {
    font-family: PingFangSC-Semibold, PingFang SC;
  }
  .box01{
    position: absolute;
    height: 1rem;
    width: 100%;
    display: flex;
    align-items: center;
  }
  .box01-font{
    text-align: center;
    font-weight: 600;
    font-size: .24rem;
    color: #FFFFFF;
  }
  .box01-font2{
    font-size: .24rem;
    font-weight: 600;
    color: #666666;
    margin-left: .1rem;
  }
  .search-input{
    width:6.4rem;
    height:.6rem;
    border-radius:.3rem;
    border: .02rem solid #4A90E2;
    position: relative;
  }
  .search-image{
    position: absolute;
    left: .1rem;
    top: .1rem;
    background: url(../../assets/search_black.png) 0 0 no-repeat;
    background-size:100% 100%;
    width: .4rem;
    height: .4rem;
  }
  .search-txt{
    position: absolute;
    left: .5rem;
    top:.14rem;
    height: .3rem;
    width: 5.5rem;
    border:0;
    font-size:.24rem;
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
    position: absolute;
    right: -.02rem;
    width:.9rem;
    bottom:-.01rem;
    top:-.01rem;
    background: #4A90E2;
    border-radius:0rem .3rem .3rem 0rem;
    font-size:.24rem;
    font-weight:500;
    color:rgba(255,255,255,1);
    letter-spacing:.02rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .box01-03{
    margin-left: 0.4rem;
    height: .6rem;
    width: 1.8rem;
    border-radius: .3rem;
    line-height: .6rem;
    background: #72B935;
  }
  .box04-01{
    position: absolute;
    right: 0;
    height: .8rem;
    line-height: .8rem;
    text-align: center;
    width: 3rem;
    background: #4A90E2;
    font-size: .36rem;
    font-weight: bold;
    color: #FFFFFF;
  }
  .box04-03{
    position: absolute;
    right: 0;
    height: .8rem;
    line-height: .8rem;
    text-align: center;
    width: 2.2rem;
    background: #4A90E2;
    font-size: .36rem;
    font-weight: bold;
    color: #FFFFFF;
  }
  .box04-04{
    position: absolute;
    right: 2.2rem;
    height: .8rem;
    line-height: .8rem;
    text-align: center;
    width: 2.2rem;
    background: #72B935;
    font-size: .36rem;
    font-weight: bold;
    color: #FFFFFF;
  }
  .btn-disabled{
    background-color: #7e7e7e !important;
  }
  .box04-02{
    background: url(../../assets/notice.png) 0 0  no-repeat;
    background-size:100% auto;
    width: .3rem;
    height:.27rem;
    margin-left: .2rem;
  }
  
  .box03-01{
    width: 100%;
    display: flex;
    align-items: center;
    text-align: center;
    font-size: .24rem;
    font-weight: 600;
    color: #666666;
    border-bottom: .01rem solid #DCDCDC;
  }
  .box03-02{
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .box03-01-01{
    width: .8rem;
    height: .8rem;
  }
  .box03-01-02{
    height: 1rem;
    margin-left: .1rem;
    display: flex;
    justify-content:space-around;
    align-items:flex-start;
    flex-direction:column;
    font-size: .16rem;
    font-weight: 400;
  }
  .box03-01-03{
    display: flex;
    justify-content: center;
  }
  .box03-01-03-01{
    width: 1.2rem;
    height: .4rem;
    background: #FFFFFF;
    border-radius: .30rem;
    border: .02rem solid #4A90E2;
  }
  .box03-01-03-02{
    height: .4rem;
    line-height: .4rem;
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
</style>

<style lang="scss" scoped>
.measure{
  width: 100vw;
  height: 100vh;
  background: rgba(255,255,255,0.49) url('../../assets/images/bg.png') no-repeat fixed;
  background-position-y: bottom ;
  background-size: contain;
  display: flex;
  flex-direction: column;
  .filter-container{
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #FFFFFF;
    height: 1rem;
    flex-shrink: 0;
    .filter-item{
      display: flex;
      align-items: center;
      width: auto;
      padding: .05rem 0;
    }
  }
  .table-header{
    height: .6rem;
    background: #E7EFFD;
    font-size: .24rem;
    font-weight: 600;
    color: #333333;
    line-height: .6rem;
    text-align: center;
    display: flex;
    flex-shrink: 0;
  }
  .table-body{
    flex-grow: 1;
    overflow-y: auto;
    background-color: #FFFFFF;
    .table-item{
      display: flex;
      align-items: center;
      padding: .1rem 0;
      .one-line{
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
    }
    .active-item{
      background-color: #DCDCDC;
    }
  }
  .table-footer{
    flex-shrink: 0;
    height: .8rem;
    background: #EEEEEE;
    display: flex;
    align-items: center;
    font-size: .28rem;
    font-weight: 600;
    color: #333333;
    letter-spacing: .01rem; 
  }
  .variable{
    flex-shrink: 0; 
  }

}




.el-custom /deep/ .el-input__icon{
  line-height: .4rem;
}
.el-custom /deep/ .el-input__inner{
  height: .4rem;
  line-height: .4rem;
}
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
.measure /deep/ .el-input-number{
  width: 140px;
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
.select-slot-mask{
  position: absolute;
  top:0;
  right: 0;
  left: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, .6);
  z-index: 110; 
  display: flex;
  justify-content: center;
  align-items: center;
  .select-container{
    position: relative;
    width: 6.8rem;
    background-color: #FFF;
    border-radius: .4rem;
    font-size: .22rem;
    .select-close{
      position: absolute;
      top: 1px;
      right: 1px;
      width: .3rem;
      height: .3rem;
      background: url('../../assets/close.png');
      background-size: contain;
    }
    .select-header{ 
      .notice1{
        background: #4A90E2;
        height: .7rem;
        padding: 0 .36rem; 
        border-top-right-radius: .4rem;
        border-top-left-radius: .4rem;
        font-size: .22rem;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
        color: #FFFFFF;
        line-height: .7rem;
        letter-spacing: 1px;
      }
      .notice2{
        padding: .2rem .36rem .24rem .36rem; 
        display: flex;
        justify-content: space-between; 
        align-items: center; 
        font-size: .22rem;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
        color: #333333;
        line-height: .3rem;
        letter-spacing: 1px;
        .name{
          flex-grow: 1;
          text-overflow: ellipsis;
          white-space: nowrap;                
          overflow: hidden;   
        }
        .barcode{
          flex-shrink: 0;
          margin-left: .3rem;
          width: auto;
        }
      }
    }
    .select-content{
      padding: 0 .36rem .36rem .36rem;
      display: flex;
      justify-content: center;
      align-items: stretch; 
      align-content: center;
      .select-left{
        width: 1.2rem;
        flex-shrink: 0;
        .product-image{
          width: 1.2rem;
          height: 1.2rem;
          background-color: #f4f5f6;
        }
      }
      .select-right{
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        .select-slot-item{
          padding: .05rem 0 .05rem .2rem;  
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: .2rem;
          font-family: PingFangSC-Regular, PingFang SC;
          line-height: .28rem;
          letter-spacing: 1px;
          .item-info{
            font-weight: 400;
            color: #666666;
          }
          .item-btn{
            background: #FFFFFF;
            border-radius: .3rem;
            border: .02rem solid #4A90E2;
            padding: .06rem .18rem;
            font-weight: 600;
            color: #4A90E2;
          }
        }
      }
    }
    .select-empty{
      padding-bottom: .36rem;
      font-size: .2rem;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 600;
      color: red;
      line-height: .28rem;
      letter-spacing: 1px;
      text-align: center;
    }
  }
}
</style>