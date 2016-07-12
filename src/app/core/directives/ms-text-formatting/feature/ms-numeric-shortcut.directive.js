(function () {
    'use strict';

    angular.module('app.core')
    .directive('numericShortcut', msNumericShortcutDirective);

    function msNumericShortcutDirective($parse, templateBusiness, $filter)
    {
        return {
            restrict: 'A',
            link: function (scope, element, attibutes) {
                element.bind('keyup', function () {
                    var inputVal = $.trim($(this).val());
                    var iskmb = attibutes.numericShortcut;
                    if (templateBusiness.isKMBValue(inputVal, iskmb))
                    {
                        var outputVal = templateBusiness.transformKMB(inputVal);

                        //Update ng-Model if it is defined
                        var parsed;
                        parsed = $parse(attibutes.ngModel);
                        if (parsed)
                        {
                            scope.$apply(function () {
                                parsed.assign(scope, outputVal);
                            });
                        }

                        //Call ng-Change if it is defined
                        parsed = $parse(attibutes.ngChange);
                        if (parsed) {
                            scope.$eval(parsed);
                        }

                        //Trigger $watch on changed values within the current scope
                        scope.$digest();
                    }
                });
            }
        }
    }
})();