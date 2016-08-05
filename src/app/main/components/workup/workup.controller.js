(function ()
{
    'use strict';

    angular
        .module('app.workup')
        .controller('WorkUpController', WorkUpController);
})();

/** @ngInject */
function WorkUpController($rootScope, $scope, $stateParams, $location, breadcrumbBusiness,
                          workupBusiness, workupService, toast, store, clientConfig, $mdToast)
{
    var vm = this;

    $rootScope.passedUserId = $stateParams.userId;
    breadcrumbBusiness.title = 'Create WorkUp';
    if ($stateParams.token != '') {
        $rootScope.passedToken = $stateParams.token;
    }

    workupBusiness.initialize($stateParams.token);
    workupService.create($stateParams.userId, $stateParams.companyId, $stateParams.templateId);

    toast.simpleToast('Creating new workup in progress. Use notification center for updates');

    var token =  store.get('x-session-token');
    $location.url('/dashboard/'+ $stateParams.userId +'/'+token+'/'+ true);

    clientConfig.socketInfo.on('notify-create-workup-status', function(data)
    {
        console.log('Notify-WorkUp-Status');
        $rootScope.toastTitle = 'WorkUp Creation Completed!';
        $rootScope.toastProjectId = data.projectId;
        $mdToast.show({
            hideDelay: 5000,
            position: 'bottom right',
            controller: 'WorkUpToastController',
            templateUrl: 'app/main/components/workup/toast/workup.toast.html'
        });
    });
}
