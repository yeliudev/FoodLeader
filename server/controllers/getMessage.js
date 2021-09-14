const { mysql } = require('../qcloud')

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id', 'message').first()
    if (open_id_object) {
        // 数据库存在 skey ，验证通过
        try {
            var open_id = open_id_object.open_id,
                message = JSON.parse(open_id_object.message),
                exist_message = []

            for (var i in message) {
                var track_object = await mysql('track').where({ trackId: message[i].trackId }).select('open_id').first()
                if (track_object) {
                    exist_message.push(message[i])
                }
            }

            for (var j in exist_message) {
                var user_object = await mysql('cSessionInfo').where({ open_id: exist_message[j].open_id }).select('username', 'avatarUrl').first()
                exist_message[j].username = user_object.username
                exist_message[j].avatarUrl = user_object.avatarUrl
            }

            ctx.body = {
                success: true,
                data: JSON.stringify(exist_message)
            }

            for (var i in exist_message) {
                if (!exist_message[i].read) {
                    exist_message[i].read = true
                }
            }

            await mysql('cSessionInfo').update({ message: JSON.stringify(exist_message) }).where({ open_id: open_id })
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
