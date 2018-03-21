
(function(overviewRoute)
{
    var _ = require('underscore');
    var redis = require('../redis/redist');
    var workupBusiness;
    var logger;

    overviewRoute.init = function(app, config, workupBiz, log)
    {
        var client = config.restcall.client;
        var config = config;
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
                    logger.logIfHttpError(url, args, data, response);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.error('[getProjectHistoryFilters]Error');
                    logger.error(err);
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

            logger.debug('Project History Args - ');
            logger.debug(args);
            var url = config.restcall.url + '/templateSearch/' + methodName;
            client.get(url, args,
                function (data, response) {
                    logger.logIfHttpError(url, args, data, response);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.error('[getProjectHistory]Error');
                    logger.error(err);
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
                    logger.logIfHttpError(url, args, data, response);
                    res.status(response.statusCode).send(setOverViewDetails(data));
                }
            ).on('error',
                function (err) {
                    logger.error('[getOverviewDefer]Error');
                    logger.error(err);
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
                    logger.logIfHttpError(url, args, data, response);
                    workupBusiness.lock(req.body.projectId, req.body.userId, req.headers['x-session-token']);
                    broadcastWorkUpInfo(req.headers['x-session-token'], req.body.userId, req.body.projectId, 'in-process');
                    res.status(response.statusCode).send(setOverViewDetails(data));
                }
            ).on('error',
                function (err) {
                    logger.error('[getOverview]Error');
                    logger.error(err);
                }
            );
        }

        //Save Overview data
        function saveOverview(req, res, next)
        {
            var service = getServiceDetails('templateManager');
            logger.debug('Parameters -');
            logger.debug(req.body);

            var methodName = '';

            if(!_.isUndefined(service) && !_.isNull(service))
            {
                logger.debug(service.name);
                methodName = service.methods.saveOverview;
            }

            logger.debug(methodName);

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

            logger.debug(args);
            var url = config.restcall.url + '/' + service.name + '/' + methodName;
            client.post(url, args,
                function (data, response) {
                    logger.logIfHttpError(url, args, data, response);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.error('[saveOverview]Error');
                    logger.error(err);
                }
            );
        }

        function broadcastWorkUpInfo(token, userId, projectId, status)
        {
            redis.getValue(redis.SESSION_PREFIX + token, 
                function(userContext) {
                    logger.debug('NotifyWorkUpUse - ' + userId);
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

                        logger.debug('WorkUps');
                        logger.debug(workup);

                        if(workup)
                        {
                            workup.status = 'complete';
                        }

                        logger.debug('After Delete');
                        logger.debug(userContext.workups);
                        
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
                        logger.debug('Workup broadcast-');
                        logger.debug(userContext.workups);

                        config.socketIO.socket.sockets.in(token).emit('workup-room-message', {
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

