/// <reference path="include/angular.d.ts"/>
/// <amd-dependency path="angular-resource"/>
define(["require", "exports", 'angular', "angular-resource"], function (require, exports, angular) {
    var CoffeeRest = (function () {
        function CoffeeRest() {
        }
        CoffeeRest.module = function () {
            if (this.ngModule != null)
                return this.ngModule;
            this.ngModule = angular.module('coffeeRest', ['ngResource']);
            this.ngModule.service('$coffee', ['$resource', '$http', CoffeeRestService]);
            return this.ngModule;
        };
        CoffeeRest.ngModule = null;
        return CoffeeRest;
    })();
    var CoffeeRestService = (function () {
        function CoffeeRestService($resource, $http) {
            this.$http = $http;
            this.config = $resource('/coffee.api.config/:section/:subsection/:param');
            this.lang = $resource('/coffee.api.lang/:section/:subsection/:param', {}, {
                getValue: {
                    transformResponse: function (data, hGetter) {
                        return { value: angular.fromJson(data) };
                    }
                }
            });
            this.model = $resource('/coffee.api.model/:name/:method/:fieldset');
            this.util = $resource('/coffee.api.util/:name/:method');
        }
        CoffeeRestService.prototype.edit = function (model, id, obj) {
            return this.$http({
                method: 'POST',
                url: '/coffee.api.model/' + model + '/edit/@editView',
                data: obj,
                params: { id: id }
            });
        };
        return CoffeeRestService;
    })();
    var mod = CoffeeRest.module();
    return mod;
});
