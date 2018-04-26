
(function(overviewRoute)
{

    var _ = require('underscore');
    var redis;
    var workupBusiness;
    var logger;

    overviewRoute.init = function(app, config, workupBiz, log)
    {
        var client = config.restcall.client;
        redis = config.redis;
        workupBusiness = workupBiz;
        logger = log;

        config.parallel([app.post('/api/overview', getOverview),
            app.post('/api/overview/defer', getOverview),
            app.post('/api/saveOverview', saveOverview),
            app.post('/api/getProjectHistory', getProjectHistory),
            app.post('/api/getProjectHistoryFilters', getProjectHistoryFilters)]);

        function getProjectHistoryFilters(req, res, next){
            "use strict";
            var args;
            var service = getServiceDetails('templateSearch');
            var methodName = '';

            if(service) {
                methodName = service.methods.getProjectHistoryFilters;
            }

            args = {
                parameters: {
                    project_id: req.body.projectId,
                    filter_type: req.body.filterType,
                    ssnid: req.headers['x-session-token']
                }
            };

            if(req.body.step) {
                args.parameters.step = req.body.step;
            }
            var url = config.restcall.url + '/templateSearch/' + methodName;
            client.get(url, args,
                function (data, response) {
                    logger.logIfHttpErrorRequest(url, args, data, response, args.parameters.ssnid);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[getProjectHistoryFilters]Error', args.parameters.ssnid);
                    logger.errorRequest(err, args.parameters.ssnid);
                }
            );
        }

        //Get project history details
        function getProjectHistory(req, res, next){
            "use strict";
            var args;
            var service = getServiceDetails('templateSearch');
            var methodName = '';

            if(service) {
                methodName = service.methods.getProjectHistory;
            }

            args = {
                parameters: {
                    project_id: req.body.projectId,
                    row_start: req.body.rowStart,
                    row_end: req.body.rowEnd,
                    ssnid: req.headers['x-session-token'],
                    step_id: req.body.stepId,
                    field_name: req.body.fieldName,
                    modified_by: req.body.modifiedBy,
                    modified_date: req.body.modifiedDate,
                    action: req.body.action
                }
            };

            logger.debugRequest('Project History Args - ', args.parameters.ssnid);
            logger.debugRequest(args, args.parameters.ssnid);
            var url = config.restcall.url + '/templateSearch/' + methodName;
            client.get(url, args,
                function (data, response) {
                    logger.logIfHttpErrorRequest(url, args, data, response, args.parameters.ssnid);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[getProjectHistory]Error', args.parameters.ssnid);
                    logger.errorRequest(err, args.parameters.ssnid);
                }
            );
        }

        //Get Dashboard data
        function getOverviewDefer(req, res, next) {

            var args;
            var service = getServiceDetails('templateSearch');

            var methodName = '';

            if(!_.isUndefined(service) && !_.isNull(service)) {
                methodName = service.methods.overView;
            }

            args =
            {
                parameters: {
                    project_id: req.body.projectId,
                    ssnid: req.headers['x-session-token']
                }
            };
            var url = config.restcall.url + '/templateSearch/' + methodName;
            client.get(url, args,
                function (data, response) {
                    logger.logIfHttpErrorRequest(url, args, data, response, args.parameters.ssnid);
                    res.status(response.statusCode).send(setOverViewDetails(data));
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[getOverviewDefer]Error', args.parameters.ssnid);
                    logger.errorRequest(err, args.parameters.ssnid);
                }
            );
        }

        //Get Dashboard data
        function getOverview(req, res, next) {

            var args;
            var service = getServiceDetails('templateSearch');
            var methodName = '';
            if(!_.isUndefined(service) && !_.isNull(service)) {
                methodName = service.methods.overView;
            }
            args =
            {
                parameters: {
                    project_id: req.body.projectId,
                    ssnid: req.headers['x-session-token']
                }
            };

            if(req.body.prevProjectId) {
                //Unlock previously loaded work-up
                workupBusiness.unlock(req.body.prevProjectId, req.body.userId, req.headers['x-session-token']);
            }

            var url = config.restcall.url + '/templateSearch/' + methodName;
            client.get(url, args,
                function (data, response) {
                    logger.logIfHttpErrorRequest(url, args, data, response, args.parameters.ssnid);
                    workupBusiness.lock(req.body.projectId, req.body.userId, req.headers['x-session-token']);
                    broadcastWorkUpInfo(req.headers['x-session-token'], req.body.userId, req.body.projectId, 'in-process');
                    res.status(response.statusCode).send(setOverViewDetails(data));
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[getOverview]Error', args.parameters.ssnid);
                    logger.errorRequest(err, args.parameters.ssnid);
                }
            );
        }

        //Save Overview data
        function saveOverview(req, res, next)
        {
            var service = getServiceDetails('templateManager');
            logger.debugRequest('Parameters -', req);
            logger.debugRequest(req.body, req);

            var methodName = '';

            if(!_.isUndefined(service) && !_.isNull(service))
            {
                logger.debugRequest(service.name, req);
                methodName = service.methods.saveOverview;
            }

            logger.debugRequest(methodName, req);

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

            logger.debugRequest(args, args.data.token);
            var url = config.restcall.url + '/' + service.name + '/' + methodName;
            client.post(url, args,
                function (data, response) {
                    logger.logIfHttpErrorRequest(url, args, data, response, args.data.token);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[saveOverview]Error', args.data.token);
                    logger.errorRequest(err, args.data.token);
                }
            );
        }

        function broadcastWorkUpInfo(token, userId, projectId, status)
        {
            redis.getValue(redis.SESSION_PREFIX + token,
                function(userContext) {
                    logger.debugRequest('NotifyWorkUpUse - ' + userId, token);
                    if(userContext) {
                        //Release all workup been lock before.
                        var workup = _.find(userContext.workups, function(item)
                        {
                            if(parseInt(item.userId) === parseInt(userId) &&
                                item.status === 'in-process')
                            {
                                return item;
                            }
                        });

                        logger.debugRequest('WorkUps', token);
                        logger.debugRequest(workup, token);

                        if(workup)
                        {
                            workup.status = 'complete';
                        }

                        logger.debugRequest('After Delete', token);
                        logger.debugRequest(userContext.workups, token);

                        workup = _.find(userContext.workups, function(item)
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
                            userContext.workups.push({
                                projectId: projectId,
                                status: status,
                                userId: userId.toString()
                            });
                        }
                        redis.setValue(redis.SESSION_PREFIX + token, { userId:userId, workups: userContext.workups});
                        logger.debugRequest('Workup broadcast-', token);
                        logger.debugRequest(userContext.workups, token);

                        config.socketIO.socket.sockets.to(token).emit('workup-room-message', {
                            type: 'workup-info',
                            data: userContext.workups
                        });
                    }
                }
            );
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
