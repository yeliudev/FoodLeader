const { mysql } = require('../qcloud')

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id', 'follow').first()
    if (open_id_object) {
        // 数据库存在 skey ，验证通过
        try {
            var follow_str = open_id_object.follow,
                follow = JSON.parse(follow_str),
                followList = []

            for (var i in follow) {
                var userinfo = await mysql('cSessionInfo').where({ open_id: follow[i] }).select('user_info').first(),
                    userinfo = JSON.parse(userinfo.user_info)
                followList.push({
                    avatarUrl: userinfo.avatarUrl,
                    username: userinfo.nickName,
                    open_id: follow[i]
                })
            }

            ctx.body = {
                success: true,
                data: followList
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
