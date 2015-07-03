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
              views: {
                  'content@' : {
                      templateUrl: 'app/templates/content-model/list.html',
                      controller: 'CoffeeModelContentCtrl'
                  }
              }
          })
          .state('content-model.edit', {
              url: '/:id/edit',
              views: {
                  'content@': {
                      templateUrl: 'app/templates/content-model/edit.html',
                      controller: 'CoffeeModelContentEditCtrl'
                  }
              }
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
            $coffee.lang.getValue({section: 'models', subsection: $scope.name}, (data) => {
                $scope.modelTitle = data.value;
            });
            $coffee.model.get({name: $scope.name, method: 'get', fieldset: '@editView', id: $stateParams.id}, (data) => {
                if (data.model.length > 0) {
                    $scope.object = data.model[0];
                    $scope.types = data.types;
                    $coffee.lang.get({section: 'fields', subsection: $scope.name}, (data) => {
                        var labels = {};
                        for (var k in $scope.object) {
                            if (k == '$$hashKey') continue;
                            labels[k] = data[k];
                        }
                        $scope.labels = labels;
                    });
                }
            });
        }])
        .directive('coffeeInput', () => {
            return {
                restrict: 'E'
                , replace: true
                , scope: { name: '@', value: '@', type: '@' }
                , link: (scope: any, elem, attr) => {
                    var tpl: string;
                    switch (scope.type) {
                        case 'boolean':
                            var ck = {'true': '', 'false': ''};
                            ck[scope.value] = ' checked="true"';
                            tpl = '<label class="bool"><input'+ck['true']+' type="radio" name="'+scope.name+'" value="1"/> да</label>' +
                                  '<label class="bool"><input'+ck['false']+' type="radio" name="'+scope.name+'" value="0"/> нет</label>';
                            break;
                        case 'text':
                            tpl = '<textarea name="'+scope.name+'">'+scope.value+'</textarea>';
                            break;
                        default:
                            tpl = '<input type="text" name="'+scope.name+'" value="'+scope.value+'"/>';
                    }
                    elem.append(tpl);
                }
            };
        })
        ;
        return this.ngModule;
    }
}

var mod = Content.module();
export = mod;
