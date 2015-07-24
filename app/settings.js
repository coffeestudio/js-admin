/// <reference path="include/angular.d.ts"/>
/// <reference path="include/jqueryui.d.ts"/>
/// <amd-dependency path="angular-ui-router"/>
/// <amd-dependency path="angular-ui-sortable"/>
define(["require", "exports", 'angular', "angular-ui-router", "angular-ui-sortable"], function (require, exports, angular) {
    var Settings = (function () {
        function Settings() {
        }
        Settings.module = function () {
            if (this.ngModule != null)
                return this.ngModule;
            this.ngModule = angular.module('coffeeSettings', ['ui.router', 'coffeeContent']);
            this.ngModule.config(['$stateProvider', '$locationProvider', function ($stateProvider, $locationProvider) {
                $stateProvider.state('content-settings', {
                    url: '/settings/',
                    views: {
                        'content@': {
                            templateUrl: 'app/templates/content-settings/settings.html',
                            controller: 'CoffeeSettingsCtrl'
                        }
                    }
                });
                $locationProvider.html5Mode(true);
            }]).controller('CoffeeSettingsCtrl', ['$scope', '$coffee', function ($scope, $coffee) {
                $coffee.config.getValue({ section: 'admin', subsection: 'settingsModel' }, function (data) {
                    var sModel = data.value;
                    $coffee.model.get({ name: sModel, method: 'getList' }, function (data) {
                        $scope.rows = data.model;
                    });
                });
            }]);
            return this.ngModule;
        };
        Settings.ngModule = null;
        return Settings;
    })();
    var mod = Settings.module();
    return mod;
});
