/// <reference path="../include/angular.d.ts"/>
/// <reference path="../include/require.d.ts"/>
/// <reference path="widget.d.ts"/>

import angular = require('angular');

class Widgets {
    private static widgetPrefix = '/adm/app/widgets';
    private static ngModule: angular.IModule = null;
    private static idPool: number = 0;
    private static makeWidgetId(): number {
        this.idPool++;
        return this.idPool;
    }
    static module() {
        if (this.ngModule != null) return this.ngModule;
        var widgetId: number = this.makeWidgetId();
        this.ngModule = angular.module('coffeeWidgets', ['ui.sortable']); // TODO: Refactor modules and dependencies
        this.ngModule.directive('coffeeWidget', () => {
            return {
                  restrict: 'E'
                , scope: { 'bindTo': '=' }
                , transclude: true
                , templateUrl: (elem, attr) => this.widgetPrefix + '/' + attr.name + '/' + attr.name + '.html'
                , controller: ['$attrs', '$scope', '$injector', '$q', ($attrs, $scope, $injector, $q) => {
                    $scope.widgetId = widgetId;
                    var wdefer = $q.defer();
                    require(['widgets/' + $attrs['name'] + '/' + $attrs['name']], (Widget) => {
                        $scope.$apply( () => {
                            wdefer.resolve (
                                $injector.instantiate(Widget, {'$scope': $scope, '$attrs': $attrs})
                            );
                        } );
                    });
                    $scope['_w'] = wdefer.promise;
                }]
                , link: (scope: any, elem, attr, ctrl, transclude) => {
                    scope._w.then((widget) => transclude(scope, (json) => widget.init(angular.fromJson(json.html()))));
                }
            }
        });
        return this.ngModule;
    }
}

var mod = Widgets.module();
export = mod;