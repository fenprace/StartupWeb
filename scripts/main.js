baseUrl = 'http://startupweb.ap01.aws.af.cm/'

app = angular.module('startupNews', ['angular-cache']);

app.factory('startupApi', function($http, $q, $angularCacheFactory) {
  $angularCacheFactory('defaultCache', {
    aggressiveDelete: true,
    cacheFlushInterval: 600000,
    maxAge: 90000,
    storageMode: 'localStorage'
  });
  
  return {
    home: function(loadCache) {
      delay = $q.defer();
      cache = $angularCacheFactory.get('defaultCache')
      
      if (loadCache === true &&  cache.get('home')) {
        delay.resolve(cache.get('home'));
      } else {
        $http.get(baseUrl + 'home', { cache: true }).success(function(res) {
          cache.put('home', res, { maxAge: 90000 });
          delay.resolve(res);
        });
      }
      return delay.promise;
    }
  }
});

app.config(function($routeProvider) {
  $routeProvider.when('/', {
    template: '<stories></stories>',
  }).when('/about', {
    templateUrl: 'templates/about.html',
  })
});

app.controller('HeaderCtrl', ['$scope', '$location',
  function($scope, $location) {
    if ($location.path() === '/') {
      $scope.leftText = 'About';
      $scope.leftHref = '#/about'
      $scope.showRightButton = true;
      $scope.rightButton = 'Refresh';
    } else if ($location.path() === '/about') {
      $scope.leftText = 'Home';
      $scope.leftHref = '#/'
      $scope.showRightButton = false;
    }
  }]);

app.controller('StoriesCtrl', ['$scope', 'startupApi',
  function($scope, startupApi) {
    startupApi.home(true).then(function(data) {
      $scope.$emit('loaded', data);
    });
    
    $scope.refresh = function() {
      $scope.$emit('loading');
      startupApi.home(false).then(function(data) {
        $scope.$emit('loaded', data);
      });
    };
    
    $scope.$on('loading', function() {
      $('.more').text('Loading...');
      $('stories td:not(.more)').hide();
    });
    
    $scope.$on('loaded', function(event, data) {
      $scope.stories = data;
      $('stories td:not(.more)').show();
      $('.more').text('More...');
    });
    
    $('.refresh').click($scope.refresh);
  }]);

app.directive('pageHeader', function() {
  return {
    restrict: 'E',
    replace: true,
    controller: 'HeaderCtrl',
    templateUrl: 'templates/page-header.html'
  }
});

app.directive('stories', function(startupApi) {
  return {
    restrict: 'E',
    templateUrl: 'templates/stories.html',
    controller: 'StoriesCtrl'
  }
});