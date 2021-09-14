var util = require('../../utils/util.js')
var config = require('../../config.js')
var app = getApp()

Page({
  data: {
    menus: [],
    currentId: '',
    name: '',
    coin: '点击获取',
    titleAnimation: '',
    titleBottom: '-380rpx',
    titleRichTabBarDidOpen: false,
    menuAnimation: '',
    menuBottom: '-285rpx',
    menuRichTabBarDidOpen: false,
    shadowAnimation: 'shadowDisplay',
    shadowOpacity: '0.65',
    addingMenu: false,
    city: '',
    showAuthorize: false
  },

  onShow: function() {
    wx.hideShareMenu()
    this.refreshData()
  },

  onPullDownRefresh: function() {
    this.refreshData()
  },

  refreshData: function() {
    wx.hideShareMenu()
    this.getCoin(false)
    this.getMenuList(false)
  },

  onCoinTap: function() {
    this.getCoin()
  },

  getCoin: function(jump = true) {
    var that = this
    wx.request({
      url: config.service.getCoinUrl,
      method: 'GET',
      header: {
        skey: app.globalData.skey
      },
      success: res => {
        if (res.data.success) {
          this.setData({
            coin: res.data.data.coin,
            city: res.data.data.city
          })
        } else if (res.data.code === '500') {
          if (jump) {
            that.setData({
              showAuthorize: true
            })
          }
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

  getMenuList: function(jump = true) {
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
          if (jump) {
            that.setData({
              showAuthorize: true
            })
          }
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

  onLongTap: function() {
    wx.showModal({
      title: '关于',
      content: '「当前版本」\nv1.2.1 2018-10-3\n\n「更新日志」\n1. 新增“周榜”和“占领榜”\n2. 主界面交互优化\n\n「联系开发者」\nWeChat: aweawds',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  onSettingsTap: function() {
    if (!this.data.titleRichTabBarDidOpen) {
      this.setData({
        titleAnimation: 'rich-tab-bar-open',
        titleBottom: '0',
        shadowAnimation: 'shadowDisplay',
        shadowOpacity: '0.65',
        titleRichTabBarDidOpen: true
      })
    }
  },

  onEditMenus: function() {
    wx.navigateTo({
      url: '/pages/editMenus/editMenus'
    })
    this.setData({
      titleRichTabBarDidOpen: false
    })
  },

  onRecover: function() {
    wx.navigateTo({
      url: '/pages/recover/recover'
    })
    this.setData({
      titleRichTabBarDidOpen: false
    })
  },

  onMoreTap: function(e) {
    if (!this.data.menuRichTabBarDidOpen) {
      for (var i in this.data.menus) {
        if (this.data.menus[i].menu_id === e.target.id) {
          this.setData({
            currentId: e.target.id,
            name: this.data.menus[i].name,
            menuAnimation: 'short-rich-tab-bar-open',
            menuBottom: '0',
            shadowAnimation: 'shadowDisplay',
            shadowOpacity: '0.65',
            menuRichTabBarDidOpen: true
          })
          return
        }
      }
    }
  },

  onEditMenu: function() {
    for (var i in this.data.menus) {
      if (this.data.menus[i].menu_id === this.data.currentId) {
        var data = {
          menu_id: this.data.currentId,
          imageUrl: this.data.menus[i].imageUrl,
          name: this.data.menus[i].name
        }
        wx.navigateTo({
          url: '/pages/editMenu/editMenu?data=' + JSON.stringify(data)
        })
        this.onShadowTap()
        return
      }
    }
  },

  onDeleteMenu: function() {
    var that = this
    for (var i in this.data.menus) {
      if (this.data.menus[i].menu_id === this.data.currentId) {
        var list = [this.data.menus[i].menu_id]
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
              this.getMenuList()
            } else if (res.data.code === '500') {
              that.setData({
                showAuthorize: true
              })
            } else {
              util.showModal('修改失败', res.data.errMsg, true)
            }
          },
          fail: error => {
            util.showModal('修改失败', error, true)
          }
        })
        this.onShadowTap()
        return
      }
    }
  },

  onShadowTap: function() {
    var that = this
    this.setData({
      titleAnimation: 'rich-tab-bar-close',
      titleBottom: '-380rpx',
      menuAnimation: 'short-rich-tab-bar-close',
      menuBottom: '-285rpx',
      shadowAnimation: 'shadowHide',
      shadowOpacity: '0'
    })
    setTimeout(function() {
      that.setData({
        titleRichTabBarDidOpen: false,
        menuRichTabBarDidOpen: false
      })
    }, 350)
  },

  onNewMenu: function() {
    var that = this
    this.setData({
      titleAnimation: 'rich-tab-bar-close',
      titleBottom: '-380rpx',
      shadowAnimation: 'shadowHide',
      shadowOpacity: '0',
      addingMenu: true
    })
    setTimeout(function() {
      that.setData({
        titleRichTabBarDidOpen: false
      })
    }, 350)
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
        url: config.service.newMenuUrl,
        method: 'GET',
        header: {
          skey: app.globalData.skey
        },
        data: {
          name: e.detail
        },
        success: res => {
          if (res.data.success) {
            this.getMenuList()
          } else if (res.data.code === '500') {
            that.setData({
              showAuthorize: true
            })
          } else {
            util.showModal('创建失败', res.data.errMsg, true)
          }
        },
        fail: error => {
          util.showModal('创建失败', error, true)
        }
      })
    }
  },

  onMenuTap: function(e) {
    var data = {
      menu_id: e.currentTarget.id,
      showHome: false,
      city: this.data.city
    }
    wx.navigateTo({
      url: '/pages/collect/collect?data=' + JSON.stringify(data)
    })
  },

  onFollowTap: function() {
    wx.navigateTo({
      url: '/pages/follow/follow'
    })
  },

  onTrackTap: function() {
    wx.navigateTo({
      url: '/pages/myTrack/myTrack'
    })
  },

  onOccupyTap: function() {
    wx.navigateTo({
      url: '/pages/occupied/occupied'
    })
  },

  onMessageTap: function() {
    wx.navigateTo({
      url: '/pages/message/message'
    })
  },

  onHideAuthorize: function() {
    this.setData({
      showAuthorize: false
    })
  }
})