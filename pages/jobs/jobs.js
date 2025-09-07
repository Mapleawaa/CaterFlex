// pages/jobs/jobs.js
const app = getApp()
import request from '../../utils/request.js'
import locationUtils from '../../utils/location.js'
import mockData from '../../utils/mockData.js'

Page({
  data: {
    jobs: [],
    loading: false,
    refreshing: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    searchKeyword: '',
    filters: {
      salary: '',
      distance: '',
      workTime: ''
    },
    sortType: 'default',
    showFilterPopup: false,
    showSortPopup: false,
    currentFilterType: ''
  },

  onLoad() {
    console.log('岗位列表页面加载')
    this.loadJobs()
  },

  onShow() {
    // 页面显示时刷新数据
    this.refreshJobs()
  },

  onPullDownRefresh() {
    this.refreshJobs()
  },

  onReachBottom() {
    this.loadMoreJobs()
  },

  // 加载岗位列表
  async loadJobs(isRefresh = false) {
    if (this.data.loading) return

    try {
      this.setData({ 
        loading: true,
        refreshing: isRefresh
      })

      // 使用mock数据进行演示
      let jobs = [...mockData.jobs]
      
      // 应用搜索过滤
      if (this.data.searchKeyword) {
        const keyword = this.data.searchKeyword.toLowerCase()
        jobs = jobs.filter(job => 
          job.title.toLowerCase().includes(keyword) ||
          job.companyName.toLowerCase().includes(keyword) ||
          job.description.toLowerCase().includes(keyword)
        )
      }

      // 应用筛选器
      jobs = this.applyFilters(jobs)
      
      // 应用排序
      jobs = this.applySorting(jobs)

      // 模拟分页
      const page = isRefresh ? 1 : this.data.page
      const startIndex = (page - 1) * this.data.pageSize
      const endIndex = startIndex + this.data.pageSize
      const pageJobs = jobs.slice(startIndex, endIndex)
      
      const newJobs = isRefresh ? pageJobs : [...this.data.jobs, ...pageJobs]
      const hasMore = endIndex < jobs.length

      this.setData({
        jobs: newJobs,
        hasMore: hasMore,
        page: isRefresh ? 2 : this.data.page + 1
      })

      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500))

    } catch (error) {
      console.error('加载岗位失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ 
        loading: false,
        refreshing: false
      })
      wx.stopPullDownRefresh()
    }
  },

  // 应用筛选器
  applyFilters(jobs) {
    let filteredJobs = [...jobs]

    // 薪资筛选
    if (this.data.filters.salary) {
      const salaryFilter = this.data.filters.salary
      filteredJobs = filteredJobs.filter(job => {
        const salary = job.salary
        switch (salaryFilter) {
          case '100-150':
            return salary >= 100 && salary <= 150
          case '150-200':
            return salary >= 150 && salary <= 200
          case '200+':
            return salary >= 200
          default:
            return true
        }
      })
    }

    // 距离筛选
    if (this.data.filters.distance) {
      const distanceFilter = parseInt(this.data.filters.distance)
      filteredJobs = filteredJobs.filter(job => job.distance <= distanceFilter)
    }

    // 时间筛选
    if (this.data.filters.workTime) {
      const timeFilter = this.data.filters.workTime
      filteredJobs = filteredJobs.filter(job => {
        const workTime = job.workTime.toLowerCase()
        switch (timeFilter) {
          case 'morning':
            return workTime.includes('09:') || workTime.includes('10:') || workTime.includes('上午')
          case 'afternoon':
            return workTime.includes('13:') || workTime.includes('14:') || workTime.includes('下午')
          case 'evening':
            return workTime.includes('18:') || workTime.includes('19:') || workTime.includes('晚')
          case 'flexible':
            return workTime.includes('灵活') || workTime.includes('弹性')
          default:
            return true
        }
      })
    }

    return filteredJobs
  },

  // 应用排序
  applySorting(jobs) {
    let sortedJobs = [...jobs]

    switch (this.data.sortType) {
      case 'salary_desc':
        sortedJobs.sort((a, b) => b.salary - a.salary)
        break
      case 'distance_asc':
        sortedJobs.sort((a, b) => a.distance - b.distance)
        break
      case 'time_desc':
        sortedJobs.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime))
        break
      default:
        // 默认排序：紧急程度 + 发布时间
        sortedJobs.sort((a, b) => {
          const urgencyOrder = { high: 3, medium: 2, low: 1 }
          const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
          if (urgencyDiff !== 0) return urgencyDiff
          return new Date(b.publishTime) - new Date(a.publishTime)
        })
    }

    return sortedJobs
  },

  // 刷新岗位
  refreshJobs() {
    this.setData({
      page: 1,
      jobs: []
    })
    this.loadJobs(true)
  },

  // 加载更多岗位
  loadMoreJobs() {
    if (!this.data.hasMore || this.data.loading) return
    this.loadJobs()
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },

  // 搜索
  onSearch() {
    this.refreshJobs()
  },

  // 显示筛选弹窗
  onShowFilter(e) {
    const { type } = e.currentTarget.dataset
    this.setData({
      showFilterPopup: true,
      currentFilterType: type
    })
  },

  // 隐藏筛选弹窗
  onHideFilter() {
    this.setData({
      showFilterPopup: false,
      currentFilterType: ''
    })
  },

  // 选择筛选项
  onSelectFilter(e) {
    const { type, value } = e.currentTarget.dataset
    this.setData({
      [`filters.${type}`]: value,
      showFilterPopup: false,
      currentFilterType: ''
    })
    this.refreshJobs()
  },

  // 显示排序弹窗
  onShowSort() {
    this.setData({
      showSortPopup: true
    })
  },

  // 隐藏排序弹窗
  onHideSort() {
    this.setData({
      showSortPopup: false
    })
  },

  // 选择排序方式
  onSelectSort(e) {
    const { value } = e.currentTarget.dataset
    this.setData({
      sortType: value,
      showSortPopup: false
    })
    this.refreshJobs()
  },

  // 岗位卡片点击
  onJobTap(e) {
    const { job } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/job-detail/job-detail?id=${job.id}`
    })
  }
})