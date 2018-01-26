var querystring = require('querystring');
var security = require('./security.js');
var securityToken = require('./securityToken.js');


module.exports = {
    execute : function (event, dynamodb) {
        return new Promise(function(resolve, reject) {
            var user = querystring.parse(event.body);
            var params = {
                Key: {
                 "username": {
                   S: user.username
                  }
                }, 
                TableName: "Users"
               };
               dynamodb.getItem(params, function(err, data) {
                 if (err) {
                     console.log(err);
                     reject({message : "user or pwd inccorrect", code:401});
                 } else {
                     if(data.Item){
                         if(data.Item.pwd.S === security.hash(user.pwd)){
                            resolve(data.Item);
                         } else {
                            reject({message : "user or pwd inccorrect", code:401});
                         }
                     } else {
                        reject({message : "user inccorrect", code:401});
                     }
                 }     
               });
        }).then(function(res){
            return securityToken.createToken(res, dynamodb);
        });
    },
    name : function(){
        return 'signin';
    }
};