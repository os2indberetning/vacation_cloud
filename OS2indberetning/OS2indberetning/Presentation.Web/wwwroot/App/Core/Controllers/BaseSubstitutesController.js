var app;
(function (app) {
    var core;
    (function (core) {
        var controllers;
        (function (controllers) {
            "use strict";
            var BaseSubstitutesController = (function () {
                function BaseSubstitutesController($scope, Person, $rootScope, HelpText, Autocomplete, $modal, $timeout, moment, reportType) {
                    var _this = this;
                    this.$scope = $scope;
                    this.Person = Person;
                    this.$rootScope = $rootScope;
                    this.HelpText = HelpText;
                    this.Autocomplete = Autocomplete;
                    this.$modal = $modal;
                    this.$timeout = $timeout;
                    this.moment = moment;
                    this.reportType = reportType;
                    this.dateOptions = {
                        format: "dd/MM/yyyy"
                    };
                    this.currentUser = $scope.CurrentUser;
                    var date = new Date();
                    date.setMonth(date.getMonth() - 1);
                    this.fromDate = this.startOfDay(date);
                    this.toDate = this.endOfDay(new Date());
                    this.people = Autocomplete.activeUsers();
                    this.orgUnits = Autocomplete.orgUnits();
                    this.substitutes = {
                        dataSource: {
                            pageSize: 20,
                            type: "odata-v4",
                            transport: {
                                read: {
                                    beforeSend: function (req) {
                                        req.setRequestHeader('Accept', 'application/json;odata=fullmetadata');
                                    },
                                    url: "odata/Substitutes/Service.Substitute(Type=" + this.reportType + ")?$expand=OrgUnit,Sub,Person,Leader,CreatedBy",
                                    dataType: "json",
                                    cache: false
                                }
                            }
                        },
                        serverPaging: true,
                        serverAggregates: false,
                        serverSorting: true,
                        serverFiltering: true,
                        sortable: true,
                        scrollable: false,
                        filter: [
                            { field: "StartDateTimestamp", operator: "lte", value: this.toDate },
                            { field: "EndDateTimestamp", operator: "gte", value: this.fromDate }
                        ],
                        pageable: {
                            messages: {
                                display: "{0} - {1} af {2} stedfortrædere",
                                empty: "Ingen stedfortrædere at vise",
                                page: "Side",
                                of: "af {0}",
                                itemsPerPage: "stedfortrædere pr. side",
                                first: "Gå til første side",
                                previous: "Gå til forrige side",
                                next: "Gå til næste side",
                                last: "Gå til sidste side",
                                refresh: "Genopfrisk"
                            },
                            pageSizes: [5, 10, 20, 30, 40, 50, 100, 150, 200]
                        },
                        dataBound: function () {
                            this.expandRow(this.tbody.find("tr.k-master-row").first());
                        },
                        columns: [
                            {
                                field: "Sub.FullName",
                                title: "Stedfortræder"
                            },
                            {
                                field: "Person.FullName",
                                title: "Stedfortræder for"
                            },
                            {
                                field: "OrgUnit.LongDescription",
                                title: "Organisationsenhed"
                            },
                            {
                                field: "Leader.FullName",
                                title: "Opsat af",
                                template: function (data) {
                                    if (data.CreatedBy == undefined)
                                        return "<i>Ikke tilgængelig</i>";
                                    return data.CreatedBy.FullName;
                                }
                            },
                            {
                                field: "StartDateTimestamp",
                                title: "Fra",
                                template: function (data) {
                                    var m = _this.moment.unix(data.StartDateTimestamp).toDate();
                                    return m.getDate() + "/" +
                                        (m.getMonth() + 1) + "/" +
                                        m.getFullYear();
                                }
                            },
                            {
                                field: "EndDateTimestamp",
                                title: "Til",
                                template: function (data) {
                                    if (data.EndDateTimestamp == 9999999999) {
                                        return "På ubestemt tid";
                                    }
                                    var m = _this.moment.unix(data.EndDateTimestamp).toDate();
                                    return m.getDate() + "/" +
                                        (m.getMonth() + 1) + "/" +
                                        m.getFullYear();
                                }
                            },
                            {
                                title: "Muligheder",
                                template: function (data) { return ("<a ng-click='subCtrl.openEditSubstitute(" + data.Id + ")'>Rediger</a> | <a ng-click='subCtrl.openDeleteSubstitute(" + data.Id + ")'>Slet</a>"); }
                            }
                        ]
                    };
                    this.personalApprovers = {
                        dataSource: {
                            pageSize: 20,
                            type: "odata-v4",
                            transport: {
                                read: {
                                    beforeSend: function (req) {
                                        req.setRequestHeader("Accept", "application/json;odata=fullmetadata");
                                    },
                                    url: "odata/Substitutes/Service.Personal(Type=" + this.reportType + ")?$expand=OrgUnit,Sub,Leader,Person,CreatedBy",
                                    dataType: "json",
                                    cache: false
                                }
                            }
                        },
                        serverPaging: true,
                        serverAggregates: false,
                        serverSorting: true,
                        serverFiltering: true,
                        sortable: true,
                        scrollable: false,
                        pageable: {
                            messages: {
                                display: "{0} - {1} af {2} personlige godkendere",
                                empty: "Ingen personlige godkendere at vise",
                                page: "Side",
                                of: "af {0}",
                                itemsPerPage: "personlige godkendere pr. side",
                                first: "Gå til første side",
                                previous: "Gå til forrige side",
                                next: "Gå til næste side",
                                last: "Gå til sidste side",
                                refresh: "Genopfrisk"
                            },
                            pageSizes: [5, 10, 20, 30, 40, 50, 100, 150, 200]
                        },
                        dataBound: function () {
                            this.expandRow(this.tbody.find("tr.k-master-row").first());
                        },
                        columns: [
                            {
                                field: "Sub.FullName",
                                title: "Godkender"
                            },
                            {
                                field: "Person.FullName",
                                title: "Godkender for"
                            },
                            {
                                field: "CreatedBy",
                                title: "Opsat af",
                                template: function (data) {
                                    if (data.CreatedBy == undefined)
                                        return "<i>Ikke tilgængelig</i>";
                                    return data.CreatedBy.FullName;
                                }
                            },
                            {
                                field: "StartDateTimestamp",
                                title: "Fra",
                                template: function (data) {
                                    var m = _this.moment.unix(data.StartDateTimestamp).toDate();
                                    return m.getDate() + "/" +
                                        (m.getMonth() + 1) + "/" +
                                        m.getFullYear();
                                }
                            },
                            {
                                field: "EndDateTimestamp",
                                title: "Til",
                                template: function (data) {
                                    if (data.EndDateTimestamp == 9999999999) {
                                        return "På ubestemt tid";
                                    }
                                    var m = _this.moment.unix(data.EndDateTimestamp).toDate();
                                    return m.getDate() + "/" +
                                        (m.getMonth() + 1) + "/" +
                                        m.getFullYear();
                                }
                            },
                            {
                                title: "Muligheder",
                                template: function (data) { return ("<a ng-click='subCtrl.openEditApprover(" + data.Id + ")'>Rediger</a> | <a ng-click='subCtrl.openDeleteApprover(" + data.Id + ")'>Slet</a>"); }
                            }
                        ]
                    };
                    this.loadInitialDates();
                }
                BaseSubstitutesController.prototype.clearClicked = function (type) {
                    var from = new Date();
                    from.setMonth(from.getMonth() - 1);
                    if (type === "substitute") {
                        this.subInfinitePeriod = false;
                        this.substituteToDate = new Date();
                        this.substituteFromDate = from;
                        this.substituteGrid.dataSource.filter([]);
                    }
                    else if (type === "approver") {
                        this.appInfinitePeriod = false;
                        this.approverToDate = new Date();
                        this.approverFromDate = from;
                        this.approverGrid.dataSource.filter([]);
                    }
                };
                BaseSubstitutesController.prototype.dateChanged = function (type) {
                    var _this = this;
                    this.$timeout(function () {
                        if (type === "substitute") {
                            var subFrom = _this.startOfDay(_this.substituteFromDate);
                            var subTo = _this.endOfDay(_this.substituteToDate);
                            // Initial load is also a bit of a hack.
                            // dateChanged is called twice when the default values for the datepickers are set.
                            // This leads to sorting the grid content on load, which is not what we want.
                            // Therefore the sorting is not done the first 2 times the dates change - Which are the 2 times we set the default values.
                            if (_this.initialLoad <= 0) {
                                _this.applyDateFilter(subFrom, subTo, "substitute");
                            }
                        }
                        else if (type === "approver") {
                            var from = _this.startOfDay(_this.approverFromDate);
                            var to = _this.endOfDay(_this.approverToDate);
                            // Initial load is also a bit of a hack.
                            // dateChanged is called twice when the default values for the datepickers are set.
                            // This leads to sorting the grid content on load, which is not what we want.
                            // Therefore the sorting is not done the first 2 times the dates change - Which are the 2 times we set the default values.
                            if (_this.initialLoad <= 0) {
                                _this.applyDateFilter(from, to, "approver");
                            }
                        }
                        _this.initialLoad--;
                    }, 0);
                };
                BaseSubstitutesController.prototype.applyDateFilter = function (fromDateStamp, toDateStamp, type) {
                    if (type === "substitute") {
                        this.substituteGrid.dataSource.filter([]);
                        var subFilters = [];
                        subFilters.push({ field: "StartDateTimestamp", operator: "lte", value: toDateStamp });
                        if (!this.subInfinitePeriod) {
                            subFilters.push({ field: "EndDateTimestamp", operator: "gte", value: fromDateStamp });
                        }
                        this.substituteGrid.dataSource.filter(subFilters);
                    }
                    else if (type === "approver") {
                        this.approverGrid.dataSource.filter([]);
                        var appFilters = [];
                        appFilters.push({ field: "StartDateTimestamp", operator: "lte", value: toDateStamp });
                        if (!this.appInfinitePeriod) {
                            appFilters.push({ field: "EndDateTimestamp", operator: "gte", value: fromDateStamp });
                        }
                        this.approverGrid.dataSource.filter(appFilters);
                    }
                };
                BaseSubstitutesController.prototype.refreshGrids = function () {
                    this.substituteGrid.dataSource.read();
                    this.approverGrid.dataSource.read();
                };
                BaseSubstitutesController.prototype.loadInitialDates = function () {
                    this.initialLoad = 4;
                    var from = new Date();
                    from.setMonth(from.getMonth() - 1);
                    this.approverToDate = new Date();
                    this.approverFromDate = from;
                    this.substituteToDate = new Date();
                    this.substituteFromDate = from;
                };
                BaseSubstitutesController.prototype.openEditSubstitute = function (id) {
                    var _this = this;
                    var modalInstance = this.$modal.open({
                        templateUrl: 'App/Core/Views/Modals/EditSubstituteModal.html',
                        controller: 'EditSubstituteModalInstanceController',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            persons: function () { return _this.people; },
                            orgUnits: function () { return _this.orgUnits; },
                            leader: function () { return _this.currentUser; },
                            substituteId: function () { return id; },
                            ReportType: function () { return _this.reportType; }
                        }
                    });
                    modalInstance.result.then(function () {
                        _this.refreshGrids();
                    });
                };
                BaseSubstitutesController.prototype.openEditApprover = function (id) {
                    var _this = this;
                    this.$modal.open({
                        templateUrl: "App/Core/Views/Modals/EditApproverModal.html",
                        controller: "EditApproverModalInstanceController",
                        controllerAs: "ctrl",
                        backdrop: "static",
                        size: "lg",
                        resolve: {
                            persons: function () { return _this.people; },
                            orgUnits: function () { return _this.orgUnits; },
                            leader: function () { return _this.currentUser; },
                            substituteId: function () { return id; },
                            ReportType: function () { return _this.reportType; }
                        }
                    }).result.then(function () {
                        _this.approverGrid.dataSource.read();
                    });
                };
                BaseSubstitutesController.prototype.createNewApprover = function () {
                    var _this = this;
                    var modalInstance = this.$modal.open({
                        // Change these
                        templateUrl: 'App/Core/Views/Modals/NewApproverModal.html',
                        controller: 'NewApproverModalInstanceController',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            persons: function () { return _this.people; },
                            orgUnits: function () { return _this.orgUnits; },
                            leader: function () { return _this.currentUser; },
                            ReportType: function () { return _this.reportType; }
                        }
                    });
                    modalInstance.result.then(function () {
                        _this.refreshGrids();
                    });
                };
                BaseSubstitutesController.prototype.createNewSubstitute = function () {
                    var _this = this;
                    var modalInstance = this.$modal.open({
                        // Change these
                        templateUrl: 'App/Core/Views/Modals/AdminNewSubstituteModal.html',
                        controller: 'AdminNewSubstituteModalInstanceController',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            persons: function () { return _this.people; },
                            orgUnits: function () { return _this.orgUnits; },
                            leader: function () { return _this.currentUser; },
                            ReportType: function () { return _this.reportType; }
                        }
                    });
                    modalInstance.result.then(function () {
                        _this.refreshGrids();
                    }, function () {
                    });
                };
                BaseSubstitutesController.prototype.openDeleteApprover = function (id) {
                    var _this = this;
                    var modalInstance = this.$modal.open({
                        // Change these
                        templateUrl: 'App/Core/Views/Modals/ConfirmDeleteApproverModal.html',
                        controller: 'ConfirmDeleteApproverModalInstanceController',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            persons: function () { return _this.people; },
                            orgUnits: function () { return _this.orgUnits; },
                            leader: function () { return _this.currentUser; },
                            substituteId: function () { return id; },
                            ReportType: function () { return _this.reportType; }
                        }
                    });
                    modalInstance.result.then(function () {
                        _this.refreshGrids();
                    });
                };
                BaseSubstitutesController.prototype.openDeleteSubstitute = function (id) {
                    var _this = this;
                    var modalInstance = this.$modal.open({
                        // Change these
                        templateUrl: 'App/Core/Views/Modals/ConfirmDeleteSubstituteModal.html',
                        controller: 'ConfirmDeleteSubstituteModalInstanceController',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            persons: function () { return _this.people; },
                            orgUnits: function () { return _this.orgUnits; },
                            leader: function () { return _this.currentUser; },
                            substituteId: function () { return id; },
                            ReportType: function () { return _this.reportType; }
                        }
                    });
                    modalInstance.result.then(function () {
                        _this.refreshGrids();
                    });
                };
                BaseSubstitutesController.prototype.startOfDay = function (d) {
                    return moment(d).startOf("day").unix();
                };
                BaseSubstitutesController.prototype.endOfDay = function (d) {
                    return moment(d).endOf("day").unix();
                };
                return BaseSubstitutesController;
            }());
            controllers.BaseSubstitutesController = BaseSubstitutesController;
        })(controllers = core.controllers || (core.controllers = {}));
    })(core = app.core || (app.core = {}));
})(app || (app = {}));
//# sourceMappingURL=BaseSubstitutesController.js.map