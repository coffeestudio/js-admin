/// <reference path="include/angular.d.ts"/>
/// <amd-dependency path="angular-resource"/>

import angular = require('angular');
import $ = require('jquery');

class CoffeeRest {
    private static ngModule: angular.IModule = null;
    static module() {
        if (this.ngModule != null) return this.ngModule;
        this.ngModule = angular.module('coffeeRest', ['ngResource']);
        this.ngModule.service('$coffee', ['$resource', '$http', '$q', CoffeeRestService]);
        return this.ngModule;
    }
}

class CoffeeRestService {
    config; model; util; lang; auth; features; $http; $q;
    features_cache: any = {};
    constructor($resource, $http, $q) {
        this.$http = $http;
        this.$q = $q;
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
        this.auth = $resource('/coffee.api.auth/:name/:method');
    }

    checkFeature(model: string, fname: string) {
        var result = this.$q.defer();
        var newmodel = ! (model in this.features_cache);
        if (newmodel || ! (fname in this.features_cache[model])) {
            if (newmodel) this.features_cache[model] = {};
            this.getFeatures(model).success((data) => {
                var answer = $.inArray(fname, data['entity']) > -1 || $.inArray(fname, data['dao']) > -1;
                this.features_cache[model][fname] = answer;
                result.resolve(answer);
            });
        } else {
            result.resolve(this.features_cache[model][fname]);
        }
        return result.promise;
    }

    private getFeatures(model: string) {
        return this.$http.get('/coffee.api.features/'+model);
    }

    authLogin(model: string, login: string, password: string) {
        return this.$http({
            method: 'POST',
            url: '/coffee.api.auth/'+model+'/login',
            data: {login: login, password: password},
        });
    }

    authLogout(model: string) {
        return this.$http({
            method: 'POST',
            url: '/coffee.api.auth/'+model+'/logout',
        });
    }

    edit(model: string, id: number, obj: any) {
        return this.$http({
            method: 'POST',
            url: '/coffee.api.model/'+model+'/edit/@editView',
            data: obj,
            params: {id: id}
        });
    }

    add(model: string, obj: any) {
        return this.$http({
            method: 'POST',
            url: '/coffee.api.model/'+model+'/add/@editView',
            data: obj
        });
    }

    delete(model: string, id: number) {
        return this.$http({
            method: 'POST',
            url: '/coffee.api.model/'+model+'/delete',
            params: {id: id}
        });
    }
}

var mod = CoffeeRest.module();
export = mod;
