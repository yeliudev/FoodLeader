const { mysql } = require('../qcloud')
const shortid = require('shortid')
const moment = require('moment')

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id').first()
    if (open_id_object) {
        // 数据库存在 skey ，验证通过
        try {
            var open_id = open_id_object.open_id,
                track_object = await mysql('track').where({ trackId: ctx.query.trackId }).select('open_id', 'trackInfo').first()
            if (track_object) {
                var trackInfo = JSON.parse(track_object.trackInfo),
                    track_open_id = track_object.open_id,
                    createTime = moment(),
                    commentId = shortid.generate()

                if (!trackInfo.comments) {
                    trackInfo.comments = []
                }

                if (!ctx.query.openId) {
                    trackInfo.comments.push({
                        commentId: commentId,
                        openId: open_id,
                        text: ctx.query.text
                    })
                } else {
                    trackInfo.comments.push({
                        commentId: commentId,
                        openId: open_id,
                        to: ctx.query.openId,
                        text: ctx.query.text
                    })
                }

                await mysql('track').update({ trackInfo: JSON.stringify(trackInfo) }).where({ trackId: ctx.query.trackId })

                var message_object = await mysql('cSessionInfo').where({ open_id: track_open_id }).select('message').first(),
                    message = JSON.parse(message_object.message)

                message.push({
                    commentId: commentId,
                    trackId: ctx.query.trackId,
                    open_id: open_id,
                    love: false,
                    text: ctx.query.text,
                    time: createTime.format('X') + '000',
                    firstImage: trackInfo.photos.length ? trackInfo.photos[0] : '',
                    trackText: trackInfo.photos.length ? '' : trackInfo.text,
                    read: false,
                    deleted: false
                })

                await mysql('cSessionInfo').update({ message: JSON.stringify(message) }).where({ open_id: track_open_id })

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
