// pages/collect/collect.js
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scanCode: '',
    collectList: [],
    collectDetailList: [],
    detailDisplayList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  
  onShow: function (options) {
    if (!app.globalData.register) {
      wx.showToast({
        title: '请先注册!',
        icon: 'none'
      })
    }
  },

  longTap: function (e) {
    const index = e.currentTarget.dataset.idx;
    const collectList = this.data.collectList;
    const that = this;
    wx.showModal({
      title: '提示',
      content: '确认移除交接单：' + collectList[index].deliveryNo,
      success(res) {
        if (res.confirm) {
          //调删除接口
          collectList.splice(index,1);
          that.setData({
            collectList
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      } 
    })
  },

  showDetail: function (e) {
    const _this = this;
        let detailDisplayList = _this.data.detailDisplayList;
        if (detailDisplayList[e.currentTarget.dataset.idx] == 'none') {
          detailDisplayList.map(item => {
            return item = 'none';
          })
          detailDisplayList[e.currentTarget.dataset.idx] = 'block';

          if(this.data.collectDetailList.length == 0){
            wx.request({
              url: app.globalData.host + '/oubDelivery/queryOubDeliveryDetail',
              data: {
                deliveryNo: _this.data.collectList[e.currentTarget.dataset.idx].deliveryNo
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              success(res) {
                _this.setData({
                  collectDetailList: res.data.data
                })
              }
            })
          }
        } else if (detailDisplayList[e.currentTarget.dataset.idx] == 'block') {
          detailDisplayList.map(item => {
            return item = 'none';
          })
          detailDisplayList[e.currentTarget.dataset.idx] = 'none';
      }
    _this.setData({
      detailDisplayList: detailDisplayList
    })
  },

  // 扫码
  scan() {
    let that = this;
    wx.scanCode({
      success(res) {
        that.setData({
          scanCode: res.result
        });
        that.getCollect(res.result);
      }
    })
  },
  getCollect: function(scancode){
    let has = false;
    this.data.collectList.map(item=>{
      if (item.deliveryNo == scancode) {
        has = true;
      }
    })
    let that = this;
    if(!has){
        wx.request({
          url: app.globalData.host + '/oubDelivery/queryOubDelivery',
          data: {
            deliveryNo: scancode,
            openId: app.globalData.openid
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success(res) {
            if(res.data.success){
              if (res.data.data.length == 0){
                wx.showToast({
                  title: '没有该交接单',
                  icon: 'none'
                })
              }else{
                that.data.collectList = that.data.collectList.concat(res.data.data);
                that.data.detailDisplayList.push('none');
                that.setData({
                  collectList: that.data.collectList,
                  detailDisplayList: that.data.detailDisplayList,
                  scanCode: ''
                })
              }
            }else {
              wx.showToast({
                title: '获取失败',
                icon: 'none'
              })
            }
            
            console.log(that.data.collectList)
          }
      })
    }
  },

  sureDepart() {
    var _this = this;
    wx.showModal({
      title: '提示',
      content: '确认发车？',
      success(res) {
        if (res.confirm) {
          var deliveryNos = [];
          _this.data.collectList.map(item => {
            deliveryNos.push(item.deliveryNo);
          });
          // 调接口
          wx.request({
            url: app.globalData.host + '/oubDelivery/confirmOubDelivery',
            method: 'POST',
            data: {
              deliveryNos: deliveryNos,
              openId: app.globalData.openid
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success(res) {
              if (res.data.success) {
                wx.showToast({
                  title: '发车成功',
                  icon: 'success',
                  success: function () {
                    _this.setData({
                      collectList: []
                    })
                    wx.switchTab({
                      url: '/pages/service/service',
                    })
                  }
                })
              }else {
                wx.showToast({
                  title: '发车失败',
                  icon: 'none',
                  success: function () {
                    _this.setData({
                      collectList: []
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
    
  },

  // 点击完成按钮时触发
  bindScanCodeInput(e) {
    this.getCollect(e.detail.value);
  }
})