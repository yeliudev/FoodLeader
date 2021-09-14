const { mysql } = require('../qcloud')

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id', 'follow').first()
    if (open_id_object) {
        // 数据库存在 skey ，验证通过
        try {
            var open_id = open_id_object.open_id,
                follow = JSON.parse(open_id_object.follow),
                trackList = await mysql('track').where({ open_id: ctx.query.open_id }).select('trackId', 'trackInfo').orderBy('createTime', 'desc'),
                menu_object = await mysql('menu').where({ open_id: open_id, deleted: false }).select('items'),
                menus = await mysql('menu').where({ open_id: open_id, deleted: false }).select('menu_id', 'name', 'imageUrl', 'count'),
                items = []

            for (var q in menu_object) {
                items = items.concat(JSON.parse(menu_object[q].items))
            }

            for (var m in trackList) {
                var temp = JSON.parse(trackList[m].trackInfo),
                    username_object = await mysql('cSessionInfo').where({ open_id: ctx.query.open_id }).select('username', 'avatarUrl').first()
                temp.username = username_object.username
                temp.avatarUrl = username_object.avatarUrl
                temp.followed = false
                for (var i in follow) {
                    if (follow[i] === temp.open_id) {
                        temp.followed = true
                        break
                    }
                }
                for (var w in items) {
                    if (trackList[m].trackId === items[w]) {
                        temp.collect = true
                        break
                    }
                }
                trackList[m].trackInfo = JSON.stringify(temp)
            }

            ctx.body = {
                success: true,
                data: trackList,
                menus: menus
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
