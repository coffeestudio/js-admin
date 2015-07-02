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
                    templateUrl: 'app/templates/content-model/list.html',
                    controller: 'CoffeeModelContentCtrl'
                }).state('content-model.edit', {
                    url: '/model/:name/:id/edit',
                    templateUrl: 'app/templates/content-model/edit.html',
                    controller: 'CoffeeModelContentEditCtrl'
                });
                $locationProvider.html5Mode(true);
            }]).controller('CoffeeModelContentCtrl', ['$scope', '$stateParams', '$coffee', function ($scope, $stateParams, $coffee) {
                angular.extend($scope, $stateParams);
                $coffee.model.get({ name: $scope.name, method: 'getList' }, function (data) {
                    $scope.rows = data.model;
                });
            }]).controller('CoffeeModelContentEditCtrl', ['$scope', '$stateParams', '$coffee', function ($scope, $stateParams, $coffee) {
                angular.extend($scope, $stateParams);
            }]);
            return this.ngModule;
        };
        Content.ngModule = null;
        return Content;
    })();
    var mod = Content.module();
    return mod;
});
