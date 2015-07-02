/// <reference path="include/require.d.ts"/>
requirejs.config({
    paths: {
        'angular': 'components/angular/angular.min',
        'angular-animate': 'components/angular-animate/angular-animate.min',
        'angular-resource': 'components/angular-resource/angular-resource.min',
        'angular-ui-router': 'components/angular-ui-router/release/angular-ui-router.min',
        'angular-ui-sortable': 'components/angular-ui-sortable/sortable.min',
        'jquery': 'components/jquery/dist/jquery.min',
        'jquery-ui': 'components/jquery-ui/jquery-ui.min',
        'slidebars': 'components/slidebars/dist/slidebars.min'
    },
    shim: {
        'angular': {
            exports: 'angular'
        },
        'angular-animate': {
            deps: ['angular']
        },
        'angular-resource': {
            deps: ['angular']
        },
        'angular-ui-router': {
            deps: ['angular']
        },
        'angular-ui-sortable': {
            deps: ['jquery-ui', 'angular']
        },
        'jquery-ui': {
            export: '$',
            deps: ['jquery']
        },
        'slidebars': {
            deps: ['jquery']
        }
    }
});

require(['app']);
