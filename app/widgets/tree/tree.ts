/// <reference path="../widget.d.ts"/>
/// <reference path="../../include/angular.d.ts"/>

import angular = require('angular');

class Tree implements IWidget {
    objModel: string;
    contentModel: string;
    activeId: number;
    flat: boolean;
    treeTitle: string;
    scope: any;
    rootScope: any;
    http: any;
    topLevel: Array<Node>;
    activeNode: Node;
    $inject: string[] = ['$scope', '$rootScope', '$attrs', '$http', '$state', '$coffee', '$notify'];

    constructor($scope, $rootScope, $attrs, $http, $state, $coffee, $notify) {
        this.scope = $scope;
        this.rootScope = $rootScope;
        this.http = $http;
        $scope.w = this;
        $scope.tplId = 'tree-li-template-' + $scope.widgetId;
        this.objModel = $attrs.objModel;
        this.contentModel = $attrs.contentModel ? $attrs.contentModel : this.objModel;
        this.activeId = $attrs.activeId;
        this.flat = $attrs.flat == 'true' ? true : false;

        $scope.makeEditSref = (node) => {
            if (typeof(node.id) == 'undefined') return '';
            var params = angular.toJson({name: this.objModel, id: node.id});
            return 'content-model.edit(' + params + ')';
        }
        $scope.goAddSection = () => {
            $state.go('content-model.add', {name: this.objModel});
        }
        $scope.delete = (node: Node) => {
            if (confirm('Подтвердите удаление раздела "' + node.title + '"')) {
                $coffee.delete(this.objModel, node.id).success((data) => {
                    if (data.type == 'model') {
                        if (node.parent) {
                            node.parent.children.splice(node.index, 1);
                        } else {
                            node.tree.topLevel.splice(node.index, 1);
                        }
                        $notify.push('Удалено', true);
                    } else {
                        $notify.push('Ошибка', false);
                    }
                });
            }
        }
    }

    init(data: any) {
        //this.loadTitle();
        //this.loadActive();
        this.http.get('/coffee.api.model/' + this.objModel + '/getTopLevel').success(data => {
            this.topLevel = data.model.map((el, index) => new Node(el, this, index));
        });
    }

    toggleNode(n: Node) {
        var id = n.isActive() ? 0 : n.id;
        this.activeId = id;
        if (id == 0) {
            this.rootScope.$broadcast('filter:remove', ['section']);
        } else {
            this.rootScope.$broadcast('filter:update', {section: id});
        }
    }

    resetNode() {
        this.activeId = 0;
    }

    private loadTitle() {
        this.http(
            { method: 'GET'
            , url: '/coffee.api.util/Lang/obj/'
            , params: {code: this.objModel}
            }
        ).success(data => this.treeTitle = data.value);
    }

    private loadActive() {
        if (! this.activeId) return;
        return this.http(
            { method: 'GET'
            , url: '/coffee.api.model/' + this.objModel + '/getById/id,title,path,fullpath/'
            , params: {id: this.activeId}
            }
        ).success(data => {
            var res = data.model.map(el => new Node(el, this));
            if (res.length > 0) this.activeNode = res[0];
        });
    }
}

class Node {
    id: number;
    index: number = null;
    title: string;
    path: string;
    fullpath: string;
    pathArr: string[];
    leaf: boolean;
    mark: string;
    level: number;
    tree: Tree;
    parent: Node;
    children: Array<Node>;
    childrenVisible: boolean = false;
    private childrenLoaded: boolean = false;

    constructor(model: any, tree: Tree, index: number = null, parent: Node = null, level: number = 0) {
        this.id = model.id;
        this.index = index;
        this.title = model.title;
        this.path = model.path;
        this.fullpath = model.fullpath;
        this.pathArr = [];
        this.fullpath.split('/').forEach(s => (s != '') && this.pathArr.push(s));
        this.leaf = model.leaf;
        this.mark = model.mark;
        this.tree = tree;
        this.level = level;
        this.tree.scope.$watch(() => { return this.isActive() }, () => { if (this.isActive()) this.expandSubtree() });
    }

    isActive() {
        if (this.tree.activeId == this.id) return true;
        if (! this.tree.activeNode) return false;
        return this.tree.activeNode.pathArr[this.level] == this.path;
    }
    isNotActive() {
        return ! this.isActive();
    }

    hasMark() {
        return this.mark && this.mark.length > 0;
    }

    toggleSubtree() {
        if (this.leaf) return;
        this.childrenVisible = ! this.childrenVisible;
        if (this.childrenVisible && ! this.childrenLoaded) this.getChildren();
    }
    expandSubtree() {
        if (this.childrenVisible || this.leaf) return;
        this.toggleSubtree();
    }
    retractSubtree() {
        if (! this.childrenVisible || this.leaf) return;
        this.toggleSubtree();
    }

    getChildren() {
        this.tree.http(
            { method: 'GET'
            , url: '/coffee.api.model/' + this.tree.objModel + '/getChildrenOf/'
            , params: {id: this.id}
            }
        ).success(data => {
            this.childrenLoaded = true;
            this.children = data.model.map((el, index) => new Node(el, this.tree, index, this, this.level + 1));
        });
    }
}

export = Tree;
