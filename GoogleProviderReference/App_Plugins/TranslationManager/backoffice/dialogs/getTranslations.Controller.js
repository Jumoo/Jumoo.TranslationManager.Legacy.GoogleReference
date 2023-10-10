/*
 * 
 * 
 * 
 * 
 */

(function () {
    'use strict';

    function getTranslationsController(
        $scope,
        $routeParams,
        notificationsService,
        navigationService,
        dialogService,
        translateNodeService,
        translateSetService,
        translateJobService,
        translateHub) {

        var vm = this;

        vm.nodeName = $scope.currentNode.name;
        vm.hasChildren = $scope.currentNode.hasChildren;
        vm.currentNode = $scope.currentNode;
        vm.node = $scope.dialogOptions.currentNode;

        vm.busy = true;
        vm.busyMsg = "processing";

        vm.error = false;
        vm.success = false;
        vm.nodecheck = false;

        vm.autoSend = false;
        vm.userAutoSend = false; 

        vm.step = 'pick';

        vm.batchSize = Umbraco.Sys.ServerVariables.translatePlus.Options.BatchSize;

        vm.options = {
            children: vm.hasChildren,
            unpublished: vm.hasChildren,
            sites: []
        };

        vm.createOptions = {
            singleProvider: false,
            key: ""
        };

        vm.job = {
            Name: "Translations $language$ " + new Date().toLocaleString(),
            TargetCulture: {},
            ProviderProperties: {},
            Provider: null,
            Status: 'Pending'
        };


        translateHub.initHub(function (hub) {
            vm.msgHub = hub;

            vm.msgHub.on('Add', function (data) {
                vm.update = data;
            });

            vm.msgHub.start();
        });


        //////////////////
        vm.loadSet = loadSet;
        vm.check = check;
        vm.createNodes = createNodes;
        vm.navigateToJob = navigateToJob;


        vm.loadSet(vm.node.id);

        ////////////////////////
        function loadSet(id) {
            translateSetService.getByTargetNode(id)
                .then(function (result) {
                    vm.sets = result.data;
                    vm.busy = false;

                    // if we have one set - pick it.
                    if (vm.sets.length == 1) {
                        vm.sets[0].checked = true;
                    }

                }, function (error) {
                    notificationsService
                        .error('load', "can't find any sets for this node");
                });
        }

        function check() {

            vm.busy = true;
            var sets = getSelectedSets(vm.sets);

            if (vm.userAutoSend) {

                vm.nodeItems = [];
                // add some nodes so the job view can tell what we are doing
                vm.nodeItems.push({ MasterNodeName: vm.node.name });
                if (vm.options.children == true) {

                    if (vm.currentNode.children != undefined) {
                        vm.currentNode.children.forEach(function (child) {
                            vm.nodeItems.push({ MasterNodeName: child.name });
                        });
                    }

                    vm.nodeItems.push({ MasterNodeName: "+ all child pages", Generic: true });
                }
                
                vm.busy = false;
                vm.step = 'job';
            }
            else {
                // just create pending nodes. 
                vm.createNodes();
            }
        }

        function createNodes() {
            vm.busy = true;

            vm.update = 'Extracting translation content';

            translateNodeService.getContentIds(vm.node.id, vm.options)
                .then(function (result) {
                    var ids = result.data;
                    vm.update = 'splitting ' + ids.length + ' into batches ';
                    var batches = createBatches(ids, vm.batchSize);

                    // once we have them in a batch - we don't do it by children anymore.
                    vm.options.children = false;

                    vm.update = 'creating nodes';
                    createNodesInBatch(batches, vm.options, function (nodes) {
                        vm.step = 'done';
                        vm.nodes = nodes;
                        if (vm.userAutoSend) {
                            createJobs(vm.nodes);
                        }
                        else {
                            vm.busy = false;
                        }
                    }, function (error) {
                        vm.error = {
                            errorMsg: "Translation failed",
                            data: error.data
                        };
                        vm.busy = false;
                    });
                });

            /*
            translateNodeService.createFromTarget(vm.node.id, vm.options)
                .then(function (result) {
                    vm.step = 'done';
                    vm.nodes = result.data;
                    if (vm.userAutoSend) {
                        createJobs(vm.nodes);
                    }
                    else {
                        vm.busy = false;
                    }
                }, function (error) {
                    vm.error = {
                        errorMsg: "Translation failed",
                        data: error.data
                    };
                    vm.busy = false;
                });
                */
        }

        // create the translations job
        function createJobs(nodes) {

            vm.nodeGroups = [];
            vm.jobs = [];

            if (nodes == undefined || nodes.length == 0) {
                // no nodes where created.
                vm.error = {
                    errorMsg: "No items",
                    data: { message: "No translation items have been created, so we cannot create a translation job" }
                };
                vm.step = 'done';
                vm.busy = false;
                return;
            }

            vm.busy = true;
            vm.update = "Submitting Translations";

            // group the nodes
            vm.nodeGroups = groupNodes(vm.nodes);

            // we submit a job for each of the node groups we have. 
            vm.nodeGroups.forEach(function (group) {

                group.status = 'submitted';

                translateJobService.create(group.jobName, group.nodes, vm.job.provider.Key, vm.job.ProviderProperties)
                    .then(function (result) {
                        vm.busy = false;
                        vm.jobs.push(result.data);
                        group.status = 'complete';
                    }, function (error) {
                        vm.error = {
                            errorMsg: "Create Failed",
                            data: error.data
                        };
                        group.status = 'failed';
                    });

                vm.busy = false;
            });
        }

        function navigateToJob(jobId) {
            navigationService.hideDialog();
            window.location.href = "#/translationManager/tm/job/" + jobId;
        }


        ///////////////////
        // groups the nodes, by culture
        function groupNodes(nodes) {
            var nodeGroups = [];

            nodes.map(function (node) {
                var found = false;
                nodeGroups.map(function (group) {
                    if (group.id == node.Culture.LCID) {
                        group.nodes.push(node);
                        found = true;
                    }
                });
                if (!found) {
                    var newGroup = {
                        id: node.Culture.LCID,
                        name: node.Culture.DisplayName,
                        nodes: [],
                        status: 'pending',
                        jobName: vm.job.Name.replace("$language$", node.Culture.DisplayName)
                    };
                    newGroup.nodes.push(node);
                    nodeGroups.push(newGroup);
                }
            });

            return nodeGroups;
        }


        function getSelectedSets(sets) {
            var selectedSets = [];

            sets.forEach(function (set) {
                if (set.checked === true) {
                    selectedSets.push(set.Id);
                }
            });

            return selectedSets;
        }

        function getAutoSendSettings(sets) {

            var selectedSets = [];
            var singleSet = {};

            sets.forEach(function (set) {
                if (set.checked === true) {
                    selectedSets.push(set.Id);
                    singleSet = set;
                }
            });

            if (selectedSets.length > 1) {
                vm.autoSend = false;
            }
            else {
                vm.autoSend = singleSet.AutoSend;
                vm.createOptions.singleProvider =
                    singleSet.ProviderKey != "00000000-0000-0000-0000-000000000000";
                vm.createOptions.key = singleSet.ProviderKey;
            }

            vm.userAutoSend = vm.autoSend;

        }

        function UpdatePickedSets(sets) {

            vm.options.sites = [];

            sets.forEach(function (set) {
                if (set.checked === true) {
                    vm.options.sites.push({ siteId: set.Id, cultureId: set.cultureId });
                }
            });

        }

        $scope.$watch("vm.sets", function (newValue, oldValue) {
            if (newValue != undefined) {
                getAutoSendSettings(newValue);
                UpdatePickedSets(newValue);
            }

        }, true);

        ///////////////////////////
        function createBatches(items, size) {
            var batches = [];
            var batchCount = Math.ceil(items.length / size);
            for (var b = 0; b < batchCount; b++) {
                var batch = items.slice(b * size, (b + 1) * size);
                batches.push(batch);
            }

            // console.log('split ' + items.length + ' into ' + batches.length + ' batches');
            return batches;
        }

        function createNodesInBatch(batches, options, callback, errCallback) {
            var b = 0;
            var nodes = [];

            process(batches[b]);

            function process(items) {
                b++;
                vm.progress = 'Group: ' + b + ' of ' + batches.length;

                // 
                translateNodeService.createBatchFromTarget({
                    ids: items, options: options
                }).then(function (result) {
                    nodes = nodes.concat(result.data);
                    if (b < batches.length) {
                        process(batches[b]);
                    }
                    else {
                        callback(nodes);
                    }
                }, function (error) {
                    errCallback(error);
                });
            }
        }

    }

    angular.module('umbraco')
        .controller('translate.getController', getTranslationsController);

})();
