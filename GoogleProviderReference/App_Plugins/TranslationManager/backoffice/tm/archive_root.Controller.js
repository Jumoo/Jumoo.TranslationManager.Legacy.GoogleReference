/**
 * @ngdoc controller
 * @name translate.archiveRootController
 * @function
 * 
 * @description
 * Controller for the root view.
 */
(function () {
    'use strict';

    function rootController($scope, $routeParams
        , translateJobService, translateTitleService) {
        var vm = this;
        vm.pageTitle = "Archive";
        vm.open = {};

        translateTitleService.setTitle();

        loadJobInfo();

        function loadJobInfo() {
            translateJobService.getSummaryRange(20, 32)
                .then(function (result) {
                    vm.info = result.data;
                });
        }

    }

    angular.module('umbraco')
        .controller('translate.archiveRootController', rootController);
})(); 