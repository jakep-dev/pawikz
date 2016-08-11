
(function(overviewRoute)
{

    var _ = require('underscore');

    overviewRoute.init = function(app, config)
    {
        var client = config.restcall.client;
        var config = config;

        config.parallel([app.post('/api/overview', getOverview),
            app.post('/api/saveOverview', saveOverview)]);


        //Get Dashboard data
        function getOverview(req, res, next) {

            var service = getServiceDetails('templateSearch');
            console.log(req.headers);

            var methodName = '';

            if(!_.isUndefined(service) && !_.isNull(service))
            {
                console.log(service.name);
                methodName = service.methods.overView;
            }

            console.log(methodName);

            var args =
            {
                parameters: {
                    project_id: req.body.projectId,
                    ssnid: req.headers['x-session-token']
                }
            };

            client.get(config.restcall.url + '/templateSearch/' + methodName ,args,function(data,response)
            {
                broadcastWorkUpInfo(req.headers['x-session-token'], req.body.userId, req.body.projectId, 'in-process');
                res.status(response.statusCode).send(setOverViewDetails(data));
            });
        }

        //Save Overview data
        function saveOverview(req, res, next)
        {
            var service = getServiceDetails('templateManager');
            console.log('Parameters -');
            console.log(req.body);

            var methodName = '';

            if(!_.isUndefined(service) && !_.isNull(service))
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
                    token: req.headers['x-session-token'],
                    steps: req.body.steps
                },
                headers:{'Content-Type':'application/json'}
            };

          console.log(args);

            client.post(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
            {
                res.status(response.statusCode).send(data);
            });
        }

        function broadcastWorkUpInfo(token, userId, projectId, status)
        {
            console.log('NotifyWorkUpUse - ' + userId);

            if((token in config.userSocketInfo) &&
                config.socketIO)
            {
                
                //Release all workup been lock before. 
                var workup = _.find(config.socketData.workup, function(item)
                {
                    if(parseInt(item.userId) === parseInt(userId) &&
                        item.status === 'in-process')
                    {
                        return item;
                    }
                });

                console.log('WorkuPs');
                console.log(workup);

                if(workup)
                {
                    workup.status = 'complete';
                }

                console.log('After Delete');
                console.log(config.socketData.workup);
                
                workup = _.find(config.socketData.workup, function(item)
                {
                    if(parseInt(item.projectId) === parseInt(projectId))
                    {
                        return item;
                    }
                });

                if(workup)
                {
                    workup.status = status;
                    workup.userId = userId.toString();
                }
                else {
                    //Adding data into the socketData for future user.
                    config.socketData.workup.push({
                        projectId: projectId,
                        status: status,
                        userId: userId.toString()
                    });
                }

                config.socketIO.sockets.in('workup-room').emit('workup-room-message', {
                    type: 'workup-info',
                    data: {
                        projectId: projectId,
                        userId: userId,
                        status: status
                    }
                });
            }
        }

        function getServiceDetails(serviceName) {
            return _.find(config.restcall.service, {name: serviceName});
        }
        
        function setOverViewDetails(data)
        {
            if(data && data.templateOverview && data.templateOverview.steps)
           {
               var steps = data.templateOverview.steps;

               _.each(steps, function(step)
               {
                   _.each(step.sections, function(section)
                   {
                      section.value = (section.value === 'true');
                   });

                   step.value = (_.size(step.sections) !== 0 &&
                                 _.every(step.sections, _.identity({value: true})));
               });
           }
           return data;
        }

    };

})(module.exports);

