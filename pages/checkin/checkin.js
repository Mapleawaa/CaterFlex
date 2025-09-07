// pages/checkin/checkin.js
const app = getApp()
import locationUtils from '../../utils/location.js'
import storage from '../../utils/storage.js'

Page({
  data: {
    // 时间相关
    currentTime: '',
    currentDate: '',
    
    // 工作状态
    workStatus: '未开始工作',
    statusText: '待打卡',
    statusTheme: 'pending',
    nextCheckinType: 'in', // 'in' | 'out'
    
    // 位置相关
    currentLocation: null,
    workplaceDistance: null,
    locationLoading: false,
    locationError: false,
    
    // 人脸识别相关
    showFaceRecognition: false,
    cameraAuthorized: false,
    faceRecognizing: false,
    faceResult: null,
    
    // 打卡相关
    canCheckin: false,
    checkingIn: false,
    checkinTips: '',
    
    // 考勤记录
    todayRecords: [],
    monthStats: {},
    
    // 定时器
    timeTimer: null
  },

  onLoad() {
    console.log('打卡页面加载')
    this.initPage()
  },

  onShow() {
    this.refreshData()
    this.startTimeTimer()
  },

  onHide() {
    this.stopTimeTimer()
  },

  onUnload() {
    this.stopTimeTimer()
  },

  // 初始化页面
  async initPage() {
    try {
      // 更新时间显示
      this.updateTime()
      
      // 检查权限
      await this.checkPermissions()
      
      // 获取当前位置
      await this.getCurrentLocation()
      
      // 加载考勤数据
      await this.loadAttendanceData()
      
      // 更新打卡状态
      this.updateCheckinStatus()
      
    } catch (error) {
      console.error('页面初始化失败:', error)
    }
  },

  // 刷新数据
  async refreshData() {
    await Promise.all([
      this.getCurrentLocation(),
      this.loadAttendanceData()
    ])
    this.updateCheckinStatus()
  },

  // 检查权限
  async checkPermissions() {
    try {
      // 检查位置权限
      await locationUtils.checkLocationPermission()
      
      // 检查摄像头权限
      const cameraAuth = await this.checkCameraPermission()
      this.setData({ cameraAuthorized: cameraAuth })
      
    } catch (error) {
      console.error('权限检查失败:', error)
    }
  },

  // 检查摄像头权限
  checkCameraPermission() {
    return new Promise((resolve) => {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.camera'] === true) {
            resolve(true)
          } else if (res.authSetting['scope.camera'] === false) {
            resolve(false)
          } else {
            // 未授权，尝试获取权限
            wx.authorize({
              scope: 'scope.camera',
              success: () => resolve(true),
              fail: () => resolve(false)
            })
          }
        },
        fail: () => resolve(false)
      })
    })
  },

  // 获取当前位置
  async getCurrentLocation() {
    try {
      this.setData({ locationLoading: true, locationError: false })
      
      const location = await locationUtils.getCurrentLocation()
      
      // 计算与工作地点的距离
      const workplace = this.getWorkplaceLocation()
      const distance = workplace ? this.calculateDistance(location, workplace) : null
      
      this.setData({
        currentLocation: location,
        workplaceDistance: distance,
        locationLoading: false
      })
      
    } catch (error) {
      console.error('获取位置失败:', error)
      this.setData({
        locationLoading: false,
        locationError: true
      })
    }
  },

  // 获取工作地点位置（模拟数据）
  getWorkplaceLocation() {
    // 实际项目中应该从订单或工作安排中获取
    return {
      latitude: 39.908823,
      longitude: 116.397470,
      address: '北京市东城区天安门广场'
    }
  },

  // 计算距离
  calculateDistance(pos1, pos2) {
    const R = 6371000 // 地球半径（米）
    const dLat = (pos2.latitude - pos1.latitude) * Math.PI / 180
    const dLon = (pos2.longitude - pos1.longitude) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1.latitude * Math.PI / 180) * Math.cos(pos2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return Math.round(R * c)
  },

  // 加载考勤数据
  async loadAttendanceData() {
    try {
      // 加载今日考勤记录
      const todayRecords = this.getTodayRecords()
      
      // 加载月度统计
      const monthStats = this.getMonthStats()
      
      this.setData({
        todayRecords,
        monthStats
      })
      
    } catch (error) {
      console.error('加载考勤数据失败:', error)
    }
  },

  // 获取今日考勤记录（模拟数据）
  getTodayRecords() {
    const today = new Date().toDateString()
    const records = storage.get('attendanceRecords') || []
    
    return records
      .filter(record => new Date(record.timestamp).toDateString() === today)
      .map(record => ({
        ...record,
        time: this.formatTime(new Date(record.timestamp)),
        statusText: this.getRecordStatusText(record.status)
      }))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  },

  // 获取月度统计（模拟数据）
  getMonthStats() {
    return {
      workDays: 18,
      totalHours: 144,
      lateCount: 2,
      earlyCount: 1
    }
  },

  // 更新打卡状态
  updateCheckinStatus() {
    const records = this.data.todayRecords
    const hasCheckedIn = records.some(r => r.type === 'in')
    const hasCheckedOut = records.some(r => r.type === 'out')
    
    let workStatus, statusText, statusTheme, nextCheckinType, canCheckin, checkinTips
    
    if (!hasCheckedIn) {
      workStatus = '未开始工作'
      statusText = '待上班打卡'
      statusTheme = 'pending'
      nextCheckinType = 'in'
    } else if (hasCheckedIn && !hasCheckedOut) {
      workStatus = '工作中'
      statusText = '已上班打卡'
      statusTheme = 'working'
      nextCheckinType = 'out'
    } else {
      workStatus = '已完成工作'
      statusText = '已下班打卡'
      statusTheme = 'completed'
      nextCheckinType = 'in'
    }
    
    // 判断是否可以打卡
    const locationValid = this.data.workplaceDistance !== null && this.data.workplaceDistance <= 100
    const faceValid = !this.data.showFaceRecognition || (this.data.faceResult && this.data.faceResult.success)
    
    canCheckin = locationValid && faceValid
    
    if (!locationValid) {
      checkinTips = '请在工作地点100米范围内打卡'
    } else if (!faceValid && this.data.showFaceRecognition) {
      checkinTips = '请完成人脸识别验证'
    } else {
      checkinTips = ''
    }
    
    this.setData({
      workStatus,
      statusText,
      statusTheme,
      nextCheckinType,
      canCheckin,
      checkinTips
    })
  },

  // 更新时间显示
  updateTime() {
    const now = new Date()
    const time = this.formatTime(now)
    const date = this.formatDate(now)
    
    this.setData({
      currentTime: time,
      currentDate: date
    })
  },

  // 开始时间定时器
  startTimeTimer() {
    this.stopTimeTimer()
    this.timeTimer = setInterval(() => {
      this.updateTime()
    }, 1000)
  },

  // 停止时间定时器
  stopTimeTimer() {
    if (this.timeTimer) {
      clearInterval(this.timeTimer)
      this.timeTimer = null
    }
  },

  // 刷新位置
  onRefreshLocation() {
    this.getCurrentLocation()
  },

  // 授权摄像头
  async onAuthCamera() {
    try {
      const authorized = await new Promise((resolve) => {
        wx.authorize({
          scope: 'scope.camera',
          success: () => resolve(true),
          fail: () => {
            wx.showModal({
              title: '需要摄像头权限',
              content: '请在设置中开启摄像头权限',
              confirmText: '去设置',
              success: (res) => {
                if (res.confirm) {
                  wx.openSetting()
                }
              }
            })
            resolve(false)
          }
        })
      })
      
      this.setData({ cameraAuthorized: authorized })
      
    } catch (error) {
      console.error('授权摄像头失败:', error)
    }
  },

  // 摄像头错误
  onCameraError(e) {
    console.error('摄像头错误:', e)
    wx.showToast({
      title: '摄像头启动失败',
      icon: 'error'
    })
  },

  // 摄像头停止
  onCameraStop() {
    console.log('摄像头停止')
  },

  // 人脸识别
  async onCaptureFace() {
    if (!this.data.cameraAuthorized) {
      wx.showToast({
        title: '请先授权摄像头',
        icon: 'none'
      })
      return
    }
    
    try {
      this.setData({ faceRecognizing: true, faceResult: null })
      
      // 拍照
      const ctx = wx.createCameraContext()
      const photo = await new Promise((resolve, reject) => {
        ctx.takePhoto({
          quality: 'high',
          success: resolve,
          fail: reject
        })
      })
      
      // 模拟人脸识别
      await this.simulateFaceRecognition(photo.tempImagePath)
      
    } catch (error) {
      console.error('人脸识别失败:', error)
      this.setData({
        faceResult: {
          success: false,
          message: '识别失败，请重试'
        }
      })
    } finally {
      this.setData({ faceRecognizing: false })
    }
  },

  // 模拟人脸识别
  async simulateFaceRecognition(imagePath) {
    // 模拟网络请求延迟
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟识别结果（90%成功率）
    const success = Math.random() > 0.1
    
    this.setData({
      faceResult: {
        success,
        message: success ? '识别成功' : '人脸不匹配，请重试'
      }
    })
    
    // 更新打卡状态
    this.updateCheckinStatus()
  },

  // 打卡
  async onCheckin() {
    if (!this.data.canCheckin || this.data.checkingIn) {
      return
    }
    
    try {
      this.setData({ checkingIn: true })
      
      // 创建打卡记录
      const record = {
        id: Date.now().toString(),
        type: this.data.nextCheckinType,
        timestamp: new Date().toISOString(),
        location: this.data.currentLocation,
        distance: this.data.workplaceDistance,
        faceVerified: this.data.faceResult ? this.data.faceResult.success : false,
        status: 'normal' // normal | late | early
      }
      
      // 保存记录
      await this.saveCheckinRecord(record)
      
      // 刷新数据
      await this.loadAttendanceData()
      this.updateCheckinStatus()
      
      wx.showToast({
        title: '打卡成功',
        icon: 'success'
      })
      
      // 重置人脸识别状态
      this.setData({
        faceResult: null,
        showFaceRecognition: false
      })
      
    } catch (error) {
      console.error('打卡失败:', error)
      wx.showToast({
        title: '打卡失败',
        icon: 'error'
      })
    } finally {
      this.setData({ checkingIn: false })
    }
  },

  // 保存打卡记录
  async saveCheckinRecord(record) {
    const records = storage.get('attendanceRecords') || []
    records.push(record)
    storage.set('attendanceRecords', records)
  },

  // 查看历史记录
  onViewHistory() {
    wx.navigateTo({
      url: '/pages/attendance-history/attendance-history',
      fail: () => {
        wx.showToast({
          title: '功能开发中',
          icon: 'none'
        })
      }
    })
  },

  // 格式化时间
  formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const weekday = weekdays[date.getDay()]
    return `${year}年${month}月${day}日 ${weekday}`
  },

  // 获取记录状态文本
  getRecordStatusText(status) {
    const statusMap = {
      'normal': '正常',
      'late': '迟到',
      'early': '早退'
    }
    return statusMap[status] || '正常'
  }
})