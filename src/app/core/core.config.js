(function ()
{
    'use strict';

    angular
        .module('app.core')
        .config(config);

    /** @ngInject */
    function config($ariaProvider, $logProvider, msScrollConfigProvider, $translateProvider,
                    $provide, fuseConfigProvider, $compileProvider, $mdDateLocaleProvider)
    {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|blob):/);

        // ng-aria configuration
        $ariaProvider.config({
            tabindex: false
        });

        // Enable debug logging
        $logProvider.debugEnabled(true);

        // msScroll configuration
        msScrollConfigProvider.config({
            wheelPropagation: true
        });

        // toastr configuration
        toastr.options.timeOut = 3000;
        toastr.options.positionClass = 'toast-top-right';
        toastr.options.preventDuplicates = true;
        toastr.options.progressBar = true;

        // angular-translate configuration
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: '{part}/i18n/{lang}.json'
        });
        $translateProvider.preferredLanguage('en');
        $translateProvider.useSanitizeValueStrategy('sanitize');

        // Text Angular options
        $provide.decorator('taOptions', [
            '$delegate', function (taOptions)
            {
                taOptions.toolbar = [
                    ['bold', 'italics', 'underline', 'ul', 'ol', 'quote']
                ];

                taOptions.classes = {
                    focussed           : 'focussed',
                    toolbar            : 'ta-toolbar',
                    toolbarGroup       : 'ta-group',
                    toolbarButton      : 'md-button',
                    toolbarButtonActive: 'active',
                    disabled           : '',
                    textEditor         : 'form-control',
                    htmlEditor         : 'form-control'
                };

                return taOptions;
            }
        ]);

        // Text Angular tools
        $provide.decorator('taTools', [
            '$delegate', function (taTools)
            {
                taTools.bold.iconclass = 'icon-format-bold';
                taTools.italics.iconclass = 'icon-format-italic';
                taTools.underline.iconclass = 'icon-format-underline';
                taTools.ul.iconclass = 'icon-format-list-bulleted';
                taTools.ol.iconclass = 'icon-format-list-numbers';
                taTools.quote.iconclass = 'icon-format-quote';

                return taTools;
            }
        ]);

        // Fuse theme configurations
        fuseConfigProvider.config({
            'disableCustomScrollbars'        : false,
            'disableCustomScrollbarsOnMobile': true,
            'disableMdInkRippleOnMobile'     : false,
            'disableMdInkRippleOnIE'         : true
        });

        //Chart begin and end date range need the flexibility to enter 1 or 01 for month and day portion of the date
        $mdDateLocaleProvider.formatDate = function (date) {
            return moment(date).format('M/D/YYYY');
        };

        $mdDateLocaleProvider.parseDate = function (dateString) {
            var m = moment(dateString, 'M/D/YYYY', true);
            return m.isValid() ? m.toDate() : new Date(NaN);
        }
    }
})();