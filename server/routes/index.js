/**
 * ajax 服务路由集合
 */
const router = require('koa-router')({
    prefix: '/weapp'
})
const controllers = require('../controllers')

// 从 sdk 中取出中间件
// 这里展示如何使用 Koa 中间件完成登录态的颁发与验证
const { auth: { authorizationMiddleware, validationMiddleware } } = require('../qcloud')

// --- 登录与授权 Demo --- //
// 登录接口
router.get('/login', authorizationMiddleware, controllers.login)
// 用户信息接口（可以用来验证登录态）
router.get('/user', validationMiddleware, controllers.user)

// --- 图片上传 Demo --- //
// 图片上传接口，小程序端可以直接将 url 填入 wx.uploadFile 中
router.post('/upload', controllers.upload)

// --- 信道服务接口 Demo --- //
// GET  用来响应请求信道地址的
router.get('/tunnel', controllers.tunnel.get)
// POST 用来处理信道传递过来的消息
router.post('/tunnel', controllers.tunnel.post)

// --- 客服消息接口 Demo --- //
// GET  用来响应小程序后台配置时发送的验证请求
router.get('/message', controllers.message.get)
// POST 用来处理微信转发过来的客服消息
router.post('/message', controllers.message.post)

router.get('/publish', controllers.publish)

router.get('/getTrack', controllers.getTrack)

router.get('/getCoin', controllers.getCoin)

router.get('/follow', controllers.follow)

router.get('/occupy', controllers.occupy)

router.get('/getMyTrack', controllers.getMyTrack)

router.get('/delete', controllers.delete)

router.get('/getOccupiedTrack', controllers.getOccupiedTrack)

router.get('/getFollow', controllers.getFollow)

router.get('/unfollow', controllers.unfollow)

router.get('/newMenu', controllers.newMenu)

router.get('/getMenu', controllers.getMenu)

router.get('/setMenu', controllers.setMenu)

router.get('/getMenuList', controllers.getMenuList)

router.get('/deleteMenu', controllers.deleteMenu)

router.get('/getDeletedMenuList', controllers.getDeletedMenuList)

router.get('/get0ccupiedTrack', controllers.get0ccupiedTrack)

router.get('/recoverMenu', controllers.recoverMenu)

router.get('/collect', controllers.collect)

router.get('/uncollect', controllers.uncollect)

router.get('/getCollect', controllers.getCollect)

router.get('/newMenuCollect', controllers.newMenuCollect)

router.get('/allRank', controllers.allRank)

router.get('/friendRank', controllers.friendRank)

router.get('/groupRank', controllers.groupRank)

router.get('/comment', controllers.comment)

router.get('/deleteComment', controllers.deleteComment)

router.get('/getMessage', controllers.getMessage)

router.get('/getOneTrack', controllers.getOneTrack)

router.get('/getTrackList', controllers.getTrackList)

router.get('/ad', controllers.ad)

router.get('/sign', controllers.sign)

module.exports = router
