const { mysql } = require('../qcloud')

module.exports = async ctx => {
    try {
        var ad = await mysql('ad').where({ city: ctx.query.city }).select('imageUrl', 'url')

        ctx.body = {
            success: true,
            data: JSON.stringify(ad)
        }
    } catch (error) {
        ctx.body = {
            success: false,
            errMsg: error
        }
    }
}
