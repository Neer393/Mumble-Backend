const agoraAccessToken = require('agora-access-token');

exports.generatetoken = (req,res)=>{
    const channelname = req.query.channelname;
    if(!channelname){
        return res.status(400).json({
            status:'fail',
            error:'Channel name is required'
        });
    }
    let uid = req.query.uid;
    if(!uid || uid==''){
        uid=0;
    }
    let role=agoraAccessToken.RtcRole.SUBSCRIBER;
    if(req.query.role=='publisher'){
        role=agoraAccessToken.RtcRole.PUBLISHER;
    }
    let expireTime = 24*60*60;
    const currentTime = Math.floor(Date.now()/1000);
    const privilegeExpiresTime = currentTime+expireTime;
    const token = agoraAccessToken.RtcTokenBuilder.buildTokenWithUid(process.env.APP_ID,process.env.APP_CERTIFICATE,channelname,uid,role,privilegeExpiresTime);
    res.status(200).json({
        status:'success',
        token
    });
}