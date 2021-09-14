const { mysql } = require('../qcloud')

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id', 'user_info').first()
    if (open_id_object) {
        // 数据库存在 skey ，验证通过
        try {
            var open_id = open_id_object.open_id,
                track_object = await mysql('track').where({ trackId: ctx.query.trackId }).select('open_id', 'trackInfo').first(),
                trackInfo = JSON.parse(track_object.trackInfo)

            for (var i in trackInfo.comments) {
                if (trackInfo.comments[i].commentId === ctx.query.commentId) {
                    if (open_id === trackInfo.comments[i].openId) {
                        trackInfo.comments.splice(i, 1)
                    } else {
                        ctx.body = {
                            success: false,
                            errMsg: '不能删除别人的评论哟~'
                        }
                        return
                    }
                    break
                }
            }

            var message_object = await mysql('cSessionInfo').where({ open_id: track_object.open_id }).select('message').first(),
                message = JSON.parse(message_object.message)

            for (var j in message) {
                if (message[j].commentId === ctx.query.commentId) {
                    message[j].deleted = true
                    break
                }
            }

            await mysql('cSessionInfo').update({ message: JSON.stringify(message) }).where({ open_id: track_object.open_id })
            await mysql('track').update({ trackInfo: JSON.stringify(trackInfo) }).where({ trackId: ctx.query.trackId })

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
