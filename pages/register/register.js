// pages/register/register.js
const app = getApp()
import request from '../../utils/request.js'
import storage from '../../utils/storage.js'
import validator from '../../utils/validator.js'

Page({
  data: {
    userType: 'worker', // worker: 求职者, company: 企业
    formData: {
      phone: '',
      password: '',
      confirmPassword: '',
      verifyCode: '',
      name: '',
      idCard: '',
      companyName: '',
      businessLicense: '',
      contactPerson: '',
      agreeTerms: false
    },
    errors: {},
    loading: false,
    sendingCode: false,
    countdown: 0,
    showPassword: false,
    showConfirmPassword: false
  },

  onLoad(options) {
    if (options.type) {
      this.setData({ userType: options.type })
    }
  },

  // 切换用户类型
  onUserTypeChange(e) {
    this.setData({ 
      userType: e.detail.value,
      formData: {
        ...this.data.formData,
        name: '',
        idCard: '',
        companyName: '',
        businessLicense: '',
        contactPerson: ''
      },
      errors: {}
    })
  },

  // 输入框变化
  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    
    this.setData({
      [`formData.${field}`]: value,
      [`errors.${field}`]: ''
    })
  },

  // 同意条款
  onAgreeChange(e) {
    this.setData({
      'formData.agreeTerms': e.detail.value.length > 0
    })
  },

  // 显示/隐藏密码
  onTogglePassword(e) {
    const { type } = e.currentTarget.dataset
    this.setData({
      [type]: !this.data[type]
    })
  },

  // 发送验证码
  async onSendCode() {
    if (this.data.sendingCode || this.data.countdown > 0) return

    const phone = this.data.formData.phone
    if (!validator.isPhone(phone)) {
      this.setData({ 'errors.phone': '请输入正确的手机号' })
      return
    }

    try {
      this.setData({ sendingCode: true })
      
      await request.post('/api/auth/send-code', { phone })
      
      wx.showToast({
        title: '验证码已发送',
        icon: 'success'
      })
      
      this.startCountdown()
      
    } catch (error) {
      wx.showToast({
        title: error.message || '发送失败',
        icon: 'error'
      })
    } finally {
      this.setData({ sendingCode: false })
    }
  },

  // 开始倒计时
  startCountdown() {
    this.setData({ countdown: 60 })
    
    const timer = setInterval(() => {
      const countdown = this.data.countdown - 1
      this.setData({ countdown })
      
      if (countdown <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  },

  // 表单验证
  validateForm() {
    const { formData, userType } = this.data
    const errors = {}

    // 通用验证
    if (!validator.isPhone(formData.phone)) {
      errors.phone = '请输入正确的手机号'
    }
    
    if (!formData.verifyCode) {
      errors.verifyCode = '请输入验证码'
    }
    
    if (!validator.isPassword(formData.password)) {
      errors.password = '密码长度至少6位'
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次密码输入不一致'
    }
    
    if (!formData.agreeTerms) {
      errors.agreeTerms = '请同意用户协议和隐私政策'
    }

    // 求职者验证
    if (userType === 'worker') {
      if (!formData.name) {
        errors.name = '请输入真实姓名'
      }
      
      if (!validator.isIdCard(formData.idCard)) {
        errors.idCard = '请输入正确的身份证号'
      }
    }

    // 企业验证
    if (userType === 'company') {
      if (!formData.companyName) {
        errors.companyName = '请输入企业名称'
      }
      
      if (!formData.businessLicense) {
        errors.businessLicense = '请输入营业执照号'
      }
      
      if (!formData.contactPerson) {
        errors.contactPerson = '请输入联系人姓名'
      }
    }

    this.setData({ errors })
    return Object.keys(errors).length === 0
  },

  // 提交注册
  async onSubmit() {
    if (this.data.loading) return

    if (!this.validateForm()) {
      wx.showToast({
        title: '请检查输入信息',
        icon: 'error'
      })
      return
    }

    try {
      this.setData({ loading: true })
      
      const { formData, userType } = this.data
      const registerData = {
        phone: formData.phone,
        password: formData.password,
        verifyCode: formData.verifyCode,
        userType
      }

      if (userType === 'worker') {
        registerData.name = formData.name
        registerData.idCard = formData.idCard
      } else {
        registerData.companyName = formData.companyName
        registerData.businessLicense = formData.businessLicense
        registerData.contactPerson = formData.contactPerson
      }

      const result = await request.post('/api/auth/register', registerData)
      
      // 保存用户信息
      storage.setToken(result.token)
      storage.setUserInfo(result.userInfo)
      storage.setUserType(userType)
      
      // 更新全局数据
      app.globalData.token = result.token
      app.globalData.userInfo = result.userInfo
      app.globalData.userType = userType
      
      wx.showToast({
        title: '注册成功',
        icon: 'success'
      })
      
      // 跳转到首页
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }, 1500)
      
    } catch (error) {
      wx.showToast({
        title: error.message || '注册失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 跳转到登录页
  onGoLogin() {
    wx.navigateBack()
  }
})