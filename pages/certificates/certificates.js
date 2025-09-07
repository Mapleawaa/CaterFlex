// pages/certificates/certificates.js
const app = getApp()
import request from '../../utils/request.js'
import storage from '../../utils/storage.js'

Page({
  data: {
    certificates: [],
    loading: false,
    uploading: false,
    certificateTypes: [
      { label: '健康证', value: 'health', required: true },
      { label: '身份证', value: 'id_card', required: true },
      { label: '食品安全培训证', value: 'food_safety', required: false },
      { label: '特种作业证', value: 'special_work', required: false },
      { label: '其他证件', value: 'other', required: false }
    ]
  },

  onLoad() {
    this.loadCertificates()
  },

  // 加载证件列表
  async loadCertificates() {
    try {
      this.setData({ loading: true })
      
      const certificates = await request.get('/api/user/certificates')
      
      this.setData({ certificates })
      
    } catch (error) {
      console.error('加载证件失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 上传证件
  onUploadCertificate(e) {
    const { type } = e.currentTarget.dataset
    
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.uploadCertificateFile(type, res.tempFiles[0].tempFilePath)
      }
    })
  },

  // 上传文件
  async uploadCertificateFile(type, filePath) {
    try {
      this.setData({ uploading: true })
      
      const uploadResult = await this.uploadFile(filePath)
      
      // 保存证件信息
      const certificateData = {
        type,
        imageUrl: uploadResult.url,
        uploadTime: new Date().toISOString()
      }
      
      const result = await request.post('/api/user/certificates', certificateData)
      
      // 更新本地数据
      const certificates = [...this.data.certificates]
      const existingIndex = certificates.findIndex(cert => cert.type === type)
      
      if (existingIndex >= 0) {
        certificates[existingIndex] = result.certificate
      } else {
        certificates.push(result.certificate)
      }
      
      this.setData({ certificates })
      
      wx.showToast({
        title: '上传成功',
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

  // 文件上传
  uploadFile(filePath) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${app.globalData.apiBase}/api/upload/certificate`,
        filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${storage.getToken()}`
        },
        success: (res) => {
          const data = JSON.parse(res.data)
          if (data.success) {
            resolve(data.data)
          } else {
            reject(new Error(data.message))
          }
        },
        fail: reject
      })
    })
  },

  // 预览证件
  onPreviewCertificate(e) {
    const { url } = e.currentTarget.dataset
    
    wx.previewImage({
      urls: [url],
      current: url
    })
  },

  // 删除证件
  onDeleteCertificate(e) {
    const { type } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个证件吗？',
      success: (res) => {
        if (res.confirm) {
          this.deleteCertificate(type)
        }
      }
    })
  },

  // 执行删除
  async deleteCertificate(type) {
    try {
      await request.delete(`/api/user/certificates/${type}`)
      
      const certificates = this.data.certificates.filter(cert => cert.type !== type)
      this.setData({ certificates })
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
      
    } catch (error) {
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      })
    }
  },

  // 获取证件状态
  getCertificateStatus(type) {
    const certificate = this.data.certificates.find(cert => cert.type === type)
    
    if (!certificate) {
      return { status: 'none', text: '未上传', theme: 'default' }
    }
    
    switch (certificate.status) {
      case 'pending':
        return { status: 'pending', text: '审核中', theme: 'warning' }
      case 'approved':
        return { status: 'approved', text: '已通过', theme: 'success' }
      case 'rejected':
        return { status: 'rejected', text: '未通过', theme: 'danger' }
      default:
        return { status: 'none', text: '未上传', theme: 'default' }
    }
  }
})