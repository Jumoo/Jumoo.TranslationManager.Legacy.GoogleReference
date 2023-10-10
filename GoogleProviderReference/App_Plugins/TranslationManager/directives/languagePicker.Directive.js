(function() {
	'use strict';

	function languagePickerDirective() {

		var directive = {
			restrict: 'E',
			replace: true,
			templateUrl: Umbraco.Sys.ServerVariables.translatePlus.Plugin + 'Directives/languagePicker.html',
			scope: {
                sets: '=',
                count: '='
			},
			link: link,
			controller: controller
		};

		return directive;

		//////////////////////////////

		function link(scope, el, attr, ctrl) {
		}

		function controller($scope) {

			
		    $scope.languageDropdown = showLanguageDropdown();
			$scope.addLanguage = addLanguage;
			$scope.removeLanguage = removeLanguage;
            $scope.languageCount = languageCount;
            $scope.updateCount = updateCount;

			////
            function addLanguage() {

                var selected = $scope.selectedSet.split('_');

				for (var i = 0; i < $scope.sets.length; i++) {
					for (var x = 0; x < $scope.sets[i].Sites.length; x++) {
						if (selected[0] == $scope.sets[i].Sites[x].Id && selected[1] == $scope.sets[i].Sites[x].CultureId)
						{
							$scope.sets[i].Sites[x].checked = true;
						}
					}
                }

                $scope.count = languageCount(true);
			}

			function removeLanguage($event, site) {
				$event.preventDefault();
				site.checked = false;
                $scope.count = languageCount(true);
            }

            function languageCount(checked) {
                var count = 0;
                for (var i = 0; i < $scope.sets.length; i++) {
                    for (var x = 0; x < $scope.sets[i].Sites.length; x++) {
                        if (!checked || $scope.sets[i].Sites[x].checked) {
                            count++;
                        }
                    }
                }
                return count;
            }

			function showLanguageDropdown() {			
                var count = languageCount(false);

				if (count >= 10) {
				    return true;
				}
				else {
				    return false;
				}
            }

            function updateCount() {
                $scope.count = languageCount(true);
            }
		}
	}

	angular.module('umbraco.directives')
		.directive('translateLanguagePicker', languagePickerDirective);
})();