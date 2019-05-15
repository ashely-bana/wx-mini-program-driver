
//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    deliveryData: [],
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  canvasOnClick: function (e) {
    if (app.globalData.register){
      console.log(e.changedTouches[0])
      if (e.changedTouches[0].x >= 190 && e.changedTouches[0].x <= 270 && e.changedTouches[0].y >= 90 && e.changedTouches[0].y <= 110) {
        console.log(e.changedTouches[0].x)
        wx.switchTab({
          url: '/pages/service/service'
        })
      }
      if (e.changedTouches[0].x >= 190 && e.changedTouches[0].x <= 270 && e.changedTouches[0].y >= 50 && e.changedTouches[0].y <= 70) {
        console.log(e.changedTouches[0].x)
        wx.navigateTo({
          url: '/pages/finish/finish'
        })
      }
    }else {
      wx.showToast({
        title: '请先注册!',
        icon: 'none'
      })
    }
    
  },
  onLoad: function () {
    let openid = app.globalData.openid;
    let _this = this;
    if(openid == ''){
      app.getOpenId().then(res=>{
        _this.getData();
        // 按钮获取信息
        if (app.globalData.userInfo) {
          _this.setData({
            userInfo: app.globalData.userInfo,
            hasUserInfo: true
          })
        } else if (_this.data.canIUse) {
          // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
          // 所以此处加入 callback 以防止这种情况
          app.userInfoReadyCallback = res => {
            _this.setData({
              userInfo: res.userInfo,
              hasUserInfo: true
            })
          }
        } else {
          // 在没有 open-type=getUserInfo 版本的兼容处理
          wx.getUserInfo({
            success: res => {
              app.globalData.userInfo = res.userInfo
              _this.setData({
                userInfo: res.userInfo,
                hasUserInfo: true
              })
            }
          })
        }
      })
    }else {
      _this.getData();
      // 按钮获取信息
      if (app.globalData.userInfo) {
        _this.setData({
          userInfo: app.globalData.userInfo,
          hasUserInfo: true
        })
      } else if (_this.data.canIUse) {
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        app.userInfoReadyCallback = res => {
          _this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      } else {
        // 在没有 open-type=getUserInfo 版本的兼容处理
        wx.getUserInfo({
          success: res => {
            app.globalData.userInfo = res.userInfo
            _this.setData({
              userInfo: res.userInfo,
              hasUserInfo: true
            })
          }
        })
      }
    }
  },
  onShow(){
    let openid = app.globalData.openid;
    let _this = this;
    if (!openid || !app.globalData.register) {
      app.getOpenId().then(res => {
        _this.getData();
      })
    } else {
      _this.getData();
    }
  },
  getData: function(){
    wx.request({
          url: app.globalData.host + '/oubDelivery/queryOubDeliveryCount',
          method: 'GET',
          data: {
            openId: app.globalData.openid
          },
          header: {
            'Accept': 'application/json'
          },
          success: function (res) {
            // 数据源
            var array = [];
            array.push(res.data.data.waitService);
            array.push(res.data.data.finishService);
            console.log(array)
            var context = wx.createContext();
            // 画饼图
            var colors = ["#FF7F50", "#4682B4"];
            var total = 0;
            context.font = "bold 16px Arial";
            context.fillText("当日配送", 10, 22);
            context.font = "16px Arial";
            context.fillText("已配送: " + array[1], 190, 70);
            context.fillText("待配送: ", 190, 110);
            context.fillStyle = "#FF7F50";
            context.fillText(array[0], 248, 110);
            // 计算总量
            for (var index = 0; index < array.length; index++) {
              total += array[index];
            }
            // 定义圆心坐标
            var point = { x: 75, y: 90 };
            // 定义半径大小
            var radius = 60;
            /* 循环遍历所有的pie */
            for (var i = 0; i < array.length; i++) {
              context.beginPath();
              // 起点弧度
              var start = 0;
              if (i > 0) {
                // 计算开始弧度是前几项的总和，即从之前的基础的上继续作画
                for (var j = 0; j < i; j++) {
                  start += array[j] / total * 2 * Math.PI;
                }
              }
              // 1.先做第一个pie
              // 2.画一条弧，并填充成三角饼pie，前2个参数确定圆心，第3参数为半径，第4参数起始旋转弧度数，第5参数本次扫过的弧度数，第6个参数为时针方向-false为顺时针
              context.arc(point.x, point.y, radius, start, start + array[i] / total * 2 * Math.PI, false);
              // 3.连线回圆心
              context.lineTo(point.x, point.y);
              // 4.填充样式
              context.setFillStyle(colors[i]);
              // 5.填充动作
              context.fill();
              context.closePath();
            }
            //调用wx.drawCanvas，通过canvasId指定在哪张画布上绘制，通过actions指定绘制行为
            wx.drawCanvas({
              //指定canvasId,canvas 组件的唯一标识符
              canvasId: 'canvas',
              actions: context.getActions()
            })
          }
        })
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  goToRegister: function() {
    if (!app.globalData.userInfo){
      wx.showToast({
        title: '请先获取头像昵称',
        icon: 'none'
      })
    }else{
      wx.navigateTo({
        url: '/pages/register/register'
      })
    }
  }
})
