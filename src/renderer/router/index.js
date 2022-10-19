import Vue from 'vue';
import Router from 'vue-router';
import start from '@/views/start';
import home from '@/views/home';
import drugImage from '@/views/admin/drugImage'



import idcard from '@/views/idcard_auth'
import productList from "@/views/productList"
import faceRecognition from '@/views/faceRecognition'
import shoppingList from '@/views/shoppingList'
import pickupCode from '@/views/pickupCode'
import customerProductList from '@/views/customerProductList'
import waiting from '@/views/waiting'
import customerWaiting from '@/views/customerWaiting'
import verifyProduct from '@/views/verifyProduct'
import customerVerifyProduct from '@/views/customerVerifyProduct'
import soldOut from '@/views/admin/soldOut'
import measure from '@/views/admin/autoMeasure'
import admin from '@/views/admin/index'
import debug from '@/views/admin/debug'
import scan from '@/views/scan'
import PrescList from '@/views/PrescList'
import PrescWait from '@/views/PrescWait'
import PrescCheck from '@/views/PrescCheck'
import slot from '@/views/admin/slot'
import fault from '@/views/admin/fault'
import productStock from '@/views/admin/productStock'
import productExpired from '@/views/admin/productExpired'
import equipmentFault from '@/views/admin/equipmentFault'
import replenishment from '@/views/admin/replenishment'
import ScanIdcard from '@/views/presc/ScanIdcard'
import ScanQrcode from '@/views/presc/ScanQrcode'
import ScanMedicalCard from '@/views/presc/ScanMedicalCard'
import CrashPage from '@/views/CrashPage'

const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
};

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'start',
      component: start
    },
    {
      path: '/home',
      name: 'home',
      component: home
    },
    {
      path: '/idcard',
      name: 'idcard',
      component: idcard
    },
    {
      path: '/productList',
      name: 'productList',
      component: productList
    },
    {
      path: '/faceRecognition',
      name: 'faceRecognition',
      component: faceRecognition
    },
    {
      path: '/shoppingList',
      name: 'shoppingList',
      component: shoppingList
    },
    {
      path: '/pickupCode',
      name: 'pickupCode',
      component: pickupCode
    },
    {
      path: '/customerProductList',
      name: 'customerProductList',
      component: customerProductList
    },
    {
      path: '/waiting',
      name: 'waiting',
      component: waiting
    },
    {
      path: '/customerWaiting',
      name: 'customerWaiting',
      component: customerWaiting
    },
    {
      path: '/verifyProduct',
      name: 'verifyProduct',
      component: verifyProduct
    },
    {
      path: '/customerVerifyProduct',
      name: 'customerVerifyProduct',
      component: customerVerifyProduct
    },
    {
      path: '/soldOut',
      name: 'soldOut',
      component: soldOut
    },
    {
      path: '/measure',
      name: 'measure',
      component: measure
    },
    {
      path: '/admin',
      name: 'admin',
      component: admin
    },
    {
      path: '/scan',
      name: 'scan',
      component: scan
    },
    {
      path: '/prescList',
      name: 'prescList',
      component: PrescList
    },
    {
      path: '/prescCheck',
      name: 'prescCheck',
      component: PrescCheck
    },
    {
      path: '/prescWait',
      name: 'prescWait',
      component: PrescWait
    },
    {
      path: '/slot',
      name: 'slot',
      component: slot
    },
    {
      path: '/drugImage',
      name: 'drugImage',
      component: drugImage
    },
    {
      path: '/replenishment',
      name: 'replenishment',
      component: replenishment 
    },
    {
      path: '/fault',
      name: 'fault',
      component: fault
    },
    {
      path: '/stock',
      name: 'stock',
      component: productStock
    },
    {
      path: '/expired',
      name: 'expired',
      component: productExpired
    },
    {
      path: '/equipmentFault',
      name: 'equipmentFault',
      component: equipmentFault
    },
    {
      path: '/ScanIdcard',
      name: 'ScanIdcard',
      component: ScanIdcard
    },
    {
      path: '/ScanQrcode',
      name: 'ScanQrcode',
      component: ScanQrcode
    },
    {
      path: '/ScanMedicalCard',
      name: 'ScanMedicalCard',
      component: ScanMedicalCard
    },
    {
      path: '/CrashPage',
      name: 'CrashPage',
      component: CrashPage
    },
    {
      path: '/debug',
      name: 'debug',
      component: debug
    }
  ]
})
