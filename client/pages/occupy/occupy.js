var util = require('../../utils/util.js')
var config = require('../../config.js')
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js')
var qqmapsdk = new QQMapWX({
  key: 'MNXBZ-G5TWD-GYF42-HHZJL-2W2J3-PVBX4'
})
var app = getApp()

Page({
  data: {
    text: '',
    photos: [],
    canAddPhoto: true,
    address: '标记店铺位置',
    city: '',
    coordinate: [],
    showAuthorize: false
  },

  onShow: function() {
    wx.hideShareMenu()
  },

  onInput: function(e) {
    this.setData({
      text: e.detail.value
    })
  },

  onAddPhotoTap: function() {
    wx.chooseImage({
      count: 9 - this.data.photos.length,
      success: res => {
        wx.navigateTo({
          url: '/pages/edit/edit?data=' + JSON.stringify(res.tempFilePaths)
        })
      },
    })
  },

  onPhotoTap: function(e) {
    wx.previewImage({
      current: this.data.photos[e.target.id],
      urls: this.data.photos
    })
  },

  onRemovePhotoTap: function(e) {
    this.data.photos.splice(e.target.id, 1)
    this.setData({
      photos: this.data.photos,
      canAddPhoto: this.data.photos.length < 9 ? true : false
    })
  },

  onChooseLocation: function() {
    var that = this
    wx.chooseLocation({
      success: res => {
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: sdkRes => {
            this.setData({
              address: res.name ? (sdkRes.result.address_component.city + '·' + res.name) : sdkRes.result.address,
              city: sdkRes.result.address_component.city,
              coordinate: [res.latitude, res.longitude]
            })
          }
        })
      },
      fail: error => {
        if (JSON.stringify(error) === '{"errMsg":"chooseLocation:fail auth deny"}' || JSON.stringify(error) === '{"errMsg":"chooseLocation:fail:auth denied"}') {
          that.setData({
            showAuthorize: true
          })
        } else if (JSON.stringify(error) != '{"errMsg":"chooseLocation:fail cancel"}') {
          util.showModal('位置获取失败', error, true)
        }
      }
    })
  },

  onSubmit: function() {
    var that = this
    if (!app.globalData.skey || !app.globalData.userInfo) {
      that.setData({
        showAuthorize: true
      })
      return
    }
    if (this.data.text.length) {
      util.showLoading('正在发表')
      this.upLoad(-1, this.data.photos.length, '', '', function() {
        if (that.data.coordinate.length) {
          qqmapsdk.reverseGeocoder({
            location: {
              latitude: that.data.coordinate[0],
              longitude: that.data.coordinate[1]
            },
            success: sdkRes => {
              wx.request({
                url: config.service.publishUrl,
                method: 'GET',
                header: {
                  skey: app.globalData.skey
                },
                data: {
                  city: sdkRes.result.address_component.city,
                  trackInfo: JSON.stringify({
                    text: that.data.text,
                    photos: that.data.photos,
                    coordinate: that.data.coordinate,
                    address: that.data.address
                  })
                },
                success: res => {
                  if (res.data.success) {
                    util.showSuccess('发表成功')
                    that.setData({
                      text: '',
                      photos: [],
                      canAddPhoto: true
                    }, wx.switchTab({
                      url: '/pages/index/index'
                    }))
                  } else if (res.data.code === '500') {
                    that.setData({
                      showAuthorize: true
                    })
                  } else {
                    util.showModal('发表失败', res.data.errMsg, true)
                  }
                },
                fail: error => {
                  util.showModal('发表失败', error, true)
                }
              })
            }
          })
        } else {
          wx.request({
            url: config.service.publishUrl,
            method: 'GET',
            header: {
              skey: app.globalData.skey
            },
            data: {
              city: '',
              trackInfo: JSON.stringify({
                username: app.globalData.userInfo.nickName,
                avatarUrl: app.globalData.userInfo.avatarUrl,
                text: that.data.text,
                photos: that.data.photos,
                coordinate: [],
                address: ''
              })
            },
            success: res => {
              if (res.data.success) {
                util.showSuccess('发表成功')
                that.setData({
                  text: '',
                  photos: [],
                  canAddPhoto: true
                }, wx.switchTab({
                  url: '/pages/index/index'
                }))
              } else if (res.data.code === '500') {
                that.setData({
                  showAuthorize: true
                })
              } else {
                util.showModal('发表失败', res.data.errMsg, true)
              }
            },
            fail: error => {
              util.showModal('发表失败', error, true)
            }
          })
        }
      })
    } else {
      util.showModal('提示', '先写点内容再发表吧～')
    }
  },

  upLoad: function(index, total, oid, signature, callback) {
    if (!total) {
      callback()
      return
    }
    if (index < 0) {
      wx.request({
        url: config.service.signUrl,
        method: 'GET',
        header: {
          skey: app.globalData.skey
        },
        success: res => {
          this.upLoad(index + 1, total, res.data.data.open_id, res.data.data.signature, callback)
          return
        },
        fail: error => {
          util.showModal('发表失败', error, true)
          return
        }
      })
    } else {
      var fileName = Math.random().toString(36).substr(2, 4)
      wx.uploadFile({
        url: `${config.service.cosUploadUrl}${oid}/${fileName}.png`,
        filePath: this.data.photos[index],
        header: {
          'Authorization': signature
        },
        name: 'filecontent',
        formData: {
          op: 'upload'
        },
        success: () => {
          this.data.photos[index] = `${config.service.cosUrl}${oid}/${fileName}.png`
          if (index < total - 1) {
            this.upLoad(index + 1, total, oid, signature, callback)
          } else {
            callback()
          }
        }
      })
    }
  },

  onHideAuthorize: function() {
    this.setData({
      showAuthorize: false
    })
  }
})