
(function(authenticateRoute)
{

    var u = require('underscore');

    authenticateRoute.init = function(app, config)
    {
        var client = config.restcall.client;
        var config = config;

        app.post('/api/authenticate', authenticate);

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
                data: {
                    user_id: req.body.userName,
                    pwd: req.body.password
                },
                headers:{'Content-Type':'application/json'}
            };

            console.log(args);

            client.get(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
            {
                console.log(data);
                res.send(data);
            });
        }

        function getServiceDetails(serviceName) {
            return u.find(config.restcall.service, {name: serviceName});
        }
    };

})(module.exports);

