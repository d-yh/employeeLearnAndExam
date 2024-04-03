import Vue from 'vue'
import SvgIcon from '@/components/SvgIcon'// svg component

// register globally
Vue.component('svg-icon', SvgIcon)

// 按钮组件 全局使用
import PermissionButton from '@/components/PermissionButton'

Vue.component("PermissionButton",PermissionButton);
// Link组件 全局使用
import PermissionLink from '@/components/PermissionLink'

Vue.component("PermissionLink",PermissionLink);

const req = require.context('./svg', false, /\.svg$/)
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)
