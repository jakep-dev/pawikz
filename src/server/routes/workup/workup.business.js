(function(workupBusiness) {

    var _ = require('underscore');
    var config;
    var client;
    var logger;

    /*
    * Lock the workup being used by user.
    * */
    workupBusiness.lock = function(projectId, userId, token)
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
                project_id: projectId,
                user_id: userId,
                ssnid: token
            }
        };

        logger.debugRequest('Lock projectId- ' + projectId + ' userId- ' + userId + ' token- ' + token, token);
        var url = config.restcall.url + '/' + service.name + '/' + methodName;
        client.get(url, args,
            function (data, response)
            {
                logger.logIfHttpErrorRequest(url, args, data, response, token);
            }
        ).on('error',
            function (err) {
                logger.errorRequest('[workupBusiness.lock]Error', token);
                logger.errorRequest(err, token);
            }
        );
    };

    /*
    * Unlock the workup being used by user.
    * */
    workupBusiness.unlock = function(projectId, userId, token)
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
                project_id: projectId,
                user_id: userId,
                ssnid: token
            }
        };
        var url = config.restcall.url + '/' + service.name + '/' + methodName;
        client.get(url, args,
            function (data, response)
            {
                logger.logIfHttpErrorRequest(url, args, data, response, token);
            }
        ).on('error',
            function (err) {
                logger.errorRequest('[workupBusiness.unlock]Error', token);
                logger.errorRequest(err, token);
            }
        );
    };


    //Get the service details
    function getServiceDetails(serviceName) {
        return _.find(config.restcall.service, {name: serviceName});
    }

    workupBusiness.init = function (configDetails, log) {
        config = configDetails;
        client = config.restcall.client;
        logger = log;
    }

})(module.exports);