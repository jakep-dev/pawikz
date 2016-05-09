(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msTextCurrency', msTextCurrencyValidation);

    /** @ngInject */
    function msTextCurrencyValidation()
    {
        return {
            require: 'ngModel',
            link: function(scope, el, attrs, ctrl)
            {
                ctrl.$parsers.push(function (data) {

                    if(data &&
                        data.trim() != '')
                    {
                        var pattern = /^[0-9]+$/;
                        var regExp = new RegExp(pattern);
                        if(regExp.test(data))
                        {
                            ctrl.$setViewValue(data);
                            ctrl.$render();
                            return data;
                        }
                        else
                        {
                            return 0;
                        }
                    }

                });

                ctrl.$formatters.push(function(data) {

                    return data;
                });
            }
        };
    }
})();