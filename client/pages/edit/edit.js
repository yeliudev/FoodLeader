var util = require('../../utils/util.js')
var currentX, currentY, middle, index = 0,
  distance = 0

Page({
  data: {
    photos: [],
    notice_top: '',
    swiper_top: '',
    submit_top: '',
    index: 0,
    addingLabel: false,
    scale: 0,
    label: [
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },

  onLoad: function(options) {
    index = 0
    var res = wx.getSystemInfoSync(),
      photos = JSON.parse(options.data)
    this.setData({
      photos: photos,
      notice_top: 187 * res.windowHeight / res.windowWidth - 240 + '',
      swiper_top: 375 * res.windowHeight / res.windowWidth - 450 + '',
      submit_top: 562 * res.windowHeight / res.windowWidth + 182 + '',
      scale: 750 / res.windowWidth
    })
    middle = res.windowWidth / 2
    this.getImageInfo()
  },

  onSwiperChange: function(e) {
    this.setData({
      index: e.detail.current
    })
  },

  onPhotoTap: function(e) {
    currentX = e.detail.x
    currentY = e.detail.y
    this.setData({
      addingLabel: true,
    })
  },

  onInputCancel: function() {
    this.setData({
      addingLabel: false
    })
  },

  onInputConfirm: function(e) {
    this.setData({
      addingLabel: false
    })
    if (e.detail) {
      this.data.label[this.data.index].push({
        text: e.detail,
        x: currentX,
        y: currentY - this.data.swiper_top / this.data.scale,
        right: currentX >= middle ? true : false
      })
      this.setData({
        label: this.data.label
      })
    }
  },

  onTouchStart: function(e) {
    this.start_x = e.touches[0].clientX
    this.start_y = e.touches[0].clientY
  },

  onTouchMove: function(e) {
    var current_x = e.touches[0].clientX
    var current_y = e.touches[0].clientY
    var diff_x = current_x - this.start_x
    var diff_y = current_y - this.start_y
    distance += Math.abs(diff_x) + Math.abs(diff_y)

    this.data.label[this.data.index][e.currentTarget.id].x += diff_x
    this.data.label[this.data.index][e.currentTarget.id].y += diff_y
    this.setData({
      label: this.data.label
    })

    this.start_x = current_x
    this.start_y = current_y
  },

  onTouchEnd: function(e) {
    if (distance < 2) {
      this.data.label[this.data.index][e.currentTarget.id].right = this.data.label[this.data.index][e.currentTarget.id].right ? false : true
      this.setData({
        label: this.data.label
      })
    }
    distance = 0
  },

  getImageInfo: function() {
    util.showLoading('正在读取')
    wx.getImageInfo({
      src: this.data.photos[index],
      success: res => {
        this.data.label[index].splice(0, 0, {
          photoWidth: res.width / res.height > 2 / 3 ? 600 : 900 * res.width / res.height,
          photoHeight: res.width / res.height > 2 / 3 ? 600 * res.height / res.width : 900
        })
        index++
        if (index < this.data.photos.length) {
          this.getImageInfo()
        } else {
          this.setData({
            label: this.data.label
          })
          wx.hideToast()
        }
      },
      fail: error => {
        util.showModal('读取失败', error, true)
      }
    })
  },

  draw: function() {
    var that = this,
      label = this.data.label[index],
      ctx = wx.createCanvasContext(`preview_canvas_${index}`)
    ctx.setFontSize(24)
    ctx.setLineWidth(3)
    ctx.drawImage(this.data.photos[index], 0, 0, label[0].photoWidth, label[0].photoHeight)
    for (var i = 1; i < label.length; i++) {
      var metrics = ctx.measureText(label[i].text),
        x = label[i].x * this.data.scale + 0.5 * label[0].photoWidth - 375,
        y = (label[i].y + this.data.swiper_top / this.data.scale) * this.data.scale + 0.5 * label[0].photoHeight - this.data.swiper_top - 450
      if (label[i].right) {
        ctx.moveTo(x + 40, y - 21)
        ctx.lineTo(x + metrics.width + 40, y - 21)
        ctx.arc(x + metrics.width + 40, y, 21, 1.5 * Math.PI, 0.5 * Math.PI)
        ctx.lineTo(x + 40, y + 21)
        ctx.arc(x + 40, y, 21, 0.5 * Math.PI, 1.5 * Math.PI)
        ctx.moveTo(x + metrics.width + 61, y - 1)
        ctx.lineTo(x + metrics.width + 90, y - 1)
        ctx.lineTo(x + metrics.width + 90, y + 1)
        ctx.lineTo(x + metrics.width + 61, y + 1)
        ctx.lineTo(x + metrics.width + 61, y - 1)
        ctx.moveTo(x + metrics.width + 90, y)
        ctx.arc(x + metrics.width + 90, y, 5, 0, 2 * Math.PI)
      } else {
        ctx.moveTo(x + 5, y - 1)
        ctx.lineTo(x + 34, y - 1)
        ctx.lineTo(x + 34, y + 1)
        ctx.lineTo(x + 5, y + 1)
        ctx.lineTo(x + 5, y - 1)
        ctx.moveTo(x + 5, y)
        ctx.arc(x, y, 5, 0, 2 * Math.PI)
        ctx.moveTo(x + 55, y - 21)
        ctx.lineTo(x + metrics.width + 55, y - 21)
        ctx.arc(x + metrics.width + 55, y, 21, 1.5 * Math.PI, 0.5 * Math.PI)
        ctx.lineTo(x + 55, y + 21)
        ctx.arc(x + 55, y, 21, 0.5 * Math.PI, 1.5 * Math.PI)
      }
    }
    ctx.setGlobalAlpha(0.55)
    ctx.setFillStyle('black')
    ctx.fill()
    for (var i = 1; i < label.length; i++) {
      var x = label[i].x * this.data.scale + 0.5 * label[0].photoWidth - 375,
        y = (label[i].y + this.data.swiper_top / this.data.scale) * this.data.scale + 0.5 * label[0].photoHeight - this.data.swiper_top - 450
      ctx.setGlobalAlpha(1)
      ctx.setFillStyle('white')
      if (label[i].right) {
        ctx.fillText(label[i].text, x + 40, y + 9)
      } else {
        ctx.fillText(label[i].text, x + 55, y + 9)
      }
    }
    ctx.draw(false, function() {
      wx.canvasToTempFilePath({
        canvasId: `preview_canvas_${index}`,
        success: res => {
          that.data.photos[index] = res.tempFilePath
          if (index < that.data.photos.length - 1) {
            index++
            that.draw()
          } else {
            var pages = getCurrentPages(),
              prevPage = pages[pages.length - 2],
              count = prevPage.data.photos.length + that.data.photos.length
            prevPage.setData({
              photos: prevPage.data.photos.concat(that.data.photos),
              canAddPhoto: count < 9 ? true : false
            }, wx.navigateBack())
          }
        }
      })
    })
  },

  onSubmit: function() {
    index = 0
    this.draw()
  }
})