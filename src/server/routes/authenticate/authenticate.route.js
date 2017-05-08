
(function(authenticateRoute)
{

    var u = require('underscore');

    authenticateRoute.init = function(app, config, log)
    {
        var client = config.restcall.client;
        var config = config;
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
                logger.debug(service.name);
                methodName = service.methods.userInfo;
            }

            logger.debug(methodName);

            var args =
            {
                parameters: {
                    ssnid: req.headers['x-session-token']
                },
                headers:{'Content-Type':'application/json'}
            };

            logger.debug(args);
            var url = config.restcall.url + '/' +  service.name  + '/' + methodName;
            client.get(url, args,
                function (data, response) {
                    logger.logIfHttpError(url, args, data, response);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.error('[getUserInfo]Error');
                    logger.error(err);
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
                    logger.error('[logout]Error');
                    logger.error(err);
                }
            );
        }

        //Authenticate the user and save token
        function authenticate(req, res, next)
        {
            logger.debug('Parameters -');
            logger.debug(req.body);

            var service = getServiceDetails('templateManager');
            var methodName = '';

            if(!u.isUndefined(service) && !u.isNull(service))
            {
                logger.debug(service.name);
                methodName = service.methods.auth;
            }

            logger.debug(methodName);

            var args =
            {
                parameters: {
                    user_name: req.body.userName,
                    pwd: req.body.password
                },
                headers:{'Content-Type':'application/json'}
            };

            logger.debug(args);
            var url = config.restcall.url + '/' +  service.name  + '/' + methodName;
            client.get(url, args,
                function (data, response) {
                    logger.logIfHttpError(url, args, data, response);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.error('[authenticate]Error');
                    logger.error(err);
                }
            );
        }

        function getServiceDetails(serviceName) {
            return u.find(config.restcall.service, {name: serviceName});
        }
    };

})(module.exports);

