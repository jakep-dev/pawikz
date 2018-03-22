(function ()
{
    'use strict';

    angular
        .module('app.workup')
        .controller('WorkUpController', WorkUpController);
})();

/** @ngInject */
function WorkUpController($rootScope, $scope, $stateParams, $location, breadcrumbBusiness,
                          workupBusiness, templateBusiness, notificationBusiness,
                          commonBusiness, dialog, store, clientConfig, $mdToast)
{
    var vm = this;

    $rootScope.passedUserId = $stateParams.userId;
    breadcrumbBusiness.title = 'Create WorkUp';
    if ($stateParams.token !== '') {
        $rootScope.passedToken = $stateParams.token;
    }

    workupBusiness.initialize($stateParams.token);
    notificationBusiness.listenToSocket($stateParams.token, $stateParams.userId);
    console.log('Initiate Create Workup for user - ', $stateParams.userId);

    clientConfig.socketInfo.socket.emit('init-socket', {
        token: $stateParams.token,
        userId: $stateParams.userId
    }, function(data)
    {
        console.log('Calling CreateWorkup for companyId - ', $stateParams.companyId , ' templateId - ', $stateParams.templateId);
        workupBusiness.createWorkUp($stateParams.userId, $stateParams.companyId, $stateParams.templateId);
    });
}
