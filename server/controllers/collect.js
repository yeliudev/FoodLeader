const { mysql } = require('../qcloud')

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id').first()
    if (open_id_object) {
        // 数据库存在 skey ，验证通过
        try {
            var open_id = open_id_object.open_id,
                track_object = await mysql('track').where({ trackId: ctx.query.track_id }).select('open_id', 'collect').first(),
                menu_object = await mysql('menu').where({ menu_id: ctx.query.menu_id }).select('open_id', 'items', 'count').first(),
                menu_open_id = menu_object.open_id,
                track_open_id = track_object.open_id,
                coin_object = await mysql('cSessionInfo').where({ open_id: track_open_id }).select('coin', 'week').first(),
                coin = coin_object.coin,
                week = coin_object.week,
                collect = track_object.collect

            if (menu_open_id === open_id) {
                var items = JSON.parse(menu_object.items),
                    count = menu_object.count
                for (var q in items) {
                    if (items[q] === ctx.query.track_id) {
                        ctx.body = {
                            success: false,
                            errMsg: '该足迹已在收藏夹中'
                        }
                        return
                    }
                }
                items.push(ctx.query.track_id)
                count++
                collect++
                coin = coin + 10
                week = week + 10
                if (open_id != track_open_id) {
                    await mysql('cSessionInfo').update({ coin: coin, week: week }).where({ open_id: track_open_id })
                    await mysql('track').update({ collect: collect }).where({ trackId: ctx.query.track_id })
                }
                await mysql('menu').update({ items: JSON.stringify(items), count: count }).where({ menu_id: ctx.query.menu_id })
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
