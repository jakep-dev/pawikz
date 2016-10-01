(function ()
{
    'use strict';

    angular
        .module('app.workup')
        .controller('WorkUpController', WorkUpController);
})();

/** @ngInject */
function WorkUpController($rootScope, $scope, $stateParams, $location, breadcrumbBusiness,
                          workupBusiness, templateBusiness, commonBusiness, toast, store, clientConfig, $mdToast)
{
    var vm = this;

    $rootScope.passedUserId = $stateParams.userId;
    breadcrumbBusiness.title = 'Create WorkUp';
    if ($stateParams.token != '') {
        $rootScope.passedToken = $stateParams.token;
    }

    workupBusiness.initialize($stateParams.token);


    clientConfig.socketInfo.socket.emit('init-socket', {
        token: $stateParams.token,
        userId: $stateParams.userId
    }, function(data)
    {
        templateBusiness.listenToWorkUpStatus();
        workupBusiness.createWorkUp($stateParams.userId, $stateParams.companyId, $stateParams.templateId);
    });




    toast.simpleToast('Creating new workup in progress. Use notification center for updates');

    var token =  store.get('x-session-token');
    $location.url('/dashboard/'+ $stateParams.userId +'/'+token+'/'+ true);
}
