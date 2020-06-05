
const md5 = require('../../utils/md5.js');
var rm = wx.getRecorderManager();
Page({
    data: {
        test: [],    //测试语音识别歌曲
        Buffer: {}
    },
    onLoad: function (options) {
        var that = this;
        wx.authorize({
            scope: "scope.record",
            success: function () {
                console.log("录音授权成功");
            },
            fail: function () {
                console.log("录音授权失败");
            }
        })
        //每帧的回调，取第一帧识别
        rm.onFrameRecorded(function (res) {
            console.log(res.isLastFrame)
            rm.stop()
            if (res.isLastFrame==false) {
                wx.showLoading({
                    title: "正在识别..."
                });
                var josn = {
                    'engine_type': 'wav',
                    'aue': 'raw',
                    'sample_rate': '8000',
                    // 'audio_url': 'http://singer.cavca.net/Recorder/1591325205827b5.wav?e=1622861224&token=Yz9fhsB0_i23AFVuox36KZhtHtbCdwePT7JFlVAN:CymdlGmc-sMvYLWwJcuba16LEeg='
                }
                var str = JSON.stringify(josn);
                // 转base64
                function base64_encode(str) {
                    var c1, c2, c3;
                    var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                    var i = 0, len = str.length, string = '';

                    while (i < len) {
                        c1 = str.charCodeAt(i++) & 0xff;
                        if (i == len) {
                            string += base64EncodeChars.charAt(c1 >> 2);
                            string += base64EncodeChars.charAt((c1 & 0x3) << 4);
                            string += "==";
                            break;
                        }
                        c2 = str.charCodeAt(i++);
                        if (i == len) {
                            string += base64EncodeChars.charAt(c1 >> 2);
                            string += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                            string += base64EncodeChars.charAt((c2 & 0xF) << 2);
                            string += "=";
                            break;
                        }
                        c3 = str.charCodeAt(i++);
                        string += base64EncodeChars.charAt(c1 >> 2);
                        string += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                        string += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
                        string += base64EncodeChars.charAt(c3 & 0x3F)
                    }
                    return string
                }
                var base = base64_encode(str)
                var timestamps = parseInt(new Date().getTime() / 1000);
                var signatures = md5.hexMD5('6ba1da64d4f9617fe8e0df56df8c0a28' + timestamps + base);
                console.log(res.frameBuffer)
                wx.request({
                    url: 'https://webqbh.xfyun.cn/v1/service/v1/qbh',
                    method: 'POST',
                    data: res.frameBuffer,
                    header: {
                        'X-Appid': '5ed7179b',
                        'X-CurTime': timestamps.toString(),
                        'X-Param': base,
                        'X-CheckSum': signatures,
                        'content-type': 'application/x-www-form-urlencoded;charset=utf-8' // 默认值
                    },
                    success(res) {
                        console.log('turn success')
                        console.log(res)
                        console.log(res.data)
                        that.setData({
                            test: res.data.data,
                            // Buffer: {}
                        })
                        wx.hideLoading();
                    },
                    fail: function (res) {
                        console.log('turn fail')
                        console.log(res)
                        wx.showToast({
                            title: '错误' + res.toString(),
                            icon: "none",
                            duration: 5000
                        });
                    }
                })
            }

        })

    },

    /**
   * 录音开始
   */
    recordStart: function (e) {
        console.log('长按录音开始')
        rm.start({
            duration: 60000,
            sampleRate: 8000,
            numberOfChannels: 1,
            encodeBitRate: 48000,
            format: "wav",
            frameSize: 160
        })
    },
})