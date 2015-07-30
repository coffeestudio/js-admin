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
            }]).controller('CoffeeSettingsCtrl', ['$scope', '$coffee', '$notify', function ($scope, $coffee, $notify) {
                $coffee.config.getValue({ section: 'admin', subsection: 'settingsModel' }, function (data) {
                    var sModel = data.value;
                    $coffee.model.get({ name: sModel, method: 'getList' }, function (data) {
                        $scope.rows = data.model;
                    });
                    $scope.save = function (settings) {
                        var data = {};
                        for (var i in settings) {
                            data[settings[i].id] = settings[i].value;
                        }
                        $coffee.model.save({ name: sModel, method: 'updateStorage' }, data, function (data) {
                            if (data.type == 'value' && data.value == true) {
                                $notify.push('Сохранено', true);
                            }
                            else {
                                $notify.push('Ошибка', false);
                            }
                        });
                    };
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
