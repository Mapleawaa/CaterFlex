// utils/storage.js
// 本地存储工具类

class StorageUtils {
  // 设置存储
  set(key, value) {
    try {
      wx.setStorageSync(key, value)
      return true
    } catch (error) {
      console.error('存储失败:', error)
      return false
    }
  }

  // 获取存储
  get(key, defaultValue = null) {
    try {
      const value = wx.getStorageSync(key)
      return value !== '' ? value : defaultValue
    } catch (error) {
      console.error('读取存储失败:', error)
      return defaultValue
    }
  }

  // 删除存储
  remove(key) {
    try {
      wx.removeStorageSync(key)
      return true
    } catch (error) {
      console.error('删除存储失败:', error)
      return false
    }
  }

  // 清空所有存储
  clear() {
    try {
      wx.clearStorageSync()
      return true
    } catch (error) {
      console.error('清空存储失败:', error)
      return false
    }
  }

  // 获取存储信息
  getInfo() {
    try {
      return wx.getStorageInfoSync()
    } catch (error) {
      console.error('获取存储信息失败:', error)
      return null
    }
  }

  // 异步设置存储
  setAsync(key, value) {
    return new Promise((resolve, reject) => {
      wx.setStorage({
        key,
        data: value,
        success: () => resolve(true),
        fail: reject
      })
    })
  }

  // 异步获取存储
  getAsync(key) {
    return new Promise((resolve, reject) => {
      wx.getStorage({
        key,
        success: (res) => resolve(res.data),
        fail: () => resolve(null)
      })
    })
  }

  // 异步删除存储
  removeAsync(key) {
    return new Promise((resolve, reject) => {
      wx.removeStorage({
        key,
        success: () => resolve(true),
        fail: reject
      })
    })
  }

  // 存储用户信息
  setUserInfo(userInfo) {
    return this.set('userInfo', userInfo)
  }

  // 获取用户信息
  getUserInfo() {
    return this.get('userInfo')
  }

  // 存储用户类型
  setUserType(userType) {
    return this.set('userType', userType)
  }

  // 获取用户类型
  getUserType() {
    return this.get('userType')
  }

  // 存储token
  setToken(token) {
    return this.set('token', token)
  }

  // 获取token
  getToken() {
    return this.get('token')
  }

  // 清除用户相关数据
  clearUserData() {
    this.remove('token')
    this.remove('userInfo')
    this.remove('userType')
  }

  // 存储搜索历史
  setSearchHistory(history) {
    const maxHistory = 10 // 最多保存10条搜索历史
    const limitedHistory = history.slice(0, maxHistory)
    return this.set('searchHistory', limitedHistory)
  }

  // 获取搜索历史
  getSearchHistory() {
    return this.get('searchHistory', [])
  }

  // 添加搜索记录
  addSearchRecord(keyword) {
    if (!keyword || keyword.trim() === '') return
    
    const history = this.getSearchHistory()
    const filteredHistory = history.filter(item => item !== keyword)
    filteredHistory.unshift(keyword)
    
    this.setSearchHistory(filteredHistory)
  }

  // 清除搜索历史
  clearSearchHistory() {
    return this.remove('searchHistory')
  }

  // 存储位置信息
  setLocationInfo(location) {
    return this.set('locationInfo', {
      ...location,
      timestamp: Date.now()
    })
  }

  // 获取位置信息
  getLocationInfo() {
    const location = this.get('locationInfo')
    if (location && Date.now() - location.timestamp < 30 * 60 * 1000) {
      // 30分钟内的位置信息有效
      return location
    }
    return null
  }

  // 存储应用设置
  setAppSettings(settings) {
    const currentSettings = this.getAppSettings()
    const newSettings = { ...currentSettings, ...settings }
    return this.set('appSettings', newSettings)
  }

  // 获取应用设置
  getAppSettings() {
    return this.get('appSettings', {
      notifications: true,
      locationReminder: true,
      autoCheckin: false,
      theme: 'light'
    })
  }

  // 存储草稿数据
  setDraft(key, data) {
    const drafts = this.get('drafts', {})
    drafts[key] = {
      data,
      timestamp: Date.now()
    }
    return this.set('drafts', drafts)
  }

  // 获取草稿数据
  getDraft(key) {
    const drafts = this.get('drafts', {})
    const draft = drafts[key]
    
    if (draft && Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
      // 24小时内的草稿有效
      return draft.data
    }
    return null
  }

  // 删除草稿
  removeDraft(key) {
    const drafts = this.get('drafts', {})
    delete drafts[key]
    return this.set('drafts', drafts)
  }

  // 清理过期数据
  cleanExpiredData() {
    const now = Date.now()
    
    // 清理过期位置信息
    const location = this.get('locationInfo')
    if (location && now - location.timestamp > 30 * 60 * 1000) {
      this.remove('locationInfo')
    }
    
    // 清理过期草稿
    const drafts = this.get('drafts', {})
    const validDrafts = {}
    
    Object.keys(drafts).forEach(key => {
      const draft = drafts[key]
      if (now - draft.timestamp < 24 * 60 * 60 * 1000) {
        validDrafts[key] = draft
      }
    })
    
    this.set('drafts', validDrafts)
  }
}

// 创建实例
const storage = new StorageUtils()

export default storage