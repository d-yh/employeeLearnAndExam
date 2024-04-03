import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration


//路由白名单
const whiteList = [
  '/login'
  // ,
  // '/home',
  // '/projectProgress',
  // '/examinationEvaluating',
  // '/forum',
  // '/manpowerResource',
  // '/monitoring',
  // '/staffTraining',
  // '/courseInfo',
  // '/takeClass',
  // '/standClass'
] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()


  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasGetUserInfo = store.getters.userInfo
      if (hasGetUserInfo) {
        next()
      } else {
        try {
          // get user info
          await store.dispatch('user/getInfo')

          if (!store.getters.permissionList) {
            await store.dispatch('user/getPermissionList')//获取路由

            console.log("动态加载路由")
            let permissionList = store.getters.permissionList
            router.options.routes = permissionList;//必须在addroutes前，使用router.options.routes=XXXXX的方法手动添加
            router.addRoutes(permissionList) //动态添加路由
            global.antRouter = permissionList //将路由数据传递给全局变量，做侧边栏菜单渲染工作
            next({ ...to, replace: true })
          } else {
            next()
          }
          
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
