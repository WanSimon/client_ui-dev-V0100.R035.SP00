<template>
  <div class="mask-container" v-show="isVisible">
    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: 'AppMask',
    data(){
      return {
        
      }
    },
    props:{
      isVisible: {
        type: Boolean,
        default: false
      },
    },
    methods:{
     
    },
  }
</script>

<style lang="scss" scoped>
  .mask-container{
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 998;
  }
</style>