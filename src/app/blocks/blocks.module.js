/**
 * Created by sherindharmarajan on 11/12/15.
 */
(function ()
{
    'use strict';

    angular
        .module('app.blocks',
            [
               'blocks.logger',
               'blocks.toast',
               'blocks.dialog',
               'blocks.trace',
               'blocks.exception',
               'blocks.interceptor'
            ]);
})();
