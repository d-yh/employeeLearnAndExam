import request from '@/utils/request'
import { sendPostByKeyValue } from "@/utils/httpUtils";

export function login(data) {
  return sendPostByKeyValue("/user/assessToken", data)
}

export function getInfo(token) {
  return request({
    url: '/user/getUserInfo',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function getPermissionList(){
  return sendPostByKeyValue("/permission/myPermission");
}