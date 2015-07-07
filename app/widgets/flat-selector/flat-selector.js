/// <reference path="../widget.d.ts"/>
define(["require", "exports"], function (require, exports) {
    var FlatSelector = (function () {
        function FlatSelector($scope, $attrs, $http) {
            this.$inject = ['$scope', '$attrs', '$http'];
            this.scope = $scope;
            this.http = $http;
            $scope.w = this;
            this.objModel = $attrs.objModel;
            this.activeId = $scope.bindTo;
        }
        FlatSelector.prototype.init = function (data) {
            var _this = this;
            this.http.get('/coffee.api.model/' + this.objModel + '/getList/id,title').success(function (data) {
                _this.nodes = data.model.map(function (el) { return new Node(el, _this); });
            });
        };
        return FlatSelector;
    })();
    var Node = (function () {
        function Node(model, selector) {
            this.selector = selector;
            this.id = model.id;
            this.title = model.title;
        }
        Node.prototype.isActive = function () {
            return this.id == this.selector.activeId;
        };
        Node.prototype.isNotActive = function () {
            return !this.isActive();
        };
        return Node;
    })();
    return FlatSelector;
});
