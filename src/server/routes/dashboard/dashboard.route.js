/**
 * Created by sherindharmarajan on 11/13/15.
 */

(function(dashboardRoute)
{

    var underscore = require('underscore');

    dashboardRoute.init = function(app, config)
    {
        var client = config.restcall.client;
        var config = config;

        app.get('/api/dashboard/:userId/:searchUserId/:searchCompanyId/:rowNum/:perPage/:sOrder/:sFilter', getDashboard);
        app.get('/api/users', getDashboardUsers);
        app.get('/api/companies', getDashboardCompanies);

        //Get Dashboard data
        function getDashboard(req, res, next) {

            var service = getServiceDetails('templateSearch');
            console.log(service);
            console.log(req.params);

            var methodName = '';

            if(!underscore.isUndefined(service) && !underscore.isNull(service))
            {
                console.log(service.name);
                methodName = service.methods.templateList;
            }

           console.log(methodName);

            var args =
            {
                parameters: {
                    user_id: req.params.userId,
                    srch_user_id: req.params.searchUserId,
                    srch_company_id: req.params.searchCompanyId,
                    row_num:req.params.rowNum,
                    results_per_page:req.params.perPage,
                    sort_order:req.params.sOrder,
                    sort_filter:req.params.sFilter,
                    ssnid: 'testToken'
                }
            };

            client.get(config.restcall.url + '/templateSearch/' + methodName ,args,function(data,response)
            {
                res.send(data);
            });
        }


        //Get dashboard filter user details
        function getDashboardUsers(req, res, next)
        {
            var service = getServiceDetails('templateSearch');
            var methodName = '';

            if(!underscore.isUndefined(service) && !underscore.isNull(service))
            {
                methodName = service.methods.userLookUp;
            }

            console.log(methodName);

            var args =
            {
                parameters: {
                    user_id: 25357,
                    ssnid: 'testToken'
                }
            };

            client.get(config.restcall.url + '/templateSearch/' + methodName,args,function(data,response)
            {
                res.send(data);
            });
        }

        //Get dashboard filter company details
        function getDashboardCompanies(req, res, next)
        {
            var service = getServiceDetails('templateSearch');
            var methodName = '';

            if(!underscore.isUndefined(service) && !underscore.isNull(service))
            {
                methodName = service.methods.companyLookUp;
            }

            console.log(methodName);

            var args =
            {
                parameters: {
                    user_id: 25357,
                    ssnid: 'testToken'
                }
            };

            client.get(config.restcall.url + '/templateSearch/' + methodName ,args,function(data,response)
            {
                //console.log(data);
                res.send(data);
            });
        }

        function getServiceDetails(serviceName)
        {
           return underscore.find(config.restcall.service, { name: serviceName });
        }

    };

})(module.exports);

