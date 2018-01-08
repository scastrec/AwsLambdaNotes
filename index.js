// import dynamo service
var DynamoDB = require('aws-sdk/clients/dynamodb');
var APIGateway = require('aws-sdk/clients/apigateway');

var httpHandler = require('./httpHandler');

var dynamodb = new DynamoDB({apiVersion: '2012-08-10'});

exports.handler = (event, context, callback) => {
    httpHandler.handle(event)
    .catch(function(e) {
      //URI not found
      callback("404");
    }).then(function(res){
      //execute found service
      console.log(res.name());
      return res.execute(event, dynamodb);
    }).then(function(value){
      // send back result
      callback(null, value);
    }).catch(function(e) {
      //Service error
      console.log(JSON.stringify(e));
      callback(JSON.stringify(e));
    });
};