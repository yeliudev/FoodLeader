const { mysql } = require('../qcloud')
const shortid = require('shortid')
const moment = require('moment')

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id', 'user_info').first()
    if (open_id_object) {
        // 数据库存在 skey ，验证通过
        try {
            var open_id = open_id_object.open_id,
                user_info = JSON.parse(open_id_object.user_info),
                info = {
                    menu_id: shortid.generate(),
                    open_id: open_id,
                    name: ctx.query.name,
                    imageUrl: user_info.avatarUrl,
                    items: '[]',
                    count: 0,
                    deleted: false,
                    createTime: moment().format('YYYY-MM-DD HH:mm:ss')
                }

            await mysql('menu').insert(info)

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
