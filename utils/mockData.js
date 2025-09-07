// utils/mockData.js - 测试用模拟数据

// 模拟用户数据
export const mockUsers = {
  worker: {
    id: '1001',
    name: '张小明',
    phone: '13800138000',
    userType: 'worker',
    avatar: '/assets/images/default-avatar.png',
    gender: 'male',
    age: 25,
    email: 'zhangxiaoming@example.com',
    address: '北京市朝阳区建国路88号',
    emergencyContact: '张大明',
    emergencyPhone: '13800138001',
    introduction: '有3年餐饮服务经验，熟悉前厅服务流程，具备良好的沟通能力和服务意识。',
    status: 'active'
  },
  company: {
    id: '2001',
    companyName: '海底捞火锅店',
    phone: '13800138002',
    userType: 'company',
    contactPerson: '李经理',
    businessLicense: '91110000123456789X',
    address: '北京市海淀区中关村大街1号',
    introduction: '知名连锁火锅品牌，提供优质的用餐体验和工作环境。',
    status: 'verified'
  }
}

// 模拟工作经验数据
export const mockExperiences = [
  {
    id: '3001',
    companyName: '海底捞火锅店',
    position: '服务员',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    description: '负责客户接待、点餐服务、收银结账等工作，获得优秀员工称号。',
    skills: ['服务员', '收银员', '传菜员']
  },
  {
    id: '3002',
    companyName: '星巴克咖啡',
    position: '咖啡师',
    startDate: '2022-06-01',
    endDate: '2022-12-31',
    description: '制作各类咖啡饮品，维护设备清洁，提供优质客户服务。',
    skills: ['咖啡师', '收银员', '清洁员']
  }
]

// 模拟证件数据
export const mockCertificates = [
  {
    id: '4001',
    type: 'health',
    imageUrl: '/assets/images/health-cert.jpg',
    status: 'approved',
    uploadTime: '2024-01-15 10:30:00',
    note: '健康证有效期至2024-12-31'
  },
  {
    id: '4002',
    type: 'id_card',
    imageUrl: '/assets/images/id-card.jpg',
    status: 'approved',
    uploadTime: '2024-01-15 10:35:00',
    note: '身份证正反面已上传'
  }
]

// 模拟岗位数据
export const mockJobs = [
  {
    id: '5001',
    title: '服务员',
    companyName: '海底捞火锅店',
    salary: 150,
    salaryUnit: '天',
    location: '北京市朝阳区',
    distance: 1200,
    workTime: '10:00-22:00',
    description: '负责客户接待、点餐服务、传菜等工作，要求有相关经验，服务态度好。',
    requirements: ['有餐饮服务经验', '持有健康证', '沟通能力强'],
    benefits: ['包工作餐', '弹性排班', '节日福利'],
    status: '招聘中',
    publishTime: '2024-09-01 09:00:00',
    urgency: 'high'
  },
  {
    id: '5002',
    title: '厨师助理',
    companyName: '小龙坎火锅',
    salary: 120,
    salaryUnit: '天',
    location: '北京市海淀区',
    distance: 2500,
    workTime: '09:00-21:00',
    description: '协助主厨进行食材准备、配菜等工作，学习烹饪技能。',
    requirements: ['身体健康', '持有健康证', '能吃苦耐劳'],
    benefits: ['技能培训', '包工作餐', '交通补贴'],
    status: '招聘中',
    publishTime: '2024-09-02 14:30:00',
    urgency: 'medium'
  },
  {
    id: '5003',
    title: '收银员',
    companyName: '麦当劳',
    salary: 18,
    salaryUnit: '小时',
    location: '北京市西城区',
    distance: 800,
    workTime: '灵活排班',
    description: '负责收银结账、客户服务、维护收银台整洁等工作。',
    requirements: ['熟悉收银系统', '数学计算能力强', '服务意识好'],
    benefits: ['灵活排班', '员工折扣', '培训机会'],
    status: '招聘中',
    publishTime: '2024-09-03 11:15:00',
    urgency: 'low'
  }
]

// 模拟订单数据
export const mockOrders = [
  {
    id: '6001',
    jobId: '5001',
    jobTitle: '服务员',
    companyName: '海底捞火锅店',
    workTime: '2024-09-10 10:00-22:00',
    salary: 150,
    status: 'confirmed',
    statusText: '已确认',
    statusTheme: 'success',
    createTime: '2024-09-05 15:30:00',
    workDate: '2024-09-10'
  },
  {
    id: '6002',
    jobId: '5002',
    jobTitle: '厨师助理',
    companyName: '小龙坎火锅',
    workTime: '2024-09-12 09:00-21:00',
    salary: 120,
    status: 'pending',
    statusText: '待确认',
    statusTheme: 'warning',
    createTime: '2024-09-06 09:15:00',
    workDate: '2024-09-12'
  }
]

// 模拟API响应
export const mockApiResponses = {
  // 登录响应
  login: {
    success: true,
    data: {
      token: 'mock_token_123456789',
      userInfo: mockUsers.worker,
      userType: 'worker'
    },
    message: '登录成功'
  },

  // 注册响应
  register: {
    success: true,
    data: {
      token: 'mock_token_987654321',
      userInfo: mockUsers.worker,
      userType: 'worker'
    },
    message: '注册成功'
  },

  // 发送验证码响应
  sendCode: {
    success: true,
    message: '验证码已发送'
  },

  // 获取岗位列表响应
  getJobs: {
    success: true,
    data: {
      jobs: mockJobs,
      hasMore: false,
      total: mockJobs.length
    }
  },

  // 获取工作经验响应
  getExperiences: {
    success: true,
    data: mockExperiences
  },

  // 获取证件列表响应
  getCertificates: {
    success: true,
    data: mockCertificates
  },

  // 获取订单列表响应
  getOrders: {
    success: true,
    data: mockOrders
  }
}

// 调试登录专用数据 - 与测试指南保持一致
export const debugUsers = {
  worker: {
    id: 'debug_worker_001',
    name: '张三',
    phone: '13800138001',
    userType: 'worker',
    idCard: '110101199001011234',
    avatar: 'https://via.placeholder.com/100x100/4A90E2/FFFFFF?text=张三',
    gender: 'male',
    age: 25,
    email: 'zhangsan@example.com',
    address: '北京市朝阳区建国路88号',
    emergencyContact: '张大明',
    emergencyPhone: '13800138003',
    introduction: '有3年餐饮服务经验，熟悉前厅服务流程，具备良好的沟通能力和服务意识。',
    status: 'active',
    isVerified: true
  },
  company: {
    id: 'debug_company_001',
    companyName: '测试餐厅',
    phone: '13800138002',
    userType: 'company',
    contactPerson: '李经理',
    businessLicense: '91110000123456789X',
    address: '北京市海淀区中关村大街1号',
    introduction: '专业的餐饮连锁品牌，提供优质的用餐体验和工作环境。',
    status: 'verified',
    isVerified: true,
    avatar: 'https://via.placeholder.com/100x100/FF9800/FFFFFF?text=企业'
  }
}

// 导出默认数据
export default {
  users: mockUsers,
  experiences: mockExperiences,
  certificates: mockCertificates,
  jobs: mockJobs,
  orders: mockOrders,
  apiResponses: mockApiResponses,
  debugUsers: debugUsers
}