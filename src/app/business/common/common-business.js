/**
 * Created by sherindharmarajan on 1/4/16.
 */
(function() {
    'use strict';

    angular
        .module('app.common.business', [])
        .service('commonBusiness', commonBusiness);

    /* @ngInject */
    function commonBusiness($rootScope, bottomSheetConfig) {
        this.projectId = null;
        this.userId = null;
        this.stepId = null;
        this.companyId = null;
        this.prevcompanyId = null;
        this.projectName = null;
        this.companyName = null;

        var isTemplateExpandAll = false;
		var isPrintableAll = false;

        var business = {
            emitMsg: emitMsg,
            onMsg: onMsg,
            emitWithArgument: emitWithArgument,
            defineBottomSheet: defineBottomSheet,
            goTop: goTop,
            resetBottomSheet: resetBottomSheet,
            socketType: socketType
        };

        Object.defineProperty(business, 'isTemplateExpandAll', {
            enumerable: true,
            configurable: false,
            get: function () {
                return isTemplateExpandAll;
            },
            set: function (value) {
                isTemplateExpandAll = value;
                this.emitMsg('IsTemplateExpanded');
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
                return isPrintableAll;
            },
            set: function (value) {
                isPrintableAll = value;
                this.emitMsg('IsPrintable');
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
        }

        function emitMsg (msg) {
            $rootScope.$emit(msg);
        }

        function emitWithArgument(msg, arg)
        {
            $rootScope.$emit(msg, arg);
        }

        function socketType(toState)
        {
            if(toState &&
                (toState.name === 'app.dashboard' || toState.name === 'app.myWork'))
            {
                return 'workup';
            }

            return '';
        }

    }
})();
