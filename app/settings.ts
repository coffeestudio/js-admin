/// <reference path="include/angular.d.ts"/>
/// <reference path="include/jqueryui.d.ts"/>
/// <amd-dependency path="angular-ui-router"/>
/// <amd-dependency path="angular-ui-sortable"/>

import angular = require('angular');

class Settings {
    private static ngModule: angular.IModule = null;
    static module() {
        if (this.ngModule != null) return this.ngModule;
        this.ngModule = angular.module('coffeeSettings', ['ui.router', 'coffeeContent']);
        this.ngModule
        .config(['$stateProvider', '$locationProvider', function($stateProvider, $locationProvider) {
          $stateProvider
          .state('content-settings', {
              url: '/settings/',
              views: {
                  'content@' : {
                      templateUrl: 'app/templates/content-settings/settings.html',
                      controller: 'CoffeeSettingsCtrl'
                  }
              }
          });

          $locationProvider.html5Mode(true);
        }])
        .controller('CoffeeSettingsCtrl', ['$scope', '$coffee', ($scope, $coffee) => {
            $coffee.config.getValue({section: 'admin', subsection: 'settingsModel'}, (data) => {
                var sModel = data.value;
                $coffee.model.get({name: sModel, method: 'getList'}, (data) => {
                    $scope.rows = data.model;
                });
            });
        }])
        ;
        return this.ngModule;
    }
}

var mod = Settings.module();
export = mod;
