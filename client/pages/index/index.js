var util = require('../../utils/util.js')
var config = require('../../config.js')
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js')
var qqmapsdk = new QQMapWX({
  key: 'MNXBZ-G5TWD-GYF42-HHZJL-2W2J3-PVBX4'
})
var app = getApp()

Page({
  data: {
    track: [],
    menus: [],
    city: '未定位',
    trackDecoration: 'underline',
    trackFontWeight: '900',
    rankDecoration: '',
    rankFontWeight: '300',
    collecting: false,
    addingMenu: false,
    track_id: '',
    status: 'all',
    people: [],
    first: {
      coin: 0
    },
    commentting: false,
    comment_text: '',
    placeholder: '',
    openId: '',
    currentTrackId: '',
    showTracks: true,
    ad: [],
    current: 0,
    showAuthorize: false
  },

  onLoad: function(options) {
    if (options.city) {
      this.setData({
        showTracks: false,
        trackDecoration: '',
        trackFontWeight: '300',
        rankDecoration: 'underline',
        rankFontWeight: '900',
        status: 'group'
      })
      this.onGroupTap(true, options.city)
    }
    qqmapsdk.reverseGeocoder({
      success: res => {
        this.data.city = res.result.address_component.city
        if (this.data.city) {
          this.setData({
            city: this.data.city
          })
          this.refreshAd()
          this.refreshData()
        }
      },
      fail: () => {
        this.refreshData()
      }
    })
  },

  onShow: function() {
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  onPullDownRefresh: function() {
    this.refreshAd()
    if (this.data.showTracks) {
      this.refreshData()
    } else if (this.data.status === 'all') {
      this.onAllTap(false)
    } else if (this.data.status === 'friend') {
      this.onFriendTap(false)
    } else if (this.data.status === 'group') {
      this.onGroupTap(false)
    } else {
      wx.stopPullDownRefresh()
    }
  },

  refreshData: function() {
    wx.request({
      url: config.service.getTrackUrl,
      method: 'GET',
      header: {
        skey: app.globalData.skey
      },
      data: {
        city: this.data.city ? this.data.city : '未定位'
      },
      success: res => {
        if (res.data.success) {
          this.data.track = []
          for (var i in res.data.data) {
            this.data.track.push(JSON.parse(res.data.data[i].trackInfo))
          }
          var sortedTrackList = this.data.track.sort(function(value1, value2) {
            if (parseInt(value1.createTime) < parseInt(value2.createTime)) {
              return 1
            } else if (parseInt(value1.createTime) > parseInt(value2.createTime)) {
              return -1
            } else {
              return 0
            }
          })
          for (var i in sortedTrackList) {
            sortedTrackList[i].createTime = this.formatMsgTime(sortedTrackList[i].createTime)
          }
          this.setData({
            track: sortedTrackList,
            menus: res.data.menus
          })
          wx.stopPullDownRefresh()
        } else {
          util.showModal('刷新失败', res.data.errMsg, true)
          wx.stopPullDownRefresh()
        }
      },
      fail: error => {
        util.showModal('刷新失败', error, true)
        wx.stopPullDownRefresh()
      }
    })
  },

  formatMsgTime: function(timespan) {
    var dateTime = new Date(parseInt(timespan)),
      year = dateTime.getFullYear(),
      month = dateTime.getMonth() + 1,
      day = dateTime.getDate(),
      hour = dateTime.getHours(),
      minute = dateTime.getMinutes(),
      second = dateTime.getSeconds(),
      now = new Date(),
      now_new = Math.round(now),
      milliseconds = 0,
      timeSpanStr

    milliseconds = now.getTime() - parseInt(timespan)

    if (milliseconds <= 1000 * 60 * 1) {
      timeSpanStr = '刚刚'
    } else if (1000 * 60 * 1 < milliseconds && milliseconds <= 1000 * 60 * 60) {
      timeSpanStr = Math.round((milliseconds / (1000 * 60))) + '分钟前'
    } else if (1000 * 60 * 60 * 1 < milliseconds && milliseconds <= 1000 * 60 * 60 * 24) {
      timeSpanStr = Math.round(milliseconds / (1000 * 60 * 60)) + '小时前'
    } else if (1000 * 60 * 60 * 24 < milliseconds && milliseconds <= 1000 * 60 * 60 * 24 * 15) {
      timeSpanStr = Math.round(milliseconds / (1000 * 60 * 60 * 24)) + '天前'
    } else if (milliseconds > 1000 * 60 * 60 * 24 * 15 && year == now.getFullYear()) {
      timeSpanStr = month + '-' + day + ' ' + hour + ':' + minute
    } else {
      timeSpanStr = year + '-' + month + '-' + day + ' ' + hour + ':' + minute
    }

    return timeSpanStr
  },

  refreshAd: function() {
    wx.request({
      url: config.service.adUrl,
      method: 'GET',
      data: {
        city: (!this.data.city || this.data.city == '未定位') ? '' : this.data.city
      },
      success: res => {
        if (res.data.success) {
          this.setData({
            ad: JSON.parse(res.data.data)
          })
        } else {
          util.showModal('推广获取失败', res.data.errMsg, true)
        }
      },
      fail: error => {
        util.showModal('推广获取失败', error, true)
      }
    })
  },

  onTrackTap: function() {
    this.setData({
      showTracks: true,
      trackDecoration: 'underline',
      trackFontWeight: '900',
      rankDecoration: '',
      rankFontWeight: '300'
    })
  },

  onRankTap: function() {
    if (this.data.status === 'all') {
      this.onAllTap()
    } else if (this.data.status === 'friend') {
      this.onFriendTap()
    } else if (app.globalData.openGid) {
      this.onGroupTap()
    }
    this.setData({
      showTracks: false,
      trackDecoration: '',
      trackFontWeight: '300',
      rankDecoration: 'underline',
      rankFontWeight: '900'
    })
  },

  onLocationTap: function() {
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
              city: sdkRes.result.address_component.city
            }, this.refreshData())
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

  onLocationFirstTap: function() {
    if (this.data.status === 'friend') {
      return
    }
    this.onLocationTap()
  },

  onFollow: function(e) {
    var that = this
    wx.request({
      url: config.service.followUrl,
      method: 'GET',
      header: {
        skey: app.globalData.skey
      },
      data: {
        trackId: e.detail
      },
      success: res => {
        if (!res.data.success && res.data.code === '400') {
          util.showSuccess('已关注')
        } else if (!res.data.success && res.data.code === '500') {
          that.setData({
            showAuthorize: true
          })
        } else if (!res.data.success) {
          util.showModal('关注失败', res.data.errMsg, true)
        }
      },
      fail: error => {
        util.showModal('关注失败', error, true)
      },
      complete: () => {
        this.refreshData()
      }
    })
  },

  onOccupy: function(e) {
    var that = this
    for (var i in this.data.track) {
      if (this.data.track[i].trackId === e.detail) {
        var occupy = this.data.track[i].occupy
        if (occupy >= 3) {
          util.showSuccess('已经占领啦')
          return
        }
        break
      }
    }
    wx.request({
      url: config.service.occupyUrl,
      method: 'GET',
      header: {
        skey: app.globalData.skey
      },
      data: {
        trackId: e.detail
      },
      success: res => {
        if (res.data.success) {
          util.showSuccess(occupy < 2 ? '点赞成功' : '已占领')
        } else if (res.data.code === '400') {
          util.showSuccess('已经赞过啦')
        } else if (res.data.code === '500') {
          that.setData({
            showAuthorize: true
          })
        } else {
          util.showModal('点赞失败', res.data.errMsg, true)
        }
      },
      fail: error => {
        util.showModal('点赞失败', error, true)
      },
      complete: () => {
        this.refreshData()
      }
    })
  },

  onShowMenuList: function(e) {
    this.setData({
      collecting: true,
      track_id: e.detail
    })
  },

  onHideMenuList: function() {
    this.setData({
      collecting: false
    })
  },

  onShowInputBox: function() {
    this.setData({
      collecting: false,
      addingMenu: true
    })
  },

  onInputCancel: function() {
    this.setData({
      addingMenu: false
    })
  },

  onInputConfirm: function(e) {
    var that = this
    this.setData({
      addingMenu: false
    })
    if (e.detail) {
      wx.request({
        url: config.service.newMenuCollectUrl,
        method: 'GET',
        header: {
          skey: app.globalData.skey
        },
        data: {
          name: e.detail,
          track_id: this.data.track_id
        },
        success: res => {
          if (res.data.success) {
            util.showSuccess('收藏成功')
          } else if (res.data.code === '500') {
            that.setData({
              showAuthorize: true
            })
          } else {
            util.showModal('收藏失败', res.data.errMsg, true)
          }
        },
        fail: error => {
          util.showModal('收藏失败', error, true)
        },
        complete: () => {
          this.refreshData()
        }
      })
    }
  },

  onCollect: function(e) {
    var that = this
    wx.request({
      url: config.service.collectUrl,
      method: 'GET',
      header: {
        skey: app.globalData.skey
      },
      data: {
        track_id: this.data.track_id,
        menu_id: e.detail
      },
      success: res => {
        if (res.data.success) {
          util.showSuccess('收藏成功')
        } else if (res.data.code === '500') {
          that.setData({
            showAuthorize: true
          })
        } else {
          util.showModal('收藏失败', res.data.errMsg, true)
        }
      },
      fail: error => {
        util.showModal('收藏失败', error, true)
      },
      complete: () => {
        this.refreshData()
      }
    })
  },

  onUncollect: function(e) {
    var that = this
    wx.request({
      url: config.service.uncollectUrl,
      method: 'GET',
      header: {
        skey: app.globalData.skey
      },
      data: {
        track_id: e.detail
      },
      success: res => {
        if (res.data.success) {
          util.showSuccess('取消收藏成功')
        } else if (res.data.code === '500') {
          that.setData({
            showAuthorize: true
          })
        } else {
          util.showModal('取消收藏失败', res.data.errMsg, true)
        }
      },
      fail: error => {
        util.showModal('取消收藏失败', error, true)
      },
      complete: () => {
        this.refreshData()
      }
    })
  },

  onAllTap: function(alert = true) {
    this.setData({
      status: 'all'
    })
    if (alert) {
      this.setData({
        people: [],
        first: {
          coin: 0
        }
      })
    }
    if (this.data.city != '未定位') {
      if (alert) {
        util.showLoading('正在获取')
      }
      wx.request({
        url: config.service.allRankUrl,
        method: 'GET',
        header: {
          skey: app.globalData.skey
        },
        data: {
          city: this.data.city
        },
        success: res => {
          if (res.data.success) {
            if (this.data.status === 'all') {
              if (res.data.data != '[]') {
                var total = JSON.parse(res.data.data),
                  first = total.splice(0, 1)
                this.setData({
                  people: total,
                  first: first[0]
                })
              } else {
                this.setData({
                  first: {
                    coin: 0
                  }
                })
              }
            }
            if (alert) {
              wx.hideToast()
            }
            wx.stopPullDownRefresh()
          } else if (res.data.code === '500') {
            this.setData({
              showAuthorize: true
            })
            if (alert) {
              wx.hideToast()
            }
            wx.stopPullDownRefresh()
          } else {
            util.showModal('获取失败', res.data.errMsg, true)
            wx.stopPullDownRefresh()
          }
        },
        fail: error => {
          util.showModal('获取失败', error, true)
          wx.stopPullDownRefresh()
        }
      })
    } else {
      wx.stopPullDownRefresh()
    }
  },

  onGroupTap: function(alert = true, city = '') {
    var that = this
    this.setData({
      status: 'group',
      people: [],
      first: {
        coin: 0
      }
    })
    if (this.data.city === '未定位' && !city) {
      wx.stopPullDownRefresh()
      return
    }
    if (alert) {
      util.showLoading('正在获取')
    }
    wx.request({
      url: config.service.groupRankUrl,
      method: 'GET',
      header: {
        skey: app.globalData.skey
      },
      data: {
        city: city ? city : this.data.city
      },
      success: res => {
        if (res.data.success) {
          if (this.data.status === 'group') {
            if (res.data.data != '[]') {
              var total = JSON.parse(res.data.data),
                first = total.splice(0, 1)
              this.setData({
                people: total,
                first: first[0]
              })
            } else {
              this.setData({
                first: {
                  coin: 0
                }
              })
            }
          }
          if (alert) {
            wx.hideToast()
          }
          wx.stopPullDownRefresh()
        } else if (res.data.code === '500') {
          that.setData({
            showAuthorize: true
          })
          if (alert) {
            wx.hideToast()
          }
          wx.stopPullDownRefresh()
        } else {
          util.showModal('获取失败', res.data.errMsg, true)
          wx.stopPullDownRefresh()
        }
      },
      fail: error => {
        util.showModal('获取失败', error, true)
        wx.stopPullDownRefresh()
      }
    })
  },

  onFriendTap: function(alert = true) {
    var that = this
    this.setData({
      status: 'friend'
    })
    if (alert) {
      util.showLoading('正在获取')
      this.setData({
        people: [],
        first: {
          coin: 0
        }
      })
    }
    wx.request({
      url: config.service.friendRankUrl,
      method: 'GET',
      header: {
        skey: app.globalData.skey
      },
      success: res => {
        if (res.data.success) {
          if (this.data.status === 'friend') {
            if (res.data.data != '[]') {
              var total = JSON.parse(res.data.data),
                first = total.splice(0, 1)
              this.setData({
                people: total,
                first: first[0]
              })
            } else {
              this.setData({
                first: {
                  coin: 0
                }
              })
            }
          }
          if (alert) {
            wx.hideToast()
          }
          wx.stopPullDownRefresh()
        } else if (res.data.code === '500') {
          that.setData({
            showAuthorize: true
          })
          if (alert) {
            wx.hideToast()
          }
          wx.stopPullDownRefresh()
        } else {
          util.showModal('获取失败', res.data.errMsg, true)
          wx.stopPullDownRefresh()
        }
      },
      fail: error => {
        util.showModal('获取失败', error, true)
        wx.stopPullDownRefresh()
      }
    })
  },

  onShareAppMessage: function(options) {
    return {
      title: '吃了一顿饭，就成了首富！！！',
      path: '/pages/index/index?city=' + (this.data.city === '未定位' ? '' : this.data.city),
      imageUrl: '/assets/rank-share.png'
    }
  },

  onComment: function(e) {
    this.setData({
      commentting: true,
      placeholder: '评论',
      openId: '',
      currentTrackId: e.detail
    })
  },

  onInput: function(e) {
    this.setData({
      comment_text: e.detail.value
    })
  },

  onCommentSubmit: function() {
    var that = this
    this.setData({
      commentting: false
    })
    if (this.data.comment_text) {
      wx.request({
        url: config.service.commentUrl,
        method: 'GET',
        header: {
          skey: app.globalData.skey
        },
        data: {
          trackId: this.data.currentTrackId,
          openId: this.data.openId,
          text: this.data.comment_text
        },
        success: res => {
          if (res.data.success) {
            var data = {
              trackId: this.data.currentTrackId,
              showHome: false
            }
            wx.navigateTo({
              url: '/pages/oneTrack/oneTrack?data=' + JSON.stringify(data)
            })
          } else if (res.data.code === '500') {
            that.setData({
              showAuthorize: true
            })
          } else {
            util.showModal('评论失败', res.data.errMsg, true)
          }
        },
        fail: error => {
          util.showModal('评论失败', error, true)
        }
      })
    }
  },

  onAdTap: function() {
    if (this.data.ad[this.data.current].url) {
      wx.navigateTo({
        url: '/pages/ad/ad?data=' + this.data.ad[this.data.current].url
      })
    }
  },

  onHideAuthorize: function() {
    this.setData({
      showAuthorize: false
    })
  }
})