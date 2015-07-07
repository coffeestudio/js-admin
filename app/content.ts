/// <reference path="include/angular.d.ts"/>
/// <reference path="include/jqueryui.d.ts"/>
/// <amd-dependency path="angular-ui-router"/>
/// <amd-dependency path="angular-ui-sortable"/>
/// <amd-dependency path="jquery-ui"/>
/// <amd-dependency path="ng-ckeditor"/>

import angular = require('angular');
import $ = require('jquery');

class Content {
    private static ngModule: angular.IModule = null;
    static module() {
        if (this.ngModule != null) return this.ngModule;
        this.ngModule = angular.module('coffeeContent', ['ui.router', 'ngCkeditor']);
        this.ngModule
        .config(['$stateProvider', '$locationProvider', function($stateProvider, $locationProvider) {
          $stateProvider
          .state('content-model', {
              url: '/model/:name?filter',
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
          })
          .state('content-model.add', {
              url: '/add',
              views: {
                  'content@': {
                      templateUrl: 'app/templates/content-model/edit.html',
                      controller: 'CoffeeModelContentAddCtrl'
                  }
              }
          });

          $locationProvider.html5Mode(true);
        }])
        .filter('flatJsUri', () => {
            return (input) => {
                var out = '';
                var first = true;
                for (var k in input) {
                    if (! first) out += ',';
                    out += k + ':' + input[k];
                    first = false;
                }
                return out;
            }
        })
        .filter('parseJsUri', () => {
            return (input) => {
                var out = {};
                input.split(',').forEach((pair) => {
                    var p = pair.split(':');
                    out[p[0]] = p[1];
                });
                return out;
            }
        })
        /* List */
        .controller('CoffeeModelContentCtrl', ['$scope', '$filter', '$stateParams', '$state', '$notify', '$coffee',
                                              ($scope, $filter, $stateParams, $state, $notify, $coffee) => {
            angular.extend($scope, $stateParams);
            var contentFilter = $filter('parseJsUri')($scope.filter);
            $scope.$on('filter:update', (ev, patch) => {
                $state.go('content-model', {id: $stateParams.id, filter: $filter('flatJsUri')(patch)});
            });
            $coffee.lang.getValue({section: 'models', subsection: $scope.name}, (data) => {
                $scope.modelTitle = data.value;
            });
            var reqParams = {name: $scope.name, method: 'getList', fieldset: '@listView'};
            if (typeof(contentFilter.section) != 'undefined' && contentFilter.section != 0) {
                reqParams['section'] = contentFilter.section;
                reqParams['method'] = 'getListBySection';
            }
            $coffee.model.get(reqParams, (data) => {
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
            $scope.delete = (rowId) => {
                $coffee.delete($scope.name, $scope.rows[rowId].id).success((data) => {
                    if (data.type == 'model') {
                        $scope.rows.splice(rowId, 1);
                        $notify.push('Удалено', true);
                    } else {
                        $notify.push('Ошибка', false);
                    }
                });
            }
        }])
        /* Edit */
        .controller('CoffeeModelContentEditCtrl', ['$scope', '$notify', '$stateParams', '$coffee', ($scope, $notify, $stateParams, $coffee) => {
            angular.extend($scope, $stateParams);
            $scope.mode = 'Редактирование';
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
            $scope.save = (obj) => {
                $coffee.edit($scope.name, $scope.id, obj).success((data) => {
                    if (data.type == 'model') {
                        $notify.push('Сохранено', true);
                    } else {
                        $notify.push('Ошибка', false);
                    }
                });
            };
        }])
        /* Add */
        .controller('CoffeeModelContentAddCtrl', ['$scope', '$notify', '$state', '$stateParams', '$coffee', ($scope, $notify, $state, $stateParams, $coffee) => {
            angular.extend($scope, $stateParams);
            $scope.mode = 'Добавление';
            $coffee.lang.getValue({section: 'models', subsection: $scope.name}, (data) => {
                $scope.modelTitle = data.value;
            });
            $coffee.model.get({name: $scope.name, method: 'schema', fieldset: '@editView'}, (data) => {
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
            $scope.save = (obj) => {
                $coffee.add($scope.name, obj).success((data) => {
                    if (data.type == 'model') {
                        $notify.push('Сохранено', true);
                        $state.go('content-model.edit', {id: data.model[0].id});
                    } else {
                        $notify.push('Ошибка', false);
                    }
                });
            };
        }])
        .constant('ckConfig', {
            defaultLanguage: 'ru',
            language: 'ru',
            width: '50%',
            height: '200px'
        })
        .directive('coffeeInput', ['$compile', 'ckConfig', ($compile, ckConfig) => {
            return {
                restrict: 'E'
                , replace: true
                , scope: { name: '@', value: '=', type: '@', ckopts: '=' }
                , link: (scope: any, elem, attr) => {
                    scope.ckopts = ckConfig;
                    var tpl: string;
                    switch (scope.type) {
                        case 'boolean':
                            tpl = '<label class="bool"><input ng-model="value" type="radio" name="'+scope.name+'" value="1"/> да</label>' +
                                  '<label class="bool"><input ng-model="value" type="radio" name="'+scope.name+'" value="0"/> нет</label>';
                            break;
                        case 'richtext':
                            tpl = '<textarea ckeditor="ckopts" ng-model="value" name="'+scope.name+'"></textarea>';
                            break;
                        case 'text':
                            tpl = '<textarea ng-model="value" name="'+scope.name+'"></textarea>';
                            break;
                        default:
                            var ms;
                            if (ms = scope.type.match('n-to-1:(.*)')) {
                                var objModel = ms[1];
                                tpl = '<coffee-widget name="flat-selector" bind-to="value" obj-model="'+objModel+'"></coffee-widget>';
                            } else {
                                tpl = '<input ng-model="value" type="text" name="' + scope.name + '"/>';
                            }
                    }
                    elem.append($compile(tpl)(scope));
                }
            };
        }])
        ;
        return this.ngModule;
    }
}

var mod = Content.module();
export = mod;
