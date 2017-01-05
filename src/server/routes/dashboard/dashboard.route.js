/**
 * Created by sherindharmarajan on 11/13/15.
 */

(function(dashboardRoute)
{
    "use strict";

    var _ = require('underscore');
    var async = require('async');

    dashboardRoute.init = function(app, config)
    {
        var client = config.restcall.client;
        var config = config;

        config.parallel([
            app.post('/api/dashboard', getDashboard),
            app.get('/api/users/:userId', getDashboardUsers),
            app.get('/api/companies/:userId', getDashboardCompanies),
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
                        dashboard: results
                    });
                }
            );

            //Delete the workup
            function removeWorkUp(context, callback) {
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
                        project_id: context.deleteParams.projectId,
                        ssnid: context.token
                    }
                };

                broadcastWorkUpInfo(context.token, context.projectId, context.userId, 'delete');

                client.get(config.restcall.url + '/' + subContext.service.name + '/' + subContext.methodName, subContext.args,
                    function (data, response) {
                        context.delete = context.projectId;
                        callback(null, context);
                    }
                ).on('error',
                    function (err) {
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

                client.get(config.restcall.url + '/' + subContext.service.name + '/' + subContext.methodName, subContext.args,
                    function (data, response) {
                        context.delete = context.deleteParams.projectId;
                        callback(null, context);
                    }
                ).on('error',
                    function (err) {
                        broadcastWorkUpInfo(context.token, context.deleteParams.projectId, context.userId, 'complete');
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

            client.get(config.restcall.url + '/templateSearch/' + methodName ,args,function(data,response)
            {
                res.status(response.statusCode).send(data);
            });
        }

        function releaseWorkUp(projectId, userId, token)
        {
            console.log('notifyWorkUpNotInUse - ');
            console.log(projectId);
            console.log(userId);
            console.log(config.socketData.workup);

            if(config.socketData.workup &&
                config.socketData.workup.length > 0 &&
                _.isUndefined(projectId))
            {
              var workup =  _.find(config.socketData.workup, function(work)
                                {
                                   if(parseInt(work.userId) === parseInt(userId))
                                   {
                                       return work;
                                   }
                                });

                if(workup && !(token in config.userSocketInfo))
                {
                    delete config.socketData.workup[workup];
                }
            }
        }


        //Get dashboard filter user details
        function getDashboardUsers(req, res, next)
        {
            var service = getServiceDetails('templateSearch');
            var methodName = '';

            if(!_.isUndefined(service) && !_.isNull(service))
            {
                methodName = service.methods.userLookUp;
            }

            console.log(methodName);

            var args =
            {
                parameters: {
                    user_id: req.params.userId,
                    ssnid: req.headers['x-session-token']
                }
            };

            client.get(config.restcall.url + '/templateSearch/' + methodName,args,function(data,response)
            {
                res.status(response.statusCode).send(data);
            });
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

            console.log(methodName);

            var args =
            {
                parameters: {
                    user_id: req.params.userId,
                    ssnid: req.headers['x-session-token']
                }
            };

            client.get(config.restcall.url + '/templateSearch/' + methodName ,args,function(data,response)
            {
                res.status(response.statusCode).send(data);
            });
        }

        function getServiceDetails(serviceName)
        {
           return _.find(config.restcall.service, { name: serviceName });
        }

    };

})(module.exports);

