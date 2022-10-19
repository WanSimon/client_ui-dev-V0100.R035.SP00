<template>
  <div class="confirm-container">
    <div class="confirm-content">
      <div class="confirm-message">{{messageText}}</div>
      <div class="confirm-actions">
        <div class="confirm-cancel" @click.stop="confirmReject">取消</div>
        <div class="confirm-confirm" @click.stop="confirmResolve">确认</div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'AppConfirm',
    data(){
      return {
        
      }
    },
    props:{
      //nav title
      messageText: {
        type: String,
        default: '您确定要放弃购买吗？'
      },
      //
      isVisible: {
        type: Boolean,
        default: false,
      }
    },
    methods:{
      //取消
      confirmReject(){
        this.$emit('update:isVisible', false);  
      },
      //确认
      confirmResolve(){
        let self = this;
        if(self.$listeners['confirm-resolve']){
          self.$emit('confirm-resolve');
        }else{
          self.$router.push({name: 'home', params: {'log': `app confirm dialog click event [confirmResolve]`}})
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  .confirm-container{
    width: 8.6rem;
    height: 5rem;
    background: #FFFFFF;
    border-radius: .28rem;
    .confirm-content{
      padding: 1.2rem 1.1rem .9rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .confirm-message{
        font-size: .4rem;
        font-family: PingFang-SC-Medium, PingFang-SC;
        font-weight: 500;
        color: #333333;
        line-height: .56rem;
        text-align: center;
      }
      .confirm-actions{
        margin-top: 1.2rem;
        font-size: .36rem;
        font-family: PingFang-SC-Medium, PingFang-SC;
        font-weight: 500;
        line-height: .5rem;
        display: flex;
        justify-content: space-between;
        .confirm-confirm{
          width: 2.8rem;
          height: 1.1rem;
          color: #FFFFFF;
          background: linear-gradient(90deg, #73DEFF 0%, #3FBAFF 100%);
          border-radius: .65rem;
          box-sizing: border-box;
          line-height: 1.1rem;
          text-align: center;
        }
        .confirm-cancel{
          width: 2.8rem;
          height: 1.1rem;
          color: #3FBAFF;
          background: #FFFFFF;
          border: .04rem solid;
          border-radius: .65rem;
          box-sizing: border-box;
          line-height: 1.1rem;
          text-align: center;
        }
      }
    }
  }
</style>