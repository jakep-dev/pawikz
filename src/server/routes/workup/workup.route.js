
(function(workupRoute)
{

    var u = require('underscore');

    var interval = null;

    workupRoute.init = function(app, config)
    {

        var client = config.restcall.client;
        console.log('WorkUp Route Config - ');
        console.log(config.userSocketInfo);

        config.parallel([
            app.post('/api/workup/create', create),
            app.post('/api/workup/renew', renew)
        ]);


        //Create new workup
        function create(req, res, next) {

            var service = getServiceDetails('templateManager');
            var methodName = '';

            if(!u.isUndefined(service) &&
               !u.isNull(service))
            {
                methodName = service.methods.createWorkUp;
            }

            console.log('MethodName- ' + methodName);
            console.log('config.restcall.url - ' + config.restcall.url);
            console.log('service.name - ' + service.name);

            var args =
            {
                parameters: {
                    user_id: req.body.userId,
                    template_id: req.body.templateId,
                    company_id: req.body.companyId,
                    ssnid: req.headers['x-session-token']
                }
            };

            client.get(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response) {
                interval = setInterval(function(token, data, key) {
                    notifyStatus(token, data, key);
                }, 1000, req.headers['x-session-token'], data, 'notify-create-workup-status');

            });

            res.status('200').send('');
        }

        //Renew existing workup
        function renew(req, res, next)
        {
            console.log('Renew Service Initiated');
            var service = getServiceDetails('templateManager');
            var methodName = '';

            if(!u.isUndefined(service) &&
                !u.isNull(service))
            {
                methodName = service.methods.renewWorkUp;
            }

            var args =
            {
                parameters: {
                    project_id: req.body.projectId,
                    user_id: req.body.userId,
                    ssnid: req.headers['x-session-token']
                }
            };

            client.get(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response) {
                interval = setInterval(function(token, data, key) {
                    notifyStatus(token, data, key);
                }, 1000, req.headers['x-session-token'], data, 'notify-renew-workup-status');
                //res.status(response.statusCode).send(data);
            });

            res.status('200').send('');
        }

        function notifyStatus(token, data, key)
        {
            clearInterval(interval);
            if(token in config.userSocketInfo)
            {
                config.userSocketInfo[token].emit(key, data);
            }
        }

        //Get the service details
        function getServiceDetails(serviceName) {
            return u.find(config.restcall.service, {name: serviceName});
        }

    };

})(module.exports);

