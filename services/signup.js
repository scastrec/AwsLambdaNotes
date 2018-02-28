var querystring = require('querystring');
var security = require('./security.js');

const TABLE_NAME = "Users";
var createUser = function(user, dynamodb){
    return new Promise(function(resolve, reject){
        var params = {
            Item: {
             "username": {
               S: user.username
              }, 
             "pwd": {
               S:security.hash(user.pwd)
              }
            }, 
            TableName: TABLE_NAME
           };
           dynamodb.putItem(params, function(err, data) {
             if (err){ 
                 console.log("Create user KO " + JSON.stringify(err));
                 reject(err); // an error occurred
             }
             else{  
                console.log("Create user OK " + JSON.stringify(data));
                 resolve(data);        // successful response 
             }            
           });
    });
}

var getUser = function(username, dynamodb){
    return new Promise(function(resolve, reject){
        var params = {
            Key: {
             "username": {
               S: username
              }
            }, 
            TableName: TABLE_NAME
           };
           dynamodb.getItem(params, function(err, data) {
             if (err) {
                console.log("Error getUser to check if exit ", err);
                reject({message : "Error happened", code:500});
             } else {
                 if(!data.Item) {
                    resolve(data.Item);
                 } else {
                    reject({message : "user already exist", code:401});
                 }
            }     
           });
    });    
}

module.exports = {
    execute : function (event, dynamodb) {
        return new Promise(function(resolve, reject) {
            var user = querystring.parse(event.body);
            // first check user not already exist
            getUser(user.username, dynamodb).then(function(res){
                console.log("User not exist. Let's create");
                return createUser(user, dynamodb);                       
            }).then(function(res){
                console.log("create User succeed");
                resolve(res);                    
             }).catch(function(err){
                 console.log("Error creating user", err);
                reject(err);
            });            
        });
    },
    name : function(){
        return 'signup';
    }
};