/// <reference path="include/angular.d.ts"/>
/// <reference path="include/jqueryui.d.ts"/>
/// <amd-dependency path="angular-ui-router"/>
/// <amd-dependency path="angular-ui-sortable"/>
/// <amd-dependency path="jquery-ui"/>
/// <amd-dependency path="slidebars"/>
define(["require", "exports", 'angular', 'jquery', "angular-ui-router", "angular-ui-sortable", "jquery-ui", "slidebars"], function (require, exports, angular, $) {
    var Layout = (function () {
        function Layout() {
        }
        Layout.module = function () {
            if (this.ngModule != null)
                return this.ngModule;
            this.ngModule = angular.module('coffeeLayout', ['ui.router', 'coffeeRest']);
            this.ngModule.config(['$stateProvider', '$locationProvider', function ($stateProvider, $locationProvider) {
                $stateProvider.state('main', {
                    url: '/',
                    templateUrl: 'app/templates/main.content.html',
                    controller: 'CoffeeMainContentCtrl'
                });
                $locationProvider.html5Mode(true);
            }]).controller('CoffeeSidebarCtrl', ['$scope', '$element', function ($scope, $element) {
                /* TODO: rewrite with angular-ui */
                /*            $element.resizable({
                                handles: 'e',
                                maxWidth: 350,
                                minWidth: 240
                            });
                            $element.find('> .scrollable').css({height: ($element.height() - 50)})*/
            }]).controller('CoffeeHeaderCtrl', ['$scope', '$coffee', '$user', function ($scope, $coffee, $user) {
                $coffee.config.get({ section: 'meta' }, function (data) {
                    //angular.extend($scope, data);
                    $scope.siteTitle = data.siteTitle;
                    $scope.user = $user;
                    /* FIXME: Why? */
                    $scope.$on('user:logout', function (ev) {
                        $scope.user.unSet();
                    });
                });
            }]).controller('LogoutCtrl', ['$scope', '$coffee', '$rootScope', function ($scope, $coffee, $rootScope) {
                $scope.doLogout = function () {
                    $coffee.authLogout('CoffeestudioAccessBundle:User').success(function (data) {
                        if (data.type == 'value' && data.value == true) {
                            $rootScope.$broadcast('user:logout', {});
                        }
                    });
                };
            }]).controller('AuthCtrl', ['$scope', '$coffee', '$user', '$rootScope', '$notify', function ($scope, $coffee, $user, $rootScope, $notify) {
                $scope.login = null;
                $scope.password = null;
                $scope.doLogin = function () {
                    $coffee.authLogin('CoffeestudioAccessBundle:User', $scope.login, $scope.password).success(function (data) {
                        if (data.type == 'model' && data.model.length > 0) {
                            var userdata = data.model[0];
                            $user.set(userdata.id, userdata.username);
                            $rootScope.$broadcast('user:login', $user);
                            $notify.push('Успешный вход', true);
                        }
                        else {
                            $notify.push('Ошибка авторизации', false);
                        }
                    });
                };
            }]).controller('CoffeeMainContentCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
            }]).directive('restricted', ['$user', function ($user) {
                return {
                    restrict: 'A',
                    transclude: true,
                    link: function (scope, elem, attrs, ctrl, transclude) {
                        var showUserBlocks = function () {
                            transclude(scope, function (html) {
                                elem.append(html);
                            });
                        };
                        if ($user.isSet()) {
                            showUserBlocks();
                        }
                        scope.$on('user:login', function (ev, user) {
                            showUserBlocks();
                        });
                        scope.$on('user:logout', function (ev) {
                            elem.empty();
                        });
                    }
                };
            }]).directive('nologin', ['$user', function ($user) {
                return {
                    restrict: 'A',
                    transclude: true,
                    link: function (scope, elem, attrs, ctrl, transclude) {
                        var showUserBlocks = function () {
                            transclude(scope, function (html) {
                                elem.append(html);
                            });
                        };
                        if ($user.notSet()) {
                            showUserBlocks();
                        }
                        scope.$on('user:login', function () {
                            elem.empty();
                        });
                        scope.$on('user:logout', function () {
                            showUserBlocks();
                        });
                    }
                };
            }]).factory('$notify', ['$rootScope', function ($rootScope) { return new Notificator($rootScope); }]).factory('$user', ['$coffee', '$rootScope', function ($coffee, $rootScope) {
                var $user = new User(0, null);
                $coffee.auth.get({ name: 'CoffeestudioAccessBundle:User', method: 'check' }, function (data) {
                    if (data.type == 'model' && data.model.length > 0) {
                        var userdata = data.model[0];
                        $user.set(userdata.id, userdata.username);
                        $rootScope.$broadcast('user:login', $user);
                    }
                });
                return $user;
            }]).directive('coffeeFlash', function () {
                return {
                    restrict: 'A',
                    transclude: true,
                    scope: true,
                    link: function (scope, elem, attrs, ctrl, transclude) {
                        scope.$on('notice:new', function (ev, data) {
                            scope.message = data.message;
                            scope.success = data.success;
                            scope.show = true;
                            $(elem).fadeIn(500).delay(500).fadeOut(500, function () {
                                scope.show = false;
                            });
                        });
                        transclude(scope, function (el) {
                            elem.append(el);
                        });
                    }
                };
            });
            return this.ngModule;
        };
        Layout.ngModule = null;
        return Layout;
    })();
    var mod = Layout.module();
    var User = (function () {
        function User(id, username) {
            this.set(id, username);
        }
        User.prototype.set = function (id, username) {
            this.id = id;
            this.username = username;
        };
        User.prototype.isSet = function () {
            return this.id > 0;
        };
        User.prototype.notSet = function () {
            return !this.isSet();
        };
        User.prototype.unSet = function () {
            this.id = 0;
            this.username = null;
        };
        return User;
    })();
    var Notificator = (function () {
        function Notificator($rootScope) {
            this.messages = [];
            this.msgCount = 0;
            this.$rootScope = $rootScope;
        }
        Notificator.prototype.push = function (message, success) {
            if (success === void 0) { success = true; }
            var msg = new NMessage(message, success);
            this.messages.push(msg);
            this.msgCount++;
            this.$rootScope.$broadcast('notice:new', msg);
            return msg;
        };
        Notificator.prototype.getLastMessage = function () {
            if (this.msgCount == 0)
                return null;
            return this.messages[this.msgCount - 1];
        };
        return Notificator;
    })();
    var NMessage = (function () {
        function NMessage(message, success) {
            if (success === void 0) { success = true; }
            this.success = true;
            this.message = message;
            this.success = success;
        }
        return NMessage;
    })();
    /* TODO: Move to angular */
    $(document).ready(function () {
        $(window).resize(function () {
            var sideWidth = $('#aside').width();
            $('.adm-container').css({
                'padding-left': sideWidth,
                'padding-top': $('header').height()
            });
            $('.logotype').width(sideWidth);
            $('.head-blocks').css({ 'margin-left': sideWidth });
            $('.scrollable').css({ height: ($('#aside').height() - 50) });
        });
        $('.adm-container').css({ 'padding-top': $('header').height() });
        var mySlidebars = new $.slidebars();
        $('.adm-handle').on('click', function () {
            mySlidebars.slidebars.toggle('left');
        });
        var parent, ink, d, x, y;
    });
    return mod;
});
