import axios from '@/libs/api.request'

/**
 * 获取网站组数据
 * @returns {wx.RequestTask | never}
 */
export const getList = (params) => {
  return axios.request({
    url: 'AppWeb/index',
    method: 'get',
    params: params
  })
}

export const del = (hash) => {
  return axios.request({
    url: 'AppWeb/del',
    method: 'get',
    params: {
      hash: hash
    }
  })
}

/**
 * 显示/隐藏网站组
 * @param status
 * @param id
 * @returns {wx.RequestTask | never}
 */
export const changeStatus = (status, id) => {
  return axios.request({
    url: 'AppWeb/changeStatus',
    method: 'get',
    params: {
      status: status,
      id: id
    }
  })
}

/**
 * 新增网站组
 * @param data
 * @returns {wx.RequestTask | never}
 */
export const add = (data) => {
  return axios.request({
    url: 'AppWeb/add',
    method: 'post',
    data
  })
}

/**
 * 编辑网站组
 * @param data
 * @returns {wx.RequestTask | never}
 */
export const edit = (data) => {
  return axios.request({
    url: 'AppWeb/edit',
    method: 'post',
    data
  })
}

export const getAll = (uid) => {
  return axios.request({
    url: 'AppWeb/getAll',
    method: 'get',
    params: {
      uid: uid
    }
  })
}
