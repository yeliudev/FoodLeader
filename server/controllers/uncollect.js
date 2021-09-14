const { mysql } = require('../qcloud')

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id').first()
    if (open_id_object) {
        // 数据库存在 skey ，验证通过
        try {
            var open_id = open_id_object.open_id,
                menus = await mysql('menu').where({ open_id: open_id, deleted: false }).select('menu_id', 'items'),
                track_object = await mysql('track').where({ trackId: ctx.query.track_id }).select('collect', 'open_id').first(),
                collect = track_object.collect,
                coin_object = await mysql('cSessionInfo').where({ open_id: track_object.open_id }).select('coin', 'week').first(),
                coin = coin_object.coin,
                week = coin_object.week

            for (var q in menus) {
                var items = JSON.parse(menus[q].items)
                for (var w in items) {
                    if (items[w] === ctx.query.track_id) {
                        var menu_id = menus[q].menu_id,
                            menu_object = await mysql('menu').where({ menu_id: menu_id }).select('open_id', 'items', 'count').first(),
                            menu_open_id = menu_object.open_id
                        break
                    }
                }
            }

            if (menu_open_id === open_id) {
                var items = JSON.parse(menu_object.items),
                    count = menu_object.count
                for (var i in items) {
                    if (items[i] === ctx.query.track_id) {
                        items.splice(i, 1)
                        break
                    }
                }
                count--
                collect--
                coin = coin - 10
                week = week - 10
                if (open_id != track_object.open_id) {
                    await mysql('cSessionInfo').update({ coin: coin, week: week }).where({ open_id: track_object.open_id })
                    await mysql('track').update({ collect: collect }).where({ trackId: ctx.query.track_id })
                }
                await mysql('menu').update({ items: JSON.stringify(items), count: count }).where({ menu_id: menu_id })
            } else {
                ctx.body = {
                    success: false,
                    errMsg: '用户认证失败'
                }
                return
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
