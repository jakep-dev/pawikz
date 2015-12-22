/**
 * Created by sherindharmarajan on 11/12/15.
 */
(function ()
{
    'use strict';

    angular
        .module('app.blocks',
            [
               'blocks.interceptor',
               'blocks.logger',
               'blocks.dialog'
            ]);
})();
