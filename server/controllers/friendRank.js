const { mysql } = require('../qcloud')

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id').first()
    if (open_id_object) {
        // 数据库存在 skey ，验证通过
        try {
            var total = [],
                coin_object = await mysql('cSessionInfo').select('open_id', 'occupy', 'user_info')

            for (var i in coin_object) {
                var user_info = JSON.parse(coin_object[i].user_info)
                total.push({
                    open_id: coin_object[i].open_id,
                    name: user_info.nickName,
                    avatarUrl: user_info.avatarUrl,
                    coin: coin_object[i].occupy
                })
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
