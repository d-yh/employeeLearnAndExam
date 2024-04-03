import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import App from './App'
import store from './store'
import router from './router'
import './utils/dialog'

import '@/icons' // icon
import '@/permission' // permission control

import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue)
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'remixicon/fonts/remixicon.css'

import '@/styles/index.scss' // global css
/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
// if (process.env.NODE_ENV === 'production') {
//   const { mockXHR } = require('../mock')
//   mockXHR()
// }

// set ElementUI lang to EN
// Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明


//element 通用配置
ElementUI.Dialog.props.closeOnClickModal.default = false;
ElementUI.Dialog.props.lockScroll.default = false;
ElementUI.Dialog.props.closeOnPressEscape.default = false;
Vue.use(ElementUI)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
