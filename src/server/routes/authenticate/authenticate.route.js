
(function(authenticateRoute)
{

    var u = require('underscore');
    var config;

    authenticateRoute.init = function(app, c, log)
    {
        config = c;
        var client = config.restcall.client;
        var logger = log;

        config.parallel([
            app.post('/api/authenticate', authenticate),
            app.post('/api/logout', logout),
            app.post('/api/userInfo', getUserInfo)
        ]);

        //Get user info
        function getUserInfo(req, res, next)
        {
            var service = getServiceDetails('templateManager');
            var methodName = '';

            if(!u.isUndefined(service) && !u.isNull(service))
            {
                logger.debugRequest(service.name, req);
                methodName = service.methods.userInfo;
            }

            logger.debugRequest(methodName, req);

            var args =
            {
                parameters: {
                    ssnid: req.headers['x-session-token']
                },
                headers:{'Content-Type':'application/json'}
            };

            logger.debugRequest(args, req);
            var url = config.restcall.url + '/' +  service.name  + '/' + methodName;
            client.get(url, args,
                function (data, response) {
                    logger.logIfHttpError(url, args, data, response);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[getUserInfo]Error', req);
                    logger.errorRequest(err, req);
                }
            );
        }

        //Logout user
        function logout(req, res, next)
        {
            var service = getServiceDetails('templateManager');
            var methodName = '';

            if(!u.isUndefined(service) && !u.isNull(service))
            {
                methodName = service.methods.logout;
            }

            var args =
            {
                parameters: {
                    ssnid: req.headers['x-session-token']
                },
                headers:{'Content-Type':'application/json'}
            };
            var url = config.restcall.url + '/' + service.name + '/' + methodName;
            client.get(url, args,
                function (data, response) {
                    logger.logIfHttpError(url, args, data, response);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[logout]Error', req);
                    logger.errorRequest(err, req);
                }
            );
        }

        //Authenticate the user and save token
        function authenticate(req, res, next)
        {
            logger.debugRequest('Parameters -', req);
            logger.debugRequest(req.body, req);

            var service = getServiceDetails('templateManager');
            var methodName = '';

            if(!u.isUndefined(service) && !u.isNull(service))
            {
                logger.debugRequest(service.name, req);
                methodName = service.methods.auth;
            }

            logger.debugRequest(methodName, req);

            var args =
            {
                parameters: {
                    user_name: req.body.userName,
                    pwd: req.body.password
                },
                headers:{'Content-Type':'application/json'}
            };

            logger.debugRequest(args, req);
            var url = config.restcall.url + '/' +  service.name  + '/' + methodName;
            client.get(url, args,
                function (data, response) {
                    logger.logIfHttpError(url, args, data, response);
                    data.info = config.froalaKey;
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[authenticate]Error', req);
                    logger.errorRequest(err, req);
                }
            );
        }

        function getServiceDetails(serviceName) {
            return u.find(config.restcall.service, {name: serviceName});
        }
    };

})(module.exports);

