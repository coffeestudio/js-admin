/// <reference path="include/angular.d.ts"/>
/// <reference path="include/jqueryui.d.ts"/>
/// <amd-dependency path="angular-ui-router"/>
/// <amd-dependency path="angular-ui-sortable"/>
/// <amd-dependency path="jquery-ui"/>
define(["require", "exports", 'angular', "angular-ui-router", "angular-ui-sortable", "jquery-ui"], function (require, exports, angular) {
    var Content = (function () {
        function Content() {
        }
        Content.module = function () {
            if (this.ngModule != null)
                return this.ngModule;
            this.ngModule = angular.module('coffeeContent', ['ui.router']);
            this.ngModule.config(['$stateProvider', '$locationProvider', function ($stateProvider, $locationProvider) {
                $stateProvider.state('content-model', {
                    url: '/model/:name',
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
                });
                $locationProvider.html5Mode(true);
            }]).controller('CoffeeModelContentCtrl', ['$scope', '$stateParams', '$coffee', function ($scope, $stateParams, $coffee) {
                angular.extend($scope, $stateParams);
                $coffee.lang.getValue({ section: 'models', subsection: $scope.name }, function (data) {
                    $scope.modelTitle = data.value;
                });
                $coffee.model.get({ name: $scope.name, method: 'getList', fieldset: '@listView' }, function (data) {
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
            }]).controller('CoffeeModelContentEditCtrl', ['$scope', '$stateParams', '$coffee', function ($scope, $stateParams, $coffee) {
                angular.extend($scope, $stateParams);
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
                    console.log('SAVE');
                    $coffee.edit($scope.name, $scope.id, obj);
                };
            }]).directive('coffeeInput', function ($compile) {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: { name: '@', value: '=', type: '@' },
                    link: function (scope, elem, attr) {
                        var tpl;
                        switch (scope.type) {
                            case 'boolean':
                                tpl = '<label class="bool"><input ng-model="value" type="radio" name="' + scope.name + '" value="1"/> да</label>' + '<label class="bool"><input ng-model="value" type="radio" name="' + scope.name + '" value="0"/> нет</label>';
                                break;
                            case 'text':
                                tpl = '<textarea ng-model="value" name="' + scope.name + '"></textarea>';
                                break;
                            default:
                                tpl = '<input ng-model="value" type="text" name="' + scope.name + '"/>';
                        }
                        elem.append($compile(tpl)(scope));
                    }
                };
            });
            return this.ngModule;
        };
        Content.ngModule = null;
        return Content;
    })();
    var mod = Content.module();
    return mod;
});
