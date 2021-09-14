var util = require('../../utils/util.js')
var config = require('../../config.js')
var app = getApp()

Page({
  data: {
    track: [],
    menu_id: '',
    menuList: [],
    commentting: false,
    comment_text: '',
    placeholder: '',
    openId: '',
    currentTrackId: '',
    collecting: false,
    addingMenu: false,
    track_id: '',
    showHome: false,
    ad: {},
    city: '',
    showAuthorize: false
  },

  onLoad: function(options) {
    wx.showShareMenu()
    var data = JSON.parse(options.data)
    this.setData({
      menu_id: data.menu_id,
      showHome: data.showHome,
      city: data.city
    })
    wx.startPullDownRefresh()
  },

  onPullDownRefresh: function() {
    this.refreshData()
    if (this.data.showHome) {
      this.refreshAd()
    }
  },

  refreshData: function() {
    var that = this
    wx.request({
      url: config.service.getCollectUrl,
      method: 'GET',
      header: {
        skey: app.globalData.skey
      },
      data: {
        menu_id: this.data.menu_id
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
            track: sortedTrackList
          })
          wx.stopPullDownRefresh()
        } else if (res.data.code === '500') {
          wx.stopPullDownRefresh()
          that.setData({
            showAuthorize: true
          })
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
    if (this.data.city) {
      wx.request({
        url: config.service.adUrl,
        method: 'GET',
        data: {
          city: this.data.city
        },
        success: res => {
          if (res.data.success) {
            this.setData({
              ad: res.data.data
            })
          } else {
            util.showModal('推广获取失败', res.data.errMsg, true)
          }
        },
        fail: error => {
          util.showModal('推广获取失败', error, true)
        }
      })
    }
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

  onShareAppMessage: function(options) {
    var data = {
      menu_id: this.data.menu_id,
      showHome: true,
      city: this.data.city
    }
    return {
      title: '看你骨骼清奇，送你一份我的美食清单！',
      path: '/pages/collect/collect?data=' + JSON.stringify(data),
      imageUrl: '/assets/collect-share.png'
    }
  },

  onBackTap: function() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  onHideAuthorize: function() {
    this.setData({
      showAuthorize: false
    })
  }
})