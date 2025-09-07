// pages/job-detail/job-detail.js
const app = getApp()
import request from '../../utils/request.js'
import storage from '../../utils/storage.js'
import mockData from '../../utils/mockData.js'

Page({
  data: {
    jobId: '',
    jobDetail: null,
    similarJobs: [],
    loading: true,
    applying: false,
    hasApplied: false,
    isCollected: false,
    showSuccessPopup: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ jobId: options.id })
      this.loadJobDetail()
    } else {
      wx.showToast({
        title: '岗位ID不存在',
        icon: 'error'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  onShow() {
    // 检查申请状态和收藏状态
    this.checkApplicationStatus()
    this.checkCollectionStatus()
  },

  // 加载岗位详情
  async loadJobDetail() {
    try {
      this.setData({ loading: true })
      
      // 使用mock数据进行演示
      const jobDetail = mockData.jobs.find(job => job.id === this.data.jobId)
      
      if (!jobDetail) {
        throw new Error('岗位不存在')
      }

      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 800))

      // 加载相似岗位
      const similarJobs = mockData.jobs
        .filter(job => job.id !== this.data.jobId && job.title === jobDetail.title)
        .slice(0, 3)

      this.setData({ 
        jobDetail: {
          ...jobDetail,
          recruitCount: 5, // 添加招聘人数
          publishTime: this.formatTime(jobDetail.publishTime)
        },
        similarJobs
      })

      // 设置页面标题
      wx.setNavigationBarTitle({
        title: jobDetail.title
      })
      
    } catch (error) {
      console.error('加载岗位详情失败:', error)
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 检查申请状态
  checkApplicationStatus() {
    const appliedJobs = storage.get('appliedJobs') || []
    const hasApplied = appliedJobs.includes(this.data.jobId)
    this.setData({ hasApplied })
  },

  // 检查收藏状态
  checkCollectionStatus() {
    const collectedJobs = storage.get('collectedJobs') || []
    const isCollected = collectedJobs.includes(this.data.jobId)
    this.setData({ isCollected })
  },

  // 申请岗位
  async onApplyJob() {
    if (this.data.applying || this.data.hasApplied) return

    // 检查登录状态
    const userInfo = storage.getUserInfo()
    if (!userInfo) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再申请岗位',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            })
          }
        }
      })
      return
    }

    try {
      this.setData({ applying: true })
      
      // 模拟申请请求
      await new Promise(resolve => setTimeout(resolve, 1500))

      // 保存申请记录
      const appliedJobs = storage.get('appliedJobs') || []
      appliedJobs.push(this.data.jobId)
      storage.set('appliedJobs', appliedJobs)

      // 创建申请记录
      const applications = storage.get('myApplications') || []
      const newApplication = {
        id: `app_${Date.now()}`,
        jobId: this.data.jobId,
        jobTitle: this.data.jobDetail.title,
        companyName: this.data.jobDetail.companyName,
        salary: this.data.jobDetail.salary,
        salaryUnit: this.data.jobDetail.salaryUnit,
        applyTime: new Date().toISOString(),
        status: 'pending',
        statusText: '待回复'
      }
      applications.unshift(newApplication)
      storage.set('myApplications', applications)

      this.setData({ 
        hasApplied: true,
        showSuccessPopup: true
      })
      
    } catch (error) {
      console.error('申请岗位失败:', error)
      wx.showToast({
        title: error.message || '申请失败',
        icon: 'error'
      })
    } finally {
      this.setData({ applying: false })
    }
  },

  // 切换收藏状态
  onToggleCollect() {
    const collectedJobs = storage.get('collectedJobs') || []
    const isCollected = this.data.isCollected
    
    if (isCollected) {
      // 取消收藏
      const index = collectedJobs.indexOf(this.data.jobId)
      if (index > -1) {
        collectedJobs.splice(index, 1)
      }
      wx.showToast({
        title: '已取消收藏',
        icon: 'success'
      })
    } else {
      // 添加收藏
      collectedJobs.push(this.data.jobId)
      wx.showToast({
        title: '已收藏',
        icon: 'success'
      })
    }
    
    storage.set('collectedJobs', collectedJobs)
    this.setData({ isCollected: !isCollected })
  },

  // 联系企业
  onContactCompany() {
    wx.showModal({
      title: '联系企业',
      content: '是否拨打企业联系电话？',
      confirmText: '拨打',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '400-123-4567'
          })
        }
      }
    })
  },

  // 相似岗位点击
  onSimilarJobTap(e) {
    const { id } = e.currentTarget.dataset
    wx.redirectTo({
      url: `/pages/job-detail/job-detail?id=${id}`
    })
  },

  // 隐藏成功弹窗
  onHideSuccessPopup() {
    this.setData({ showSuccessPopup: false })
  },

  // 查看我的申请
  onViewMyApplications() {
    this.setData({ showSuccessPopup: false })
    wx.switchTab({
      url: '/pages/orders/orders'
    })
  },

  // 格式化时间
  formatTime(timeStr) {
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) { // 1分钟内
      return '刚刚'
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`
    } else if (diff < 86400000) { // 1天内
      return `${Math.floor(diff / 3600000)}小时前`
    } else if (diff < 604800000) { // 1周内
      return `${Math.floor(diff / 86400000)}天前`
    } else {
      return date.toLocaleDateString()
    }
  },

  // 分享岗位
  onShareAppMessage() {
    return {
      title: `${this.data.jobDetail.title} - ${this.data.jobDetail.companyName}`,
      path: `/pages/job-detail/job-detail?id=${this.data.jobId}`,
      imageUrl: '/assets/images/share-job.png'
    }
  }
})