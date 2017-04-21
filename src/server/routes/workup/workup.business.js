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

        logger.debug('Lock projectId- ' + projectId + ' userId- ' + userId + ' token- ' + token);
        var url = config.restcall.url + '/' + service.name + '/' + methodName;
        client.get(url, args,
            function (data, response)
            {
                logger.logIfHttpError(url, args, data, response);
            }
        ).on('error',
            function (err) {
                logger.error('[workupBusiness.lock]Error');
                logger.error(err);
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
                logger.logIfHttpError(url, args, data, response);
            }
        ).on('error',
            function (err) {
                logger.error('[workupBusiness.unlock]Error');
                logger.error(err);
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