// utils/location.js
// 位置相关工具类

class LocationUtils {
  constructor() {
    this.currentLocation = null
  }

  // 获取当前位置
  getCurrentLocation(options = {}) {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: options.type || 'gcj02',
        altitude: options.altitude || false,
        success: (res) => {
          this.currentLocation = {
            latitude: res.latitude,
            longitude: res.longitude,
            accuracy: res.accuracy,
            altitude: res.altitude || 0,
            speed: res.speed || 0,
            timestamp: Date.now()
          }
          resolve(this.currentLocation)
        },
        fail: (error) => {
          console.error('获取位置失败:', error)
          this.handleLocationError(error)
          reject(error)
        }
      })
    })
  }

  // 检查位置权限
  checkLocationPermission() {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userLocation']) {
            resolve(true)
          } else if (res.authSetting['scope.userLocation'] === false) {
            // 用户拒绝过授权
            this.showLocationPermissionModal()
            reject(new Error('位置权限被拒绝'))
          } else {
            // 未授权过，可以直接调用授权
            this.requestLocationPermission()
              .then(resolve)
              .catch(reject)
          }
        },
        fail: reject
      })
    })
  }

  // 请求位置权限
  requestLocationPermission() {
    return new Promise((resolve, reject) => {
      wx.authorize({
        scope: 'scope.userLocation',
        success: () => {
          resolve(true)
        },
        fail: () => {
          this.showLocationPermissionModal()
          reject(new Error('位置权限授权失败'))
        }
      })
    })
  }

  // 显示位置权限说明弹窗
  showLocationPermissionModal() {
    wx.showModal({
      title: '位置权限说明',
      content: '为了为您推荐附近的工作岗位和进行打卡定位，需要获取您的位置信息。请在设置中开启位置权限。',
      confirmText: '去设置',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.openSetting({
            success: (settingRes) => {
              if (settingRes.authSetting['scope.userLocation']) {
                wx.showToast({
                  title: '授权成功',
                  icon: 'success'
                })
              }
            }
          })
        }
      }
    })
  }

  // 计算两点间距离（米）
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000 // 地球半径（米）
    const dLat = this.toRadians(lat2 - lat1)
    const dLng = this.toRadians(lng2 - lng1)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // 角度转弧度
  toRadians(degrees) {
    return degrees * (Math.PI / 180)
  }

  // 检查是否在指定范围内
  isWithinRange(targetLat, targetLng, range = 100) {
    if (!this.currentLocation) {
      return false
    }
    
    const distance = this.calculateDistance(
      this.currentLocation.latitude,
      this.currentLocation.longitude,
      targetLat,
      targetLng
    )
    
    return distance <= range
  }

  // 格式化距离显示
  formatDistance(distance) {
    if (distance < 1000) {
      return `${Math.round(distance)}m`
    } else {
      return `${(distance / 1000).toFixed(1)}km`
    }
  }

  // 获取地址信息
  getAddressInfo(latitude, longitude) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://apis.map.qq.com/ws/geocoder/v1/',
        data: {
          location: `${latitude},${longitude}`,
          key: 'YOUR_TENCENT_MAP_KEY', // 需要替换为实际的腾讯地图API密钥
          get_poi: 1
        },
        success: (res) => {
          if (res.data.status === 0) {
            resolve(res.data.result)
          } else {
            reject(new Error(res.data.message))
          }
        },
        fail: reject
      })
    })
  }

  // 处理位置错误
  handleLocationError(error) {
    let message = '获取位置失败'
    
    switch (error.errMsg) {
      case 'getLocation:fail auth deny':
        message = '位置权限被拒绝'
        break
      case 'getLocation:fail:ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF':
        message = '请开启手机定位服务'
        break
      case 'getLocation:fail system permission denied':
        message = '系统定位权限被拒绝'
        break
      default:
        message = '定位服务暂时不可用'
    }
    
    wx.showToast({
      title: message,
      icon: 'error',
      duration: 2000
    })
  }

  // 开始持续定位（用于打卡等场景）
  startLocationTracking(callback, options = {}) {
    const interval = options.interval || 5000 // 默认5秒更新一次
    
    this.locationTimer = setInterval(() => {
      this.getCurrentLocation()
        .then(location => {
          if (callback && typeof callback === 'function') {
            callback(location)
          }
        })
        .catch(error => {
          console.error('位置跟踪失败:', error)
        })
    }, interval)
  }

  // 停止持续定位
  stopLocationTracking() {
    if (this.locationTimer) {
      clearInterval(this.locationTimer)
      this.locationTimer = null
    }
  }
}

// 创建实例
const locationUtils = new LocationUtils()

export default locationUtils