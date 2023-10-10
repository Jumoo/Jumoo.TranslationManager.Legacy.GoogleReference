(function() {

	function jobSetupDirective() {

		var directive = {
			restrict: 'E',
			replace: true,
			templateUrl: Umbraco.Sys.ServerVariables.translatePlus.Plugin + "Directives/jobSetup.html",
			scope: {  
				job: '=',
				options: '=',
                items: '=',
                sendto: '='
			},
			link: link,
			controller: controller
		};

		return directive;

		///////////////////
		function link(scope, el, attr, ctrl) {
			scope.$watch('options', function (newVal, oldVal) {
				if (newVal !== undefined) {
                    if (scope.options.singleProvider) {
						scope.getProvider(scope.options.key);
					}
					else {
						scope.getProviders();
					}
				}
            }, true);
		}

		function controller($scope, translateJobService) {

			$scope.getProvider = getProvider;
			$scope.getProviders = getProviders;

			////////////////
			function getProviders() {
				translateJobService.getProviders()
					.then(function (result) {
						$scope.providers = result.data;
					});
			}

            function getProvider(key) {
                if (key != null && key !== '00000000-0000-0000-0000-000000000000') {

                    if ($scope.job.provider == null || key !== $scope.job.provider.Key) {
                        translateJobService.getProvider(key)
                            .then(function (result) {
                                $scope.job.provider = result.data;
                            });
                    }
                }
                else {
                    $scope.job.provider = null;
                }
			}

		}
	}

	angular.module('umbraco.directives')
		.directive('translateJobSetup', jobSetupDirective);

})();