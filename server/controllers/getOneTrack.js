const { mysql } = require('../qcloud')

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id', 'follow').first()
    if (open_id_object) {
        // 数据库存在 skey ，验证通过
        try {
            var open_id = open_id_object.open_id,
                menu_object = await mysql('menu').where({ open_id: open_id, deleted: false }).select('menu_id', 'items'),
                trackInfo = await mysql('track').where({ trackId: ctx.query.trackId }).select('open_id', 'trackInfo').first(),
                menus = await mysql('menu').where({ open_id: open_id, deleted: false }).select('menu_id', 'name', 'imageUrl', 'count'),
                items = []

            if (trackInfo) {
                var username_object = await mysql('cSessionInfo').where({ open_id: trackInfo.open_id }).select('username', 'avatarUrl').first(),
                    track_open_id = trackInfo.open_id,
                    trackInfo = JSON.parse(trackInfo.trackInfo),
                    follow = JSON.parse(open_id_object.follow)
            } else {
                ctx.body = {
                    success: false,
                    errMsg: '足迹不存在'
                }
                return
            }

            trackInfo.username = username_object.username
            trackInfo.avatarUrl = username_object.avatarUrl
            trackInfo.followed = false

            for (var j in trackInfo.comments) {
                if (!trackInfo.comments[j].to) {
                    var track_username_object = await mysql('cSessionInfo').where({ open_id: trackInfo.comments[j].openId }).select('username').first()
                    trackInfo.comments[j].one = track_username_object.username
                } else {
                    var track_username_object = await mysql('cSessionInfo').where({ open_id: trackInfo.comments[j].openId }).select('username').first(),
                        to_username_object = await mysql('cSessionInfo').where({ open_id: trackInfo.comments[j].to }).select('username').first()
                    trackInfo.comments[j].from = track_username_object.username
                    trackInfo.comments[j].to = to_username_object.username
                }
            }

            for (var i in follow) {
                if (follow[i] === track_open_id) {
                    trackInfo.followed = true
                    break
                }
            }

            for (var q in menu_object) {
                items = items.concat(JSON.parse(menu_object[q].items))
            }

            for (var w in items) {
                if (trackInfo.trackId === items[w]) {
                    trackInfo.collect = true
                    break
                }
            }

            ctx.body = {
                success: true,
                data: JSON.stringify(trackInfo),
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
