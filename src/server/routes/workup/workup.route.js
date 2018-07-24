
(function (workupRoute)
 {
    var _ = require('underscore');
    var interval = null;
    var redis;
    var logger;

    workupRoute.init = function(app, config, log)
    {
        logger = log;
        logger.debug('WorkUp Route Config - ');
        redis = config.redis;
        var client = config.restcall.client;

        config.parallel([
            app.post('/api/workup/create', create),
            app.post('/api/workup/renew', renew),
            app.post('/api/workup/lock', lock),
            app.post('/api/workup/status', status),
            app.post('/api/workup/unlock', unlock),
            app.post('/api/workup/delete', removeRequest),
            app.post('/api/workup/refresh', dataRefresh),
            app.post('/api/workup/checkStatus', checkStatus),
        ]);

        // Checks the status of projectId.
        function checkStatus(req, res, next) {
            logger.debugRequest('Inside Check Status of Workup', req);
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
                    project_id: req.body.projectId,
                    ssnid: req.headers['x-session-token']
                }
            };
            logger.debugRequest('Parameters for CheckStatus', context.args.parameters.ssnid);
            logger.debugRequest(context.args.parameters, context.args.parameters.ssnid);
            var url = config.restcall.url + '/' + context.service.name + '/' + context.methodName;

            client.get(url, context.args, function (data, response) {
                logger.debugRequest('Reponse of CheckStatus', context.args.parameters.ssnid);
                logger.debugRequest(data, context.args.parameters.ssnid);
                res.status(response.statusCode).send(data);
            })
            .on('error',
            function (err) {
                logger.errorRequest('[checkStatus]Error', context.args.parameters.ssnid);
                logger.errorRequest(err, context.args.parameters.ssnid);
            });
        }

        //Create new workup
        function create(req, res, next) {
            logger.debugRequest('Inside Create Workup', req)
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
            var url = config.restcall.url + '/' + context.service.name + '/' + context.methodName;

            logger.debugRequest('create work up context ' +  context, context.args.parameters.ssnid);
            logger.debugRequest('url - ' + url, context.args.parameters.ssnid);

            client.get(url, context.args,
                function (data, response) {
                    logger.logIfHttpErrorRequest(url, context.args, data, response, context.args.parameters.ssnid);
                    logger.debugRequest('Response - StatusCode', context.args.parameters.ssnid);
                    logger.debugRequest(data, context.args.parameters.ssnid);
                    status(data.projectId, data.project_name, context.token, next);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[create]Error', context.args.parameters.ssnid);
                    logger.errorRequest(err, context.args.parameters.ssnid);
                }
            );
        }

        //Renew existing workup
        function renew(req, res, next)
        {
            var context = new Object();
            context.service = getServiceDetails('templateManager');
            context.methodName = '';

            if (!_.isUndefined(context.service) &&
                !_.isNull(context.service))
            {
                context.methodName = context.service.methods.renewWorkUp;
            }

            context.args =
            {
                parameters: {
                    project_id: req.body.projectId,
                    user_id: req.body.userId,
                    ssnid: req.headers['x-session-token']
                }
            };
            context.source = req.body.source;

            //Notify all users about the renewal process going on.
            broadcastWorkUpInfo(req.headers['x-session-token'], req.body.projectId, req.body.userId, 'renewal');
            var url = config.restcall.url + '/' + context.service.name + '/' + context.methodName;
            client.get(url, context.args,
                function (data, response) {
                    logger.logIfHttpErrorRequest(url, context.args, data, response, context.args.parameters.ssnid);
                    if(!data.projectId) {
                        data = {
                            old_project_id: context.args.parameters.project_id,
                            projectId: null,
                            project_name: null,
                            reponseInfo: {
                                code: response.statusCode,
                                comment: null,
                                status: response.statusMessage
                            }
                        };
                        logger.debugRequest(data, context.args.parameters.ssnid);
                    }

                    //Notify Renewal Status to the user initiated the request.
                    notifyStatus(req.headers['x-session-token'], data, 'notify-renew-workup-status', context.source);

                    //Notify Renewal Status to all users. So that they can use the template.
                    broadcastWorkUpInfo(req.headers['x-session-token'], req.body.projectId, req.body.userId, 'complete');
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[renew]Error', context.args.parameters.ssnid);
                    logger.errorRequest(err, context.args.parameters.ssnid);
                }
            );
            res.status('200').send('');
        }

        //Refresh existing workup
        function dataRefresh(req, res, next)
        {
            var context = new Object();
            context.service = getServiceDetails('templateManager');
            context.methodName = '';

            if (!_.isUndefined(context.service) &&
                !_.isNull(context.service))
            {
                context.methodName = context.service.methods.refreshWorkup;
            }

            context.args =
            {
                parameters: {
                    project_id: req.body.projectId,
                    user_id: req.body.userId,
                    ssnid: req.headers['x-session-token']
                }
            };
            context.source = req.body.source;

            //Notify all users about the Refreshing process going on.
            broadcastWorkUpInfo(req.headers['x-session-token'], req.body.projectId, req.body.userId, 'DataRefresh');
            var url = config.restcall.url + '/' + context.service.name + '/' + context.methodName;
            client.get(url, context.args,
                function (data, response) {
                    logger.logIfHttpErrorRequest(url, context.args, data, response, context.args.parameters.ssnid);
                    //Notify Refresh Status to the user initiated the request.
                    notifyStatus(req.headers['x-session-token'], req.body, 'notify-data-refresh-workup-status', context.source);

                    //Notify Refresh Status to all users. So that they can use the template.
                    broadcastWorkUpInfo(req.headers['x-session-token'], req.body.projectId, req.body.userId, 'complete');
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[dataRefresh]Error', context.args.parameters.ssnid);
                    logger.errorRequest(err, context.args.parameters.ssnid);
                }
            );
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
            var url = config.restcall.url + '/' +  service.name  + '/' + methodName;
            client.get(url, args,
                function (data, response) {
                    logger.logIfHttpErrorRequest(url, args, data, response, args.parameters.ssnid);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[lock]Error', args.parameters.ssnid);
                    logger.errorRequest(err, args.parameters.ssnid);
                }
            );
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
            var url = config.restcall.url + '/' +  service.name  + '/' + methodName;
            client.get(url, args,
                function (data, response) {
                    logger.logIfHttpErrorRequest(url, args, data, response, args.parameters.ssnid);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[unlock]Error', args.parameters.ssnid);
                    logger.errorRequest(err, args.parameters.ssnid);
                }
            );
        }

        //Get the create workup status
        function status(projectId, project_name, token, next)
        {
            logger.debugRequest('Inside Workup Status', token);
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
            var url = config.restcall.url + '/' + context.service.name + '/' + context.methodName;
            logger.debugRequest('Workup Status Url ' + url, token);
            client.get(url, context.args,
                function (data, response) {
                    logger.logIfHttpErrorRequest(url, context.args, data, response, token);
                    logger.debugRequest('Workup Status - ', token);
                    logger.debugRequest(data, token);
                    logger.debugRequest(projectId, token);
                    if(data && data.templateStatus) {
                        context.compData = {
                            projectId: projectId,
                            project_name: project_name,
                            progress: parseInt(data.templateStatus.percentage)
                        };

                        redis.getKeyCount(redis.SESSION_PREFIX + token,
                            function(keys) {
                                logger.debugRequest('[status] getKeyCount:' + keys.length, token);
                                if(keys.length > 0) {
                                    logger.debugRequest('[socket.io]Sending [create-workup-status] message for token = ' + token + '\n' + JSON.stringify(context.compData), token);
                                    config.socketIO.socket.sockets.to(token).emit('create-workup-status', context.compData);
                                }
                            }
                        );

                        if(parseInt(data.templateStatus.percentage) !== 100) {
                           context.timeout = setTimeout(function () {
                               status(projectId, project_name, token, next);
                            }, 5000);
                        }
                        else {
                            clearTimeout(context.timeout);
                        }
                    }
                    else if(!data.templateStatus) {
                        clearTimeout(context.timeout);
                    }
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[status]Error', token);
                    logger.errorRequest(err, token);
                }
            );
        }

        //Remove workup
        function removeRequest(req, res, next) {
            var context = {
                service: getServiceDetails('templateManager'),
                methodName: null,
                token: null,
                args: {}
            };

            if(context.service) {
                context.methodName = context.service.methods.deleteWorkup;
            }

            context.args =
            {
                parameters: {
                    project_id: req.body.projectId,
                    ssnid: req.headers['x-session-token']
                }
            };

            context.token = req.headers['x-session-token'];

            broadcastWorkUpInfo(req.headers['x-session-token'], req.body.projectId, req.body.userId, 'delete');
            var url = config.restcall.url + '/' + context.service.name + '/' + context.methodName;
            client.get(url, context.args,
                function (data, response) {
                    logger.logIfHttpErrorRequest(url, context.args, data, response, context.args.parameters.ssnid);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[removeRequest]Error', context.args.parameters.ssnid);
                    logger.errorRequest(err, context.args.parameters.ssnid);
                }
            );
        }

        function notifyStatus(token, data, key, source)
        {
            logger.debugRequest('Renewal done - key = ' + key + ' source = ' + source, token);
            logger.debugRequest(data, token);

            clearInterval(interval);
            redis.getKeyCount(redis.SESSION_PREFIX + token,
                function(keys) {
                    logger.debugRequest('[notifyStatus] getKeyCount:' + keys.length, token);
                    if(keys.length > 0) {
                        logger.debugRequest('Emit', token);
                        data.source = source;
                        config.socketIO.socket.sockets.to(token).emit(key, data);
                    }
                }
            );
        }

        //Broadcast workup details to all users.
        function broadcastWorkUpInfo(token, projectId, userId, status)
        {
            redis.getValue(redis.SESSION_PREFIX + token,
                function(userContext) {
                    logger.debugRequest('[broadcastWorkUpInfo] getValue:' + userContext, token);
                    if(userContext){
                        if(userContext.workups.length > 0) {
                            var workup = _.find(userContext.workups, function(item) {
                                if (parseInt(item.projectId) === parseInt(projectId)) {
                                    return item;
                                }
                            });
                            if(workup)
                            {
                                workup.status = status;
                            }
                            else {
                                //Adding data into the socketData for future user.
                                userContext.workups.push({
                                    projectId: projectId,
                                    status: status,
                                    userId: userId
                                });
                            }
                            redis.setValue(redis.SESSION_PREFIX + token, userContext);
                            config.socketIO.socket.sockets.emit('workup-room-message', {
                                type: 'workup-info',
                                data: userContext.workups
                            });
                        }
                    }
                }
            );
        }

        //Get the service details
        function getServiceDetails(serviceName) {
            return _.find(config.restcall.service, {name: serviceName});
        }
    };
 })(module.exports);
