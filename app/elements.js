/// <reference path="include/angular.d.ts"/>
/// <reference path="include/jqueryui.d.ts"/>
/// <amd-dependency path="angular-ui-sortable"/>
/// <amd-dependency path="jquery-ui"/>
define(["require", "exports", 'angular', 'elements/sidenav', "angular-ui-sortable", "jquery-ui"], function (require, exports, angular, sidenav) {
    var Elements = (function () {
        function Elements() {
        }
        Elements.module = function () {
            var _this = this;
            if (this.ngModule != null)
                return this.ngModule;
            this.ngModule = angular.module('coffeeElements', []);
            [sidenav].forEach(function (extend) { return extend(_this.ngModule); });
            return this.ngModule;
        };
        Elements.ngModule = null;
        return Elements;
    })();
    var mod = Elements.module();
    return mod;
});
