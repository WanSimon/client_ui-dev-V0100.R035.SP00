<template>
  <div class="keyboard" v-show="showKeyboard">
    <p v-for="(keys, idx1) in keyList" :key="idx1">
      <template v-for="(key, idx2) in keys">
        <i :key="idx2" v-if="key === 'top'" @click.stop="clickKey" @touchend.stop="clickKey" class="tab-top">CapsLock</i>
        <i :key="idx2" v-else-if="key === 'del'" @click.stop="clickKey" @touchend.stop="clickKey" class="key-delete">Del</i>
        <i :key="idx2" v-else @click.stop="clickKey" @touchend.stop="clickKey">{{key}}</i>
      </template>
    </p>
  </div>
</template>
 
<script>
  export default {
    name: 'Keyboard',
    data() {
      return {
        keyList: [],
        status: 0,//0 小写 1 大写 2 数字 3 符号
        lowercase: [
          ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'], 
          ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
          ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
          ['top', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'del'],
        ],
        uppercase: [
          ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'], 
          ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
          ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
          ['top', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'del'],
        ],
        equip:!!navigator.userAgent.toLocaleLowerCase().match(/ipad|mobile/i)
      }
    },
    props: {
      option: {
        type: Object
      }
    },
    computed: {
      showKeyboard(){
        return this.option.show
      }
    },
  
    mounted() {
      this.keyList = this.lowercase
    },
  
    methods: {
      tabHandle({ value = '' }) {
        if(value.indexOf('tab-num') > -1){
          this.status = 2;
          this.keyList = this.number;
          //数字键盘数据
        }else if(value.indexOf('key-delete') > -1){
          this.emitValue('delete')
        }else if(value.indexOf('tab-blank') > -1){
          this.emitValue(' ')
        }else if(value.indexOf('tab-enter') > -1){
          this.emitValue('\n')
        }else if(value.indexOf('tab-point') > -1){
          this.emitValue('.')
        }else if(value.indexOf('tab-symbol') > -1){
          this.status = 3
        }else if(value.indexOf('tab-top') > -1){
          if(this.status === 0){
            this.status = 1
            this.keyList = this.uppercase
          }else{
            this.status = 0
            this.keyList = this.lowercase
          }
        }else{
  
        }
      },
  
      clickKey(event) {
        if(event.type === 'click' && this.equip) return
        let value = event.srcElement.innerText;
        value && value !== 'CapsLock' && value !== 'Del' ? this.emitValue(value) : this.tabHandle(event.srcElement.classList)
      },
  
      emitValue(key) {
        this.$emit('keyVal', key)
      },
  
      closeModal(e) {
        if (e.target !== this.option.sourceDom) {
          // this.showKeyboard = false
          this.$emit('close', false)
        }
      }
    }
  }
</script>

<style scoped lang="scss">
.keyboard {
  width: 100%;
  margin: 0 auto;
  font-size: 18px;
  border-radius: 2px;
  padding-top: 0.5em;
  background-color: #e5e6e8;
  user-select: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  pointer-events: auto;
  p {
    width: 95%;
    margin: 0 auto;
    height: 45px;
    margin-bottom: 0.5em;
    display: flex;
    display: -webkit-box;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    i {
      display: block;
      margin: 0 1%;
      height: 45px;
      line-height: 45px;
      font-style: normal;
      font-size: 24px;
      border-radius: 3px;
      width: 44px;
      background-color: #fff;
      text-align: center;
      flex-grow: 1;
      flex-shrink: 1;
      flex-basis: 0;
      -webkit-box-flex: 1;
      &:active {
        background-color: darken(#ccc, 10%);
      }
    }
    .tab-top {
      width: 50px;
      margin: 0 1%;
      background: #cccdd0;
      color: #fff;
      font-size: 24px;
    }
    .key-delete {
      width: 50px;
      margin: 0 1%;
      color: #827f7f;
      background: #d7d7d8;
    }
    .tab-num {
      font-size: 18px;
      background: #dedede;
      color: #5a5959;
    }
    .tab-point {
      width: 20px;
    }
    .tab-blank {
      width: 80px;
      font-size: 12px;
      padding: 0 15px;
      color: #5a5959;
      line-height: 60px;
    }
    .tab-symbol {
      width: 20px;
      font-size: 18px;
    }
    .tab-enter {
      font-size: 30px;
      line-height: 54px;
    }
    &:nth-child(2) {
      width: 88%;
    }
  }
}
</style>