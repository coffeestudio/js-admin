/// <reference path="../include/angular.d.ts"/>
/// <reference path="../include/require.d.ts"/>
/// <reference path="widget.d.ts"/>
define(["require", "exports", 'angular'], function (require, exports, angular) {
    var Widgets = (function () {
        function Widgets() {
        }
        Widgets.makeWidgetId = function () {
            this.idPool++;
            return this.idPool;
        };
        Widgets.module = function () {
            var _this = this;
            if (this.ngModule != null)
                return this.ngModule;
            var widgetId = this.makeWidgetId();
            this.ngModule = angular.module('coffeeWidgets', ['ui.sortable']); // TODO: Refactor modules and dependencies
            this.ngModule.directive('coffeeWidget', function () {
                return {
                    restrict: 'E',
                    scope: {},
                    transclude: true,
                    templateUrl: function (elem, attr) { return _this.widgetPrefix + '/' + attr.name + '/' + attr.name + '.html'; },
                    controller: ['$attrs', '$scope', '$injector', '$q', function ($attrs, $scope, $injector, $q) {
                        $scope.widgetId = widgetId;
                        var wdefer = $q.defer();
                        require(['widgets/' + $attrs['name'] + '/' + $attrs['name']], function (Widget) {
                            $scope.$apply(function () {
                                wdefer.resolve($injector.instantiate(Widget, { '$scope': $scope, '$attrs': $attrs }));
                            });
                        });
                        $scope['_w'] = wdefer.promise;
                    }],
                    link: function (scope, elem, attr, ctrl, transclude) {
                        scope._w.then(function (widget) { return transclude(scope, function (json) { return widget.init(angular.fromJson(json.html())); }); });
                    }
                };
            });
            return this.ngModule;
        };
        Widgets.widgetPrefix = '/adm/app/widgets';
        Widgets.ngModule = null;
        Widgets.idPool = 0;
        return Widgets;
    })();
    var mod = Widgets.module();
    return mod;
});
