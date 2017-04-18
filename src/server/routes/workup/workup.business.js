(function(workupBusiness) {

    var _ = require('underscore');
    var config;
    var client;

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

        console.log('Lock projectId- ' + projectId + ' userId- ' + userId + ' token- ' + token);
        client.get(config.restcall.url + '/' +  service.name  + '/' + methodName, args,function(data, response)
        {

        });
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

        client.get(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data, response)
        {

        });
    };


    //Get the service details
    function getServiceDetails(serviceName) {
        return _.find(config.restcall.service, {name: serviceName});
    }

    workupBusiness.init = function (configDetails) {
        config = configDetails;
        client = config.restcall.client;
    }

})(module.exports);