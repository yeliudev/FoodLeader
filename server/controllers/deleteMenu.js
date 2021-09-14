const { mysql } = require('../qcloud')

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id').first()
    if (open_id_object) {
        // 数据库存在 skey ，验证通过
        try {
            var open_id = open_id_object.open_id,
                list = JSON.parse(ctx.query.list)

            for (var i in list) {
                var menu_object = await mysql('menu').where({ menu_id: list[i] }).select('open_id').first(),
                    menu_open_id = menu_object.open_id

                if (menu_open_id === open_id) {
                    await mysql('menu').update({ deleted: true }).where({ menu_id: list[i] })
                } else {
                    ctx.body = {
                        success: false,
                        errMsg: '用户认证失败'
                    }
                    return
                }
            }

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
