const { mysql } = require('../qcloud')

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id').first()
    if (open_id_object) {
        // 数据库存在 skey ，验证通过
        try {
            var open_id = open_id_object.open_id,
                follow_object = await mysql('cSessionInfo').where({ open_id: open_id }).select('follow').first(),
                track_open_id_object = await mysql('track').where({ trackId: ctx.query.trackId }).select('open_id').first(),
                follow = JSON.parse(follow_object.follow),
                track_open_id = track_open_id_object.open_id

            for (var i in follow) {
                if (follow[i] === track_open_id) {
                    ctx.body = {
                        success: false,
                        code: '400'
                    }
                    return
                }
            }

            follow.push(track_open_id)
            await mysql('cSessionInfo').update({ follow: JSON.stringify(follow) }).where({ open_id: open_id })

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
