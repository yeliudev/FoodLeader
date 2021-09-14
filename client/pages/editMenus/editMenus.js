var util = require('../../utils/util.js')
var config = require('../../config.js')
var app = getApp()

Page({
  data: {
    menus: [],
    all: '全选',
    height: '',
    showAuthorize: false
  },

  onLoad: function() {
    var res = wx.getSystemInfoSync()
    this.setData({
      height: 750 * res.windowHeight / res.windowWidth - 85
    })
    wx.startPullDownRefresh()
  },

  onPullDownRefresh: function() {
    this.getMenuList()
  },

  getMenuList: function() {
    var that = this
    wx.request({
      url: config.service.getMenuListUrl,
      method: 'GET',
      header: {
        skey: app.globalData.skey
      },
      success: res => {
        if (res.data.success) {
          this.setData({
            menus: res.data.data
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
      },
      complete: () => {
        wx.stopPullDownRefresh()
      }
    })
  },

  checkAll: function() {
    for (var i in this.data.menus) {
      if (!this.data.menus[i].checked) {
        this.setData({
          all: '全选'
        })
        return
      }
    }
    this.setData({
      all: '全不选'
    })
  },

  selectAll: function() {
    if (this.data.all === '全选') {
      for (var i in this.data.menus) {
        this.data.menus[i].checked = true
        this.setData({
          menus: this.data.menus,
          all: '全不选'
        })
      }
    } else {
      for (var i in this.data.menus) {
        this.data.menus[i].checked = false
        this.setData({
          menus: this.data.menus,
          all: '全选'
        })
      }
    }
  },

  onMenuTap: function(e) {
    for (var i in this.data.menus) {
      if (this.data.menus[i].menu_id === e.currentTarget.id) {
        this.data.menus[i].checked = this.data.menus[i].checked ? false : true
        this.setData({
          menus: this.data.menus
        })
        this.checkAll()
        return
      }
    }
  },

  onDeleteTap: function() {
    var list = [],
      that = this
    for (var i in this.data.menus) {
      if (this.data.menus[i].checked) {
        list.push(this.data.menus[i].menu_id)
      }
    }
    if (list.length) {
      wx.request({
        url: config.service.deleteMenuUrl,
        method: 'GET',
        header: {
          skey: app.globalData.skey
        },
        data: {
          list: JSON.stringify(list)
        },
        success: res => {
          if (res.data.success) {
            wx.navigateBack()
          } else if (res.data.code === '500') {
            that.setData({
              showAuthorize: true
            })
          } else {
            util.showModal('删除失败', res.data.errMsg, true)
            wx.startPullDownRefresh()
          }
        },
        fail: error => {
          util.showModal('删除失败', error, true)
        }
      })
    } else {
      util.showModal('提示', '请先选择菜单哦～')
    }
  },

  onHideAuthorize: function() {
    this.setData({
      showAuthorize: false
    })
  }
})