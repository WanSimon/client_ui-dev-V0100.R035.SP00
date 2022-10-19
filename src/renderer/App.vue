<template>
  <div id="app">
    <router-view :equipment-fault-flag="equipmentFaultFlag" />
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';

  export default {
    name: 'XinYao',
    computed:{
      ...mapGetters(['equipmentFault'])
    },
    data(){
      return {
        currentPath: '',
        equipmentFaultFlag: new Date().getTime()
      }
    },
    async mounted(){
    },
    watch:{
      '$route.path':function(newVal){
        this.currentPath = newVal;
      },
      equipmentFault(newVal, oldVal){
        this.log.debug('watch equipment fault, n=%s, o=%s', JSON.stringify(newVal), JSON.stringify(oldVal));
        if(newVal || (oldVal && newVal && newVal.occur_time != oldVal.occur_time)){
          if(('/waiting' != this.currentPath && '/prescWait' != this.currentPath)){
            this.$router.push({name: 'CrashPage'});
          }else{
            //this.$emit('equipment-fault'); 
            this.equipmentFaultFlag = newVal.occur_time;
          }
        }
      },
    }
  }
</script>

<style>

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    user-select: none;
  }
  * {
    padding: 0;
    margin: 0;
  }
  *{
    -webkit-tap-highlight-color: transparent;
  }
  html {
    font-size: calc(100vw/1920*100);
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
  input::-webkit-input-placeholder{
    color:rgba(174,174,174,1);
    background: #fff;
  }
  input:focus{
    outline: none;
  }
</style>
