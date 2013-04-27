'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('myApp', []).
  config(function($routeProvider) {
    $routeProvider.
      when('/', {controller:KarmaKtrl, templateUrl:'aside.html'}).
    	otherwise({redirectTo:'/'});
  });