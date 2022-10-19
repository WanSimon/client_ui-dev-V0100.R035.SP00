import Vue from 'vue'
import App from './App'
import router from './router'
import API from './api/api'
import store from "./store"
import conf from "./js/conf";
import TopNav from './components/TopNav'
import customLog from './js/log';
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import './components/Toast/index.css';
import Toast from './components/Toast/index';



const staticDir = 'D:/xy/node/static';

Vue.component('TopNav', TopNav);
Vue.use(TopNav);
Vue.use(ElementUI);
Vue.use(Toast);

router.beforeEach((to, from, next) => {
  if('home' == to.name){
    customLog.log.info('leave page=%s', from.path);
    customLog.log.info('enter page=%s: %s', to.path, to.params.log);
  }else{
    customLog.log.info('leave page=', from.path);
    customLog.log.info('enter page=', to.path);
  }
  next();
});


Vue.prototype.log = window.log = customLog.log;
Vue.prototype.$conf = conf;
Vue.prototype.api = new API(conf.wsUrl);
Vue.prototype.api.open();

import * as filters from "./filter";
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key]);
});
Vue.config.productionTip = false;

//捕获全局未捕获的异常
Vue.config.errorHandler = function(err) {
  customLog.log.info('global uncatch error, ', err);
};

new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
});
global.__static = staticDir;