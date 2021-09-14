var app = getApp()

Component({
  data: {
    shadowAnimation: 'shadowDisplay',
    modalAnimation: 'modalDisplay',
    shadowOpacity: '0.65',
    modalOpacity: '1'
  },

  attached: function() {
    var res = wx.getSystemInfoSync()
    this.setData({
      modalTop: res.screenHeight - 440
    })
  },

  methods: {
    hideModal: function() {
      this.setData({
        shadowAnimation: 'shadowHide',
        modalAnimation: 'modalHide',
        shadowOpacity: '0',
        modalOpacity: '0'
      })
    },

    onRejectTap: function() {
      var that = this
      this.hideModal()
      setTimeout(function() {
        that.triggerEvent('hideAuthorize')
      }, 350)
    },

    onAcceptTap: function() {
      var that = this
      app.globalData.userInfoAuthorized = false
      wx.navigateTo({
        url: '/pages/authorize/authorize'
      })
      this.hideModal()
      setTimeout(function() {
        that.triggerEvent('hideAuthorize')
      }, 350)
    }
  }
})