/**
 * @ngdoc controller
 * @name translate.submittedRootController
 * @function
 * 
 * @description
 * Controller for the root view.
 */
(function() {
    'use strict';

    function rootController($scope, $routeParams
        , translateJobService, translateTitleService) 
    {
        var vm = this;
        vm.pageTitle = "Submitted";
        vm.open = {};

        loadJobInfo(); 

        translateTitleService.setTitle();

        ////////////////

        function loadJobInfo() {
            translateJobService.getSummaryRange(1, 9)
                .then(function(result) {
                    vm.info = result.data;
                });
        }

    }

    angular.module('umbraco')
        .controller('translate.submittedRootController', rootController);
})(); 