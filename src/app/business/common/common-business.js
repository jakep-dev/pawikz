/**
 * Created by sherindharmarajan on 1/4/16.
 */
(function() {
    'use strict';

    angular
        .module('app.common.business', [])
        .service('commonBusiness', commonBusiness);

    /* @ngInject */
    function commonBusiness($rootScope, bottomSheetConfig, Papa, deviceDetector, toast) {
        this.projectId = null;
        this.userId = null;
        this.stepId = null;
        this.stepName = null;
        this.companyId = null;
        this.prevcompanyId = null;
        this.projectName = null;
        this.companyName = null;

        var isTemplateExpandAll = false;
		var isPrintableAll = false;
        var isStepExpandAll = false;
        var isPrevDisabled = false;
        var isNextDisabled = false;

        var business = {
            emitMsg: emitMsg,
            onMsg: onMsg,
            emitWithArgument: emitWithArgument,
            broadCastMsg: broadCastMsg,
            broadCastWithArgument: broadCastWithArgument,
            defineBottomSheet: defineBottomSheet,
            goTop: goTop,
            resetBottomSheet: resetBottomSheet,
            socketType: socketType,
            explicitDownloadToCsv: explicitDownloadToCsv
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
                if(isPrintableAll){
                    toast.simpleToast('Section will show on pdf download');
                } else {
                    toast.simpleToast('Section will not show on pdf download');
                }
                this.emitMsg('IsPrintable');
            }
        });

        Object.defineProperty(business, 'isPrevDisabled', {
            enumerable: true,
            configurable: false,
            get: function () {
                return isPrevDisabled;
            },
            set: function (value) {
                isPrevDisabled = value;
                this.emitMsg('IsPrevDisabled');
            }
        });

        Object.defineProperty(business, 'isNextDisabled', {
            enumerable: true,
            configurable: false,
            get: function () {
                return isNextDisabled;
            },
            set: function (value) {
                isNextDisabled = value;
                this.emitMsg('IsNextDisabled');
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

        function broadCastMsg(msg) {
            $rootScope.$broadcast(msg);
        }

        function broadCastWithArgument(msg, arg) {
            $rootScope.$broadcast(msg, arg);
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

        //Explicit download to csv
        function explicitDownloadToCsv(headers, rows, elem, fileName){
            var csvData = Papa.unparse({
                fields: headers,
                data: rows
            });

            if(!csvData || !elem || elem.length === 0 || !fileName){
                return;
            }

            if (deviceDetector.browser === 'ie') {
                window.navigator.msSaveOrOpenBlob(new Blob([csvData], {type: "text/plain;charset=utf-8;"}), fileName);
            }else {
                elem[0].download = fileName;
                elem[0].href = 'data:application/csv,' + escape(csvData);
                elem[0].click();
            }
            toast.simpleToast('Finished downloading - ' + fileName);
        }
    }
})();
