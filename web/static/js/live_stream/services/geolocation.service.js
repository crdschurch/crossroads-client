import Geolocation from '../models/geolocation';
import CONSTANTS from '../../constants';

export default class GeolocationService {
  /*@ngInject*/
  constructor($q, $rootScope, GoogleMapsService, $cookies) {
    this.q          = $q;
    this.rootScope  = $rootScope;
    this.mapService = GoogleMapsService;
    this.cookies    = $cookies;

    this.answered = false;
    this.inModal = this.showModal();
  }

  showModal() {
    return !this.hasLocation() && !this.hasDismissed();
  }

  showBanner() {
    // dismissed the modal w/o answering
    // OR you have previously answered
    return (this.hasDismissed() && !this.answered) || (this.hasLocation() && !this.answered);
  }

  saveLocation(location) {
    localStorage.setItem('crds-geolocation', JSON.stringify(location));

    let formKey = CONSTANTS.GEOLOCATION.FORMS_KEY;
    let url = `https://docs.google.com/forms/d/${formKey}/formResponse`;
    let data = {
      "entry.1874873182": location.lat,
      "entry.1547032910": location.lng,
      "entry.1403910056": location.count,
      "entry.692424241": location.zipcode,
      "entry.644514730": this.inModal ? "Modal": "Banner"
    };
    /**
     * Using $.ajax instead of $http as $http formats data as JSON,
     * this causes google forms to not accept the data
     */
    if (typeof $ !== 'undefined') {
      $.ajax({
        url: url,
        data: data,
        type: "POST",
        dataType: "xml"
      })
    }

  }

  retrieveZipcode(location) {
    let deferred = this.q.defer();

    this.mapService.reverseGeocode(location.lat, location.lng).then((response) => {
      if (response.length) {
        let zipcodes = [],
            country  = '';
        _.each(response, (location) => {
          _.each(location.address_components, (address) => {
            if (_.findIndex(address.types, (t) => { return t === 'country'}) >= 0) {
              country = address.long_name;
            }
            if (_.findIndex(address.types, (t) => { return t === 'postal_code'}) >= 0) {
              zipcodes.push(address.long_name);
            }
          })
        })

        // find the duplicate values from the zipcode array as its the most accurate
        let zipcode = _.first(_.transform(_.countBy(zipcodes), (result, count, value) => {
                      if (count > 1) result.push(value);
                    }, []));

        if (country !== 'United States') {
          zipcode = 'outside US';
        }

        location.zipcode = zipcode

        deferred.resolve(location);
      } else {
        deferred.reject('No Results')
      }

    }, (error) => {
      deferred.reject(error);
    });

    return deferred.promise;
  }

  hasLocation() {
    return localStorage.getItem('crds-geolocation') !== null;
  }

  hasDismissed() {
    return this.cookies.get('dismissedGeo') === "true";
  }

  getLocation() {
    let locationJson = localStorage.getItem('crds-geolocation');
    let location = null;
    if (locationJson) {
      location = Geolocation.build(JSON.parse(locationJson));
    }

    return location;
  }

  success() {
    this.answered = true;
    this.rootScope.$broadcast('geolocationModalDismiss');
  }

  dismissed() {
    this.answered = true;
    this.cookies.put('dismissedGeo', true);
    this.rootScope.$broadcast('geolocationModalDismiss')
  }
}
