/**
 * @ngdoc service
 * @name translateNodeService
 * @function
 * 
 * @description
 * Service for creating the translation nodes
 */

(function() {
    'use strict';

    // var serviceRoot = "backoffice/translateplus/translationNodeApi/";
    

    function nodeService($http) {

        var serviceRoot = Umbraco.Sys.ServerVariables.translatePlus.NodeService;

        var service = {
            getNode : getNode,
            getNodes : getNodes,
            getAllNodesByStatus: getAllNodesByStatus,
            getNodesByStatus: getNodesByStatus,
            getCultures: getCultures,
            getSummaryInfo: getSummaryInfo,
            getPaths: getPaths,

            getCurrentVersion: getCurrentVersion,
            getLastKnownGood: getLastKnownGood,
            
            remove: remove,
            removeAll: removeAll,

            removeProperty: removeProperty,
            saveProperty: saveProperty,
            updateProperties: updateProperties,

            create: create,
            createFromTarget: createFromTarget,

            getContentIds: getContentIds,
            createBatch: createBatch,
            createBatchFromTarget: createBatchFromTarget
        };

        return service;

        /////////////////
        function getNode(id) {
            return $http.get(serviceRoot + "GetNode/" + id);
        }

        function getNodes(cultureId) {
            return $http.get(serviceRoot + "GetNodesByCultureId/" + cultureId);
        }

        function getAllNodesByStatus(cultureId, status) {
            return $http.get(serviceRoot + "GetAllNodesByCultureAndStatus/" + cultureId + "?status=" + status);
        }

        function getNodesByStatus(cultureId, status, page) {
            return $http.get(serviceRoot + "GetNodesByCultureAndStatus/" + cultureId + "?status=" + status + "&page=" + page);
        }

        function getCultures() {
            return $http.get(serviceRoot + "GetCultures");
        }

        function getCurrentVersion(id) {
            return $http.get(serviceRoot + "GetCurrentVersion/" + id);
        }

        function getLastKnownGood(id) {
            return $http.get(serviceRoot + "GetLastKnownGood/" + id);
        }

        function remove(id) {
            return $http.post(serviceRoot + "Remove/" + id);
        }

        function removeAll(cultureId) {
            return $http.post(serviceRoot + "RemoveAll/" + cultureId);
        }

        function removeProperty(id) {
            return $http.post(serviceRoot + "RemoveProperty/" + id);
        }

        function create(contentId, options) {
            return $http.post(serviceRoot + "Create/" + contentId, options);
        }

        function createFromTarget(contentId, options) {
            return $http.post(serviceRoot + "CreateFromTarget/" + contentId, options);
        }

        function getSummaryInfo(status) {
            return $http.get(serviceRoot + "GetSummaryInfo?status=" + status);
        }

        function saveProperty(nodeId, property) {
            return $http.post(serviceRoot + "SaveProperty/" + nodeId, property);
        }

        function updateProperties(nodeId, properties) {
            return $http.post(serviceRoot + "UpdateProperties/" + nodeId, properties);
        }

        function getPaths(nodes) {
            return $http.post(serviceRoot + "NodePaths/", nodes);
        }

        /// batch based processing
        function getContentIds(contentId, options) {
            return $http.post(serviceRoot + "GetContentIds/" + contentId, options);
        }

        function createBatch(request) {
            return $http.post(serviceRoot + "CreateBatch", request);
        }

        function createBatchFromTarget(request) {
            return $http.post(serviceRoot + "CreateBatchFromTarget", request);
        }

    }

    angular.module('umbraco.resources')
        .factory('translateNodeService', nodeService);
})();