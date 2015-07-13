/// <reference path="include/angular.d.ts"/>
/// <reference path="include/jqueryui.d.ts"/>
/// <amd-dependency path="angular-ui-router"/>
/// <amd-dependency path="angular-ui-sortable"/>
/// <amd-dependency path="jquery-ui"/>
/// <amd-dependency path="ng-ckeditor"/>
define(["require", "exports", 'angular', "angular-ui-router", "angular-ui-sortable", "jquery-ui", "ng-ckeditor"], function (require, exports, angular) {
    var Content = (function () {
        function Content() {
        }
        Content.module = function () {
            if (this.ngModule != null)
                return this.ngModule;
            this.ngModule = angular.module('coffeeContent', ['ui.router', 'ngCkeditor']);
            this.ngModule.config(['$stateProvider', '$locationProvider', function ($stateProvider, $locationProvider) {
                $stateProvider.state('content-model', {
                    url: '/model/:name?filter',
                    views: {
                        'content@': {
                            templateUrl: 'app/templates/content-model/list.html',
                            controller: 'CoffeeModelContentCtrl'
                        }
                    }
                }).state('content-model.edit', {
                    url: '/:id/edit',
                    views: {
                        'content@': {
                            templateUrl: 'app/templates/content-model/edit.html',
                            controller: 'CoffeeModelContentEditCtrl'
                        }
                    }
                }).state('content-model.add', {
                    url: '/add',
                    views: {
                        'content@': {
                            templateUrl: 'app/templates/content-model/edit.html',
                            controller: 'CoffeeModelContentAddCtrl'
                        }
                    }
                });
                $locationProvider.html5Mode(true);
            }]).filter('flatJsUri', function () {
                return function (input) {
                    var out = '';
                    var first = true;
                    for (var k in input) {
                        if (!first)
                            out += ',';
                        out += k + ':' + input[k];
                        first = false;
                    }
                    return out;
                };
            }).filter('parseJsUri', function () {
                return function (input) {
                    var out = {};
                    if (typeof (input) == 'string') {
                        input.split(',').forEach(function (pair) {
                            var p = pair.split(':');
                            out[p[0]] = p[1];
                        });
                    }
                    return out;
                };
            }).controller('CoffeeModelContentCtrl', ['$scope', '$filter', '$stateParams', '$state', '$notify', '$coffee', function ($scope, $filter, $stateParams, $state, $notify, $coffee) {
                angular.extend($scope, $stateParams);
                var contentFilter = $filter('parseJsUri')($scope.filter);
                $scope.$on('filter:update', function (ev, patch) {
                    $state.go('content-model', { id: $stateParams.id, filter: $filter('flatJsUri')(patch) });
                });
                $scope.$on('filter:remove', function (ev, toDel) {
                    toDel.forEach(function (f) {
                        delete contentFilter[f];
                    });
                    $state.go('content-model', { id: $stateParams.id, filter: $filter('flatJsUri')(contentFilter) });
                });
                $coffee.lang.getValue({ section: 'models', subsection: $scope.name }, function (data) {
                    $scope.modelTitle = data.value;
                });
                var reqParams = { name: $scope.name, method: 'getList', fieldset: '@listView' };
                if (typeof (contentFilter.section) != 'undefined' && contentFilter.section != 0) {
                    reqParams['section'] = contentFilter.section;
                    reqParams['method'] = 'getListBySection';
                }
                $coffee.model.get(reqParams, function (data) {
                    $scope.rows = data.model;
                    if ($scope.rows.length > 0) {
                        $coffee.lang.get({ section: 'fields', subsection: $scope.name }, function (data) {
                            var ths = {};
                            for (var k in $scope.rows[0]) {
                                if (k == '$$hashKey')
                                    continue;
                                ths[k] = data[k];
                            }
                            $scope.ths = ths;
                        });
                    }
                });
                $scope.makeEditSref = function (row) {
                    var params = angular.toJson({ id: row.id });
                    return 'content-model.edit(' + params + ')';
                };
                $scope.delete = function (rowId) {
                    $coffee.delete($scope.name, $scope.rows[rowId].id).success(function (data) {
                        if (data.type == 'model') {
                            $scope.rows.splice(rowId, 1);
                            $notify.push('Удалено', true);
                        }
                        else {
                            $notify.push('Ошибка', false);
                        }
                    });
                };
            }]).controller('CoffeeModelContentEditCtrl', ['$scope', '$notify', '$stateParams', '$coffee', function ($scope, $notify, $stateParams, $coffee) {
                angular.extend($scope, $stateParams);
                $scope.mode = 'Редактирование';
                $scope.withAttachments = false;
                $coffee.checkFeature($scope.name, 'IWithAttachments').then(function (answer) {
                    $scope.withAttachments = answer;
                });
                $coffee.lang.getValue({ section: 'models', subsection: $scope.name }, function (data) {
                    $scope.modelTitle = data.value;
                });
                $coffee.model.get({ name: $scope.name, method: 'get', fieldset: '@editView', id: $stateParams.id }, function (data) {
                    if (data.model.length > 0) {
                        $scope.object = data.model[0];
                        $scope.types = data.types;
                        $coffee.lang.get({ section: 'fields', subsection: $scope.name }, function (data) {
                            var labels = {};
                            for (var k in $scope.object) {
                                if (k == '$$hashKey')
                                    continue;
                                labels[k] = data[k];
                            }
                            $scope.labels = labels;
                        });
                    }
                });
                $scope.save = function (obj) {
                    $coffee.edit($scope.name, $scope.id, obj).success(function (data) {
                        if (data.type == 'model') {
                            $notify.push('Сохранено', true);
                        }
                        else {
                            $notify.push('Ошибка', false);
                        }
                    });
                };
            }]).controller('CoffeeModelContentAddCtrl', ['$scope', '$notify', '$filter', '$state', '$stateParams', '$coffee', function ($scope, $notify, $filter, $state, $stateParams, $coffee) {
                angular.extend($scope, $stateParams);
                var contentFilter = $filter('parseJsUri')($scope.filter);
                $scope.$on('filter:update', function (ev, patch) {
                    $state.go('content-model.add', { filter: $filter('flatJsUri')(patch) });
                });
                $scope.$on('filter:remove', function (ev, toDel) {
                    toDel.forEach(function (f) {
                        delete contentFilter[f];
                    });
                    $state.go('content-model.add', { filter: $filter('flatJsUri')(contentFilter) });
                });
                $scope.mode = 'Добавление';
                $coffee.lang.getValue({ section: 'models', subsection: $scope.name }, function (data) {
                    $scope.modelTitle = data.value;
                });
                var getParams = {
                    name: $scope.name,
                    method: 'schema',
                    fieldset: '@editView'
                };
                if ('section' in contentFilter) {
                    getParams['section'] = contentFilter['section'];
                }
                $coffee.model.get(getParams, function (data) {
                    if (data.model.length > 0) {
                        $scope.object = data.model[0];
                        $scope.types = data.types;
                        $coffee.lang.get({ section: 'fields', subsection: $scope.name }, function (data) {
                            var labels = {};
                            for (var k in $scope.object) {
                                if (k == '$$hashKey')
                                    continue;
                                labels[k] = data[k];
                            }
                            $scope.labels = labels;
                        });
                    }
                });
                $scope.save = function (obj) {
                    $coffee.add($scope.name, obj).success(function (data) {
                        if (data.type == 'model') {
                            $notify.push('Сохранено', true);
                            $state.go('content-model.edit', { id: data.model[0].id });
                        }
                        else {
                            $notify.push('Ошибка', false);
                        }
                    });
                };
            }]).constant('ckConfig', {
                defaultLanguage: 'ru',
                language: 'ru',
                width: '50%',
                height: '200px'
            }).directive('coffeeInput', ['$compile', 'ckConfig', function ($compile, ckConfig) {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: { name: '@', value: '=', type: '@', ckopts: '=' },
                    link: function (scope, elem, attr) {
                        scope.ckopts = ckConfig;
                        var tpl;
                        switch (scope.type) {
                            case 'boolean':
                                tpl = '<label class="bool"><input ng-model="value" type="radio" name="' + scope.name + '" value="1"/> да</label>' + '<label class="bool"><input ng-model="value" type="radio" name="' + scope.name + '" value="0"/> нет</label>';
                                break;
                            case 'richtext':
                                tpl = '<textarea ckeditor="ckopts" ng-model="value" name="' + scope.name + '"></textarea>';
                                break;
                            case 'text':
                                tpl = '<textarea ng-model="value" name="' + scope.name + '"></textarea>';
                                break;
                            case 'password':
                                tpl = '<input ng-model="value" type="password" name="' + scope.name + '"/>';
                                break;
                            default:
                                var ms;
                                if (ms = scope.type.match('n-to-1:(.*)')) {
                                    var objModel = ms[1];
                                    tpl = '<coffee-widget name="flat-selector" bind-to="value" obj-model="' + objModel + '"></coffee-widget>';
                                }
                                else {
                                    tpl = '<input ng-model="value" type="text" name="' + scope.name + '"/>';
                                }
                        }
                        elem.append($compile(tpl)(scope));
                    }
                };
            }]);
            return this.ngModule;
        };
        Content.ngModule = null;
        return Content;
    })();
    var mod = Content.module();
    return mod;
});
