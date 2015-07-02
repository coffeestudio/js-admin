/// <reference path="include/angular.d.ts"/>
/// <reference path="include/jqueryui.d.ts"/>
/// <amd-dependency path="angular-ui-router"/>
/// <amd-dependency path="angular-ui-sortable"/>
/// <amd-dependency path="jquery-ui"/>

import angular = require('angular');
import $ = require('jquery');

class Content {
    private static ngModule: angular.IModule = null;
    static module() {
        if (this.ngModule != null) return this.ngModule;
        this.ngModule = angular.module('coffeeContent', ['ui.router']);
        this.ngModule
        .config(['$stateProvider', '$locationProvider', function($stateProvider, $locationProvider) {
          $stateProvider
          .state('content-model', {
            url: '/model/:name',
            templateUrl: 'app/templates/content-model/list.html',
            controller: 'CoffeeModelContentCtrl'
          })
          .state('content-model.edit', {
            url: '/model/:name/:id/edit',
            templateUrl: 'app/templates/content-model/edit.html',
            controller: 'CoffeeModelContentEditCtrl'
          });

          $locationProvider.html5Mode(true);
        }])
        /* List */
        .controller('CoffeeModelContentCtrl', ['$scope', '$stateParams', '$coffee', ($scope, $stateParams, $coffee) => {
            angular.extend($scope, $stateParams);
            $coffee.model.get({name: $scope.name, method: 'getList'}, (data) => {
                $scope.rows = data.model;
            });
        }])
        /* Edit */
        .controller('CoffeeModelContentEditCtrl', ['$scope', '$stateParams', '$coffee', ($scope, $stateParams, $coffee) => {
            angular.extend($scope, $stateParams);
        }]);
        return this.ngModule;
    }
}

var mod = Content.module();
export = mod;
