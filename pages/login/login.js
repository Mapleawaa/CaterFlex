// pages/login/login.js
const app = getApp()
import request from '../../utils/request.js'
import storage from '../../utils/storage.js'
import validator from '../../utils/validator.js'

Page({
  data: {
    loginType: 'phone', // 'phone' | 'wechat'
    userType: 'worker', // 'worker' | 'company'
    formData: {
      phone: '',
      password: '',
      smsCode: '',
      agreementChecked: false
    },
    showPassword: false,
    smsCountdown: 0,
    loading: false,
    smsLoading: false
  },

  onLoad(options) {
    console.log('登录页加载')
    
    // 检查是否已登录
    const token = storage.getToken()
    if (token) {
      this.redirectToHome()
      return
    }

    // 获取跳转参数
    if (options.userType) {
      this.setData({
        userType: options.userType
      })
    }
  },

  onShow() {
    // 清理倒计时
    this.clearSmsTimer()
  },

  onUnload() {
    // 清理倒计时
    this.clearSmsTimer()
  },

  // 切换登录方式
  onLoginTypeChange(e) {
    this.setData({
      loginType: e.detail.value,
      formData: {
        ...this.data.formData,
        password: '',
        smsCode: ''
      }
    })
  },

  // 切换用户类型
  onUserTypeChange(e) {
    this.setData({
      userType: e.detail.value
    })
  },

  // 输入框变化
  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    
    this.setData({
      [`formData.${field}`]: value
    })
  },

  // 切换密码显示
  onTogglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    })
  },

  // 协议勾选
  onAgreementChange(e) {
    this.setData({
      'formData.agreementChecked': e.detail.checked
    })
  },

  // 发送短信验证码
  async onSendSms() {
    const { phone } = this.data.formData
    
    // 验证手机号
    if (!validator.isPhone(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'error'
      })
      return
    }

    if (this.data.smsCountdown > 0) {
      return
    }

    try {
      this.setData({ smsLoading: true })
      
      await request.post('/api/auth/send-sms', {
        phone,
        type: 'login'
      })

      wx.showToast({
        title: '验证码已发送',
        icon: 'success'
      })

      // 开始倒计时
      this.startSmsCountdown()

    } catch (error) {
      console.error('发送验证码失败:', error)
      wx.showToast({
        title: error.message || '发送失败',
        icon: 'error'
      })
    } finally {
      this.setData({ smsLoading: false })
    }
  },

  // 开始短信倒计时
  startSmsCountdown() {
    let countdown = 60
    this.setData({ smsCountdown: countdown })

    this.smsTimer = setInterval(() => {
      countdown--
      this.setData({ smsCountdown: countdown })

      if (countdown <= 0) {
        this.clearSmsTimer()
      }
    }, 1000)
  },

  // 清理短信倒计时
  clearSmsTimer() {
    if (this.smsTimer) {
      clearInterval(this.smsTimer)
      this.smsTimer = null
    }
    this.setData({ smsCountdown: 0 })
  },

  // 登录提交
  async onLogin() {
    if (this.data.loading) return

    const { formData, loginType, userType } = this.data

    // 表单验证
    const validationResult = this.validateForm()
    if (!validationResult.isValid) {
      validator.showValidationError(validationResult.errors)
      return
    }

    try {
      this.setData({ loading: true })

      let loginData = {
        userType,
        loginType
      }

      if (loginType === 'phone') {
        loginData = {
          ...loginData,
          phone: formData.phone,
          password: formData.password
        }
      } else {
        loginData = {
          ...loginData,
          phone: formData.phone,
          smsCode: formData.smsCode
        }
      }

      const result = await request.post('/api/auth/login', loginData)

      // 保存登录信息
      storage.setToken(result.token)
      storage.setUserInfo(result.userInfo)
      storage.setUserType(result.userInfo.type)

      // 更新全局数据
      app.globalData.token = result.token
      app.globalData.userInfo = result.userInfo
      app.globalData.userType = result.userInfo.type

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      // 跳转到首页
      setTimeout(() => {
        this.redirectToHome()
      }, 1500)

    } catch (error) {
      console.error('登录失败:', error)
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 微信登录
  async onWechatLogin() {
    try {
      this.setData({ loading: true })

      // 获取微信登录凭证
      const loginRes = await this.getWechatLoginCode()
      
      // 获取用户信息
      const userInfoRes = await this.getWechatUserInfo()

      const result = await request.post('/api/auth/wechat-login', {
        code: loginRes.code,
        userInfo: userInfoRes.userInfo,
        userType: this.data.userType
      })

      // 保存登录信息
      storage.setToken(result.token)
      storage.setUserInfo(result.userInfo)
      storage.setUserType(result.userInfo.type)

      // 更新全局数据
      app.globalData.token = result.token
      app.globalData.userInfo = result.userInfo
      app.globalData.userType = result.userInfo.type

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      setTimeout(() => {
        this.redirectToHome()
      }, 1500)

    } catch (error) {
      console.error('微信登录失败:', error)
      wx.showToast({
        title: error.message || '微信登录失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 获取微信登录凭证
  getWechatLoginCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      })
    })
  },

  // 获取微信用户信息
  getWechatUserInfo() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: resolve,
        fail: reject
      })
    })
  },

  // 表单验证
  validateForm() {
    const { formData, loginType } = this.data
    
    let rules = {}

    if (loginType === 'phone') {
      rules = {
        phone: [
          { type: 'required', message: '请输入手机号' },
          { type: 'phone', message: '请输入正确的手机号' }
        ],
        password: [
          { type: 'required', message: '请输入密码' }
        ]
      }
    } else {
      rules = {
        phone: [
          { type: 'required', message: '请输入手机号' },
          { type: 'phone', message: '请输入正确的手机号' }
        ],
        smsCode: [
          { type: 'required', message: '请输入验证码' },
          { type: 'length', min: 4, max: 6, message: '验证码长度为4-6位' }
        ]
      }
    }

    // 协议勾选验证
    if (!formData.agreementChecked) {
      return {
        isValid: false,
        errors: { agreement: ['请阅读并同意用户协议和隐私政策'] }
      }
    }

    return validator.validateForm(formData, rules)
  },

  // 跳转到注册页
  onGoRegister() {
    wx.navigateTo({
      url: `/pages/register/register?userType=${this.data.userType}`
    })
  },

  // 忘记密码
  onForgotPassword() {
    wx.navigateTo({
      url: '/pages/forgot-password/forgot-password'
    })
  },

  // 查看协议
  onViewAgreement(e) {
    const { type } = e.currentTarget.dataset
    const url = type === 'user' ? '/pages/agreement/user-agreement' : '/pages/agreement/privacy-policy'
    
    wx.navigateTo({
      url
    })
  },

  // 调试登录 - 测试专用
  onDebugLogin() {
    const { userType } = this.data
    
    // 根据用户类型设置不同的测试数据
    let debugData = {}
    let debugUserInfo = {}
    
    if (userType === 'worker') {
      // 求职者测试数据
      debugData = {
        phone: '13800138001',
        password: 'test123456',
        agreementChecked: true
      }
      debugUserInfo = {
        id: 'debug_worker_001',
        type: 'worker',
        phone: '13800138001',
        name: '张三',
        idCard: '110101199001011234',
        avatar: 'https://via.placeholder.com/100x100/4A90E2/FFFFFF?text=张三',
        status: 'active',
        isVerified: true
      }
    } else {
      // 企业用户测试数据
      debugData = {
        phone: '13800138002',
        password: 'test123456',
        agreementChecked: true
      }
      debugUserInfo = {
        id: 'debug_company_001',
        type: 'company',
        phone: '13800138002',
        companyName: '测试餐厅',
        businessLicense: '91110000123456789X',
        contactPerson: '李经理',
        avatar: 'https://via.placeholder.com/100x100/FF9800/FFFFFF?text=企业',
        status: 'active',
        isVerified: true
      }
    }

    // 自动填写表单数据
    this.setData({
      formData: debugData,
      loginType: 'phone'
    })

    // 模拟登录成功
    setTimeout(() => {
      // 生成调试token
      const debugToken = `debug_token_${Date.now()}_${userType}`
      
      // 保存登录信息
      storage.setToken(debugToken)
      storage.setUserInfo(debugUserInfo)
      storage.setUserType(debugUserInfo.type)

      // 更新全局数据
      app.globalData.token = debugToken
      app.globalData.userInfo = debugUserInfo
      app.globalData.userType = debugUserInfo.type

      wx.showToast({
        title: `调试登录成功 (${userType === 'worker' ? '求职者' : '企业用户'})`,
        icon: 'success',
        duration: 2000
      })

      // 跳转到首页
      setTimeout(() => {
        this.redirectToHome()
      }, 2000)
    }, 500)
  },

  // 跳转到首页
  redirectToHome() {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  }
})