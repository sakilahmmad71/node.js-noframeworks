// Importing modules from Node.js
const HTTP = require('http');
const HTTPS = require('https');
const URL = require('url');
const stringDecoder = require('string_decoder').StringDecoder;
const FS = require('fs');

// importing local files
const config = require('./lib/config');
const handlers = require('./lib/handlers');
const _data = require('./lib/data');
const helpers = require('./lib/helpers');

// Making router to serve our request handlers
const router = {
    notFound: handlers.notFound,
    ping: handlers.ping,
    users: handlers.users,
    tokens: handlers.tokens,
};

// All the server logic and both HTTP and HTTPS server
const unifiedServer = (req, res) => {
    // Get the url and parse it
    const parsedUrl = URL.parse(req.url, true);

    // Getting the pathname from the parsedUrl and trimmed the path also the method
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Getting http method for every request
    const method = req.method.toLowerCase();

    // Getting query string object as key value pair
    const queryStringObject = parsedUrl.query;

    // Getting all the request headers
    const headers = req.headers;

    // Get the payload or request body if any
    const decoder = new stringDecoder('utf-8');
    let buffer = '';

    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        // choosing handler by using the path user provide, if matches then go that handler otherwise redirect to 404 handler
        const choosedHandler =
            typeof router[trimmedPath] !== 'undefined'
                ? router[trimmedPath]
                : router.notFound;

        // Loading the data object for logging our payload data
        const data = {
            headers: headers,
            path: trimmedPath,
            method: method,
            queries: queryStringObject,
            payload: helpers.parseJsonToObject(buffer),
        };

        // calling the specified router handler with appropriate data
        choosedHandler(data, (statusCode, payload) => {
            statusCode = typeof statusCode === 'number' ? statusCode : 200;
            payload = typeof payload === 'object' ? payload : {};
            const payloadString = JSON.stringify(payload);

            // res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // logging out the whole request
            // console.log(statusCode, payloadString, data);
        });
    });
};

// Instantiate HTTP server
const httpServer = HTTP.createServer((req, res) => unifiedServer(req, res));

// Https server required some options
const httpsServerOptions = {
    key: FS.readFileSync('./https/key.pem'),
    cert: FS.readFileSync('./https/cert.pem'),
};

// Instantiate HTTPS server
const httpsServer = HTTPS.createServer(httpsServerOptions, (req, res) =>
    unifiedServer(req, res)
);

// Starting the HTTP server and listening to the port
httpServer.listen(config.httpPort, () => {
    console.log(`Server listening on port ${config.httpPort} in ${config.envName} mode`);
});

// Starting the HTTPS server and listening to the port
httpsServer.listen(config.httpsPort, () => {
    console.log(`Server listening on port ${config.httpsPort} in ${config.envName} mode`);
});
