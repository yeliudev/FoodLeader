const { mysql } = require('../qcloud')

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id').first()
    if (open_id_object) {
        // 数据库存在 skey ，验证通过
        try {
            var open_id = open_id_object.open_id,
                track_object = await mysql('track').where({ trackId: ctx.query.trackId }).select('open_id').first(),
                track_open_id = track_object.open_id

            if (track_open_id === open_id) {
                await mysql('track').where({ trackId: ctx.query.trackId }).del()
                ctx.body = {
                    success: true
                }
            } else {
                ctx.body = {
                    success: false,
                    errMsg: '用户认证失败'
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
