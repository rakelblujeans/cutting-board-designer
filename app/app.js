'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  angularDragula(angular),
  'pouchdb',
  'ngRoute',
  'myApp.view1',
  'myApp.cuttingBoard',
  'myApp.version'
])

.service('service', function(pouchDB) {
  var db = pouchDB('name');
})

.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/view1'});
}]);

