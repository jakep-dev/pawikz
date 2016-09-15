
(function(authenticateRoute)
{

    var u = require('underscore');

    authenticateRoute.init = function(app, config)
    {
        var client = config.restcall.client;
        var config = config;

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
                console.log(service.name);
                methodName = service.methods.userInfo;
            }

            console.log(methodName);

            var args =
            {
                parameters: {
                    ssnid: req.headers['x-session-token']
                },
                headers:{'Content-Type':'application/json'}
            };

            console.log(args);

            client.get(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
            {
                res.status(response.statusCode).send(data);
            });
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

            client.get(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
            {
                res.status(response.statusCode).send(data);
            });
        }

        //Authenticate the user and save token
        function authenticate(req, res, next)
        {
            console.log('Parameters -');
            console.log(req.body);

            var service = getServiceDetails('templateManager');
            var methodName = '';

            if(!u.isUndefined(service) && !u.isNull(service))
            {
                console.log(service.name);
                methodName = service.methods.auth;
            }

            console.log(methodName);

            var args =
            {
                parameters: {
                    user_name: req.body.userName,
                    pwd: req.body.password
                },
                headers:{'Content-Type':'application/json'}
            };

            console.log(args);

            client.get(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
            {
                res.status(response.statusCode).send(data);
            });
        }

        function getServiceDetails(serviceName) {
            return u.find(config.restcall.service, {name: serviceName});
        }
    };

})(module.exports);

