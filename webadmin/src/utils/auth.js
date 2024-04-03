// import Cookies from 'js-cookie'

const TokenKey = 'vue_token'
const UserKey = 'vue_user_info'

export function getToken() {
  return localStorage.getItem(TokenKey)
}

export function setToken(token) {
  return localStorage.setItem(TokenKey, token)
}

export function removeToken() {
  return localStorage.removeItem(TokenKey)
}

export function getUserInfo(){
  return JSON.parse(localStorage.getItem(UserKey))
}

export function setUserInfo(userInfo){
  return localStorage.setItem(UserKey,JSON.stringify(userInfo))
}

export function removeUserInfo(){
  return localStorage.removeItem(UserKey)
}