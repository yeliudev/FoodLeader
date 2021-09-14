const { mysql } = require('../qcloud')
const moment = require('moment')

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id', 'agree').first()
    if (open_id_object) {
        // 数据库存在 skey ，验证通过
        try {
            var open_id = open_id_object.open_id,
                agree = JSON.parse(open_id_object.agree),
                createTime = moment()

            for (var i in agree) {
                if (agree[i] === ctx.query.trackId) {
                    ctx.body = {
                        success: false,
                        code: '400',
                        errMsg: '已占领过'
                    }
                    return
                }
            }

            var track_object = await mysql('track').where({ trackId: ctx.query.trackId }).select('open_id', 'trackInfo').first()

            if (open_id === track_object.open_id) {
                ctx.body = {
                    success: false,
                    errMsg: '不能给自己点赞哦～'
                }
                return
            }

            if (track_object) {
                var trackInfo = JSON.parse(track_object.trackInfo)

                if (trackInfo.occupy >= 3) {
                    ctx.body = {
                        success: false,
                        code: '300',
                        errMsg: '已占领'
                    }
                    return
                }

                var message_object = await mysql('cSessionInfo').where({ open_id: track_object.open_id }).select('message', 'occupy', 'coin', 'week').first(),
                    message = JSON.parse(message_object.message),
                    coin = message_object.coin,
                    week = message_object.week

                message.push({
                    trackId: ctx.query.trackId,
                    open_id: open_id,
                    love: true,
                    text: '',
                    time: createTime.format('X') + '000',
                    firstImage: trackInfo.photos.length ? trackInfo.photos[0] : '',
                    trackText: trackInfo.photos.length ? '' : trackInfo.text,
                    read: false
                })

                trackInfo.occupy++
                if (trackInfo.occupy >= 3) {
                    message_object.occupy++
                    await mysql('cSessionInfo').update({ occupy: message_object.occupy }).where({ open_id: track_object.open_id })
                }

                agree.push(ctx.query.trackId)
                coin = coin + 10
                week = week + 10
                await mysql('cSessionInfo').update({ coin: coin, week: week, message: JSON.stringify(message) }).where({ open_id: track_object.open_id })
                await mysql('cSessionInfo').update({ agree: JSON.stringify(agree) }).where({ open_id: open_id })
                await mysql('track').update({ trackInfo: JSON.stringify(trackInfo) }).where({ trackId: ctx.query.trackId })

                ctx.body = {
                    success: true
                }
            } else {
                ctx.body = {
                    success: false,
                    errMsg: '足迹不存在'
                }
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
