var querystring = require('querystring');
var security = require('./security.js');

var TableName = "SecurityToken";

var generateUUID = function() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

var createToken = function(user, dynamodb){
    return new Promise(function(resolve, reject){
        var params = {
            Item: {
             "token": {
               S: generateUUID()
              }, 
             "username": {
               S:""+user.username
              }, 
             "duration": {
               N:"3600"
              }, 
             "timestamp": {
               N:""+Math.trunc(Date.now() / 1000)
              }
            }, 
            TableName: TableName
           };
        dynamodb.putItem(params, function(err, data){
            if(err){
                console.log("Error occured creating token", err);
                reject({message : "Internal error occured", code:500});
            } else {
                resolve({token: params.Item.token.S, duration: params.Item.duration.N, timestamp : params.Item.timestamp.N});
            }
        });
    });
}

var checkToken = function(token, dynamodb){
    return new Promise(function(resolve, reject) {
        var params = {
            Key: {
             "token": {
               S: token
              }
            }, 
            TableName: TableName
           };
           dynamodb.getItem(params, function(err, data) {
             if (err) {
                 console.log(err);
                 reject({message : "Token incorrect", code:401});
             } else {
                 if(data.Item){
                     var sum = data.Item.duration.N + data.Item.timestamp.N;
                     if(sum > Math.trunc(Date.now()/1000)){
                         console.log("Token valid");
                        resolve(data.Item);                                            
                     } else {
                         console.log('Token expired ' + JSON.stringify(data.Item));
                         reject({message: "Token expired.", code:401});
                     }
                 } else {
                    reject({message : "Token inccorrect", code:401});
                 }
             }     
           });
    });
}

module.exports = {
    createToken : function (user, dynamodb) {
        return createToken(user, dynamodb);
    },
    checkToken : function (token, dynamodb) {
        return checkToken(token, dynamodb);
    },
    name : function(){
        return 'securityToken';
    }
};