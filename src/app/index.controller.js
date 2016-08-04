(function ()
{
    'use strict';

    angular
        .module('advisen')
        .controller('AppController', AppController);

    /** @ngInject */
    function AppController(fuseTheming, $scope, dialog,  $mdDialog,
                           $location, authService, Idle, toast, store)
    {
        var vm = this;

        // Data
        vm.themes = fuseTheming.themes;


        $scope.$on('IdleStart', function() {
            console.log('Idle Start');

            var actions = {
                ok:{
                    name:'',
                    callBack:function()
                    {

                    }
                },
                cancel:
                {
                    name:'',
                    callBack:function()
                    {
                    }
                }
            };

            dialog.confirm("You're Idle. Do Something!", "You'll be logged out in 30 seconds", null, actions);
        });


        $scope.$on('IdleEnd', function() {
            $mdDialog.hide();
        });


        $scope.$on('IdleTimeout', function() {
            Idle.unwatch();
            $location.url('/pages/auth/login');
            $mdDialog.hide();
            authService.logout().then(function(response)
            {

                store.remove('x-session-token');
                store.remove('user-info');
                toast.simpleToast('Session timed out');
            });

        });
        //////////
    }
})();