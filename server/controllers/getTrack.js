const { mysql } = require('../qcloud')

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id').first()
    if (open_id_object) {
        try {
            var open_id = open_id_object.open_id,
                follow_object = await mysql('cSessionInfo').where({ open_id: open_id }).select('follow').first(),
                menu_object = await mysql('menu').where({ open_id: open_id, deleted: false }).select('menu_id', 'items'),
                menus = await mysql('menu').where({ open_id: open_id, deleted: false }).select('menu_id', 'name', 'imageUrl', 'count'),
                follow = JSON.parse(follow_object.follow),
                items = []

            if (ctx.query.city != '未定位') {
                var trackList = await mysql('track').where({ city: ctx.query.city }).select('trackId', 'open_id', 'trackInfo').orderBy('createTime', 'desc'),
                    trackList = trackList.concat(await mysql('track').where({ city: '' }).select('trackId', 'open_id', 'trackInfo').orderBy('createTime', 'desc'))
            } else {
                var trackList = await mysql('track').select('trackId', 'open_id', 'trackInfo').orderBy('createTime', 'desc')
            }
            // var trackList = await mysql('track').select('trackId', 'open_id', 'trackInfo').orderBy('createTime', 'desc')

            if (trackList.length > 50) {
                trackList = trackList.slice(0, 50)
            }

            for (var q in menu_object) {
                items = items.concat(JSON.parse(menu_object[q].items))
            }

            for (var k in follow) {
                var trackList = trackList.concat(await mysql('track').where({ open_id: follow[k], city: ctx.query.city }).select('trackId', 'open_id', 'trackInfo'))
                var trackList = trackList.concat(await mysql('track').where({ open_id: follow[k], city: '' }).select('trackId', 'open_id', 'trackInfo'))
            }

            for (var i = 0; i < trackList.length; i++) {
                for (var j = i + 1; j < trackList.length; j++) {
                    if (JSON.stringify(trackList[i]) === JSON.stringify(trackList[j])) {
                        trackList.splice(i, 1)
                        i--
                    }
                }
            }

            for (var m in trackList) {
                var temp = JSON.parse(trackList[m].trackInfo),
                    username_object = await mysql('cSessionInfo').where({ open_id: trackList[m].open_id }).select('username', 'avatarUrl').first()
                temp.username = username_object.username
                temp.avatarUrl = username_object.avatarUrl
                for (var w in items) {
                    if (trackList[m].trackId === items[w]) {
                        temp.collect = true
                        break
                    }
                }
                for (var n in follow) {
                    if (trackList[m].open_id === follow[n]) {
                        temp.followed = true
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
        try {
            if (ctx.query.city != '未定位') {
                var trackList = await mysql('track').where({ city: ctx.query.city }).select('open_id', 'trackInfo').orderBy('createTime', 'desc'),
                    trackList = trackList.concat(await mysql('track').where({ city: '' }).select('open_id', 'trackInfo').orderBy('createTime', 'desc'))
            } else {
                var trackList = await mysql('track').select('open_id', 'trackInfo').orderBy('createTime', 'desc')
            }
            // var trackList = await mysql('track').select('open_id', 'trackInfo').orderBy('createTime', 'desc')

            for (var m in trackList) {
                var temp = JSON.parse(trackList[m].trackInfo),
                    username_object = await mysql('cSessionInfo').where({ open_id: trackList[m].open_id }).select('username', 'avatarUrl').first()
                temp.username = username_object.username
                temp.avatarUrl = username_object.avatarUrl
                temp.followed = false
                trackList[m].trackInfo = JSON.stringify(temp)
            }

            if (trackList.length > 50) {
                trackList = trackList.slice(0, 50)
            }

            ctx.body = {
                success: true,
                data: trackList,
                menus: []
            }
        } catch (error) {
            ctx.body = {
                success: false,
                errMsg: error
            }
        }
    }
}
