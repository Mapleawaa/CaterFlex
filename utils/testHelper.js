// utils/testHelper.js - 测试辅助工具

import mockData from './mockData.js'

/**
 * 测试辅助类
 */
class TestHelper {
  constructor() {
    this.isTestMode = true
    this.mockData = mockData
  }

  /**
   * 模拟网络请求延迟
   */
  async delay(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 模拟API请求
   */
  async mockRequest(url, method = 'GET', data = {}) {
    console.log(`[Mock API] ${method} ${url}`, data)
    
    await this.delay(800) // 模拟网络延迟

    // 根据URL返回对应的模拟数据
    switch (url) {
      case '/api/auth/login':
        return this.mockData.apiResponses.login

      case '/api/auth/register':
        return this.mockData.apiResponses.register

      case '/api/auth/send-code':
        return this.mockData.apiResponses.sendCode

      case '/api/jobs':
        return this.mockData.apiResponses.getJobs

      case '/api/user/work-experience':
        return this.mockData.apiResponses.getExperiences

      case '/api/user/certificates':
        return this.mockData.apiResponses.getCertificates

      case '/api/orders':
        return this.mockData.apiResponses.getOrders

      default:
        return {
          success: true,
          data: {},
          message: '操作成功'
        }
    }
  }

  /**
   * 模拟文件上传
   */
  async mockUpload(filePath, type = 'avatar') {
    console.log(`[Mock Upload] ${type}:`, filePath)
    
    await this.delay(2000) // 模拟上传时间

    return {
      success: true,
      data: {
        url: `/assets/images/mock-${type}-${Date.now()}.jpg`,
        size: 1024 * 100, // 100KB
        type: 'image/jpeg'
      },
      message: '上传成功'
    }
  }

  /**
   * 生成测试用户数据
   */
  generateTestUser(type = 'worker') {
    const baseUser = {
      id: `test_${Date.now()}`,
      phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      userType: type,
      status: 'active',
      createTime: new Date().toISOString()
    }

    if (type === 'worker') {
      return {
        ...baseUser,
        name: `测试用户${Math.floor(Math.random() * 1000)}`,
        gender: Math.random() > 0.5 ? 'male' : 'female',
        age: Math.floor(Math.random() * 30) + 18,
        introduction: '这是一个测试用户账号'
      }
    } else {
      return {
        ...baseUser,
        companyName: `测试企业${Math.floor(Math.random() * 1000)}`,
        contactPerson: `联系人${Math.floor(Math.random() * 100)}`,
        businessLicense: `91110000${Math.floor(Math.random() * 1000000000)}`,
        introduction: '这是一个测试企业账号'
      }
    }
  }

  /**
   * 验证表单数据
   */
  validateForm(formData, rules) {
    const errors = {}

    Object.keys(rules).forEach(field => {
      const rule = rules[field]
      const value = formData[field]

      if (rule.required && (!value || value.trim() === '')) {
        errors[field] = rule.message || `${field}不能为空`
        return
      }

      if (value && rule.pattern && !rule.pattern.test(value)) {
        errors[field] = rule.message || `${field}格式不正确`
        return
      }

      if (value && rule.minLength && value.length < rule.minLength) {
        errors[field] = rule.message || `${field}长度不能少于${rule.minLength}位`
        return
      }

      if (value && rule.maxLength && value.length > rule.maxLength) {
        errors[field] = rule.message || `${field}长度不能超过${rule.maxLength}位`
        return
      }
    })

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  /**
   * 模拟地理位置
   */
  mockLocation() {
    // 北京市中心附近的随机坐标
    const baseLat = 39.9042
    const baseLng = 116.4074
    
    return {
      latitude: baseLat + (Math.random() - 0.5) * 0.1,
      longitude: baseLng + (Math.random() - 0.5) * 0.1,
      accuracy: 20,
      address: '北京市朝阳区建国路88号'
    }
  }

  /**
   * 格式化时间
   */
  formatTime(date) {
    if (!date) return ''
    
    const d = new Date(date)
    const year = d.getFullYear()
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    const hour = d.getHours().toString().padStart(2, '0')
    const minute = d.getMinutes().toString().padStart(2, '0')
    
    return `${year}-${month}-${day} ${hour}:${minute}`
  }

  /**
   * 计算距离（米）
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000 // 地球半径（米）
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return Math.round(R * c)
  }

  /**
   * 生成随机ID
   */
  generateId(prefix = '') {
    return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 日志记录
   */
  log(message, data = null) {
    const timestamp = new Date().toLocaleString()
    console.log(`[TestHelper ${timestamp}] ${message}`, data)
  }
}

// 创建全局测试助手实例
const testHelper = new TestHelper()

export default testHelper