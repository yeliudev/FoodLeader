Component({
  properties: {
    menus: {
      type: Array,
      value: []
    }
  },

  data: {
    modalTop: '',
    text: '',
    shadowAnimation: 'shadowDisplay',
    modalAnimation: 'modalDisplay',
    shadowOpacity: '0.65',
    modalOpacity: '1'
  },

  attached: function() {
    var res = wx.getSystemInfoSync()
    this.setData({
      modalTop: res.screenHeight - 450
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

    onAddMenuTap: function() {
      var that = this
      this.hideModal()
      setTimeout(function() {
        that.triggerEvent('showInputBox')
      }, 350)
    },

    onMenuTap: function(e) {
      var that = this
      this.hideModal()
      setTimeout(function() {
        that.triggerEvent('collect', e.currentTarget.id)
      }, 350)
    },

    onShadowTap: function() {
      var that = this
      this.hideModal()
      setTimeout(function() {
        that.triggerEvent('hideMenuList')
      }, 350)
    }
  }
})