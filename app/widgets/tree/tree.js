/// <reference path="../widget.d.ts"/>
/// <reference path="../../include/angular.d.ts"/>
define(["require", "exports", 'angular'], function (require, exports, angular) {
    var Tree = (function () {
        function Tree($scope, $rootScope, $attrs, $http, $state, $coffee, $notify) {
            var _this = this;
            this.$inject = ['$scope', '$rootScope', '$attrs', '$http', '$state', '$coffee', '$notify'];
            this.scope = $scope;
            this.rootScope = $rootScope;
            this.http = $http;
            $scope.w = this;
            $scope.tplId = 'tree-li-template-' + $scope.widgetId;
            this.objModel = $attrs.objModel;
            this.contentModel = $attrs.contentModel ? $attrs.contentModel : this.objModel;
            this.activeId = $attrs.activeId;
            this.flat = $attrs.flat == 'true' ? true : false;
            $scope.makeEditSref = function (node) {
                if (typeof (node.id) == 'undefined')
                    return '';
                var params = angular.toJson({ name: _this.objModel, id: node.id });
                return 'content-model.edit(' + params + ')';
            };
            $scope.goAddSection = function () {
                $state.go('content-model.add', { name: _this.objModel });
            };
            $scope.delete = function (node) {
                if (confirm('Подтвердите удаление раздела "' + node.title + '"')) {
                    $coffee.delete(_this.objModel, node.id).success(function (data) {
                        if (data.type == 'model') {
                            if (node.parent) {
                                node.parent.children.splice(node.index, 1);
                            }
                            else {
                                node.tree.topLevel.splice(node.index, 1);
                            }
                            $notify.push('Удалено', true);
                        }
                        else {
                            $notify.push('Ошибка', false);
                        }
                    });
                }
            };
        }
        Tree.prototype.init = function (data) {
            var _this = this;
            //this.loadTitle();
            //this.loadActive();
            this.http.get('/coffee.api.model/' + this.objModel + '/getTopLevel').success(function (data) {
                _this.topLevel = data.model.map(function (el, index) { return new Node(el, _this, index); });
            });
        };
        Tree.prototype.toggleNode = function (n) {
            var id = n.isActive() ? 0 : n.id;
            this.activeId = id;
            if (id == 0) {
                this.rootScope.$broadcast('filter:remove', ['section']);
            }
            else {
                this.rootScope.$broadcast('filter:update', { section: id });
            }
        };
        Tree.prototype.resetNode = function () {
            this.activeId = 0;
        };
        Tree.prototype.loadTitle = function () {
            var _this = this;
            this.http({ method: 'GET', url: '/coffee.api.util/Lang/obj/', params: { code: this.objModel } }).success(function (data) { return _this.treeTitle = data.value; });
        };
        Tree.prototype.loadActive = function () {
            var _this = this;
            if (!this.activeId)
                return;
            return this.http({ method: 'GET', url: '/coffee.api.model/' + this.objModel + '/getById/id,title,path,fullpath/', params: { id: this.activeId } }).success(function (data) {
                var res = data.model.map(function (el) { return new Node(el, _this); });
                if (res.length > 0)
                    _this.activeNode = res[0];
            });
        };
        return Tree;
    })();
    var Node = (function () {
        function Node(model, tree, index, parent, level) {
            var _this = this;
            if (index === void 0) { index = null; }
            if (parent === void 0) { parent = null; }
            if (level === void 0) { level = 0; }
            this.index = null;
            this.childrenVisible = false;
            this.childrenLoaded = false;
            this.id = model.id;
            this.index = index;
            this.title = model.title;
            this.path = model.path;
            this.fullpath = model.fullpath;
            this.pathArr = [];
            this.fullpath.split('/').forEach(function (s) { return (s != '') && _this.pathArr.push(s); });
            this.leaf = model.leaf;
            this.mark = model.mark;
            this.tree = tree;
            this.parent = parent;
            this.level = level;
            this.tree.scope.$watch(function () {
                return _this.isActive();
            }, function () {
                if (_this.isActive())
                    _this.expandSubtree();
            });
        }
        Node.prototype.isActive = function () {
            if (this.tree.activeId == this.id)
                return true;
            if (!this.tree.activeNode)
                return false;
            return this.tree.activeNode.pathArr[this.level] == this.path;
        };
        Node.prototype.isNotActive = function () {
            return !this.isActive();
        };
        Node.prototype.hasMark = function () {
            return this.mark && this.mark.length > 0;
        };
        Node.prototype.toggleSubtree = function () {
            if (this.leaf)
                return;
            this.childrenVisible = !this.childrenVisible;
            if (this.childrenVisible && !this.childrenLoaded)
                this.getChildren();
        };
        Node.prototype.expandSubtree = function () {
            if (this.childrenVisible || this.leaf)
                return;
            this.toggleSubtree();
        };
        Node.prototype.retractSubtree = function () {
            if (!this.childrenVisible || this.leaf)
                return;
            this.toggleSubtree();
        };
        Node.prototype.getChildren = function () {
            var _this = this;
            this.tree.http({ method: 'GET', url: '/coffee.api.model/' + this.tree.objModel + '/getChildrenOf', params: { id: this.id } }).success(function (data) {
                _this.childrenLoaded = true;
                _this.children = data.model.map(function (el, index) { return new Node(el, _this.tree, index, _this, _this.level + 1); });
            });
        };
        return Node;
    })();
    return Tree;
});
