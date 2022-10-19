<template>
  <div v-show="visible">
    <div class="d-k-container">
      <div class="d-k__header">
        <div class="d-k-btn"><i class="el-icon-rank"></i></div>
        <div class="d-k-btn" @click="handleClose" style="cursor:pointer;"><i class="el-icon-close"></i></div>
      </div>
      <div class="d-k__content">
        <div class="d-k-item" @click="doClick(1)">1</div> 
        <div class="d-k-item" @click="doClick(2)">2</div> 
        <div class="d-k-item" @click="doClick(3)">3</div> 
        <div class="d-k-item" @click="doClick(4)">4</div> 
        <div class="d-k-item" @click="doClick(5)">5</div> 
        <div class="d-k-item" @click="doClick(6)">6</div> 
        <div class="d-k-item" @click="doClick(7)">7</div> 
        <div class="d-k-item" @click="doClick(8)">8</div> 
        <div class="d-k-item" @click="doClick(9)">9</div> 
        <div class="d-k-item d-k-item-btn2" @click="doClick('empty')">清空</div>
        <div class="d-k-item" @click="doClick(0)">0</div> 
        <div class="d-k-item d-k-item-btn" @click="doClick('back')"><img src="@/assets/images/backspace.png" /></div>
      </div>
    </div>
  </div>
</template>
<script>
  import { debounce } from "../js/util";

  export default{
    name: 'DigitalKeyboard',
    data () {
      return {}
    },
    props:{ 
      //原始element
      originElInput: {
        type: null,
        required: true,
      },
      //是否显示
      visible: {
        type: Boolean,
        default: false
      }
    },
    components: {  },
    mounted(){},
    watch:{},
    methods:{
      //关闭
      handleClose(){
        this.$emit('update:visible', false);
      },
      //点击事件
      doClick: debounce(function(inputText){
        var elInput = this.originElInput;
        if(!elInput) return;
        if('empty' == inputText){
          elInput.focus();
          this.$emit('callback', {key: this.inputId, val: result});
          return;
        }
        var startPos = elInput.selectionStart;
        var endPos = elInput.selectionEnd;
        if (undefined === startPos || undefined === endPos) return;
        var txt = elInput.value;
        let result, newStartPos;
        if('back' == inputText){
          if(startPos != endPos){
            result = txt.substring(0, startPos) + txt.substring(endPos);
            newStartPos = startPos ;
          }else{
            result = txt.substring(0, startPos - 1) + txt.substring(endPos); 
            newStartPos = (startPos - 1) > 0 ? (startPos - 1) : 0;
          }
        }else{
          result = txt.substring(0, startPos) + inputText + txt.substring(endPos);
          newStartPos = startPos + 1;
        }
        result = Number(result) || "";
        result = String(result);
        newStartPos = newStartPos > result.length ? 0 : newStartPos;
        if(result <= 0) result = undefined;
        this.$emit('callback', { val: result });
        this.$nextTick(() => {
          elInput.selectionStart = newStartPos;
          elInput.selectionEnd = newStartPos;
          elInput.focus();
        });
      }, 100), 
    },
    destroyed(){ }
  }
</script>

<style lang="scss" scoped>
.d-k-container{
  width: 6rem;
  position: absolute;
  z-index: 1000;
  top: 40%;
  left: calc(50% - 3rem);
  .d-k__header{
    display: flex;
    justify-content: space-between;
    padding: .1rem .1rem 0 .1rem; 
    background:#C7E1FF;
    font-size: .14rem;
  }
  .d-k__content{
    display: flex;
    flex-wrap: wrap;
    background-color: #C7E1FF;
    padding: .05rem;
    .d-k-item{
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: .24rem;
      font-weight: 600;
      height: 1rem;
      margin: .05rem;
      width: calc(calc(100% / 3) - .1rem);
      background-color: #FCFDFE;
      text-align: center;
    }
    .d-k-item:hover{
      background-color: #E7EFFD;
    }
    .d-k-item-btn{
      img{
        width: .43rem;
        height: .3rem;
      }
    }
    .d-k-item-btn2{
      font-size: 14px;
      color: #666666;
    }
  }
}
</style>