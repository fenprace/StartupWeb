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
    home: function() {
      delay = $q.defer();
      cache = $angularCacheFactory.get('defaultCache')
      
      if (cache.get('home')) {
        delay.resolve(cache.get('home'))
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

app.directive('stories', function(startupApi) {
  return {
    templateUrl: 'templates/stories.html',
    link: function(scope, element, attrs) {
      startupApi.home().then(function(data) {
        scope.stories = data;
      });
    }
  }
});
