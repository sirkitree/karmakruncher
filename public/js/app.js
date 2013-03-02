'use strict';


// Declare app level module which depends on filters, and services
angular
  .module('myApp', [])
  .config(
    [
      '$routeProvider', 
      '$locationProvider', 
      function($routeProvider, $locationProvider) {
        $routeProvider
        	.when('/karmak', { controller: KarmaKtrl })
        	.otherwise({ redirectTo: '/karmak' });
        $locationProvider.html5Mode(true);
      }
    ]
  );