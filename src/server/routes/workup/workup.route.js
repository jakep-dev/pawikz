
(function (workupRoute)
 {

    var _ = require('underscore');
    var interval = null;
    var logger;
    var redis = require('../redis/redist');
    var logger;

    workupRoute.init = function(app, config, log)
    {
        logger = log;
        logger.debug('WorkUp Route Config - ');
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
            logger.debug('Inside Check Status of Workup');
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
            logger.debug('Parameters for CheckStatus');
            logger.debug(context.args.parameters);
            var url = config.restcall.url + '/' + context.service.name + '/' + context.methodName;

            client.get(url, context.args, function (data, response) {
                logger.debug('Reponse of CheckStatus');
                logger.debug(data);
                res.status(response.statusCode).send(data);
            })
            .on('error',
            function (err) {
                logger.error('[checkStatus]Error');
                logger.error(err);
            });
        }

        //Create new workup
        function create(req, res, next) {
            logger.debug('Inside Create Workup')
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

            logger.debug('create work up context ', context);
            logger.debug('url - ', url);

            client.get(url, context.args,
                function (data, response) {
                    logger.logIfHttpError(url, context.args, data, response);
                    logger.debug('Response - StatusCode');
                    logger.debug(data);
                    status(data.projectId, data.project_name, context.token, next);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.error('[create]Error');
                    logger.error(err);
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
                    logger.logIfHttpError(url, context.args, data, response);
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
                        logger.debug(data);
                    }

                    //Notify Renewal Status to the user initiated the request.
                    notifyStatus(req.headers['x-session-token'], data, 'notify-renew-workup-status', context.source);

                    //Notify Renewal Status to all users. So that they can use the template.
                    broadcastWorkUpInfo(req.headers['x-session-token'], req.body.projectId, req.body.userId, 'complete');
                }
            ).on('error',
                function (err) {
                    logger.error('[renew]Error');
                    logger.error(err);
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
                    logger.logIfHttpError(url, context.args, data, response);
                    //Notify Refresh Status to the user initiated the request.
                    notifyStatus(req.headers['x-session-token'], req.body, 'notify-data-refresh-workup-status', context.source);

                    //Notify Refresh Status to all users. So that they can use the template.
                    broadcastWorkUpInfo(req.headers['x-session-token'], req.body.projectId, req.body.userId, 'complete');
                }
            ).on('error',
                function (err) {
                    logger.error('[dataRefresh]Error');
                    logger.error(err);
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
                    logger.logIfHttpError(url, args, data, response);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.error('[lock]Error');
                    logger.error(err);
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
                    logger.logIfHttpError(url, args, data, response);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.error('[unlock]Error');
                    logger.error(err);
                }
            );
        }

        //Get the create workup status
        function status(projectId, project_name, token, next)
        {
            logger.debug('Inside Workup Status');
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
            logger.debug('Workup Status Url ', url);
            client.get(url, context.args,
                function (data, response) {
                    logger.logIfHttpError(url, context.args, data, response);
                    logger.debug('Workup Status - ');
                    logger.debug(data);
                    logger.debug(projectId);
                    if(data && data.templateStatus) {
                        context.compData = {
                            projectId: projectId,
                            project_name: project_name,
                            progress: parseInt(data.templateStatus.percentage)
                        };

                        redis.getKeyCount(redis.SESSION_PREFIX + token,
                            function(keys) {
                                logger.debug('[status] getKeyCount:' + keys.length);
                                if(keys.length > 0) {
                                    logger.debug('[socket.io]Sending [create-workup-status] message for token = ' + token + '\n' + JSON.stringify(context.compData));
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
                    logger.error('[status]Error');
                    logger.error(err);
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
                    logger.logIfHttpError(url, context.args, data, response);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.error('[removeRequest]Error');
                    logger.error(err);
                }
            );
        }


        function notifyStatus(token, data, key, source)
        {
            logger.debug('Renewal done - key = ' + key + ' source = ' + source);
            logger.debug(data);

            clearInterval(interval);
            redis.getKeyCount(redis.SESSION_PREFIX + token,
                function(keys) {
                    logger.debug('[notifyStatus] getKeyCount:' + keys.length);
                    if(keys.length > 0) {
                        logger.debug('Emit');
                        data.source = source;
                        config.socketIO.socket.sockets.to(token).emit(key, data);
                    }
                }
            );
        }

        // function updateRenewStatus(data)
        // {
        //    var workUp = _.find(config.socketData.workup, function(item)
        //                 {
        //                     if(parseInt(item.projectId) === parseInt(data.projectId))
        //                     {
        //                         return item;
        //                     }
        //                 });

        //     logger.debug('updateRenewStatus - ');
        //     logger.debug(data);
        //     logger.debug(config.socketData.workup);
        //     logger.debug(workUp);

        //     if(workUp)
        //     {
        //         workUp.status = 'complete';
        //     }

        //     config.socketIO.socket.sockets.in('workup-room').emit('workup-room-message', {
        //         type: 'renewal-complete',
        //         data: {
        //             projectId: data.projectId
        //         }
        //     });
        // }

        //Broadcast workup details to all users.
        function broadcastWorkUpInfo(token, projectId, userId, status)
        {
            redis.getValue(redis.SESSION_PREFIX + token,
                function(userContext) {
                    logger.debug('[broadcastWorkUpInfo] getValue:' + userContext);
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

