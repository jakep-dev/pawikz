
(function(workupRoute)
{

    var u = require('underscore');

    var interval = null;

    workupRoute.init = function(app, config)
    {

        var client = config.restcall.client;
        console.log('WorkUp Route Config - ');
        console.log(config.userSocketInfo);

        config.parallel([app.post('/api/workup/create', createWorkUp)]);


        //Get Dashboard data
        function createWorkUp(req, res, next) {

            var service = getServiceDetails('templateManager');
            var methodName = '';

            if(!u.isUndefined(service) &&
               !u.isNull(service))
            {
                methodName = service.methods.createTemplate;
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
                interval = setInterval(function(token, data) {
                    notifyWorkUpStatus(token, data);
                }, 1000, req.headers['x-session-token'], data);

            });

            res.status('200').send('');
        }

        function notifyWorkUpStatus(token, data)
        {
            clearInterval(interval);
            if(token in config.userSocketInfo)
            {
                config.userSocketInfo[token].emit('notify-workup-status', data);
            }
        }

        //Get the service details
        function getServiceDetails(serviceName) {
            return u.find(config.restcall.service, {name: serviceName});
        }

    };

})(module.exports);

