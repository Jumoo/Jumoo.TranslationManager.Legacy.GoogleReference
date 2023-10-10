(function () {
    'use strict';

    function dashboardController(
        $scope,
        translateSetService,
        translateSettingsService,
        translateTitleService) {
        var vm = this;
        vm.setup = true; 
        vm.info = '';
        vm.update = {};

        getSets();
        getVersion();
        getUpdateInfo();

        translateTitleService.setTitle();

        //////////////////

        function getSets() {
            translateSetService.list()
                .then(function (results) {
                    if (results.data.length == 0) {
                        vm.setup = false;
                    }
                }, function(error) {
                    // doh!
                });
        }

        function getVersion() {
            translateSettingsService.getInfo()
                .then(function (result) {
                    vm.info = result.data;
                });
        }

        function getUpdateInfo() {
            translateSettingsService.getUpdateInfo()
                .then(function (result) {
                    vm.update = result.data;
                }, function (error) {
                    // can't get an update
                })
        }

    }

    angular.module('umbraco')
        .controller('translateDashboard.controller', dashboardController);

})();