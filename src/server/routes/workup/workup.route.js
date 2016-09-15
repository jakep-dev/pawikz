
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
            app.post('/api/workup/lock', lock),
            app.post('/api/workup/status', status),
            app.post('/api/workup/unlock', unlock)
        ]);


        //Create new workup
        function create(req, res, next) {
            var context = new Object();
            context.service = getServiceDetails('templateManager');
            context.methodName = '';

            if(!_.isUndefined(context.service) &&
               !_.isNull(context.service))
            {
                context.methodName = context.service.methods.createWorkUp;
            }

            context.args =
            {
                parameters: {
                    user_id: req.body.userId,
                    template_id: req.body.templateId,
                    company_id: req.body.companyId,
                    ssnid: req.headers['x-session-token']
                }
            };

            context.token = req.headers['x-session-token'];

            client.get(config.restcall.url + '/' + context.service.name + '/' + context.methodName, context.args, function (data, response) {
                console.log('Response - StatusCode');
                console.log(data);
                status(data.projectId, context.token, next);
                res.status(response.statusCode).send(data);
            });
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

               // data.projectId = req.body.projectId;

                //Notify Renewal Status to the user initiated the request.
                notifyStatus(req.headers['x-session-token'], data, 'notify-renew-workup-status');

                //Notify Renewal Status to all users. So that they can use the template.
                broadcastWorkUpInfo(req.headers['x-session-token'], req.body.projectId, req.body.userId, 'complete');
            });

            res.status('200').send('');
        }

        //Lock the workup is being worked by other user
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

        //UnLock the workup is being worked by other user
        function unlock(req, res, next)
        {
            var service = getServiceDetails('templateManager');
            var methodName = '';

            if(!_.isUndefined(service) &&
                !_.isNull(service))
            {
                methodName = service.methods.unlockWorkUp;
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

        //Get the create workup status
        function status(projectId, token, next)
        {
            var context = new Object();
            context.service = getServiceDetails('templateManager');
            context.methodName = '';

            if(!_.isUndefined(context.service) &&
                !_.isNull(context.service))
            {
                context.methodName = context.service.methods.createWorkUpStatus;
            }

            context.args =
            {
                parameters: {
                    project_id: projectId,
                    ssnid: token
                }
            };

            client.get(config.restcall.url + '/' + context.service.name + '/' + context.methodName, context.args, function (data, response) {
                console.log('Workup Status - ');
                console.log(data);
                console.log(projectId);
                if(data && data.templateStatus) {

                    context.compData = {
                        projectId: projectId,
                        progress: parseInt(data.templateStatus.percentage)
                    };

                    if(token in config.userSocketInfo)
                    {
                        config.userSocketInfo[token].emit('create-workup-status', context.compData);
                    }

                    if(parseInt(data.templateStatus.percentage) !== 100) {
                       context.timeout = setTimeout(function () {
                            status(projectId, token, next);
                        }, 5000);
                    }
                    else {
                        clearTimeout(context.timeout);
                    }
                }
                else if(!data.templateStatus) {
                    clearTimeout(context.timeout);
                }
            });
        }

        function notifyStatus(token, data, key)
        {
            console.log('Renewal done - ');
            console.log(data);

            clearInterval(interval);
            if(token in config.userSocketInfo)
            {
                console.log('Emit');
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
            console.log('Broadcast workup-');
            console.log(config.socketData.workup);

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

                console.log('Actual workup-');
                console.log(workup);

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

