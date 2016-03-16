
(function(schemaRoute)
{

    var u = require('underscore');

    schemaRoute.init = function(app, config)
    {
        var client = config.restcall.client;
        var config = config;

        app.post('/api/schema', schema);
        app.post('/api/mnemonics', mnemonics);
        app.post('/api/saveTemplate', saveMnemonics);

        //config.parallel([
        //    app.post('/api/schema', schema),
        //    app.post('/api/mnemonics', mnemonics),
        //    app.post('/api/saveTemplate', saveMnemonics)
        //]);

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
                res.status(response.statusCode).send(setSchemaVariations(data));
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
                    projectId: req.body.projectId,
                    stepId: req.body.stepId,
                    userId: req.body.userId,
                    ssnid: req.headers['x-session-token'],
                    mnemonics: req.body.mnemonics
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

        //S et the schema variations.
        function setSchemaVariations(data){
            return data.UIStructure.data.TearSheetStep.Component;
        }
    };

})(module.exports);

