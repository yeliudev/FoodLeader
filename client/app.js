var util = require('utils/util.js')
var config = require('config.js')

App({
  globalData: {
    userInfoAuthorized: false,
    skey: '',
    userInfo: {},
    openGid: ''
  },

  onShow: function(options) {
    var data = options.query.data ? JSON.parse(options.query.data) : {}
    this.globalData.skey = wx.getStorageSync('skey')
    this.globalData.userInfo = wx.getStorageSync('userInfo')
  }
})