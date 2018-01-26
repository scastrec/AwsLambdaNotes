var querystring = require('querystring');
var securityToken = require('./securityToken.js');

const TABLE_NAME = "Notes";
var addNote = function(note, dynamodb){
    return new Promise(function(resolve, reject){
        var params = {
            Item: {
                "id": {
                    S: note.id
                },
                "timestamp": {
                    S: note.timestamp
                }, 
                "username": {
                S: note.username
                }, 
                "note": {
                S:note.note
                }
            }, 
            TableName: TABLE_NAME
           };
           dynamodb.putItem(params, function(err, data) {
             if (err){ 
                 console.log("Create note KO " + JSON.stringify(err));
                 reject({message : "Error happened", code:500});
            } else {  
                console.log("Create note OK " + JSON.stringify(data));
                 resolve(data);        // successful response 
             }            
           });
    });
}

var getNotes = function(dynamodb){
    return new Promise(function(resolve, reject){
        var params = {
            TableName : TABLE_NAME,
            KeyConditionExpression: "timestamp > :ts1",
            ExpressionAttributeValues: {
                ":ts1":Date.now()-24*60*60*1000
            }
        };
        
        dynamodb.query(params, function(err, data) {
            if (err) {
                console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
                reject({message : "Error happened", code:500});
            } else {
                console.log("Query succeeded.");
                resolve(data.Items);        // successful response                 
            }
        });
    });    
}

module.exports = {
    execute : function (event, dynamodb) {
        return new Promise(function(resolve, reject) {
            //first check rights 
            var token = event.headers.token;
            securityToken.checkToken(token, dynamodb)
            .then(function(res){
                //Two possibilites GET or POST
                if(event.requestContext.httpMethod === 'GET'){
                    return getNotes(dynamodb);
                } else if(event.requestContext.httpMethod === 'POST'){
                    var note = {
                        id : res.username.S+"_"+Date.now(),
                        username : res.username.S,
                        timestamp : Date.now(),
                        note: event.body.note,
                        done: false
                    }
                    return addNote(note, dynamodb);                    
                }        
            }).catch(function(err){
                console.log(err);
                reject({message:'Token incorrect', code:401});                    
            });            
        });       
    },
    name : function(){
        return 'notes';
    }
};