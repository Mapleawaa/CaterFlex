// pages/work-experience/work-experience.js
const app = getApp()
import request from '../../utils/request.js'
import storage from '../../utils/storage.js'

Page({
  data: {
    experiences: [],
    loading: false,
    showAddDialog: false,
    editingIndex: -1,
    formData: {
      companyName: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      skills: []
    },
    skillOptions: [
      '服务员', '收银员', '厨师助理', '传菜员', '清洁员',
      '迎宾员', '调酒师', '咖啡师', '面点师', '配菜员',
      '洗碗工', '后厨帮工', '外卖员', '库管员', '领班'
    ],
    selectedSkills: []
  },

  onLoad() {
    this.loadExperiences()
  },

  // 加载工作经验
  async loadExperiences() {
    try {
      this.setData({ loading: true })
      
      const experiences = await request.get('/api/user/work-experience')
      
      this.setData({ experiences })
      
    } catch (error) {
      console.error('加载工作经验失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 显示添加对话框
  onShowAddDialog() {
    this.setData({
      showAddDialog: true,
      editingIndex: -1,
      formData: {
        companyName: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
        skills: []
      },
      selectedSkills: []
    })
  },

  // 编辑经验
  onEditExperience(e) {
    const { index } = e.currentTarget.dataset
    const experience = this.data.experiences[index]
    
    this.setData({
      showAddDialog: true,
      editingIndex: index,
      formData: { ...experience },
      selectedSkills: experience.skills || []
    })
  },

  // 删除经验
  onDeleteExperience(e) {
    const { index } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条工作经验吗？',
      success: (res) => {
        if (res.confirm) {
          this.deleteExperience(index)
        }
      }
    })
  },

  // 执行删除
  async deleteExperience(index) {
    try {
      const experience = this.data.experiences[index]
      
      if (experience.id) {
        await request.delete(`/api/user/work-experience/${experience.id}`)
      }
      
      const experiences = [...this.data.experiences]
      experiences.splice(index, 1)
      
      this.setData({ experiences })
      
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

  // 输入框变化
  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    
    this.setData({
      [`formData.${field}`]: value
    })
  },

  // 日期选择
  onDateChange(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    
    this.setData({
      [`formData.${field}`]: value
    })
  },

  // 技能选择
  onSkillChange(e) {
    const { value } = e.detail
    this.setData({
      selectedSkills: value,
      'formData.skills': value
    })
  },

  // 关闭对话框
  onCloseDialog() {
    this.setData({ showAddDialog: false })
  },

  // 保存经验
  async onSaveExperience() {
    const { formData, editingIndex } = this.data
    
    // 表单验证
    if (!formData.companyName || !formData.position || !formData.startDate) {
      wx.showToast({
        title: '请填写必要信息',
        icon: 'error'
      })
      return
    }

    try {
      let result
      
      if (editingIndex >= 0) {
        // 编辑模式
        const experienceId = this.data.experiences[editingIndex].id
        result = await request.put(`/api/user/work-experience/${experienceId}`, formData)
        
        const experiences = [...this.data.experiences]
        experiences[editingIndex] = result.experience
        this.setData({ experiences })
        
      } else {
        // 新增模式
        result = await request.post('/api/user/work-experience', formData)
        
        const experiences = [...this.data.experiences, result.experience]
        this.setData({ experiences })
      }
      
      this.setData({ showAddDialog: false })
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
    } catch (error) {
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    }
  }
})