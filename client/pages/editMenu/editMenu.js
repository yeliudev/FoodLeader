var util = require('../../utils/util.js')
var config = require('../../config.js')
var app = getApp()

Page({
  data: {
    menu_id: '',
    imageUrl: '',
    name: '',
    editting: false,
    showAuthorize: false
  },

  onLoad: function(options) {
    var data = JSON.parse(options.data)
    this.setData({
      menu_id: data.menu_id,
      imageUrl: data.imageUrl,
      name: data.name
    })
  },

  onEditImage: function() {
    var that = this
    wx.chooseImage({
      count: 1,
      success: chooseRes => {
        util.showLoading('正在上传')
        wx.request({
          url: config.service.signUrl,
          method: 'GET',
          header: {
            skey: app.globalData.skey
          },
          success: res => {
            var fileName = Math.random().toString(36).substr(2, 4)
            wx.uploadFile({
              url: `${config.service.cosUploadUrl}${res.data.data.open_id}/${fileName}.png`,
              filePath: chooseRes.tempFilePaths[0],
              header: {
                'Authorization': res.data.data.signature
              },
              name: 'filecontent',
              formData: {
                op: 'upload'
              },
              success: () => {
                wx.request({
                  url: config.service.setMenuUrl,
                  method: 'GET',
                  header: {
                    skey: app.globalData.skey
                  },
                  data: {
                    menu_id: that.data.menu_id,
                    name: '',
                    imageUrl: `${config.service.cosUrl}${res.data.data.open_id}/${fileName}.png`
                  },
                  success: res => {
                    if (res.data.success) {
                      wx.hideToast()
                      this.refreshData()
                    } else if (res.data.code === '500') {
                      that.setData({
                        showAuthorize: true
                      })
                      wx.hideToast()
                    } else {
                      util.showModal('修改失败', res.data.errMsg, true)
                    }
                  },
                  fail: error => {
                    util.showModal('修改失败', error, true)
                  }
                })
              }
            })
          },
          fail: error => {
            util.showModal('修改失败', error, true)
            return
          }
        })
      },
    })
  },

  onEditName: function() {
    this.setData({
      editting: true
    })
  },

  onInputCancel: function() {
    this.setData({
      editting: false
    })
  },

  onInputConfirm: function(e) {
    var that = this
    this.setData({
      editting: false
    })
    if (e.detail) {
      util.showLoading('正在修改')
      wx.request({
        url: config.service.setMenuUrl,
        method: 'GET',
        header: {
          skey: app.globalData.skey
        },
        data: {
          menu_id: this.data.menu_id,
          name: e.detail,
          imageUrl: ''
        },
        success: res => {
          if (res.data.success) {
            wx.hideToast()
            this.refreshData()
          } else if (res.data.code === '500') {
            that.setData({
              showAuthorize: true
            })
            wx.hideToast()
          } else {
            util.showModal('修改失败', res.data.errMsg, true)
          }
        },
        fail: error => {
          util.showModal('修改失败', error, true)
        }
      })
    }
  },

  refreshData: function() {
    var that = this
    wx.request({
      url: config.service.getMenuUrl,
      method: 'GET',
      header: {
        skey: app.globalData.skey
      },
      data: {
        menu_id: this.data.menu_id
      },
      success: res => {
        if (res.data.success) {
          this.setData({
            name: res.data.data.name,
            imageUrl: res.data.data.imageUrl
          })
        } else if (res.data.code === '500') {
          that.setData({
            showAuthorize: true
          })
        } else {
          util.showModal('获取失败', res.data.errMsg, true)
        }
      },
      fail: error => {
        util.showModal('获取失败', error, true)
      }
    })
  },

  onHideAuthorize: function() {
    this.setData({
      showAuthorize: false
    })
  }
})