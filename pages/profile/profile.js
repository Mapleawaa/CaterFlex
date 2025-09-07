// pages/profile/profile.js
const app = getApp()
import storage from '../../utils/storage.js'
import mockData from '../../utils/mockData.js'

Page({
  data: {
    userInfo: null,
    userType: '',
    userStats: {},
    menuItems: [
      {
        id: 'personal-info',
        title: '个人资料',
        icon: 'bi-person-fill',
        path: '/pages/personal-info/personal-info'
      },
      {
        id: 'work-experience',
        title: '工作经验',
        icon: 'bi-briefcase-fill',
        path: '/pages/work-experience/work-experience'
      },
      {
        id: 'certificates',
        title: '证件管理',
        icon: 'bi-file-earmark-text-fill',
        path: '/pages/certificates/certificates'
      },
      {
        id: 'attendance-history',
        title: '考勤记录',
        icon: 'bi-calendar-check-fill',
        path: '/pages/attendance-history/attendance-history'
      },
      {
        id: 'salary-record',
        title: '收入记录',
        icon: 'bi-currency-dollar',
        path: '/pages/salary-record/salary-record'
      },
      {
        id: 'settings',
        title: '设置',
        icon: 'bi-gear-fill',
        path: '/pages/settings/settings'
      }
    ],
    companyMenuItems: [
      {
        id: 'company-info',
        title: '企业资料',
        icon: 'bi-building-fill',
        path: '/pages/company-info/company-info'
      },
      {
        id: 'job-management',
        title: '岗位管理',
        icon: 'bi-clipboard-data-fill',
        path: '/pages/job-management/job-management'
      },
      {
        id: 'staff-management',
        title: '员工管理',
        icon: 'bi-people-fill',
        path: '/pages/staff-management/staff-management'
      },
      {
        id: 'business-license',
        title: '营业执照',
        icon: 'bi-file-earmark-check-fill',
        path: '/pages/business-license/business-license'
      },
      {
        id: 'finance-record',
        title: '财务记录',
        icon: 'bi-graph-up-arrow',
        path: '/pages/finance-record/finance-record'
      },
      {
        id: 'settings',
        title: '设置',
        icon: 'bi-gear-fill',
        path: '/pages/settings/settings'
      }
    ],
    quickActions: [
      {
        id: 'checkin',
        name: '智能打卡',
        icon: 'bi-geo-alt-fill',
        action: 'checkin'
      },
      {
        id: 'attendance-history',
        name: '考勤记录',
        icon: 'bi-calendar-check-fill',
        action: 'attendanceHistory'
      },
      {
        id: 'help-center',
        name: '帮助中心',
        icon: 'bi-question-circle-fill',
        action: 'helpCenter'
      }
    ]
  },

  onLoad() {
    console.log('个人中心页面加载')
  },

  onShow() {
    this.loadUserInfo()
    this.loadUserStats()
  },

  onPullDownRefresh() {
    Promise.all([
      this.loadUserInfo(),
      this.loadUserStats()
    ]).finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = storage.getUserInfo() || mockData.debugUsers.worker
    const userType = storage.getUserType() || 'worker'
    
    this.setData({
      userInfo,
      userType
    })
  },

  // 加载用户统计数据
  loadUserStats() {
    const userType = this.data.userType
    
    if (userType === 'worker') {
      // 求职者统计数据
      const stats = {
        totalOrders: 15,
        completedOrders: 12,
        totalEarnings: 1800,
        averageRating: 4.8
      }
      this.setData({ userStats: stats })
    } else {
      // 企业用户统计数据
      const stats = {
        activeJobs: 5,
        totalHires: 28,
        monthlySpending: 15600,
        averageRating: 4.6
      }
      this.setData({ userStats: stats })
    }
  },

  // 菜单项点击
  onMenuItemTap(e) {
    const { item } = e.currentTarget.dataset
    
    // 检查是否为已实现的页面
    const implementedPages = [
      '/pages/personal-info/personal-info',
      '/pages/work-experience/work-experience',
      '/pages/certificates/certificates',
      '/pages/settings/settings'
    ]
    
    if (implementedPages.includes(item.path)) {
      wx.navigateTo({
        url: item.path
      })
    } else {
      wx.showToast({
        title: '功能开发中',
        icon: 'none',
        duration: 2000
      })
    }
  },

  // 快捷操作点击
  onQuickActionTap(e) {
    const { action } = e.currentTarget.dataset
    
    switch (action.action) {
      case 'checkin':
        this.handleCheckin()
        break
      case 'attendanceHistory':
        this.handleAttendanceHistory()
        break
      case 'helpCenter':
        this.handleHelpCenter()
        break
      default:
        wx.showToast({
          title: '功能开发中',
          icon: 'none'
        })
    }
  },

  // 智能打卡
  handleCheckin() {
    wx.navigateTo({
      url: '/pages/checkin/checkin',
      fail: (error) => {
        console.error('跳转打卡页面失败:', error)
        wx.showToast({
          title: '页面跳转失败',
          icon: 'error'
        })
      }
    })
  },

  // 考勤历史
  handleAttendanceHistory() {
    wx.navigateTo({
      url: '/pages/attendance-history/attendance-history',
      fail: (error) => {
        console.error('跳转考勤历史页面失败:', error)
        wx.showToast({
          title: '页面跳转失败',
          icon: 'error'
        })
      }
    })
  },

  // 帮助中心
  handleHelpCenter() {
    wx.showModal({
      title: '帮助中心',
      content: '如有问题请联系客服：400-123-4567',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 查看统计详情
  onStatsDetail() {
    const userType = this.data.userType
    
    if (userType === 'worker') {
      wx.navigateTo({
        url: '/pages/worker-stats/worker-stats',
        fail: () => {
          wx.showToast({
            title: '统计页面开发中',
            icon: 'none'
          })
        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/company-stats/company-stats',
        fail: () => {
          wx.showToast({
            title: '统计页面开发中',
            icon: 'none'
          })
        }
      })
    }
  },

  // 编辑头像
  onEditAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        
        // 这里应该上传到服务器，现在先更新本地显示
        const userInfo = { ...this.data.userInfo }
        userInfo.avatar = tempFilePath
        
        this.setData({ userInfo })
        storage.setUserInfo(userInfo)
        
        wx.showToast({
          title: '头像更新成功',
          icon: 'success'
        })
      },
      fail: (error) => {
        console.error('选择图片失败:', error)
      }
    })
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      confirmColor: '#F44336',
      success: (res) => {
        if (res.confirm) {
          this.handleLogout()
        }
      }
    })
  },

  // 处理退出登录
  handleLogout() {
    wx.showLoading({
      title: '退出中...'
    })
    
    // 清除本地存储
    storage.clearUserData()
    
    // 重置全局数据
    app.globalData.token = ''
    app.globalData.userInfo = null
    app.globalData.userType = ''
    
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '已退出登录',
        icon: 'success'
      })
      
      // 跳转到登录页
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/login/login'
        })
      }, 1500)
    }, 1000)
  },

  // 分享页面
  onShareAppMessage() {
    const userType = this.data.userType
    const title = userType === 'worker' ? '餐饮兼职好帮手' : '餐饮用工好平台'
    
    return {
      title: title,
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.jpg'
    }
  },

  // 格式化数字
  formatNumber(num) {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + 'w'
    }
    return num.toString()
  },

  // 格式化金额
  formatMoney(amount) {
    return (amount / 100).toFixed(2)
  }
})