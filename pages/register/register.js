// pages/register/register.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: '',
    mobile: '',
    motorCodeValue: '',
    motorcycle: [],
    motorcyclevalue: 0,
    plate: '',
    warehouseCode: '',
    warehouse: [],
    warehousevalue: 0,
    validate: true,
    hasChange: false
  },

  submit(){
    const that = this;
    let openid = app.globalData.openid;
    if (openid == '') {
      app.getOpenId().then(res => {
        that.submitData();
      })
    }else{
      that.submitData();
    }
  },
  submitData() {
    const that = this;
    if(this.data.validate && this.data.username != '' && this.data.plate != '' && this.data.hasChange) {
        wx.request({
          url: app.globalData.host + '/driver/updateBasDriver',
          method: 'post',
          data: {
            mainDriverName: that.data.username,
            contact: that.data.mobile,
            carType: that.data.motorCodeValue,
            licenseNumber: that.data.plate,
            warehouseCode: that.data.warehouseCode,
            openid: app.globalData.openid
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success(res) {
            if (res.data.success) {
              app.globalData.register = true;
              wx.showToast({
                title: '成功',
                icon: 'success',
                duration: 2000,
                success: function () {
                  wx.navigateBack({
                    delta: 10
                  })
                }
              })
            } else {
              wx.showToast({
                title: res.data.message,
                icon: 'none'
              })
            }
          }
        })
      } else if (!this.data.username || !this.data.mobile || !this.data.plate) {
        wx.showToast({
          title: '姓名、手机号、车牌号必填！',
          icon: 'none'
        })
      } else if (!this.data.hasChange) {
        wx.showToast({
          title: '未更改！',
          icon: 'none'
        })
      }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    let p1 = new Promise(function (resolve, reject) {
      //调仓库接口
      wx.request({
        url: app.globalData.host + '/warehouse/queryWarehouseList',
        method: 'get',
        data: {},
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          if (res.data.success) {
            that.setData({
              warehouse: res.data.data,
              warehouseCode: res.data.data[0].warehouseCode
            })
            resolve(res)
          } else {
            console.log('获取仓库失败！' + res.data.message);
            reject('error');
          }
        }
      })
    })
    let p2 = new Promise(function (resolve, reject) {
      //调车型接口
      wx.request({
        url: app.globalData.host + '/driver/queryCarTypeList',
        method: 'get',
        data: {},
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          if (res.data.success) {
            that.setData({
              motorcycle: res.data.data,
              motorCodeValue: res.data.data[0].codeValue
            })
            resolve(res)
          } else {
            console.log('获取车型失败！' + res.data.message);
            reject('error');
          }
        }
      })
    })
      //调仓库接口
    Promise.all([p1,p2]).then(arrRes=>{
      console.log(app.globalData.register)
      if (app.globalData.register) {
        //获取司机信息
        wx.request({
          url: app.globalData.host + '/driver/queryDriverByOpenId',
          method: 'get',
          data: {
            openId: app.globalData.openid
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success(res) {
            let warehousevalue, motorcyclevalue;
            arrRes[0].data.data.map((item,index)=>{
              if (item.warehouseCode == res.data.data.warehouseCode){
                warehousevalue = index;
              }
            })
            arrRes[1].data.data.map((item, index) => {
              if (item.codeValue == res.data.data.carType) {
                motorcyclevalue = index;
              }
            })
            if (res.data.success) {
              that.setData({
                username: res.data.data.mainDriverName,
                mobile: res.data.data.contact,
                motorCodeValue: res.data.data.carType,
                plate: res.data.data.licenseNumber,
                warehouseCode: res.data.data.warehouseCode,
                warehousevalue: warehousevalue,
                motorcyclevalue: motorcyclevalue
              })
            }
          }
        })
      }
    })
    
  },
  bindMotorcycleInput: function (e) {
    const motorcycle = this.data.motorcycle;
    this.setData({
      motorcyclevalue: e.detail.value,
      motorCodeValue: motorcycle[e.detail.value].codeValue,
      hasChange: true
    })
  },
  bindPickerChange: function (e) {
    const warehouse = this.data.warehouse;
    this.setData({
      warehousevalue: e.detail.value,
      warehouseCode: warehouse[e.detail.value].warehouseCode,
      hasChange: true
    })
  },
  bindUserNameInput: function (e) {
    this.setData({
      username: e.detail.value,
      hasChange: true
    })
  },
  bindMobileInput: function (e) {
    if (/^1[34578]\d{9}$/.test(e.detail.value)){
      this.setData({
        mobile: e.detail.value,
        validate: true,
        hasChange: true
      })
    }else {
      wx.showToast({
        title: '电话号码错误!',
        icon: 'none'
      })
      this.setData({
        validate: false
      })
    }
  },
  bindPlateInput: function (e) {
    this.setData({
      plate: e.detail.value,
      hasChange: true
    })
  }
})