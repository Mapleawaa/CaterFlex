// pages/personal-info/personal-info.js
const app = getApp()
import storage from '../../utils/storage.js'
import validator from '../../utils/validator.js'

Page({
  data: {
    userInfo: {},
    formData: {
      name: '',
      gender: '',
      age: '',
      phone: '',
      email: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      avatar: '',
      introduction: ''
    },
    genderOptions: ['男', '女'],
    genderIndex: -1,
    errors: {},
    loading: false,
    uploading: false
  },

  onLoad() {
    this.loadUserInfo()
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = storage.getUserInfo() || {}
    const formData = {
      name: userInfo.name || '',
      gender: userInfo.gender || '',
      age: userInfo.age || '',
      phone: userInfo.phone || '',
      email: userInfo.email || '',
      address: userInfo.address || '',
      emergencyContact: userInfo.emergencyContact || '',
      emergencyPhone: userInfo.emergencyPhone || '',
      avatar: userInfo.avatar || '',
      introduction: userInfo.introduction || ''
    }
    
    const genderIndex = formData.gender === 'male' ? 0 : formData.gender === 'female' ? 1 : -1
    
    this.setData({
      userInfo,
      formData,
      genderIndex
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

  // 性别选择
  onGenderChange(e) {
    const index = e.detail.value
    const gender = index == 0 ? 'male' : 'female'
    
    this.setData({
      genderIndex: index,
      'formData.gender': gender,
      'errors.gender': ''
    })
  },

  // 选择头像
  onChooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.uploadAvatar(res.tempFiles[0].tempFilePath)
      }
    })
  },

  // 上传头像（模拟）
  async uploadAvatar(filePath) {
    try {
      this.setData({ uploading: true })
      
      // 模拟上传延迟
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 使用占位符图片
      const avatarUrl = `https://via.placeholder.com/120x120/1976D2/FFFFFF?text=头像`
      
      this.setData({
        'formData.avatar': avatarUrl
      })
      
      wx.showToast({
        title: '头像上传成功',
        icon: 'success'
      })
      
    } catch (error) {
      wx.showToast({
        title: '上传失败',
        icon: 'error'
      })
    } finally {
      this.setData({ uploading: false })
    }
  },

  // 表单验证
  validateForm() {
    const { formData } = this.data
    const errors = {}

    if (!formData.name) {
      errors.name = '请输入姓名'
    }

    if (!formData.gender) {
      errors.gender = '请选择性别'
    }

    if (!formData.age || formData.age < 16 || formData.age > 65) {
      errors.age = '请输入有效年龄（16-65岁）'
    }

    if (!validator.isPhone(formData.phone)) {
      errors.phone = '请输入正确的手机号'
    }

    if (formData.email && !validator.isEmail(formData.email)) {
      errors.email = '请输入正确的邮箱'
    }

    if (formData.emergencyPhone && !validator.isPhone(formData.emergencyPhone)) {
      errors.emergencyPhone = '请输入正确的紧急联系人电话'
    }

    this.setData({ errors })
    return Object.keys(errors).length === 0
  },

  // 保存信息
  async onSave() {
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
      
      // 模拟保存延迟
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 更新本地存储
      const updatedUserInfo = { ...this.data.userInfo, ...this.data.formData }
      storage.setUserInfo(updatedUserInfo)
      app.globalData.userInfo = updatedUserInfo
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      
    } catch (error) {
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  }
})