const { mysql } = require('../qcloud')

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id').first()
    if (open_id_object) {
        // 数据库存在 skey ，验证通过
        try {
            var info = await mysql('menu').where({ menu_id: ctx.query.menu_id }).select('name', 'imageUrl').first()
            if (info) {
                ctx.body = {
                    success: true,
                    data: info
                }
            } else {
                ctx.body = {
                    success: false,
                    data: '菜单不存在'
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
