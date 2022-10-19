<template>
  <div class="full-keyboard-container" :class="positionClass" v-show="showKeyboard" v-click-outside="closeModal">
    <p v-for="(keys, idx1) in keyList" :key="idx1">
      <template v-for="(key, idx2) in keys">
        <i :key="idx2" v-if="key === 'top'" @click.stop="clickKey" @touchend.stop="clickKey" class="tab-top" :class="{'tab-top-upper': 1 == status}"></i>
        <i :key="idx2" v-else-if="key === 'del'" @click.stop="clickKey" @touchend.stop="clickKey" class="key-delete"></i>
        <i :key="idx2" v-else @click.stop="clickKey" @touchend.stop="clickKey">{{key}}</i>
      </template>
    </p>
  </div>
</template>
 
<script>
  import ClickOutside from '@/directive/clickoutside';
  import { debounce } from "../js/util";

  export default {
    name: 'FullKeyboard',
    data() {
      return {
        keyList: [],
        status: this.option.status || 0,
        positionClass: this.option.position || 'position-fixed',
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
        equipment: !!navigator.userAgent.toLocaleLowerCase().match(/ipad|mobile/i)
      }
    },
    props: {
      option: {
        type: Object
      }
    },
    directives: { ClickOutside },
    computed: {
      showKeyboard(){
        return this.option.show
      }
    },
    mounted() {
      this.keyList = 1 == this.status ? this.uppercase : this.lowercase
    },
    methods: {
      tabHandle({ value = '' }) {
        if(value.indexOf('key-delete') > -1){
          this.emitValue('delete')
        }else if(value.indexOf('tab-top') > -1){
          if(this.status === 0){
            this.status = 1
            this.keyList = this.uppercase
          }else{
            this.status = 0
            this.keyList = this.lowercase
          }
        }
      },
      clickKey: debounce(function(event) {
        if(event.type === 'click' && this.equipment) return;
        let value = event.srcElement.innerText;
        value && value !== 'CapsLock' && value !== 'Del' ? this.emitValue(value) : this.tabHandle(event.srcElement.classList)
      }, 100),
      emitValue(key) {
        this.$emit('key-value', key)
      },
      closeModal(e) {
        if (e.target !== this.option.sourceDom) {
          this.$emit('close', false)
        }
      }
    }
  }
</script>

<style scoped lang="scss">
.full-keyboard-container {
  font-family: PingFangSC-Medium, PingFang SC;
  margin: 0 auto;
  font-size: .18rem;
  border-radius: 2px;
  padding: .3rem .3rem .16rem .3rem;
  background-color: #EEEEEE;
  user-select: none;
  z-index: 999;
  pointer-events: auto;
  p {
    margin: 0 auto;
    margin-bottom: .14rem;
    display: flex;
    display: -webkit-box;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    i {
      display: block;
      margin: 0 1%;
      height: .6rem;
      line-height: .6rem;
      font-style: normal;
      font-size: .36rem;
      border-radius: 3px;
      font-family: PingFang-SC-Medium, PingFang-SC;
      width: .44rem;
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
    i:first-child{
      margin-left: 0;
    }
    i:last-child{
      margin-right: 0;
    }
    .tab-top {
      width: .5rem;
      margin: 0 1%;
      background: #cccdd0 url('../assets/images/capslock_normal.png') center center no-repeat;
      background-size: .34rem .3rem;
      color: #fff;
      font-size: .24rem;
    }
    .tab-top-upper{
      background: #cccdd0 url('../assets/images/capslock_active.png') center center no-repeat; 
      background-size: .34rem .3rem;
    }
    .key-delete {
      width: .5rem;
      margin: 0 1%;
      color: #827f7f;
      background: #d7d7d8 url('../assets/images/delete_normal.png') center center no-repeat;
      background-size: .34rem .3rem;
      &:active{
        background: darken(#ccc, 10%) url('../assets/images/delete_active.png') center center no-repeat;
        background-size: .34rem .3rem; 
      }
    }
    &:nth-child(2) {
      width: 95%;
    }
  }
}
.position-fixed{
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>