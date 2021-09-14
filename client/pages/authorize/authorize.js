var util = require('../../utils/util.js')
var config = require('../../config.js')
var app = getApp()

Page({
  data: {
    userInfoAuthorized: false,
    userLocationAuthorized: false
  },

  onShow: function() {
    wx.getLocation({
      success: res => {
        this.setData({
          userLocationAuthorized: true
        })
      },
      fail: error => {
        this.setData({
          userLocationAuthorized: false
        })
      },
      complete: () => {
        this.setData({
          userInfoAuthorized: app.globalData.userInfoAuthorized
        })
      }
    })
  },

  onGotUserInfo: function(e) {
    if (e.detail.errMsg === 'getUserInfo:ok') {
      util.showLoading('正在登录')
      app.globalData.userInfoAuthorized = true
      app.globalData.userInfo = e.detail.userInfo
      wx.setStorage({
        key: "userInfo",
        data: e.detail.userInfo,
        fail: error => {
          util.showModal('userInfo保存失败', JSON.parse(error), true)
        }
      })
      wx.login({
        success: loginRes => {
          wx.request({
            url: config.service.loginUrl,
            method: 'GET',
            header: {
              'X-WX-Code': loginRes.code,
              'X-WX-Encrypted-Data': e.detail.encryptedData,
              'X-WX-IV': e.detail.iv
            },
            success: result => {
              var data = result.data
              if (data && data.code === 0 && data.data.skey) {
                var res = data.data
                if (res.userinfo) {
                  wx.setStorage({
                    key: "skey",
                    data: res.skey,
                    fail: error => {
                      util.showModal('skey保存失败', JSON.parse(error), true)
                    }
                  })
                  app.globalData.skey = res.skey
                  this.setData({
                    userInfoAuthorized: true
                  })
                  util.showSuccess('登录成功')
                } else {
                  util.showModal('登录失败', data.error + '：' + (data.message || '未知错误'))
                }
              } else {
                util.showModal('登录失败', '网络错误：请稍后重试')
              }
            },
            fail: error => {
              util.showModal('登录失败', JSON.parse(error), true)
            }
          })
        },
        fail: loginError => {
          util.showModal('登录失败', JSON.parse(loginError), true)
        }
      })
    }
  }
})