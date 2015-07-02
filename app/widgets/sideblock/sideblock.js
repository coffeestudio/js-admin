define(["require", "exports"], function (require, exports) {
    var Sideblock = (function () {
        function Sideblock($scope, $attrs, $http) {
            this.nodes = [];
            this.$inject = ['$scope', '$attrs', '$http'];
            console.log('Construct Sideblock');
            this.scope = $scope;
            this.http = $http;
            this.name = $attrs.blockName;
            $scope.w = this;
        }
        Sideblock.prototype.init = function (data, tref) {
            if (tref === void 0) { tref = this.nodes; }
            if (typeof (data) == 'undefined')
                return;
            for (var k in data) {
                var v = data[k];
                var n = new Node(k, typeof ('v') == 'string' ? v : null);
                this.nodes.push(n);
                if (typeof (v) == 'object')
                    this.init(v, n.children);
            }
        };
        return Sideblock;
    })();
    var Node = (function () {
        function Node(title, path) {
            if (path === void 0) { path = ""; }
            this.hasChildren = false;
            this.expanded = false;
            this.noticeCount = 0;
            this.path = "";
            this.title = title;
            this.path = path;
        }
        Node.prototype.expand = function () {
            this.expanded = true;
        };
        Node.prototype.retract = function () {
            this.expanded = false;
        };
        Node.prototype.toggle = function () {
            this.expanded = !this.expanded;
        };
        return Node;
    })();
    return Sideblock;
});
