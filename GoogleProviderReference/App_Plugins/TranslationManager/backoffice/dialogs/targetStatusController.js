(function () {

    function targetStatusController($scope, $routeParams,
        translateJobService, notificationsService, navigationService ) {

        var vm = this;
        vm.loaded = false;
        vm.status = [];
        vm.nodeName = $scope.currentNode.name;

        vm.node = $scope.dialogOptions.currentNode;

        vm.loadStatus = loadStatus;
        vm.historyNav = historyNav;
        vm.showStatus = showStatus;

        vm.loadStatus(vm.node.id);

        function loadStatus(id) {

            translateJobService.getTargetStatus(id)
                .then(function (result) {
                    vm.status = result.data;
                    vm.loaded = true;
                }, function (error) {
                    notificationsService
                        .error('load', "can't get status for this node");
                });
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
        .controller('translate.targetStatusController', targetStatusController);

})();