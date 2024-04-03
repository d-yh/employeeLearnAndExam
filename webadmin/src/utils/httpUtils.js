import request from '@/utils/request'
import Qs from 'qs'

export function sendGet(url) {
  return request({
    url: encodeURI(url),//转码，解决ie浏览器带中文报错问题
    method: 'get',
    params: null
  })
}

export function sendPost(url) {
  return request({
    url: url,
    method: 'post',
    params: null,
    transformRequest: [function (data) {
      data = JSON.stringify(data)
      return data
    }],
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export function sendPostByKeyValue(url, param) {
  return request({
    url: url,
    method: 'post',
    params: param,
    transformRequest: [function (data) {
      data = Qs.stringify(data)
      return data
    }],
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
  })
}

export function sendPostByFormData(url, value) {
  return request({
    url: url,
    method: 'post',
    params: {},
    // transformRequest: [function(data) {
    //   data = JSON.stringify(data)
    //   return data
    // }],
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: value
  })
}

export function sendPostByJson(url, param) {
  return request({
    url: url,
    method: 'post',
    params: {},
    transformRequest: [function (data) {
      data = JSON.stringify(data)
      return data
    }],
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    data: param
  })
}

