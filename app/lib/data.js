const { error } = require('console');
// Importing all necessary modules
const FS = require('fs');
const PATH = require('path');

const lib = {
    baseDir: PATH.join(__dirname, '/../.data/'),

    create: (dir, file, data, callback) => {
        FS.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
                const stringData = JSON.stringify(data);
                FS.writeFile(fileDescriptor, stringData, (err) => {
                    if (!err) {
                        FS.close(fileDescriptor, (err) => {
                            if (!err) {
                                callback(false);
                            } else {
                                callback('Error closing file.');
                            }
                        });
                    } else {
                        callback('Error writing file.');
                    }
                });
            } else {
                callback('Could not create new file, It may already exist.');
            }
        });
    },

    read: (dir, file, callback) => {
        FS.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf-8', (err, data) => {
            callback(err, data);
        });
    },

    update: (dir, file, data, callback) => {
        FS.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
                const stringData = JSON.stringify(data);
                FS.ftruncate(fileDescriptor, (err) => {
                    if (!err) {
                        FS.writeFile(fileDescriptor, stringData, (err) => {
                            if (!err) {
                                FS.close(fileDescriptor, (err) => {
                                    if (!err) {
                                        callback(false);
                                    } else {
                                        callback('Error closing file.');
                                    }
                                });
                            } else {
                                callback('Error writing to existing file.');
                            }
                        });
                    } else {
                        callback('Error trancating file.');
                    }
                });
            } else {
                callback('Could not open the file for updating, It may not exist yet.');
            }
        });
    },

    delete: (dir, file, callback) => {
        FS.unlink(`${lib.baseDir}${dir}/${file}.json`, (err) => {
            if (!err) {
                callback(false);
            } else {
                callback('Error while deleting file.');
            }
        });
    },
};

module.exports = lib;
