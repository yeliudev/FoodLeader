const { mysql } = require('../qcloud')

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id').first()
    if (open_id_object) {
        // 数据库存在 skey ，验证通过
        try {
            var open_id = open_id_object.open_id,
                follow_object = await mysql('cSessionInfo').where({ open_id: open_id }).select('follow').first(),
                menu_object = await mysql('menu').where({ menu_id: ctx.query.menu_id }).select('open_id', 'items').first(),
                follow = JSON.parse(follow_object.follow),
                items = JSON.parse(menu_object.items),
                trackList = []

            for (var i in items) {
                var track = await mysql('track').where({ trackId: items[i] }).select('open_id', 'trackInfo').first()
                if (track) {
                    var trackInfo = JSON.parse(track.trackInfo)
                } else {
                    continue
                }
                var username_object = await mysql('cSessionInfo').where({ open_id: track.open_id }).select('username', 'avatarUrl').first()
                trackInfo.username = username_object.username
                trackInfo.avatarUrl = username_object.avatarUrl
                trackInfo.collect = true
                for (var j in follow) {
                    if (track.open_id === follow[j]) {
                        trackInfo.followed = true
                        break
                    }
                }
                track.trackInfo = JSON.stringify(trackInfo)
                trackList.push(track)
            }

            ctx.body = {
                success: true,
                data: trackList
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
