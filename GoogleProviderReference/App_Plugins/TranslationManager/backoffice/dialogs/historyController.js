/*
 * 
 */

(function () {

    function historyController(
        $scope, $routeParams,
        notificationsService, navigationService, dialogService, contentResource,
        translateNodeService, translateJobService) {

        var vm = this;
        vm.loaded = false;
        vm.status = [];
        vm.nodeName = $scope.currentNode.name;

        vm.node = $scope.dialogOptions.currentNode;

        vm.loadHistory = loadHistory;
        vm.historyNav = historyNav;
        vm.showStatus = showStatus;

        vm.loadHistory(vm.node.id);

        /////////////
        function loadHistory(id) {

            translateJobService.getStatusForContent(id)
                .then(function (result) {
                    vm.status = result.data;
                    vm.loaded = true;
                }, function (error) {
                    notificationsService
                        .error('load', "can't get status for this node");
                });


            contentResource.getById(id)
                .then(function (data) {
                    vm.content = data;
                    vm.lastUpdate = moment(vm.content.updateDate).local().toDate();
                });    
            /*
            translateNodeService.getCurrentVersion(id)
                .then(function (result) {
                    vm.history = result.data;
                    vm.loaded = true;
                }, function (error) {
                    notificationsService
                        .error('load', "can't load history for this node");
                });

            translateNodeService.getLastKnownGood(id)
                .then(function (result) {
                    vm.last = result.data;
                    vm.loaded = true;
                }, function (error) {
                    notificationsService
                        .error('load', "can't load last known good for this node");
                }); 
            */
        }

        function historyNav(node) {
            if (node.JobId > 0) {
                navigationService.hideDialog();
                window.location.href = "#/translationManager/tm/job/" + node.JobId;
                return;
            }

            if (node.JobId == 0 && node.Id > 0) {
                navigationService.hideDialog();
                window.location.href = "#/translationManager/tm/item/" + node.Id;
                return;
            }
        }

        function showStatus(status) {
            if (status == 'Open') {
                return 'Pending';
            }
            return status;
        }

    }

    angular.module('umbraco')
        .controller('translate.historyController', historyController);
})();