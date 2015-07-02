/// <reference path="include/angular.d.ts"/>
/// <reference path="include/jqueryui.d.ts"/>
/// <amd-dependency path="angular-ui-router"/>
/// <amd-dependency path="angular-ui-sortable"/>
/// <amd-dependency path="jquery-ui"/>
/// <amd-dependency path="slidebars"/>
define(["require", "exports", 'angular', 'jquery', "angular-ui-router", "angular-ui-sortable", "jquery-ui", "slidebars"], function (require, exports, angular, $) {
    var Layout = (function () {
        function Layout() {
        }
        Layout.module = function () {
            if (this.ngModule != null)
                return this.ngModule;
            this.ngModule = angular.module('coffeeLayout', ['ui.router']);
            this.ngModule.config(['$stateProvider', '$locationProvider', function ($stateProvider, $locationProvider) {
                $stateProvider.state('main', {
                    url: '/',
                    templateUrl: 'app/templates/main.content.html',
                    controller: 'CoffeeMainContentCtrl'
                });
                $locationProvider.html5Mode(true);
            }]).controller('CoffeeSidebarCtrl', ['$scope', '$element', function ($scope, $element) {
                /* TODO: rewrite with angular-ui */
                /*            $element.resizable({
                                handles: 'e',
                                maxWidth: 350,
                                minWidth: 240
                            });
                            $element.find('> .scrollable').css({height: ($element.height() - 50)})*/
            }]).controller('CoffeeHeaderCtrl', ['$scope', '$coffee', function ($scope, $coffee) {
                $coffee.config.get({ section: 'meta' }, function (data) {
                    //angular.extend($scope, data);
                    $scope.siteTitle = data.siteTitle;
                });
            }]).controller('CoffeeMainContentCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
            }]);
            return this.ngModule;
        };
        Layout.ngModule = null;
        return Layout;
    })();
    var mod = Layout.module();
    /* TODO: Move to angular */
    $(document).ready(function () {
        $(window).resize(function () {
            var sideWidth = $('#aside').width();
            $('.adm-container').css({
                'padding-left': sideWidth,
                'padding-top': $('header').height()
            });
            $('.logotype').width(sideWidth);
            $('.head-blocks').css({ 'margin-left': sideWidth });
            $('.scrollable').css({ height: ($('#aside').height() - 50) });
        });
        $('.adm-container').css({ 'padding-top': $('header').height() });
        var mySlidebars = new $.slidebars();
        $('.adm-handle').on('click', function () {
            mySlidebars.slidebars.toggle('left');
        });
        var parent, ink, d, x, y;
    });
    return mod;
});
