/// <reference path="include/angular.d.ts"/>
/// <amd-dependency path="angular-resource"/>

import angular = require('angular');

class CoffeeRest {
    private static ngModule: angular.IModule = null;
    static module() {
        if (this.ngModule != null) return this.ngModule;
        this.ngModule = angular.module('coffeeRest', ['ngResource']);
        this.ngModule.service('$coffee', ['$resource', '$http', CoffeeRestService]);
        return this.ngModule;
    }
}

class CoffeeRestService {
    config;
    model;
    util;
    lang;
    $http;
    constructor($resource, $http) {
        this.$http = $http;
        this.config = $resource('/coffee.api.config/:section/:subsection/:param');
        this.lang = $resource('/coffee.api.lang/:section/:subsection/:param', {}, {
            getValue: {
                transformResponse: (data, hGetter) => {
                    return {value: angular.fromJson(data)};
                }
            }
        });
        this.model = $resource('/coffee.api.model/:name/:method/:fieldset');
        this.util = $resource('/coffee.api.util/:name/:method');
    }

    edit(model: string, id: number, obj: any) {
        this.$http({
            method: 'POST',
            url: '/coffee.api.model/'+model+'/editById',
            data: obj,
            params: {id: id}
        }).success((data) => {
            console.log('EDIT', data);
        });
    }
}

var mod = CoffeeRest.module();
export = mod;
