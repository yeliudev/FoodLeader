const { mysql } = require('../qcloud')

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id', 'username', 'avatarUrl').first()
    if (open_id_object) {
        // 数据库存在 skey ，验证通过
        try {
            var open_id = open_id_object.open_id,
                trackList = await mysql('track').where({ open_id: open_id }).select('trackId', 'trackInfo').orderBy('createTime', 'desc'),
                menu_object = await mysql('menu').where({ open_id: open_id, deleted: false }).select('menu_id', 'items'),
                menus = await mysql('menu').where({ open_id: open_id, deleted: false }).select('menu_id', 'name', 'imageUrl', 'count'),
                newTrackList = [],
                items = []

            for (var q in menu_object) {
                items = items.concat(JSON.parse(menu_object[q].items))
            }

            for (var m in trackList) {
                var temp = JSON.parse(trackList[m].trackInfo)
                temp.username = open_id_object.username
                temp.avatarUrl = open_id_object.avatarUrl
                for (var w in items) {
                    if (trackList[m].trackId === items[w]) {
                        temp.collect = true
                        break
                    }
                }
                trackList[m].trackInfo = JSON.stringify(temp)
            }

            for (var i in trackList) {
                if (JSON.parse(trackList[i].trackInfo).occupy >= 3) {
                    newTrackList.push(trackList[i])
                }
            }

            ctx.body = {
                success: true,
                data: newTrackList,
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
