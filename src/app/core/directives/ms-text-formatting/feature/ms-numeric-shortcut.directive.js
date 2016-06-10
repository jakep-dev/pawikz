(function () {
    'use strict';

    angular.module('app.core')
    .directive('numericShortcut', function ($parse, $filter) {
        return {
            restrict: 'A',
            link: function (scope, element, attibutes) {
                element.bind('keyup', function () {
                    var inputVal = $.trim($(this).val());
                    var regEx = /^[0-9]+\.?[0-9]*[kKmMbB]$/;
                    if (regEx.test(inputVal)) {
                        var abbreviationType = inputVal.slice(-1);
                        var longValue = Number(inputVal.substring(0, inputVal.length - 1));
                        if (!isNaN(longValue))
                        switch (abbreviationType) {
                            case 'K':
                            case 'k':
                                longValue *= 1000;
                                break;
                            case 'M':
                            case 'm':
                                longValue *= 1000000;
                                break;
                            case 'B':
                            case 'b':
                                longValue *= 1000000000;
                                break;
                            default:
                                break;
                        }
                        var parsed;

                        var finalValue = $filter("currency")(longValue, '', 0);

                        //Update ng-Model if it is defined
                        parsed = $parse(attibutes.ngModel);
                        if (parsed)
                        {
                            scope.$apply(function () {
                                parsed.assign(scope, finalValue);
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
    });
})();