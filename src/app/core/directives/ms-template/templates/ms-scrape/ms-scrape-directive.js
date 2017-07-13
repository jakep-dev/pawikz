(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsScrapeController', MsScrapeController)
        .directive('msScrape', msScrapeDirective);

    /** @ngInject */
    function MsScrapeController($scope)
    {

    }

    /** @ngInject */
    function msScrapeDirective($compile, commonBusiness, templateService, templateBusinessFormat)
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@'
            },
            controller: 'MsScrapeController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-scrape/ms-scrape.html',
            link: function(scope, el, attrs)
            {
				scope.$parent.$parent.isprocesscomplete = false;
				var html = '';
				
				templateService.getScrapedHTML(commonBusiness.projectId, commonBusiness.stepId,
                    scope.mnemonicid, scope.itemid).then(function(response) {
                        
                        scope.$parent.$parent.isprocesscomplete = true;						
						el.find('#ms-scrape').append($compile(templateBusinessFormat.getScrapedHTML(scope, response))(scope));
					}
				);
            }
        };
    }

})();