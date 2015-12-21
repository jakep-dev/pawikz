(function() {
    'use strict';

    angular
        .module('blocks.dialog')
        .factory('dialog', dialog);

    dialog.$inject = ['$mdDialog', '$mdMedia'];

    /* @ngInject */
    function dialog($mdDialog, $mdMedia) {
        var service = {
            confirm: confirm,
            alert: alert,
            custom: custom
        }

        return service;

        /*
         Title:
         Content:
         Event:
         Action:{ok:{name:'',callBack:''}, cancel:{name:'', callBack:''}};
         */
        function confirm(title, content, event, action)
        {
            console.log(action);

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
        function alert(title, content, event, element, action)
        {
            var parentElement = angular.element(document.querySelector('#'+element));
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(parentElement)
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

          function customDialogController()
          {
              console.log('Inside CustomDialog Controller');
              var vm = this;
              vm.title = title;
              vm.content = content;
              vm.event = event;
              vm.cancelName = action.cancel.name;
              vm.okName = action.ok.name;
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
                controllerAs: 'ctrl',
                bindToController: true,
                clickOutsideToClose:false,
                fullscreen: useFullScreen
            })
        }
    }
}());
