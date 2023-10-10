(function () {

    'use strict';

    function titleService($rootScope, $location, localizationService) {

        var service = {
            setTitle: setTitle
        };

        return service;

        ////////////////////

        function setTitle() {
            localizationService.localize("sections_translationManager")
                .then(function (value) {
                    $rootScope.locationTitle = value + " - " + $location.$$host;
                });
           
        }
    }

    angular.module('umbraco.resources')
        .factory('translateTitleService', titleService);



})();