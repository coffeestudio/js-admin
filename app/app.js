/// <reference path="include/jquery.d.ts"/>
/// <reference path="include/angular.d.ts"/>
/// <amd-dependency path="angular-animate"/>
define(["require", "exports", "jquery", 'angular', 'widgets/widgets', 'layout', 'elements', 'coffee-rest', 'content', "angular-animate"], function (require, exports, $, angular, widgets, layout, elements, rest, content) {
    angular.bootstrap($('body'), [layout.name, elements.name, widgets.name, rest.name, content.name, 'ngAnimate']);
    console.log('Welcome to the CoffeeStudio admin system!');
});
