define(["require", "exports"], function (require, exports) {
    /// <reference path="../include/angular.d.ts"/>
    var sidenav = function (m) {
        m.directive('coffeeSideNav', function () {
            return {
                restrict: 'E',
                replace: true,
                scope: true,
                transclude: true,
                controller: ['$scope', '$coffee', '$state', function ($scope, $coffee, $state) {
                    $scope.blocks = $coffee.config.query({ section: 'admin', subsection: 'sideblocks' });
                    $scope.$on('$stateChangeSuccess', function (ev, toState, toParams) {
                        if (toState.name == 'content-model') {
                            $scope.curModel = toParams.name;
                        }
                    });
                    $scope.isActive = function (node) {
                        return node.name == $scope.curModel;
                    };
                    $scope.makeSref = function (node) {
                        if (typeof (node.type) == 'undefined' || typeof (node.name) == 'undefined')
                            return '';
                        var params = angular.toJson({ name: node.name });
                        return 'content-' + node.type + '(' + params + ')';
                    };
                }],
                link: function (scope, elem, attr, ctrl, transclude) {
                    transclude(scope, function (template) {
                        elem.append(template);
                    });
                }
            };
        }).directive('coffeeSideBlockTree', function ($compile) {
            return {
                restrict: 'A',
                transclude: 'element',
                priority: 100,
                terminal: true,
                compile: function (tElement, tAttrs, transclude) {
                    var repeatExpr, childExpr, rootExpr, childrenExpr, branchExpr;
                    repeatExpr = tAttrs.coffeeSideBlockTree.match(/^(.*) in ((?:.*\.)?(.*)) at (.*)$/);
                    childExpr = repeatExpr[1];
                    rootExpr = repeatExpr[2];
                    childrenExpr = repeatExpr[3];
                    branchExpr = repeatExpr[4];
                    return function link(scope, element, attrs) {
                        var rootElement = element[0].parentNode, cache = [];
                        // Reverse lookup object to avoid re-rendering elements
                        function lookup(child) {
                            var i = cache.length;
                            while (i--) {
                                if (cache[i].scope[childExpr] === child) {
                                    return cache.splice(i, 1)[0];
                                }
                            }
                        }
                        scope.$watch(rootExpr, function (root) {
                            var currentCache = [];
                            var cache = [];
                            // Recurse the data structure
                            (function walk(children, parentNode, parentScope, depth) {
                                if (!angular.isArray(children))
                                    return;
                                var i = 0, n = children.length, last = n - 1, cursor, child, cached, childScope, grandchildren;
                                for (; i < n; ++i) {
                                    // We will compare the cached element to the element in
                                    // at the destination index. If it does not match, then
                                    // the cached element is being moved into this position.
                                    cursor = parentNode.childNodes[i];
                                    child = children[i];
                                    // See if this child has been previously rendered
                                    // using a reverse lookup by object reference
                                    cached = lookup(child);
                                    // If the parentScope no longer matches, we've moved.
                                    // We'll have to transclude again so that scopes
                                    // and controllers are properly inherited
                                    if (cached && cached.parentScope !== parentScope) {
                                        cache.push(cached);
                                        cached = null;
                                    }
                                    // If it has not, render a new element and prepare its scope
                                    // We also cache a reference to its branch node which will
                                    // be used as the parentNode in the next level of recursion
                                    if (!cached) {
                                        transclude(parentScope.$new(), function (clone, childScope) {
                                            childScope[childExpr] = child;
                                            cached = {
                                                scope: childScope,
                                                parentScope: parentScope,
                                                element: clone[0],
                                                branch: clone.find(branchExpr)[0]
                                            };
                                            var element = $(cached.element);
                                            element.find('> a').click(function (ev) {
                                                /* Animation */
                                                var parent = $(ev.target);
                                                if (parent.find(".ink").length == 0)
                                                    parent.prepend("<span class='ink'></span>");
                                                var ink = parent.find(".ink");
                                                ink.removeClass("animate");
                                                if (!ink.height() && !ink.width()) {
                                                    var d = Math.max(parent.outerWidth(), parent.outerHeight());
                                                    ink.css({ height: d, width: d });
                                                }
                                                var x = ev.pageX - parent.offset().left - ink.width() / 2;
                                                var y = ev.pageY - parent.offset().top - ink.height() / 2;
                                                ink.css({ top: y + 'px', left: x + 'px' }).addClass("animate");
                                                setTimeout(function () {
                                                    $('ul.sidenav').find('.ink').remove();
                                                }, 500);
                                                /* Expanding tree */
                                                if (element.hasClass('parent')) {
                                                    //$(this).removeAttr('href');
                                                    if (element.hasClass('open')) {
                                                        element.removeClass('open');
                                                        element.find('li').removeClass('open');
                                                        element.find('ul.submenu').slideUp();
                                                    }
                                                    else {
                                                        element.addClass('open');
                                                        element.children('ul.submenu').slideDown();
                                                        element.siblings('li').children('ul.submenu').slideUp();
                                                        element.siblings('li').removeClass('open');
                                                        element.siblings('li').find('li').removeClass('open');
                                                        element.siblings('li').find('ul.submenu').slideUp();
                                                    }
                                                }
                                            });
                                            // This had to happen during transclusion so inherited
                                            // controllers, among other things, work properly
                                            parentNode.insertBefore(cached.element, cursor);
                                        });
                                    }
                                    else if (cached.element !== cursor) {
                                        parentNode.insertBefore(cached.element, cursor);
                                    }
                                    // Lets's set some scope values
                                    childScope = cached.scope;
                                    // Store the current depth on the scope in case you want
                                    // to use it (for good or evil, no judgment).
                                    childScope.$depth = depth;
                                    // Emulate some ng-repeat values
                                    childScope.$index = i;
                                    childScope.$first = (i === 0);
                                    childScope.$last = (i === last);
                                    childScope.$middle = !(childScope.$first || childScope.$last);
                                    // Push the object onto the new cache which will replace
                                    // the old cache at the end of the walk.
                                    currentCache.push(cached);
                                    // If the child has children of its own, recurse 'em.
                                    grandchildren = child[childrenExpr];
                                    if (grandchildren && grandchildren.length) {
                                        walk(grandchildren, cached.branch, childScope, depth + 1);
                                    }
                                }
                            })(root, rootElement, scope, 0);
                            // Cleanup objects which have been removed.
                            // Remove DOM elements and destroy scopes to prevent memory leaks.
                            var i = cache.length;
                            while (i--) {
                                var cached = cache[i];
                                if (cached.scope) {
                                    cached.scope.$destroy();
                                }
                                if (cached.element) {
                                    cached.element.parentNode.removeChild(cached.element);
                                }
                            }
                            // Replace previous cache.
                            cache = currentCache;
                        }, true);
                    };
                }
            };
        });
    };
    return sidenav;
});
