export default {
  data(){
    return {
      //时间timrer
      clockTimer: null,
      //时间日期字符串
      clock: '',
      //星期标签
      weekLabel: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
    }
  },
  methods: {
    
  },
  created(){
    let self = this;
    let dt = new Date();
    self.clock = '' + dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, 0) + '-' + String(dt.getDate()).padStart(2, 0) + ' ' + self.weekLabel[dt.getDay()] + ' ' + String(dt.getHours()).padStart(2, 0) + ':' + String(dt.getMinutes()).padStart(2, 0) + ':' + String(dt.getSeconds()).padStart(2, 0);
    self.clockTimer = setInterval(() => {
      let dt = new Date();
      self.clock = '' + dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, 0) + '-' + String(dt.getDate()).padStart(2, 0) + ' ' + self.weekLabel[dt.getDay()] + ' ' + String(dt.getHours()).padStart(2, 0) + ':' + String(dt.getMinutes()).padStart(2, 0) + ':' + String(dt.getSeconds()).padStart(2, 0);
    }, 1000);
    self.$once("hook:beforeDestroy", () => { clearInterval(self.clockTimer); });
  },
  beforeDestroy(){
    if(null !== this.clockTimer){
      clearInterval(this.clockTimer);
      this.clockTimer = null;
    }
  }
};