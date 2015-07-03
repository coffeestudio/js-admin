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
            url: '/:id/edit',
            templateUrl: 'app/templates/content-model/edit.html',
            controller: 'CoffeeModelContentEditCtrl'
          });

          $locationProvider.html5Mode(true);
        }])
        /* List */
        .controller('CoffeeModelContentCtrl', ['$scope', '$stateParams', '$coffee', ($scope, $stateParams, $coffee) => {
            angular.extend($scope, $stateParams);
            $coffee.lang.getValue({section: 'models', subsection: $scope.name}, (data) => {
                $scope.modelTitle = data.value;
            });
            $coffee.model.get({name: $scope.name, method: 'getList', fieldset: '@listView'}, (data) => {
                $scope.rows = data.model;
                if ($scope.rows.length > 0) {
                    $coffee.lang.get({section: 'fields', subsection: $scope.name}, (data) => {
                        var ths = {};
                        for (var k in $scope.rows[0]) {
                            if (k == '$$hashKey') continue;
                            ths[k] = data[k];
                        }
                        $scope.ths = ths;
                    });
                }
            });
            $scope.makeEditSref = (row) => {
                var params = angular.toJson({id: row.id});
                return 'content-model.edit('+params+')';
            }
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
