var signin = require('./signin');
var signup = require('./signup');

exports.handle = (event) => {
    return new Promise(function(resolve, reject) {
        switch(event.path){
            case '/signin':
            console.log('httpHandler found signin');
            resolve(signin);
            return;
            case '/signup':
            resolve(signup);
            return;
            default:
            reject("No action found");
            break;
        }
    });
};