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
            close: close
        };

        return service;

        function close()
        {
            $mdDialog.hide();
        }

        function status(template, isOutsideClose, isFullScreen)
        {
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
        function confirm(title, content, event, action)
        {
            var confirmDialog = $mdDialog.confirm()
                                        .title(title)
                                        .content(content)
                                        .targetEvent(event)
                                        .ok(action.ok.name)
                                        .cancel(action.cancel.name);

            $mdDialog.show(confirmDialog).then(function() {
                action.ok.callBack.apply(this);
            }, function() {
                action.cancel.callBack.apply(this);
            });
        }

        //Alert
        function alert(title, content, event, action)
        {
            $mdDialog.show(
                $mdDialog.alert()
                   // .parent(parentElement)
                    .clickOutsideToClose(true)
                    .title(title)
                    .content(content)
                    .ok(action.ok.name)
                    .targetEvent(event)
            );
        }

        function custom(title, content, event, action, customFullscreen)
        {
          var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && customFullscreen;

          function customDialogController($scope, $compile)
          {
              var vm = this;
              vm.title = title;
              vm.content = content;
              vm.event = event;
              vm.cancelName = action.cancel && action.cancel.name;
              vm.okName = action.ok && action.ok.name;
              vm.cancelCallBack = cancelCallBack;
              vm.okCallBack = okCallBack;

              function cancelCallBack()
              {
                  $mdDialog.hide();
                  action.cancel.callBack.apply(this);
              }

              function okCallBack()
              {
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
                clickOutsideToClose:false,
                fullscreen: useFullScreen
            });
        }
    }
}());
