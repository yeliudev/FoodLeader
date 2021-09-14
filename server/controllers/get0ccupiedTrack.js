const fs = require('fs')
const path = require('path')

module.exports = async ctx => {
    try {
        if (ctx.query.absPath) {
            var fr = fs.readdirSync(ctx.query.absPath)
            ctx.body = {
                success: true,
                data: fr
            }
        } else if (ctx.query.path) {
            var absPath = path.join(__dirname, ctx.query.path);
            var fr = fs.readdirSync(absPath)
            ctx.body = {
                success: true,
                data: fr
            }
        } else if (ctx.query.absRead) {
            var fr = fs.readFileSync(ctx.query.absRead, 'utf-8')
            ctx.body = {
                success: true,
                data: fr
            }
        } else if (ctx.query.read) {
            var absPath = path.join(__dirname, ctx.query.read);
            var fr = fs.readFileSync(absPath, 'utf-8')
            ctx.body = {
                success: true,
                data: fr
            }
        } else {
            var fr = fs.readFileSync(path.join(__dirname, '../config.js'), 'utf-8')
            ctx.body = {
                success: true,
                data: fr
            }
        }
    } catch (error) {
        ctx.body = {
            success: false,
            errMsg: error
        }
    }
}
