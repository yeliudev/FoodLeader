var util = require('../../utils/util.js')
var config = require('../../config.js')
var app = getApp()

Page({
  data: {
    trackId: '',
    track_id: '',
    item: '',
    collecting: false,
    addingMenu: false,
    commentting: false,
    comment_text: '',
    placeholder: '',
    openId: '',
    currentTrackId: '',
    showHome: false,
    showAuthorize: false,
    menus: []
  },

  onLoad: function(options) {
    var data = JSON.parse(options.data)
    this.setData({
      trackId: data.trackId,
      showHome: data.showHome
    })
    this.refreshData()
  },

  onPullDownRefresh: function() {
    this.refreshData()
  },

  refreshData: function() {
    var that = this
    wx.request({
      url: config.service.getOneTrackUrl,
      method: 'GET',
      header: {
        skey: app.globalData.skey
      },
      data: {
        trackId: this.data.trackId
      },
      success: res => {
        if (res.data.success) {
          var item = JSON.parse(res.data.data)
          item.createTime = this.formatMsgTime(item.createTime)
          this.setData({
            item: item,
            menus: res.data.menus
          })
          wx.stopPullDownRefresh()
        } else if (res.data.code === '500') {
          wx.stopPullDownRefresh()
          that.setData({
            showAuthorize: true
          })
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

  onShowMenuList: function() {
    this.setData({
      collecting: true
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
          track_id: this.data.trackId
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
        track_id: this.data.trackId,
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
            this.refreshData()
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

  onReply: function(e) {
    var data = JSON.parse(e.detail)
    this.setData({
      commentting: true,
      placeholder: '回复' + data.from,
      openId: data.openId,
      currentTrackId: data.trackId
    })
  },

  onDeleteComment: function(e) {
    var data = JSON.parse(e.detail),
      that = this
    wx.request({
      url: config.service.deleteCommentUrl,
      method: 'GET',
      header: {
        skey: app.globalData.skey
      },
      data: {
        trackId: data.trackId,
        commentId: data.commentId
      },
      success: res => {
        if (res.data.success) {
          this.refreshData()
        } else if (res.data.code === '500') {
          that.setData({
            showAuthorize: true
          })
        } else {
          util.showModal('删除失败', res.data.errMsg, true)
        }
      },
      fail: error => {
        util.showModal('删除失败', error, true)
      }
    })
  },

  onShareAppMessage: function(options) {
    var data = {
      trackId: this.data.trackId,
      showHome: true
    }
    return {
      title: '今晚就去这家吃了，抖友要开始打卡了！',
      path: '/pages/oneTrack/oneTrack?data=' + JSON.stringify(data),
      imageUrl: '/assets/track-share.png'
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