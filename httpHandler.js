var signin = require('./services/signin');
var signup = require('./services/signup');
var notes = require('./services/notes');

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
            case '/notes':
            resolve(notes);
            return;
            default:
            reject("No action found");
            break;
        }
    });
};