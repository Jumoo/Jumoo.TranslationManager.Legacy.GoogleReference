(function () {
    'use strict';

    function settingsController($scope, notificationsService,
        translateSettingsService) {

        var vm = this;

        vm.page = {
            title: 'Settings',
            description: 'Translate settings',
            tabs: [
                {
                    id: 1,
                    label: 'Setup',
                    alias: 'tab1',
                    active: false,
                    view: Umbraco.Sys.ServerVariables.translatePlus.BackOffice + 'settings/settings_tab.html'
                },
                {
                    id: 2,
                    label: 'Notifications',
                    alias: 'tab3',
                    active: true,
                    view: Umbraco.Sys.ServerVariables.translatePlus.BackOffice + 'settings/notify_tab.html'
                },
                {
                    id: 5,
                    label: 'Diagnostics',
                    alias: 'tab5',
                    active: false,
                    view: Umbraco.Sys.ServerVariables.translatePlus.BackOffice + 'settings/diag_tab.html'
                }
            ]
        };

        vm.notifications = {
            submitted: "test@jumoo.co.uk", recevied: "", approved: ""
        };

        vm.getSettings = getSettings;
        vm.saveSettings = saveSettings;
        vm.licenced = false;
        vm.validLicence = false; 
        vm.info = {};

        init(); 


        //////////////////////////////////
        function init() {
            getSettings(true);

            translateSettingsService.getTabs()
                .then(function (result) {
                    angular.forEach(result.data, function (tab, key) {
                        vm.page.tabs.push(tab);
                    });
                });

            getInfo();
            getUpdateInfo();          
        }

        function getSettings(init) {
            translateSettingsService.getSettings()
                .then(function (result) {
                    vm.settings = result.data;
                    if (init) {
                        insertLicenceTab(vm.settings.HideLicenceTab);
                    }
                }, function (error) {
                    notificationsService.error("Error", error.data.ExceptionMessage);
                });
        }

        function saveSettings(settings) {
            translateSettingsService.saveSettings(settings)
                .then(function (result) {
                    notificationsService.success("Saved", "Settings saved");
                    $scope.settingsConfig.$dirty = false; 
                    getSettings(false);
                }, function (error) {
                    notificationsService.error("Error", error.data.ExceptionMessage);
                });
        }

        function getInfo() {
            translateSettingsService.getInfo()
                .then(function (result) {
                    vm.info = result.data;
                })
        }

        function getUpdateInfo() {
            translateSettingsService.getUpdateInfo()
                .then(function (result) {
                    vm.update = result.data;

                    if (vm.info.CoreVersion < vm.update.Version) {
                        vm.uptodate = false;
                    }
                    else {
                        vm.uptodate = true;
                    }
                }, function (error) {
                    // can't get an update
                })
        }

        function insertLicenceTab(hideTab) {
            if (!hideTab) {
                vm.page.tabs.push({
                    id: 4,
                    label: 'Licence',
                    alias: 'tab4',
                    active: false,
                    view: Umbraco.Sys.ServerVariables.translatePlus.BackOffice + 'settings/licence_tab.html'
                });
            }
        }


    }

    angular.module('umbraco')
        .controller('translateSettingsController', settingsController);
})();