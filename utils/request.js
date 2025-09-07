// utils/request.js
// 网络请求工具类

const app = getApp()

class Request {
  constructor() {
    this.baseURL = app.globalData.baseUrl
    this.timeout = 10000
  }

  // 通用请求方法
  request(options) {
    return new Promise((resolve, reject) => {
      // 显示加载提示
      if (options.loading !== false) {
        wx.showLoading({
          title: options.loadingText || '加载中...',
          mask: true
        })
      }

      wx.request({
        url: this.baseURL + options.url,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'Content-Type': 'application/json',
          'Authorization': app.globalData.token ? `Bearer ${app.globalData.token}` : '',
          ...options.header
        },
        timeout: options.timeout || this.timeout,
        success: (res) => {
          wx.hideLoading()
          
          if (res.statusCode === 200) {
            if (res.data.code === 0) {
              resolve(res.data.data)
            } else {
              this.handleError(res.data.message || '请求失败')
              reject(new Error(res.data.message || '请求失败'))
            }
          } else if (res.statusCode === 401) {
            this.handleUnauthorized()
            reject(new Error('登录已过期'))
          } else {
            this.handleError(`请求失败 (${res.statusCode})`)
            reject(new Error(`请求失败 (${res.statusCode})`))
          }
        },
        fail: (error) => {
          wx.hideLoading()
          this.handleNetworkError(error)
          reject(error)
        }
      })
    })
  }

  // GET请求
  get(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'GET',
      data,
      ...options
    })
  }

  // POST请求
  post(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...options
    })
  }

  // PUT请求
  put(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...options
    })
  }

  // DELETE请求
  delete(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'DELETE',
      data,
      ...options
    })
  }

  // 文件上传
  uploadFile(filePath, url, formData = {}, options = {}) {
    return new Promise((resolve, reject) => {
      wx.showLoading({
        title: '上传中...',
        mask: true
      })

      wx.uploadFile({
        url: this.baseURL + url,
        filePath,
        name: 'file',
        formData,
        header: {
          'Authorization': app.globalData.token ? `Bearer ${app.globalData.token}` : '',
          ...options.header
        },
        success: (res) => {
          wx.hideLoading()
          
          try {
            const data = JSON.parse(res.data)
            if (data.code === 0) {
              resolve(data.data)
            } else {
              this.handleError(data.message || '上传失败')
              reject(new Error(data.message || '上传失败'))
            }
          } catch (error) {
            this.handleError('上传失败')
            reject(error)
          }
        },
        fail: (error) => {
          wx.hideLoading()
          this.handleError('上传失败')
          reject(error)
        }
      })
    })
  }

  // 处理错误
  handleError(message) {
    wx.showToast({
      title: message,
      icon: 'error',
      duration: 2000
    })
  }

  // 处理网络错误
  handleNetworkError(error) {
    console.error('网络请求失败:', error)
    wx.showToast({
      title: '网络连接失败',
      icon: 'error',
      duration: 2000
    })
  }

  // 处理未授权
  handleUnauthorized() {
    wx.showToast({
      title: '登录已过期',
      icon: 'error',
      duration: 2000
    })
    
    // 清除本地存储
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('userType')
    
    // 重置全局数据
    app.globalData.token = ''
    app.globalData.userInfo = null
    app.globalData.userType = ''
    
    // 跳转到登录页
    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/login/login'
      })
    }, 1500)
  }
}

// 创建实例
const request = new Request()

// API接口定义
export const API = {
  // 用户相关
  login: '/api/auth/login',
  register: '/api/auth/register',
  getUserInfo: '/api/user/info',
  updateUserInfo: '/api/user/update',
  uploadAvatar: '/api/user/avatar',
  
  // 岗位相关
  getJobs: '/api/jobs',
  getJobDetail: '/api/jobs/:id',
  searchJobs: '/api/jobs/search',
  applyJob: '/api/jobs/:id/apply',
  
  // 订单相关
  getOrders: '/api/orders',
  getOrderDetail: '/api/orders/:id',
  updateOrderStatus: '/api/orders/:id/status',
  
  // 打卡相关
  checkin: '/api/checkin',
  checkout: '/api/checkout',
  getCheckinRecords: '/api/checkin/records',
  
  // 薪资相关
  getSalaryRecords: '/api/salary/records',
  getSalaryDetail: '/api/salary/:id',
  
  // 企业相关
  publishJob: '/api/company/jobs',
  getCompanyJobs: '/api/company/jobs',
  getJobApplications: '/api/company/jobs/:id/applications',
  approveApplication: '/api/company/applications/:id/approve',
  rejectApplication: '/api/company/applications/:id/reject',
  
  // 位置相关
  getNearbyJobs: '/api/jobs/nearby',
  getLocationInfo: '/api/location/info'
}

export default request