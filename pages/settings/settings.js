// pages/settings/settings.js
const app = getApp()
import storage from '../../utils/storage.js'

Page({
  data: {
    userInfo: {},
    version: '1.0.0',
    settingsItems: [
      {
        id: 'notification',
        title: '消息通知',
        icon: 'notification',
        type: 'switch',
        value: true
      },
      {
        id: 'location',
        title: '位置服务',
        icon: 'location',
        type: 'switch',
        value: true
      },
      {
        id: 'privacy',
        title: '隐私设置',
        icon: 'lock',
        type: 'navigate',
        path: '/pages/privacy/privacy'
      },
      {
        id: 'about',
        title: '关于我们',
        icon: 'info-circle',
        type: 'navigate',
        path: '/pages/about/about'
      },
      {
        id: 'feedback',
        title: '意见反馈',
        icon: 'chat',
        type: 'navigate',
        path: '/pages/feedback/feedback'
      }
    ]
  },

  onLoad() {
    this.loadUserInfo()
    this.loadSettings()
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = storage.getUserInfo()
    this.setData({ userInfo })
  },

  // 加载设置
  loadSettings() {
    const settings = storage.getSettings() || {}
    
    const settingsItems = this.data.settingsItems.map(item => {
      if (item.type === 'switch') {
        return {
          ...item,
          value: settings[item.id] !== undefined ? settings[item.id] : item.value
        }
      }
      return item
    })
    
    this.setData({ settingsItems })
  },

  // 开关变化
  onSwitchChange(e) {
    const { id } = e.currentTarget.dataset
    const { value } = e.detail
    
    const settingsItems = this.data.settingsItems.map(item => {
      if (item.id === id) {
        return { ...item, value }
      }
      return item
    })
    
    this.setData({ settingsItems })
    
    // 保存设置
    this.saveSetting(id, value)
  },

  // 保存设置
  saveSetting(key, value) {
    const settings = storage.getSettings() || {}
    settings[key] = value
    storage.setSettings(settings)
    
    wx.showToast({
      title: '设置已保存',
      icon: 'success'
    })
  },

  // 菜单项点击
  onMenuItemTap(e) {
    const { item } = e.currentTarget.dataset
    
    if (item.type === 'navigate' && item.path) {
      wx.navigateTo({
        url: item.path
      })
    }
  },

  // 清除缓存
  onClearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除应用缓存吗？',
      success: (res) => {
        if (res.confirm) {
          this.clearCache()
        }
      }
    })
  },

  // 执行清除缓存
  clearCache() {
    try {
      // 清除本地存储（保留用户登录信息）
      const token = storage.getToken()
      const userInfo = storage.getUserInfo()
      const userType = storage.getUserType()
      
      wx.clearStorageSync()
      
      // 恢复用户登录信息
      if (token) storage.setToken(token)
      if (userInfo) storage.setUserInfo(userInfo)
      if (userType) storage.setUserType(userType)
      
      wx.showToast({
        title: '缓存已清除',
        icon: 'success'
      })
      
    } catch (error) {
      wx.showToast({
        title: '清除失败',
        icon: 'error'
      })
    }
  },

  // 检查更新
  onCheckUpdate() {
    wx.showLoading({
      title: '检查中...'
    })
    
    // 模拟检查更新
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '已是最新版本',
        icon: 'success'
      })
    }, 1500)
  }
})