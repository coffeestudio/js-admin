/// <reference path="../widget.d.ts"/>

class FlatSelector implements IWidget {
    objModel: string;
    activeId: number;
    nodes: Array<Node>;

    scope: any;
    http: any;
    $inject: string[] = ['$scope', '$attrs', '$http'];

    constructor($scope, $attrs, $http) {
        this.scope = $scope;
        this.http = $http;
        $scope.w = this;
        this.objModel = $attrs.objModel;
        this.activeId = $scope.bindTo;
    }

    init(data: any) {
        this.http.get('/coffee.api.model/' + this.objModel + '/getList/id,title').success(data => {
            this.nodes = data.model.map(el => new Node(el, this));
        });
    }
}

class Node {
    id: number;
    title: string;
    selector: FlatSelector;

    constructor(model: any, selector: FlatSelector) {
        this.selector = selector;
        this.id = model.id;
        this.title = model.title;
    }

    isActive() {
        return this.id == this.selector.activeId;
    }
    isNotActive() {
        return ! this.isActive();
    }
}

export = FlatSelector;
