var app;
(function (app) {
    var core;
    (function (core) {
        var controllers;
        (function (controllers) {
            "use strict";
            var BaseApproveReportsSettingsController = (function () {
                function BaseApproveReportsSettingsController($scope, Person, $rootScope, Autocomplete, $modal, moment, reportType) {
                    var _this = this;
                    this.$scope = $scope;
                    this.Person = Person;
                    this.$rootScope = $rootScope;
                    this.Autocomplete = Autocomplete;
                    this.$modal = $modal;
                    this.moment = moment;
                    this.reportType = reportType;
                    this.infinitePeriod = 9999999999;
                    this.isGridLoaded = false;
                    this.collapseSubstitute = false;
                    this.collapsePersonalApprover = false;
                    this.orgUnits = [];
                    this.people = [];
                    this.currentPerson = {};
                    this.substituteOrgUnit = "";
                    this.personalApproverHelpText = $rootScope.HelpTexts.PersonalApproverHelpText.text;
                    this.personId = $rootScope.CurrentUser.Id;
                    this.currentPerson = $rootScope.CurrentUser;
                    this.people = Autocomplete.activeUsers();
                    this.orgUnits = Autocomplete.orgUnits();
                    this.showSubstituteSettings = $rootScope.CurrentUser.IsLeader;
                    this.substitutes = {
                        autoBind: false,
                        dataSource: {
                            type: "odata-v4",
                            transport: {
                                read: {
                                    beforeSend: function (req) {
                                        req.setRequestHeader('Accept', 'application/json;odata=fullmetadata');
                                    },
                                    url: "odata/Substitutes/Service.Substitute(Type=" + this.reportType + ")?$expand=OrgUnit,Sub,Person,Leader &$filter=PersonId eq " + this.personId,
                                    dataType: "json",
                                    cache: false
                                }
                            },
                            pageSize: 20
                        },
                        sortable: true,
                        pageable: {
                            messages: {
                                display: "{0} - {1} af {2} ",
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
                                title: "Opsat af"
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
                                title: "Til",
                                field: "EndDateTimestamp",
                                template: function (data) {
                                    if (data.EndDateTimestamp === _this.infinitePeriod) {
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
                                template: function (data) { return ("<a ng-click='arsCtrl.openEditSubstitute(" + data.Id + ")'>Rediger</a> | <a ng-click='arsCtrl.openDeleteSubstitute(" + data.Id + ")'>Slet</a>"); }
                            }
                        ],
                        scrollable: false
                    };
                    this.personalApprovers = {
                        autoBind: false,
                        dataSource: {
                            type: "odata-v4",
                            transport: {
                                read: {
                                    beforeSend: function (req) {
                                        req.setRequestHeader('Accept', 'application/json;odata=fullmetadata');
                                    },
                                    url: "odata/Substitutes/Service.Personal(Type=" + this.reportType + ")?$expand=OrgUnit,Sub,Leader,Person&$filter=LeaderId eq " + this.personId,
                                    dataType: "json",
                                    cache: false
                                }
                            },
                            pageSize: 20
                        },
                        sortable: true,
                        pageable: {
                            messages: {
                                display: "{0} - {1} af {2} ",
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
                                field: "Leader.FullName",
                                title: "Opsat af"
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
                                    if (data.EndDateTimestamp === _this.infinitePeriod) {
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
                                template: function (data) { return ("<a ng-click='arsCtrl.openEditApprover(" + data.Id + ")'>Rediger</a> | <a ng-click='arsCtrl.openDeleteApprover(" + data.Id + ")'>Slet</a>"); }
                            }
                        ],
                        scrollable: false
                    };
                    this.mySubstitutes = {
                        autoBind: false,
                        dataSource: {
                            type: "odata-v4",
                            transport: {
                                read: {
                                    beforeSend: function (req) {
                                        req.setRequestHeader('Accept', 'application/json;odata=fullmetadata');
                                    },
                                    url: "odata/Substitutes/Service.Substitute(Type=" + this.reportType + ")?$expand=Sub,Person,Leader,OrgUnit &$filter=PersonId eq LeaderId and SubId eq " + this.personId,
                                    dataType: "json",
                                    cache: false
                                }
                            },
                            pageSize: 20
                        },
                        sortable: true,
                        pageable: {
                            messages: {
                                display: "{0} - {1} af {2} ",
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
                                title: "Opsat af"
                            },
                            {
                                field: "StartDateTimestamp",
                                title: "Fra",
                                template: function (data) {
                                    var m = moment.unix(data.StartDateTimestamp).toDate();
                                    return m.getDate() + "/" +
                                        (m.getMonth() + 1) + "/" +
                                        m.getFullYear();
                                }
                            },
                            {
                                title: "Til",
                                field: "EndDateTimestamp",
                                template: function (data) {
                                    if (data.EndDateTimestamp === _this.infinitePeriod) {
                                        return "På ubestemt tid";
                                    }
                                    var m = moment.unix(data.EndDateTimestamp).toDate();
                                    return m.getDate() + "/" +
                                        (m.getMonth() + 1) + "/" +
                                        m.getFullYear();
                                }
                            }
                        ],
                        scrollable: false
                    };
                    this.$scope.$on("kendoRendered", function () {
                        if (!_this.isGridLoaded) {
                            _this.isGridLoaded = true;
                            _this.refreshGrids();
                        }
                    });
                }
                BaseApproveReportsSettingsController.prototype.refreshGrids = function () {
                    if (!this.isGridLoaded)
                        return;
                    this.substituteGrid.dataSource.read();
                    this.mySubstitutesGrid.dataSource.read();
                    this.personalApproverGrid.dataSource.read();
                };
                BaseApproveReportsSettingsController.prototype.openDeleteApprover = function (id) {
                    var _this = this;
                    var modalInstance = this.$modal.open({
                        templateUrl: 'App/Core/Views/Modals/ConfirmDeleteApproverModal.html',
                        controller: 'ConfirmDeleteApproverModalInstanceController',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            persons: function () { return _this.people; },
                            orgUnits: function () { return _this.orgUnits; },
                            leader: function () { return _this.currentPerson; },
                            substituteId: function () { return id; },
                            ReportType: function () { return _this.reportType; }
                        }
                    });
                    modalInstance.result.then(function () {
                        _this.refreshGrids();
                    });
                };
                BaseApproveReportsSettingsController.prototype.openDeleteSubstitute = function (id) {
                    var _this = this;
                    var modalInstance = this.$modal.open({
                        templateUrl: 'App/Core/Views/Modals/ConfirmDeleteSubstituteModal.html',
                        controller: 'ConfirmDeleteSubstituteModalInstanceController',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            persons: function () { return _this.people; },
                            orgUnits: function () { return _this.orgUnits; },
                            leader: function () { return _this.currentPerson; },
                            substituteId: function () { return id; },
                            ReportType: function () { return _this.reportType; }
                        }
                    });
                    modalInstance.result.then(function () {
                        _this.refreshGrids();
                    });
                };
                BaseApproveReportsSettingsController.prototype.openEditSubstitute = function (id) {
                    var _this = this;
                    /// <summary>
                    /// Opens edit substitute modal
                    /// </summary>
                    /// <param name="id"></param>
                    var modalInstance = this.$modal.open({
                        templateUrl: 'App/Core/Views/Modals/editSubstituteModal.html',
                        controller: 'EditSubstituteModalInstanceController',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            persons: function () { return _this.people; },
                            orgUnits: function () { return _this.orgUnits; },
                            leader: function () { return _this.currentPerson; },
                            substituteId: function () { return id; },
                            ReportType: function () { return _this.reportType; }
                        }
                    });
                    modalInstance.result.then(function () {
                        _this.refreshGrids();
                    });
                };
                BaseApproveReportsSettingsController.prototype.openEditApprover = function (id) {
                    var _this = this;
                    /// <summary>
                    /// Opens edit approver modal
                    /// </summary>
                    /// <param name="id">Id of approver to edit.</param>
                    var modalInstance = this.$modal.open({
                        templateUrl: 'App/Core/Views/Modals/EditApproverModal.html',
                        controller: 'EditApproverModalInstanceController',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            persons: function () { return _this.people; },
                            orgUnits: function () { return _this.orgUnits; },
                            leader: function () { return _this.currentPerson; },
                            substituteId: function () { return id; },
                            ReportType: function () { return _this.reportType; }
                        }
                    });
                    modalInstance.result.then(function () {
                        _this.refreshGrids();
                    });
                };
                BaseApproveReportsSettingsController.prototype.createNewApprover = function () {
                    var _this = this;
                    var modalInstance = this.$modal.open({
                        templateUrl: 'App/Core/Views/Modals/newApproverModal.html',
                        controller: 'NewApproverModalInstanceController',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            persons: function () { return _this.people; },
                            orgUnits: function () { return _this.orgUnits; },
                            leader: function () { return _this.currentPerson; },
                            ReportType: function () { return _this.reportType; }
                        }
                    });
                    modalInstance.result.then(function () {
                        _this.refreshGrids();
                    });
                };
                BaseApproveReportsSettingsController.prototype.createNewSubstitute = function () {
                    var _this = this;
                    /// <summary>
                    /// Opens create new substitute modal
                    /// </summary>
                    var modalInstance = this.$modal.open({
                        templateUrl: 'App/Core/Views/Modals/newSubstituteModal.html',
                        controller: 'NewSubstituteModalInstanceController',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            persons: function () { return _this.people; },
                            orgUnits: function () { return _this.orgUnits; },
                            leader: function () { return _this.currentPerson; },
                            ReportType: function () { return _this.reportType; }
                        }
                    });
                    modalInstance.result.then(function () {
                        _this.refreshGrids();
                    });
                };
                return BaseApproveReportsSettingsController;
            }());
            controllers.BaseApproveReportsSettingsController = BaseApproveReportsSettingsController;
        })(controllers = core.controllers || (core.controllers = {}));
    })(core = app.core || (app.core = {}));
})(app || (app = {}));
//# sourceMappingURL=BaseApproveReportSettingsController.js.map