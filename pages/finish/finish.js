// pages/finish/finish.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    serviceList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData();
  },

  onPullDownRefresh() {
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    this.setData({
      serviceList: []
    }, () => {
      that.getData('pulldown');
    })
  },

  getData(hasPulldown) {
    var that = this;
    //调接口返回serviceList
    wx.request({
      url: app.globalData.host + '/oubDelivery/queryFinishService',
      method: 'GET',
      data: {
        openId: app.globalData.openid
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res.data.success) {
          if (hasPulldown) {
            wx.hideLoading();
            wx.stopPullDownRefresh();
          }

          that.setData({
            serviceList: res.data.data
          })
        }
      }
    })
  },

  //打电话
  callUp: function (e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.mobile
    })
  }
})