import axios from 'axios';
import conf from '@/js/conf';

const serve = axios.create({
  baseURL: conf.connectUrl,
  timeout: 50000 
})

serve.interceptors.request.use(
  config => {
    //config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
    //config.headers['Authorization'] = conf.Authorization;
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

serve.interceptors.response.use(
  response => {
    const res = response.data;
    if(res && res.hasOwnProperty('status') && res.status == 1){
      return res.data;
    } else {
      let err = new Error(res.reason || 'unknown error');
      err.code = res.status;
      return Promise.reject(err);
    }
  },
  error => {
    return Promise.reject(error);
  }
)

const api = {};
//获取订单处方信息 { card_no }
api.getPrescList = data => serve.post('/zqy/presc/list', data);
//更新订单状态 { prescNoArr, status }
api.updatePrescStatus = data => serve.post('/zqy/presc/status', data);
//发药 { prescList, equipment_id }
api.sendPrescResult = data => serve.post('/zqy/presc/dispatch', data);

export default api;