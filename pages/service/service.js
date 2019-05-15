// pages/service/service.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    dialogDisplay: 'none',
    value1: '', //取件码
    value2: '',
    value3: '',
    value4: '',
    value5: '',
    focus1: '', //取件码
    focus2: '',
    focus3: '',
    focus4: '',
    focus5: '',
    serviceList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData();
  },


  onShow: function (options) {
    if (!app.globalData.register) {
      wx.showToast({
        title: '请先注册!',
        icon: 'none'
      })
    }
  },

  onPullDownRefresh () {
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    this.setData({
      serviceList: []
    }, ()=>{
      that.getData('pulldown');
    })
  },

  getData (hasPulldown) {
    var that = this;
    //调接口返回serviceList
    wx.request({
      url: app.globalData.host + '/oubDelivery/getDeliveryDetailList',
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
  },

  //选择id
  radioChange(e) {
    this.setData({
      id: e.detail.value
    })
  },

  //输入框
  bindinput(e) {
    if ((!isNaN(e.detail.value)) && e.detail.value.length == 1 ){
      this.setData({
        ['value' + e.currentTarget.dataset.idx]: e.detail.value,
        ['focus' + (e.currentTarget.dataset.idx)]: false,
        ['focus' + (parseInt(e.currentTarget.dataset.idx) + 1)]: true
      })
    }else {
      this.setData({
        ['value' + e.currentTarget.dataset.idx]: ''
      })
    }
  },

  //打开输入框
  openDialog() {
    if(this.data.id == '') {
      wx.showToast({
        title: '请选择团长',
        icon: 'cancel'
      })
    }else {
      this.setData({
        dialogDisplay: 'block',
        focus1: true,
        value1: '',
        value2: '',
        value3: '',
        value4: '',
        value5: ''
      })
    }
  },

  //确认
  sureService() {
    //接口入参
    const id = this.data.id;
    let deliveryDetailIds;
    this.data.serviceList.map(item=>{
      if (item.groupLeaderId == id){
        deliveryDetailIds = item.deliveryDetailIds;
      }
    });
    const pickUpCode = this.data.value1 + this.data.value2 + this.data.value3 + this.data.value4 + this.data.value5;
    const that = this;
    if(pickUpCode.length == 5){
      //调接口返回成功进行下面代码
      wx.request({
        url: app.globalData.host + '/oubDelivery/confirmOubDeliveryDetail',
        method: 'POST',
        data: {
          oubDeliveryBatchDetailIds: deliveryDetailIds,
          confirmCode: pickUpCode
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          if (res.data.success) {
            wx.showToast({
              title: '送达成功',
              icon: 'success',
              success: function(){
                let delIdx = 0;
                that.data.serviceList.map((item, index) => {
                  if (item.id == id) {
                    delIdx = index;
                  }
                })
                that.data.serviceList.splice(delIdx, 1);
                that.setData({
                  dialogDisplay: 'none',
                  serviceList: that.data.serviceList
                })
              }
            })
          }
        }
      })
    }
  },
  //输入框
  cancelService() {
    this.setData({
      dialogDisplay: 'none'
    })
  },
  sureService2() {
    const that = this;
    if (this.data.id == '') {
      wx.showToast({
        title: '请选择团长',
        icon: 'cancel'
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '确认送达？',
        success(res) {
          if (res.confirm) {
            const id = that.data.id;
            let deliveryDetailIds;
            that.data.serviceList.map(item => {
              if (item.groupLeaderId == id) {
                deliveryDetailIds = item.deliveryDetailIds;
              }
            });
            //调接口返回成功进行下面代码
            wx.request({
              url: app.globalData.host + '/oubDelivery/confirmOubDeliveryDetail',
              method: 'POST',
              data: {
                oubDeliveryBatchDetailIds: deliveryDetailIds
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              success(res) {
                if (res.data.success) {
                  wx.showToast({
                    title: '送达成功',
                    icon: 'success',
                    success: function () {
                      let delIdx = 0;
                      that.data.serviceList.map((item, index) => {
                        if (item.id == id) {
                          delIdx = index;
                        }
                      })
                      that.data.serviceList.splice(delIdx, 1);
                      that.setData({
                        dialogDisplay: 'none',
                        serviceList: that.data.serviceList
                      })
                    }
                  })
                }
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  }
})