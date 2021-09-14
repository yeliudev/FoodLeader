var util = require('../../utils/util.js')
var config = require('../../config.js')
var app = getApp()

Page({
  data: {
    messages: [],
    allMessages: [],
    showMore: true,
    showAuthorize: false
  },

  onLoad: function() {
    wx.startPullDownRefresh()
  },

  onShow: function() {
    this.refreshData()
  },

  onPullDownRefresh: function() {
    this.refreshData()
  },

  refreshData: function() {
    var that = this
    wx.request({
      url: config.service.getMessageUrl,
      method: 'GET',
      header: {
        skey: app.globalData.skey
      },
      success: res => {
        if (res.data.success) {
          var message = JSON.parse(res.data.data),
            didntread = []
          var sortedMessage = message.sort(function(value1, value2) {
            if (parseInt(value1.time) < parseInt(value2.time)) {
              return 1
            } else if (parseInt(value1.time) > parseInt(value2.time)) {
              return -1
            } else {
              return 0
            }
          })
          for (var i in sortedMessage) {
            sortedMessage[i].time = this.formatMsgTime(sortedMessage[i].time)
          }
          for (var i in sortedMessage) {
            if (!sortedMessage[i].read) {
              didntread.push(sortedMessage[i])
            }
          }
          if (didntread.length) {
            this.setData({
              showMore: true,
              messages: didntread,
              allMessages: sortedMessage
            })
          } else {
            this.setData({
              showMore: false,
              messages: sortedMessage
            })
          }
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

  onMoreTap: function() {
    this.setData({
      messages: this.data.allMessages,
      showMore: false
    })
  },

  onMessageTap: function(e) {
    var data = {
      trackId: this.data.messages[e.currentTarget.id].trackId,
      showHome: false
    }
    wx.navigateTo({
      url: '/pages/oneTrack/oneTrack?data=' + JSON.stringify(data)
    })
  },

  onHideAuthorize: function() {
    this.setData({
      showAuthorize: false
    })
  }
})