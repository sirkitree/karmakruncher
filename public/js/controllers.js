'use strict';

/* Controllers */

function KarmaKtrl($scope, $http) {
  $http({method: 'GET', url: '/api/nicks'})
    .success(function(data, status, headers, config) {
      // sort the data from the api's response and set as our $scope for Angular
      $scope.nicks = data.nicks.sort(function(a,b) { return parseFloat(b.karma) - parseFloat(a.karma) } );

      // call our chart function to draw our chart
      if ($scope.nicks) {
        d3Chart($scope.nicks);  
      }
      
    })
    .error(function(data, status, headers, config) {
      $scope.nicks = 'Error!'
    });
}
