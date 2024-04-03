import { login, logout, getInfo, getPermissionList } from '@/api/user'
import { getToken, setToken, removeToken, setUserInfo, removeUserInfo } from '@/utils/auth'
import { transformTree } from "@/utils/custom";
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    userInfo: '',
    permissionList: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_USERINFO: (state, userInfo) => {
    state.userInfo = userInfo
  },
  SET_PERMISSIONLIST: (state, permissionList) => {
    state.permissionList = permissionList
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        setUserInfo(data);
        resetRouter();
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  SetPermissionList({ commit }, permissionList) {
    commit('SET_PERMISSIONLIST', permissionList)
  },

  getPermissionList({ commit, state }) {
    return new Promise((resolve, reject) => {
      getPermissionList().then(response => {
        let treeData = transformTree({
          arrayList: response.data,
          idStr: "permissionId",
          pidStr: "perPermissionId"
        });
  
        treeData = routingTransformation(treeData);
    
        treeData.push({ path: '/404', component: _import("404"), hidden: true })
        treeData.push({ path: '*', redirect: '/404', hidden: true })

      
        commit('SET_PERMISSIONLIST', treeData)
        // console.log(JSON.stringify(treeData))
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    }).catch(error => {
      reject(error)
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo().then(response => {
        if (response.code != 200) {
          localStorage.clear()
        }
        const { data } = response
        commit('SET_USERINFO', data)
        resolve(data)
      }).catch(error => {
        localStorage.clear()
        reject(error)
      })
    }).catch(error => {
      localStorage.clear()
      reject(error)
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      commit('SET_TOKEN', '')
      commit('SET_NAME', '')
      commit('SET_AVATAR', '')
      commit('SET_USERINFO', '')
      commit('SET_PERMISSIONLIST', '')
      removeToken()
      removeUserInfo()
      resetRouter()
      resolve()
      // window.location.reload()
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      removeToken()
      resolve()
    })
  }
}

/* Layout */
import Layout from '@/layout'
const _import = require('@/router/_import_' + process.env.NODE_ENV)//获取组件的方法

//将路由转换
function routingTransformation(treeData) {
  const accessedRouters = treeData.filter(route => {
    if (route.component) {
      if (route.component === 'Layout') {//Layout组件特殊处理
        route.component = Layout
      } else {
        route.component = _import(route.component)
      }
    }

    if (route.meta) {
      route.meta = JSON.parse(route.meta)
    }

    if (route.children && route.children.length > 0) {
      route.children = routingTransformation(route.children)
    }

    return true
  })

  return accessedRouters

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

