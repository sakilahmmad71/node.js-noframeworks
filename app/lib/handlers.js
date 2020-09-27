// Importing necessary modeules from node.js

// Importing necessary files from local directory
const _data = require('./data');
const helpers = require('./helpers');

// Making haldlers to handle the route request
const handlers = {
    notFound: (data, callback) => {
        callback(404);
    },

    ping: (data, callback) => {
        callback(200);
    },

    // FIXME: Users routes
    _users: {
        /*
            Users - get
            Required Data : phone
            Optional Data : none
        */
        get: (data, callback) => {
            const phone =
                typeof data.queries.phone === 'string' &&
                data.queries.phone.trim().length === 11
                    ? data.queries.phone.trim()
                    : false;

            if (phone) {
                // get the token from headers
                const token =
                    typeof data.headers.token === 'string' ? data.headers.token : false;
                // verify that the given token is valid for the phone number
                handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        console.log(tokenIsValid);
                        // lookup the user
                        _data.read('users', phone, (err, data) => {
                            if (!err && data) {
                                delete data.password;
                                callback(200, data);
                            } else {
                                callback(404);
                            }
                        });
                    }
                    // TODO: Having some issues but not clear
                    // else {
                    //     callback(403, {
                    //         Error: 'Missing required token or token is invalid',
                    //     });
                    // }
                });
            } else {
                callback(400, { Error: 'Missing required field.' });
            }
        },

        /*
            Users - post
            Required Data : firstName, lastName, phone, password, tosAgreement
            Optional Data : none
        */
        post: (data, callback) => {
            const firstName =
                typeof data.payload.firstName === 'string' &&
                data.payload.firstName.trim().length > 0
                    ? data.payload.firstName.trim()
                    : false;

            const lastName =
                typeof data.payload.lastName === 'string' &&
                data.payload.lastName.trim().length > 0
                    ? data.payload.lastName.trim()
                    : false;

            const phone =
                typeof data.payload.phone === 'string' &&
                data.payload.phone.trim().length === 11
                    ? data.payload.phone.trim()
                    : false;

            const password =
                typeof data.payload.password === 'string' &&
                data.payload.password.trim().length > 0
                    ? data.payload.password.trim()
                    : false;

            const tosAgreement =
                typeof data.payload.tosAgreement === 'boolean' &&
                data.payload.tosAgreement === true
                    ? true
                    : false;

            if (firstName && lastName && phone && password && tosAgreement) {
                _data.read('users', phone, (err, data) => {
                    if (err) {
                        const hashPassword = helpers.hash(password);

                        if (hashPassword) {
                            const userObject = {
                                firstName: firstName,
                                lastName: lastName,
                                phone: phone,
                                password: hashPassword,
                                tosAgreement: true,
                            };

                            // store the user to our database
                            _data.create('users', phone, userObject, (err) => {
                                if (!err) {
                                    callback(200);
                                } else {
                                    console.log(err);
                                    callback(500, {
                                        Error: 'Could not create the new user.',
                                    });
                                }
                            });
                        } else {
                            callback(500, {
                                Error: 'Counld not hashed the user password',
                            });
                        }
                    } else {
                        callback(400, {
                            Error: 'A user with this phone number already exists.',
                        });
                    }
                });
            } else {
                callback(400, { Error: 'Mising required fields.' });
            }
        },

        /*
            Users - put
            Required Data : phone
            Optional Dat : firstName, lastName, phone, password (At least one must be specified)
        */
        put: (data, callback) => {
            const phone =
                typeof data.payload.phone === 'string' &&
                data.payload.phone.trim().length === 11
                    ? data.payload.phone.trim()
                    : false;

            const firstName =
                typeof data.payload.firstName === 'string' &&
                data.payload.firstName.trim().length > 0
                    ? data.payload.firstName.trim()
                    : false;

            const lastName =
                typeof data.payload.lastName === 'string' &&
                data.payload.lastName.trim().length > 0
                    ? data.payload.lastName.trim()
                    : false;

            const password =
                typeof data.payload.password === 'string' &&
                data.payload.password.trim().length > 0
                    ? data.payload.password.trim()
                    : false;

            if (phone) {
                if (firstName || lastName || password) {
                    // get the token from headers
                    const token =
                        typeof data.headers.token === 'string'
                            ? data.headers.token
                            : false;
                    // verify that the given token is valid for the phone number
                    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            // lookup the users
                            _data.read('users', phone, (err, userData) => {
                                if (!err && userData) {
                                    if (firstName) {
                                        userData.firstName = firstName;
                                    }

                                    if (lastName) {
                                        userData.lastName = lastName;
                                    }

                                    if (password) {
                                        userData.password = helpers.hash(password);
                                    }

                                    // Store the new data
                                    _data.update('users', phone, userData, (err) => {
                                        if (!err) {
                                            callback(200);
                                        } else {
                                            console.log(err);
                                            callback(500, {
                                                Error: 'Could not update the user',
                                            });
                                        }
                                    });
                                } else {
                                    callback(400, {
                                        Error: 'The specified user does not exist.',
                                    });
                                }
                            });
                        } else {
                            callback(403, {
                                Error: 'Missing required token or token is invalid',
                            });
                        }
                    });
                } else {
                    callback(400, { Error: 'Missing required fields to update.' });
                }
            } else {
                callback(400, { Error: 'Missing required field.' });
            }
        },

        /*
            Users - delete
            Required Data : phone
            Optional Data : none
        */
        delete: (data, callback) => {
            // Check the phone number is valid
            const phone =
                typeof data.queries.phone === 'string' &&
                data.queries.phone.trim().length === 11
                    ? data.queries.phone.trim()
                    : false;

            if (phone) {
                // get the token from headers
                const token =
                    typeof data.headers.token === 'string' ? data.headers.token : false;
                // verify that the given token is valid for the phone number
                handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        // lookup the users
                        _data.read('users', phone, (err, data) => {
                            if (!err && data) {
                                _data.delete('users', phone, (err) => {
                                    if (!err) {
                                        callback(200);
                                    } else {
                                        callback(500, {
                                            Error: 'Cannot delete the specified user.',
                                        });
                                    }
                                });
                            } else {
                                callback(400, {
                                    Error: 'Could not find the dpecified user.',
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            Error: 'Missing required token or token is invalid',
                        });
                    }
                });
            } else {
                callback(400, { Error: 'Missing required field.' });
            }
        },
    },

    // TODO: users handler
    users: (data, callback) => {
        const acceptableMethods = ['post', 'get', 'put', 'delete'];
        if (acceptableMethods.indexOf(data.method) > -1) {
            handlers._users[data.method](data, callback);
        } else {
            callback(405);
        }
    },

    // FIXME: Token methods
    _tokens: {
        /*
            tokens - get
            Required Data : id
            Optional Data : none
        */
        get: (data, callback) => {
            const id =
                typeof data.queries.id === 'string' && data.queries.id.length === 20
                    ? data.queries.id.trim()
                    : false;

            if (id) {
                _data.read('tokens', id, (err, tokenData) => {
                    if (!err && tokenData) {
                        callback(200, tokenData);
                    } else {
                        callback(404);
                    }
                });
            } else {
                callback(400, { Error: 'Missing required field.' });
            }
        },

        /*
            tokens - post
            Required Data : phone, password
            Optional Data : none
        */
        post: (data, callback) => {
            const phone =
                typeof data.payload.phone === 'string' &&
                data.payload.phone.trim().length === 11
                    ? data.payload.phone.trim()
                    : false;

            const password =
                typeof data.payload.password === 'string' &&
                data.payload.password.trim().length > 0
                    ? data.payload.password.trim()
                    : false;

            if (phone && password) {
                _data.read('users', phone, (err, userData) => {
                    if (!err && userData) {
                        // Hashing the password and compare it to the userpassword
                        const hashedPassword = helpers.hash(password);
                        if (userData.password === hashedPassword) {
                            // Create a token with random name and set expiration.
                            const tokenId = helpers.createRandomString(20);
                            const expires = Date.now() + 1000 * 60 * 60;
                            const tokenObject = {
                                phone: phone,
                                id: tokenId,
                                expires: expires,
                            };
                            // Storing the token into .data/token folder
                            _data.create('tokens', tokenId, tokenObject, (err) => {
                                if (!err) {
                                    callback(200, tokenObject);
                                } else {
                                    callback(500, {
                                        Error: 'Could not create the new token.',
                                    });
                                }
                            });
                        }
                        // else {
                        //     callback(400, {
                        //         Error: 'Password did not matched for specified users.',
                        //     });
                        // }
                    } else {
                        callback(400, { Error: 'Could not find the specified user.' });
                    }
                });
            } else {
                callback(400, { Error: 'Missing required fields.' });
            }
        },

        /*
            tokens - put
            Required Data : id, extend
            Optional Data : none
        */
        put: (data, callback) => {
            const id =
                typeof data.payload.id === 'string' &&
                data.payload.id.trim().length === 20
                    ? data.payload.id.trim()
                    : false;

            const extend =
                typeof data.payload.extend === 'boolean' && data.payload.extend === true
                    ? true
                    : false;

            if (id && extend) {
                // lookup the tokens
                _data.read('tokens', id, (err, tokenData) => {
                    if (!err && tokenData) {
                        // Check to make sure the token isn't already expired
                        if (tokenData.expires > Date.now()) {
                            tokenData.expires = Date.now() + 1000 * 60 * 60;
                            _data.update('tokens', id, tokenData, (err) => {
                                if (!err) {
                                    callback(200);
                                } else {
                                    callback(500, {
                                        Error: 'Could not update token expiration',
                                    });
                                }
                            });
                        }
                        // else {
                        //     callback(400, {
                        //         Error: 'Token already expired, cannot update the token.',
                        //     });
                        // }
                    } else {
                        callback(400, { Error: 'Specified token does not exist.' });
                    }
                });
            } else {
                callback(400, { Error: 'Missing required fields.' });
            }
        },

        /*
            tokens - delete
            Required Data : id
            Optional Data : none
        */
        delete: (data, callback) => {
            const id =
                typeof data.queries.id === 'string' && data.queries.id.length === 20
                    ? data.queries.id.trim()
                    : false;

            if (id) {
                _data.read('tokens', id, (err, data) => {
                    if (!err && data) {
                        _data.delete('tokens', id, (err) => {
                            if (!err) {
                                callback(200);
                            } else {
                                callback(500, {
                                    Error: 'Could not delete specified token',
                                });
                            }
                        });
                    } else {
                        callback(404);
                    }
                });
            } else {
                callback(400, { Error: 'Missing required field.' });
            }
        },

        // Verify if a given token id is currently valid fro a given user
        verifyToken: (id, phone, callback) => {
            // lookup token
            _data.read('tokens', id, (err, tokenData) => {
                if (!err && tokenData) {
                    if (tokenData.phone === phone && tokenData.expires > Date.now()) {
                        callback(true);
                    } else {
                        callback(false);
                    }
                } else {
                    callback(false);
                }
            });
        },
    },

    // TODO: Token handler
    tokens: (data, callback) => {
        const acceptableMethods = ['post', 'get', 'put', 'delete'];
        if (acceptableMethods.indexOf(data.method) > -1) {
            handlers._tokens[data.method](data, callback);
        } else {
            callback(405);
        }
    },
};

module.exports = handlers;
