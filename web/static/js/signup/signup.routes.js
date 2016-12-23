(function() {
  'use strict';

  module.exports = SignupRoutes;

  SignupRoutes.$inject = ['$stateProvider', '$urlMatcherFactoryProvider', '$locationProvider'];

  function SignupRoutes($stateProvider, $urlMatcherFactory, $locationProvider) {

    crds_utilities.preventRouteTypeUrlEncoding($urlMatcherFactory, 'signupRouteType', /\/sign-up\/.*$/);

    $stateProvider.state('signup', {
      parent: 'noSideBar',
      url: '{link:signupRouteType}',
      template: '<crds-signup></crds-signup>',
      data: {
        isProtected: true,
        meta: {
          title: 'Signup Page',
          description: ''
        }
      },
      resolve: {
        loggedin: crds_utilities.checkLoggedin,
        $stateParams: '$stateParams',
        Page: 'Page',
        SignupService: 'SignupService',
        $q: '$q',
        Group: 'Group',
        ServeOpportunities: 'ServeOpportunities',
        Lookup: 'Lookup',
        Family: function(SignupService, ServeOpportunities) {
          return ServeOpportunities.Family.query({}, function(data) {
            SignupService.family = data;
          }).$promise;
        },

        Locations: function(SignupService, Lookup) {
          return Lookup.query({
            table: 'crossroadslocations'
          }, function(data) {
            SignupService.locations = data;
          }).promise;
        },

        CmsInfo: function($q, Page, SignupService, Group, $stateParams) {
          var deferred = $q.defer();
          var link = addTrailingSlashIfNecessary($stateParams.link);
          Page.get({url: link}).$promise.then(function(data) {
            if (data.pages.length === 0) {
              deferred.reject();
            }

            SignupService.cmsInfo = data;

            Group.Detail.get({groupId: data.pages[0].group}).$promise.then(function(group) {
                SignupService.group = group;
                deferred.resolve();
              },

              function() {
                deferred.reject();
              });
          },

          function() {
            deferred.reject();
          });

          return deferred.promise;
        },

      }
    });
  }

  function addTrailingSlashIfNecessary(link) {
    if (_.endsWith(link, '/') === false) {
      return link + '/';
    }

    return link;
  }

})();
