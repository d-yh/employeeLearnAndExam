import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/home',
    component: () => import('@/views/index'),
    hidden: true
  },
  {
    path: '/projectProgress',
    component: () => import('@/views/projectProgress/project_progress'),
    hidden: true
  },
  {
    path: '/examinationEvaluating',
    component: () => import('@/views/examinationEvaluating/examination_evaluating'),
    hidden: true
  },

  {
    path: '/forum',
    component: () => import('@/views/forum/forum'),
    hidden: true
  },
  {
    path: '/forumInfo',
    component: () => import('@/views/forum/forum_info'),
    hidden: true
  },
  {
    path: '/forumPersonal',
    component: () => import('@/views/forum/forum_personal'),
    hidden: true
  },
  {
    path: '/manpowerResource',
    component: () => import('@/views/manpower_resource/manpower_resource'),
    hidden: true
  },
  {
    path: '/monitoring',
    component: () => import('@/views/monitoring/monitoring'),
    hidden: true
  },
  {
    path: '/monitoringVideo',
    component: () => import('@/views/monitoring/monitoring_video'),
    hidden: true
  },
  {
    path: '/staffTraining',
    component: () => import('@/views/staffTraining/staff_training'),
    hidden: true
  },
  {
    path: '/courseInfo',
    component: () => import('@/views/staffTraining/course_info'),
    hidden: true
  },
  {
    path: '/takeClass',
    component: () => import('@/views/staffTraining/take_class'),
    hidden: true
  },
  {
    path: '/standClass',
    component: () => import('@/views/standClass/stand_class'),
    hidden: true
  },
  {
    path:"/wrongCollections",
    name:"wrongCollections",
    hidden:true,
    component:()=>import("@/views/personalCenter/wrong_collections")
  },
  {
    path: '/personalCenter',
    component: () => import('@/views/personalCenter/personal_center'),
    hidden: true,
    redirect: '/teachingResearch/training',
    children:[
      {
        path: 'training',
        name:'personalTraining',
        component: () => import('@/views/personalCenter/my_training'),
      },
      {
        path: 'exam',
        name:'personalExam',
        component: () => import('@/views/personalCenter/my_exam'),
      },
      {
        path: 'post',
        name:'personalPost',
        component: () => import('@/views/personalCenter/my_post'),
      },
      {
        path: 'comment',
        name:'personalComment',
        component: () => import('@/views/personalCenter/my_comment'),
      },
      {
        path: 'favorite',
        name:'personalFavorite',
        component: () => import('@/views/personalCenter/my_favorite'),
      },

    ]
  },


  // {
  //   path: '/404',
  //   component: () => import('@/views/404'),
  //   hidden: true
  // },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',

      component: () => import('@/views/dashboard/home_page'),
      meta: { title: 'Dashboard', icon: 'dashboard',    activeMenu:'/dashboard/home_page', }
    }]
  },

  // {
  //   path: '/example',
  //   component: Layout,
  //   redirect: '/example/table',
  //   name: 'Example',
  //   meta: { title: 'Example', icon: 'el-icon-s-help' },
  //   children: [
  //     {
  //       path: 'table',
  //       name: 'Table',
  //       component: () => import('@/views/table/index'),
  //       meta: { title: 'Table', icon: 'table' }
  //     },
  //     {
  //       path: 'tree',
  //       name: 'Tree',
  //       component: () => import('@/views/tree/index'),
  //       meta: { title: 'Tree', icon: 'tree' }
  //     }
  //   ]
  // },




  // // 404 page must be placed at the end !!!
  // { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes,
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
