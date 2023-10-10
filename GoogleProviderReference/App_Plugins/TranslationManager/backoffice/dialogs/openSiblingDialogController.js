(function () {
    'use strict';

    function openSiblingController($scope, navigationService, dialogService, translateJobService) {

        var vm = this;
        vm.scope = $scope;
        vm.item = $scope.dialogData; 
        vm.loading = true;

        vm.showNav = siblingNav;
        vm.returnToOriginal = returnToOriginal;

        translateJobService.getOpenSiblings(vm.item.Id)
            .then(function (result) {
                vm.siblings = result.data;
                vm.loading = false; 
            });

        function siblingNav(node) {
            if (node.JobId > 0) {
                window.location.href = "#/translationManager/tm/job/" + node.JobId;
                return;
            }

            if (node.JobId == 0 && node.Id > 0) {
                window.location.href = "#/translationManager/tm/item/" + node.Id;
                return;
            }
        }

        function returnToOriginal () {
            window.location.href = "#/translationManager/tm/item/" + vm.item.Id;
            vm.scope.close();
        }
    }

    angular.module('umbraco')
        .controller('translateOpenSiblingDialogController', openSiblingController);


})();