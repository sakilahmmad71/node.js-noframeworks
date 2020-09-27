// Importing necessary modeules from node.js
const crypto = require('crypto');

// Importing necessary files from local directory
const config = require('./config');

const helpers = {
    hash: (str) => {
        if (typeof str === 'string' && str.length > 0) {
            const hash = crypto
                .createHmac('sha256', config.hashingSecret)
                .update(str)
                .digest('hex');

            return hash;
        } else {
            return false;
        }
    },

    parseJsonToObject: (str) => {
        try {
            const obj = JSON.parse(str);
            return obj;
        } catch {
            return {};
        }
    },

    createRandomString: (strLength) => {
        strLength = typeof strLength === 'number' && strLength > 0 ? strLength : false;

        if (strLength) {
            const possibleCharecters = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let str = '';

            for (let i = 1; i <= strLength; i++) {
                let randomCharecter = possibleCharecters.charAt(
                    Math.floor(Math.random() * possibleCharecters.length)
                );
                str += randomCharecter;
            }
            // return the final string
            return str;
        } else {
            return false;
        }
    },
};

module.exports = helpers;
