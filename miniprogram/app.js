// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null,
    userProfile: {
      name: '糯米',
      gender: '男孩',
      birth: '2023-11-20'
    },
    babyState: {
      feed: 3.5,
      temp: 36.6
    }
  }
})
