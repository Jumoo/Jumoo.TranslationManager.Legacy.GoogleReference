(function () {
    'use strict';

    function translateHub($rootScope, $q, assetsService) {

        var scripts = [
            "/App_Plugins/TranslationManager/libs/jquery.signalR.min.js",
            "/umbraco/backoffice/signalr/hubs"];


        var resource = {
            initHub: initHub
        };

        return resource;

        ///////////////////

        function initHub(callback) {
            if ($.connection == undefined) {
                var promises = [];
                scripts.forEach(function (script) {
                    promises.push(assetsService.loadJs(script));
                });

                $q.all(promises)
                    .then(function () {
                        if ($.connection.translationManagerHub != undefined) {
                            hubSetup(callback);
                        }
                        else {
                            console.warn('Could not get umbraco SignalR hub - check your OWIN Configure code');
                            console.log('SignalR Hub Missing - Progress will not be shown');
                        }
                    });
            }
            else {
                if ($.connection.translationManagerHub != undefined) {
                    hubSetup(callback);
                }
            }
        }


        function hubSetup(callback) {

            var proxy = $.connection.translationManagerHub;

            var hub = {
                start: function () {
                    $.connection.hub.start();
                },
                on: function (eventName, callback) {
                    proxy.on(eventName, function (result) {
                        $rootScope.$apply(function () {
                            if (callback) {
                                callback(result);
                            }
                        });
                    });
                },
                invoke: function (methodName, callback) {
                    proxy.invoke(methodName)
                        .done(function (result) {
                            $rootScope.$apply(function () {
                                if (callback)
                                    callback(result);
                            });
                        });
                }
            }

            return callback(hub);
        };
    }

    angular.module('umbraco.resources')
        .factory('translateHub', translateHub);

})();

