/// <reference path="include/angular.d.ts"/>
/// <reference path="include/jqueryui.d.ts"/>
/// <amd-dependency path="angular-ui-sortable"/>
/// <amd-dependency path="jquery-ui"/>

import angular = require('angular');
import sidenav = require('elements/sidenav');

class Elements {
    private static ngModule: angular.IModule = null;
    static module() {
        if (this.ngModule != null) return this.ngModule;
        this.ngModule = angular.module('coffeeElements', ['ui.router']);
        [sidenav].forEach(extend => extend(this.ngModule));
        return this.ngModule;
    }
}

var mod = Elements.module();
export = mod;
