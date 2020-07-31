import axios from '@/libs/api.request'

/**
 * 获取请求列表数据
 * @returns {wx.RequestTask | never}
 */
export const getList = (params) => {
  return axios.request({
    url: 'Count/index',
    method: 'get',
    params: params
  })
}

export const del = (id) => {
  return axios.request({
    url: 'Count/del',
    method: 'get',
    params: {
      id: id
    }
  })
}
