/**
 * Created by sherindharmarajan on 1/4/16.
 */
(function() {
    'use strict';

    angular
        .module('app.business')
        .service('commonBusiness', commonBusiness);

    /* @ngInject */
    function commonBusiness($rootScope, bottomSheetConfig) {
        this.projectId = null;
        this.userId = null;
        this.stepId = null;
        this.companyId = null;
        this.projectName = null;
        this.companyName = null;

        var isTemplateExpandAll = false;
		var isPrintableAll = false;

        var business = {
            emitMsg: emitMsg,
            onMsg: onMsg,
            defineBottomSheet: defineBottomSheet,
            goTop: goTop,
            resetBottomSheet: resetBottomSheet
        };

        Object.defineProperty(business, 'isTemplateExpandAll', {
            enumerable: true,
            configurable: false,
            get: function () {
                console.log('get!');
                return isTemplateExpandAll;
            },
            set: function (value) {
                isTemplateExpandAll = value;
                this.emitMsg('IsTemplateExpanded');
                console.log('set!');
            }
        });

        var isStepExpandAll = false;
        Object.defineProperty(business, 'isStepExpandAll', {
            enumerable: true,
            configurable: false,
            get: function () {
                return isStepExpandAll;
            },
            set: function (value) {
                isStepExpandAll = value;
                this.emitMsg('IsStepExpanded');
            }
        });
		
		Object.defineProperty(business, 'isPrintableAll', {
            enumerable: true,
            configurable: false,
            get: function () {
                console.log('get!');
                return isPrintableAll;
            },
            set: function (value) {
                isPrintableAll = value;
                this.emitMsg('IsPrintable');
                console.log('set!');
            }
        });

        return business;

        function goTop(elem)
        {
            var element = $('#'.concat(elem)).parents('[ms-scroll]');

            if (element && element.length > 0) {
                var objScroll = element[0];

                if(objScroll) {
                    $(objScroll).scrollTop(0);
                }
            }
        }

        function defineBottomSheet(url, scope, isBottomSheet)
        {
            $rootScope.isBottomSheet = isBottomSheet;
            bottomSheetConfig.url = url;
            bottomSheetConfig.controller = scope;
        }

        function resetBottomSheet()
        {
            $rootScope.isBottomSheet = false;
            bottomSheetConfig.url = '';
            bottomSheetConfig.controller = '';
        }

        function onMsg(msg, scope, func) {
            var unbind = $rootScope.$on(msg, func);
            scope.$on('$destroy', unbind);
        };

        function emitMsg (msg) {
            console.log("Emitting changed event");
            $rootScope.$emit(msg);
        };

    }
})();
