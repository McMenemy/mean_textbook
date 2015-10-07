'use strict';

// Create controller
angular.module('example').controller('ExampleController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// Expose the authentication service
		$scope.authentication = Authentication;
	}
]);
