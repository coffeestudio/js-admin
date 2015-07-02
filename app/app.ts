/// <reference path="include/jquery.d.ts"/>
/// <reference path="include/angular.d.ts"/>
/// <amd-dependency path="angular-animate"/>


import $ = require("jquery");
import angular = require('angular');
import widgets = require('widgets/widgets');
import layout = require('layout');
import elements = require('elements');
import rest = require('coffee-rest');
import content = require('content');

angular.bootstrap($('body'), [layout.name, elements.name, widgets.name, rest.name, content.name, 'ngAnimate']);

console.log('Welcome to the CoffeeStudio admin system!');