var util = require('../../utils/util.js')
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js')
var qqmapsdk = new QQMapWX({
  key: 'MNXBZ-G5TWD-GYF42-HHZJL-2W2J3-PVBX4'
})

Component({
  properties: {
    trackId: {
      type: String,
      value: ''
    },
    username: {
      type: String,
      value: ''
    },
    avatarUrl: {
      type: String,
      value: ''
    },
    createTime: {
      type: String,
      value: ''
    },
    text: {
      type: String,
      value: ''
    },
    photos: {
      type: Array,
      value: []
    },
    coordinate: {
      type: Array,
      value: []
    },
    occupy: {
      type: Number,
      value: 0
    },
    collect: {
      type: Boolean,
      value: false
    },
    followed: {
      type: Boolean,
      value: false
    },
    address: {
      type: String,
      value: ''
    },
    delete: {
      type: Boolean,
      value: false
    },
    comments: {
      type: Array,
      value: []
    },
    showComment: {
      type: Boolean,
      value: false
    },
    single: {
      type: Boolean,
      value: false
    },
    open_id: {
      type: String,
      value: ''
    }
  },

  data: {
    width: 550,
    height: 550,
    hasInfo: false,
    first5comments: []
  },

  attached: function() {
    if (this.data.photos.length === 1) {
      wx.getImageInfo({
        src: this.data.photos[0],
        success: res => {
          if (res.height >= res.width) {
            this.setData({
              width: 550 * res.width / res.height,
              hasInfo: true
            })
          } else {
            this.setData({
              height: 550 * res.height / res.width,
              hasInfo: true
            })
          }
        }
      })
    }
    if (this.data.comments.length > 5) {
      this.setData({
        first5comments: this.data.comments.slice(0, 4)
      })
    }
  },

  methods: {
    onOnePhotoTap: function() {
      this.onPhotoTap()
      wx.getImageInfo({
        src: this.data.photos[0],
        success: res => {
          if (res.height >= res.width) {
            this.setData({
              width: 550 * res.width / res.height,
              hasInfo: true
            })
          } else {
            this.setData({
              height: 550 * res.height / res.width,
              hasInfo: true
            })
          }
        }
      })
    },

    onPhotoTap: function(e) {
      wx.previewImage({
        current: this.data.photos[e.target.id],
        urls: this.data.photos
      })
    },

    onLocationTap: function() {
      if (this.data.coordinate.length) {
        wx.openLocation({
          latitude: this.data.coordinate[0],
          longitude: this.data.coordinate[1],
          scale: 15
        })
      }
    },

    onFollowTap: function() {
      this.triggerEvent('follow', this.data.trackId)
    },

    onOccupyTap: function() {
      this.triggerEvent('occupy', this.data.trackId)
    },

    onCollectTap: function() {
      if (this.data.collect) {
        this.triggerEvent('uncollect', this.data.trackId)
      } else {
        this.triggerEvent('showMenuList', this.data.trackId)
      }
    },

    onDeleteTap: function() {
      this.triggerEvent('delete', this.data.trackId)
    },

    onCommentTap: function() {
      this.triggerEvent('comment', this.data.trackId)
    },

    onTextTap: function(e) {
      wx.showActionSheet({
        itemList: ['回复', '查看该用户', '删除'],
        success: res => {
          if (!res.tapIndex) {
            for (var i in this.data.comments) {
              if (this.data.comments[i].commentId === e.currentTarget.id) {
                var data = JSON.stringify({
                  trackId: this.data.trackId,
                  openId: this.data.comments[i].openId,
                  from: this.data.comments[i].one ? this.data.comments[i].one : this.data.comments[i].from
                })
                break
              }
            }
            this.triggerEvent('reply', data)
          } else if (res.tapIndex === 2) {
            var data = JSON.stringify({
              trackId: this.data.trackId,
              commentId: e.currentTarget.id
            })
            this.triggerEvent('deleteComment', data)
          } else {
            for (var i in this.data.comments) {
              if (this.data.comments[i].commentId === e.currentTarget.id) {
                wx.navigateTo({
                  url: '/pages/trackList/trackList?data=' + this.data.comments[i].openId
                })
                break
              }
            }
          }
        }
      })
    },

    onMoreTap: function() {
      this.setData({
        first5comments: []
      })
    },

    onTrackTap: function() {
      if (this.data.showComment) {
        return
      }
      var data = {
        trackId: this.data.trackId,
        showHome: false
      }
      wx.navigateTo({
        url: '/pages/oneTrack/oneTrack?data=' + JSON.stringify(data)
      })
    },

    onUserTap: function() {
      wx.navigateTo({
        url: '/pages/trackList/trackList?data=' + this.data.open_id
      })
    }
  }
})