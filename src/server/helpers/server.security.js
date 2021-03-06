(function (server) {

    var cookieParser = require('cookie-parser');
    var csrf = require('csurf');
    var csrfProtection = csrf(
        {
            cookie: true,
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            ignoreMethods: ['GET']
        }
    );

    function setupSecurity(expressServer, isMultiThreading, connectSrc) {
        //Cookie secret parameter
        expressServer.use(cookieParser('TmN!m9BmqS5x%g8Zdd6p%sqP2G6kft@z5SztHzN##Mc%wk6cL$#?yfUGA=&Xw7rLVB5@WQP7k_+#YWtR2-9u#^&U8fhdDL-Vrjq9%uAt^UfN?ew+SCbcQq&_YZsGmAdx'));
        expressServer.use(csrfProtection);

        expressServer.use(function (req, res, next) {
            var csrfToken = req.csrfToken();
            res.cookie('XSRF-TOKEN', csrfToken);
            res.locals._csrf = csrfToken;

            res.removeHeader("X-Powered-By");
            var cspHeader = '';
            if(connectSrc !== '') {
                cspHeader += " script-src 'self' *.advisen.com 'unsafe-eval' 'unsafe-inline'; object-src 'self'; connect-src 'self' " + connectSrc;
            } else {
                cspHeader += " script-src 'self' *.advisen.com 'unsafe-eval' 'unsafe-inline'; object-src 'self'";
            }
            res.header('Content-Security-Policy', cspHeader);
            res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
            res.header('X-Frame-Options', 'SAMEORIGIN');
            res.header('X-XSS-Protection', '1; mode=block');
            res.header('X-Content-Type-Options', 'nosniff');

            res.cookie('isMultiThreading', '' + isMultiThreading);
            return next();
        });
    }

    server.setupSecurity = setupSecurity;

    function getServer(expressServer, port, isHttps, callback) {
        var server;
        if (isHttps) {
            var https = require('https');
            var fs = require('fs');
            var httpOptions = {
                cert: fs.readFileSync('src/server/advisen.com2015.crt'),
                key: fs.readFileSync('src/server/advisen2015.key'),
                passphrase: 'advisen'
            };
            server = https.createServer(httpOptions, expressServer).listen(port, callback);
        } else {
            server = expressServer.listen(port, callback);
        }
        return server;
    }

    server.getServer = getServer;

})(module.exports);