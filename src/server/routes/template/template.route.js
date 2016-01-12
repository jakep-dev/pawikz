
(function(schemaRoute)
{

    var u = require('underscore');

    schemaRoute.init = function(app, config)
    {
        var client = config.restcall.client;
        var config = config;

        config.parallel([
            app.post('/api/schema', schema)
        ]);

        //Schema for the templates
        function schema(req, res, next)
        {
            console.log('Parameters -');
            console.log(req.body);

            var service = getServiceDetails('templateSearch');
            var methodName = '';

            if(!u.isUndefined(service) && !u.isNull(service))
            {
                console.log(service.name);
                methodName = service.methods.templateSchema;
            }

            console.log(methodName);

            var args =
            {
                parameters: {
                    project_id: req.body.project_id,
                    step_id: req.body.step_id,
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

        //Mnemonics for the templates
        function mnemonics(req, res, next)
        {
            console.log('Parameters -');
            console.log(req.body);

            var service = getServiceDetails('templateSearch');
            var methodName = '';

            if(!u.isUndefined(service) && !u.isNull(service))
            {
                console.log(service.name);
                methodName = service.methods.templateMnemonics;
            }

            console.log(methodName);

            var args =
            {
                parameters: {
                    project_id: req.body.project_id,
                    step_id: req.body.step_id,
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

        //Save Mnemoics for the templates
        function saveMnemonics(req, res, next)
        {
            var service = getServiceDetails('templateManager');
            console.log('Parameters -');
            console.log(req.body);

            var methodName = '';

            if(!u.isUndefined(service) && !u.isNull(service))
            {
                console.log(service.name);
                methodName = service.methods.saveMnemonics;
            }

            console.log(methodName);

            var args =
            {
                data: {
                    input: req.body.data
                },
                headers:{'Content-Type':'application/json'}
            };

            console.log(args);

            client.post(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
            {
                res.status(response.statusCode).send(data);
            });
        }

        function getServiceDetails(serviceName) {
            return u.find(config.restcall.service, {name: serviceName});
        }
    };

})(module.exports);

