var showLoading = title => {
  wx.hideToast()
  wx.showToast({
    title,
    icon: 'loading',
    mask: true,
    duration: 10000
  })
}

var showSuccess = title => {
  wx.hideToast()
  wx.showToast({
    title,
    icon: 'success'
  })
}

var showModal = (title, content, doStringify = false) => {
  wx.hideToast()
  wx.showModal({
    title,
    content: doStringify ? JSON.stringify(content) : content,
    showCancel: false
  })
}

module.exports = {
  showLoading,
  showSuccess,
  showModal
}