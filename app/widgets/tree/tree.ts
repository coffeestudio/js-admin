/// <reference path="../widget.d.ts"/>

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
    $inject: string[] = ['$scope', '$rootScope', '$attrs', '$http'];

    constructor($scope, $rootScope, $attrs, $http) {
        this.scope = $scope;
        this.rootScope = $rootScope;
        this.http = $http;
        $scope.w = this;
        $scope.tplId = 'tree-li-template-' + $scope.widgetId;
        this.objModel = $attrs.objModel;
        this.contentModel = $attrs.contentModel ? $attrs.contentModel : this.objModel;
        this.activeId = $attrs.activeId;
        this.flat = $attrs.flat == 'true' ? true : false;
    }

    init(data: any) {
        this.loadTitle();
        this.loadActive();
        this.http.get('/coffee.api.model/' + this.objModel + '/getTopLevel').success(data => {
            this.topLevel = data.model.map(el => new Node(el, this));
        });
    }

    toggleNode(n: Node) {
        var id = n.isActive() ? 0 : n.id;
        this.activeId = id;
        this.rootScope.$broadcast('filter:update', {section: id});
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
    title: string;
    path: string;
    fullpath: string;
    pathArr: string[];
    leaf: boolean;
    mark: string;
    level: number;
    tree: Tree;
    children: Array<Node>;
    childrenVisible: boolean = false;
    private childrenLoaded: boolean = false;

    constructor(model: any, tree: Tree, level: number = 0) {
        this.id = model.id;
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
            this.children = data.model.map(el => new Node(el, this.tree, this.level + 1));
        });
    }
}

export = Tree;
