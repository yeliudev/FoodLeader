const { mysql } = require('../qcloud')
const http = require('axios')
const shortid = require('shortid')
const moment = require('moment')

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id').first()
    if (open_id_object) {
        // 数据库存在 skey ，验证通过
        try {
            var open_id = open_id_object.open_id,
                trackId = shortid.generate(),
                createTime = moment(),
                trackInfo = JSON.parse(ctx.query.trackInfo),
                global_res = {},
                newTrack = {}

            await http({
                url: 'https://api.weixin.qq.com/cgi-bin/token',
                method: 'GET',
                params: {
                    grant_type: 'client_credential',
                    appid: 'wxc8d4e62cd276d157',
                    secret: '7441931fe6972729f2699ddd74705a23'
                }
            }).then(res => {
                global_res = res
            })

            if (!global_res.data.errcode) {
                await http({
                    url: 'https://api.weixin.qq.com/wxa/msg_sec_check',
                    method: 'POST',
                    params: {
                        access_token: global_res.data.access_token
                    },
                    data: {
                        content: trackInfo.text
                    }
                }).then(res => {
                    if (!res.data.errcode) {
                        trackInfo.open_id = open_id
                        trackInfo.trackId = trackId
                        trackInfo.occupy = 0
                        trackInfo.createTime = createTime.format('X') + '000'

                        newTrack = {
                            trackId: trackId,
                            open_id: open_id,
                            createTime: createTime.format('YYYY-MM-DD HH:mm:ss'),
                            city: ctx.query.city,
                            collect: 0,
                            trackInfo: JSON.stringify(trackInfo)
                        }
                    } else {
                        ctx.body = {
                            success: false,
                            errMsg: '内容审核不通过'
                        }
                        return
                    }
                })
            } else {
                ctx.body = {
                    success: false,
                    errMsg: '验证失败'
                }
                return
            }

            await mysql('track').insert(newTrack)

            ctx.body = {
                success: true
            }
        } catch (error) {
            ctx.body = {
                success: false,
                errMsg: error
            }
        }
    } else {
        // 查询结果为 undefined ，验证不通过
        ctx.body = {
            success: false,
            code: '500',
            errMsg: 'skey不存在，验证不通过'
        }
    }
}
