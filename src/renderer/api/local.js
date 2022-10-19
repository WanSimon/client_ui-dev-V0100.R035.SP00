import axios from 'axios';
import conf from '@/js/conf';

const serve = axios.create({
  baseURL: conf.AllwaysOnUrl,
  timeout: 50000 
});

serve.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
);

serve.interceptors.response.use(
  response => {
    const res = response.data;
    log.info(res);
    return res;
  },
  error => {
    return Promise.reject(error);
  }
);

const api = {};
api.sendCommand = data => serve.post('/cmd', data);

export default api;