const crypto = require('crypto');

const secret = 'ThisIsAKeyThatHasToBeChangeOneTimeOrAnother';

module.exports = {

    hash : function(str){
        return crypto.createHmac('sha256', secret)
        .update('str')
        .digest('hex');
    }
}