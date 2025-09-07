// pages/attendance-history/attendance-history.js
import storage from '../../utils/storage.js'

Page({
  data: {
    // 当前月份
    currentMonth: '',
    currentYear: 0,
    currentMonthIndex: 0,
    
    // 统计数据
    monthStats: {
      workDays: 0,
      totalHours: 0,
      lateCount: 0,
      earlyCount: 0
    },
    
    // 筛选条件
    filterType: 'all', // all | normal | late | early
    
    // 考勤记录
    allRecords: [],
    filteredRecords: [],
    
    // 加载状态
    loading: false
  },

  onLoad() {
    console.log('考勤历史页面加载')
    this.initPage()
  },

  onShow() {
    this.loadAttendanceData()
  },

  // 初始化页面
  initPage() {
    const now = new Date()
    this.setData({
      currentYear: now.getFullYear(),
      currentMonthIndex: now.getMonth(),
      currentMonth: this.formatMonth(now.getFullYear(), now.getMonth())
    })
    
    this.loadAttendanceData()
  },

  // 加载考勤数据
  async loadAttendanceData() {
    try {
      this.setData({ loading: true })
      
      // 获取当前月份的考勤记录
      const records = await this.getMonthRecords(this.data.currentYear, this.data.currentMonthIndex)
      
      // 计算月度统计
      const monthStats = this.calculateMonthStats(records)
      
      // 按日期分组
      const groupedRecords = this.groupRecordsByDate(records)
      
      this.setData({
        allRecords: records,
        monthStats,
        loading: false
      })
      
      // 应用筛选
      this.applyFilter()
      
    } catch (error) {
      console.error('加载考勤数据失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  // 获取指定月份的考勤记录
  async getMonthRecords(year, monthIndex) {
    const allRecords = storage.get('attendanceRecords') || []
    
    // 筛选指定月份的记录
    const monthRecords = allRecords.filter(record => {
      const recordDate = new Date(record.timestamp)
      return recordDate.getFullYear() === year && recordDate.getMonth() === monthIndex
    })
    
    // 处理记录数据
    return monthRecords.map(record => ({
      ...record,
      date: new Date(record.timestamp),
      time: this.formatTime(new Date(record.timestamp)),
      typeText: record.type === 'in' ? '上班打卡' : '下班打卡',
      statusText: this.getStatusText(record.status),
      showExtra: false
    })).sort((a, b) => a.date - b.date)
  },

  // 计算月度统计
  calculateMonthStats(records) {
    const stats = {
      workDays: 0,
      totalHours: 0,
      lateCount: 0,
      earlyCount: 0
    }
    
    // 按日期分组
    const dayGroups = {}
    records.forEach(record => {
      const dateKey = record.date.toDateString()
      if (!dayGroups[dateKey]) {
        dayGroups[dateKey] = []
      }
      dayGroups[dateKey].push(record)
    })
    
    // 计算统计数据
    Object.keys(dayGroups).forEach(dateKey => {
      const dayRecords = dayGroups[dateKey]
      const checkinRecord = dayRecords.find(r => r.type === 'in')
      const checkoutRecord = dayRecords.find(r => r.type === 'out')
      
      if (checkinRecord) {
        stats.workDays++
        
        // 统计迟到
        if (checkinRecord.status === 'late') {
          stats.lateCount++
        }
        
        // 统计早退
        if (checkoutRecord && checkoutRecord.status === 'early') {
          stats.earlyCount++
        }
        
        // 计算工时
        if (checkinRecord && checkoutRecord) {
          const workHours = (checkoutRecord.date - checkinRecord.date) / (1000 * 60 * 60)
          stats.totalHours += Math.round(workHours * 10) / 10
        }
      }
    })
    
    return stats
  },

  // 按日期分组记录
  groupRecordsByDate(records) {
    const groups = {}
    
    records.forEach(record => {
      const dateKey = record.date.toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: this.formatDate(record.date),
          weekday: this.getWeekday(record.date),
          records: [],
          workHours: 0,
          dayStatus: 'normal',
          dayStatusText: '正常'
        }
      }
      groups[dateKey].records.push(record)
    })
    
    // 计算每日工时和状态
    Object.keys(groups).forEach(dateKey => {
      const group = groups[dateKey]
      const checkinRecord = group.records.find(r => r.type === 'in')
      const checkoutRecord = group.records.find(r => r.type === 'out')
      
      if (checkinRecord && checkoutRecord) {
        const workHours = (checkoutRecord.date - checkinRecord.date) / (1000 * 60 * 60)
        group.workHours = Math.round(workHours * 10) / 10
      }
      
      // 确定日状态
      if (group.records.some(r => r.status === 'late')) {
        group.dayStatus = 'late'
        group.dayStatusText = '迟到'
      } else if (group.records.some(r => r.status === 'early')) {
        group.dayStatus = 'early'
        group.dayStatusText = '早退'
      }
    })
    
    // 转换为数组并排序
    return Object.keys(groups)
      .map(dateKey => groups[dateKey])
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  },

  // 应用筛选
  applyFilter() {
    let filtered = [...this.data.allRecords]
    
    if (this.data.filterType !== 'all') {
      filtered = filtered.filter(record => record.status === this.data.filterType)
    }
    
    const groupedRecords = this.groupRecordsByDate(filtered)
    this.setData({ filteredRecords: groupedRecords })
  },

  // 上一个月
  onPrevMonth() {
    let { currentYear, currentMonthIndex } = this.data
    
    currentMonthIndex--
    if (currentMonthIndex < 0) {
      currentMonthIndex = 11
      currentYear--
    }
    
    this.setData({
      currentYear,
      currentMonthIndex,
      currentMonth: this.formatMonth(currentYear, currentMonthIndex)
    })
    
    this.loadAttendanceData()
  },

  // 下一个月
  onNextMonth() {
    let { currentYear, currentMonthIndex } = this.data
    const now = new Date()
    
    // 不能超过当前月份
    if (currentYear >= now.getFullYear() && currentMonthIndex >= now.getMonth()) {
      wx.showToast({
        title: '不能查看未来月份',
        icon: 'none'
      })
      return
    }
    
    currentMonthIndex++
    if (currentMonthIndex > 11) {
      currentMonthIndex = 0
      currentYear++
    }
    
    this.setData({
      currentYear,
      currentMonthIndex,
      currentMonth: this.formatMonth(currentYear, currentMonthIndex)
    })
    
    this.loadAttendanceData()
  },

  // 筛选条件改变
  onFilterChange(e) {
    const filterType = e.currentTarget.dataset.type
    this.setData({ filterType })
    this.applyFilter()
  },

  // 切换记录详情
  onToggleExtra(e) {
    const recordId = e.currentTarget.dataset.id
    const filteredRecords = this.data.filteredRecords.map(group => ({
      ...group,
      records: group.records.map(record => ({
        ...record,
        showExtra: record.id === recordId ? !record.showExtra : record.showExtra
      }))
    }))
    
    this.setData({ filteredRecords })
  },

  // 导出考勤记录
  onExportRecords() {
    wx.showModal({
      title: '导出功能',
      content: '考勤记录导出功能正在开发中，敬请期待',
      showCancel: false
    })
  },

  // 格式化月份
  formatMonth(year, monthIndex) {
    const months = [
      '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'
    ]
    return `${year}年${months[monthIndex]}`
  },

  // 格式化日期
  formatDate(date) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${month}月${day}日`
  },

  // 格式化时间
  formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  },

  // 获取星期
  getWeekday(date) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekdays[date.getDay()]
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      'normal': '正常',
      'late': '迟到',
      'early': '早退'
    }
    return statusMap[status] || '正常'
  }
})