(function() {
    'use strict';

    angular
        .module('blocks.dialog')
        .factory('dialog', dialog);

    /* @ngInject */
    function dialog($mdDialog, $mdMedia) {
        var service = {
            confirm: confirm,
            alert: alert,
            custom: custom,
            status: status,
            close: close,
            notify: notify
        };

        return service;

        function close() {
            $mdDialog.hide();
        }

        function status(template, isOutsideClose, isFullScreen) {
            $mdDialog.show({
                templateUrl: template,
                clickOutsideToClose: isOutsideClose,
                fullscreen: isFullScreen
            });
        }

        /*
         Title:
         Content:
         Event:
         Action:{ok:{name:'',callBack:''}, cancel:{name:'', callBack:''}};
         */
        function confirm(title, content, event, action, customFullscreen, clickOutsideToClose)
        {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && customFullscreen;

            function confirmDialogController(){
                var vm = this;
                vm.title = title;
                vm.content = content;
                vm.cancelCallBack = cancelCallBack;
                vm.okCallBack = okCallBack;

                function cancelCallBack()
                {
                    $mdDialog.hide();
                    action.cancel.callBack.apply(this);
                }

                function okCallBack() {
                    $mdDialog.hide();
                    action.ok.callBack.apply(this);
                }
            }

            $mdDialog.show({
                templateUrl: 'app/blocks/dialog/dialog-confirm.html',
                parent: angular.element(document.body),
                targetEvent: event,
                controller: confirmDialogController,
                controllerAs: 'vm',
                bindToController: true,
                clickOutsideToClose: clickOutsideToClose || false,
                fullscreen: useFullScreen
            });
        }

        //Alert
        function alert(title, content, html,
                       event, action,
                       customFullscreen, clickOutsideToClose) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && customFullscreen;

            //Alert Dialog Controller
            function alertDialogController($compile) {
                var vm = this;
                vm.title = title;
                vm.content = content;
                vm.html = '<md-icon md-font-icon="icon-bell"></md-icon>';
                vm.okCallBack = okCallBack;

                //okCallBack method.
                function okCallBack() {
                    $mdDialog.hide();
                    if (action.ok && action.ok.callBack) {
                        action.ok.callBack.apply(this);
                    }
                }
            }

            $mdDialog.show({
                templateUrl: 'app/blocks/dialog/dialog-alert.html',
                parent: angular.element(document.body),
                targetEvent: event,
                controller: alertDialogController,
                controllerAs: 'vm',
                bindToController: true,
                clickOutsideToClose: clickOutsideToClose || false,
                fullscreen: useFullScreen
            });
        }

        function custom(title, content, event, action, customFullscreen, clickOutsideToClose)
        {
          var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && customFullscreen;

          function customDialogController()
          {
              var vm = this;
              vm.title = title;
              vm.content = content;
              vm.event = event;
              vm.cancelName = action && action.cancel && action.cancel.name;
              vm.okName = action && action.ok && action.ok.name;
              vm.cancelCallBack = cancelCallBack;
              vm.okCallBack = okCallBack;

              function cancelCallBack()
              {
                  $mdDialog.hide();
                  action.cancel.callBack.apply(this);
              }

              function okCallBack() {
                  $mdDialog.hide();
                  action.ok.callBack.apply(this);
              }
          }

            $mdDialog.show({
                templateUrl: 'app/blocks/dialog/dialog-custom.html',
                parent: angular.element(document.body),
                targetEvent: event,
                controller: customDialogController,
                controllerAs: 'vm',
                bindToController: true,
                clickOutsideToClose: clickOutsideToClose || false,
                fullscreen: useFullScreen
            });
        }

        function notify(title, content, html, event, action, customFullscreen, clickOutsideToClose) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && customFullscreen;

            function notifyDialogController($compile, $interval){
                var vm = this;
                vm.title = title;
                vm.okCallBack = okCallBack;

                addContent();

                function okCallBack() {
                    $mdDialog.hide();
                    if(action &&
                       action.ok && action.ok.callBack) {
                        action.ok.callBack.apply(this);
                    }
                }

                function addContent()
                {
                    var prom = $interval(function() {
                        var contentElem = angular.element(document.body).find('#md-dialog-content');
                        contentElem.append(content);
                        contentElem.append($compile(html)(vm));
                        $interval.cancel(prom);
                    }, 10);
                }
            }

            $mdDialog.show({
                templateUrl: 'app/blocks/dialog/dialog-notification.html',
                parent: angular.element(document.body),
                targetEvent: event,
                controller: notifyDialogController,
                controllerAs: 'vm',
                bindToController: true,
                clickOutsideToClose: clickOutsideToClose || false,
                fullscreen: useFullScreen
            });
        }
    }
}());
