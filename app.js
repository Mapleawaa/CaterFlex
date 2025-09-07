// app.js
App({
  globalData: {
    userInfo: null,
    userType: '', // 'worker' | 'company' | 'admin'
    token: '',
    baseUrl: 'https://api.catering-work.com',
    version: '1.0.0'
  },

  onLaunch() {
    console.log('餐饮灵活用工小程序启动')
    
    // 检查更新
    this.checkForUpdate()
    
    // 初始化用户信息
    this.initUserInfo()
    
    // 初始化位置权限
    this.initLocationPermission()
  },

  onShow() {
    console.log('小程序显示')
  },

  onHide() {
    console.log('小程序隐藏')
  },

  onError(msg) {
    console.error('小程序错误:', msg)
  },

  // 检查小程序更新
  checkForUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          console.log('发现新版本')
        }
      })

      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate()
            }
          }
        })
      })

      updateManager.onUpdateFailed(() => {
        wx.showToast({
          title: '更新失败',
          icon: 'error'
        })
      })
    }
  },

  // 初始化用户信息
  initUserInfo() {
    try {
      const token = wx.getStorageSync('token')
      const userInfo = wx.getStorageSync('userInfo')
      const userType = wx.getStorageSync('userType')
      
      if (token && userInfo) {
        this.globalData.token = token
        this.globalData.userInfo = userInfo
        this.globalData.userType = userType
      }
    } catch (error) {
      console.error('初始化用户信息失败:', error)
    }
  },

  // 初始化位置权限
  initLocationPermission() {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
              console.log('位置权限授权成功')
            },
            fail: () => {
              console.log('位置权限授权失败')
            }
          })
        }
      }
    })
  },

  // 网络请求封装
  request(options) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.baseUrl + options.url,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'Content-Type': 'application/json',
          'Authorization': this.globalData.token ? `Bearer ${this.globalData.token}` : '',
          ...options.header
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else if (res.statusCode === 401) {
            // token过期，跳转登录
            this.redirectToLogin()
            reject(new Error('登录已过期'))
          } else {
            reject(new Error(res.data.message || '请求失败'))
          }
        },
        fail: (error) => {
          wx.showToast({
            title: '网络错误',
            icon: 'error'
          })
          reject(error)
        }
      })
    })
  },

  // 跳转到登录页
  redirectToLogin() {
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('userType')
    
    this.globalData.token = ''
    this.globalData.userInfo = null
    this.globalData.userType = ''
    
    wx.reLaunch({
      url: '/pages/login/login'
    })
  },

  // 获取当前位置
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude
          })
        },
        fail: (error) => {
          console.error('获取位置失败:', error)
          reject(error)
        }
      })
    })
  },

  // 工具函数：格式化时间
  formatTime(date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return `${[year, month, day].map(this.formatNumber).join('-')} ${[hour, minute, second].map(this.formatNumber).join(':')}`
  },

  formatNumber(n) {
    n = n.toString()
    return n[1] ? n : `0${n}`
  }
})