/**
 * Created by sherindharmarajan on 11/13/15.
 */

(function(dashboardRoute)
{
    "use strict";

    var _ = require('underscore');
    var async = require('async');
    var redis = require('../redis/redist');
    var logger;

    dashboardRoute.init = function(app, config, log)
    {
        var client = config.restcall.client;
        var config = config;
        logger = log;

        config.parallel([
            app.post('/api/dashboard', getDashboard),
            app.post('/api/users', getDashboardUsers),
            app.post('/api/companies', getDashboardCompanies),
            app.post('/api/processRemoveWorkUp', processRemoveWorkUp)
        ]);

        //Processes the remove workup logic to avoid another api call from client side.
        function processRemoveWorkUp(req, res, next) {
            var context = {
                projectId: req.body.projectId,
                token: req.headers['x-session-token'],
                filterParam: req.body.filterParam
            };

            async.waterfall([removeWorkUp, getFilteredDashboard],
                function (err, results) {
                    res.send({
                        delete: results.delete,
                        dashboard: results.workUpList
                    });
                }
            );

            //Delete the workup
            function removeWorkUp(callback) {
                var subContext = {
                    service: getServiceDetails('templateManager'),
                    methodName: null,
                    args: {}
                };

                if (subContext.service) {
                    subContext.methodName = subContext.service.methods.deleteWorkup;
                }

                subContext.args =
                {
                    parameters: {
                        project_id: context.projectId,
                        ssnid: context.token
                    }
                };

                broadcastWorkUpInfo(context.token, context.projectId, context.userId, 'delete');
                var url = config.restcall.url + '/' + subContext.service.name + '/' + subContext.methodName;
                client.get(url, subContext.args,
                    function (data, response) {
                        logger.logIfHttpError(url, subContext.args, data, response);
                        context.delete = context.projectId;
                        callback(null, context);
                    }
                ).on('error',
                    function (err) {
                        logger.error('[removeWorkUp]Error');
                        logger.error(err);
                        broadcastWorkUpInfo(context.token, context.projectId, context.userId, 'complete');
                        callback(null, context);
                    }
                );
            }

            //Get the filtered dashboard.
            function getFilteredDashboard(context, callback) {
                var subContext = {
                    service: getServiceDetails('templateSearch'),
                    methodName: null,
                    args: {}
                };

                if (subContext.service) {
                    subContext.methodName = subContext.service.methods.templateList;
                }

                subContext.args =
                {
                    parameters: {
                        user_id: context.filterParam.userId,
                        srch_user_id: context.filterParam.searchUserId,
                        srch_company_id: context.filterParam.searchCompanyId,
                        row_num: context.filterParam.rowNum,
                        results_per_page: context.filterParam.perPage,
                        sort_order: context.filterParam.sortOrder,
                        sort_filter: context.filterParam.sortFilter,
                        srch_filter: context.filterParam.searchFilter,
                        ssnid: context.token
                    }
                };
                var url = config.restcall.url + '/' + subContext.service.name + '/' + subContext.methodName;
                client.get(url, subContext.args,
                    function (data, response) {
                        logger.logIfHttpError(url, subContext.args, data, response);
                        context.workUpList = data;
                        callback(null, context);
                    }
                ).on('error',
                    function (err) {
                        logger.error('[getFilteredDashboard]Error');
                        logger.error(err);
                        callback(null, context);
                    }
                );
            }
        }


        //Get Dashboard data
        function getDashboard(req, res, next) {

            var methodName;
            var service = getServiceDetails('templateSearch');
            methodName = '';

            if(!_.isUndefined(service) && !_.isNull(service)) {
                methodName = service.methods.templateList;
            }

            var args =
            {
                parameters: {
                    user_id: req.body.userId,
                    srch_user_id: req.body.searchUserId,
                    srch_company_id: req.body.searchCompanyId,
                    row_num: req.body.rowNum,
                    results_per_page: req.body.perPage,
                    sort_order: req.body.sortOrder,
                    sort_filter: req.body.sortFilter,
                    srch_filter: req.body.searchFilter,
                    ssnid: req.headers['x-session-token']
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            var url = config.restcall.url + '/templateSearch/' + methodName;
            client.get(url, args,
                function (data, response) {
                    logger.logIfHttpError(url, args, data, response);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.error('[getDashboard]Error');
                    logger.error(err);
                }
            );
        }

        // function releaseWorkUp(projectId, userId, token)
        // {
        //     logger.debug('notifyWorkUpNotInUse - ');
        //     logger.debug(projectId);
        //     logger.debug(userId);
        //     logger.debug(config.socketData.workup);

        //     if(config.socketData.workup &&
        //         config.socketData.workup.length > 0 &&
        //         _.isUndefined(projectId))
        //     {
        //       var workup =  _.find(config.socketData.workup, function(work)
        //                         {
        //                            if(parseInt(work.userId) === parseInt(userId))
        //                            {
        //                                return work;
        //                            }
        //                         });

        //         if(workup && !(token in config.userSocketInfo))
        //         {
        //             delete config.socketData.workup[workup];
        //         }
        //     }
        // }


        //Get dashboard filter user details
        function getDashboardUsers(req, res, next)
        {
            var service = getServiceDetails('templateSearch');
            var methodName = '';

            if(!_.isUndefined(service) && !_.isNull(service)) {
                methodName = service.methods.userLookUp;
            }

            var args =
            {
                parameters: {
                    user_id: req.body.userId,
                    ssnid: req.headers['x-session-token']
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            var url = config.restcall.url + '/templateSearch/' + methodName;
            client.get(url, args,
                function (data, response) {
                    logger.logIfHttpError(url, args, data, response);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.error('[getDashboardUsers]Error');
                    logger.error(err);
                }
            );
        }

        //Get dashboard filter company details
        function getDashboardCompanies(req, res, next)
        {
            var service = getServiceDetails('templateSearch');
            var methodName = '';

            if(!_.isUndefined(service) && !_.isNull(service))
            {
                methodName = service.methods.companyLookUp;
            }

            var args =
            {
                parameters: {
                    user_id: req.body.userId,
                    ssnid: req.headers['x-session-token']
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            var url = config.restcall.url + '/templateSearch/' + methodName;
            client.get(url, args,
                function (data, response) {
                    logger.logIfHttpError(url, args, data, response);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.error('[getDashboardCompanies]Error');
                    logger.error(err);
                }
            );
        }

        //Broadcast workup details to all users.
        function broadcastWorkUpInfo(token, projectId, userId, status)
        {
            redis.getValue(redis.SESSION_PREFIX + token, 
                function(userContext) {
                    if(userContext) {
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
                        redis.setValue(redis.SESSION_PREFIX + token, { userId:userId, workups: userContext.workups});
                        config.socketIO.socket.sockets.emit('workup-room-message', {
                            type: 'workup-info',
                            data: userContext.workups
                        });
                    }
                }
            );
        }

        function getServiceDetails(serviceName)
        {
           return _.find(config.restcall.service, { name: serviceName });
        }

    };

})(module.exports);

