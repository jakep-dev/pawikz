
(function(overviewRoute)
{

    var u = require('underscore');

    overviewRoute.init = function(app, config)
    {
        var client = config.restcall.client;
        var config = config;

        app.get('/api/overview/:projectId', getOverview);
        app.post('/api/saveOverview', saveOverview);

        //Get Dashboard data
        function getOverview(req, res, next) {

            var service = getServiceDetails('templateSearch');
            console.log(service);
            console.log(req.params);

            var methodName = '';

            if(!u.isUndefined(service) && !u.isNull(service))
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

            console.log(config.restcall.url + '/templateSearch/' + methodName);
            client.get(config.restcall.url + '/templateSearch/' + methodName ,args,function(data,response)
            {
                res.send(setOverViewDetails(data));
            });
        }

        function saveOverview(req, res, next)
        {
            var service = getServiceDetails('templateManager');
            console.log('Parameters -');
            console.log(req.body);

            var methodName = '';

            if(!u.isUndefined(service) && !u.isNull(service))
            {
                console.log(service.name);
                methodName = service.methods.saveOverview;
            }

            console.log(methodName);

            var args =
            {
                data: {
                    userId: req.body.userId,
                    projectId: req.body.projectId,
                    projectName: req.body.projectName,
                    token: 'testToken',
                    steps: req.body.steps
                },
                headers:{'Content-Type':'application/json'}
            };

            console.log(config.restcall.url + '/' + service.name + '/' + methodName);

            client.post(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
            {
                console.log(data);
                res.send(data);
            });
        }


        function getServiceDetails(serviceName) {
            return u.find(config.restcall.service, {name: serviceName});
        }
        
        function setOverViewDetails(data)
        {
           if(!u.isUndefined(data) && (!u.isUndefined(data.templateOverview)))
           {
               var steps = data.templateOverview.steps;


               u.each(steps, function(step)
               {
                   //console.log(step.stepName);
                   u.each(step.sections, function(section)
                   {
                       //console.log('sections Before - ' + section.value);
                      section.value = (section.value === 'true');
                       //console.log('sections After - ' + section.value);
                   });

                   step.value = (u.size(step.sections) !== 0 &&
                                 u.every(step.sections, u.identity({value: true})));
                   console.log('After Manipulation = ' + step.value);
               });
           }
           return data;
        }

    };

})(module.exports);

