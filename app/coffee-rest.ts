/// <reference path="include/angular.d.ts"/>
/// <amd-dependency path="angular-resource"/>

import angular = require('angular');

class CoffeeRest {
    private static ngModule: angular.IModule = null;
    static module() {
        if (this.ngModule != null) return this.ngModule;
        this.ngModule = angular.module('coffeeRest', ['ngResource']);
        this.ngModule.service('$coffee', ['$resource', CoffeeRestService]);
        return this.ngModule;
    }
}

class CoffeeRestService {
    config;
    model;
    util;
    constructor($resource) {
        this.config = $resource('/coffee.api.config/:section/:subsection/:param');
        this.model = $resource('/coffee.api.model/:name/:method/:fieldset');
        this.util = $resource('/coffee.api.util/:name/:method');
    }
}

var mod = CoffeeRest.module();
export = mod;
