// utils/validator.js
// 表单验证工具类

class Validator {
  constructor() {
    this.rules = {}
    this.messages = {}
  }

  // 手机号验证
  isPhone(phone) {
    const phoneReg = /^1[3-9]\d{9}$/
    return phoneReg.test(phone)
  }

  // 身份证验证
  isIdCard(idCard) {
    const idCardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    return idCardReg.test(idCard)
  }

  // 邮箱验证
  isEmail(email) {
    const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailReg.test(email)
  }

  // 密码强度验证（至少6位，包含字母和数字）
  isStrongPassword(password) {
    const passwordReg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/
    return passwordReg.test(password)
  }

  // 中文姓名验证
  isChineseName(name) {
    const nameReg = /^[\u4e00-\u9fa5]{2,8}$/
    return nameReg.test(name)
  }

  // 银行卡号验证
  isBankCard(cardNumber) {
    const bankCardReg = /^\d{16,19}$/
    return bankCardReg.test(cardNumber)
  }

  // 数字验证
  isNumber(value) {
    return !isNaN(value) && !isNaN(parseFloat(value))
  }

  // 整数验证
  isInteger(value) {
    return Number.isInteger(Number(value))
  }

  // 正整数验证
  isPositiveInteger(value) {
    const num = Number(value)
    return Number.isInteger(num) && num > 0
  }

  // 价格验证（最多两位小数）
  isPrice(price) {
    const priceReg = /^\d+(\.\d{1,2})?$/
    return priceReg.test(price) && parseFloat(price) >= 0
  }

  // 长度验证
  isLength(value, min, max) {
    const length = String(value).length
    return length >= min && length <= max
  }

  // 必填验证
  isRequired(value) {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim() !== ''
    if (Array.isArray(value)) return value.length > 0
    return true
  }

  // URL验证
  isUrl(url) {
    const urlReg = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i
    return urlReg.test(url)
  }

  // 验证单个字段
  validateField(value, rules) {
    const errors = []

    for (const rule of rules) {
      const { type, message, ...params } = rule

      let isValid = true

      switch (type) {
        case 'required':
          isValid = this.isRequired(value)
          break
        case 'phone':
          isValid = !value || this.isPhone(value)
          break
        case 'email':
          isValid = !value || this.isEmail(value)
          break
        case 'idCard':
          isValid = !value || this.isIdCard(value)
          break
        case 'password':
          isValid = !value || this.isStrongPassword(value)
          break
        case 'chineseName':
          isValid = !value || this.isChineseName(value)
          break
        case 'bankCard':
          isValid = !value || this.isBankCard(value)
          break
        case 'number':
          isValid = !value || this.isNumber(value)
          break
        case 'integer':
          isValid = !value || this.isInteger(value)
          break
        case 'positiveInteger':
          isValid = !value || this.isPositiveInteger(value)
          break
        case 'price':
          isValid = !value || this.isPrice(value)
          break
        case 'length':
          isValid = !value || this.isLength(value, params.min || 0, params.max || Infinity)
          break
        case 'url':
          isValid = !value || this.isUrl(value)
          break
        case 'custom':
          isValid = params.validator ? params.validator(value) : true
          break
        default:
          console.warn(`未知的验证类型: ${type}`)
      }

      if (!isValid) {
        errors.push(message || this.getDefaultMessage(type))
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // 验证表单
  validateForm(data, rules) {
    const errors = {}
    let isValid = true

    Object.keys(rules).forEach(field => {
      const fieldRules = rules[field]
      const fieldValue = data[field]
      const result = this.validateField(fieldValue, fieldRules)

      if (!result.isValid) {
        errors[field] = result.errors
        isValid = false
      }
    })

    return {
      isValid,
      errors
    }
  }

  // 获取默认错误消息
  getDefaultMessage(type) {
    const messages = {
      required: '此字段为必填项',
      phone: '请输入正确的手机号',
      email: '请输入正确的邮箱地址',
      idCard: '请输入正确的身份证号',
      password: '密码至少6位，包含字母和数字',
      chineseName: '请输入正确的中文姓名',
      bankCard: '请输入正确的银行卡号',
      number: '请输入数字',
      integer: '请输入整数',
      positiveInteger: '请输入正整数',
      price: '请输入正确的价格',
      length: '长度不符合要求',
      url: '请输入正确的网址'
    }

    return messages[type] || '格式不正确'
  }

  // 显示验证错误
  showValidationError(errors) {
    const firstError = Object.values(errors)[0]
    if (firstError && firstError.length > 0) {
      wx.showToast({
        title: firstError[0],
        icon: 'error',
        duration: 2000
      })
    }
  }

  // 常用验证规则预设
  static getRules() {
    return {
      // 用户注册
      register: {
        phone: [
          { type: 'required', message: '请输入手机号' },
          { type: 'phone', message: '请输入正确的手机号' }
        ],
        password: [
          { type: 'required', message: '请输入密码' },
          { type: 'password', message: '密码至少6位，包含字母和数字' }
        ],
        confirmPassword: [
          { type: 'required', message: '请确认密码' },
          { 
            type: 'custom', 
            message: '两次密码输入不一致',
            validator: (value, data) => value === data.password
          }
        ]
      },

      // 个人信息
      profile: {
        name: [
          { type: 'required', message: '请输入姓名' },
          { type: 'chineseName', message: '请输入正确的中文姓名' }
        ],
        idCard: [
          { type: 'required', message: '请输入身份证号' },
          { type: 'idCard', message: '请输入正确的身份证号' }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱地址' }
        ]
      },

      // 岗位发布
      jobPublish: {
        title: [
          { type: 'required', message: '请输入岗位标题' },
          { type: 'length', min: 2, max: 50, message: '岗位标题长度为2-50个字符' }
        ],
        salary: [
          { type: 'required', message: '请输入薪资' },
          { type: 'price', message: '请输入正确的薪资金额' }
        ],
        workTime: [
          { type: 'required', message: '请选择工作时间' }
        ],
        description: [
          { type: 'required', message: '请输入岗位描述' },
          { type: 'length', min: 10, max: 500, message: '岗位描述长度为10-500个字符' }
        ]
      }
    }
  }
}

// 创建实例
const validator = new Validator()

export default validator
export { Validator }