(function () {
    'use strict';

    var fusePalettes = [
        {
            name: 'fuse-blue',
            options: {
                '50': '#ebf1fa',
                '100': '#c2d4ef',
                '200': '#9ab8e5',
                '300': '#78a0dc',
                '400': '#5688d3',
                '500': '#3470ca',
                '600': '#2e62b1',
                '700': '#275498',
                '800': '#21467e',
                '900': '#1a3865',
                'A100': '#c2d4ef',
                'A200': '#9ab8e5',
                'A400': '#5688d3',
                'A700': '#275498',
                'contrastDefaultColor': 'light',
                'contrastDarkColors': '50 100 200 A100',
                'contrastStrongLightColors': '300 400'
            }
        },
        {
            name: 'fuse-pale-blue',
            options: {
                '50': '#ececee',
                '100': '#c5c6cb',
                '200': '#9ea1a9',
                '300': '#7d818c',
                '400': '#5c616f',
                '500': '#3c4252',
                '600': '#353a48',
                '700': '#2d323e',
                '800': '#262933',
                '900': '#1e2129',
                'A100': '#c5c6cb',
                'A200': '#9ea1a9',
                'A400': '#5c616f',
                'A700': '#2d323e',
                'contrastDefaultColor': 'light',
                'contrastDarkColors': '50 100 200 A100',
                'contrastStrongLightColors': '300 400'
            }
        },
		{
            name : 'blue',
            options:{
                '50': '#0d373d',
                '100': '#114a52',
                '200': '#155d67',
                '300': '#1a707d',
                '400': '#1e8392',
                '500': '#2396a7',
                '600': '#2bbcd1',
                '700': '#3fc4d7',
                '800': '#54cadc',
                '900': '#69d1e0',
                'A100': '#2bbcd1',
                'A200': '#27a9bc',
                'A400': '#2396a7',
                'A700': '#7ed7e4'
            }
        },
        {
            name : 'green',
            options:{
                '50': '#4e5e16',
                '100': '#60731a',
                '200': '#71881f',
                '300': '#829d24',
                '400': '#93b129',
                '500': '#a5c62d',
                '600': '#b9d750',
                '700': '#c1dc64',
                '800': '#cae079',
                '900': '#d2e58e',
                'A100': '#b9d750',
                'A200': '#b1d23b',
                'A400': '#a5c62d',
                'A700': '#daeaa3'
            }
        } 
		
    ];

    angular
        .module('app.core')
        .constant('fusePalettes', fusePalettes);
})();