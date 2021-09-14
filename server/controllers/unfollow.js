const { mysql } = require('../qcloud')

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id', 'follow').first()
    if (open_id_object) {
        // 数据库存在 skey ，验证通过
        try {
            var open_id = open_id_object.open_id,
                follow_str = open_id_object.follow,
                follow = JSON.parse(follow_str)

            if (open_id === ctx.query.open_id) {
                ctx.body = {
                    success: false,
                    code: '400',
                    errMsg: '无法取消关注自己'
                }
                return
            }

            for (var i in follow) {
                if (follow[i] === ctx.query.open_id) {
                    follow.splice(i, 1)
                }
            }

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
