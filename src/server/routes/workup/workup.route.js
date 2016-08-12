
(function(workupRoute)
{

    var _ = require('underscore');
    var interval = null;

    workupRoute.init = function(app, config)
    {

        var client = config.restcall.client;
        console.log('WorkUp Route Config - ');
        console.log(config.userSocketInfo);

        config.parallel([
            app.post('/api/workup/create', create),
            app.post('/api/workup/renew', renew),
            app.post('/api/workup/lock', lock)
        ]);


        //Create new workup
        function create(req, res, next) {

            var service = getServiceDetails('templateManager');
            var methodName = '';

            if(!_.isUndefined(service) &&
               !_.isNull(service))
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
            var service = getServiceDetails('templateManager');
            var methodName = '';

            if(!_.isUndefined(service) &&
                !_.isNull(service))
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

            //Notify all users about the renewal process going on.
            broadcastWorkUpInfo(req.headers['x-session-token'], req.body.projectId, req.body.userId, 'renewal');

            client.get(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response) {

                //Notify Renewal Status to the user initiated the request.
                notifyStatus(req.headers['x-session-token'], data, 'notify-renew-workup-status');

                //Notify Renewal Status to all users. So that they can use the template.
                broadcastWorkUpInfo(req.headers['x-session-token'], req.body.projectId, req.body.userId, 'complete');
            });

            res.status('200').send('');
        }

        //Check the workup is being worked by other user
        function lock(req, res, next)
        {
            var service = getServiceDetails('templateManager');
            var methodName = '';

            if(!_.isUndefined(service) &&
                !_.isNull(service))
            {
                methodName = service.methods.lockWorkUp;
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
                res.status(response.statusCode).send(data);
            });
        }

        function notifyStatus(token, data, key)
        {
            console.log('Renewal done - ');

            clearInterval(interval);
            if(token in config.userSocketInfo)
            {
                config.userSocketInfo[token].emit(key, data);
            }
        }

        function updateRenewStatus(data)
        {
           var workUp = _.find(config.socketData.workup, function(item)
                        {
                            if(parseInt(item.projectId) === parseInt(data.projectId))
                            {
                                return item;
                            }
                        });

            console.log('updateRenewStatus - ');
            console.log(data);
            console.log(config.socketData.workup);
            console.log(workUp);

            if(workUp)
            {
                workUp.status = 'complete';
            }

            config.socketIO.socket.sockets.in('workup-room').emit('workup-room-message', {
                type: 'renewal-complete',
                data: {
                    projectId: data.projectId
                }
            });
        }

        //Broadcast workup details to all users.
        function broadcastWorkUpInfo(token, projectId, userId, status)
        {
            if((token in config.userSocketInfo) &&
                config.socketIO.socket)
            {
                var workup = _.find(config.socketData.workup, function(item)
                {
                    if(parseInt(item.projectId) === parseInt(projectId))
                    {
                        return item;
                    }
                });

                if(workup)
                {
                    workup.status = status;
                }
                else {
                    //Adding data into the socketData for future user.
                    config.socketData.workup.push({
                        projectId: projectId,
                        status: status,
                        userId: userId
                    });
                }

                config.socketIO.socket.sockets.in('workup-room').emit('workup-room-message', {
                    type: 'workup-info',
                    data: config.socketData.workup
                });
            }
        }

        //Get the service details
        function getServiceDetails(serviceName) {
            return _.find(config.restcall.service, {name: serviceName});
        }

    };

})(module.exports);

