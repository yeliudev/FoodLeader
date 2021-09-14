const { mysql } = require('../qcloud')

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id').first()
    if (open_id_object) {
        // 数据库存在 skey ，验证通过
        try {
            await mysql('cSessionInfo').update({ city: ctx.query.city }).where({ open_id: open_id_object.open_id })

            var trackList = await mysql('track').where({ city: ctx.query.city }).select('open_id', 'collect', 'trackInfo'),
                total = []

            for (var i in trackList) {
                var trackInfo = JSON.parse(trackList[i].trackInfo),
                    sum = (trackList[i].collect + trackInfo.occupy) * 10,
                    username_object = await mysql('cSessionInfo').where({ open_id: trackList[i].open_id }).select('username', 'avatarUrl').first()
                if (!total.length) {
                    total.push({
                        open_id: trackList[i].open_id,
                        name: username_object.username,
                        avatarUrl: username_object.avatarUrl,
                        coin: sum
                    })
                    continue
                }
                var flag = true
                for (var j in total) {
                    if (total[j].open_id === trackList[i].open_id) {
                        total[j].coin += sum
                        flag = false
                        break
                    }
                }
                if (flag) {
                    total.push({
                        open_id: trackList[i].open_id,
                        name: username_object.username,
                        avatarUrl: username_object.avatarUrl,
                        coin: sum
                    })
                }
            }

            var sortedTotal = total.sort(function (value1, value2) {
                if (parseInt(value1.coin) < parseInt(value2.coin)) {
                    return 1
                } else if (parseInt(value1.coin) > parseInt(value2.coin)) {
                    return -1
                } else {
                    return 0
                }
            })

            if (sortedTotal.length > 50) {
                var sortedTotal = sortedTotal.slice(0, 49)
            }

            ctx.body = {
                success: true,
                data: JSON.stringify(sortedTotal)
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