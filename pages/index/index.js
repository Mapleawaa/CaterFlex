// pages/index/index.js
const app = getApp()
import request from '../../utils/request.js'
import locationUtils from '../../utils/location.js'
import storage from '../../utils/storage.js'
import mockData from '../../utils/mockData.js'

Page({
  data: {
    userInfo: null,
    userType: '', // 'worker' | 'company'
    isLoggedIn: false,
    currentLocation: null,
    
    // 求职者相关数据
    recommendedJobs: [],
    nearbyJobs: [],
    hotJobs: [],
    
    // 企业用户相关数据
    companyStats: {},
    recommendedWorkers: [],
    
    // 快捷操作
    workerActions: [
      {
        id: 'find-job',
        name: '找工作',
        icon: 'bi-search',
        color: '#1976D2',
        path: '/pages/jobs/jobs'
      },
      {
        id: 'my-orders',
        name: '我的订单',
        icon: 'bi-clipboard-check',
        color: '#FF9800',
        path: '/pages/orders/orders'
      },
      {
        id: 'salary',
        name: '收入统计',
        icon: 'bi-currency-dollar',
        color: '#4CAF50',
        path: '/pages/salary/salary'
      },
      {
        id: 'checkin',
        name: '打卡签到',
        icon: 'bi-geo-alt-fill',
        color: '#9C27B0',
        path: '/pages/checkin/checkin'
      }
    ],
    companyActions: [
      {
        id: 'publish-job',
        name: '发布岗位',
        icon: 'bi-plus-circle-fill',
        color: '#1976D2',
        path: '/pages/publish-job/publish-job'
      },
      {
        id: 'manage-jobs',
        name: '岗位管理',
        icon: 'bi-clipboard-data',
        color: '#FF9800',
        path: '/pages/manage/manage'
      },
      {
        id: 'staff-manage',
        name: '员工管理',
        icon: 'bi-people-fill',
        color: '#4CAF50',
        path: '/pages/company/company'
      },
      {
        id: 'data-analysis',
        name: '数据分析',
        icon: 'bi-graph-up-arrow',
        color: '#9C27B0',
        path: '/pages/manage/manage?tab=analysis'
      }
    ],
    
    loading: false,
    refreshing: false,
    isEmpty: false
  },

  onLoad() {
    console.log('首页加载')
    this.initPage()
  },

  onShow() {
    console.log('首页显示')
    this.checkLoginStatus()
    if (this.data.isLoggedIn) {
      this.refreshData()
    }
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true })
    this.refreshData().finally(() => {
      this.setData({ refreshing: false })
      wx.stopPullDownRefresh()
    })
  },

  // 初始化页面
  async initPage() {
    try {
      this.setData({ loading: true })
      
      // 检查登录状态
      this.checkLoginStatus()
      
      if (this.data.isLoggedIn) {
        // 获取位置权限
        await this.initLocation()
        
        // 加载推荐内容
        await this.loadRecommendations()
      }
      
    } catch (error) {
      console.error('页面初始化失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = storage.getToken()
    const userInfo = storage.getUserInfo()
    const userType = storage.getUserType()
    
    this.setData({
      isLoggedIn: !!token,
      userInfo: userInfo,
      userType: userType || 'worker'
    })
  },

  // 初始化位置
  async initLocation() {
    try {
      await locationUtils.checkLocationPermission()
      const location = await locationUtils.getCurrentLocation()
      
      this.setData({
        currentLocation: location
      })
      
      storage.setLocationInfo(location)
    } catch (error) {
      console.error('获取位置失败:', error)
    }
  },

  // 加载推荐内容
  async loadRecommendations() {
    if (this.data.userType === 'worker') {
      await this.loadWorkerRecommendations()
    } else {
      await this.loadCompanyRecommendations()
    }
  },

  // 加载求职者推荐内容
  async loadWorkerRecommendations() {
    try {
      // 并行加载各种推荐数据
      await Promise.all([
        this.loadPersonalizedRecommendations(),
        this.loadNearbyJobs(),
        this.loadHotJobs()
      ])

      // 检查是否为空状态
      const isEmpty = this.data.recommendedJobs.length === 0 && 
                     this.data.nearbyJobs.length === 0 && 
                     this.data.hotJobs.length === 0
      
      this.setData({ isEmpty })

    } catch (error) {
      console.error('加载求职者推荐失败:', error)
    }
  },

  // 加载个性化推荐
  async loadPersonalizedRecommendations() {
    try {
      // 获取用户工作经验和技能
      const userExperiences = storage.get('userExperiences') || []
      const userSkills = this.extractUserSkills(userExperiences)
      
      // 使用智能匹配算法
      const allJobs = [...mockData.jobs]
      const recommendedJobs = this.calculateJobMatches(allJobs, userSkills, userExperiences)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5)

      this.setData({ recommendedJobs })

    } catch (error) {
      console.error('加载个性化推荐失败:', error)
    }
  },

  // 智能匹配算法
  calculateJobMatches(jobs, userSkills, userExperiences) {
    return jobs.map(job => {
      let matchScore = 0
      
      // 技能匹配度 (40%)
      const skillMatch = this.calculateSkillMatch(job.requirements || [], userSkills)
      matchScore += skillMatch * 0.4
      
      // 经验匹配度 (30%)
      const experienceMatch = this.calculateExperienceMatch(job, userExperiences)
      matchScore += experienceMatch * 0.3
      
      // 距离匹配度 (20%)
      const distanceMatch = this.calculateDistanceMatch(job.distance)
      matchScore += distanceMatch * 0.2
      
      // 薪资匹配度 (10%)
      const salaryMatch = this.calculateSalaryMatch(job.salary)
      matchScore += salaryMatch * 0.1
      
      return {
        ...job,
        matchScore: Math.round(matchScore)
      }
    })
  },

  // 计算技能匹配度
  calculateSkillMatch(jobRequirements, userSkills) {
    if (jobRequirements.length === 0 || userSkills.length === 0) return 50
    
    const matchedSkills = jobRequirements.filter(req => 
      userSkills.some(skill => 
        skill.toLowerCase().includes(req.toLowerCase()) || 
        req.toLowerCase().includes(skill.toLowerCase())
      )
    )
    
    return Math.min(100, (matchedSkills.length / jobRequirements.length) * 100)
  },

  // 计算经验匹配度
  calculateExperienceMatch(job, userExperiences) {
    if (userExperiences.length === 0) return 30
    
    // 检查是否有相关行业经验
    const hasRelevantExperience = userExperiences.some(exp => 
      exp.position.includes(job.title) || 
      job.title.includes(exp.position) ||
      exp.companyName.includes('餐饮') ||
      exp.companyName.includes('火锅') ||
      exp.companyName.includes('咖啡')
    )
    
    if (hasRelevantExperience) return 90
    
    // 根据工作经验年限计算
    const totalMonths = userExperiences.reduce((total, exp) => {
      const start = new Date(exp.startDate)
      const end = exp.endDate ? new Date(exp.endDate) : new Date()
      const months = (end - start) / (1000 * 60 * 60 * 24 * 30)
      return total + months
    }, 0)
    
    if (totalMonths >= 36) return 80 // 3年以上
    if (totalMonths >= 12) return 60 // 1年以上
    if (totalMonths >= 6) return 40  // 6个月以上
    return 20
  },

  // 计算距离匹配度
  calculateDistanceMatch(distance) {
    if (distance <= 1000) return 100  // 1公里内
    if (distance <= 3000) return 80   // 3公里内
    if (distance <= 5000) return 60   // 5公里内
    if (distance <= 10000) return 40  // 10公里内
    return 20
  },

  // 计算薪资匹配度
  calculateSalaryMatch(salary) {
    // 根据薪资水平计算匹配度
    if (salary >= 200) return 100
    if (salary >= 150) return 80
    if (salary >= 120) return 60
    if (salary >= 100) return 40
    return 20
  },

  // 提取用户技能
  extractUserSkills(experiences) {
    const skills = new Set()
    
    experiences.forEach(exp => {
      if (exp.skills && exp.skills.length > 0) {
        exp.skills.forEach(skill => skills.add(skill))
      }
      
      // 从职位名称推断技能
      const position = exp.position.toLowerCase()
      if (position.includes('服务员')) skills.add('服务员')
      if (position.includes('收银')) skills.add('收银员')
      if (position.includes('厨师')) skills.add('厨师')
      if (position.includes('传菜')) skills.add('传菜员')
      if (position.includes('咖啡')) skills.add('咖啡师')
    })
    
    return Array.from(skills)
  },

  // 加载附近岗位
  async loadNearbyJobs() {
    if (!this.data.currentLocation) {
      // 使用模拟位置数据
      const nearbyJobs = mockData.jobs
        .filter(job => job.distance <= 5000)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3)
      
      this.setData({ nearbyJobs })
      return
    }

    try {
      // 实际项目中这里会调用真实API
      const nearbyJobs = mockData.jobs
        .filter(job => job.distance <= 5000)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3)

      this.setData({ nearbyJobs })
    } catch (error) {
      console.error('加载附近岗位失败:', error)
    }
  },

  // 加载热门岗位
  async loadHotJobs() {
    try {
      // 模拟热门岗位数据
      const hotJobs = mockData.jobs.map(job => ({
        ...job,
        applyCount: Math.floor(Math.random() * 50) + 10
      }))
      .sort((a, b) => b.applyCount - a.applyCount)
      .slice(0, 4)

      this.setData({ hotJobs })
    } catch (error) {
      console.error('加载热门岗位失败:', error)
    }
  },

  // 加载企业推荐内容
  async loadCompanyRecommendations() {
    try {
      await Promise.all([
        this.loadCompanyStats(),
        this.loadRecommendedWorkers()
      ])

      const isEmpty = this.data.recommendedWorkers.length === 0
      this.setData({ isEmpty })

    } catch (error) {
      console.error('加载企业推荐失败:', error)
    }
  },

  // 加载企业统计数据
  async loadCompanyStats() {
    try {
      // 模拟企业统计数据
      const stats = {
        activeJobs: 5,
        todayApplications: 12,
        workingStaff: 28,
        monthRevenue: 156000
      }

      this.setData({ companyStats: stats })
    } catch (error) {
      console.error('加载企业统计失败:', error)
    }
  },

  // 加载推荐求职者
  async loadRecommendedWorkers() {
    try {
      // 模拟推荐求职者数据
      const workers = [
        {
          id: 'worker_001',
          name: '张小明',
          avatar: 'https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=张',
          experience: '3年餐饮服务经验',
          skills: ['服务员', '收银员', '传菜员'],
          rating: 4.8
        },
        {
          id: 'worker_002',
          name: '李小红',
          avatar: 'https://via.placeholder.com/60x60/E91E63/FFFFFF?text=李',
          experience: '2年咖啡师经验',
          skills: ['咖啡师', '收银员', '清洁员'],
          rating: 4.6
        },
        {
          id: 'worker_003',
          name: '王小强',
          avatar: 'https://via.placeholder.com/60x60/FF9800/FFFFFF?text=王',
          experience: '1年厨房助理经验',
          skills: ['厨师助理', '传菜员', '清洁员'],
          rating: 4.5
        }
      ]

      this.setData({ recommendedWorkers: workers })
    } catch (error) {
      console.error('加载推荐求职者失败:', error)
    }
  },

  // 刷新数据
  async refreshData() {
    await this.loadRecommendations()
  },

  // 快速操作点击
  onActionTap(e) {
    const { action } = e.currentTarget.dataset
    
    if (action.path) {
      if (action.path.startsWith('/pages/')) {
        // 检查是否为tabBar页面
        const tabBarPages = ['/pages/index/index', '/pages/jobs/jobs', '/pages/orders/orders', '/pages/profile/profile']
        if (tabBarPages.includes(action.path)) {
          wx.switchTab({ url: action.path })
        } else {
          wx.navigateTo({ url: action.path })
        }
      }
    }
  },

  // 岗位卡片点击
  onJobTap(e) {
    const { job } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/job-detail/job-detail?id=${job.id}`
    })
  },

  // 求职者卡片点击
  onWorkerTap(e) {
    const { worker } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/worker-detail/worker-detail?id=${worker.id}`
    })
  },

  // 查看更多推荐
  onViewMoreRecommended() {
    wx.switchTab({
      url: '/pages/jobs/jobs?filter=recommended'
    })
  },

  // 查看更多附近岗位
  onViewMoreNearby() {
    wx.switchTab({
      url: '/pages/jobs/jobs?filter=nearby'
    })
  },

  // 查看更多热门岗位
  onViewMoreHot() {
    wx.switchTab({
      url: '/pages/jobs/jobs?filter=hot'
    })
  },

  // 查看更多求职者
  onViewMoreWorkers() {
    wx.navigateTo({
      url: '/pages/worker-list/worker-list'
    })
  },

  // 完善资料
  onCompleteProfile() {
    wx.navigateTo({
      url: '/pages/personal-info/personal-info'
    })
  },

  // 跳转到登录页
  onGoLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 跳转到注册页
  onGoRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    })
  },

  // 获取问候语
  getGreeting() {
    const hour = new Date().getHours()
    if (hour < 6) return '夜深了'
    if (hour < 9) return '早上好'
    if (hour < 12) return '上午好'
    if (hour < 14) return '中午好'
    if (hour < 18) return '下午好'
    if (hour < 22) return '晚上好'
    return '夜深了'
  },

  // 格式化距离
  formatDistance(distance) {
    if (distance < 1000) {
      return `${distance}m`
    } else {
      return `${(distance / 1000).toFixed(1)}km`
    }
  }
})