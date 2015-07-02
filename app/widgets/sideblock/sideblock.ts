/// <reference path="../widget.d.ts"/>

class Sideblock implements IWidget {
    name: string;
    nodes: Array<Node> = [];
    scope: any;
    http: any;
    $inject: string[] = ['$scope', '$attrs', '$http'];

    constructor($scope, $attrs, $http) {
        console.log('Construct Sideblock');
        this.scope = $scope;
        this.http = $http;
        this.name = $attrs.blockName;
        $scope.w = this;
    }

    init(data: any, tref: Array<Node> = this.nodes) {
        if (typeof(data) == 'undefined') return;
        for (var k in data) {
            var v = data[k];
            var n = new Node(k, typeof('v') == 'string' ? v : null);
            this.nodes.push(n);
            if (typeof(v) == 'object') this.init(v, n.children);
        }
    }
}

class Node {
    title: string;
    hasChildren: boolean = false;
    expanded: boolean = false;
    noticeCount: number = 0;
    path: string = "";
    children: Array<Node>;

    constructor(title: string, path: string = "") {
        this.title = title;
        this.path = path;
    }

    expand() { this.expanded = true; }
    retract() { this.expanded = false; }
    toggle() { this.expanded = ! this.expanded; }
}

export = Sideblock;
/*
$('.sidenav li.parent > a').on('click', function(){
    $(this).removeAttr('href');
    var element = $(this).parent('li');
    if (element.hasClass('open')) {
        element.removeClass('open');
        element.find('li').removeClass('open');
        element.find('ul.submenu').slideUp();
    } else {
        element.addClass('open');
        element.children('ul.submenu').slideDown();

        element.siblings('li').children('ul.submenu').slideUp();
        element.siblings('li').removeClass('open');
        element.siblings('li').find('li').removeClass('open');
        element.siblings('li').find('ul.submenu').slideUp();
    }
});
$("ul.sidenav li a").click(function(e) {
    parent = $(this);
    if(parent.find(".ink").length == 0)
        parent.prepend("<span class='ink'></span>");
    ink = parent.find(".ink");
    ink.removeClass("animate");
    if(!ink.height() && !ink.width()) {
        d = Math.max(parent.outerWidth(), parent.outerHeight());
        ink.css({height: d, width: d});
    }
    x = e.pageX - parent.offset().left - ink.width()/2;
    y = e.pageY - parent.offset().top - ink.height()/2;
    ink.css({top: y+'px', left: x+'px'}).addClass("animate");
    setTimeout(function() {$('ul.sidenav').find('.ink').remove()}, 500);
});
*/
