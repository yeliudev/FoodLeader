const { mysql } = require('../qcloud')

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id').first()
    if (open_id_object) {
        // 数据库存在 skey ，验证通过
        try {
            var open_id = open_id_object.open_id,
                menuList = await mysql('menu').where({ open_id: open_id, deleted: false }).select('menu_id', 'name', 'imageUrl', 'items', 'count', 'deleted').orderBy('createTime', 'asc')

            for (var i in menuList) {
                var items = JSON.parse(menuList[i].items),
                    newItems = []
                for (var j in items) {
                    var track = await mysql('track').where({ trackId: items[j] }).select('open_id').first()
                    if (track) {
                        newItems.push(items[j])
                    }
                }
                menuList[i].items = JSON.stringify(newItems)
                menuList[i].count = newItems.length
            }

            ctx.body = {
                success: true,
                data: menuList
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
