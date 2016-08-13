/**
 * Created by sherindharmarajan on 11/13/15.
 */

(function(dashboardRoute)
{

    var _ = require('underscore');

    dashboardRoute.init = function(app, config)
    {
        var client = config.restcall.client;
        var config = config;

        config.parallel([
            app.post('/api/dashboard', getDashboard),
            app.get('/api/users/:userId', getDashboardUsers),
            app.get('/api/companies/:userId', getDashboardCompanies)
        ]);

        //Get Dashboard data
        function getDashboard(req, res, next) {

            var service = getServiceDetails('templateSearch');
            console.log(req.body);

            var methodName = '';

            if(!_.isUndefined(service) && !_.isNull(service))
            {
                console.log(service.name);
                methodName = service.methods.templateList;
            }

            var args =
            {
                parameters: {
                    user_id: req.body.userId,
                    srch_user_id: req.body.searchUserId,
                    srch_company_id: req.body.searchCompanyId,
                    row_num:req.body.rowNum,
                    results_per_page:req.body.perPage,
                    sort_order:req.body.sortOrder,
                    sort_filter:req.body.sortFilter,
					srch_filter:req.body.searchFilter,
                    ssnid: req.headers['x-session-token']
                },
                headers:{
                    'Content-Type':'application/json'
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

