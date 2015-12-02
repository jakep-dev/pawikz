
(function(dashboardRoute)
{

    var underscore = require('underscore');

    dashboardRoute.init = function(app, config)
    {
        var client = config.restcall.client;
        var config = config;

        app.get('/api/overview/:projectId', getOverview);

        //Get Dashboard data
        function getOverview(req, res, next) {

            var service = getServiceDetails('templateSearch');
            console.log(service);
            console.log(req.params);

            var methodName = '';

            if(!underscore.isUndefined(service) && !underscore.isNull(service))
            {
                console.log(service.name);
                methodName = service.methods.overView;
            }

            console.log(methodName);

            var args =
            {
                parameters: {
                    project_id: req.params.projectId,
                    ssnid: 'testToken'
                }
            };

            client.get(config.restcall.url + '/templateSearch/' + methodName ,args,function(data,response)
            {
                res.send(data);
            });
        }


        function getServiceDetails(serviceName)
        {
            return underscore.find(config.restcall.service, { name: serviceName });
        }

    };

})(module.exports);

