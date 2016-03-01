(function ()
{
    'use strict';

    var fuseThemes = {
        'default'  : {
            primary   : {
                name: 'fuse-pale-blue',
                hues: {
                    'default': '700',
                    'hue-1'  : '500',
                    'hue-2'  : '600',
                    'hue-3'  : 'A100'
                }
            },
            accent    : {
                name: 'light-blue',
                hues: {
                    'default': '600',
                    'hue-1'  : '400',
                    'hue-2'  : '600',
                    'hue-3'  : 'A700'
                }
            },
            warn      : {name: 'red'},
            background: {
                name: 'grey',
                hues: {
                    'default': 'A100',
                    'hue-1'  : '100',
                    'hue-2'  : '50',
                    'hue-3'  : '300'
                }
            }
        },
        'pink': {
            primary   : {
                name: 'blue-grey',
                hues: {
                    'default': '800',
                    'hue-1'  : '600',
                    'hue-2'  : '400',
                    'hue-3'  : 'A100'
                }
            },
            accent    : {
                name: 'pink',
                hues: {
                    'default': '400',
                    'hue-1'  : '300',
                    'hue-2'  : '600',
                    'hue-3'  : 'A100'
                }
            },
            warn      : {name: 'blue'},
            background: {
                name: 'grey',
                hues: {
                    'default': 'A100',
                    'hue-1'  : '100',
                    'hue-2'  : '50',
                    'hue-3'  : '300'
                }
            }
        },
        'teal'     : {
        primary   : {
          name: 'fuse-blue',
          hues: {
            'default': '900',
            'hue-1'  : '600',
            'hue-2'  : '500',
            'hue-3'  : 'A100'
          }
        },
        accent    : {
          name: 'teal',
          hues: {
            'default': '500',
            'hue-1'  : '400',
            'hue-2'  : '600',
            'hue-3'  : 'A100'
          }
        },
        warn      : {name: 'deep-orange'},
        background: {
          name: 'grey',
          hues: {
            'default': 'A100',
            'hue-1'  : '100',
            'hue-2'  : '50',
            'hue-3'  : '300'
          }
        }
      },
        'advisen'     : {
        primary   : {
          name: 'fuse-pale-blue',
          hues: {
            'default': '900',
            'hue-1'  : '600',
            'hue-2'  : '500',
            'hue-3'  : 'A100'
          }
        },
        accent    : {
          name: 'orange',
          hues: {
            'default': '500',
            'hue-1'  : '400',
            'hue-2'  : '600',
            'hue-3'  : 'A100'
          }
        },
        warn      : {name: 'deep-orange'},
        background: {
          name: 'grey',
          hues: {
            'default': 'A100',
            'hue-1'  : '100',
            'hue-2'  : '50',
            'hue-3'  : '300'
          }
        }
      }
    };

    angular
        .module('app.core')
        .constant('fuseThemes', fuseThemes);
})();
