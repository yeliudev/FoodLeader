const { mysql } = require('../qcloud')
const crypto = require('crypto')

var getSignature = function () {
    var appid = '1257395954'
    var bucket = 'meishidaheng'
    var secretID = 'AKID8CyThetmxvd5HDkKXWFjwta1C7nCJErK'
    var secretKey = 'vfBTYP2SedP4PXQ7aqqZ4IM4WlhNr41i'
    var currentTime = parseInt(Date.now() / 1000)
    var expiredTime = currentTime + 600
    var rand = parseInt(Math.random() * Math.pow(2, 32))
    var fileid = encodeURIComponent('/' + appid + '/' + bucket + '/')

    var plainText = 'a=' + appid + '&k=' + secretID + '&e=' + expiredTime + '&t=' + currentTime + '&r=' + rand + '&f=' + fileid + '&b=' + bucket
    var data = new Buffer(plainText, 'utf8')
    var resStr = crypto.createHmac('sha1', secretKey).update(data).digest()
    var bin = Buffer.concat([resStr, data])
    var sign = bin.toString('base64')

    return sign
}

module.exports = async ctx => {
    var open_id_object = await mysql('cSessionInfo').where({ skey: ctx.header.skey }).select('open_id').first()
    if (open_id_object) {
        // 数据库存在 skey ，验证通过
        try {
            var open_id = open_id_object.open_id,
                signature = getSignature()

            ctx.body = {
                success: true,
                data: {
                    open_id: open_id,
                    signature: signature
                }
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
            errMsg: 'skey不存在，验证不通过'
        }
    }
}
