(function ()
{
    'use strict';

    angular
        .module('app.workup')
        .controller('WorkUpController', WorkUpController);
})();

/** @ngInject */
function WorkUpController($rootScope, $scope, $stateParams, $location, breadcrumbBusiness,
                          workupBusiness, templateBusiness, commonBusiness, dialog, store, clientConfig, $mdToast)
{
    var vm = this;

    $rootScope.passedUserId = $stateParams.userId;
    breadcrumbBusiness.title = 'Create WorkUp';
    if ($stateParams.token !== '') {
        $rootScope.passedToken = $stateParams.token;
    }

    workupBusiness.initialize($stateParams.token);


    clientConfig.socketInfo.socket.emit('init-socket', {
        token: $stateParams.token,
        userId: $stateParams.userId
    }, function(data)
    {
        workupBusiness.createWorkUp($stateParams.userId, $stateParams.companyId, $stateParams.templateId);
    });

    dialog.notify('Creating Workup', 'Go to Notification Center ',
        '<md-icon md-font-icon="icon-bell"></md-icon> <span> to open</span>',
        null,
        {
            ok: {
                callBack: function() {
                    var token =  store.get('x-session-token');
                    $location.url('/dashboard/'+ $stateParams.userId +'/'+token+'/'+ true);
                }
            }
        }, null, false);
}
