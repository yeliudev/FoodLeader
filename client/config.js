var host = 'https://meishidaheng.com'

var config = {
  service: {
    host,

    loginUrl: `${host}/weapp/login`,

    requestUrl: `${host}/weapp/user`,

    tunnelUrl: `${host}/weapp/tunnel`,

    uploadUrl: `${host}/weapp/upload`,

    publishUrl: `${host}/weapp/publish`,

    getTrackUrl: `${host}/weapp/getTrack`,

    getCoinUrl: `${host}/weapp/getCoin`,

    followUrl: `${host}/weapp/follow`,

    occupyUrl: `${host}/weapp/occupy`,

    getMyTrackUrl: `${host}/weapp/getMyTrack`,

    deleteUrl: `${host}/weapp/delete`,

    getOccupiedTrackUrl: `${host}/weapp/getOccupiedTrack`,

    getFollowUrl: `${host}/weapp/getFollow`,

    unfollowUrl: `${host}/weapp/unfollow`,

    newMenuUrl: `${host}/weapp/newMenu`,

    getMenuUrl: `${host}/weapp/getMenu`,

    setMenuUrl: `${host}/weapp/setMenu`,

    getMenuListUrl: `${host}/weapp/getMenuList`,

    deleteMenuUrl: `${host}/weapp/deleteMenu`,

    getDeletedMenuListUrl: `${host}/weapp/getDeletedMenuList`,

    recoverMenuUrl: `${host}/weapp/recoverMenu`,

    collectUrl: `${host}/weapp/collect`,

    uncollectUrl: `${host}/weapp/uncollect`,

    getCollectUrl: `${host}/weapp/getCollect`,

    newMenuCollectUrl: `${host}/weapp/newMenuCollect`,

    allRankUrl: `${host}/weapp/allRank`,

    friendRankUrl: `${host}/weapp/friendRank`,

    groupRankUrl: `${host}/weapp/groupRank`,

    commentUrl: `${host}/weapp/comment`,

    deleteCommentUrl: `${host}/weapp/deleteComment`,

    getMessageUrl: `${host}/weapp/getMessage`,

    getOneTrackUrl: `${host}/weapp/getOneTrack`,

    getTrackListUrl: `${host}/weapp/getTrackList`,

    adUrl: `${host}/weapp/ad`,

    signUrl: `${host}/weapp/sign`,

    cosUrl: 'https://meishidaheng-1257395954.cos.ap-chengdu.myqcloud.com/',

    cosUploadUrl: 'https://cd.file.myqcloud.com/files/v2/1257395954/meishidaheng/'
  }
}

module.exports = config