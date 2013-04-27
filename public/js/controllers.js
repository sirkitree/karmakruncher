'use strict';

/* Controllers */

function KarmaKtrl ($scope, $http, socket) {

  // Socket listeners

  socket.on('init', function (data) {
    // sort the data from the api's response and set as our $scope for Angular
    $scope.nicks = data.nicks.sort(function(a,b) { return parseFloat(b.karma) - parseFloat(a.karma) } );

    // call our chart function to draw our chart
    if ($scope.nicks) {
      d3Chart($scope.nicks);  
    }
  });

  socket.on('data:update', function (data) {
    // sort the data from the api's response and set as our $scope for Angular
    $scope.nicks = data.nicks.sort(function(a,b) { return parseFloat(b.karma) - parseFloat(a.karma) } );

    // call our chart function to draw our chart
    if ($scope.nicks) {
      d3Chart($scope.nicks);  
    }
  });

  // Methods published to scope

  $scope.dataUpdate = function () {
    $http.get('/data.json').
    success(function(data, status, headers, config) {
      // sort the data from the api's response and set as our $scope for Angular
      $scope.nicks = data.nicks.sort(function(a,b) { return parseFloat(b.karma) - parseFloat(a.karma) } );

      // call our chart function to draw our chart
      if ($scope.nicks) {
        d3Chart($scope.nicks);
      }
      
    });

    socket.emit('data:update', {
      nicks: $scope.nicks
    });
  };

}
