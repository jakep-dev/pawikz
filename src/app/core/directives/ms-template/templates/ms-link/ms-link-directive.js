(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsLinkController', MsLinkController)
        .directive('msLink', msLinkDirective);

    /** @ngInject */
    function MsLinkController($scope, $window, overviewBusiness, stepsBusiness)
    {
        $scope.openInNewTab = openInNewTab;
        $scope.openLink = openLink;


        function openInNewTab(url) {
            var win = $window.open(url, '_blank');
            win.focus();
        }

        function openLink(){
            var step = null;
            
            if($scope.gotostep && $scope.gotostep.match(/\d/g))
            {
                step = $scope.gotostep.match(/\d/g).join("");
            }
            
            if(step && step.length > 0){
                goToStep(step);
            }else{
                openInNewTab($scope.href);
                
            }
        }
        
        function goToStep(step){
            if(overviewBusiness.templateOverview &&
                overviewBusiness.templateOverview.steps)
            {
                stepsBusiness.goToStep(step, overviewBusiness.templateOverview.steps);
            }
        }
    }

    /** @ngInject */
    function msLinkDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                value: '@',
                href: '@',
                isdisabled: '=?',
                gotostep: '@'
            },
            controller: 'MsLinkController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-link/ms-link.html'
        };
    }
})();