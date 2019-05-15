//app.js
const Promise = require('/utils/promise.js')
App({
  onLaunch: function () {
    this.getOpenId();
  },
  getOpenId: function () {
    var app = this;
    return new Promise(function(resolve, reject){
      // 登录
      wx.login({
        success: res => {
          if(res.code){
            console.log(res)
            // 获取用户信息
            wx.getSetting({
              success: settingres => {
                console.log(settingres);
                if (settingres.authSetting['scope.userInfo']) {
                  // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                  wx.getUserInfo({
                    success: userInfo => {
                      console.log(userInfo)
                      app.globalData.userInfo = userInfo.userInfo
                      const param = JSON.parse(userInfo.rawData);
                      param.jsCode = res.code;
                      wx.request({
                        url: app.globalData.host + '/driver/login',
                        data: { ...param },
                        header: {
                          'content-type': 'application/json' // 默认值
                        },
                        success(res) {
                          console.log(res)
                          // wx.setStorageSync('openid', res.data.data.openid);
                          app.globalData.openid = res.data.data.openid;
                          if (res.data.data.warehouseCode) {
                            app.globalData.register = true;
                          }
                          resolve(res);
                        }
                      })
                    }
                  })
                } else {
                  console.log('获取用户授权态失败！' + res.errMsg);
                  reject('error');
                }
              }
            })
          } else {
            console.log('获取用户登录态失败！' + res.errMsg);
            reject('error');
          }
        }
      })
    })
  },
  globalData: {
    host: 'https://wms.chujiayoupin.com/wms-api/minipro',//'http://111.230.146.203:8080/wms_api/minipro','http://172.16.0.80:8080/wms_api/minipro','http://122.152.227.186:8080/wms_api/minipro', 'https://tms.chujiayoupin.com/api/minipro'
    userInfo: null,
    openid: '',
    register: false
  }
})