// pages/orders/orders.js
const app = getApp()
import request from '../../utils/request.js'
import storage from '../../utils/storage.js'
import mockData from '../../utils/mockData.js'

Page({
  data: {
    orders: [],
    loading: false,
    activeTab: 'all'
  },

  onLoad(options) {
    console.log('订单页面加载')
    
    // 如果有传入的tab参数，设置对应的tab
    if (options.tab) {
      this.setData({ activeTab: options.tab })
    }
    
    this.loadOrders()
  },

  onShow() {
    this.loadOrders()
  },

  onPullDownRefresh() {
    this.loadOrders().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载订单列表
  async loadOrders() {
    try {
      this.setData({ loading: true })
      
      // 模拟订单数据
      const allOrders = this.generateMockOrders()
      
      // 根据当前tab筛选订单
      let filteredOrders = allOrders
      if (this.data.activeTab !== 'all') {
        filteredOrders = allOrders.filter(order => order.status === this.data.activeTab)
      }
      
      this.setData({ orders: filteredOrders })
      
    } catch (error) {
      console.error('加载订单失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 生成模拟订单数据
  generateMockOrders() {
    const userType = storage.getUserType() || 'worker'
    
    if (userType === 'worker') {
      // 求职者的订单数据
      return [
        {
          id: 'order_001',
          jobTitle: '服务员 - 海底捞火锅',
          companyName: '海底捞火锅(万达店)',
          workTime: '2024-09-06 18:00-22:00',
          location: '万达广场3楼',
          salary: '120元/天',
          status: 'working',
          statusText: '进行中',
          statusTheme: 'working',
          createTime: '2024-09-06 10:30',
          description: '负责餐厅服务工作，包括点餐、上菜、清洁等'
        },
        {
          id: 'order_002',
          jobTitle: '收银员 - 星巴克咖啡',
          companyName: '星巴克咖啡(CBD店)',
          workTime: '2024-09-05 09:00-17:00',
          location: 'CBD商务区1楼',
          salary: '150元/天',
          status: 'completed',
          statusText: '已完成',
          statusTheme: 'completed',
          createTime: '2024-09-04 15:20',
          description: '负责收银、制作简单饮品、维护店面整洁'
        },
        {
          id: 'order_003',
          jobTitle: '传菜员 - 必胜客',
          companyName: '必胜客(购物中心店)',
          workTime: '2024-09-07 11:00-14:00',
          location: '购物中心2楼',
          salary: '80元/天',
          status: 'pending',
          statusText: '待确认',
          statusTheme: 'pending',
          createTime: '2024-09-06 09:15',
          description: '负责传菜、收拾餐具、协助服务员工作'
        },
        {
          id: 'order_004',
          jobTitle: '清洁员 - 肯德基',
          companyName: '肯德基(火车站店)',
          workTime: '2024-09-04 06:00-10:00',
          location: '火车站1楼',
          salary: '60元/天',
          status: 'cancelled',
          statusText: '已取消',
          statusTheme: 'cancelled',
          createTime: '2024-09-03 20:45',
          description: '负责餐厅清洁工作，包括地面、桌椅、卫生间等'
        }
      ]
    } else {
      // 企业用户的订单数据
      return [
        {
          id: 'order_101',
          jobTitle: '服务员招聘订单',
          workerName: '张小明',
          workTime: '2024-09-06 18:00-22:00',
          location: '万达广场3楼',
          salary: '120元/天',
          status: 'working',
          statusText: '进行中',
          statusTheme: 'working',
          createTime: '2024-09-06 10:30',
          description: '已确认张小明担任服务员工作'
        },
        {
          id: 'order_102',
          jobTitle: '收银员招聘订单',
          workerName: '李小红',
          workTime: '2024-09-05 09:00-17:00',
          location: 'CBD商务区1楼',
          salary: '150元/天',
          status: 'completed',
          statusText: '已完成',
          statusTheme: 'completed',
          createTime: '2024-09-04 15:20',
          description: '李小红已完成收银员工作，表现优秀'
        },
        {
          id: 'order_103',
          jobTitle: '传菜员招聘订单',
          workerName: '王小强',
          workTime: '2024-09-07 11:00-14:00',
          location: '购物中心2楼',
          salary: '80元/天',
          status: 'pending',
          statusText: '待确认',
          statusTheme: 'pending',
          createTime: '2024-09-06 09:15',
          description: '等待确认王小强的传菜员申请'
        }
      ]
    }
  },

  // 切换标签
  onTabChange(e) {
    const { value } = e.currentTarget.dataset
    this.setData({ activeTab: value })
    this.loadOrders()
  },

  // 订单详情
  onOrderDetail(e) {
    const { id } = e.currentTarget.dataset
    const order = this.data.orders.find(item => item.id === id)
    
    if (order) {
      // 将订单信息存储到本地，供详情页使用
      storage.set('currentOrder', order)
      
      wx.navigateTo({
        url: `/pages/order-detail/order-detail?id=${id}`,
        fail: () => {
          wx.showToast({
            title: '订单详情页开发中',
            icon: 'none'
          })
        }
      })
    }
  },

  // 格式化时间
  formatTime(timeStr) {
    const date = new Date(timeStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    
    return `${month}月${day}日 ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      'pending': '待确认',
      'working': '进行中',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return statusMap[status] || '未知状态'
  },

  // 获取状态主题
  getStatusTheme(status) {
    const themeMap = {
      'pending': 'pending',
      'working': 'working',
      'completed': 'completed',
      'cancelled': 'cancelled'
    }
    return themeMap[status] || 'pending'
  }
})