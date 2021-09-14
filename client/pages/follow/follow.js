var util = require('../../utils/util.js')
var config = require('../../config.js')
var app = getApp()

Page({
  data: {
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
      url: config.service.getFollowUrl,
      method: 'GET',
      header: {
        skey: app.globalData.skey
      },
      success: res => {
        if (res.data.success) {
          this.setData({
            user: res.data.data
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

  onUnfollowTap: function(e) {
    var that = this
    wx.request({
      url: config.service.unfollowUrl,
      method: 'GET',
      header: {
        skey: app.globalData.skey
      },
      data: {
        open_id: e.target.id
      },
      success: res => {
        if (res.data.success) {
          util.showSuccess('取消关注成功')
        } else if (res.data.code === '400') {
          util.showModal('提示', '不能取消关注自己哦～')
        } else if (res.data.code === '500') {
          that.setData({
            showAuthorize: true
          })
        } else {
          util.showModal('取消关注失败', res.data.errMsg, true)
        }
      },
      fail: error => {
        util.showModal('取消关注失败', error, true)
      },
      complete: () => {
        this.refreshData()
      }
    })
  },

  onUserTap: function(e) {
    wx.navigateTo({
      url: '/pages/trackList/trackList?data=' + e.target.id
    })
  },

  onHideAuthorize: function() {
    this.setData({
      showAuthorize: false
    })
  }
})