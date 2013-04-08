'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', []).
  config(function($routeProvider) {
    $routeProvider.
      when('/', {controller:KarmaKtrl, templateUrl:'aside.html'}).
    	otherwise({redirectTo:'/'});
  });