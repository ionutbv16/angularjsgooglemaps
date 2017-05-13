(function () {
  'use strict';
 

  var app = angular
  .module('angularjstest')
  .config(function ($routeProvider,$locationProvider) {
    //$locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('');
    $routeProvider
      .when('/', {
        controller:'ItemsController',
		    templateUrl: 'views/items.html'
      })
       
      .otherwise({
        redirectTo: '/'
      });
  });


   

})();
