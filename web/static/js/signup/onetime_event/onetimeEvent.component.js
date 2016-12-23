(function() {
  'use strict';

  module.exports = OnetimeEvent;

  OnetimeEvent.$inject = [];

  function OnetimeEvent() {
    return {
      restrict: 'E',
      templateUrl: 'onetime_event/onetimeEvent.html',
      scope: {
        cmsInfo: '=',
        group: '=',
        family: '='
      },
      controller: OnetimeEventController,
      controllerAs: 'onetimeEvent',
      bindToController: true
    };

    function OnetimeEventController() {
      var vm = this;
      vm.pageInfo = vm.cmsInfo.pages[0];
      vm.family = _.filter(vm.family, function(f) {
        return (f.age >= vm.group.minAge) || (f.age === 0);
      });

      vm.events = _.chain(vm.group.events).filter(function(event) {
        var start = moment(event.startDate);
        var now = moment();
        return start.isAfter(now);
      }).sortBy('startDate').value();
    }
  }

})();
