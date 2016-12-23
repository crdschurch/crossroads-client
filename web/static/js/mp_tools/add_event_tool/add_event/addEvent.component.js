import controller from './addEvent.controller';
import template from './add_event.html';

export default function addEventComponent() {
  return {
    restrict: 'E',
    bindings: {
      eventData: '='
    },
    template,
    controller,
    controllerAs: 'evt'
  };
}
