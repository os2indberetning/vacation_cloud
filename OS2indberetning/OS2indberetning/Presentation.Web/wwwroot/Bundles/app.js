var app;
(function (app) {
    "use strict";
    var cgBusyDefaultsConfig = {
        message: 'Vent venligst..',
        backdrop: true,
        templateUrl: 'template/loading-template.html',
        delay: 100,
        minDuration: 700
    };
    var momentConfig = {
        preprocess: function (data) {
            return moment.unix(data);
        },
        timezone: 'Europe/Copenhagen'
    };
    angular.module("app", [
        "kendo.directives",
        "ui.router",
        "ui.bootstrap",
        "ui.bootstrap.tooltip",
        "ngResource",
        "angularMoment",
        "cgBusy",
        "app.core",
        "app.drive",
        "app.vacation"])
        .config([
        'cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
            cfpLoadingBarProvider.includeSpinner = false;
        }
    ])
        .run(([
        "Person", "$rootScope", "HelpText", '$state', '$stateParams',
        'Authorization', 'Principal', function (Person, $rootScope, HelpText, $state, $stateParams, Authorization, Principal) {
            $rootScope.hasAccess = true;
            if ($rootScope.HelpTexts == undefined) {
                HelpText.getAll().$promise.then(function (res) {
                    $rootScope.helpLink = res.InformationHelpLink;
                    $rootScope.HelpTexts = res;
                });
            }
            $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
                // track the state the user wants to go to;
                // authorization service needs this
                $rootScope.toState = toState;
                $rootScope.toStateParams = toStateParams;
                // if the principal is resolved, do an
                // authorization check immediately. otherwise,
                // it'll be done when the state is resolved.
                if (Principal.isIdentityResolved())
                    Authorization.authorize();
            });
        }
    ]))
        .constant('moment', moment)
        .constant('angularMomentConfig', momentConfig)
        .value("cgBusyDefaults", cgBusyDefaultsConfig);
})(app || (app = {}));
//# sourceMappingURL=app.js.map
var app;
(function (app) {
    "use strict";
    var routes = (function () {
        function routes() {
        }
        routes.init = function ($stateProvider, $urlRouterProvider) {
            $stateProvider.
                state('default', {
                url: '/',
                templateUrl: '/App/app.html',
                resolve: {
                    authorize: ['Authorization',
                        function (Authorization) { return Authorization.authorize(); }
                    ]
                }
            });
            $stateProvider.state("drive", {
                url: "/drive",
                templateUrl: "/App/Drive/app.drive.html",
                abstract: true,
                resolve: {
                    authorize: ['Authorization',
                        function (Authorization) { return Authorization.authorize(); }
                    ]
                }
            });
            $stateProvider.state("vacation", {
                url: "/vacation",
                templateUrl: "/App/Vacation/app.vacation.html",
                abstract: true,
                resolve: {
                    authorize: ['Authorization',
                        function (Authorization) { return Authorization.authorize(); }
                    ]
                }
            });
            $urlRouterProvider.when("/drive", "/drive/driving");
            $urlRouterProvider.when("/vacation", "/vacation/report");
            $urlRouterProvider.otherwise("/");
            $urlRouterProvider.rule(function ($injector, $location) {
                var path = $location.path();
                var hasTrailingSlash = path[path.length - 1] === "/";
                if (hasTrailingSlash) {
                    var newPath = path.substr(0, path.length - 1);
                    return newPath;
                }
                return path;
            });
        };
        routes.$inject = ["$stateProvider", "$urlRouterProvider"];
        return routes;
    }());
    app.routes = routes;
    angular.module("app").config(routes.init);
})(app || (app = {}));
//# sourceMappingURL=app.routes.js.map
angular.module("app.core",
[
    "kendo.directives",
    "app.drive",
    "app.vacation",
    "ui.router",
    "ui.bootstrap",
    "ui.bootstrap.tooltip",
    "ngResource",
    "template/modal/window.html",
    "template/modal/window.html",
    "template/modal/backdrop.html",
    "template/tabs/tab.html",
    "template/tabs/tabset.html",
    "angularMoment",
    "template/popover/popover.html",
    "kendo-ie-fix",
    "angular-loading-bar"
]);
angular.module("app.core").controller("AddNewMailNotificationController", [
    "$scope", "$modalInstance", "NotificationService", "StandardAddress", "AddressFormatter", "SmartAdresseSource",
    function ($scope, $modalInstance, NotificationService, StandardAddress, AddressFormatter, SmartAdresseSource) {


        $scope.repeatMonthly = "";

        $scope.dateOptions = {
            format: "dd/MM/yyyy"
        };

        $scope.notificationDate = new Date();

        $scope.confirmSave = function () {
            /// <summary>
            /// Saves new MailNotification if fields are properly filled.
            /// </summary>
            var error = false;

            $scope.repeatErrorMessage = "";
            if ($scope.repeatMonthly == "") {
                error = true;
                $scope.repeatErrorMessage = "* Du skal udfylde 'Gentag månedligt'.";
            }

            $scope.dateErrorMessage = "";
            if ($scope.notificationDate == undefined) {
                error = true;
                $scope.dateErrorMessage = "* Du skal vælge en gyldig adviseringsdato.";
            }

            $scope.payDateErrorMessage = "";
            if ($scope.payRoleDate == undefined) {
                error = true;
                $scope.payDateErrorMessage = "* Du skal vælge en gyldig lønkørselsdato.";
            }

            var result = {};
            if ($scope.repeatMonthly == "true") {
                result.repeatMonthly = true;
            } else {
                result.repeatMonthly = false;
            }

            result.notificationDate = moment($scope.notificationDate).unix();
            result.payDate = moment($scope.payRoleDate).unix();
            if (!error) {
                $modalInstance.close(result);
                NotificationService.AutoFadeNotification("success", "", "Email-adviseringen blev oprettet.");
            }

        }

        $scope.cancel = function () {
            /// <summary>
            /// Cancels creation of new MailNotification.
            /// </summary>
            $modalInstance.dismiss('cancel');
            NotificationService.AutoFadeNotification("warning", "", "Oprettelse af email adviseringen blev annulleret.");
        }
    }
]);
angular.module('app.core').controller('AdminNewSubstituteModalInstanceController',
    ["$scope", "$modalInstance", "OrgUnit", "leader", "Substitute", "Person", "NotificationService", "$timeout", "persons", "Autocomplete", "leader", "ReportType",
        function ($scope, $modalInstance, OrgUnit, leader, Substitute, Person, NotificationService, $timeout, persons, Autocomplete, leader, ReportType) {

            $scope.persons = persons;

            $scope.loadingPromise = null;

            var infinitePeriod = 9999999999;

            $scope.autoCompleteOptions = {
                filter: "contains"
            };


            $scope.leaders = Autocomplete.leaders();


            $scope.substituteFromDate = new Date();
            $scope.substituteToDate = new Date();
            $scope.orgUnits = Autocomplete.orgUnitsThatHaveALeader();

            $scope.clearSelections = function() {
                $scope.personFor = [];
                $scope.personForString = "";
                $scope.orgUnits = Autocomplete.orgUnitsThatHaveALeader();
                $scope.orgUnit = {LongDescription: "Nope", Id: ""}
            }

            $scope.orgUnitOptions = {
                filter: "contains",
                select: function (item) {
                    $timeout(function () {
                        OrgUnit.getLeaderOfOrg({ id: $scope.orgUnit.Id }, function (res) {
                            $scope.personForString = res.FullName;
                            $scope.personFor = [];
                            $scope.personFor.push(res);
                        });
                    }, 0);

                }
            }


            $scope.personForOptions = {
                filter: "contains",
                select: function (item) {
                    $timeout(function () {
                        OrgUnit.getWhereUserIsLeader({ id: $scope.personFor[0].Id }, function (res) {
                            $scope.orgUnits = res;
                            if ($scope.orgUnits.length > 0) {
                                $scope.orgUnit = $scope.orgUnits[0];
                            }
                        });
                    }, 0);

                }
            }

            $scope.saveNewSubstitute = function () {

                /// <summary>
                /// Post new substitute to backend if fields are filled correctly.
                /// </summary>
                if ($scope.person == undefined) {
                    NotificationService.AutoFadeNotification("danger", "", "Du skal vælge en stedfortræder");
                    return;
                }

                if ($scope.personFor == undefined) {
                    NotificationService.AutoFadeNotification("danger", "", "Du skal vælge en person der skal stedfortrædes for");
                    return;
                }

                if ($scope.orgUnit == undefined) {
                    NotificationService.AutoFadeNotification("danger", "", "Du skal vælge en organisationsenhed.");
                    return;
                }


                var sub = new Substitute({
                    StartDateTimestamp: Math.floor($scope.substituteFromDate.getTime() / 1000),
                    EndDateTimestamp: Math.floor($scope.substituteToDate.getTime() / 1000),
                    LeaderId: $scope.personFor[0].Id,
                    SubId: $scope.person[0].Id,
                    OrgUnitId: $scope.orgUnit.Id,
                    PersonId: $scope.personFor[0].Id,
                    CreatedById: leader.Id,
                    Type: ReportType === 0 ? "Drive" : "Vacation"
                });

                if ($scope.infinitePeriod) {
                    sub.EndDateTimestamp = infinitePeriod;
                }

                $scope.showSpinner = true;

                $scope.loadingPromise = sub.$post(function (data) {
                    NotificationService.AutoFadeNotification("success", "", "Stedfortræder blev oprettet");
                    $modalInstance.close();
                }, function () {
                    NotificationService.AutoFadeNotification("danger", "", "Kunne ikke oprette stedfortræder (Du kan ikke oprette 2 stedfortrædere for samme organisation i samme periode)");
                    $scope.showSpinner = false;
                });
            };

            $scope.cancelNewSubstitute = function () {
                $modalInstance.dismiss('cancel');
            };
        }]);

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
angular.module('app.core').controller('ConfirmDeleteApproverModalInstanceController',
    ["$scope", "$modalInstance", "persons", "orgUnits", "leader", "Substitute", "Person", "NotificationService", "substituteId",
        function ($scope, $modalInstance, persons, orgUnits, leader, Substitute, Person, NotificationService, substituteId) {

        $scope.loadingPromise = null;

        $scope.persons = persons;
        $scope.orgUnits = orgUnits;

        $scope.substitute = Substitute.get({ id: substituteId }, function (data) {

            $scope.substitute = data.value[0]; // This is bad, but can't change the service
            $scope.sub = $scope.substitute.Sub;
            $scope.person = $scope.substitute.Person;
            console.log($scope.substitute);
            $scope.substituteFromDate = new Date($scope.substitute.StartDateTimestamp * 1000).toLocaleDateString();
            if ($scope.substitute.EndDateTimestamp == 9999999999) {
                $scope.substituteToDate = "På ubestemt tid";
            } else {
                $scope.substituteToDate = new Date($scope.substitute.EndDateTimestamp * 1000).toLocaleDateString();
            }
        });

        $scope.orgUnitSelected = function (id) {
            console.log(id);
        }

        $scope.deleteSubstitute = function () {

            var sub = new Substitute();

            $scope.showSpinner = true;

            $scope.loadingPromise = sub.$delete({ id: $scope.substitute.Id }, function (data) {
                NotificationService.AutoFadeNotification("success", "", "Personlig godkender er blevet slettet");
                $modalInstance.close();
            }, function () {
                NotificationService.AutoFadeNotification("danger", "", "Kunne ikke slette personlig godkender");
            });
        };

        $scope.cancelSubstitute = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
angular.module("app.core").controller("DeleteMailNotificationController", [
    "$scope", "$modalInstance", "itemId", "NotificationService",
    function ($scope, $modalInstance, itemId, NotificationService) {

        $scope.confirmDelete = function () {
            /// <summary>
            /// Confirms deletion of MailNotification
            /// </summary>
            $modalInstance.close($scope.itemId);
            NotificationService.AutoFadeNotification("success", "", "Adviseringen blev slettet.");
        }
        


        $scope.cancel = function () {
            /// <summary>
            /// Cancels deletion of MailNotification
            /// </summary>
            $modalInstance.dismiss('cancel');
            NotificationService.AutoFadeNotification("warning", "", "Sletning af adviseringen blev annulleret.");
        }
    }
]);
angular.module('app.core').controller('ConfirmDeleteSubstituteModalInstanceController',
    ["$scope", "$modalInstance", "persons", "orgUnits", "leader", "Substitute", "Person", "NotificationService", "substituteId",
        function ($scope, $modalInstance, persons, orgUnits, leader, Substitute, Person, NotificationService, substituteId) {

        $scope.loadingPromise = null;

        $scope.persons = persons;
        $scope.orgUnits = orgUnits;

        $scope.substitute = Substitute.get({ id: substituteId }, function (data) {

            $scope.substitute = data.value[0]; // This is bad, but can't change the service
            $scope.person = $scope.substitute.Sub;
            console.log($scope.substitute);
            $scope.substituteFromDate = new Date($scope.substitute.StartDateTimestamp * 1000).toLocaleDateString();
            if ($scope.substitute.EndDateTimestamp == 9999999999) {
                $scope.substituteToDate = "På ubestemt tid";
            } else {
                $scope.substituteToDate = new Date($scope.substitute.EndDateTimestamp * 1000).toLocaleDateString();
            }
        });

        
        $scope.orgUnitSelected = function (id) {
            console.log(id);
        }

        $scope.deleteSubstitute = function () {

            var sub = new Substitute();

            $scope.showSpinner = true;

            $scope.loadingPromise = sub.$delete({ id: $scope.substitute.Id }, function (data) {
                NotificationService.AutoFadeNotification("success", "", "Stedfortræderen blev slettet.");
                $modalInstance.close();
            }, function () {
                NotificationService.AutoFadeNotification("danger", "", "Kunne ikke slette stedfortræder");
            });
        };

        $scope.cancelSubstitute = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
angular.module('app.core').controller('EditApproverModalInstanceController',
    ["$scope", "$modalInstance", "persons", "orgUnits", "leader", "Substitute", "Person", "NotificationService", "substituteId","Autocomplete","ReportType",
        function ($scope, $modalInstance, persons, orgUnits, leader, Substitute, Person, NotificationService, substituteId,Autocomplete, ReportType) {

            $scope.persons = persons;
            $scope.orgUnits = orgUnits;
            $scope.orgUnit = $scope.orgUnits[0];

            $scope.loadingPromise = null;

            $scope.personsWithoutLeader = Autocomplete.activeUsersWithoutLeader(leader.Id);

            $scope.autoCompleteOptionsFor = {
                select: function (e) {
                    $scope.target = this.dataItem(e.item.index());
                }
            }

            $scope.autoCompleteOptionsSub = {
                select: function (e) {
                    $scope.approver = this.dataItem(e.item.index());
                }
            }


            $scope.substitute = Substitute.get({ id: substituteId }, function (data) {

                if (data.value[0].EndDateTimestamp == 9999999999) {
                    $scope.infinitePeriod = true;
                }


                $scope.substitute = data.value[0]; // Should change the service

                $scope.target = $scope.substitute.Person;
                $scope.approver = $scope.substitute.Sub;

                $scope.approverFromDate = new Date($scope.substitute.StartDateTimestamp * 1000);
                $scope.approverToDate = new Date($scope.substitute.EndDateTimestamp * 1000);
                $scope.orgUnit = $.grep($scope.orgUnits, function (e) { return e.Id == $scope.substitute.OrgUnitId; })[0];
                $scope.container.autoCompleteFor.value($scope.target.FullName);
                $scope.container.autoCompleteSub.value($scope.approver.FullName);
            });

            $scope.saveNewApprover = function () {
                if ($scope.approver == undefined) {
                    NotificationService.AutoFadeNotification("danger", "", "Du skal vælge en godkender");
                    return;
                }

                if ($scope.target == undefined) {
                    NotificationService.AutoFadeNotification("danger", "", "Du skal vælge en ansat");
                    return;
                }

                var sub = new Substitute({
                    StartDateTimestamp: Math.floor($scope.approverFromDate.getTime() / 1000),
                    EndDateTimestamp: Math.floor($scope.approverToDate.getTime() / 1000),
                    SubId: $scope.approver.Id,
                    OrgUnitId: 1,
                    PersonId: $scope.target.Id,
                    CreatedById: leader.Id,
                    Type: ReportType === 0 ? "Drive" : "Vacation"
                });

                if ($scope.infinitePeriod) {
                    sub.EndDateTimestamp = 9999999999;
                }

                $scope.showSpinner = true;

                $scope.loadingPromise = sub.$patch({ id: substituteId }, function (data) {
                    NotificationService.AutoFadeNotification("success", "", "Godkender blev redigeret");
                    $modalInstance.close();
                }, function () {
                    NotificationService.AutoFadeNotification("danger", "", "Kunne ikke oprette godkender");
                    $scope.showSpinner = false;
                });
            };

            $scope.cancelNewApprover = function () {
                $modalInstance.dismiss('cancel');
            };
        }]);

angular.module("app.core").controller("EditMailNotificationController", [
    "$scope", "$modalInstance", "itemId", "NotificationService", "EmailNotification",
    function ($scope, $modalInstance, itemId, NotificationService, EmailNotification) {


     

        $scope.repeatMonthly = "";

        $scope.dateOptions = {
            format: "dd/MM/yyyy"
        };

        $scope.repeatItems = [{ value: "Ja", bool : true }, { value: "Nej", bool : false }];

        EmailNotification.get({ id: itemId }).$promise.then(function (res) {
            $scope.repeatMonthly = $scope.repeatItems[1];
            if (res.Repeat) {
                $scope.repeatMonthly = $scope.repeatItems[0];
            }
            var date = moment.unix(res.DateTimestamp);
            var payDate = moment.unix(res.PayRoleTimestamp);
            $scope.notificationDate = date._d;
            $scope.payRoleDate = payDate._d;
        });

        $scope.confirmSave = function () {
            /// <summary>
            /// Confirms edit of MailNotification.
            /// </summary>
            var error = false;

            $scope.repeatErrorMessage = "";
            if ($scope.repeatMonthly == "") {
                error = true;
                $scope.repeatErrorMessage = "* Du skal udfylde 'Gentag månedligt'.";
            }

            $scope.dateErrorMessage = "";
            if ($scope.notificationDate == undefined) {
                error = true;
                $scope.dateErrorMessage = "* Du skal vælge en gyldig adviseringsdato.";
            }

            $scope.payDateErrorMessage = "";
            if ($scope.payRoleDate == undefined) {
                error = true;
                $scope.payDateErrorMessage = "* Du skal vælge en gyldig lønkørselsdato.";
            }

            var result = {};
            result.repeatMonthly = $scope.repeatMonthly.bool;

            result.notificationDate = moment($scope.notificationDate).unix();

            result.payDate = moment($scope.payRoleDate).unix();

            if (!error) {
                $modalInstance.close(result);
                NotificationService.AutoFadeNotification("success", "", "Email-adviseringen blev redigeret.");
            }
            
        }

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
            NotificationService.AutoFadeNotification("warning", "", "Oprettelse af email adviseringen blev annulleret.");
        }
    }
]);
angular.module('app.core').controller('EditSubstituteModalInstanceController',
    ["$scope", "$modalInstance", "persons", "OrgUnit", "leader", "Substitute", "Person", "NotificationService", "substituteId", "ReportType",
    function ($scope, $modalInstance, persons, OrgUnit, leader, Substitute, Person, NotificationService, substituteId, ReportType) {

        $scope.container = {};

        $scope.persons = persons;

        $scope.loadingPromise = null;

        $scope.person = [];

        $scope.autoCompleteOptions = {
            select: function (e) {
                $scope.person[0] = this.dataItem(e.item.index());
            }
        }

        $scope.substitute = Substitute.get({ id: substituteId }, function (data) {
            if (data.value[0].EndDateTimestamp == 9999999999) {
                $scope.infinitePeriod = true;
            }

            OrgUnit.getWhereUserIsLeader({ id: data.value[0].PersonId }).$promise.then(function(res) {
                $scope.orgUnits = res;
            });

            $scope.substitute = data.value[0]; // This is bad, but can't change the service
            $scope.orgUnit = $scope.substitute.OrgUnit;
            $scope.person[0] = $scope.substitute.Sub;
            $scope.substituteFromDate = new Date($scope.substitute.StartDateTimestamp * 1000);
            $scope.substituteToDate = new Date($scope.substitute.EndDateTimestamp * 1000);
            $scope.container.autoComplete.value($scope.substitute.Sub.FullName);
        });

        $scope.saveNewSubstitute = function () {
            if ($scope.person == undefined) {
                NotificationService.AutoFadeNotification("danger", "", "Du skal vælge en person");
                return;
            }

            var sub = new Substitute({
                StartDateTimestamp: Math.floor($scope.substituteFromDate.getTime() / 1000),
                EndDateTimestamp: Math.floor($scope.substituteToDate.getTime() / 1000),
                SubId: $scope.person[0].Id,
                OrgUnitId: $scope.orgUnit.Id,
                CreatedById: leader.Id,
                Type: ReportType === 0 ? "Drive" : "Vacation"
            });

            if ($scope.infinitePeriod) {
                sub.EndDateTimestamp = 9999999999;
            }

            $scope.showSpinner = true;

            $scope.loadingPromise = sub.$patch({ id: $scope.substitute.Id }, function (data) {
                NotificationService.AutoFadeNotification("success", "", "Stedfortræder blev gemt");
                $modalInstance.close();
            }, function () {
                NotificationService.AutoFadeNotification("danger", "", "Kunne ikke gemme stedfortræder (Du kan ikke oprette 2 stedfortrædere for samme organisation i samme periode)");
                $scope.showSpinner = false;
            });
        };

        $scope.cancelNewSubstitute = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

angular.module("app.core").controller("EmailNotificationController", [
    "$scope", "$modal", "EmailNotification", "$rootScope", function ($scope, $modal, EmailNotification, $rootScope) {


        $scope.$on('emailClicked', function (event, mass) {
            $scope.gridContainer.notificationGrid.dataSource.read();
        });

        $scope.EmailHelpText = $rootScope.HelpTexts.EmailHelpText.text;

        $scope.gridContainer = {};


        /// <summary>
        /// Loads existing MailNotifications from backend to kendo grid datasource.
        /// </summary>
        $scope.notifications = {
            autoBind: false,
            dataSource: {
                type: "odata-v4",
                transport: {
                    read: {
                        beforeSend: function(req) {
                            req.setRequestHeader('Accept', 'application/json;odata=fullmetadata');
                        },
                        url: "/odata/MailNotifications",
                        dataType: "json",
                        cache: false
                    }
                },
                pageSize: 20,
                serverPaging: false,
                serverSorting: true
            },
            sortable: true,
            pageable: {
                messages: {
                    display: "{0} - {1} af {2} adviseringer", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                    empty: "Ingen adviseringer at vise",
                    page: "Side",
                    of: "af {0}", //{0} is total amount of pages
                    itemsPerPage: "adviseringer pr. side",
                    first: "Gå til første side",
                    previous: "Gå til forrige side",
                    next: "Gå til næste side",
                    last: "Gå til sidste side",
                    refresh: "Genopfrisk"
                },
                pageSizes: [5, 10, 20, 30, 40, 50, 100, 150, 200]
            },
            scrollable: false,
            columns: [
                {
                    field: "DateTimestamp",
                    title: "Adviseringsdato",
                    template: function(data) {
                        var m = moment.unix(data.DateTimestamp);
                        return m._d.getDate() + "/" +
                            (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                            m._d.getFullYear();
                    }
                },
                {
                    field: "PayRoleTimestamp",
                    title: "Lønkørselsdato",
                    template: function(data) {
                        var m = moment.unix(data.PayRoleTimestamp);
                        return m._d.getDate() + "/" +
                            (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                            m._d.getFullYear();
                    }
                },
                {
                    field: "Repeat",
                    title: "Gentag månedligt",
                    template: function(data) {
                        if (data.Repeat) {
                            return "Ja";
                        }
                        return "Nej";
                    }
                },
                {
                    field: "Notified",
                    title: "Er kørt",
                    template: function(data) {
                        if (data.Notified) {
                            return "<i class='fa fa-check'></i>";
                        }
                        return "";
                    }
                },
                {
                    field: "Id",
                    template: "<a ng-click=editClick(${Id})>Redigér</a> | <a ng-click=deleteClick(${Id})>Slet</a>",
                    title: "Muligheder"
                }
            ]
        };

        $scope.updateNotificationGrid = function () {
            /// <summary>
            /// Refreshes kendo grid datasource.
            /// </summary>
            $scope.gridContainer.notificationGrid.dataSource.read();
        }

        $scope.editClick = function (id) {
            /// <summary>
            /// Opens Edit MailNotification modal
            /// </summary>
            /// <param name="id">Id of MailNotification to edit</param>
            var modalInstance = $modal.open({
                templateUrl: '/App/Core/Views/Modals/EditMailNotificationTemplate.html',
                controller: 'EditMailNotificationController',
                backdrop: "static",
                resolve: {
                    itemId: function () {
                        return id;
                    }
                }
            });

            modalInstance.result.then(function (result) {
                EmailNotification.patch({ id: id }, {
                    "DateTimestamp": result.notificationDate,
                    "Repeat": result.repeatMonthly,
                    "PayRoleTimestamp": result.payDate,
                }, function () {
                    $scope.updateNotificationGrid();
                });
            });
        }

        //$scope.pageSizeChanged = function () {
        //    $scope.gridContainer.notificationGrid.dataSource.pageSize(Number($scope.gridContainer.gridPageSize));
        //}

        $scope.deleteClick = function (id) {
            /// <summary>
            /// Opens delete MailNotification modal
            /// </summary>
            /// <param name="id">Id of MailNotification to delete</param>
            var modalInstance = $modal.open({
                templateUrl: '/App/Core/Views/Modals/ConfirmDeleteMailNotificationTemplate.html',
                controller: 'DeleteMailNotificationController',
                backdrop: "static",
                resolve: {
                    itemId: function () {
                        return id;
                    }
                }
            });

            modalInstance.result.then(function () {
                EmailNotification.delete({ id: id }, function () {
                    $scope.updateNotificationGrid();
                });
            });
        }

        $scope.addNewClick = function () {
            /// <summary>
            /// Opens add new MailNotification modal
            /// </summary>
            var modalInstance = $modal.open({
                templateUrl: '/App/Core/Views/Modals/AddNewMailNotificationTemplate.html',
                controller: 'AddNewMailNotificationController',
                backdrop: "static",
            });

            modalInstance.result.then(function (result) {
                EmailNotification.post({
                    "DateTimestamp": result.notificationDate,
                    "Repeat": result.repeatMonthly,
                    "Notified": false,
                    "PayRoleTimestamp": result.payDate,
                }, function () {
                    $scope.updateNotificationGrid();
                });
            });
        }


    }
]);

angular.module('app.core').controller('NewApproverModalInstanceController',
    ["$scope", "$modalInstance", "persons", "orgUnits", "leader", "Substitute", "Person", "NotificationService","Autocomplete", "ReportType",
    function ($scope, $modalInstance, persons, orgUnits, leader, Substitute, Person, NotificationService,Autocomplete, ReportType) {

        $scope.loadingPromise = null;

        $scope.persons = persons;
        $scope.approverFromDate = new Date();
        $scope.approverToDate = new Date();
        $scope.orgUnits = orgUnits;
        $scope.orgUnit = $scope.orgUnits[0];

        $scope.autoCompleteOptions = {
            filter: "contains"
        };

        $scope.personsWithoutLeader = Autocomplete.activeUsersWithoutLeader(leader.Id);


        $scope.saveNewApprover = function () {
            if ($scope.approver == undefined) {
                NotificationService.AutoFadeNotification("danger", "", "Du skal vælge en godkender");
                return;
            }

            if ($scope.target == undefined) {
                NotificationService.AutoFadeNotification("danger", "", "Du skal vælge en ansat");
                return;
            }



            var sub = new Substitute({
                StartDateTimestamp: Math.floor($scope.approverFromDate.getTime() / 1000),
                EndDateTimestamp: Math.floor($scope.approverToDate.getTime() / 1000),
                LeaderId: leader.Id,
                SubId: $scope.approver[0].Id,
                OrgUnitId: 1,
                PersonId: $scope.target[0].Id,
                CreatedById: leader.Id,
                Type: ReportType === 0 ? "Drive" : "Vacation"
            });

            if ($scope.infinitePeriod) {
                sub.EndDateTimestamp = 9999999999;
            }

            $scope.showSpinner = true;

            $scope.loadingPromise = sub.$post(function (data) {
                NotificationService.AutoFadeNotification("success", "", "Godkender blev oprettet");
                $modalInstance.close();
            }, function () {
                NotificationService.AutoFadeNotification("danger", "", "Kunne ikke oprette godkender (Du kan ikke oprette 2 godkendere for samme person i samme periode)");
                $scope.showSpinner = false;
            });
        };

        $scope.cancelNewApprover = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

angular.module('app.core').controller('NewSubstituteModalInstanceController',
    ["$scope", "$modalInstance", "persons", "OrgUnit", "leader", "Substitute", "Person", "NotificationService", "Autocomplete", "ReportType",
    function ($scope, $modalInstance, persons, OrgUnit, leader, Substitute, Person, NotificationService, Autocomplete, ReportType) {

        $scope.loadingPromise = null;

        $scope.persons = persons;
        $scope.substituteFromDate = new Date();
        $scope.substituteToDate = new Date();

        $scope.orgUnits = $scope.orgUnits = OrgUnit.getWhereUserIsLeader({ id: leader.Id }, function() {
            $scope.orgUnit = $scope.orgUnits[0];
        });

        $scope.autoCompleteOptions = {
            filter: "contains"
        };

        $scope.personsWithoutLeader = Autocomplete.activeUsersWithoutLeader(leader.Id);

        $scope.saveNewSubstitute = function () {
            if ($scope.person == undefined) {
                NotificationService.AutoFadeNotification("danger", "", "Du skal vælge en person");
                return;
            }

            var sub = new Substitute({
                StartDateTimestamp: Math.floor($scope.substituteFromDate.getTime() / 1000),
                EndDateTimestamp: Math.floor($scope.substituteToDate.getTime() / 1000),
                LeaderId: leader.Id,
                SubId: $scope.person[0].Id,
                OrgUnitId: $scope.orgUnit.Id,
                PersonId: leader.Id,
                CreatedById: leader.Id,
                Type: ReportType === 0 ? "Drive" : "Vacation"
            });

            if ($scope.infinitePeriod) {
                sub.EndDateTimestamp = 9999999999;
            }

            $scope.showSpinner = true;

            $scope.loadingPromise = sub.$post(function (data) {
                NotificationService.AutoFadeNotification("success", "", "Stedfortræder blev oprettet");
                $modalInstance.close();
            }, function () {
                NotificationService.AutoFadeNotification("danger", "", "Kunne ikke oprette stedfortræder");
                $scope.showSpinner = false;
            });
        };

        $scope.cancelNewSubstitute = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

angular.module("app.core").controller("RejectReportModalInstanceController", [
   "$scope", "$modalInstance", "itemId", "NotificationService", function ($scope, $modalInstance, itemId, NotificationService) {

       $scope.itemId = itemId;

       $scope.result = {};


       $scope.noClicked = function () {
           $modalInstance.dismiss('cancel');
           NotificationService.AutoFadeNotification("warning", "", "Afvisning af indberetningen blev annulleret.");
       }

       $scope.yesClicked = function () {
           if ($scope.comment == undefined) {
               $scope.errorMessage = "* Du skal angive en kommentar.";
           } else {
               $scope.result.Comment = $scope.comment;
               $scope.result.Id = itemId;
               $modalInstance.close($scope.result);
           }
       }
   }
]);

(function () {
    'use strict';

    angular
        .module('app.core')
        .directive('checkie', ["$modal",
            function ($modal) {
                return {
                    restrict: 'AE',
                    replace: true,
                    scope: {
                        checkieMinIe: '@',
                        checkieMessage: '@',
                        checkieDebug: '@'
                    },
                    transclude: true,
                    template: '<div data-ng-class="{outdated: outdated}"><div data-ng-if="outdated === false" ng-transclude></div></div>',
                    link: link
                };

                function link($scope, elem, attr) {
                    var ieversion = ($scope.checkieDebug) ? $scope.checkieDebug : _getExplorerVersion();

                    // set the minimum ie to 9 if no value was passed from the attributes
                    $scope.checkieMinIe = ($scope.checkieMinIe && $scope.checkieMinIe.length) ? $scope.checkieMinIe : 9;

                    // determine if the browser is an outdated version of IE
                    $scope.outdated = (ieversion > -1 && ieversion < parseInt($scope.checkieMinIe));

                    // reset the message to blank by default
                    $scope.msg = "";

                    // check if the browser is any version of IE, and if so, if it is below the minimum version
                    if ($scope.outdated) {

                        // set the message to a generic message or the passed message via the checkie-message attribute
                        $scope.msg = ($scope.checkieMessage && $scope.checkieMessage.length > 0) ? $scope.checkieMessage : "Browseren kan ikke anvendes til OS2Indberetning. Din version af browseren Internet Explorer er for gammel. Du bedes opdatere Internet Explorer til version 11, alternativt bruge browserne Chrome eller Firefox.";

                        var modalInstance = $modal.open({
                            templateUrl: '/App/Services/Error/ServiceError.html',
                            controller: "ServiceErrorController",
                            backdrop: "static",
                            resolve: {
                                errorMsg: function () {
                                    return $scope.msg;
                                }
                            }
                        });
                    }
                }

                /**
                 * Private function to determine the exporer version
                 * @return {Number} The explorer version number, or -1 if it is not Internet Explorer
                 */
                function _getExplorerVersion() {
                    var rv = -1;

                    if (navigator.appName === 'Microsoft Internet Explorer') {
                        var ua = navigator.userAgent,
                            re = new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");

                        if (re.exec(ua) !== null) rv = parseFloat(RegExp.$1);
                    }

                    return rv;
                }
            }]);
})();

// ng-enter in html to attach eventhandler to clicking enter.
angular.module("app.core").directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});
var app;
(function (app) {
    var core;
    (function (core) {
        var models;
        (function (models) {
            "use strict";
            var Employment = (function () {
                function Employment() {
                }
                return Employment;
            }());
            models.Employment = Employment;
        })(models = core.models || (core.models = {}));
    })(core = app.core || (app.core = {}));
})(app || (app = {}));
//# sourceMappingURL=Employment.js.map
var app;
(function (app) {
    var core;
    (function (core) {
        var models;
        (function (models) {
            "use strict";
            var OrgUnit = (function () {
                function OrgUnit() {
                }
                return OrgUnit;
            }());
            models.OrgUnit = OrgUnit;
        })(models = core.models || (core.models = {}));
    })(core = app.core || (app.core = {}));
})(app || (app = {}));
//# sourceMappingURL=OrgUnit.js.map
var app;
(function (app) {
    var core;
    (function (core) {
        var models;
        (function (models) {
            "use strict";
            var Person = (function () {
                function Person() {
                }
                return Person;
            }());
            models.Person = Person;
        })(models = core.models || (core.models = {}));
    })(core = app.core || (app.core = {}));
})(app || (app = {}));
//# sourceMappingURL=Person.js.map
var app;
(function (app) {
    var core;
    (function (core) {
        var models;
        (function (models) {
            "use strict";
            (function (ReportStatus) {
                ReportStatus[ReportStatus["Pending"] = 0] = "Pending";
                ReportStatus[ReportStatus["Accepted"] = 1] = "Accepted";
                ReportStatus[ReportStatus["Rejected"] = 2] = "Rejected";
                ReportStatus[ReportStatus["Invoiced"] = 3] = "Invoiced";
            })(models.ReportStatus || (models.ReportStatus = {}));
            var ReportStatus = models.ReportStatus;
            (function (ReportType) {
                ReportType[ReportType["Unknown"] = -1] = "Unknown";
                ReportType[ReportType["Drive"] = 0] = "Drive";
                ReportType[ReportType["Vacation"] = 1] = "Vacation";
            })(models.ReportType || (models.ReportType = {}));
            var ReportType = models.ReportType;
            var Report = (function () {
                function Report() {
                }
                return Report;
            }());
            models.Report = Report;
        })(models = core.models || (core.models = {}));
    })(core = app.core || (app.core = {}));
})(app || (app = {}));
//# sourceMappingURL=Report.js.map
var app;
(function (app) {
    var core;
    (function (core) {
        var models;
        (function (models) {
            "use strict";
        })(models = core.models || (core.models = {}));
    })(core = app.core || (app.core = {}));
})(app || (app = {}));
//# sourceMappingURL=Substitute.js.map
var app;
(function (app) {
    var core;
    (function (core) {
        var models;
        (function (models) {
            "use strict";
            var VacationBalance = (function () {
                function VacationBalance() {
                }
                return VacationBalance;
            }());
            models.VacationBalance = VacationBalance;
        })(models = core.models || (core.models = {}));
    })(core = app.core || (app.core = {}));
})(app || (app = {}));
//# sourceMappingURL=VacationBalance.js.map
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (app) {
    var core;
    (function (core) {
        var models;
        (function (models) {
            "use strict";
            (function (VacationType) {
                VacationType[VacationType["Regular"] = 0] = "Regular";
                VacationType[VacationType["SixthVacationWeek"] = 1] = "SixthVacationWeek";
                VacationType[VacationType["Care"] = 2] = "Care";
                VacationType[VacationType["Senior"] = 3] = "Senior";
                VacationType[VacationType["Optional"] = 4] = "Optional";
                VacationType[VacationType["Other"] = 5] = "Other";
            })(models.VacationType || (models.VacationType = {}));
            var VacationType = models.VacationType;
            var VacationReport = (function (_super) {
                __extends(VacationReport, _super);
                function VacationReport() {
                    _super.apply(this, arguments);
                }
                return VacationReport;
            }(models.Report));
            models.VacationReport = VacationReport;
        })(models = core.models || (core.models = {}));
    })(core = app.core || (app.core = {}));
})(app || (app = {}));
//# sourceMappingURL=VacationReport.js.map
var app;
(function (app) {
    var core;
    (function (core) {
        var services;
        (function (services) {
            var Authorization = (function () {
                function Authorization($rootScope, $state, principal, EnabledApplications) {
                    this.$rootScope = $rootScope;
                    this.$state = $state;
                    this.principal = principal;
                    this._authenticated = false;
                    this.enabledModules = [];
                    this.enabledModules = EnabledApplications.toLowerCase().split(', ');
                }
                Authorization.prototype.getModule = function (state) {
                    return state.split('.')[0];
                };
                Authorization.prototype.isModuleEnabled = function (module) {
                    return this.enabledModules.indexOf(module) !== -1;
                };
                Authorization.prototype.authorize = function () {
                    var _this = this;
                    return this.principal.identity().then(function () {
                        var isAuthenticated = _this.principal.isAuthenticated();
                        var module = _this.getModule(_this.$rootScope.toState.name);
                        var modules = _this.intersect(_this.enabledModules, _this.principal.accessibleModules());
                        if (isAuthenticated) {
                            if (modules.length == 0) {
                                _this.$rootScope.hasAccess = false;
                            }
                            else if (module != 'default' && !_this.canAccessModule(module, modules)) {
                                // Trying to access inaccessible module, so redirect to start
                                _this.$state.go("default");
                            }
                            else if (module == 'default' && modules.length == 1) {
                                // Only has access to one module, so redirect to it.
                                if (modules == 'drive') {
                                    _this.$state.go("drive.driving");
                                }
                                else if (modules == 'vacation') {
                                    _this.$state.go("vacation.report");
                                }
                            }
                            else {
                                // Has access to module, so see if user has access to state otherwise redirect to start
                                if (_this.$rootScope.toState.data && _this.$rootScope.toState.data.roles
                                    && _this.$rootScope.toState
                                        .data.roles.length > 0
                                    && !_this.principal.isInAnyRole(_this.$rootScope.toState.data.roles)) {
                                    _this.$state.go("default");
                                }
                            }
                        }
                    });
                };
                Authorization.prototype.canAccessModule = function (module, modules) {
                    return modules.indexOf(module) !== -1;
                };
                Authorization.prototype.intersect = function (a, b) {
                    var t;
                    if (b.length > a.length)
                        t = b, b = a, a = t; // indexOf to loop over shorter
                    return a.filter(function (e) {
                        if (b.indexOf(e) !== -1)
                            return true;
                    });
                };
                Authorization.$inject = [
                    "$rootScope",
                    "$state",
                    "Principal",
                    "EnabledApplications"
                ];
                return Authorization;
            }());
            angular.module("app.core").service("Authorization", Authorization);
        })(services = core.services || (core.services = {}));
    })(core = app.core || (app.core = {}));
})(app || (app = {}));
//# sourceMappingURL=Authorization.js.map
angular.module("app.core").service("Autocomplete", function () {
    return {
        allUsers: function () {
            return {
                type: "json",
                minLength: 3,
                serverFiltering: true,
                crossDomain: true,
                transport: {
                    read: {
                        url: function (item) {

                            var req = "/odata/Person?$filter=contains(FullName," + "'" + encodeURIComponent(item.filter.filters[0].value) + "')";
                            return req;
                        },
                        dataType: "json",
                        data: {

                        }
                    }
                },
                schema: {
                    data: function (data) {
                        return data.value;
                    }
                },
            }
        },
        activeUsers: function () {
            return {
                type: "json",
                minLength: 3,
                serverFiltering: true,
                crossDomain: true,
                transport: {
                    read: {
                        url: function (item) {

                            var req = "/odata/Person?$filter=contains(FullName," + "'" + encodeURIComponent(item.filter.filters[0].value) + "') and IsActive";
                            return req;
                        },
                        dataType: "json",
                        data: {

                        }
                    }
                },
                schema: {
                    data: function (data) {
                        return data.value;
                    }
                },
            }
        },
        activeUsersWithoutLeader: function (leaderId) {
            return {
                type: "json",
                minLength: 3,
                serverFiltering: true,
                crossDomain: true,
                transport: {
                    read: {
                        url: function (item) {

                            var req = "/odata/Person?$filter=contains(FullName," + "'" + encodeURIComponent(item.filter.filters[0].value) + "') and IsActive and Id ne " + leaderId;
                            return req;
                        },
                        dataType: "json",
                        data: {

                        }
                    }
                },
                schema: {
                    data: function (data) {
                        return data.value;
                    }
                },
            }
        },
        admins: function () {
            return {
                type: "json",
                minLength: 3,
                serverFiltering: true,
                crossDomain: true,
                transport: {
                    read: {
                        url: function (item) {

                            var req = "/odata/Person?$filter=contains(FullName," + "'" + encodeURIComponent(item.filter.filters[0].value) + "') and IsActive and IsAdmin";
                            return req;
                        },
                        dataType: "json",
                        data: {

                        }
                    }
                },
                schema: {
                    data: function (data) {
                        return data.value;
                    }
                },
            }
        },
        nonAdmins: function () {
            return {
                type: "json",
                minLength: 3,
                serverFiltering: true,
                crossDomain: true,
                transport: {
                    read: {
                        url: function (item) {

                            var req = "/odata/Person?$filter=contains(FullName," + "'" + encodeURIComponent(item.filter.filters[0].value) + "') and IsActive and not IsAdmin";
                            return req;
                        },
                        dataType: "json",
                        data: {

                        }
                    }
                },
                schema: {
                    data: function (data) {
                        return data.value;
                    }
                },
            }
        },
        leaders: function () {
            return {
                type: "json",
                minLength: 3,
                serverFiltering: true,
                crossDomain: true,
                transport: {
                    read: {
                        url: function (item) {
                            var req = "/odata/Employments?$filter=contains(Person/FullName," + "'" + encodeURIComponent(item.filter.filters[0].value) + "') and IsLeader &$expand=Person &$select=Person";
                            return req;
                        },
                        dataType: "json",
                        data: {

                        }
                    }
                },
                schema: {
                    data: function (data) {
                        var map = {};
                        var result = [];
                        var leaders = angular.fromJson(data).value;

                        // Remove duplicate values.
                        for (var i = 0; i < leaders.length; i++) {
                            if (map[leaders[i].Person.FullName] == undefined) {
                                result.push(leaders[i].Person);
                                map[leaders[i].Person.FullName] = leaders[i].Person;
                            }
                        }

                        return result;
                    }
                },
            }
        },
        orgUnits: function () {
            return {
                type: "json",
                minLength: 3,
                serverFiltering: true,
                crossDomain: true,
                transport: {
                    read: {
                        url: function (item) {

                            var req = "/odata/OrgUnits?$filter=contains(LongDescription," + "'" + encodeURIComponent(item.filter.filters[0].value) + "')";
                            return req;
                        },
                        dataType: "json",
                        data: {

                        }
                    }
                },
                schema: {
                    data: function (data) {
                        return data.value;
                    }
                },
            }
        },
        orgUnitsThatHaveALeader: function () {
            return {
                type: "json",
                minLength: 3,
                serverFiltering: true,
                crossDomain: true,
                transport: {
                    read: {
                        url: function (item) {
                            if (item.filter == undefined) {
                                item.filter = {};
                                item.filter.filters = [];
                                item.filter.filters.push({field: "LongDescription", ignoreCase: "true", operator: "contains", value: ""})
                            }
                            var req = "/odata/Employments?$filter=contains(OrgUnit/LongDescription," + "'" + encodeURIComponent(item.filter.filters[0].value) + "') and IsLeader&$select=OrgUnit&$expand=OrgUnit";
                            return req;
                        },
                        dataType: "json",
                        data: {

                        }
                    }
                },
                schema: {
                    data: function (data) {
                        var result = [];
                        for (var i = 0; i < data.value.length; i++) {
                            result.push(data.value[i].OrgUnit);
                        }
                        return result;
                    }
                },
            }
        }
    }
});
angular.module("app.core").service('BankAccount', ["$resource", function ($resource) {
    return $resource("/odata/BankAccounts(:id)", { id: "@id" }, {
        "get": { method: "GET", isArray: false },
        "patch": { method: "PATCH" },
        "post": { method: "POST" },
        "getByAccount" : {
            method: "GET",
            url: "/odata/BankAccounts?$filter=Number eq ':account'",
            transformResponse: function (data) {
                var res = angular.fromJson(data).value[0];
                return res;
            }
        }
    });
}]);
angular.module("app.core").service('EmailNotification', ["$resource", function ($resource) {
    return $resource("/odata/MailNotifications(:id)", { id: "@id" }, {
        "get": { method: "GET", isArray: false, transformResponse: function(data) {
            var res = angular.fromJson(data);
            if (res.error == undefined) {
                return res.value[0];
            }

            var modalInstance = $modal.open({
                templateUrl: '/App/Core/Services/Error/ServiceError.html',
                controller: "ServiceErrorController",
                backdrop: "static",
                resolve: {
                    errorMsg: function () {
                        return res.error.innererror.message;
                    }
                }
            });
            return res;
        }},
        "getAll": {
            method: "GET", isArray: false
        },
        "patch": { method: "PATCH", isArray: false },
        "post": { method: "POST", isArray: false }
    });
}]);
angular.module("app.core").service('File', ["$resource", function ($resource) {
    return $resource("/api/File", { id: "@id" }, {
        "generateKMDFile": { method: "GET" }
    });
}]);
angular.module("app.core").service("HelpText", ["$resource", function ($resource) {
    return $resource("/api/HelpText/:id", { id: "@id" }, {
        "get": {
            method: "GET",
            isArray: false,
            transformResponse: function (data) {
                // This sucks, but blame angular.
                // http://stackoverflow.com/questions/24876593/resource-query-return-split-strings-array-of-char-instead-of-a-string
                return { text: angular.fromJson(data) };
            }
        },
        "getAll": {
            method: "GET",
            url: "/api/HelpText/",
            isArray: false,
            transformResponse: function (data) {
                var res = {};

                angular.forEach(angular.fromJson(data), function(value, key) {
                    res[value.key] = { text: value.value };
                });
                return res;
            }
        }
    });
}]);
angular.module("app.core").factory("NotificationService", [function NotificationService() {
    return {
        AutoFadeNotification: function (type, title, message) {
            // Some backwards compatibility.
            if (type == "danger") {
                type = "error";
            }
            if (type == "warning") {
                type = "notice";
            }

            var effect = {
                effect_in: 'drop',
                options_in: {
                    easing: 'easeOutBounce',
                },
                options_out: {
                    easing: 'easeInCubic',
                },
                effect_out: 'drop',
            }

            new PNotify({
                remove: true,
                title: "<br/>" + title,
                text: message,
                min_height: "100px",
                width: "300px",
                type: type,
                icon: true,
                delay: 5000,
                shadow: true,
                animation: effect,
                mouse_reset: false,
                buttons: {
                    sticker: false
                }
            });
        }
    };
}]);
angular.module("app.core").service('OrgUnit', ["$resource", function ($resource) {
    return $resource("/odata/OrgUnits(:id)?:query", { id: "@id"}, {
        "get": { method: "GET", isArray: false },
        "patch": { method: "PATCH", isArray: false },
        "getWhereUserIsLeader": {
            method: "GET",
            isArray: true,
            url: "/odata/OrgUnits/Service.GetWhereUserIsResponsible?personId=:id",
            transformResponse: function (data) {
                return angular.fromJson(data).value;
            }
        },
        "getLeaderOfOrg": {
            method: "GET",
            isArray: false,
            url: "/odata/OrgUnits/Service.GetLeaderOfOrg?orgId=:id",
            transformResponse: function (data) {
                var result = angular.fromJson(data);
                return result;
            }
        },
        "SetVacationAccess": {
            method: "GET",
            isArray: false,
            url: "/odata/OrgUnits/Service.SetVacationAccess(Key=:id)"
        }
    });
}]);


angular.module("app.core").service("PersonEmployments", ["$resource", function ($resource) {
    return $resource("/odata/Person(:id)/Employments?$expand=OrgUnit", { id: "@id" }, {
        "get": {
            method: "GET",
            isArray: true,
            transformResponse: function (data) {
                var res = angular.fromJson(data);
                if (res.error == undefined) {
                    return res.value;
                }

                var modalInstance = $modal.open({
                    templateUrl: '/App/Core/Services/Error/ServiceError.html',
                    controller: "ServiceErrorController",
                    backdrop: "static",
                    resolve: {
                        errorMsg: function () {
                            return res.error.innererror.message;
                        }
                    }
                });
                return res;
            }
        },
        "patchEmployment": {
            method: "PATCH",
            isArray: false,
            url: "/odata/Employments(:id)"
        }
    });
}]);
angular.module("app.core").service('Person', ["$resource", "$modal", function ($resource, $modal) {
    return $resource("/odata/Person(:id)", { id: "@id" }, {
        "get": {
            method: "GET", isArray: false, transformResponse: function (data) {
                var res = angular.fromJson(data);
                return res;
            }
        },
        "getAll": {
            method: "GET", isArray: false, url: "/odata/Person?:query", transformResponse: function(data) {
                var res = angular.fromJson(data);
                return res;
            }
        },
        "patch": { method: "PATCH" },
        "getNonAdmins": {
            url: "/odata/Person?$filter=IsAdmin eq false and IsActive eq true &$select=Id,FullName",
            method: "GET", isArray: false, transformResponse: function(data) {
                var res = angular.fromJson(data);
                return res;
            }
        },
        "GetCurrentUser" : {
            url: "/odata/Person/Service.GetCurrentUser?$select=Id,FirstName,IsSubstitute,RecieveMail,IsAdmin,FullName,Initials,Mail,HasAppPassword,DistanceFromHomeToBorder &$expand=PersonalRoutes($expand=Points),LicensePlates,Employments($expand=AlternativeWorkAddress,OrgUnit($select=Id,LongDescription,HasAccessToFourKmRule,DefaultKilometerAllowance,HasAccessToVacation; $expand=Address); $select=Id,Position,IsLeader,HomeWorkDistance,WorkDistanceOverride, AlternativeWorkAddressId, EmploymentId)",
            method: "GET",
            transformResponse: function (data) {
                var res = angular.fromJson(data);

                if (res.error == undefined) {
                    // If the request did not yield an error, then finish the request and return it.
                    res.IsLeader = (function () {
                        var returnVal = false;
                        angular.forEach(res.Employments, function (value, key) {
                            if (value.IsLeader === true) {
                                returnVal = true;
                            }
                        });
                        return returnVal;
                    })();
                    return res;
                }

                // If there was an error then open modal.
                var modalInstance = $modal.open({
                    templateUrl: '/App/Core/Services/Error/ServiceError.html',
                    controller: "ServiceErrorController",
                    backdrop: "static",
                    resolve: {
                        errorMsg: function () {
                            if (res.error.innererror.message === "Errors in address, see inner exception.") {
                                return "Din arbejds- eller hjemmeadresse er ikke gyldig. Kontakt en administrator for at få den vasket. Indtil da kan du ikke anvende systemet."
                            }
                            return res.error.innererror.message;
                        }
                    }
                });

               
                return res;
            }
        },
        "GetUserAsCurrentUser" : {
            url: "/odata/Person/Service.GetUserAsCurrentUser?Id=:id&$select=Id,IsSubstitute,Initials,RecieveMail,IsAdmin,HasAppPassword,FullName,Mail,DistanceFromHomeToBorder &$expand=PersonalRoutes($expand=Points),LicensePlates,Employments($expand=AlternativeWorkAddress,OrgUnit($select=Id,LongDescription,HasAccessToFourKmRule; $expand=Address); $select=Id,Position,IsLeader,HomeWorkDistance,WorkDistanceOverride, AlternativeWorkAddressId, EmploymentId)",
            method: "GET",
            transformResponse: function (data) {
                var res = angular.fromJson(data);

                if (res.error == undefined) {
                    // If the request did not yield an error, then finish the request and return it.
                    res.IsLeader = (function () {
                        var returnVal = false;
                        angular.forEach(res.Employments, function (value, key) {
                            if (value.IsLeader === true) {
                                returnVal = true;
                            }
                        });
                        return returnVal;
                    })();
                    return res;
                }

                // If there was an error then open modal.
                var modalInstance = $modal.open({
                    templateUrl: '/App/Core/Services/Error/ServiceError.html',
                    controller: "ServiceErrorController",
                    backdrop: "static",
                    resolve: {
                        errorMsg: function () {
                            if (res.error.innererror.message === "Errors in address, see inner exception.") {
                                return "Din arbejds- eller hjemmeadresse er ikke gyldig. Kontakt en administrator for at få den vasket. Indtil da kan du ikke anvende systemet."
                            }
                            return res.error.innererror.message;
                        }
                    }
                });

               
                return res;
            }
        },
        "GetLeaders" : {
            url: "/odata/Employments?$filter=IsLeader eq true&$select=Person &$expand=Person($select=Id,FullName)",
            method: "GET",
            isArray: true,
            transformResponse: function (data) {
                var map = {};
                var result = [];
                var leaders = angular.fromJson(data).value;

                // Remove duplicate values.
                for (var i = 0; i < leaders.length; i++) {
                    if (map[leaders[i].Person.FullName] == undefined) {
                        result.push(leaders[i].Person);
                        map[leaders[i].Person.FullName] = leaders[i].Person;
                    }
                }

                return result;
            }
        },
        "GetChildren": {
            method: "GET",
            isArray: true,
            url: "/odata/Person/Service.Children(Id=:id)",
            transformResponse: function (data) {
                var res = angular.fromJson(data).value;
                angular.forEach(res, function (value, key) {
                    value.FullName = value.FirstName + " " + value.LastName;
                });
                return res;
            }
        }
    });
}]);
var app;
(function (app) {
    var core;
    (function (core) {
        var services;
        (function (services) {
            var Principal = (function () {
                function Principal($q, $rootScope, Person) {
                    this.$q = $q;
                    this.$rootScope = $rootScope;
                    this.Person = Person;
                    this._authenticated = false;
                    this._roles = [];
                    this._accessibleModules = [];
                }
                Principal.prototype.isIdentityResolved = function () {
                    return angular.isDefined(this._identity);
                };
                Principal.prototype.isAuthenticated = function () {
                    return this._authenticated;
                };
                Principal.prototype.accessibleModules = function () {
                    return this._accessibleModules;
                };
                Principal.prototype.isInRole = function (role) {
                    if (!this._authenticated)
                        return false;
                    return this._roles.indexOf(role) !== -1;
                };
                Principal.prototype.isInAnyRole = function (roles) {
                    if (!this._authenticated)
                        return false;
                    for (var i = 0; i < roles.length; i++) {
                        if (this.isInRole(roles[i]))
                            return true;
                    }
                    return false;
                };
                Principal.prototype.authenticated = function (identity) {
                    this._identity = identity;
                    this._authenticated = identity != null;
                };
                Principal.prototype.identity = function (force) {
                    var _this = this;
                    if (force === void 0) { force = false; }
                    var deferred = this.$q.defer();
                    if (force)
                        this._identity = undefined;
                    if (angular.isDefined(this._identity)) {
                        deferred.resolve(this._identity);
                        return deferred.promise;
                    }
                    this.Person.GetCurrentUser(function (data) {
                        _this._identity = data;
                        if (data.IsAdmin) {
                            _this._roles.push('Admin');
                        }
                        if (data.IsLeader || data.IsSubstitute) {
                            _this._roles.push('Approver');
                        }
                        if (data.isLeader) {
                            _this._roles.push('Leader');
                        }
                        // All org units can access the drive module.
                        _this._accessibleModules.push("drive");
                        // Loop to find if the person has an employment with access to vacation
                        for (var i = 0; i < data.Employments.length; i++) {
                            var employment = data.Employments[i];
                            if (employment.OrgUnit.HasAccessToVacation || data.IsAdmin) {
                                _this._accessibleModules.push("vacation");
                                break;
                            }
                        }
                        // The rootscope assignments is all used in (old)code for fallback safety
                        // New code should use Principal.Identity() instead of $rootScope.CurrentUser
                        _this.$rootScope.CurrentUser = data;
                        _this.$rootScope.showAdministration = data.IsAdmin;
                        _this.$rootScope.showApproveReports = data.IsLeader || data.IsSubstitute;
                        _this.$rootScope.UserName = data.FullName;
                        _this.$rootScope.loaded = true;
                        _this._authenticated = true;
                        deferred.resolve(_this._identity);
                    }, function () {
                        _this._identity = null;
                        _this._authenticated = false;
                        _this._roles = [];
                        _this.$rootScope.loaded = false;
                        deferred.resolve(_this._identity);
                    });
                    return deferred.promise;
                };
                Principal.$inject = [
                    "$q",
                    "$rootScope",
                    "Person"
                ];
                return Principal;
            }());
            services.Principal = Principal;
            angular.module("app.core").service("Principal", Principal);
        })(services = core.services || (core.services = {}));
    })(core = app.core || (app.core = {}));
})(app || (app = {}));
//# sourceMappingURL=Principal.js.map
angular.module("app.core").service('Substitute', ["$resource", function ($resource) {
    return $resource("/odata/Substitutes(:id)?:query", { id: "@id", query: "@query" }, {
        "get": {
            method: "GET",
            isArray: false,
            headers: { 'Accept': 'application/json;odata=fullmetadata' },
            url: "odata/Substitutes(:id)?$expand=OrgUnit,Sub,Person&:query",
            data: ''
        },
        "patch": { method: "PATCH", isArray: false },
        "post": { method: "POST", isArray: false },
        'remove': {method:'DELETE'},
        'delete': {method:'DELETE'}
    });
}]);
angular.module("app.core").controller("ServiceErrorController", [
   "$scope", "$modalInstance", "errorMsg",
   function ($scope, $modalInstance, errorMsg) {

       $scope.errorMsg = errorMsg;

       $scope.close = function () {
           $modalInstance.close();
       }

   }
]);
angular.module('app.drive', ["app.core", "kendo.directives", "ui.router", "ui.bootstrap", "ui.bootstrap.tooltip", "ngResource", "template/modal/window.html", "template/modal/window.html", "template/modal/backdrop.html", "template/tabs/tab.html", "template/tabs/tabset.html", "angularMoment", "template/popover/popover.html", "kendo-ie-fix", 'angular-loading-bar'])
    .run(['$rootScope','HelpText', function($rootScope, HelpText) {
       
    }]);
angular.module("app.drive").config(["$stateProvider", function ($stateProvider) {

    $stateProvider
        .state("drive.driving", {
            url: "/driving",
            templateUrl: "/App/Drive/Driving/DrivingView.html",
            controller: "DrivingController",
            resolve: {
                adminEditCurrentUser : function() {return 0;},
                ReportId: function () { return -1; },
                $modalInstance: function () { return -1; }
            }
        })
        .state("drive.myreports", {
            url: "/myreports",
            templateUrl: "/App/Drive/MyReports/MyReportsView.html"
        })
        .state("drive.approvereports", {
            url: "/approvereports",
            templateUrl: "/App/Drive/ApproveReports/ApproveReportsView.html",
            data: {
                roles: ['Approver']
            }
        })
        .state("drive.settings", {
            url: "/settings",
            templateUrl: "/App/Drive/Settings/SettingsView.html",
            controller: "SettingsController"
        })
        .state("drive.admin", {
            url: "/admin",
            templateUrl: "/App/Drive/Admin/AdminView.html",
            controller: "AdminMenuController",
            data: {
                roles: ['Admin']
            }
        });
}]);
angular.module("app.drive").controller("AdminMenuController", [
   "$scope", "Person", "PersonalAddress", "HelpText", "$rootScope", function ($scope, Person, PersonalAddress, HelpText, $rootScope) {


       $scope.emailClicked = function () {
           $scope.$broadcast('emailClicked');
       }

       $scope.ratesClicked = function () {
           $scope.$broadcast('ratesClicked');
       }

       $scope.accountClicked = function () {
           $scope.$broadcast('accountClicked');
       }

       $scope.orgSettingsClicked = function () {
           $scope.$broadcast('orgSettingsClicked');
       }

       $scope.adminClicked = function () {
           $scope.$broadcast('administrationClicked');
       }

       $scope.reportsClicked = function () {
           $scope.$broadcast('reportsClicked');
       }

       $scope.laundryClicked = function () {
           $scope.$broadcast('addressLaundryClicked');
       }




   }
]);
angular.module("app.drive").controller("AccountController", [
    "$scope", "$modal", "BankAccount", "NotificationService", "$rootScope",
    function ($scope, $modal, BankAccount, NotificationService, $rootScope) {


        $scope.AccountHelpText = $rootScope.HelpTexts.AccountHelpText.text;

        $scope.$on('accountClicked', function (event, mass) {
            $scope.container.accountGrid.dataSource.read();
        });

        $scope.container = {};

        $scope.maskOptions = {
            //Omkostningssted
            mask: "0000000000"
        }

        $scope.PSPMaskOptions = {
            //PSP
            mask: "LL-0000000000-00000"
        }

        $scope.accountTypeChanged = function () {
            /// <summary>
            /// Clears the accountnumber field when account type is changed
            /// </summary>
            $scope.newAccountAccountNumber = "";
        }


        /// <summary>
        /// Loads BankAccounts from BackEnd to the Kendo Grid datasource
        /// </summary>
        $scope.accounts = {
            autoBind: false,
            dataSource: {
                type: "odata-v4",
                transport: {
                    read: {
                        beforeSend: function (req) {
                            req.setRequestHeader('Accept', 'application/json;odata=fullmetadata');
                        },
                        url: "/odata/BankAccounts",
                        dataType: "json",
                        cache: false
                    }
                },
                pageSize: 20,
                serverPaging: false,
                serverSorting: true,
            },
            sortable: true,
            pageable: {
                messages: {
                    display: "{0} - {1} af {2} konti", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                    empty: "Ingen konti at vise",
                    page: "Side",
                    of: "af {0}", //{0} is total amount of pages
                    itemsPerPage: "konti pr. side",
                    first: "Gå til første side",
                    previous: "Gå til forrige side",
                    next: "Gå til næste side",
                    last: "Gå til sidste side",
                    refresh: "Genopfrisk"
                },
                pageSizes: [5, 10, 20, 30, 40, 50, 100, 150, 200]
            },
            scrollable: false,
            columns: [
                {
                    field: "Type",
                    title: "Type",
                    template: function (data) {
                        //if (data.Type == "PSPElement") {
                        //    return "PSP-element";
                        //}
                        //return data.Type;
                        return "Kontonummer";
                    }
                },
                {
                    field: "Number",
                    title: "Kontonummer"
                },
                {
                    field: "Description",
                    title: "Beskrivelse"
                },
                {
                    field: "Id",
                    template: "<a ng-click=deleteAccountClick(${Id})>Slet</a>",
                    title: "Muligheder"
                }
            ]
        };

        $scope.updateAccountGrid = function () {
            /// <summary>
            /// Refreshes the BankAccount grid
            /// </summary>
            $scope.container.accountGrid.dataSource.read();
        }


        $scope.addNewAccountClick = function () {
            /// <summary>
            /// Post new BankAccount to Backend
            /// </summary>
            $scope.accountNumberErrorMessage = "";
            $scope.accountDescriptionErrorMessage = "";
            var error = false;
            if ($scope.container.newAccountAccountNumber == "" || $scope.container.newAccountAccountNumber == undefined || $scope.container.newAccountAccountNumber.indexOf("_") > -1) {
                $scope.accountNumberErrorMessage = "* Du skal skrive et gyldigt kontonummer.";
                error = true;
            }
            if ($scope.container.newAccountDescription == "" || $scope.container.newAccountDescription == undefined) {
                $scope.accountDescriptionErrorMessage = "* Du skal skrive en beskrivelse.";
                error = true;
            }

            if (!error) {
                BankAccount.post({ "Description": $scope.container.newAccountDescription, "Number": $scope.container.newAccountAccountNumber, "Type": $scope.container.newAccountType }, function () {
                    $scope.updateAccountGrid();
                    $scope.container.newAccountDescription = "";
                    $scope.container.newAccountRegNumber = "";
                    $scope.container.newAccountAccountNumber = "";
                    NotificationService.AutoFadeNotification("success", "", "Ny konto oprettet!");
                });
            }

        }

        $scope.deleteAccountClick = function (id) {
            /// <summary>
            /// Sends DELETE request to backend
            /// </summary>
            /// <param name="id">Identifies BankAccount to be deleted</param>
            var modalInstance = $modal.open({
                templateUrl: '/App/Admin/Account/ConfirmDeleteAccountTemplate.html',
                controller: 'DeleteAccountController',
                backdrop: "static",
                resolve: {
                    itemId: function () {
                        return -1;
                    }
                }
            });

            modalInstance.result.then(function () {
                BankAccount.delete({ id: id }, function () {
                    $scope.updateAccountGrid();
                });
            });
        }

    }
]);

angular.module("app.drive").controller("DeleteAccountController", [
    "$scope", "$modalInstance", "itemId", "NotificationService",
    function ($scope, $modalInstance, itemId, NotificationService) {

        $scope.confirmDelete = function () {
            /// <summary>
            /// Confirms deletion of BankAccount
            /// </summary>
            $modalInstance.close($scope.itemId);
            NotificationService.AutoFadeNotification("success", "", "Kontoen blev slettet.");
        }

        $scope.cancel = function () {
            /// <summary>
            /// Cancels deletion of BankAccount
            /// </summary>
            $modalInstance.dismiss('cancel');
            NotificationService.AutoFadeNotification("warning", "", "Sletning af kontoen blev annulleret.");
        }
    }
]);
angular.module("app.drive").controller("AddNewAddressController", [
    "$scope", "$modalInstance", "NotificationService", "StandardAddress", "AddressFormatter", "SmartAdresseSource", "$modal",
    function ($scope, $modalInstance, NotificationService, StandardAddress, AddressFormatter, SmartAdresseSource, $modal) {

        $scope.SmartAddress = SmartAdresseSource;

        $scope.confirmSave = function () {
            /// <summary>
            /// Confirms creation of new Standard Address
            /// </summary>
            var result = {};
            result.address = $scope.Address.Name;
            result.description = $scope.description;
            $modalInstance.close(result);
            NotificationService.AutoFadeNotification("success", "", "Adressen blev oprettet.");
        }

        $scope.cancel = function () {
            /// <summary>
            /// Cancels creation of new Standard Address
            /// </summary>
            $modalInstance.dismiss('cancel');
            NotificationService.AutoFadeNotification("warning", "", "Oprettelse af adressen blev annulleret.");
        }


        $scope.showConfirmDiscardChangesModal = function () {
            /// <summary>
            /// Opens confirm discard changes modal.
            /// </summary>
            /// <param name="id"></param>
            var modalInstance = $modal.open({
                templateUrl: '/App/Admin/Address/ConfirmDiscardChangesTemplate.html',
                controller: 'ConfirmDiscardChangesController',
                backdrop: "static",
            });

            modalInstance.result.then(function () {
                $scope.cancel();
            });

        }

        $scope.cancelClicked = function () {
            if ($scope.description == undefined) {
                if ($scope.Address == undefined || $scope.Address.Name == undefined) {
                    $scope.cancel();
                } else {
                    $scope.showConfirmDiscardChangesModal();
                }
            } else {
                $scope.showConfirmDiscardChangesModal();
            }
        }
    }
]);
angular.module("app.drive").controller("DeleteAddressController", [
    "$scope", "$modalInstance", "itemId", "NotificationService", "StandardAddress",
    function ($scope, $modalInstance, itemId, NotificationService, StandardAddress) {

        StandardAddress.get({ id: itemId }).$promise.then(function (res) {
            var address = res.value[0];
            $scope.addressString = address.StreetName + " " + address.StreetNumber + ", " + address.ZipCode + " " + address.Town + ".";
        });

      
        $scope.confirmDelete = function () {
            /// <summary>
            /// Confirms deletion of Standard Address
            /// </summary>
            $modalInstance.close($scope.itemId);
            NotificationService.AutoFadeNotification("success", "", "Adressen blev slettet.");
        }

        $scope.cancel = function () {
            /// <summary>
            /// Cancels deletion of Standard Address
            /// </summary>
            $modalInstance.dismiss('cancel');
            NotificationService.AutoFadeNotification("warning", "", "Sletning af adressen blev annulleret.");
        }
    }
]);
angular.module("app.drive").controller("EditAddressController", [
    "$scope", "$modalInstance", "itemId", "NotificationService", "StandardAddress", "SmartAdresseSource", "$modal",
    function ($scope, $modalInstance, itemId, NotificationService, StandardAddress, SmartAdresseSource, $modal) {


        $scope.SmartAddress = SmartAdresseSource;

        StandardAddress.get({ id: itemId }).$promise.then(function (res) {
            var address = res.value[0];
            $scope.address = address.StreetName + " " + address.StreetNumber + ", " + address.ZipCode + " " + address.Town;
            $scope.description = address.Description;
            $scope.oldAddress = $scope.address;
            $scope.oldDescription = $scope.description;
        });



        $scope.confirmEdit = function () {
            /// <summary>
            /// Confirms edit of Standard Address
            /// </summary>
            var result = {};
            result.address = $scope.address;
            result.description = $scope.description;
            $modalInstance.close(result);
            NotificationService.AutoFadeNotification("success", "", "Adressen blev redigeret.");
        }

        $scope.cancel = function () {
            /// <summary>
            /// Cancels edit of Standard Address
            /// </summary>
            $modalInstance.dismiss('cancel');
            NotificationService.AutoFadeNotification("warning", "", "Redigering af adressen blev annulleret.");
        }

        $scope.showConfirmDiscardChangesModal = function () {
            /// <summary>
            /// Opens confirm discard changes modal.
            /// </summary>
            /// <param name="id"></param>
            var modalInstance = $modal.open({
                templateUrl: '/App/Admin/Address/ConfirmDiscardChangesTemplate.html',
                controller: 'ConfirmDiscardChangesController',
                backdrop: "static",
            });

            modalInstance.result.then(function () {
                $scope.cancel();
            });

        }

        $scope.cancelClicked = function () {
            if ($scope.address != $scope.oldAddress || $scope.description != $scope.oldDescription) {
                $scope.showConfirmDiscardChangesModal();
            } else {
                $scope.cancel();
            }
        }
    }
]);
angular.module("app.drive").controller("StandardAddressController", [
   "$scope", "$modal", "StandardAddress", "AddressFormatter", function ($scope, $modal, StandardAddress, AddressFormatter) {

        $scope.gridContainer = {};

        $scope.loadAddresses = function () {
            /// <summary>
            /// Loads existing standard addresses from backend.
            /// </summary>
           $scope.addresses = {
               dataSource: {
                   type: "odata-v4",
                   transport: {
                       read: {
                           beforeSend: function (req) {
                               req.setRequestHeader('Accept', 'application/json;odata=fullmetadata');
                           },
                           url: "/odata/Addresses/Service.GetStandard",
                           dataType: "json",
                           cache: false
                       }
                   },
                   pageSize: 20,
                   serverPaging: false,
                   serverSorting: true,
               },
               sortable: true,
               pageable: {
                   messages: {
                       display: "{0} - {1} af {2} adresser", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                       empty: "Ingen adresser at vise",
                       page: "Side",
                       of: "af {0}", //{0} is total amount of pages
                       itemsPerPage: "adresser pr. side",
                       first: "Gå til første side",
                       previous: "Gå til forrige side",
                       next: "Gå til næste side",
                       last: "Gå til sidste side",
                       refresh: "Genopfrisk"
                   },
                   pageSizes: [5, 10, 20, 30, 40, 50, 100, 150, 200]
               },
               scrollable: false,
               columns: [
                   {
                       field: "StreetName",
                       title: "Vejnavn"
                   },
                   {
                       field: "StreetNumber",
                       title: "Husnummer"
                   },
                   {
                       field: "ZipCode",
                       title: "Postnummer"
                   },
                   {
                       field: "Town",
                       title: "By"

                   },
                   {
                       field: "Description",
                       title: "Beskrivelse"
                   },
                   {
                       field: "Id",
                       template: "<a ng-click=editClick(${Id})>Redigér</a> | <a ng-click=deleteClick(${Id})>Slet</a>",
                       title: "Muligheder",
                   }
               ]
           };
       }

        $scope.updateAddressGrid = function () {
            /// <summary>
            /// Refreshes standard address grid.
            /// </summary>
           $scope.gridContainer.addressGrid.dataSource.read();
       }

        $scope.editClick = function (id) {
            /// <summary>
            /// Opens standard address edit modal.
            /// </summary>
            /// <param name="id">Id of address to be edited.</param>
           var modalInstance = $modal.open({
               templateUrl: '/App/Admin/Address/EditAddressTemplate.html',
               controller: 'EditAddressController',
               backdrop: "static",
               resolve: {
                   itemId: function () {
                       return id;
                   }
               }
           });

           modalInstance.result.then(function (res) {
               var result = AddressFormatter.fn(res.address);
               StandardAddress.patch({ id: id }, {
                   "StreetName": result.StreetName,
                   "StreetNumber": result.StreetNumber,
                   "ZipCode": result.ZipCode,
                   "Town": result.Town,
                   "Description": res.description
               }, function () {
                   $scope.updateAddressGrid();
               });
           });
       }

        $scope.deleteClick = function (id) {
            /// <summary>
            /// Opens delete StandardAddress modal
            /// </summary>
            /// <param name="id">Id of address to be deleted.</param>
           var modalInstance = $modal.open({
               templateUrl: '/App/Admin/Address/ConfirmDeleteAddressTemplate.html',
               controller: 'DeleteAddressController',
               backdrop: "static",
               resolve: {
                   itemId: function () {
                       return id;
                   }
               }
           });

           modalInstance.result.then(function () {
               StandardAddress.delete({ id: id }, function () {
                   $scope.updateAddressGrid();
               });
           });
       }

        $scope.addNewClick = function () {
            /// <summary>
            /// Opens add new Standard Address modal
            /// </summary>
           var modalInstance = $modal.open({
               templateUrl: '/App/Admin/Address/AddNewAddressTemplate.html',
               controller: 'AddNewAddressController',
               backdrop: "static",
           });

           modalInstance.result.then(function (res) {
               var result = AddressFormatter.fn(res.address);
               StandardAddress.post({
                   "StreetName": result.StreetName,
                   "StreetNumber": result.StreetNumber,
                   "ZipCode": result.ZipCode,
                   "Town": result.Town,
                   "Description": res.description,
                   "Latitude": "0",
                   "Longitude": "0"
               }, function () {
                   $scope.updateAddressGrid();
               });
           });
       }

       $scope.loadAddresses();
   }
]);
angular.module("app.drive").controller("AddressLaundryController", [
   "$scope", "SmartAdresseSource", "$timeout", "Address", "AddressFormatter", "NotificationService", function ($scope, SmartAdresseSource, $timeout, Address, AddressFormatter, NotificationService) {

       $scope.container = {};
       $scope.SmartAddress = SmartAdresseSource;



       $scope.autoCompleteOptions = {
           filter: "contains"
       };

       $scope.$on('addressLaundryClicked', function (event, mass) {
           Address.GetAutoCompleteDataForCachedAddress().$promise.then(function (res) {
               $scope.autoCompleteDataSource = res.value;
           });
           $scope.container.grid.dataSource.read();
       });

       $scope.addressLocalCopy = [];

        $scope.dirtyAddresses = {
            autoBind: false,
            dataSource: {
                type: "odata-v4",
                transport: {
                    read: {
                        beforeSend: function(req) {
                            req.setRequestHeader('Accept', 'application/json;odata=fullmetadata');
                        },
                        url: "/odata/Addresses/Service.GetCachedAddresses",
                        dataType: "json",
                        cache: false
                    }
                },
                pageSize: 20,
                serverPaging: true,
                serverSorting: true,
                serverFiltering: true,
                scrollable: false,
            },
            sortable: true,
            pageable: {
                messages: {
                    display: "{0} - {1} af {2} addresser", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                    empty: "Ingen addresser at vise",
                    page: "Side",
                    of: "af {0}", //{0} is total amount of pages
                    itemsPerPage: "addresser pr. side",
                    first: "Gå til første side",
                    previous: "Gå til forrige side",
                    next: "Gå til næste side",
                    last: "Gå til sidste side",
                    refresh: "Genopfrisk"
                },
                pageSizes: [5, 10, 20, 30, 40, 50, 100, 150, 200]
            },
            scrollable: false,
            columns: [
                {
                    field: "Description",
                    title: "Beskrivelse",
                },
                {
                    field: "DirtyString",
                    title: "Beskidt adresse"
                },
                {
                    title: "Vasket adresse",
                    template: function(data) {
                        if (!data.IsDirty) {
                            return data.StreetName + " " + data.StreetNumber + ", " + data.ZipCode + " " + data.Town;
                        }
                        return "Endnu ikke vasket.";
                    }
                },
                {
                    field: "IsDirty",
                    title: "Vasket",
                    template: function(data) {
                        if (!data.IsDirty) {
                            return '<i class="fa fa-check"></i>';
                        }
                        return "";
                    }
                },
                {
                    title: "Ny adresse",
                    width: 300,
                    template: function(data) {
                        return "<input type='text' ng-model='addressLocalCopy[" + data.Id + "]' kendo-auto-complete k-data-text-field=\"'tekst'\" k-data-value-field=\"'tekst'\" k-data-source='SmartAddress' class='form-control fill-width'/>";
                    }
                },
                {
                    title: "Muligheder",
                    template: function(data) {
                        return "<a class='pull-right margin-right-10' ng-click=saveClicked('" + data.Id + "')>Gem</a>"
                    }
                }
            ]
        };

       $scope.saveClicked = function (id) {
           /// <summary>
           /// Attempts to clean address identified by id
           /// </summary>
           /// <param name="id"></param>
           var addr = AddressFormatter.fn($scope.addressLocalCopy[id]);
           if (addr == undefined) {
               NotificationService.AutoFadeNotification("warning", "", "Adressen kunne ikke vaskes.");
               return;
           }
           Address.AttemptCleanCachedAddress({ StreetName: addr.StreetName, StreetNumber: addr.StreetNumber, ZipCode: addr.ZipCode, Town: addr.Town, Id: id }, function () {
               NotificationService.AutoFadeNotification("success", "", "Adressen er vasket.");
               $scope.container.grid.dataSource.read();
           }, function () {
               NotificationService.AutoFadeNotification("warning", "", "Adressen kunne ikke vaskes.");
           });
       }

       $scope.includeCleanChanged = function () {
           /// <summary>
           /// Updates datasource to either show or hide clean addresses.
           /// </summary>
           // Timeout to allow changes to be written to model.
           $timeout(function () {
               $scope.container.grid.dataSource.transport.options.read.url = "/odata/Addresses/Service.GetCachedAddresses?includeCleanAddresses=" + $scope.container.includeClean;
               $scope.container.grid.dataSource.read();
           });
       }

       $scope.descriptionTextChanged = function () {
           /// <summary>
           /// Updates grid filter according to description filter.
           /// </summary>
           $timeout(function () {
               var oldFilters = $scope.container.grid.dataSource.filter();
               var newFilters = [];


               if (oldFilters == undefined) {
                   // If no filters exist, just add the filters.
                   if ($scope.container.descriptionFilter != "") {
                       newFilters.push({ field: "Description", operator: "startswith", value: $scope.container.descriptionFilter });
                   }
               } else {
                   // If filters already exist then get the old filters, that arent ShortDescription.
                   // Then add the new drivedate filters to these.
                   angular.forEach(oldFilters.filters, function (value, key) {
                       if (value.field != "Description") {
                           newFilters.push(value);
                       }
                   });
                   if ($scope.container.descriptionFilter != "") {
                       newFilters.push({ field: "Description", operator: "startswith", value: $scope.container.descriptionFilter });
                   }

               }
               $scope.container.grid.dataSource.filter(newFilters);
           });
       }

       $scope.dirtyStringTextChanged = function () {
           /// <summary>
           /// Updates grid filter according to dirtyString filter
           /// </summary>
           $timeout(function () {
               var oldFilters = $scope.container.grid.dataSource.filter();
               var newFilters = [];


               if (oldFilters == undefined) {
                   // If no filters exist, just add the filters.
                   if ($scope.container.dirtyStringFilter != "") {
                       newFilters.push({ field: "DirtyString", operator: "startswith", value: $scope.container.dirtyStringFilter });
                   }
               } else {
                   // If filters already exist then get the old filters, that arent ShortDescription.
                   // Then add the new drivedate filters to these.
                   angular.forEach(oldFilters.filters, function (value, key) {
                       if (value.field != "DirtyString") {
                           newFilters.push(value);
                       }
                   });
                   if ($scope.container.dirtyStringFilter != "") {
                       newFilters.push({ field: "DirtyString", operator: "startswith", value: $scope.container.dirtyStringFilter });
                   }

               }
               $scope.container.grid.dataSource.filter(newFilters);
           });
       }

       $scope.clearClicked = function () {
           /// <summary>
           /// Clears input fields.
           /// </summary>
           $scope.container.dirtyStringFilter = "";
           $scope.container.descriptionFilter = "";
           $scope.container.grid.dataSource.filter([]);
       }

   }
]);
angular.module("app.drive").controller("AdministrationController", [
   "$scope", "Person", "$modal", "NotificationService", "File", "Autocomplete",
   function ($scope, Person, $modal, NotificationService, File, Autocomplete) {

       $scope.autoCompleteOptions = {
           filter: "contains"
       };

       $scope.nonAdmins = Autocomplete.nonAdmins();

       // Called from AdminMenuController
       // Prevents loading data before it is needed.
       $scope.$on('administrationClicked', function (event, mass) {
           $scope.gridContainer.grid.dataSource.read();
       });

       $scope.gridContainer = {};
       $scope.person = {};

       /// <summary>
       /// Loads existing admins from backend.
       /// </summary>
       $scope.admins = {
           autoBind: false,
           dataSource: {
               type: "odata-v4",
               transport: {
                   read: {
                       beforeSend: function(req) {
                           req.setRequestHeader('Accept', 'application/json;odata=fullmetadata');
                       },
                       url: "/odata/Person?$filter=IsAdmin",
                       dataType: "json",
                       cache: false
                   }
               },
               pageSize: 20,
               serverPaging: true,
               serverSorting: true
           },
           sortable: true,
           pageable: {
               messages: {
                   display: "{0} - {1} af {2} administratorer", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                   empty: "Ingen administratorer at vise",
                   page: "Side",
                   of: "af {0}", //{0} is total amount of pages
                   itemsPerPage: "administratorer pr. side",
                   first: "Gå til første side",
                   previous: "Gå til forrige side",
                   next: "Gå til næste side",
                   last: "Gå til sidste side",
                   refresh: "Genopfrisk"
               },
               pageSizes: [5, 10, 20, 30, 40, 50, 100, 150, 200]
           },
           scrollable: false,
           columns: [
               {
                   field: "FullName",
                   title: "Medarbejder"
               },
               {
                   field: "Mail",
                   title: "Email"
               },
               {
                   title: "Muligheder",
                   template: function(data) {
                       return "<a ng-click='removeAdmin(" + data.Id + ",\"" + data.FullName + "\")'>Slet</a>";
                   }
               }
           ]
       };

       $scope.removeAdmin = function (Id, FullName) {
           /// <summary>
           /// Opens remove admin modal
           /// </summary>
           /// <param name="Id">Id of person</param>
           /// <param name="FullName">FullName of person</param>
           var modalInstance = $modal.open({
               templateUrl: 'App/Admin/Administration/Modal/RemoveAdminModalTemplate.html',
               controller: 'RemoveAdminModalController',
               backdrop: 'static',
               size: 'lg',
               resolve: {
                   Id: function () {
                       return Id;
                   },
                   FullName: function () {
                       return FullName;
                   }
               }
           });

           modalInstance.result.then(function (resPerson) {
               Person.patch({ id: resPerson.Id }, { "IsAdmin": false }, function () {
                   NotificationService.AutoFadeNotification("success", "", resPerson.FullName + " blev slettet som administrator.");
                   $scope.gridContainer.grid.dataSource.read();
               }, function () {
                   NotificationService.AutoFadeNotification("danger", "", resPerson.FullName + " blev ikke slettet som administrator.");
               });
           });
       }

       $scope.addAdminClicked = function () {
           /// <summary>
           /// Opens add admin modal
           /// </summary>
           if ($scope.person.chosenAdmin == undefined || $scope.person.chosenAdmin[0] == undefined) {
               return;
           }

           var modalInstance = $modal.open({
               templateUrl: 'App/Admin/Administration/Modal/AddAdminModalTemplate.html',
               controller: 'AddAdminModalController',
               backdrop: 'static',
               size: 'lg',
               resolve: {
                   chosenPerson: function () {
                       return $scope.person.chosenAdmin[0];
                   }
               }
           });

           modalInstance.result.then(function (person) {
               Person.patch({ id: person.Id }, { "IsAdmin": true }, function () {
                   NotificationService.AutoFadeNotification("success", "", person.FullName + " blev gjort til administrator.");
                   $scope.gridContainer.grid.dataSource.read();
                   $scope.person.chosenAdmin = "";
               }, function () {
                   NotificationService.AutoFadeNotification("danger", "", person.FullName + " blev ikke gjort til administrator.");
               });
           });
       }

       $scope.generateKMDFileClicked = function () {
           /// <summary>
           /// Opens confirm generate kmd file modal
           /// </summary>
           var modalInstance = $modal.open({
               templateUrl: 'App/Admin/Administration/Modal/ConfirmGenerateFileModalTemplate.html',
               controller: 'GenerateFileModalController',
               backdrop: 'static',
               size: 'lg',
           });

           modalInstance.result.then(function (person) {
               File.generateKMDFile(function () {
                   NotificationService.AutoFadeNotification("success", "", "Fil til KMD blev genereret.");
               }, function () {
                   NotificationService.AutoFadeNotification("danger", "", "Fil til KMD blev ikke genereret.");
               });
           });
       }
   }
]);
angular.module("app.drive").controller("AddAdminModalController", [
   "$scope", "chosenPerson", "$modalInstance",
   function ($scope, chosenPerson, $modalInstance) {

   $scope.name = chosenPerson.FullName;

       $scope.confirmAddAdmin = function () {
           /// <summary>
           /// Confirm add new admin
           /// </summary>
           $modalInstance.close(chosenPerson);
       }

       $scope.cancelAddAdmin = function () {
           /// <summary>
           /// Cancel add new admin
           /// </summary>
           $modalInstance.dismiss('cancel');
       }

   }
]);
angular.module("app.drive").controller("GenerateFileModalController", [
   "$scope", "$modalInstance", function ($scope, $modalInstance) {

 
       $scope.confirmGenerateFile = function () {
           /// <summary>
           /// Confirm Generate KMD file
           /// </summary>
           $modalInstance.close();
       }

       $scope.cancelGenerateFile = function () {
           /// <summary>
           /// Cancel generate KMD file.
           /// </summary>
           $modalInstance.dismiss('cancel');
       }

   }
]);
angular.module("app.drive").controller("RemoveAdminModalController", [
   "$scope", "Id", "FullName", "$modalInstance",
   function ($scope, Id, FullName, $modalInstance) {

       $scope.name = FullName;

        var resPerson = { Id: Id, FullName: FullName };

        $scope.confirmRemoveAdmin = function () {
            /// <summary>
            /// Confirm remove admin
            /// </summary>
           $modalInstance.close(resPerson);
       }

        $scope.cancelRemoveAdmin = function () {
            /// <summary>
            /// Cancel remove admin
            /// </summary>
           $modalInstance.dismiss('cancel');
       }

   }
]);
angular.module("app.drive").controller("OrgUnitController", [
    "$scope", "OrgUnit", "NotificationService", "$rootScope", "Person", "Autocomplete", function ($scope, OrgUnit, NotificationService, $rootScope, Person, Autocomplete) {
        $scope.gridContainer = {};

        $scope.orgUnits = Autocomplete.orgUnits();
        $scope.orgUnit = {};
        $scope.selectedKmRule = -1;

        $scope.updateSourceUrl = function() {
            var url = "/odata/OrgUnits";

            if (Object.keys($scope.orgUnit).length !== 0) {
                url += "?$filter=contains(LongDescription," + "'" + encodeURIComponent($scope.orgUnit.chosenUnit + "')");
                if ($scope.selectedKmRule !== -1)
                    url += " and HasAccessToFourKmRule eq " + ($scope.selectedKmRule === 0 ? "false" : "true");
            } else {
                if ($scope.selectedKmRule !== -1)
                    url += "?$filter=HasAccessToFourKmRule eq " + ($scope.selectedKmRule === 0 ? "false" : "true");
            }


            $scope.gridContainer.grid.dataSource.transport.options.read.url = url;
            $scope.gridContainer.grid.dataSource.read();
        }

        $scope.autoCompleteOptions = {
            filter: "contains",
            select: function (e) {
                $scope.orgUnit.chosenId = this.dataItem(e.item.index()).Id;
            }
        }



        $scope.kmRuleOptions = {
            dataSource: {
                data: [{
                    value: -1,
                    text: 'Alle'
                }, {
                    value: 1,
                    text: 'Bruger 4 km-reglen'
                }, {
                    value: 0,
                    text: 'Bruger ikke 4 km-reglen'
                }]
            },
            dataTextField: 'text',
            dataValueField: 'value',
            select: function(e) {
                var value = this.dataItem(e.item).value;
                $scope.selectedKmRule = value;

                $scope.updateSourceUrl();
            },
            clear: function() {
                this.dataSource.read();
            }
        }

        $scope.$on('orgSettingsClicked', function (event, mass) {
            $scope.gridContainer.grid.dataSource.read();
        });

        $scope.OrgUnits = {
            autoBind: false,
            dataSource: {
                type: "odata-v4",
                transport: {
                    read: {
                        beforeSend: function(req) {
                            req.setRequestHeader('Accept', 'application/json;odata=fullmetadata');
                        },
                        url: "/odata/OrgUnits",
                        dataType: "json",
                        cache: false
                    }
                },
                schema: {
                    model: {
                        fields: {
                            OrgId: {
                                editable: false
                            },
                            ShortDescription: {
                                editable: false
                            },
                            LongDescription: {
                                editable: false
                            },
                            HasAccessToFourKmRule: {
                                editable: false
                            },
                            DefaultKilometerAllowance: {
                                type: "string"
                            }
                        }
                    }
                },
                pageSize: 20,
                serverPaging: true,
                serverFiltering: true
            },
            sortable: true,
            pageable: {
                messages: {
                    display: "{0} - {1} af {2} organisationsenheder", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                    empty: "Ingen organisationsenheder at vise",
                    page: "Side",
                    of: "af {0}", //{0} is total amount of pages
                    itemsPerPage: "Organisationsenheder pr. side",
                    first: "Gå til første side",
                    previous: "Gå til forrige side",
                    next: "Gå til næste side",
                    last: "Gå til sidste side",
                    refresh: "Genopfrisk"
                },
                pageSizes: [5, 10, 20, 30, 40, 50, 100, 150, 200]
            },
            dataBound: function() {
                this.expandRow(this.tbody.find("tr.k-master-row").first());
            },
            editable: true,
            columns: [
                {
                    field: "OrgId",
                    title: "Organisations ID"
                },
                {
                    field: "ShortDescription",
                    title: "Kort beskrivelse"
                },
                {
                    field: "LongDescription",
                    title: "Lang beskrivelse"
                },
                {
                    field: "HasAccessToFourKmRule",
                    title: "Kan benytte 4 km-regel",
                    template: function(data) {
                        if (data.HasAccessToFourKmRule) {
                            return "<input type='checkbox' ng-click='rowChecked(" + data.Id + ", false)' checked></input>";
                        } else {
                            return "<input type='checkbox' ng-click='rowChecked(" + data.Id + ", true)'></input>";
                        }
                    }
                },
                {
                    field: "DefaultKilometerAllowance",
                    title: "Standard kilometeropgørelse",
                    editor: kilometerAllowanceDropDownEditor,
                    template: function(data) {
                        if (data.DefaultKilometerAllowance === "Calculated") {
                            return "Beregnet";
                        } else if (data.DefaultKilometerAllowance === "Read") {
                            return "Aflæst";
                        } else if (data.DefaultKilometerAllowance === "CalculatedWithoutExtraDistance") {
                            return "Beregnet uden merkørsel";
                        } else {
                            return "Fejl";
                        }
                    }
                }
            ]
        };

        function kilometerAllowanceDropDownEditor(container, options) {

            var orgId = options.model.Id;

            var allowanceData = [
                { name: "Beregnet", value: "Calculated" },
                { name: "Aflæst", value: "Read" },
                { name: "Beregnet uden merkørsel", value: "CalculatedWithoutExtraDistance" }
            ];

            var dataSource = new kendo.data.DataSource({
                data: allowanceData
            });

            $('<input required data-text-field="name" data-value-field="value" data-bind="value:' + options.field + '"/>')
                .appendTo(container)
                .kendoDropDownList({
                    autoBind: false,
                    dataSource: dataSource,
                    change: function (e) {

                        OrgUnit.patch({ id: orgId }, { "DefaultKilometerAllowance": allowanceData[e.sender.selectedIndex].value }).$promise.then(function () {
                            NotificationService.AutoFadeNotification("success", "", "Opdaterede organisationen");

                            //// Reload CurrentUser to update default kilometerallowance in DrivingController
                            Person.GetCurrentUser().$promise.then(function (data) {
                                $rootScope.CurrentUser = data;
                            });
                        });


                    },
                });

        }

        $scope.rowChecked = function (id, newValue) {
            /// <summary>
            /// Is called when the user checks an orgunit in the grid.
            /// Patches HasAccessToFourKmRule on the backend.
            /// </summary>
            /// <param name="id"></param>

            OrgUnit.patch({ id: id }, { "HasAccessToFourKmRule": newValue }).$promise.then(function () {
                if (newValue) {
                    NotificationService.AutoFadeNotification("success", "", "Adgang til 4 km-regel tilføjet.");
                } else {
                    NotificationService.AutoFadeNotification("success", "", "Adgang til 4 km-regel fjernet.");
                }


                //// Reload CurrentUser to update FourKmRule in DrivingController
                Person.GetCurrentUser().$promise.then(function (data) {
                    $rootScope.CurrentUser = data;
                });
            });
        }

        $scope.orgUnitChanged = function (item) {
            /// <summary>
            /// Filters grid content
            /// </summary>
            /// <param name="item"></param>
            $scope.updateSourceUrl();
        }

        $scope.clearClicked = function () {
            /// <summary>
            /// Clears filters.
            /// </summary>
            $scope.selectedKmRule = -1;
            $scope.gridContainer.kmRule.select(0);
            $scope.orgUnit.chosenUnit = "";
            $scope.gridContainer.grid.dataSource.transport.options.read.url = "/odata/OrgUnits";
            $scope.gridContainer.grid.dataSource.read();
        }

    }
]);

angular.module("app.drive").controller("RateController", [
    "$scope", "$modal", "Rate", "NotificationService", "RateType",
    function ($scope, $modal, Rate, NotificationService, RateType) {

        $scope.container = {};

        $scope.$on('ratesClicked', function (event, mass) {
            $scope.container.rateGrid.dataSource.read();
        });


        /// <summary>
        /// Loads existing rates from backend to kendo grid datasource.
        /// </summary>
        $scope.rates = {
            autoBind: false,
            dataSource: {
                type: "odata-v4",
                transport: {
                    read: {
                        beforeSend: function(req) {
                            req.setRequestHeader('Accept', 'application/json;odata=fullmetadata');
                        },
                        url: "/odata/Rates?$expand=Type&$filter=Active eq true",
                        dataType: "json",
                        cache: false
                    }
                },
                pageSize: 20,
                serverPaging: false,
                serverSorting: true,
            },
            sortable: true,
            pageable: {
                messages: {
                    display: "{0} - {1} af {2} takster", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                    empty: "Ingen takster at vise",
                    page: "Side",
                    of: "af {0}", //{0} is total amount of pages
                    itemsPerPage: "takster pr. side",
                    first: "Gå til første side",
                    previous: "Gå til forrige side",
                    next: "Gå til næste side",
                    last: "Gå til sidste side",
                    refresh: "Genopfrisk"
                },
                pageSizes: [5, 10, 20, 30, 40, 50, 100, 150, 200]
            },
            scrollable: false,
            columns: [
                {
                    field: "Year",
                    title: "År"
                },
                {
                    field: "KmRate",
                    title: "Takst",
                    template: "${KmRate} ører pr/km"
                },
                {
                    field: "Type.TFCode",
                    title: "TF kode",
                },
                {
                    field: "Type",
                    title: "Type",
                    template: function(data) {
                        return data.Type.Description;
                    }
                }
            ]
        };

        $scope.updateRatesGrid = function () {
            /// <summary>
            /// Refreshes kendo grid datasource.
            /// </summary>
            $scope.container.rateGrid.dataSource.read();
        }

        $scope.$on("kendoWidgetCreated", function (event, widget) {
            if (widget === $scope.container.rateDropDown) {
                $scope.rateTypes = RateType.get(function () {
                    angular.forEach($scope.rateTypes, function (rateType, key) {
                        rateType.Description += " (" + rateType.TFCode + ")"
                    });
                    $scope.container.rateDropDown.dataSource.read();
                    $scope.container.rateDropDown.select(0);
                });
            }
        });

        $scope.addNewRateClick = function () {
            /// <summary>
            /// Opens add new Rate modal
            /// </summary>
            $scope.newRateYearError = "";
            $scope.newRateRateError = "";
            $scope.newRateTFCodeError = "";
            $scope.newRateRateTypeError = "";
            var error = false;
            if ($scope.container.newRateYear == "" || $scope.container.newRateYear == undefined || $scope.container.newRateYear.toString().length != 4) {
                $scope.newRateYearError = "* Du skal skrive et gyldigt år."
                error = true;
            }
            if ($scope.container.newRateRate == "" || $scope.container.newRateRate == undefined) {
                $scope.newRateRateError = "* Du skal skrive en gyldig takst."
                error = true;
            }
            if ($scope.container.newRateRateType == "" || $scope.container.newRateRateType == undefined) {
                $scope.newRateRateTypeError = "* Du skal vælge en gyldig taksttype."
                error = true;
            }

            if (!error) {
                Rate.post({ "Year": $scope.container.newRateYear, "TFCode": $scope.container.newRateTFCode, "KmRate": $scope.container.newRateRate, "TypeId": $scope.container.newRateRateType, "Active": true }, function () {
                    $scope.updateRatesGrid();
                    $scope.container.newRateYear = "";
                    $scope.container.newRateRate = "";
                    NotificationService.AutoFadeNotification("success", "", "Ny takst oprettet!");
                });
            }

        }



    }
]);

angular.module("app.drive").controller("AdminAcceptedReportsController", [
   "$scope", "$modal", "$rootScope", "Report", "OrgUnit", "Person", "$timeout", "NotificationService", "BankAccount", "RateType", "Autocomplete", "MkColumnFormatter", "RouteColumnFormatter",
   function ($scope, $modal, $rootScope, Report, OrgUnit, Person, $timeout, NotificationService, BankAccount, RateType, Autocomplete,MkColumnFormatter,RouteColumnFormatter) {

       // Set personId. The value on $rootScope is set in resolve in application.js
       var personId = $rootScope.CurrentUser.Id;

       $scope.tableSortHelp = $rootScope.HelpTexts.TableSortHelp.text;

       $scope.getEndOfDayStamp = function (d) {
           var m = moment(d);
           return m.endOf('day').unix();
       }

       $scope.getStartOfDayStamp = function (d) {
           var m = moment(d);
           return m.startOf('day').unix();
       }

       $scope.searchClicked = function () {
           var from = $scope.getStartOfDayStamp($scope.dateContainer.fromDate);
           var to = $scope.getEndOfDayStamp($scope.dateContainer.toDate);
           $scope.gridContainer.grid.dataSource.filter(getFilters(from, to, $scope.person.chosenPerson, $scope.orgUnit.chosenUnit));
       }

       var getFilters = function (from, to, fullName, longDescription) {
           var newFilters = [];
           newFilters.push({ field: "DriveDateTimestamp", operator: "ge", value: from });
           newFilters.push({ field: "DriveDateTimestamp", operator: "le", value: to });
           if (fullName != undefined && fullName != "") {
               newFilters.push({ field: "FullName", operator: "eq", value: fullName });
           }
           if (longDescription != undefined && longDescription != "") {
               newFilters.push({ field: "Employment.OrgUnit.LongDescription", operator: "eq", value: longDescription });
           }
           return newFilters;
       }

       $scope.orgUnitAutoCompleteOptions = {
           filter: "contains",
           select: function (e) {
               $scope.orgUnit.chosenId = this.dataItem(e.item.index()).Id;
           }
       }

       $scope.personAutoCompleteOptions = {
           filter: "contains",
           select: function (e) {
               $scope.person.chosenId = this.dataItem(e.item.index()).Id;
           }
       };

       // dates for kendo filter.
       var fromDateFilter = new Date();
       fromDateFilter.setDate(fromDateFilter.getDate() - 30);
       fromDateFilter = $scope.getStartOfDayStamp(fromDateFilter);
       var toDateFilter = $scope.getEndOfDayStamp(new Date());

       $scope.checkboxes = {};
       $scope.checkboxes.showSubbed = false;

       var allReports = [];

       RateType.getAll().$promise.then(function (res) {
           $scope.rateTypes = res;
       });

       $scope.orgUnit = {};
       $scope.orgUnits = [];

       // Load people for auto-complete textbox
       $scope.people = [];
       $scope.person = {};

       $scope.orgUnits = Autocomplete.orgUnits();
       $scope.people = Autocomplete.allUsers();


       $scope.clearClicked = function () {
           /// <summary>
           /// Clears filters.
           /// </summary>
           $scope.loadInitialDates();
           $scope.person.chosenPerson = "";
           $scope.orgUnit.chosenUnit = "";
           $scope.searchClicked();
       }

       $scope.searchClicked = function () {
           var from = $scope.getStartOfDayStamp($scope.dateContainer.fromDate);
           var to = $scope.getEndOfDayStamp($scope.dateContainer.toDate);
           $scope.gridContainer.grid.dataSource.transport.options.read.url = getDataUrl(from, to, $scope.person.chosenPerson, $scope.orgUnit.chosenUnit);
           $scope.gridContainer.grid.dataSource.read();
       }

       var getDataUrl = function (from, to, fullName, longDescription) {
           var url = "/odata/DriveReports?status=Accepted &getReportsWhereSubExists=true &$expand=DriveReportPoints,ApprovedBy,Employment($expand=OrgUnit)";
           var filters = "&$filter=DriveDateTimestamp ge " + from + " and DriveDateTimestamp le " + to;
           if (fullName != undefined && fullName != "") {
               filters += " and PersonId eq " + $scope.person.chosenId;
           }
           if (longDescription != undefined && longDescription != "") {
               filters += " and Employment/OrgUnitId eq " + $scope.orgUnit.chosenId;
           }
           var result = url + filters;
           return result;
       }

       /// <summary>
       /// Loads existing accepted reports from backend to kendo grid datasource.
       /// </summary>
       $scope.Reports = {
           autoBind: false,
           dataSource: {
               type: "odata-v4",
               transport: {
                   read: {
                       beforeSend: function(req) {
                           req.setRequestHeader('Accept', 'application/json;odata=fullmetadata');
                       },
                       url: "/odata/DriveReports?status=Accepted &getReportsWhereSubExists=true &$expand=DriveReportPoints,ApprovedBy,Employment($expand=OrgUnit) &$filter=DriveDateTimestamp ge " + fromDateFilter + " and DriveDateTimestamp le " + toDateFilter,
                       dataType: "json",
                       cache: false
                   }
               },
               pageSize: 20,
               serverPaging: true,
               serverAggregates: false,
               serverSorting: true,
               serverFiltering: true,
               sort: { field: "DriveDateTimestamp", dir: "desc" },
               aggregate: [
                   { field: "Distance", aggregate: "sum" },
                   { field: "AmountToReimburse", aggregate: "sum" },
               ]
           },
           sortable: true,
           pageable: {
               messages: {
                   display: "{0} - {1} af {2} indberetninger", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                   empty: "Ingen indberetninger at vise",
                   page: "Side",
                   of: "af {0}", //{0} is total amount of pages
                   itemsPerPage: "indberetninger pr. side",
                   first: "Gå til første side",
                   previous: "Gå til forrige side",
                   next: "Gå til næste side",
                   last: "Gå til sidste side",
                   refresh: "Genopfrisk"
               },
               pageSizes: [5, 10, 20, 30, 40, 50, 100, 150, 200]
           },
           dataBound: function() {
               this.expandRow(this.tbody.find("tr.k-master-row").first());
           },
           columns: [
               {
                   field: "FullName",
                   title: "Medarbejder"
               },
               {
                   field: "Employment.OrgUnit.LongDescription",
                   title: "Org.enhed"
               },
               {
                   field: "DriveDateTimestamp",
                   template: function(data) {
                       var m = moment.unix(data.DriveDateTimestamp);
                       return m._d.getDate() + "/" +
                           (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                           m._d.getFullYear();
                   },
                   title: "Dato"
               },
               {
                   field: "Purpose",
                   title: "Formål",
               },
               {
                   field: "TFCode",
                   title: "Taksttype",
                   template: function(data) {
                       for (var i = 0; i < $scope.rateTypes.length; i++) {
                           if ($scope.rateTypes[i].TFCode == data.TFCode) {
                               return $scope.rateTypes[i].Description;
                           }
                       }
                   }
               },
               {
                   title: "Rute",
                   field: "DriveReportPoints",
                   template: function(data) {
                       return RouteColumnFormatter.format(data);
                   }
               },
               {
                   field: "Distance",
                   title: "Km",
                   template: function(data) {
                       return data.Distance.toFixed(2).toString().replace('.', ',') + " km";
                   },
                   footerTemplate: "Total: #= kendo.toString(sum, '0.00').replace('.',',') # km"
               },
               {
                   field: "AmountToReimburse",
                   title: "Beløb",
                   template: function(data) {
                       return data.AmountToReimburse.toFixed(2).toString().replace('.', ',') + " kr.";
                   },
                   footerTemplate: "Total: #= kendo.toString(sum, '0.00').replace('.',',') # kr."
               },
               {
                   field: "KilometerAllowance",
                   title: "MK",
                   template: function(data) {
                       return MkColumnFormatter.format(data);
                   }
               },
               {
                   field: "FourKmRule",
                   title: "4 km",
                   template: function(data) {
                       if (data.FourKmRule) {
                           return "<i class='fa fa-check'></i>";
                       }
                       return "";
                   }
               },
               {
                   field: "CreatedDateTimestamp",
                   title: "Indberettet",
                   template: function(data) {
                       var m = moment.unix(data.CreatedDateTimestamp);
                       return m._d.getDate() + "/" +
                           (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                           m._d.getFullYear();
                   },
               },
               {
                   field: "ClosedDateTimestamp",
                   title: "Godkendt dato",
                   template: function(data) {
                       var m = moment.unix(data.ClosedDateTimestamp);
                       return m._d.getDate() + "/" +
                           (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                           m._d.getFullYear();
                   }
               },
               {
                   field: "ApprovedBy.FullName",
                   title: "Godkendt af"
               },
               {
                   field: "ProcessedDateTimestamp",
                   title: "Overført til udbetaling",
                   template: function(data) {
                       if (data.ProcessedDateTimestamp != 0 && data.ProcessedDateTimestamp != null && data.ProcessedDateTimestamp != undefined) {
                           var m = moment.unix(data.ProcessedDateTimestamp);
                           return m._d.getDate() + "/" +
                               (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                               m._d.getFullYear();
                       }
                       return "";
                   }
               },
               {
                   title: "Anden kontering",
                   field: "AccountNumber",
                   template: function(data) {
                       if (data.AccountNumber != null && data.AccountNumber != 0 && data.AccountNumber != undefined) {
                           var returnVal = "";
                           angular.forEach($scope.bankAccounts, function(value, key) {
                               if (value.Number == data.AccountNumber) {
                                   returnVal = "Ja " + "<div class='inline' kendo-tooltip k-content=\"'" + value.Description + " - " + value.Number + "'\"> <i class='fa fa-comment-o'></i></div>";
                               }
                           });
                           return returnVal;
                       } else {
                           return "Nej";
                       }
                   }
               }, {
                   field: "Id",
                   title: "Muligheder",
                   template: function(data) {
                       if (data.Status == "Accepted") {
                           return "<a ng-click=rejectClick(" + data.Id + ")>Afvis</a> | <a ng-click=editClick(" + data.Id + ")>Rediger</a>";
                       } else {
                           // Report has already been invoiced.
                           return "Er kørt til løn.";
                       }
                   }
               }
           ],
           scrollable: false
       };

       $scope.editClick = function (id) {
           /// <summary>
           /// Opens edit report modal
           /// </summary>
           /// <param name="id"></param>
           var modalInstance = $modal.open({
               templateUrl: '/App/Drive/MyReports/EditReportTemplate.html',
               controller: 'DrivingController',
               backdrop: "static",
               windowClass: "app-modal-window-full",
               resolve: {
                   ReportId: function () {
                       return id;
                   },
                   adminEditCurrentUser: function () {
                       return Report.getOwner({id : id}).$promise.then(function(res){
                            return Person.GetUserAsCurrentUser({id:res.Id}).$promise.then(function(person){
                                return person;
                            })
                       });
                   }
               }
           });

           $rootScope.editModalInstance = modalInstance;

           modalInstance.result.then(function (res) {
               $scope.gridContainer.grid.dataSource.read();
           });
       }

       /// <summary>
       /// Opens confirm delete accepted report modal
       /// </summary>
       $scope.rejectClick = function (id) {
           var modalInstance = $modal.open({
               templateUrl: '/App/Drive/Admin/Reports/Modal/ConfirmRejectApprovedReportTemplate.html',
               controller: 'ConfirmRejectApprovedReportModalController',
               backdrop: "static",
               resolve: {
                   itemId: function () {
                       return id;
                   }
               }
           });

           modalInstance.result.then(function (res) {
               if(res == undefined){
                   res = "Ingen besked.";
               }
               Report.patch({ id: id, emailText: res }, function () {
                   $scope.gridContainer.grid.dataSource.read();
               });
           });
       }

       $scope.loadInitialDates = function () {
           /// <summary>
           /// Loads initial date filters.
           /// </summary>
           // Set initial values for kendo datepickers.

           initialLoad = 2;

           var from = new Date();
           from.setDate(from.getDate() - 30);

           $scope.dateContainer.toDate = new Date();
           $scope.dateContainer.fromDate = from;

       }

       // Event handlers

       $scope.clearName = function () {
           $scope.chosenPerson = "";
       }

       $scope.showRouteModal = function (routeId) {
           /// <summary>
           /// Opens show route modal.
           /// </summary>
           /// <param name="routeId"></param>
           var modalInstance = $modal.open({
               templateUrl: '/App/Drive/Admin/Reports/Modal/ShowRouteModalTemplate.html',
               controller: 'ShowRouteModalController',
               backdrop: "static",
               resolve: {
                   routeId: function () {
                       return routeId;
                   }
               }
           });
       }

       $scope.refreshGrid = function () {
           /// <summary>
           /// Refreshes kendo grid datasource.
           /// </summary>

           if ($scope.bankAccounts == undefined) {
               BankAccount.get().$promise.then(function (res) {
                   $scope.bankAccounts = res.value;
               });
           }
           $scope.gridContainer.grid.dataSource.read();
       }

       // Init


       // Contains references to kendo ui grids.
       $scope.gridContainer = {};
       $scope.dateContainer = {};

       $scope.loadInitialDates();

       // Format for datepickers.
       $scope.dateOptions = {
           format: "dd/MM/yyyy",
       };


   }
]);
angular.module("app.drive").controller("AdminPendingReportsController", [
   "$scope", "$modal", "$rootScope", "Report", "OrgUnit", "Person", "$timeout", "NotificationService", "RateType", "Autocomplete", "MkColumnFormatter", "RouteColumnFormatter", function ($scope, $modal, $rootScope, Report, OrgUnit, Person, $timeout, NotificationService, RateType, Autocomplete, MkColumnFormatter,RouteColumnFormatter) {


       // Contains references to kendo ui grids.
       $scope.gridContainer = {};
       $scope.dateContainer = {};

       // Load people for auto-complete textbox
       $scope.people = [];
       $scope.person = {};
       $scope.orgUnit = {};
       $scope.orgUnits = [];

       $scope.tableSortHelp = $rootScope.HelpTexts.TableSortHelp.text;

       // Set personId. The value on $rootScope is set in resolve in application.js
       var personId = $rootScope.CurrentUser.Id;

       $scope.orgUnits = Autocomplete.orgUnits();
       $scope.people = Autocomplete.allUsers();


       $scope.clearClicked = function () {
           /// <summary>
           /// Clears filters.
           /// </summary>
           $scope.loadInitialDates();
           $scope.person.chosenPerson = "";
           $scope.orgUnit.chosenUnit = "";
           $scope.searchClicked();
       }

       $scope.searchClicked = function () {
           var from = $scope.getStartOfDayStamp($scope.dateContainer.fromDate);
           var to = $scope.getEndOfDayStamp($scope.dateContainer.toDate);
           $scope.gridContainer.grid.dataSource.transport.options.read.url = getDataUrl(from, to, $scope.person.chosenPerson, $scope.orgUnit.chosenUnit);
           $scope.gridContainer.grid.dataSource.read();
       }

       var getDataUrl = function (from, to, fullName, longDescription) {
           var url = "/odata/DriveReports?status=Pending &getReportsWhereSubExists=true &$expand=DriveReportPoints,ResponsibleLeader,Employment($expand=OrgUnit)";
           var filters = "&$filter=DriveDateTimestamp ge " + from + " and DriveDateTimestamp le " + to;
           if (fullName != undefined && fullName != "") {
               filters += " and PersonId eq " + $scope.person.chosenId;
           }
           if (longDescription != undefined && longDescription != "") {
               filters += " and Employment/OrgUnitId eq " + $scope.orgUnit.chosenId;
           }
           var result = url + filters;
           return result;
       }

       RateType.getAll().$promise.then(function (res) {
           $scope.rateTypes = res;
       });

       $scope.orgUnitAutoCompleteOptions = {
           filter: "contains",
           select: function (e) {
               $scope.orgUnit.chosenId = this.dataItem(e.item.index()).Id;
           }
       }

       $scope.personAutoCompleteOptions = {
           filter: "contains",
           select: function (e) {
               $scope.person.chosenId = this.dataItem(e.item.index()).Id;
           }
       };

       $scope.getEndOfDayStamp = function (d) {
           var m = moment(d);
           return m.endOf('day').unix();
       }

       $scope.getStartOfDayStamp = function (d) {
           var m = moment(d);
           return m.startOf('day').unix();
       }

       // dates for kendo filter.
       var fromDateFilter = new Date();
       fromDateFilter.setDate(fromDateFilter.getDate() - 365);
       fromDateFilter = $scope.getStartOfDayStamp(fromDateFilter);
       var toDateFilter = $scope.getEndOfDayStamp(new Date());

       var allReports = [];

       // Helper Methods




       /// <summary>
       /// Loads pending reports from backend to kendo grid datasource
       /// </summary>
        $scope.Reports = {
            autoBind: false,
            dataSource: {
                type: "odata-v4",
                transport: {
                    read: {
                        beforeSend: function(req) {
                            req.setRequestHeader('Accept', 'application/json;odata=fullmetadata');
                        },

                        url: "/odata/DriveReports?status=Pending &getReportsWhereSubExists=true &$expand=DriveReportPoints,ResponsibleLeader,Employment($expand=OrgUnit) &$filter=DriveDateTimestamp ge " + fromDateFilter + " and DriveDateTimestamp le " + toDateFilter,
                        dataType: "json",
                        cache: false
                    }
                },
                pageSize: 20,
                serverPaging: true,
                serverAggregates: false,
                serverSorting: true,
                serverFiltering: true,
                sort: { field: "DriveDateTimestamp", dir: "desc" },
                aggregate: [
                    { field: "Distance", aggregate: "sum" },
                    { field: "AmountToReimburse", aggregate: "sum" },
                ]
            },
            sortable: true,
            pageable: {
                messages: {
                    display: "{0} - {1} af {2} indberetninger", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                    empty: "Ingen indberetninger at vise",
                    page: "Side",
                    of: "af {0}", //{0} is total amount of pages
                    itemsPerPage: "indberetninger pr. side",
                    first: "Gå til første side",
                    previous: "Gå til forrige side",
                    next: "Gå til næste side",
                    last: "Gå til sidste side",
                    refresh: "Genopfrisk"
                },
                pageSizes: [5, 10, 20, 30, 40, 50, 100, 150, 200],
            },
            dataBound: function() {
                this.expandRow(this.tbody.find("tr.k-master-row").first());
            },
            columns: [
                {
                    field: "FullName",
                    title: "Medarbejder"
                },
                {
                    field: "Employment.OrgUnit.LongDescription",
                    title: "Org.enhed"
                },
                {
                    field: "DriveDateTimestamp",
                    template: function(data) {
                        var m = moment.unix(data.DriveDateTimestamp);
                        return m._d.getDate() + "/" +
                            (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                            m._d.getFullYear();
                    },
                    title: "Dato"
                },
                {
                    field: "Purpose",
                    title: "Formål",
                },
                {
                    field: "TFCode",
                    title: "Taksttype",
                    template: function(data) {
                        for (var i = 0; i < $scope.rateTypes.length; i++) {
                            if ($scope.rateTypes[i].TFCode == data.TFCode) {
                                return $scope.rateTypes[i].Description;
                            }
                        }
                    }
                },
                {
                    title: "Rute",
                    field: "DriveReportPoints",
                    template: function(data) {
                        return RouteColumnFormatter.format(data);
                    }
                },
                {
                    field: "Distance",
                    title: "Km",
                    template: function(data) {
                        return data.Distance.toFixed(2).toString().replace('.', ',') + " km";
                    },
                    footerTemplate: "Total: #= kendo.toString(sum, '0.00').replace('.',',') # km"
                },
                {
                    field: "AmountToReimburse",
                    title: "Beløb",
                    template: function(data) {
                        return data.AmountToReimburse.toFixed(2).toString().replace('.', ',') + " kr.";
                    },
                    footerTemplate: "Total: #= kendo.toString(sum, '0.00').replace('.',',') # kr."
                },
                {
                    field: "KilometerAllowance",
                    title: "MK",
                    template: function(data) {
                        return MkColumnFormatter.format(data);
                    }
                },
                {
                    field: "FourKmRule",
                    title: "4 km",
                    template: function(data) {
                        if (data.FourKmRule) {
                            return "<i class='fa fa-check'></i>";
                        }
                        return "";
                    }
                },
                {
                    field: "CreatedDateTimestamp",
                    title: "Indberettet",
                    template: function(data) {
                        var m = moment.unix(data.CreatedDateTimestamp);
                        return m._d.getDate() + "/" +
                            (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                            m._d.getFullYear();
                    },
                },
                {
                    title: "Godkender",
                    field: "ResponsibleLeader.FullName",
                    template: function(data) {
                        if (data.ResponsibleLeader != 0 && data.ResponsibleLeader != null && data.ResponsibleLeader != undefined) {
                            return data.ResponsibleLeader.FullName;
                        }
                        return "";
                    }
                }
            ],
            scrollable: false
        };

       $scope.$on('reportsClicked', function () {
           if ($scope.gridContainer.grid != undefined) {
               $scope.gridContainer.grid.dataSource.read();
           }
       });

       $scope.loadInitialDates = function () {
           /// <summary>
           /// Loads initial date filters.
           /// </summary>
           // Set initial values for kendo datepickers.

           var from = new Date();
           from.setDate(from.getDate() - 365);

           $scope.dateContainer.toDate = new Date();
           $scope.dateContainer.fromDate = from;


       }





       // Event handlers



       $scope.clearName = function () {
           $scope.chosenPerson = "";
       }

       $scope.showRouteModal = function (routeId) {
           /// <summary>
           /// Opens show route modal.
           /// </summary>
           /// <param name="routeId"></param>
           var modalInstance = $modal.open({
               templateUrl: '/App/Admin/Reports/Modal/ShowRouteModalTemplate.html',
               controller: 'ShowRouteModalController',
               backdrop: "static",
               resolve: {
                   routeId: function () {
                       return routeId;
                   }
               }
           });
       }

       $scope.refreshGrid = function () {
           $scope.gridContainer.grid.dataSource.read();
       }




       $scope.loadInitialDates();



       // Format for datepickers.
       $scope.dateOptions = {
           format: "dd/MM/yyyy",

       };

       $scope.personChanged = function (item) {

       }

       $scope.person.chosenPerson = "";






   }
]);
angular.module("app.drive").controller("AdminRejectedReportsController", [
   "$scope", "$modal", "$rootScope", "Report", "OrgUnit", "Person", "$timeout", "NotificationService", "RateType","Autocomplete","MkColumnFormatter", "RouteColumnFormatter", function ($scope, $modal, $rootScope, Report, OrgUnit, Person, $timeout, NotificationService, RateType, Autocomplete,MkColumnFormatter,RouteColumnFormatter) {

       // Set personId. The value on $rootScope is set in resolve in app.js
       var personId = $rootScope.CurrentUser.Id;

       var allReports = [];

       $scope.tableSortHelp = $rootScope.HelpTexts.TableSortHelp.text;

       RateType.getAll().$promise.then(function (res) {
           $scope.rateTypes = res;
       });

       $scope.getEndOfDayStamp = function (d) {
           var m = moment(d);
           return m.endOf('day').unix();
       }

       $scope.getStartOfDayStamp = function (d) {
           var m = moment(d);
           return m.startOf('day').unix();
       }

       $scope.orgUnitAutoCompleteOptions = {
           filter: "contains",
           select: function (e) {
               $scope.orgUnit.chosenId = this.dataItem(e.item.index()).Id;
           }
       }

       $scope.personAutoCompleteOptions = {
           filter: "contains",
           select: function (e) {
               $scope.person.chosenId = this.dataItem(e.item.index()).Id;
           }
       };

       $scope.searchClicked = function () {
           var from = $scope.getStartOfDayStamp($scope.dateContainer.fromDate);
           var to = $scope.getEndOfDayStamp($scope.dateContainer.toDate);
           $scope.gridContainer.grid.dataSource.transport.options.read.url = getDataUrl(from, to, $scope.person.chosenPerson, $scope.orgUnit.chosenUnit);
           $scope.gridContainer.grid.dataSource.read();
       }

       var getDataUrl = function (from, to, fullName, longDescription) {
           var url = "/odata/DriveReports?status=Rejected &getReportsWhereSubExists=true &$expand=DriveReportPoints,ApprovedBy,Employment($expand=OrgUnit)";
           var filters = "&$filter=DriveDateTimestamp ge " + from + " and DriveDateTimestamp le " + to;
           if (fullName != undefined && fullName != "") {
               filters += " and PersonId eq " + $scope.person.chosenId;
           }
           if (longDescription != undefined && longDescription != "") {
               filters += " and Employment/OrgUnitId eq " + $scope.orgUnit.chosenId;
           }
           var result = url + filters;
           return result;
       }

       // dates for kendo filter.
       var fromDateFilter = new Date();
       fromDateFilter.setDate(fromDateFilter.getDate() - 30);
       fromDateFilter = $scope.getStartOfDayStamp(fromDateFilter);
       var toDateFilter = $scope.getEndOfDayStamp(new Date());

       $scope.checkboxes = {};
       $scope.checkboxes.showSubbed = false;

       $scope.orgUnit = {};
       $scope.orgUnits = [];

       // Load people for auto-complete textbox
       $scope.people = [];
       $scope.person = {};

        $scope.orgUnits = Autocomplete.orgUnits();
        $scope.people = Autocomplete.allUsers();

       /// <summary>
       /// Loads rejected reports from backend to kendo grid datasource.
       /// </summary>
        $scope.Reports = {
            autoBind: false,
            dataSource: {
                type: "odata-v4",
                transport: {
                    read: {
                        beforeSend: function(req) {
                            req.setRequestHeader('Accept', 'application/json;odata=fullmetadata');
                        },


                        url: "/odata/DriveReports?status=Rejected &getReportsWhereSubExists=true &$expand=DriveReportPoints,ApprovedBy,Employment($expand=OrgUnit) &$filter=DriveDateTimestamp ge " + fromDateFilter + " and DriveDateTimestamp le " + toDateFilter,
                        dataType: "json",
                        cache: false
                    }
                },
                pageSize: 20,
                serverPaging: false,
                serverSorting: true,
                sort: { field: "DriveDateTimestamp", dir: "desc" },
                aggregate: [
                    { field: "Distance", aggregate: "sum" },
                    { field: "AmountToReimburse", aggregate: "sum" },
                ]
            },
            sortable: true,
            pageable: {
                messages: {
                    display: "{0} - {1} af {2} indberetninger", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                    empty: "Ingen indberetninger at vise",
                    page: "Side",
                    of: "af {0}", //{0} is total amount of pages
                    itemsPerPage: "indberetninger pr. side",
                    first: "Gå til første side",
                    previous: "Gå til forrige side",
                    next: "Gå til næste side",
                    last: "Gå til sidste side",
                    refresh: "Genopfrisk"
                },
                pageSizes: [5, 10, 20, 30, 40, 50, 100, 150, 200]
            },
            dataBound: function() {
                this.expandRow(this.tbody.find("tr.k-master-row").first());
            },
            columns: [
                {
                    field: "FullName",
                    title: "Medarbejder"
                },
                {
                    field: "Employment.OrgUnit.LongDescription",
                    title: "Org.enhed"
                },
                {
                    field: "DriveDateTimestamp",
                    template: function(data) {
                        var m = moment.unix(data.DriveDateTimestamp);
                        return m._d.getDate() + "/" +
                            (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                            m._d.getFullYear();
                    },
                    title: "Dato"
                },
                {
                    field: "Purpose",
                    title: "Formål",
                },
                {
                    field: "TFCode",
                    title: "Taksttype",
                    template: function(data) {
                        for (var i = 0; i < $scope.rateTypes.length; i++) {
                            if ($scope.rateTypes[i].TFCode == data.TFCode) {
                                return $scope.rateTypes[i].Description;
                            }
                        }
                    }
                },
                {
                    title: "Rute",
                    field: "DriveReportPoints",
                    template: function(data) {
                        return RouteColumnFormatter.format(data);
                    }
                },
                {
                    field: "Distance",
                    title: "Km",
                    template: function(data) {
                        return data.Distance.toFixed(2).toString().replace('.', ',') + " km";
                    },
                    footerTemplate: "Total: #= kendo.toString(sum, '0.00').replace('.',',') # km"
                },
                {
                    field: "AmountToReimburse",
                    title: "Beløb",
                    template: function(data) {
                        return data.AmountToReimburse.toFixed(2).toString().replace('.', ',') + " kr.";
                    },
                    footerTemplate: "Total: #= kendo.toString(sum, '0.00').replace('.',',') # kr."
                },
                {
                    field: "KilometerAllowance",
                    title: "MK",
                    template: function(data) {
                        return MkColumnFormatter.format(data);
                    }
                },
                {
                    field: "FourKmRule",
                    title: "4 km",
                    template: function(data) {
                        if (data.FourKmRule) {
                            return "<i class='fa fa-check'></i>";
                        }
                        return "";
                    }
                },
                {
                    field: "CreatedDateTimestamp",
                    title: "Indberettet",
                    template: function(data) {
                        var m = moment.unix(data.CreatedDateTimestamp);
                        return m._d.getDate() + "/" +
                            (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                            m._d.getFullYear();
                    }
                },
                {
                    field: "ClosedDateTimestamp",
                    title: "Afvist dato",
                    template: function(data) {
                        var m = moment.unix(data.ClosedDateTimestamp);
                        var date = m._d.getDate() + "/" +
                            (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                            m._d.getFullYear();

                        return date + "<div class='inline' kendo-tooltip k-content=\"'" + data.Comment + "'\"> <i class='fa fa-comment-o'></i></div>";

                    }
                },
                {
                    field: "ApprovedBy.FullName",
                    title: "Afvist af"
                }
            ],
            scrollable: false
        };

       $scope.loadInitialDates = function () {
           // Set initial values for kendo datepickers.

           initialLoad = 2;

           var from = new Date();
           from.setDate(from.getDate() - 30);

           $scope.dateContainer.toDate = new Date();
           $scope.dateContainer.fromDate = from;

       }

       $scope.clearName = function () {
           $scope.chosenPerson = "";
       }

       $scope.clearClicked = function () {
           /// <summary>
           /// Clears filters.
           /// </summary>
           $scope.loadInitialDates();
           $scope.person.chosenPerson = "";
           $scope.orgUnit.chosenUnit = "";
           $scope.searchClicked();
       }


       $scope.showRouteModal = function (routeId) {
           var modalInstance = $modal.open({
               templateUrl: '/App/Admin/Reports/Modal/ShowRouteModalTemplate.html',
               controller: 'ShowRouteModalController',
               backdrop: "static",
               resolve: {
                   routeId: function () {
                       return routeId;
                   }
               }
           });
       }

       $scope.refreshGrid = function () {
           $scope.gridContainer.grid.dataSource.read();
       }

       // Contains references to kendo ui grids.
       $scope.gridContainer = {};
       $scope.dateContainer = {};

       $scope.loadInitialDates();

       // Format for datepickers.
       $scope.dateOptions = {
           format: "dd/MM/yyyy",
       };

   }
]);
angular.module("app.drive").controller("ConfirmEditApprovedReportModalController", [
   "$scope", "$modalInstance", "DriveReport", "$rootScope", function ($scope, $modalInstance, DriveReport, $rootScope) {


   $scope.confirmClicked = function(){
        $modalInstance.close($scope.emailText);
   }

   $scope.cancelClicked = function(){
        $modalInstance.dismiss();
   }

   }
]);



angular.module("app.drive").controller("ConfirmRejectApprovedReportModalController", [
   "$scope", "$modalInstance", "DriveReport", "$rootScope", function ($scope, $modalInstance, DriveReport, $rootScope) {


   $scope.confirmClicked = function(){
        console.log("confirm");
        $modalInstance.close($scope.emailText);
   }

   $scope.cancelClicked = function(){
        console.log("cancel");
        $modalInstance.dismiss();
   }

   }
]);



angular.module("app.drive").controller("ShowRouteModalController", [
   "$scope", "$modalInstance", "routeId", "DriveReport", "$rootScope", function ($scope, $modalInstance, routeId, DriveReport, $rootScope) {



       var route = DriveReport.getWithPoints({ id: routeId }, function (res) {
           OS2RouteMap.create({
               id: 'map',
               routeToken: $rootScope.HelpTexts.SEPTIMA_API_KEY.text,
           });

           OS2RouteMap.viewRoute(res.RouteGeometry, true);
       });

       $scope.closeClicked = function () {
           $modalInstance.dismiss('cancel');
       }

   }
]);



angular.module("app.drive").controller("AcceptedReportsController", [
   "$scope", "$modal", "$rootScope", "Report", "OrgUnit", "Person", "$timeout", "NotificationService", "BankAccount", "RateType", "Autocomplete","MkColumnFormatter", "RouteColumnFormatter",
   function ($scope, $modal, $rootScope, Report, OrgUnit, Person, $timeout, NotificationService, BankAccount, RateType, Autocomplete,MkColumnFormatter, RouteColumnFormatter) {

       // Set personId. The value on $rootScope is set in resolve in application.js
       var personId = $rootScope.CurrentUser.Id;
       $scope.isLeader = $rootScope.CurrentUser.IsLeader;

       $scope.tableSortHelp = $rootScope.HelpTexts.TableSortHelp.text;

       $scope.getEndOfDayStamp = function (d) {
           var m = moment(d);
           return m.endOf('day').unix();
       }

       $scope.getStartOfDayStamp = function (d) {
           var m = moment(d);
           return m.startOf('day').unix();
       }

       $scope.orgUnitAutoCompleteOptions = {
           filter: "contains",
           select: function (e) {
               $scope.orgUnit.chosenId = this.dataItem(e.item.index()).Id;
           }
       }

       $scope.personAutoCompleteOptions = {
           filter: "contains",
           select: function (e) {
               $scope.person.chosenId = this.dataItem(e.item.index()).Id;
           }
       };

       RateType.getAll().$promise.then(function (res) {
           $scope.rateTypes = res;
       });

       // dates for kendo filter.
       var fromDateFilter = new Date();
       fromDateFilter.setYear(fromDateFilter.getYear() - 1);
       fromDateFilter = $scope.getStartOfDayStamp(fromDateFilter);
       var toDateFilter = $scope.getEndOfDayStamp(new Date());

       $scope.checkboxes = {};
       $scope.checkboxes.showSubbed = false;

       var allReports = [];

       $scope.orgUnit = {};
       $scope.orgUnits = Autocomplete.orgUnits();

       $scope.people = Autocomplete.activeUsers();
       $scope.person = {};


       $scope.showSubsChanged = function () {
           /// <summary>
           /// Updates datasource accoridng to getReportsWhereSubExists
           /// </summary>
           $scope.searchClicked();
       }

       $scope.clearClicked = function () {
           /// <summary>
           /// Clears filters.
           /// </summary>
           $scope.loadInitialDates();
           $scope.person.chosenPerson = "";
           $scope.orgUnit.chosenUnit = "";
           $scope.searchClicked();
       }

       $scope.searchClicked = function () {
           var from = $scope.getStartOfDayStamp($scope.dateContainer.fromDate);
           var to = $scope.getEndOfDayStamp($scope.dateContainer.toDate);
           $scope.gridContainer.grid.dataSource.transport.options.read.url = getDataUrl(from, to, $scope.person.chosenPerson, $scope.orgUnit.chosenUnit);
           $scope.gridContainer.grid.dataSource.read();
       }

       var getDataUrl = function (from, to, fullName, longDescription) {
           var url = "/odata/DriveReports?leaderId=" + personId + "&status=Accepted" + "&getReportsWhereSubExists=" + $scope.checkboxes.showSubbed + " &$expand=Employment($expand=OrgUnit),DriveReportPoints";
           var filters = "&$filter=DriveDateTimestamp ge " + from + " and DriveDateTimestamp le " + to;
           var leaderFilter = " and ResponsibleLeaderId eq " + $scope.CurrentUser.Id;
           if ($scope.checkboxes.showSubbed) {
               leaderFilter = " and (ResponsibleLeaderId eq " + $scope.CurrentUser.Id + " or ActualLeaderId eq " + $scope.CurrentUser.Id + ")";
           }
           if (fullName != undefined && fullName != "") {
               filters += " and PersonId eq " + $scope.person.chosenId;
           }
           if (longDescription != undefined && longDescription != "") {
               filters += " and Employment/OrgUnitId eq " + $scope.orgUnit.chosenId;
           }
           filters += leaderFilter;
           var result = url + filters;
           return result;
       }

       $scope.reports = {
           autoBind: false,
           dataSource: {
               sort: { field: "DriveDateTimestamp", dir: "desc" },
               type: "odata-v4",
               transport: {
                   read: {
                       beforeSend: function(req) {
                           req.setRequestHeader('Accept', 'application/json;odata=fullmetadata');
                       },
                       url: "/odata/DriveReports?status=Accepted &$expand=Employment($expand=OrgUnit),DriveReportPoints &$filter=DriveDateTimestamp ge " + fromDateFilter + " and DriveDateTimestamp le " + toDateFilter + " and ResponsibleLeaderId eq " + $scope.CurrentUser.Id,
                       dataType: "json",
                       cache: false
                   }
               },
               pageSize: 50,
               serverPaging: true,
               serverAggregates: false,
               serverSorting: true,
               aggregate: [
                   { field: "Distance", aggregate: "sum" },
                   { field: "AmountToReimburse", aggregate: "sum" }
               ]
           },
           sortable: true,
           scrollable: false,
           pageable: {
               messages: {
                   display: "{0} - {1} af {2} indberetninger", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                   empty: "Ingen indberetninger at vise",
                   page: "Side",
                   of: "af {0}", //{0} is total amount of pages
                   itemsPerPage: "indberetninger pr. side",
                   first: "Gå til første side",
                   previous: "Gå til forrige side",
                   next: "Gå til næste side",
                   last: "Gå til sidste side",
                   refresh: "Genopfrisk"
               },
               pageSizes: [5, 10, 20, 30, 40, 50, 100, 150, 200]
           },
           dataBound: function() {
               this.expandRow(this.tbody.find("tr.k-master-row").first());
           },


           columns: [
               {
                   field: "FullName",
                   title: "Medarbejder",
                   template: function(data) {
                       return data.FullName + " [" + data.Employment.EmploymentId + "]";
                   }
               },
               {
                   field: "Employment.OrgUnit.LongDescription",
                   title: "Org.enhed"
               },
               {
                   field: "DriveDateTimestamp",
                   template: function(data) {
                       var m = moment.unix(data.DriveDateTimestamp);
                       return m._d.getDate() + "/" +
                           (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                           m._d.getFullYear();
                   },
                   title: "Dato"
               },
               {
                   field: "Purpose",
                   title: "Formål",
               },
               {
                   field: "TFCode",
                   title: "Taksttype",
                   template: function(data) {
                       for (var i = 0; i < $scope.rateTypes.length; i++) {
                           if ($scope.rateTypes[i].TFCode == data.TFCode) {
                               return $scope.rateTypes[i].Description;
                           }
                       }
                   }
               },
               {
                   title: "Rute",
                   field: "DriveReportPoints",
                   template: function(data) {
                       return RouteColumnFormatter.format(data);
                   }
               },
               {
                   field: "Distance",
                   title: "Km",
                   template: function(data) {
                       return data.Distance.toFixed(2).toString().replace('.', ',') + " km";
                   },
                   footerTemplate: "Total: #= kendo.toString(sum, '0.00').replace('.',',') # km"
               },
               {
                   field: "AmountToReimburse",
                   title: "Beløb",
                   template: function(data) {
                       return data.AmountToReimburse.toFixed(2).toString().replace('.', ',') + " kr.";
                   },
                   footerTemplate: "Total: #= kendo.toString(sum, '0.00').replace('.',',') # kr."
               },
               {
                   field: "KilometerAllowance",
                   title: "MK",
                   template: function(data) {
                       return MkColumnFormatter.format(data);
                   }
               },
               {
                   field: "FourKmRule",
                   title: "4 km",
                   template: function(data) {
                       if (data.FourKmRule) {
                           return "<i class='fa fa-check'></i>";
                       }
                       return "";
                   }
               },
               {
                   field: "CreatedDateTimestamp",
                   title: "Indberettet",
                   template: function(data) {
                       var m = moment.unix(data.CreatedDateTimestamp);
                       return m._d.getDate() + "/" +
                           (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                           m._d.getFullYear();
                   }
               },
               {
                   field: "ClosedDateTimestamp",
                   title: "Godkendt dato",
                   template: function(data) {
                       var m = moment.unix(data.ClosedDateTimestamp);
                       return m._d.getDate() + "/" +
                           (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                           m._d.getFullYear();
                   }
               },
               {
                   field: "ProcessedDateTimestamp",
                   title: "Afsendt til løn",
                   template: function(data) {
                       if (data.ProcessedDateTimestamp != 0 && data.ProcessedDateTimestamp != null && data.ProcessedDateTimestamp != undefined) {
                           var m = moment.unix(data.ProcessedDateTimestamp);
                           return m._d.getDate() + "/" +
                               (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                               m._d.getFullYear();
                       }
                       return "";
                   }
               },
               {
                   title: "Anden kontering",
                   field: "AccountNumber",
                   template: function(data) {
                       if (data.AccountNumber != null && data.AccountNumber != 0 && data.AccountNumber != undefined) {
                           var returnVal = "";
                           angular.forEach($scope.bankAccounts, function(value, key) {
                               if (value.Number == data.AccountNumber) {
                                   returnVal = "Ja " + "<div class='inline' kendo-tooltip k-content=\"'" + value.Description + " - " + value.Number + "'\"> <i class='fa fa-comment-o'></i></div>";
                               }
                           });
                           return returnVal;
                       } else {
                           return "Nej";
                       }
                   }
               }
           ]
       };

       $scope.loadInitialDates = function () {
           /// <summary>
           /// Loads initial date filters.
           /// </summary>
           // Set initial values for kendo datepickers.
           var from = new Date();
           from.setYear(from.getYear() - 1);
           $scope.dateContainer.toDate = new Date();
           $scope.dateContainer.fromDate = from;
       }

       // Event handlers

       $scope.clearName = function () {
           $scope.chosenPerson = "";
       }

       $scope.showRouteModal = function (routeId) {
           /// <summary>
           /// Opens show route modal.
           /// </summary>
           /// <param name="routeId"></param>
           var modalInstance = $modal.open({
               templateUrl: '/App/Drive/Admin/Reports/Modal/ShowRouteModalTemplate.html',
               controller: 'ShowRouteModalController',
               backdrop: "static",
               resolve: {
                   routeId: function () {
                       return routeId;
                   }
               }
           });
       }



       // Init


       // Contains references to kendo ui grids.
       $scope.gridContainer = {};
       $scope.dateContainer = {};


       $scope.refreshGrid = function () {
           $scope.gridContainer.grid.dataSource.read();
       }

       $scope.loadInitialDates();

       // Format for datepickers.
       $scope.dateOptions = {
           format: "dd/MM/yyyy",
       };

       BankAccount.get().$promise.then(function (res) {
           $scope.bankAccounts = res.value;
       });
   }
]);
angular.module("app.drive").controller("ApproveReportsController", [
   "$scope", function ($scope) {

   }
]);
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (app) {
    var drive;
    (function (drive) {
        "use strict";
        var BaseApproveReportsSettingsController = app.core.controllers.BaseApproveReportsSettingsController;
        var ReportType = app.core.models.ReportType;
        var DriveApproveReportsSettingsController = (function (_super) {
            __extends(DriveApproveReportsSettingsController, _super);
            function DriveApproveReportsSettingsController($scope, Person, $rootScope, Autocomplete, $modal, moment) {
                _super.call(this, $scope, Person, $rootScope, Autocomplete, $modal, moment, ReportType.Drive);
                this.$scope = $scope;
                this.Person = Person;
                this.$rootScope = $rootScope;
                this.Autocomplete = Autocomplete;
                this.$modal = $modal;
                this.moment = moment;
            }
            DriveApproveReportsSettingsController.$inject = [
                "$scope",
                "Person",
                "$rootScope",
                "Autocomplete",
                "$modal",
                "moment"
            ];
            return DriveApproveReportsSettingsController;
        }(BaseApproveReportsSettingsController));
        angular.module("app.drive").controller("ApproveReportsSettingsController", DriveApproveReportsSettingsController);
    })(drive = app.drive || (app.drive = {}));
})(app || (app = {}));
//# sourceMappingURL=ApproveReportsSettingsController.js.map
angular.module("app.drive").controller("PendingReportsController", [
   "$scope", "$modal", "$rootScope", "Report", "OrgUnit", "Person", "$timeout", "NotificationService", "RateType", "OrgUnit", "Person", "Autocomplete", "MkColumnFormatter", "RouteColumnFormatter", function ($scope, $modal, $rootScope, Report, OrgUnit, Person, $timeout, NotificationService, RateType, OrgUnit, Person, Autocomplete,MkColumnFormatter, RouteColumnFormatter) {

       // Load people for auto-complete textbox
       $scope.people = Autocomplete.activeUsers();
       $scope.orgUnits = Autocomplete.orgUnits();
       $scope.person = {};
       $scope.orgUnit = {};

       $scope.loadingPromise = null;


       // Contains references to kendo ui grids.
       $scope.gridContainer = {};
       $scope.dateContainer = {};




       $scope.tableSortHelp = $rootScope.HelpTexts.TableSortHelp.text;

       // Set personId. The value on $rootScope is set in resolve in application.js
       var personId = $rootScope.CurrentUser.Id;
       $scope.isLeader = $rootScope.CurrentUser.IsLeader;



       $scope.orgUnitAutoCompleteOptions = {
           filter: "contains",
           select: function (e) {
               $scope.orgUnit.chosenId = this.dataItem(e.item.index()).Id;
           }
       }

       $scope.personAutoCompleteOptions = {
           filter: "contains",
           select: function (e) {
               $scope.person.chosenId = this.dataItem(e.item.index()).Id;
           }
       };

       $scope.getEndOfDayStamp = function (d) {
           var m = moment(d);
           return m.endOf('day').unix();
       }

       $scope.getStartOfDayStamp = function (d) {
           var m = moment(d);
           return m.startOf('day').unix();
       }

       // dates for kendo filter.
       var fromDateFilter = new Date();
       fromDateFilter.setYear(fromDateFilter.getYear() - 2);
       fromDateFilter = $scope.getStartOfDayStamp(fromDateFilter);
       var toDateFilter = $scope.getEndOfDayStamp(new Date());

       $scope.checkAllBox = {};

       $scope.checkboxes = {};
       $scope.checkboxes.showSubbed = false;

       var checkedReports = [];

       var allReports = [];

       // Helper Methods

       $scope.approveSelectedToolbar = {
           resizable: false,
           items: [

               {
                   type: "splitButton",
                   text: "Godkend markerede",
                   click: approveSelectedClick,
                   menuButtons: [
                       { text: "Godkend markerede med anden kontering", click: approveSelectedWithAccountClick }
                   ]
               }
           ]
       };

       $scope.clearClicked = function () {
           /// <summary>
           /// Clears filters.
           /// </summary>
           $scope.loadInitialDates();
           $scope.person.chosenPerson = "";
           $scope.orgUnit.chosenUnit = "";
           $scope.searchClicked();
       }

       $scope.searchClicked = function () {
           var from = $scope.getStartOfDayStamp($scope.dateContainer.fromDate);
           var to = $scope.getEndOfDayStamp($scope.dateContainer.toDate);
           $scope.gridContainer.grid.dataSource.transport.options.read.url = getDataUrl(from, to, $scope.person.chosenPerson, $scope.orgUnit.chosenUnit);
           $scope.gridContainer.grid.dataSource.read();
       }

       var getDataUrl = function (from, to, fullName, longDescription) {
           var url = "/odata/DriveReports?status=Pending &$expand=Employment($expand=OrgUnit),DriveReportPoints,ResponsibleLeader";

           var leaderFilter = " and ResponsibleLeaderId eq " + $scope.CurrentUser.Id;

           if ($scope.checkboxes.showSubbed) {
               leaderFilter = " and (ResponsibleLeaderId eq " + $scope.CurrentUser.Id + " or ActualLeaderId eq " + $scope.CurrentUser.Id + ")";
           }

           var filters = "&$filter=DriveDateTimestamp ge " + from + " and DriveDateTimestamp le " + to;
           if (fullName != undefined && fullName != "") {
               filters += " and PersonId eq " + $scope.person.chosenId;
           }
           if (longDescription != undefined && longDescription != "") {
               filters += " and Employment/OrgUnitId eq " + $scope.orgUnit.chosenId;
           }
           filters += leaderFilter;

           var result = url + filters;
           return result;
       }

       $scope.showSubsChanged = function () {
           /// <summary>
           /// Applies filter according to getReportsWhereSubExists
           /// </summary>
           $scope.searchClicked();
       }

        $scope.reports = {
            dataSource:
            {
                type: "odata-v4",
                transport: {
                    read: {
                        url: "/odata/DriveReports?status=Pending &$expand=Employment($expand=OrgUnit),DriveReportPoints,ResponsibleLeader &$filter=DriveDateTimestamp ge " + fromDateFilter + " and DriveDateTimestamp le " + toDateFilter + " and ResponsibleLeaderId eq " + $scope.CurrentUser.Id,
                        dataType: "json",
                        cache: false
                    }
                },
                pageSize: 50,
                serverPaging: true,
                serverAggregates: false,
                serverSorting: true,
                serverFiltering: true,
                sort: { field: "DriveDateTimestamp", dir: "desc" },
                aggregate: [
                    { field: "Distance", aggregate: "sum" },
                    { field: "AmountToReimburse", aggregate: "sum" },
                ]
            },
            sortable: true,
            resizable: true,
            pageable: {
                messages: {
                    display: "{0} - {1} af {2} indberetninger", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                    empty: "Ingen indberetninger at vise",
                    page: "Side",
                    of: "af {0}", //{0} is total amount of pages
                    itemsPerPage: "indberetninger pr. side",
                    first: "Gå til første side",
                    previous: "Gå til forrige side",
                    next: "Gå til næste side",
                    last: "Gå til sidste side",
                    refresh: "Genopfrisk",
                },
                pageSizes: [5, 10, 20, 30, 40, 50, 100, 150, 200]
            },
            scrollable: false,
            dataBinding: function() {
                checkedReports = [];
                $scope.checkAllBox.isChecked = false;
                var temp = $scope.checkboxes.showSubbed;
                $scope.checkboxes = {};
                $scope.checkboxes.showSubbed = temp;
            },
            dataBound: function() {
                this.expandRow(this.tbody.find("tr.k-master-row").first());
            },
            columns: [
                {
                    field: "FullName",
                    title: "Medarbejder",
                    template: function(data) {
                        return data.FullName + " [" + data.Employment.EmploymentId + "]";
                    }
                },
                {
                    field: "Employment.OrgUnit.LongDescription",
                    title: "Org.enhed"
                },
                {
                    field: "DriveDateTimestamp",
                    template: function(data) {
                        var m = moment.unix(data.DriveDateTimestamp);
                        return m._d.getDate() + "/" +
                            (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                            m._d.getFullYear();
                    },
                    title: "Dato"
                },
                {
                    field: "Purpose",
                    title: "Formål"
                },
                {
                    field: "TFCode",
                    title: "Taksttype",
                    template: function(data) {
                        for (var i = 0; i < $scope.rateTypes.length; i++) {
                            if ($scope.rateTypes[i].TFCode == data.TFCode) {
                                return $scope.rateTypes[i].Description;
                            }
                        }
                    }
                },
                {
                    title: "Rute",
                    field: "DriveReportPoints",
                    template: function(data) {
                        return RouteColumnFormatter.format(data);
                    }
                },
                {
                    field: "Distance",
                    title: "Km",
                    template: function(data) {
                        return data.Distance.toFixed(2).toString().replace('.', ',') + " km";
                    },
                    footerTemplate: "Total: #= kendo.toString(sum, '0.00').replace('.',',') # km"
                },
                {
                    field: "AmountToReimburse",
                    title: "Beløb",
                    template: function(data) {
                        return data.AmountToReimburse.toFixed(2).toString().replace('.', ',') + " kr.";
                    },
                    footerTemplate: "Total: #= kendo.toString(sum, '0.00').replace('.',',') # kr."
                },
                {
                    field: "KilometerAllowance",
                    title: "MK",
                    template: function(data) {
                        return MkColumnFormatter.format(data);
                    }
                },
                {
                    field: "FourKmRule",
                    title: "4 km",
                    template: function(data) {
                        if (data.FourKmRule) {
                            return "<i class='fa fa-check'></i>";
                        }
                        return "";
                    }
                },
                {
                    field: "CreatedDateTimestamp",
                    template: function(data) {
                        var m = moment.unix(data.CreatedDateTimestamp);
                        return m._d.getDate() + "/" +
                            (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                            m._d.getFullYear();
                    },
                    title: "Indberettet"
                },
                {
                    sortable: false,
                    field: "Id",
                    template: function(data) {
                        if (data.ResponsibleLeader.Id == data.PersonId) {
                            return "Indberetning skal godkendes af din leder eller opsat personlig godkender.";
                        }
                        if (data.ResponsibleLeader.Id == $rootScope.CurrentUser.Id) {
                            return "<a ng-click=approveClick(" + data.Id + ")>Godkend</a> | <a ng-click=rejectClick(" + data.Id + ")>Afvis</a> <div class='pull-right'><input type='checkbox' ng-model='checkboxes[" + data.Id + "]' ng-change='rowChecked(" + data.Id + ")'></input></div>";
                        } else {
                            return data.ResponsibleLeader.FullName + " er udpeget som godkender.";
                        }

                    },
                    headerTemplate: "<div class='fill-width' kendo-toolbar k-options='approveSelectedToolbar'></div><div style=\"padding-right: 1px !important;padding-left: 0;padding-top: 6px;padding-bottom:3px;\" class='pull-right inline'><input class='pull-right' style='margin: 0' ng-change='checkAllBoxesOnPage()' type='checkbox' ng-model='checkAllBox.isChecked'></input><span class='margin-right-5 pull-right'>Marker alle</span></div> ",
                    footerTemplate: "<div class='pull-right fill-width' kendo-toolbar k-options='approveSelectedToolbar'></div>"
                }
            ]
        };

       $scope.checkAllBoxesOnPage = function () {
           /// <summary>
           /// Checks all reports on the current page.
           /// </summary>
           if ($scope.checkAllBox.isChecked) {
               checkedReports = [];
               angular.forEach(allReports, function (value, key) {
                   var repId = value.Id;
                   $scope.checkboxes[repId] = true;
                   checkedReports.push(repId);
               });
           } else {
               angular.forEach(allReports, function (value, key) {
                   var repId = value.Id;
                   $scope.checkboxes[repId] = false;
                   var index = checkedReports.indexOf(repId);
                   checkedReports.splice(index, 1);
               });
           }
       }

       $scope.rowChecked = function (id) {
           /// <summary>
           /// Adds id of the report in the checkedrow to checkedReports.
           /// </summary>
           /// <param name="id"></param>
           if ($scope.checkboxes[id]) {
               // Is run if the checkbox has been checked.
               checkedReports.push(id);
           } else {
               // Is run of the checkbox has been unchecked
               var index = checkedReports.indexOf(id);
               checkedReports.splice(index, 1);
           }
       }



       $scope.loadInitialDates = function () {
           /// <summary>
           /// Loads initial date filters.
           /// </summary>
           // Set initial values for kendo datepickers.
           var from = new Date();
           from.setYear(from.getYear() - 2);
           $scope.dateContainer.toDate = new Date();
           $scope.dateContainer.fromDate = from;
       }

       $scope.clearName = function () {
           $scope.chosenPerson = "";
       }

       $scope.approveClick = function (id) {
           /// <summary>
           /// Opens approve report modal.
           /// </summary>
           /// <param name="id"></param>
           var modalInstance = $modal.open({
               templateUrl: '/App/Drive/ApproveReports/Modals/ConfirmApproveTemplate.html',
               controller: 'AcceptController',
               backdrop: "static",
               resolve: {
                   itemId: function () {
                       return id;
                   },
                   pageNumber: -1
               }
           });

           modalInstance.result.then(function () {
               $scope.loadingPromise = Report.patch({ id: id, emailText : "Ingen besked" }, {
                   "Status": "Accepted",
                   "ClosedDateTimestamp": moment().unix(),
                   "ApprovedById": $rootScope.CurrentUser.Id,
               }, function () {
                   $scope.gridContainer.grid.dataSource.read();
               }).$promise;
           });
       }

       function approveSelectedWithAccountClick() {
           /// <summary>
           /// Opens approve selected reports with different account modal.
           /// </summary>
           if (checkedReports.length == 0) {
               NotificationService.AutoFadeNotification("danger", "", "Ingen indberetninger er markerede!");
           } else {
               var modalInstance = $modal.open({
                   templateUrl: '/App/Drive/ApproveReports/Modals/ConfirmApproveSelectedWithAccountTemplate.html',
                   controller: 'AcceptWithAccountController',
                   backdrop: "static",
                   resolve: {
                       itemId: function () {
                           return -1;
                       },
                       pageNumber: -1
                   }
               });

               modalInstance.result.then(function (accountNumber) {
                   angular.forEach(checkedReports, function (value, key) {
                       $scope.loadingPromise = Report.patch({ id: value, emailText : "Ingen besked" }, {
                           "Status": "Accepted",
                           "ClosedDateTimestamp": moment().unix(),
                           "AccountNumber": accountNumber,
                           "ApprovedById": $rootScope.CurrentUser.Id,
                       }, function () {
                           $scope.gridContainer.grid.dataSource.read();
                       }).$promise;
                   });
                   checkedReports = [];
               });
           }
       }

       function approveSelectedClick() {
           /// <summary>
           /// Opens approve selected reports modal.
           /// </summary>
           if (checkedReports.length == 0) {
               NotificationService.AutoFadeNotification("danger", "", "Ingen indberetninger er markerede!");
           } else {
               var modalInstance = $modal.open({
                   templateUrl: '/App/Drive/ApproveReports/Modals/ConfirmApproveSelectedTemplate.html',
                   controller: 'AcceptController',
                   backdrop: "static",
                   resolve: {
                       itemId: function () {
                           return -1;
                       },
                       pageNumber: -1
                   }
               });

               modalInstance.result.then(function () {
                   angular.forEach(checkedReports, function (value, key) {
                       $scope.loadingPromise = Report.patch({ id: value, emailText: "Ingen besked" }, {
                           "Status": "Accepted",
                           "ClosedDateTimestamp": moment().unix(),
                           "ApprovedById": $rootScope.CurrentUser.Id,
                       }, function () {
                           $scope.gridContainer.grid.dataSource.read();
                       }).$promise;
                   });
                   checkedReports = [];
               });
           }
       }

       $scope.showRouteModal = function (routeId) {
           /// <summary>
           /// Opens show route modal.
           /// </summary>
           /// <param name="routeId"></param>
           var modalInstance = $modal.open({
               templateUrl: '/App/Drive/Admin/Reports/Modal/ShowRouteModalTemplate.html',
               controller: 'ShowRouteModalController',
               backdrop: "static",
               resolve: {
                   routeId: function () {
                       return routeId;
                   }
               }
           });
       }

       $scope.rejectClick = function (id) {
           /// <summary>
           /// Opens reject report modal.
           /// </summary>
           /// <param name="id"></param>
           var modalInstance = $modal.open({
               templateUrl: '/App/Core/Views/Modals/ConfirmRejectReport.html',
               controller: 'RejectReportModalInstanceController',
               backdrop: "static",
               resolve: {
                   itemId: function () {
                       return id;
                   }
               }
           });

           modalInstance.result.then(function (res) {
               $scope.loadingPromise = Report.patch({ id: id, emailText : "Ingen besked" }, {
                   "Status": "Rejected",
                   "ClosedDateTimestamp": moment().unix(),
                   "Comment": res.Comment,
                   "ApprovedById": $rootScope.CurrentUser.Id,
               }, function () {
                   $scope.gridContainer.grid.dataSource.read();
                   NotificationService.AutoFadeNotification("success", "", "Indberetningen blev afvist.");
               }).$promise;
           });
       }

       $scope.refreshGrid = function () {
           $scope.gridContainer.grid.dataSource.read();
       }

       $scope.loadInitialDates();

       // Format for datepickers.
       $scope.dateOptions = {
           format: "dd/MM/yyyy"
       };

       $scope.person.chosenPerson = "";


       RateType.getAll().$promise.then(function (res) {
           $scope.rateTypes = res;
       });

   }
]);

angular.module("app.drive").controller("RejectedReportsController", [
   "$scope", "$modal", "$rootScope", "Report", "OrgUnit", "Person", "$timeout", "NotificationService", "RateType", "Autocomplete","MkColumnFormatter","RouteColumnFormatter", function ($scope, $modal, $rootScope, Report, OrgUnit, Person, $timeout, NotificationService, RateType, Autocomplete,MkColumnFormatter,RouteColumnFormatter) {

       // Set personId. The value on $rootScope is set in resolve in application.js
       var personId = $rootScope.CurrentUser.Id;

       $scope.isLeader = $rootScope.CurrentUser.IsLeader;

       var allReports = [];

       $scope.tableSortHelp = $rootScope.HelpTexts.TableSortHelp.text;

       $scope.getEndOfDayStamp = function (d) {
           var m = moment(d);
           return m.endOf('day').unix();
       }

       $scope.getStartOfDayStamp = function (d) {
           var m = moment(d);
           return m.startOf('day').unix();
       }

       $scope.orgUnitAutoCompleteOptions = {
           filter: "contains",
           select: function (e) {
               $scope.orgUnit.chosenId = this.dataItem(e.item.index()).Id;
           }
       }

       $scope.personAutoCompleteOptions = {
           filter: "contains",
           select: function (e) {
               $scope.person.chosenId = this.dataItem(e.item.index()).Id;
           }
       };

       RateType.getAll().$promise.then(function (res) {
           $scope.rateTypes = res;
       });

       // dates for kendo filter.
       var fromDateFilter = new Date();
       fromDateFilter.setYear(fromDateFilter.getYear() - 1);
       fromDateFilter = $scope.getStartOfDayStamp(fromDateFilter);
       var toDateFilter = $scope.getEndOfDayStamp(new Date());

       $scope.checkboxes = {};
       $scope.checkboxes.showSubbed = false;

       $scope.orgUnit = {};
       $scope.orgUnits = Autocomplete.orgUnits();

       $scope.people = Autocomplete.activeUsers();
       $scope.person = {};



       $scope.clearClicked = function () {
           /// <summary>
           /// Clears filters.
           /// </summary>
           $scope.loadInitialDates();
           $scope.person.chosenPerson = "";
           $scope.orgUnit.chosenUnit = "";
           $scope.searchClicked();
       }

       $scope.searchClicked = function () {
           var from = $scope.getStartOfDayStamp($scope.dateContainer.fromDate);
           var to = $scope.getEndOfDayStamp($scope.dateContainer.toDate);
           $scope.gridContainer.grid.dataSource.transport.options.read.url = getDataUrl(from, to, $scope.person.chosenPerson, $scope.orgUnit.chosenUnit);
           $scope.gridContainer.grid.dataSource.read();
       }

       var getDataUrl = function (from, to, fullName, longDescription) {
           var url = "/odata/DriveReports?leaderId=" + personId + "&status=Rejected" + "&getReportsWhereSubExists=" + $scope.checkboxes.showSubbed + " &$expand=Employment($expand=OrgUnit),DriveReportPoints";
           var filters = "&$filter=DriveDateTimestamp ge " + from + " and DriveDateTimestamp le " + to;

           var leaderFilter = " and ResponsibleLeaderId eq " + $scope.CurrentUser.Id;

           if ($scope.checkboxes.showSubbed) {
               leaderFilter = " and (ResponsibleLeaderId eq " + $scope.CurrentUser.Id + " or ActualLeaderId eq " + $scope.CurrentUser.Id + ")";
           }

           if (fullName != undefined && fullName != "") {
               filters += " and PersonId eq " + $scope.person.chosenId;
           }
           if (longDescription != undefined && longDescription != "") {
               filters += " and Employment/OrgUnitId eq " + $scope.orgUnit.chosenId;
           }

           filters += leaderFilter;

           var result = url + filters;
           return result;
       }

       $scope.showSubsChanged = function () {
           /// <summary>
           /// Applies filter according to getReportsWhereSubExists
           /// </summary>
           $scope.searchClicked();
       }

       /// <summary>
       /// Loads rejected reports from backend to kendo grid datasource.
       /// </summary>
        $scope.reports = {
            autoBind: false,
            dataSource: {
                type: "odata-v4",
                transport: {
                    read: {
                        url: "/odata/DriveReports?leaderId=" + personId + "&status=Rejected" + "&getReportsWhereSubExists=" + $scope.checkboxes.showSubbed + " &$expand=Employment($expand=OrgUnit),DriveReportPoints &$filter=DriveDateTimestamp ge " + fromDateFilter + " and DriveDateTimestamp le " + toDateFilter + " and ResponsibleLeaderId eq " + $scope.CurrentUser.Id,
                        dataType: "json",
                        cache: false
                    }
                },
                pageSize: 50,
                serverPaging: true,
                serverSorting: true,
                serverFiltering: true,
                sort: { field: "DriveDateTimestamp", dir: "desc" },
                aggregate: [
                    { field: "Distance", aggregate: "sum" },
                    { field: "AmountToReimburse", aggregate: "sum" },
                ]
            },
            sortable: true,
            scrollable: false,
            pageable: {
                messages: {
                    display: "{0} - {1} af {2} indberetninger", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                    empty: "Ingen indberetninger at vise",
                    page: "Side",
                    of: "af {0}", //{0} is total amount of pages
                    itemsPerPage: "indberetninger pr. side",
                    first: "Gå til første side",
                    previous: "Gå til forrige side",
                    next: "Gå til næste side",
                    last: "Gå til sidste side",
                    refresh: "Genopfrisk"
                },
                pageSizes: [5, 10, 20, 30, 40, 50, 100, 150, 200]
            },
            dataBound: function() {
                this.expandRow(this.tbody.find("tr.k-master-row").first());
            },
            columns: [
                {
                    field: "FullName",
                    title: "Medarbejder",
                    template: function(data) {
                        return data.FullName + " [" + data.Employment.EmploymentId + "]";
                    }
                },
                {
                    field: "Employment.OrgUnit.LongDescription",
                    title: "Org.enhed"
                },
                {
                    field: "DriveDateTimestamp",
                    template: function(data) {
                        var m = moment.unix(data.DriveDateTimestamp);
                        return m._d.getDate() + "/" +
                            (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                            m._d.getFullYear();
                    },
                    title: "Dato"
                },
                {
                    field: "Purpose",
                    title: "Formål",
                },
                {
                    field: "TFCode",
                    title: "Taksttype",
                    template: function(data) {
                        for (var i = 0; i < $scope.rateTypes.length; i++) {
                            if ($scope.rateTypes[i].TFCode == data.TFCode) {
                                return $scope.rateTypes[i].Description;
                            }
                        }
                    }
                },
                {
                    title: "Rute",
                    field: "DriveReportPoints",
                    template: function(data) {
                        return RouteColumnFormatter.format(data);
                    }
                },
                {
                    field: "Distance",
                    title: "Km",
                    template: function(data) {
                        return data.Distance.toFixed(2).toString().replace('.', ',') + " km";
                    },
                    footerTemplate: "Total: #= kendo.toString(sum, '0.00').replace('.',',') # km"
                },
                {
                    field: "AmountToReimburse",
                    title: "Beløb",
                    template: function(data) {
                        return data.AmountToReimburse.toFixed(2).toString().replace('.', ',') + " kr.";
                    },
                    footerTemplate: "Total: #= kendo.toString(sum, '0.00').replace('.',',') # kr."
                },
                {
                    field: "KilometerAllowance",
                    title: "MK",
                    template: function(data) {
                        return MkColumnFormatter.format(data);
                    }
                },
                {
                    field: "FourKmRule",
                    title: "4 km",
                    template: function(data) {
                        if (data.FourKmRule) {
                            return "<i class='fa fa-check'></i>";
                        }
                        return "";
                    }
                },
                {
                    field: "CreatedDateTimestamp",
                    title: "Indberettet",
                    template: function(data) {
                        var m = moment.unix(data.CreatedDateTimestamp);
                        return m._d.getDate() + "/" +
                            (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                            m._d.getFullYear();
                    },
                },
                {
                    field: "ClosedDateTimestamp",
                    title: "Afvist dato",
                    template: function(data) {
                        var m = moment.unix(data.ClosedDateTimestamp);
                        var date = m._d.getDate() + "/" +
                            (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                            m._d.getFullYear();

                        return date + "<div class='inline' kendo-tooltip k-content=\"'" + data.Comment + "'\"> <i class='fa fa-comment-o'></i></div>";

                    }
                }
            ]
        };

       $scope.loadInitialDates = function () {
           // Set initial values for kendo datepickers.
           var from = new Date();
           from.setYear(from.getYear() - 1);
           $scope.dateContainer.toDate = new Date();
           $scope.dateContainer.fromDate = from;
       }

       $scope.clearName = function () {
           $scope.chosenPerson = "";
       }

       $scope.showRouteModal = function (routeId) {
           var modalInstance = $modal.open({
               templateUrl: '/App/Drive/Admin/Reports/Modal/ShowRouteModalTemplate.html',
               controller: 'ShowRouteModalController',
               backdrop: "static",
               resolve: {
                   routeId: function () {
                       return routeId;
                   }
               }
           });
       }



       // Init


       // Contains references to kendo ui grids.
       $scope.gridContainer = {};
       $scope.dateContainer = {};

       $scope.loadInitialDates();

       // Format for datepickers.
       $scope.dateOptions = {
           format: "dd/MM/yyyy",
       };

       $scope.refreshGrid = function () {
           $scope.gridContainer.grid.dataSource.read();
       }
   }
]);
angular.module("app.drive").controller("AcceptController", [
   "$scope", "$modalInstance", "itemId", "NotificationService" +
    "", "pageNumber", function ($scope, $modalInstance, itemId, NotificationService, pageNumber) {

       $scope.itemId = itemId;
       $scope.pageNumber = pageNumber;

       $scope.noClicked = function () {
           $modalInstance.dismiss('cancel');
           NotificationService.AutoFadeNotification("warning", "", "Godkendelsen blev annulleret.");
       }

       $scope.yesClicked = function () {
           $modalInstance.close($scope.itemId);
           NotificationService.AutoFadeNotification("success", "", "Indberetningen blev godkendt.");
       }

       $scope.approveSelectedClick = function () {
           $modalInstance.close();
           NotificationService.AutoFadeNotification("success", "", "De markerede indberetninger blev godkendt.");
       }

   }
]);
angular.module("app.drive").controller("AcceptWithAccountController", [
   "$scope", "$modalInstance", "itemId", "BankAccount", "NotificationService", "pageNumber", function ($scope, $modalInstance, itemId, BankAccount, NotificationService, pageNumber) {

       $scope.itemId = itemId;

       $scope.result = {};

       $scope.pageNumber = pageNumber;

       BankAccount.get().$promise.then(function (res) {
           $scope.accounts = res.value;
       });

       $scope.noClicked = function () {
           $modalInstance.dismiss('cancel');
           NotificationService.AutoFadeNotification("warning", "", "Godkendelsen af indberetningen blev annulleret.");
       }

       $scope.yesClicked = function () {
           if ($scope.selectedAccount == undefined) {
               $scope.errorMessage = "* Du skal vælge en konto";
           } else {
               $scope.result.AccountNumber = $scope.selectedAccount.Number;
               $scope.result.Id = itemId;
               $modalInstance.close($scope.result);
               NotificationService.AutoFadeNotification("success", "", "Indberetningen blev godkendt med kontering " + $scope.selectedAccount.Description + " - " + $scope.selectedAccount.Number);
           }
       }

       $scope.approveAllWithAccountClick = function () {
           if ($scope.selectedAccount == undefined) {
               $scope.errorMessage = "* Du skal vælge en konto";
           } else {
               $modalInstance.close($scope.selectedAccount.Number);
               NotificationService.AutoFadeNotification("success", "", "Indberetningerne blev godkendt med kontering " + $scope.selectedAccount.Description + " - " + $scope.selectedAccount.Number);
           }
       }

       $scope.approveSelectedWithAccountClick = function () {
           if ($scope.selectedAccount == undefined) {
               $scope.errorMessage = "* Du skal vælge en konto";
           } else {
               $modalInstance.close($scope.selectedAccount.Number);
               NotificationService.AutoFadeNotification("success", "", "Indberetningerne blev godkendt med kontering " + $scope.selectedAccount.Description + " - " + $scope.selectedAccount.Number);
           }
       }

   }
]);
// Is not used.
angular.module("app.drive").directive("awsfield", function () {
    return {
        restrict: 'AE',
        link: function(scope, element, attrs) {

            var optionsOrig = {
                'apikey': 'FCF3FC50-C9F6-4D89-9D7E-6E3706C1A0BD',
                'resource': 'addressaccess',
                'select' : function(data) {

                    scope.model = data.tekst;
                }
            };

            
            angular.element(element).spatialfind(optionsOrig);
        }
    };
});
// Is not used.

angular.module('app.drive').directive('routeLoader', function () {
    return {
        restrict: 'EA',
        link: function (scope, element) {
            // Store original display mode of element
            var shownType = element.css('display');
            function hideElement() {
                element.css('display', 'none');
            }

            scope.$on('$routeChangeStart', function () {
                element.css('display', shownType);
            });
            scope.$on('$routeChangeSuccess', hideElement);
            scope.$on('$routeChangeError', hideElement);
            // Initially element is hidden
            hideElement();
        }
    }
});
angular.module("app.drive").controller("ConfirmDiscardChangesController", [
   "$scope", "$modalInstance",
   function ($scope, $modalInstance) {

       $scope.confirmDiscardChanges = function () {
           $modalInstance.close();
       }

       $scope.cancel = function () {
           $modalInstance.dismiss('cancel');
       }

   }
]);
angular.module("app.drive").controller("DrivingController", [
    "$scope", "Person", "PersonEmployments", "Rate", "LicensePlate", "PersonalRoute", "DriveReport", "Address", "SmartAdresseSource", "AddressFormatter", "$q", "ReportId", "$timeout", "NotificationService", "PersonalAddress", "$rootScope", "$modalInstance", "$window", "$modal", "$location", "adminEditCurrentUser",
    function ($scope, Person, PersonEmployments, Rate, LicensePlate, PersonalRoute, DriveReport, Address, SmartAdresseSource, AddressFormatter, $q, ReportId, $timeout, NotificationService, PersonalAddress, $rootScope, $modalInstance, $window, $modal, $location, adminEditCurrentUser) {

        $scope.ReadReportCommentHelp = $rootScope.HelpTexts.ReadReportCommentHelp.text;
        $scope.PurposeHelpText = $rootScope.HelpTexts.PurposeHelpText.text;
        $scope.fourKmRuleHelpText = $rootScope.HelpTexts.FourKmRuleHelpText.text;
        $scope.noLicensePlateHelpText = $rootScope.HelpTexts.NoLicensePlateHelpText.text;

        // Setup functions in scope.
        $scope.Number = Number;
        $scope.toString = toString;
        $scope.replace = String.replace;

        $scope.saveBtnDisabled = false;

        var isFormDirty = false;

        var fourKmAdjustment = 4;

        // Coordinate threshold is the amount two gps coordinates can differ and still be considered the same address.
        // Third decimal is 100 meters, so 0.001 means that addresses within 100 meters of each other will be considered the same when checking if route starts or ends at home.
        var coordinateThreshold = 0.001;


        var isEditingReport = ReportId > 0;
        $scope.container = {};
        $scope.container.addressNotFound = false;
        $scope.isEditingReport = isEditingReport;
        var kendoPromise = $q.defer();
        var loadingPromises = [kendoPromise.promise];

        $scope.canSubmitDriveReport = true;

        var mapChanging = false;

        // Is true the first time the map is loaded to prevent filling the address textboxes with the mapstart addresses.
        // Is initially false when loading a report to edit.
        var firstMapLoad = true;


        $scope.container.addressFieldOptions = {
            select: function () {
                $timeout(function () {
                    $scope.addressInputChanged();
                });
            },
            dataBound: function () {
                $scope.container.addressNotFound = this.dataSource._data.length == 0;
                $scope.$apply();
            },
        }

        $scope.addressPlaceholderText = "Eller indtast adresse her";
        $scope.SmartAddress = SmartAdresseSource;
        $scope.IsRoute = false;

        // Is set to actually contain something once data has been loaded from backend.
        $scope.validateInput = function () { };

        var setupForNewReport = function () {
            /// <summary>
            /// Initializes fields for new report.
            /// </summary>
            $scope.DriveReport = new DriveReport();

            $scope.DriveReport.KilometerAllowance = $rootScope.CurrentUser.Employments[0].OrgUnit.DefaultKilometerAllowance;

            $scope.DriveReport.Addresses = [];
            $scope.DriveReport.Addresses.push({ Name: "", Personal: "" });
            $scope.DriveReport.Addresses.push({ Name: "", Personal: "" });
            $scope.container.datePickerMaxDate = new Date();
        }

        setupForNewReport();

        $scope.AddViapoint = function () {
            /// <summary>
            /// Adds via point
            /// </summary>
            var temp = $scope.DriveReport.Addresses.pop();
            $scope.DriveReport.Addresses.push({ Name: "", Personal: "", Save: false });
            $scope.DriveReport.Addresses.push(temp);
        };

        $scope.Remove = function (array, index) {
            /// <summary>
            /// Removes via point
            /// </summary>
            /// <param name="array"></param>
            /// <param name="index"></param>
            array.splice(index, 1);
            $scope.addressInputChanged(index);
        };

        var getKmRate = function () {
            for (var i = 0; i < $scope.KmRate.length; i++) {
                if ($scope.KmRate[i].Id == $scope.DriveReport.KmRate) {
                    return $scope.KmRate[i];
                }
            }
        };

        $scope.shaveExtraCommasOffAddressString = function (address) {
            /// <summary>
            /// Removes commas from Address string from Septima.
            /// Septima addresses are in the format                 "StreetName StreetNumber, ZipCode, Town"
            /// Addresses used in the app need to be in the format  "StreetName StreetNumber, Zipcode Town"
            /// </summary>
            /// <param name="address"></param>
            var res = address.toString().replace(/,/, "###");
            res = res.replace(/,/g, "");
            res = res.replace(/###/, ",");
            return res;
        }

        var getCurrentUserEmployment = function (employmentId) {
            /// <summary>
            /// Gets employment for current user.
            /// </summary>
            /// <param name="employmentId"></param>
            var res;
            angular.forEach($scope.currentUser.Employments, function (empl, key) {
                if (empl.Id == employmentId) {
                    res = empl;
                }
            });
            return res;
        }

        var loadValuesFromReport = function (report) {
            /// <summary>
            /// Loads values from user's latest report and sets fields in the view.
            /// </summary>
            /// <param name="report"></param>
            $scope.DriveReport.FourKmRule = {};
            $scope.DriveReport.FourKmRule.Value = $scope.currentUser.DistanceFromHomeToBorder.toString().replace(".", ",");




            // Select position in dropdown.
            $scope.container.PositionDropDown.select(function (item) {
                return item.Id == report.EmploymentId;
            });

            // Select the right license plate.
            $scope.container.LicensePlateDropDown.select(function (item) {
                return item.Plate == report.LicensePlate;
            });
            $scope.container.LicensePlateDropDown.trigger("change");

            // Select KmRate

            $scope.container.KmRateDropDown.select(function (item) {
                return item.Type.TFCode == report.TFCode;
            });

            angular.forEach($scope.KmRate, function (rate, key) {
                if (rate.Type.TFCode == report.TFCode) {
                    $scope.showLicensePlate = rate.Type.RequiresLicensePlate;
                }
            });

            $scope.container.KmRateDropDown.trigger("change");


            // Load additional data if a report is being edited.
            if (isEditingReport) {

                // Select kilometer allowance.
                switch (report.KilometerAllowance) {
                    case "Calculated":
                        $scope.container.KilometerAllowanceDropDown.select(0);

                        if (report.IsFromApp) {
                            //Notify user that editing a calculated report from app has special conditions.
                            var modalInstance = $modal.open({
                                templateUrl: '/App/Driving/EditCalculatedAppReportTemplate.html',
                                controller: 'NoLicensePlateModalController',
                                backdrop: "static",
                            });
                        }

                        break;
                    case "Read":
                        $scope.container.KilometerAllowanceDropDown.select(1);
                        break;
                    case "CalculatedWithoutExtraDistance":
                        $scope.container.KilometerAllowanceDropDown.select(2);
                        break;
                }

                $scope.DriveReport.KilometerAllowance = $scope.container.KilometerAllowanceDropDown._selectedValue;

                $scope.DriveReport.Purpose = report.Purpose;
                $scope.DriveReport.Status = report.Status;
                $scope.DriveReport.FourKmRule.Using = report.FourKmRule;
                $scope.DriveReport.Date = moment.unix(report.DriveDateTimestamp)._d;

                if (report.KilometerAllowance == "Read") {
                    firstMapLoad = false;

                    $scope.DriveReport.UserComment = report.UserComment;
                    if (!report.StartsAtHome && !report.EndsAtHome) {
                        $scope.container.StartEndHomeDropDown.select(0);
                    } else if (report.StartsAtHome && report.EndsAtHome) {
                        $scope.container.StartEndHomeDropDown.select(3);
                    } else if (report.StartsAtHome) {
                        $scope.container.StartEndHomeDropDown.select(1);
                    } else if (report.EndsAtHome) {
                        $scope.container.StartEndHomeDropDown.select(2);
                    }
                    $scope.DriveReport.StartsAtHome = report.StartsAtHome;
                    $scope.DriveReport.EndsAtHome = report.EndsAtHome;
                    updateDrivenKm();
                    // The distance value saved on a drivereport is the distance after subtracting transport allowance.
                    // Therefore it is needed to add the transport allowance back on to the distance when editing it.
                    report.Distance = (report.Distance + $scope.TransportAllowance).toFixed(2);
                    $scope.DriveReport.ReadDistance = report.Distance.toString().replace(".", ",");
                } else {
                    $scope.initialEditReportLoad = true;
                    $scope.DriveReport.Addresses = [];
                    mapChanging = true;
                    angular.forEach(report.DriveReportPoints, function (point, key) {
                        var temp = { Name: point.StreetName + " " + point.StreetNumber + ", " + point.ZipCode + " " + point.Town, Latitude: point.Latitude, Longitude: point.Longitude };
                        $scope.DriveReport.Addresses.push(temp);
                    });
                    var res = "[";
                    angular.forEach($scope.DriveReport.Addresses, function (addr, key) {
                        res += "{name: \"" + addr.Name + "\", lat: " + addr.Latitude + ", lng: " + addr.Longitude + "},";
                    });
                    res += "]";

                    $scope.$on("kendoWidgetCreated", function (event, widget) {
                        if (widget === $scope.container.lastTextBox) {
                            mapChanging = false;
                            firstMapLoad = false;
                            $scope.addressInputChanged();
                        }
                    });
                    
                }

                $scope.DriveReport.IsRoundTrip = report.IsRoundTrip;
            }
        }


        if(adminEditCurrentUser != 0){
            // adminEditCurrentUser will have a value different from 0 if an admin is currently trying to edit a report.
            $scope.currentUser = adminEditCurrentUser;
        } else {
            $scope.currentUser = $rootScope.CurrentUser;
        }

        // Load all data
        var currentUser = $scope.currentUser;
        // Load user's positions.
        angular.forEach(currentUser.Employments, function (value, key) {
            value.PresentationString = value.Position + " - " + value.OrgUnit.LongDescription + " (" + value.EmploymentId + ")";
        });
        $scope.Employments = currentUser.Employments;

        // Load this year's rates.
        loadingPromises.push(Rate.ThisYearsRates().$promise.then(function (res) {
            $scope.KmRate = res;
        }));

        // Load user's license plates.
        var plates = currentUser.LicensePlates.slice(0);
        if (plates.length > 0) {
            $scope.userHasLicensePlate = true;
            angular.forEach(plates, function (value, key) {
                if (value.Description != "") {
                    value.PresentationString = value.Plate + " - " + value.Description;
                } else {
                    value.PresentationString = value.Plate;
                }
            });
            $scope.LicensePlates = plates;
        } else {
            $scope.userHasLicensePlate = false;
            $scope.LicensePlates = [{ PresentationString: "Ingen nummerplader", Plate: "0000000" }];
        }

        // Load user's personal routes
        var routes = currentUser.PersonalRoutes.slice(0);
        angular.forEach(routes, function (value, key) {
            value.PresentationString = "";
            if (value.Description != "") {
                value.PresentationString += value.Description + " : ";
            }
            value.PresentationString += value.Points[0].StreetName + " " + value.Points[0].StreetNumber + ", " + value.Points[0].ZipCode + " " + value.Points[0].Town + " -> ";
            value.PresentationString += value.Points[value.Points.length - 1].StreetName + " " + value.Points[value.Points.length - 1].StreetNumber + ", " + value.Points[value.Points.length - 1].ZipCode + " " + value.Points[value.Points.length - 1].Town;
            value.PresentationString += " Antal viapunkter: " + Number(value.Points.length - 2);
        });
        routes.unshift({ PresentationString: "Vælg personlig rute" });
        $scope.Routes = routes;

        // Load map start address
        loadingPromises.push(Address.getMapStart().$promise.then(function (res) {
            $scope.mapStartAddress = res;
        }));

        if (!isEditingReport) {
            // Load latest drive report
            loadingPromises.push(DriveReport.getLatest({ id: currentUser.Id }).$promise.then(function (res) {
                $scope.latestDriveReport = res;
            }));
        } else {
            // Load report to be edited.
            loadingPromises.push(DriveReport.getWithPoints({ id: ReportId }).$promise.then(function (res) {
                $scope.latestDriveReport = res;
            }));
        }

        // Load personal and standard addresses.
        loadingPromises.push(Address.GetPersonalAndStandard({ personId: currentUser.Id }).$promise.then(function (res) {
            angular.forEach(res, function (value, key) {
                value.PresentationString = "";
                if (value.Description != "" && value.Description != null && value.Description != undefined) {
                    value.PresentationString += value.Description + " : ";
                }
                if (value.Type == "Home") {
                    // Store home address
                    $scope.HomeAddress = value;
                    value.PresentationString = "Hjemmeadresse : ";
                }
                if (value.Type == "AlternativeHome") {
                    // Overwrite home address if user has alternative home address.
                    $scope.HomeAddress = value;
                }

                value.PresentationString += value.StreetName + " " + value.StreetNumber + ", " + value.ZipCode + " " + value.Town;
                value.address = value.StreetName + " " + value.StreetNumber + ", " + value.ZipCode + " " + value.Town;
            });

            $scope.PersonalAddresses = new kendo.data.DataSource({
                data: res,
                sort: {
                    field: "PresentationString",
                    dir: "asc"
                }
            });

        }));


        $q.all(loadingPromises).then(function (res) {
            dataAndKendoLoaded();
        });

        var setNotRoute = function (resetMap) {
            /// <summary>
            /// Sets fields for report to be not a personal route.
            /// </summary>
            if (resetMap == undefined) {
                resetMap = true;
            }
            $scope.container.PersonalRouteDropDown.select(0);
            $scope.IsRoute = false;
            isFormDirty = false;
            if (resetMap) {
                setMap($scope.mapStartAddress, $scope.transportType);
            }
            $scope.DriveReport.Addresses = [{ Name: "" }, { Name: "" }];
            updateDrivenKm();
        }

        var setIsRoute = function (index) {
            /// <summary>
            /// Sets field for report to be a personal route.
            /// </summary>
            /// <param name="index"></param>
            $scope.IsRoute = true;
            var route = $scope.Routes[index];
            $scope.DriveReport.Addresses = [];
            var mapArray = [];
            angular.forEach(route.Points, function (address, key) {
                var addr = {
                    Name: address.StreetName + " " + address.StreetNumber + ", " + address.ZipCode + " " + address.Town,
                    Latitude: address.Latitude,
                    Longitude: address.Longitude
                };
                $scope.DriveReport.Addresses.push(addr);
                mapArray.push({ name: addr.Name, lat: addr.Latitude, lng: addr.Longitude });
            });
            setMap(mapArray, $scope.transportType);
            isFormDirty = true;
        }

        $scope.personalRouteDropdownChange = function (e) {
            /// <summary>
            /// Event handler for personal route dropdown.
            /// </summary>
            /// <param name="e"></param>
            var index = e.sender.selectedIndex;
            if (index == 0) {
                setNotRoute();
            } else {
                setIsRoute(index);
            }
        }

        $scope.clearErrorMessages = function () {
            $scope.addressSelectionErrorMessage = "";
            $scope.purposeErrorMessage = "";
            $scope.fourKmRuleValueErrorMessage = "";
            $scope.licensePlateErrorMessage = "";
            $scope.readDistanceErrorMessage = "";
            $scope.userCommentErrorMessage = "";
        }

        $scope.isAddressNameSet = function (address) {
            return !(address.Name == "" || address.Name == $scope.addressPlaceholderText || address.Name == undefined);
        }

        $scope.isAddressPersonalSet = function (address) {
            return !(address.Personal == undefined || address.Personal == "");
        }

        var validateAddressInput = function (setError) {
            setError = typeof setError !== 'undefined' ? setError : true;
            if ($scope.DriveReport.KilometerAllowance == "Read") {
                return true;
            }
            var res = true;
            if (setError === true) {
                $scope.addressSelectionErrorMessage = "";
            }
            angular.forEach($scope.DriveReport.Addresses, function (address, key) {
                if($scope.isAddressNameSet(address) && $scope.isAddressPersonalSet(address)) {
                    address.Name = "";
                }
                if (!$scope.isAddressNameSet(address) && !$scope.isAddressPersonalSet(address)) {
                    res = false;
                    if (setError === true) {
                        $scope.addressSelectionErrorMessage = "*  Du skal udfylde alle adressefelter.";
                    }
                }
            });
            return res;
        }

        var validateDate = function () {
            $scope.dateErrorMessage = "";
            if ($scope.DriveReport.Date == null || $scope.DriveReport.Date == undefined) {
                $scope.dateErrorMessage = "* Du skal vælge en dato."
                return false;
            }
            return true;
        }

        var validatePurpose = function () {
            /// <summary>
            /// Validates purposes and sets error message in view accordingly.
            /// </summary>
            $scope.purposeErrorMessage = "";
            if ($scope.DriveReport.Purpose == undefined || $scope.DriveReport.Purpose == "") {
                $scope.purposeErrorMessage = "* Du skal angive et formål.";
                return false;
            }
            return true;
        }

        var validateFourKmRule = function () {
            /// <summary>
            /// Validates fourkmrule and sets error message in view accordingly.
            /// </summary>
            $scope.fourKmRuleValueErrorMessage = "";
            if ($scope.DriveReport.FourKmRule.Using === true && ($scope.DriveReport.FourKmRule.Value == "" || $scope.DriveReport.FourKmRule.Value == undefined)) {
                $scope.fourKmRuleValueErrorMessage = "* Du skal udfylde en 4 km-regel værdi.";
                return false;
            }
            return true;
        }

        var validateLicensePlate = function () {
            /// <summary>
            /// Validates license plate and sets error message in view accordingly.
            /// </summary>
            $scope.licensePlateErrorMessage = "";
            if (getKmRate($scope.DriveReport.KmRate).Type.RequiresLicensePlate && $scope.LicensePlates[0].PresentationString == "Ingen nummerplader") {
                $scope.openNoLicensePlateModal();
                $scope.licensePlateErrorMessage = "* Det valgte transportmiddel kræver en nummerplade.";
                return false;
            }
            return true;
        }

        var validateReadInput = function () {
            /// <summary>
            /// Validates Read Report driven distance and sets eror message in view accordingly.
            /// </summary>
            $scope.readDistanceErrorMessage = "";
            $scope.userCommentErrorMessage = "";
            var distRes = true;
            var commRes = true;
            if ($scope.DriveReport.KilometerAllowance == "Read") {
                if ($scope.DriveReport.ReadDistance <= 0 || $scope.DriveReport.ReadDistance == undefined) {
                    $scope.readDistanceErrorMessage = "* Du skal indtaste en kørt afstand.";
                    distRes = false;
                }
                if ($scope.DriveReport.UserComment == undefined || $scope.DriveReport.UserComment == "") {
                    $scope.userCommentErrorMessage = "* Du skal angive en kommentar.";
                    commRes = false;
                }
            }
            return commRes && distRes;
        }



        $scope.addressInputChanged = function (index) {

            /// <summary>
            /// Resolves address coordinates and updates map.
            /// </summary>
            /// <param name="index"></param>
            if (!validateAddressInput(false) || mapChanging || firstMapLoad) {
                return;
            }

            var mapArray = [];

            // Empty array to hold addresses
            var postRequest = [];
            angular.forEach($scope.DriveReport.Addresses, function (addr, key) {
                // Format all addresses and add them to postRequest
                if (!$scope.isAddressNameSet(addr) && addr.Personal != "") {
                    var format = AddressFormatter.fn(addr.Personal);
                    postRequest.push({ StreetName: format.StreetName, StreetNumber: format.StreetNumber, ZipCode: format.ZipCode, Town: format.Town });
                } else if ($scope.isAddressNameSet(addr)) {
                    var format = AddressFormatter.fn(addr.Name);
                    postRequest.push({ StreetName: format.StreetName, StreetNumber: format.StreetNumber, ZipCode: format.ZipCode, Town: format.Town });
                }
            });

            // Send request to backend
            Address.setCoordinatesOnAddressList(postRequest).$promise.then(function (data) {
                // Format address objects for OS2RouteMap once received.
                angular.forEach(data, function (address, value) {
                    mapArray.push({ name: address.streetName + " " + address.streetNumber + ", " + address.zipCode + " " + address.town, lat: address.latitude, lng: address.longitude });
                    $scope.DriveReport.Addresses[value].Latitude = address.latitude;
                    $scope.DriveReport.Addresses[value].Longitude = address.longitude;
                });
                setMap(mapArray, $scope.transportType);
                isFormDirty = true;
            });
        }

        var setMap = function (mapArray, transportType) {
            /// <summary>
            /// Updates the map widget in the view.
            /// </summary>
            /// <param name="mapArray"></param>
            $timeout(function () {
                setMapPromise = $q.defer();
                mapChanging = true;

                OS2RouteMap.set(mapArray, transportType);

                setMapPromise.promise.then(function () {
                    mapChanging = false;
                });
            });
        }

        // Wait for kendo to render.
        $scope.$on("kendoWidgetCreated", function (event, widget) {
            if (widget === $scope.container.KilometerAllowanceDropDown) {
                kendoPromise.resolve();
            }
        });

        var createMap = function () {
            /// <summary>
            /// Creates the map widget in the view.
            /// </summary>
            $timeout(function () {
                // Checks to see whether the map div has been created.
                if (angular.element('#map').length) {
                    OS2RouteMap.create({
                        id: 'map',
                        routeToken: $rootScope.HelpTexts.SEPTIMA_API_KEY.text,
                        change: function (obj) {

                            if (obj.status !== 0 && obj.status != undefined) {
                                createMap();
                                var modalInstance = $modal.open({
                                    templateUrl: '/App/Services/Error/ServiceError.html',
                                    controller: "ServiceErrorController",
                                    backdrop: "static",
                                    resolve: {
                                        errorMsg: function () {
                                            return 'OS2Indberetning kunne ikke beregne ruten. Fejlen kan skyldes, at det ikke er muligt at køre til en/eller flere af dine adresser. Prøv igen eller med en anden adresse tæt på.';
                                        }   
                                    }
                                });
                                return;
                            }

                            if (firstMapLoad) {
                                firstMapLoad = false;
                                return;
                            }

                            

                            isFormDirty = true;
                            $scope.currentMapAddresses = obj.Addresses;
                            $scope.latestMapDistance = obj.distance;
                            if (obj.distance == 0) {
                                isFormDirty = false;
                            }
                            updateDrivenKm();

                            // Return if the change comes from AddressInputChanged
                            if (mapChanging === true) {
                                setMapPromise.resolve();
                                return;
                            }

                            mapChanging = true;
                            $scope.DriveReport.Addresses = [];
                            // Load the adresses from the map.
                            var addresses = [];
                            angular.forEach(obj.Addresses, function (address, key) {
                                var shavedName = $scope.shaveExtraCommasOffAddressString(address.name);
                                addresses.push({ Name: shavedName, Latitude: address.lat, Longitude: address.lng });
                            });
                            $scope.DriveReport.Addresses = addresses;
                            // Apply to update the view.
                            $scope.$apply();
                            $timeout(function () {
                                // Wait for the view to render before setting mapChanging to false.

                                mapChanging = false;
                            });

                            // Prevents flickering of addresses when loading a report to be edited.
                            if ($scope.initialEditReportLoad === true) {
                                $scope.initialEditReportLoad = false;
                                return;
                            }

                            if ($scope.IsRoute) {
                                setNotRoute(false);
                            }

                           
                        }
                    });
                    if (!$scope.isEditingReport) {
                        OS2RouteMap.set($scope.mapStartAddress);
                    }
                } else {
                    NotificationService.AutoFadeNotification("danger", "", "Kortet kunne ikke vises. Prøv at genopfriske siden.");
                }
            });
        }



        var dataAndKendoLoaded = function () {
            /// <summary>
            ///  Is called when Kendo has rendered up to and including KilometerAllowanceDropDown and data has been loaded from backend.
            /// Consider this function Main()
            /// Is needed to make sure data and kendo widgets are ready for setting values from previous drivereport.
            /// </summary>

            // Define validateInput now. Otherwise it gets called from drivingview.html before having loaded resources.
            $scope.validateInput = function () {
                $scope.canSubmitDriveReport = validateReadInput();
                $scope.canSubmitDriveReport &= validateAddressInput();
                $scope.canSubmitDriveReport &= validatePurpose();
                $scope.canSubmitDriveReport &= validateLicensePlate();
                $scope.canSubmitDriveReport &= validateFourKmRule();
                $scope.canSubmitDriveReport &= validateDate();
            }

            if (!isEditingReport) {
                $scope.container.driveDatePicker.open();
            }

            // Timeout for wait for dom to render.
            $timeout(function () {
                createMap();
                loadValuesFromReport($scope.latestDriveReport);
                updateDrivenKm();
            });

        }

        $scope.clearReport = function () {
            /// <summary>
            /// Clears user input
            /// </summary>
            setMap($scope.mapStartAddress, $scope.transportType);

            setNotRoute();

            $scope.DriveReport.IsRoundTrip = false;
            loadValuesFromReport($scope.latestDriveReport);
            $scope.DriveReport.Addresses = [{ Name: "" }, { Name: "" }];
            $scope.DriveReport.ReadDistance = 0;
            $scope.DriveReport.UserComment = "";
            $scope.DriveReport.Purpose = "";
            $scope.clearErrorMessages();
            updateDrivenKm();
            $window.scrollTo(0, 0);
            // Timeout to allow the page to scroll to the top before opening datepicker.
            // Otherwise datepicker would sometimes open in the middle of the page instead of anchoring to the control.
            if (!isEditingReport) {
                $timeout(function () {
                    $scope.container.driveDatePicker.open();
                }, 200);
            }

            $scope.DrivenKMDisplay = 0;
            $scope.TransportAllowance = 0;


        }

        $scope.transportChanged = function (res) {
            $q.all(loadingPromises).then(function () {
                var kmRate = getKmRate($scope.DriveReport.KmRate);
                $scope.showLicensePlate = kmRate.Type.RequiresLicensePlate;
                if (kmRate.Type.IsBike) {
                    // If transport was car and has been switched to bicycle.
                    if ($scope.transportType == "car") {
                        if ($scope.currentMapAddresses != undefined) {
                            if ($scope.currentMapAddresses.length > 0) {
                                $scope.transportType = "bicycle";
                                // Call setMap twice to trigger change.
                                setMap($scope.currentMapAddresses, $scope.transportType);
                                setMap($scope.currentMapAddresses, $scope.transportType);
                            }
                        }
                    }
                    $scope.transportType = "bicycle";

                } else {
                    if ($scope.transportType == "bicycle") {
                        if ($scope.currentMapAddresses != undefined) {
                            if ($scope.currentMapAddresses.length > 0) {
                                $scope.transportType = "car";
                                // Call setMap twice to trigger change.
                                setMap($scope.currentMapAddresses, $scope.transportType);
                                setMap($scope.currentMapAddresses, $scope.transportType);
                            }
                        }
                    }
                    $scope.transportType = "car";
                }
            });
        }

        var handleSave = function () {
            /// <summary>
            /// Handles saving of drivereport.
            /// </summary>
            $scope.canSubmitDriveReport = false;
            $scope.saveBtnDisabled = true;
            if (isEditingReport) {
                DriveReport.delete({ id: ReportId }).$promise.then(function () {
                    DriveReport.edit({ emailText: $scope.emailText },$scope).$promise.then(function (res) {
                        $scope.latestDriveReport = res;
                        NotificationService.AutoFadeNotification("success", "", "Din tjenestekørselsindberetning blev redigeret");
                        $scope.clearReport();
                        $scope.saveBtnDisabled = false;
                        $modalInstance.close();
                        $scope.container.driveDatePicker.close();
                    }, function () {
                        $scope.saveBtnDisabled = false;
                        NotificationService.AutoFadeNotification("danger", "", "Der opstod en fejl under redigering af tjenestekørselsindberetningen.");
                    });
                });
            } else {
                DriveReport.create($scope).$promise.then(function (res) {
                    $scope.latestDriveReport = res;
                    NotificationService.AutoFadeNotification("success", "", "Din indberetning er sendt til godkendelse.");
                    $scope.clearReport();
                    $scope.saveBtnDisabled = false;
                }, function () {
                    $scope.saveBtnDisabled = false;
                    NotificationService.AutoFadeNotification("danger", "", "Der opstod en fejl under oprettelsen af tjenestekørselsindberetningen.");
                });
            }
        }

        $scope.Save = function () {
            $scope.validateInput();
            if (!$scope.canSubmitDriveReport) {
                return;
            }
            if($scope.DriveReport.Status == "Accepted"){
                // An admin is trying to edit an already approved report.
                var modalInstance = $modal.open({
                   templateUrl: '/App/Admin/HTML/Reports/Modal/ConfirmEditApprovedReportTemplate.html',
                   controller: 'ConfirmEditApprovedReportModalController',
                   backdrop: "static",
                });

               modalInstance.result.then(function (res) {
                   if(res == undefined){
                       res = "Ingen besked.";
                   }
                   $scope.emailText = res;
                   $scope.prepHandleSave();
               });
            } else {
                $scope.prepHandleSave();
            }
        }

        $scope.prepHandleSave = function(){
            if ($scope.currentUser.DistanceFromHomeToBorder != $scope.DriveReport.FourKmRule.Value && $scope.DriveReport.FourKmRule.Value != "" && $scope.DriveReport.FourKmRule.Value != undefined) {
                $scope.currentUser.DistanceFromHomeToBorder = $scope.DriveReport.FourKmRule.Value
                Person.patch({ id: $scope.currentUser.Id }, { DistanceFromHomeToBorder: $scope.DriveReport.FourKmRule.Value.toString().replace(",", ".") }).$promise.then(function () {
                    handleSave();
                });
            } else {
                handleSave();
            }
        }



        $scope.kilometerAllowanceChanged = function () {
            updateDrivenKm();
            switch ($scope.DriveReport.KilometerAllowance) {
                case "Read":
                    setMap($scope.mapStartAddress, $scope.transportType);
                    break;
                default:
                    $scope.addressInputChanged();
                    break;
            }
        }

        $scope.fourKmRuleChanged = function () {
            updateDrivenKm();
        }

        $scope.employmentChanged = function () {
            angular.forEach($scope.currentUser.Employments, function (empl, key) {
                if (empl.Id == $scope.DriveReport.Position) {
                    $scope.WorkAddress = empl.OrgUnit.Address;
                    $scope.hasAccessToFourKmRule = empl.OrgUnit.HasAccessToFourKmRule;
                }
            });
            updateDrivenKm();
        }

        var routeStartsAtHome = function () {
            /// <summary>
            /// returns true if route starts at home
            /// </summary>
            if ($scope.DriveReport.KilometerAllowance == "Read") {
                var index = $scope.container.StartEndHomeDropDown.selectedIndex;
                if (index == 1 || index == 3) {
                    return true;
                }
                return false;
            } else {
                if ($scope.currentMapAddresses == undefined) {
                    return false;
                }
                var endAddress = $scope.currentMapAddresses[0];
                return areAddressesCloseToEachOther($scope.HomeAddress, endAddress);
            }
        }

        var routeEndsAtHome = function () {
            /// <summary>
            /// Returns true if route ends at home.
            /// </summary>
            if ($scope.DriveReport.KilometerAllowance == "Read") {
                var index = $scope.container.StartEndHomeDropDown.selectedIndex;
                if (index == 2 || index == 3) {
                    return true;
                }
                return false;
            } else {
                if ($scope.currentMapAddresses == undefined) {
                    return false;
                }
                var endAddress = $scope.currentMapAddresses[$scope.currentMapAddresses.length - 1];
                return areAddressesCloseToEachOther($scope.HomeAddress, endAddress);
            }
        }

        //Checks that two addresses are within 100 meters, in
        //which case we assume they are the same when regarding
        //if a person starts or ends their route at home.
        var areAddressesCloseToEachOther = function (address1, address2) {
            //Longitude and latitude is called different things depending on
            //whether we get the information from the backend or from septima
            var long1 = (address1.Longitude === undefined) ? address1.lng : address1.Longitude;
            var long2 = (address2.Longitude === undefined) ? address2.lng : address2.Longitude;
            var lat1 = (address1.Latitude === undefined) ? address1.lat : address1.Latitude;
            var lat2 = (address2.Latitude === undefined) ? address2.lat : address2.Latitude;

            var longDiff = Math.abs(Number(long1) - Number(long2));
            var latDiff = Math.abs(Number(lat1) - Number(lat2));
            return longDiff < coordinateThreshold && latDiff < coordinateThreshold;
        }

        $scope.startEndHomeChanged = function () {
            updateDrivenKm();
        }

        var updateDrivenKm = function () {
            /// <summary>
            /// Updates drivenkm fields under map widget.
            /// </summary>
            $timeout(function () {
                if ($scope.DriveReport.KilometerAllowance != "CalculatedWithoutExtraDistance") {
                    if (routeStartsAtHome() && routeEndsAtHome()) {
                        $scope.TransportAllowance = Number(getCurrentUserEmployment($scope.DriveReport.Position).HomeWorkDistance) * 2;
                    } else if (routeStartsAtHome() || routeEndsAtHome()) {
                        $scope.TransportAllowance = getCurrentUserEmployment($scope.DriveReport.Position).HomeWorkDistance;
                    } else {
                        $scope.TransportAllowance = 0;
                    }
                } else {
                    $scope.TransportAllowance = 0;
                }

                if ($scope.DriveReport.KilometerAllowance == "Read") {
                    if ($scope.DriveReport.ReadDistance == undefined) {
                        $scope.DriveReport.ReadDistance = 0;
                    }
                    $scope.DrivenKMDisplay = Number($scope.DriveReport.ReadDistance.toString().replace(",", "."));
                } else {
                    if ($scope.latestMapDistance == undefined) {
                        $scope.DrivenKMDisplay = 0;
                    } else {
                        $scope.DrivenKMDisplay = $scope.latestMapDistance;
                    }
                }

                if ($scope.DriveReport.IsRoundTrip === true) {
                    // Double the driven km if its a roundtrip.
                    $scope.DrivenKMDisplay = Number($scope.DrivenKMDisplay) * 2;
                    // If the route starts xor ends at home -> double the transportallowance.
                    // The case where the route both ends and starts at home is already covered.
                    if (routeStartsAtHome() != routeEndsAtHome()) {

                        $scope.TransportAllowance = Number($scope.TransportAllowance) * 2;
                    }
                }
                if ($scope.DriveReport.FourKmRule != undefined && $scope.DriveReport.FourKmRule.Using === true && $scope.DriveReport.FourKmRule.Value != undefined) {
                    if (routeStartsAtHome() != routeEndsAtHome()) {
                        $scope.TransportAllowance = Number($scope.DriveReport.FourKmRule.Value.toString().replace(",", ".")) + fourKmAdjustment;
                    } else if (routeStartsAtHome() && routeEndsAtHome()) {
                        $scope.TransportAllowance = (Number($scope.DriveReport.FourKmRule.Value.toString().replace(",", ".")) * 2) + fourKmAdjustment;
                    } else {
                        $scope.TransportAllowance = fourKmAdjustment;
                    }
                }
            });
        }

        $scope.readDistanceChanged = function () {
            updateDrivenKm();
        }

        $scope.roundTripChanged = function () {
            updateDrivenKm();
        }

        $scope.closeModalWindow = function () {
            $modalInstance.dismiss();
        }


        var checkShouldPrompt = function () {
            /// <summary>
            /// Return true if there are unsaved changes on the page. 
            /// </summary>

            if (isFormDirty === true) {
                return true;
            }
            if ($scope.DriveReport.Purpose != undefined && $scope.DriveReport.Purpose != $scope.latestDriveReport.Purpose && $scope.DriveReport.Purpose != "") {
                return true;
            }
            if ($scope.DriveReport.ReadDistance != undefined && $scope.DriveReport.ReadDistance != $scope.latestDriveReport.Distance.toString().replace(".", ",") && $scope.DriveReport.ReadDistance != "") {
                return true;
            }
            if ($scope.DriveReport.UserComment != undefined && $scope.DriveReport.UserComment != $scope.latestDriveReport.UserComment && $scope.DriveReport.UserComment != "") {
                return true;
            }
            return false;
        }

        // Alert the user when navigating away from the page if there are unsaved changes.
        $scope.$on('$stateChangeStart', function (event) {
            if (checkShouldPrompt() === true) {
                var answer = confirm("Du har lavet ændringer på siden, der ikke er gemt. Ønsker du at kassere disse ændringer?");
                if (!answer) {
                    event.preventDefault();
                }
            }
        });

        window.onbeforeunload = function (e) {
            if (checkShouldPrompt() === true) {
                return "Du har lavet ændringer på siden, der ikke er gemt. Ønsker du at kassere disse ændringer?";
            }
        };

        $scope.$on('$destroy', function () {
            /// <summary>
            /// Unregister refresh event handler when leaving the page.
            /// </summary>
            window.onbeforeunload = undefined;
        });

        $scope.clearClicked = function () {
            /// <summary>
            /// Opens confirm clear report modal.
            /// </summary>
            /// <param name="id"></param>
            var modalInstance = $modal.open({
                templateUrl: '/App/Driving/ConfirmDiscardChangesTemplate.html',
                controller: 'ConfirmDiscardChangesController',
                backdrop: "static",
            });

            modalInstance.result.then(function () {
                $scope.clearReport();
            });
        }

        $scope.openNoLicensePlateModal = function () {
            /// <summary>
            /// Opens no license plate modal.
            /// </summary>
            /// <param name="id"></param>
            var modalInstance = $modal.open({
                templateUrl: '/App/Driving/NoLicensePlateModalTemplate.html',
                controller: 'NoLicensePlateModalController',
                backdrop: "static",
            });

            modalInstance.result.then(function () {
                $location.path("/settings");
            });
        }
    }
]);
angular.module("app.drive").controller("NoLicensePlateModalController", [
   "$scope", "$modalInstance","$rootScope",
   function ($scope, $modalInstance, $rootScope) {

       $scope.ok = function () {
           $modalInstance.close();
       }

       $scope.cancel = function () {
           if ($rootScope.editModalInstance != undefined) {
               // Close the report edit window. 
               //$rootScope.editModalInstance is set in MyPendingReportsController or AdminAcceptedReportsController when clicking edit.
               $rootScope.editModalInstance.dismiss();
           }
           $modalInstance.dismiss('cancel');
       }

   }
]);
angular.module("app.drive").filter('FormatKmNumber', function () {
    return function (input) {
        return (+(Math.round(+(Number(input) + 'e' + 2)) + 'e' + -2)).toFixed(2);
    };
}).filter('FormatKmNumberString', function () {
    return function (input) {
        return (+(Math.round(+(Number(input) + 'e' + 2)) + 'e' + -2)).toFixed(2).toString().replace(".", ",");
    };
})
angular.module("app.drive").controller("ConfirmDeleteReportController", [
    "$scope", "$modalInstance", "itemId", "NotificationService", function ($scope, $modalInstance, itemId, NotificationService) {

        $scope.itemId = itemId;

        $scope.confirmDelete = function() {
            $modalInstance.close($scope.itemId);
            NotificationService.AutoFadeNotification("success", "", "Indberetningen blev slettet.");
        }

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
            NotificationService.AutoFadeNotification("warning", "", "Sletning af indberetningen blev annulleret.");
        }
    }
]);
angular.module("app.drive").controller("MyAcceptedReportsController", [
   "$scope", "$modal", "$rootScope", "Report", "$timeout", "RateType","MkColumnFormatter", "RouteColumnFormatter", function ($scope, $modal, $rootScope, Report, $timeout, RateType,MkColumnFormatter, RouteColumnFormatter) {

       // Set personId. The value on $rootScope is set in resolve in application.js
       var personId = $rootScope.CurrentUser.Id;

       $scope.tableSortHelp = $rootScope.HelpTexts.TableSortHelp.text;

       $scope.getEndOfDayStamp = function (d) {
           var m = moment(d);
           return m.endOf('day').unix();
       }

       $scope.getStartOfDayStamp = function (d) {
           var m = moment(d);
           return m.startOf('day').unix();
       }

       // dates for kendo filter.
       var fromDateFilter = new Date();
       fromDateFilter.setYear(fromDateFilter.getYear() - 1);
       fromDateFilter = $scope.getStartOfDayStamp(fromDateFilter);
       var toDateFilter = $scope.getEndOfDayStamp(new Date());

       RateType.getAll().$promise.then(function (res) {
           $scope.rateTypes = res;
       });

       /// <summary>
       /// Loads current user's accepted reports from backend to kendo grid datasource.
       /// </summary>
        $scope.Reports = {
            autoBind: false,
            dataSource: {
                type: "odata-v4",
                transport: {
                    read: {
                        beforeSend: function(req) {
                            req.setRequestHeader('Accept', 'application/json;odata=fullmetadata');
                        },
                        url: "/odata/DriveReports?status=Accepted &$expand=DriveReportPoints,ApprovedBy &$filter=PersonId eq " + personId + " and DriveDateTimestamp ge " + fromDateFilter + " and DriveDateTimestamp le " + toDateFilter,
                        dataType: "json",
                        cache: false
                    }
                },
                pageSize: 20,
                serverPaging: true,
                serverAggregates: false,
                serverSorting: true,
                serverFiltering: true,
                sort: { field: "DriveDateTimestamp", dir: "desc" },
                aggregate: [
                    { field: "Distance", aggregate: "sum" },
                    { field: "AmountToReimburse", aggregate: "sum" }
                ]
            },
            sortable: true,
            pageable: {
                messages: {
                    display: "{0} - {1} af {2} indberetninger", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                    empty: "Ingen indberetninger at vise",
                    page: "Side",
                    of: "af {0}", //{0} is total amount of pages
                    itemsPerPage: "indberetninger pr. side",
                    first: "Gå til første side",
                    previous: "Gå til forrige side",
                    next: "Gå til næste side",
                    last: "Gå til sidste side",
                    refresh: "Genopfrisk"
                },
                pageSizes: [5, 10, 20, 30, 40, 50, 100, 150, 200]
            },
            dataBound: function() {
                this.expandRow(this.tbody.find("tr.k-master-row").first());
            },
            columns: [
                {
                    field: "DriveDateTimestamp",
                    template: function(data) {
                        var m = moment.unix(data.DriveDateTimestamp);
                        return m._d.getDate() + "/" +
                            (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                            m._d.getFullYear();
                    },
                    title: "Dato"
                },
                {
                    field: "Purpose",
                    template: function(data) {
                        if (data.Comment != "") {
                            return data.Purpose + "<button kendo-tooltip k-position=\"'right'\" k-content=\"'" + data.Comment + "'\" class=\"transparent-background pull-right no-border\"><i class=\"fa fa-comment-o\"></i></button>";
                        }
                        return data.Purpose;

                    },
                    title: "Formål"
                },
                {
                    field: "TFCode",
                    title: "Taksttype",
                    template: function(data) {
                        for (var i = 0; i < $scope.rateTypes.length; i++) {
                            if ($scope.rateTypes[i].TFCode == data.TFCode) {
                                return $scope.rateTypes[i].Description;
                            }
                        }
                    }
                },
                {
                    title: "Rute",
                    field: "DriveReportPoints",
                    template: function(data) {
                        return RouteColumnFormatter.format(data);
                    }
                },
                {
                    field: "Distance",
                    title: "Km",
                    template: function(data) {
                        return data.Distance.toFixed(2).toString().replace('.', ',') + " km";
                    },
                    footerTemplate: "Total: #= kendo.toString(sum, '0.00').replace('.',',') # km"
                },
                {
                    field: "AmountToReimburse",
                    title: "Beløb",
                    template: function(data) {
                        return data.AmountToReimburse.toFixed(2).toString().replace('.', ',') + " kr.";
                    },
                    footerTemplate: "Total: #= kendo.toString(sum, '0.00').replace('.',',') # kr."
                },
                {
                    field: "KilometerAllowance",
                    title: "MK",
                    template: function(data) {
                        return MkColumnFormatter.format(data);
                    }
                },
                {
                    field: "CreatedDateTimestamp",
                    template: function(data) {
                        var m = moment.unix(data.CreatedDateTimestamp);
                        return m._d.getDate() + "/" +
                            (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                            m._d.getFullYear();
                    },
                    title: "Indberettet"
                },
                {
                    field: "ClosedDateTimestamp",
                    title: "Godkendelsesdato",
                    template: function(data) {
                        var m = moment.unix(data.ClosedDateTimestamp);
                        return m._d.getDate() + "/" +
                            (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                            m._d.getFullYear();
                    }
                },
                {
                    field: "ProcessedDateTimestamp",
                    title: "Afsendt til løn",
                    template: function(data) {
                        if (data.ProcessedDateTimestamp != 0 && data.ProcessedDateTimestamp != null && data.ProcessedDateTimestamp != undefined) {
                            var m = moment.unix(data.ProcessedDateTimestamp);
                            return m._d.getDate() + "/" +
                                (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                                m._d.getFullYear();
                        }
                        return "";
                    }
                },
                {
                    field: "ApprovedBy.FullName",
                    title: "Godkendt af"
                }
            ],
            scrollable: false
        };

       $scope.clearClicked = function () {
           $scope.loadInitialDates();
           $scope.searchClicked();
       }

       $scope.searchClicked = function () {
           var from = $scope.getStartOfDayStamp($scope.dateContainer.fromDate);
           var to = $scope.getEndOfDayStamp($scope.dateContainer.toDate);
           $scope.gridContainer.grid.dataSource.transport.options.read.url = getDataUrl(from, to);
           $scope.gridContainer.grid.dataSource.read();
       }

       var getDataUrl = function (from, to) {
           var url = "/odata/DriveReports?status=Accepted &$expand=DriveReportPoints,ApprovedBy";
           var filters = " &$filter=PersonId eq " + personId + " and DriveDateTimestamp ge " + from + " and DriveDateTimestamp le " + to;
           var result = url + filters;
           return result;
       }

       $scope.loadInitialDates = function () {
           /// <summary>
           /// Loads initial date filters.
           /// </summary>
           // Set initial values for kendo datepickers.
           var from = new Date();
           from.setYear(from.getYear() - 1);

           $scope.dateContainer.toDate = new Date();
           $scope.dateContainer.fromDate = from;
       }

       $scope.refreshGrid = function () {
           /// <summary>
           /// Refreshes kendo grid datasource.
           /// </summary>
           $scope.gridContainer.grid.dataSource.read();
       }


       // Init

       // Contains references to kendo ui grids.
       $scope.gridContainer = {};
       $scope.dateContainer = {};

       $scope.loadInitialDates();

       // Format for datepickers.
       $scope.dateOptions = {
           format: "dd/MM/yyyy",
       };

       $scope.applyDateFilter = function (fromDateStamp, toDateStamp) {
           /// <summary>
           /// Applies date filters.
           /// </summary>
           /// <param name="fromDateStamp"></param>
           /// <param name="toDateStamp"></param>
           var newFilters = [];
           newFilters.push({ field: "PersonId", operator: "eq", value: personId });
           newFilters.push({ field: "DriveDateTimestamp", operator: "gte", value: fromDateStamp });
           newFilters.push({ field: "DriveDateTimestamp", operator: "lte", value: toDateStamp });
           $scope.gridContainer.grid.dataSource.filter(newFilters);
       }

       $scope.showRouteModal = function (routeId) {
           /// <summary>
           /// Opens show route modal.
           /// </summary>
           /// <param name="routeId"></param>
           var modalInstance = $modal.open({
               templateUrl: '/App/Admin/HTML/Reports/Modal/ShowRouteModalTemplate.html',
               controller: 'ShowRouteModalController',
               backdrop: "static",
               resolve: {
                   routeId: function () {
                       return routeId;
                   }
               }
           });
       }
   }
]);
angular.module("app.drive").controller("MyPendingReportsController", [
   "$scope", "$modal", "$rootScope", "Report", "$timeout", "Person", "RateType","MkColumnFormatter", "RouteColumnFormatter", function ($scope, $modal, $rootScope, Report, $timeout, Person, RateType,MkColumnFormatter,RouteColumnFormatter) {

       // Set personId. The value on $rootScope is set in resolve in application.js
       var personId = $rootScope.CurrentUser.Id;

       $scope.tableSortHelp = $rootScope.HelpTexts.TableSortHelp.text;

       $scope.getEndOfDayStamp = function (d) {
           var m = moment(d);
           return m.endOf('day').unix();
       }

       $scope.getStartOfDayStamp = function (d) {
           var m = moment(d);
           return m.startOf('day').unix();
       }

       // dates for kendo filter.
       var fromDateFilter = new Date();
       fromDateFilter.setYear(fromDateFilter.getYear() - 2);
       fromDateFilter = $scope.getStartOfDayStamp(fromDateFilter);
       var toDateFilter = $scope.getEndOfDayStamp(new Date());


       RateType.getAll().$promise.then(function (res) {
           $scope.rateTypes = res;
       });

       /// <summary>
       /// Loads current user's pending reports from backend to kendo grid datasource.
       /// </summary>
        $scope.Reports = {
            dataSource: {
                type: "odata-v4",
                transport: {
                    read: {
                        beforeSend: function(req) {
                            req.setRequestHeader('Accept', 'application/json;odata=fullmetadata');
                        },
                        url: "/odata/DriveReports?status=Pending &$expand=DriveReportPoints,ResponsibleLeader &$filter=PersonId eq " + personId,
                        dataType: "json",
                        cache: false
                    }
                },
                pageSize: 20,
                serverPaging: true,
                serverAggregates: false,
                serverSorting: true,
                serverFiltering: true,
                sort: { field: "DriveDateTimestamp", dir: "desc" },
                aggregate: [
                    { field: "Distance", aggregate: "sum" },
                    { field: "AmountToReimburse", aggregate: "sum" },
                ]
            },
            sortable: true,
            pageable: {
                messages: {
                    display: "{0} - {1} af {2} indberetninger", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                    empty: "Ingen indberetninger at vise",
                    page: "Side",
                    of: "af {0}", //{0} is total amount of pages
                    itemsPerPage: "indberetninger pr. side",
                    first: "Gå til første side",
                    previous: "Gå til forrige side",
                    next: "Gå til næste side",
                    last: "Gå til sidste side",
                    refresh: "Genopfrisk"
                },
                pageSizes: [5, 10, 20, 30, 40, 50, 100, 150, 200]
            },
            dataBound: function() {
                this.expandRow(this.tbody.find("tr.k-master-row").first());
            },
            columns: [
                {
                    field: "DriveDateTimestamp",
                    template: function(data) {
                        var m = moment.unix(data.DriveDateTimestamp);
                        return m._d.getDate() + "/" +
                            (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                            m._d.getFullYear();
                    },
                    title: "Dato"
                },
                {
                    field: "Purpose",
                    template: function(data) {
                        if (data.Comment != "") {
                            return data.Purpose + "<button kendo-tooltip k-position=\"'right'\" k-content=\"'" + data.Comment + "'\" class=\"transparent-background pull-right no-border\"><i class=\"fa fa-comment-o\"></i></button>";
                        }
                        return data.Purpose;

                    },
                    title: "Formål"
                },
                {
                    field: "TFCode",
                    title: "Taksttype",
                    template: function(data) {
                        for (var i = 0; i < $scope.rateTypes.length; i++) {
                            if ($scope.rateTypes[i].TFCode == data.TFCode) {
                                return $scope.rateTypes[i].Description;
                            }
                        }
                    }
                },
                {
                    title: "Rute",
                    field: "DriveReportPoints",
                    template: function(data) {
                        return RouteColumnFormatter.format(data);
                    }
                },
                {
                    field: "Distance",
                    title: "Km",
                    template: function(data) {
                        return data.Distance.toFixed(2).toString().replace('.', ',') + " km ";
                    },
                    footerTemplate: "Total: #= kendo.toString(sum, '0.00').replace('.',',') # km"
                },
                {
                    field: "AmountToReimburse",
                    title: "Beløb",
                    template: function(data) {
                        return data.AmountToReimburse.toFixed(2).toString().replace('.', ',') + " kr.";
                    },
                    footerTemplate: "Total: #= kendo.toString(sum, '0.00').replace('.',',') # kr."
                },
                {
                    field: "KilometerAllowance",
                    title: "MK",
                    template: function(data) {
                        return MkColumnFormatter.format(data);
                    }
                },
                {
                    field: "CreatedDateTimestamp",
                    template: function(data) {
                        var m = moment.unix(data.CreatedDateTimestamp);
                        return m._d.getDate() + "/" +
                            (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                            m._d.getFullYear();
                    },
                    title: "Indberettet"
                },
                {
                    title: "Godkender",
                    field: "ResponsibleLeader.FullName",
                    template: function(data) {
                        if (data.ResponsibleLeader != 0 && data.ResponsibleLeader != null && data.ResponsibleLeader != undefined) {
                            return data.ResponsibleLeader.FullName;
                        }
                        return "";
                    }
                },
                {
                    field: "Id",
                    template: function(data) {
                        return '<a ng-click="deleteClick("' + data.Id + '">Slet</a> | <a ng-click="editClick(' + data.Id + '">Rediger</a>';
                    } ,
                    title: "Muligheder"
                }
            ],
            scrollable: false
        };

       $scope.loadInitialDates = function () {
           /// <summary>
           /// Sets initial date filters.
           /// </summary>
           // Set initial values for kendo datepickers.
           var from = new Date();
           from.setYear(from.getYear() - 2);

           $scope.dateContainer.toDate = new Date();
           $scope.dateContainer.fromDate = from;

       }



       // Event handlers

       $scope.deleteClick = function (id) {
           /// <summary>
           /// Opens delete report modal
           /// </summary>
           /// <param name="id"></param>
           var modalInstance = $modal.open({
               templateUrl: '/App/Drive/MyReports/ConfirmDeleteTemplate.html',
               controller: 'ConfirmDeleteReportController',
               backdrop: "static",
               resolve: {
                   itemId: function () {
                       return id;
                   }
               }
           });

           modalInstance.result.then(function (res) {
               Report.delete({ id: id }, function () {
                   $scope.gridContainer.grid.dataSource.read();
               });
           });
       }

       $scope.editClick = function (id) {
           /// <summary>
           /// Opens edit report modal
           /// </summary>
           /// <param name="id"></param>

           var modalInstance = $modal.open({
               templateUrl: '/App/Drive/MyReports/EditReportTemplate.html',
               controller: 'DrivingController',
               backdrop: "static",
               windowClass: "app-modal-window-full",
               resolve: {
                   adminEditCurrentUser : function() {return 0;},
                   ReportId: function () {
                       return id;
                   }
               }
           });

           $rootScope.editModalInstance = modalInstance;

           modalInstance.result.then(function (res) {
               $scope.gridContainer.grid.dataSource.read();
           });
       }

       $scope.clearClicked = function () {
           $scope.loadInitialDates();
           $scope.searchClicked();
       }

       $scope.searchClicked = function () {
           var from = $scope.getStartOfDayStamp($scope.dateContainer.fromDate);
           var to = $scope.getEndOfDayStamp($scope.dateContainer.toDate);
           $scope.gridContainer.grid.dataSource.transport.options.read.url = getDataUrl(from, to);
           $scope.gridContainer.grid.dataSource.read();
       }

       var getDataUrl = function (from, to) {
           var url = "/odata/DriveReports?status=Pending &$expand=DriveReportPoints,ResponsibleLeader";
           var filters = "&$filter=PersonId eq " + personId + " and DriveDateTimestamp ge " + from + " and DriveDateTimestamp le " + to;
           var result = url + filters;
           return result;
       }


       // Contains references to kendo ui grids.
       $scope.gridContainer = {};
       $scope.dateContainer = {};

       $scope.loadInitialDates();

       // Format for datepickers.
       $scope.dateOptions = {
           format: "dd/MM/yyyy",
       };

       $scope.refreshGrid = function () {
           /// <summary>
           /// Refreshes kendo grid datasource.
           /// </summary>
           $scope.gridContainer.grid.dataSource.read();
       }

       $scope.showRouteModal = function (routeId) {
           /// <summary>
           /// Opens show route modal.
           /// </summary>
           /// <param name="routeId"></param>
           var modalInstance = $modal.open({
               templateUrl: '/App/Admin/HTML/Reports/Modal/ShowRouteModalTemplate.html',
               controller: 'ShowRouteModalController',
               backdrop: "static",
               resolve: {
                   routeId: function () {
                       return routeId;
                   }
               }
           });
       }
   }
]);


angular.module("app.drive").controller("MyRejectedReportsController", [
   "$scope", "$modal", "$rootScope", "Report", "$timeout", "RateType","MkColumnFormatter","RouteColumnFormatter", function ($scope, $modal, $rootScope, Report, $timeout, RateType,MkColumnFormatter,RouteColumnFormatter) {

       // Set personId. The value on $rootScope is set in resolve in application.js
       var personId = $rootScope.CurrentUser.Id;

       $scope.tableSortHelp = $rootScope.HelpTexts.TableSortHelp.text;

       $scope.getEndOfDayStamp = function (d) {
           var m = moment(d);
           return m.endOf('day').unix();
       }

       $scope.getStartOfDayStamp = function (d) {
           var m = moment(d);
           return m.startOf('day').unix();
       }

       // dates for kendo filter.
       var fromDateFilter = new Date();
       fromDateFilter.setYear(fromDateFilter.getYear() - 1);
       fromDateFilter = $scope.getStartOfDayStamp(fromDateFilter);
       var toDateFilter = $scope.getEndOfDayStamp(new Date());

       RateType.getAll().$promise.then(function (res) {
           $scope.rateTypes = res;
       });

       /// <summary>
       /// Loads current users rejected reports from backend to kendo grid datasource.
       /// </summary>
        $scope.Reports = {
            autoBind: false,
            dataSource: {
                type: "odata-v4",
                transport: {
                    read: {
                        beforeSend: function(req) {
                            req.setRequestHeader('Accept', 'application/json;odata=fullmetadata');
                        },
                        url: "/odata/DriveReports?status=Rejected &$expand=DriveReportPoints,ApprovedBy($select=FullName) &$filter=PersonId eq " + personId + " and DriveDateTimestamp ge " + fromDateFilter + " and DriveDateTimestamp le " + toDateFilter,
                        dataType: "json",
                        cache: false
                    }
                },
                pageSize: 20,
                serverPaging: false,
                serverSorting: true,
                sort: { field: "DriveDateTimestamp", dir: "desc" },
                aggregate: [
                    { field: "Distance", aggregate: "sum" },
                    { field: "AmountToReimburse", aggregate: "sum" },
                ]
            },
            sortable: true,
            pageable: {
                messages: {
                    display: "{0} - {1} af {2} indberetninger", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                    empty: "Ingen indberetninger at vise",
                    page: "Side",
                    of: "af {0}", //{0} is total amount of pages
                    itemsPerPage: "indberetninger pr. side",
                    first: "Gå til første side",
                    previous: "Gå til forrige side",
                    next: "Gå til næste side",
                    last: "Gå til sidste side",
                    refresh: "Genopfrisk"
                },
                pageSizes: [5, 10, 20, 30, 40, 50, 100, 150, 200]
            },
            dataBound: function() {
                this.expandRow(this.tbody.find("tr.k-master-row").first());
            },
            columns: [
                {
                    field: "DriveDateTimestamp",
                    template: function(data) {
                        var m = moment.unix(data.DriveDateTimestamp);
                        return m._d.getDate() + "/" +
                            (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                            m._d.getFullYear();
                    },
                    title: "Dato"
                },
                {
                    field: "Purpose",
                    title: "Formål"
                },
                {
                    field: "TFCode",
                    title: "Taksttype",
                    template: function(data) {
                        for (var i = 0; i < $scope.rateTypes.length; i++) {
                            if ($scope.rateTypes[i].TFCode == data.TFCode) {
                                return $scope.rateTypes[i].Description;
                            }
                        }
                    }
                },
                {
                    title: "Rute",
                    field: "DriveReportPoints",
                    template: function(data) {
                        return RouteColumnFormatter.format(data);
                    }
                },
                {
                    field: "Distance",
                    title: "Km",
                    template: function(data) {
                        return data.Distance.toFixed(2).toString().replace('.', ',') + " km";
                    },
                    footerTemplate: "Total: #= kendo.toString(sum, '0.00').replace('.',',') # km"
                },
                {
                    field: "AmountToReimburse",
                    title: "Beløb",
                    template: function(data) {
                        return data.AmountToReimburse.toFixed(2).toString().replace('.', ',') + " kr.";
                    },
                    footerTemplate: "Total: #= kendo.toString(sum, '0.00').replace('.',',') # kr"
                },
                {
                    field: "KilometerAllowance",
                    title: "MK",
                    template: function(data) {
                        return MkColumnFormatter.format(data);
                    }
                },
                {
                    field: "CreatedDateTimestamp",
                    template: function(data) {
                        var m = moment.unix(data.CreatedDateTimestamp);
                        return m._d.getDate() + "/" +
                            (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                            m._d.getFullYear();
                    },
                    title: "Indberettet"
                },
                {
                    field: "ClosedDateTimestamp",
                    title: "Afvist dato",
                    template: function(data) {
                        var m = moment.unix(data.ClosedDateTimestamp);
                        var date = m._d.getDate() + "/" +
                            (m._d.getMonth() + 1) + "/" + // +1 because getMonth is zero indexed.
                            m._d.getFullYear();
                        return date;

                    },
                },
                {
                    field: "ApprovedBy.FullName",
                    title: "Afvist af",
                    template: function(data) {
                        return data.ApprovedBy.FullName + "<div kendo-tooltip k-content=\"'" + data.Comment + "'\"><i class='fa fa-comment-o'></i></div>";
                    }
                }
            ],
            scrollable: false
        };

       $scope.loadInitialDates = function () {
           /// <summary>
           /// Sets initial date filters.
           /// </summary>
           // Set initial values for kendo datepickers.
           var from = new Date();
           from.setYear(from.getYear() - 1);

           $scope.dateContainer.toDate = new Date();
           $scope.dateContainer.fromDate = from;
       }

       $scope.clearClicked = function () {
           $scope.loadInitialDates();
           $scope.searchClicked();
       }

       $scope.searchClicked = function () {
           var from = $scope.getStartOfDayStamp($scope.dateContainer.fromDate);
           var to = $scope.getEndOfDayStamp($scope.dateContainer.toDate);
           $scope.gridContainer.grid.dataSource.transport.options.read.url = getDataUrl(from, to);
           $scope.gridContainer.grid.dataSource.read();
       }

       var getDataUrl = function (from, to) {
           var url = "/odata/DriveReports?status=Rejected &$expand=DriveReportPoints,ApprovedBy($select=FullName)";
           var filters = "&$filter=PersonId eq " + personId + " and DriveDateTimestamp ge " + from + " and DriveDateTimestamp le " + to;
           var result = url + filters;
           return result;
       }

       $scope.refreshGrid = function () {
           /// <summary>
           /// Refreshes kendo grid datasource.
           /// </summary>
           $scope.gridContainer.grid.dataSource.read();
       }

       // Contains references to kendo ui grids.
       $scope.gridContainer = {};
       $scope.dateContainer = {};

       $scope.loadInitialDates();

       // Format for datepickers.
       $scope.dateOptions = {
           format: "dd/MM/yyyy",
       };

       $scope.showRouteModal = function (routeId) {
           /// <summary>
           /// Opens show route modal.
           /// </summary>
           /// <param name="routeId"></param>
           var modalInstance = $modal.open({
               templateUrl: '/App/Admin/HTML/Reports/Modal/ShowRouteModalTemplate.html',
               controller: 'ShowRouteModalController',
               backdrop: "static",
               resolve: {
                   routeId: function () {
                       return routeId;
                   }
               }
           });
       }
   }
]);
angular.module("app.drive").controller("MyReportsController", [
   "$scope", "$modal", "$rootScope", "Report", "$timeout", function ($scope, $modal, $rootScope, Report, $timeout) {
   }
]);
angular.module("app.drive").factory("AddressFormatter", ["Address", function (Address) {
    return {
        fn: function (addressString) {
            var res = {
                StreetName: "",
                StreetNumber: "",
                ZipCode: 0,
                Town: "",
                Description: ""
            }

            var splittet = (addressString.split(","));
            if (splittet.length != 2) {
                if (splittet.length == 3) {
                    splittet = [splittet[0], splittet[2]];
                }
                else if (splittet.length == 4) {
                    splittet = [splittet[0] + "," + splittet[1], splittet[3]];
                } else {
                    return undefined;
                }
            }

            var first = splittet[0].split(" ");

            if (first.length < 2) {
                return undefined;
            }

            for (var i = 0; i < first.length - 1; i++) {
                res.StreetName += first[i];
                if (!(i + 1 == first.length - 1)) {
                    res.StreetName += " ";
                }
            }

            res.StreetNumber = first[first.length - 1];


            var second = splittet[1].split(" ");

            if (second.length < 3) {
                return undefined;
            }

            res.ZipCode = second[1];


            for (var a = 2; a < second.length; a++) {
                res.Town += second[a];
                if (!(a + 1 == second.length)) {
                    res.Town += " ";
                }
            }

            return {
                Id: null,
                PersonId: 0,
                StreetName: res.StreetName,
                StreetNumber: res.StreetNumber,
                ZipCode: parseInt(res.ZipCode),
                Town: res.Town,
                Description: null
            };
        }
    }
}])
angular.module("app.drive").service('Address', ["$resource", "$modal", function ($resource, $modal) {
    return $resource("/odata/PersonalAddresses(:id)?:query", { id: "@id", query: "@query" }, {
        "get": { method: "GET", isArray: false },
        "patch": { method: "PATCH", isArray: false },
        "post": { method: "POST", isArray: false },
        "delete": { method: "DELETE", isArray: false },
        "getAlternativeHome": {
            method: "GET",
            url: "/odata/PersonalAddresses(:id)/AlternativeHome?:query",
            isArray: true,
            transformResponse: function (data) {
                var res = angular.fromJson(data);
                if (res.error == undefined) {
                    return res.value;
                }

                var modalInstance = $modal.open({
                    templateUrl: '/App/Services/Error/ServiceError.html',
                    controller: "ServiceErrorController",
                    backdrop: "static",
                    resolve: {
                        errorMsg: function () {
                            return res.error.innererror.message;
                        }
                    }
                });
                return res;
            }
        },
        "getAlternativeWork": {
            method: "GET",
            url: "/odata/PersonalAddresses(:id)/AlternativeWork?:query",
            isArray: true,
            transformResponse: function (data) {
                var res = angular.fromJson(data);
                if (res.error == undefined) {
                    return res.value;
                }

                var modalInstance = $modal.open({
                    templateUrl: '/App/Services/Error/ServiceError.html',
                    controller: "ServiceErrorController",
                    backdrop: "static",
                    resolve: {
                        errorMsg: function () {
                            return res.error.innererror.message;
                        }
                    }
                });
                return res;
            }
        },
        "setCoordinatesOnAddress": {
            method: "POST",
            url: "/odata/Addresses/Service.SetCoordinatesOnAddress",
            isArray: true,
            transformResponse: function (data) {
                var res = angular.fromJson(data);
                if (res.error == undefined) {
                    return res.value;
                }

                var modalInstance = $modal.open({
                    templateUrl: '/App/Services/Error/ServiceError.html',
                    controller: "ServiceErrorController",
                    backdrop: "static",
                    resolve: {
                        errorMsg: function () {
                            return res.error.innererror.message;
                        }
                    }
                });
                return res;
            }
        },
        "setCoordinatesOnAddressList": {
            method: "POST",
            url: "/api/Coordinate/SetCoordinatesOnAddressList",
            isArray: true,
            transformResponse: function (data) {
                var res = angular.fromJson(data);
                return res;
            }
        },
        "GetPersonalAndStandard": {
            method: "GET",
            url: "/odata/Addresses/Service.GetPersonalAndStandard?personId=:personId",
            isArray: true,
            transformResponse: function (data) {
                var res = angular.fromJson(data);
                if (res.error == undefined) {
                    return res.value;
                }

                var modalInstance = $modal.open({
                    templateUrl: '/App/Services/Error/ServiceError.html',
                    controller: "ServiceErrorController",
                    backdrop: "static",
                    resolve: {
                        errorMsg: function () {
                            return res.error.innererror.message;
                        }
                    }
                });
                return res;
            }
        },
        "getMapStart": {
            method: "GET",
            url: "/odata/Addresses/Service.GetMapStart",
            isArray: true,
            transformResponse: function (data) {
                var res = angular.fromJson(data);
                if (res.error == undefined) {
                    var resArray = [];
                    resArray.push({ name: res.StreetName + " " + res.StreetNumber + ", " + res.ZipCode + " " + res.Town, lat: res.Latitude, lng: res.Longitude });
                    resArray.push({ name: res.StreetName + " " + res.StreetNumber + ", " + res.ZipCode + " " + res.Town, lat: res.Latitude, lng: res.Longitude });
                    return resArray;
                }

                var modalInstance = $modal.open({
                    templateUrl: '/App/Services/Error/ServiceError.html',
                    controller: "ServiceErrorController",
                    backdrop: "static",
                    resolve: {
                        errorMsg: function () {
                            return res.error.innererror.message;
                        }
                    }
                });
                return res;
            }
        },
        "AttemptCleanCachedAddress": {
            method: "POST",
            url: "/odata/Addresses/Service.AttemptCleanCachedAddress"
        },
        "GetAutoCompleteDataForCachedAddress": {
            method: "GET",
            url: "/odata/Addresses/Service.GetCachedAddresses?$select=Description,DirtyString"
        }
    });
}]);
angular.module("app.drive").service('AppLogin', ["$resource", function ($resource) {
    return $resource("/odata/AppLogin(:id)", { id: "@id"}, {
        "delete": {method: "DELETE", isArray: false},
        "post": {method: "POST", isArray: false}
    });
}]);


angular.module("app.drive").service('DriveReport', ["$resource","AddressFormatter", "PersonalAddress", "$modal", "PersonalAddressType", function ($resource, AddressFormatter, PersonalAddress, $modal, PersonalAddressType) {
    return $resource("/odata/DriveReports(:id)?:query&emailText=:emailText", { id: "@id", query: "@query", emailText: "@emailText" }, {
        "get": {
            method: "GET", isArray: false, transformResponse: function (res) {
            return angular.fromJson(res).value[0];
        } },
        "create": {
            method: "POST",
            isArray: false,
            transformRequest: function ($scope) {

                var getKmRate = function () {
                    for (var i = 0; i < $scope.KmRate.length; i++) {
                        if ($scope.KmRate[i].Id == $scope.DriveReport.KmRate) {
                            return $scope.KmRate[i];
                        }
                    }
                };

                var driveReport = {};

                // Prepare all data to  be uploaded
                driveReport.Purpose = $scope.DriveReport.Purpose;
                driveReport.DriveDateTimestamp = Math.floor($scope.DriveReport.Date.getTime() / 1000);
                driveReport.KmRate = parseFloat(getKmRate().KmRate);
                driveReport.TFCode = getKmRate().Type.TFCode;
                driveReport.IsRoundTrip = $scope.DriveReport.IsRoundTrip;

                driveReport.KilometerAllowance = $scope.DriveReport.KilometerAllowance;
                driveReport.Distance = 0;
                driveReport.AmountToReimburse = 0;

                if ($scope.showLicensePlate) {
                    driveReport.LicensePlate = $scope.DriveReport.LicensePlate;
                } else {
                    driveReport.LicensePlate = "0000000";
                }


                driveReport.PersonId = $scope.currentUser.Id;
                driveReport.FullName = $scope.currentUser.FullName;
                driveReport.Status = "Pending";
                driveReport.CreatedDateTimestamp = Math.floor(Date.now() / 1000);
                driveReport.EditedDateTimestamp = driveReport.CreatedDateTimestamp;
                driveReport.Comment = "";
                driveReport.ClosedDateTimestamp = 0;
                driveReport.ProcessedDateTimestamp = 0;
                driveReport.EmploymentId = $scope.DriveReport.Position;

                if ($scope.DriveReport.KilometerAllowance === "Read") {

                    driveReport.Distance = Number($scope.DriveReport.ReadDistance.toString().replace(",", "."));
                    if (Number(driveReport.Distance) < 0) {
                        driveReport.Distance = 0;
                    }
                    driveReport.UserComment = $scope.DriveReport.UserComment;

                    if ($scope.DriveReport.StartOrEndedAtHome === 'Started') {
                        driveReport.StartsAtHome = true;
                        driveReport.EndsAtHome = false;
                    } else if ($scope.DriveReport.StartOrEndedAtHome === 'Ended') {
                        driveReport.StartsAtHome = false;
                        driveReport.EndsAtHome = true;
                    } else if ($scope.DriveReport.StartOrEndedAtHome === 'Both') {
                        driveReport.StartsAtHome = true;
                        driveReport.EndsAtHome = true;
                    } else {
                        driveReport.StartsAtHome = false;
                        driveReport.EndsAtHome = false;
                    }
                } else {

                    driveReport.StartsAtHome = false;
                    driveReport.EndsAtHome = false;

                    driveReport.DriveReportPoints = [];

                    angular.forEach($scope.DriveReport.Addresses, function (address, key) {

                        var tempAddress = (address.Name.length != 0) ? address.Name : address.Personal;

                        var currentAddress = AddressFormatter.fn(tempAddress);

                        if (address.Latitude == undefined) {
                            address.Latitude = "";
                        }
                        if (address.Longitude == undefined) {
                            address.Longitude = "";
                        }

                        driveReport.DriveReportPoints.push({
                            StreetName: currentAddress.StreetName,
                            StreetNumber: currentAddress.StreetNumber,
                            ZipCode: currentAddress.ZipCode,
                            Town: currentAddress.Town,
                            Description: "",
                            Latitude: address.Latitude.toString(),
                            Longitude: address.Longitude.toString()
                        });
                    });

                    // go through addresses and see which is going to be saved
                    angular.forEach($scope.DriveReport.Addresses, function (address, key) {

                        if (address.Save) {
                            var personalAddress = new PersonalAddress(AddressFormatter.fn(address.Name));

                            personalAddress.PersonId = $scope.currentUser.Id;
                            personalAddress.Type = PersonalAddressType.Standard;
                            personalAddress.Longitude = "";
                            personalAddress.Latitude = "";
                            personalAddress.Description = "";

                            delete personalAddress.Id;

                            personalAddress.$save(function (res) {
                                res.PresentationString = res.StreetName + " " + res.StreetNumber + ", " + res.ZipCode + " " + res.Town,
                                res.address = res.StreetName + " " + res.StreetNumber + ", " + res.ZipCode + " " + res.Town

                                $scope.PersonalAddresses.push(res);
                                angular.forEach($scope.container.PersonalAddressDropDown, function (entry, innerKey) {
                                    entry.dataSource.read();
                                });
                                
                            });

                            
                        }
                    });

                    
                    
                }

                if (typeof $scope.DriveReport.FourKmRule !== "undefined" && $scope.DriveReport.FourKmRule.Using === true) {
                    driveReport.FourKmRule = true;
                } else {
                    driveReport.FourKmRule = false;
                }
                return JSON.stringify(driveReport);
            }
        }, "edit": {

            method: "POST",
            isArray: false,
            url: "/odata/DriveReports(:id)?:query&emailText=:emailText",
            transformRequest: function ($scope) {

                var getKmRate = function () {
                    for (var i = 0; i < $scope.KmRate.length; i++) {
                        if ($scope.KmRate[i].Id == $scope.DriveReport.KmRate) {
                            return $scope.KmRate[i];
                        }
                    }
                };

                var driveReport = {};

                // Prepare all data to  be uploaded
                driveReport.Purpose = $scope.DriveReport.Purpose;
                driveReport.DriveDateTimestamp = Math.floor($scope.DriveReport.Date.getTime() / 1000);
                driveReport.KmRate = parseFloat(getKmRate().KmRate);
                driveReport.TFCode = getKmRate().Type.TFCode;
                driveReport.IsRoundTrip = $scope.DriveReport.IsRoundTrip;

                driveReport.KilometerAllowance = $scope.DriveReport.KilometerAllowance;
                driveReport.Distance = 0;
                driveReport.AmountToReimburse = 0;

                if ($scope.showLicensePlate) {
                    driveReport.LicensePlate = $scope.DriveReport.LicensePlate;
                } else {
                    driveReport.LicensePlate = "0000000";
                }

                driveReport.ApprovedById = $scope.latestDriveReport.ApprovedById;

                driveReport.PersonId = $scope.latestDriveReport.PersonId;
                driveReport.FullName = $scope.latestDriveReport.FullName;
                driveReport.Status = $scope.latestDriveReport.Status;
                driveReport.CreatedDateTimestamp = $scope.latestDriveReport.CreatedDateTimestamp;
                driveReport.EditedDateTimestamp = Math.floor(Date.now() / 1000);
                driveReport.Comment = "";
                driveReport.ClosedDateTimestamp = $scope.latestDriveReport.ClosedDateTimestamp;
                driveReport.ProcessedDateTimestamp = $scope.latestDriveReport.ProcessedDateTimestamp;
                driveReport.EmploymentId = $scope.DriveReport.Position;

                if ($scope.DriveReport.KilometerAllowance === "Read") {

                    driveReport.Distance = Number($scope.DriveReport.ReadDistance.toString().replace(",", "."));
                    if (Number(driveReport.Distance) < 0) {
                        driveReport.Distance = 0;
                    }
                    driveReport.UserComment = $scope.DriveReport.UserComment;

                    if ($scope.DriveReport.StartOrEndedAtHome === 'Started') {
                        driveReport.StartsAtHome = true;
                        driveReport.EndsAtHome = false;
                    } else if ($scope.DriveReport.StartOrEndedAtHome === 'Ended') {
                        driveReport.StartsAtHome = false;
                        driveReport.EndsAtHome = true;
                    } else if ($scope.DriveReport.StartOrEndedAtHome === 'Both') {
                        driveReport.StartsAtHome = true;
                        driveReport.EndsAtHome = true;
                    } else {
                        driveReport.StartsAtHome = false;
                        driveReport.EndsAtHome = false;
                    }
                } else {

                    driveReport.StartsAtHome = false;
                    driveReport.EndsAtHome = false;

                    driveReport.DriveReportPoints = [];

                    angular.forEach($scope.DriveReport.Addresses, function (address, key) {

                        var tempAddress = (address.Name.length != 0) ? address.Name : address.Personal;

                        var currentAddress = AddressFormatter.fn(tempAddress);

                        if (address.Latitude == undefined) {
                            address.Latitude = "";
                        }
                        if (address.Longitude == undefined) {
                            address.Longitude = "";
                        }

                        driveReport.DriveReportPoints.push({
                            StreetName: currentAddress.StreetName,
                            StreetNumber: currentAddress.StreetNumber,
                            ZipCode: currentAddress.ZipCode,
                            Town: currentAddress.Town,
                            Description: "",
                            Latitude: address.Latitude.toString(),
                            Longitude: address.Longitude.toString()
                        });
                    });

                    // go through addresses and see which is going to be saved
                    angular.forEach($scope.DriveReport.Addresses, function (address, key) {

                        if (address.Save) {
                            var personalAddress = new PersonalAddress(AddressFormatter.fn(address.Name));

                            personalAddress.PersonId = $scope.currentUser.Id;
                            personalAddress.Type = PersonalAddressType.Standard;
                            personalAddress.Longitude = "";
                            personalAddress.Latitude = "";
                            personalAddress.Description = "";

                            delete personalAddress.Id;

                            personalAddress.$save();
                        }
                    });
                }

                if (typeof $scope.DriveReport.FourKmRule !== "undefined" && $scope.DriveReport.FourKmRule.Using === true) {
                    driveReport.FourKmRule = true;
                } else {
                    driveReport.FourKmRule = false;
                }
                return JSON.stringify(driveReport);
            }
        },
        "patch": { method: "PATCH" },
        "getLatest": {
            method: "GET",
            isArray: false,
            url: "/odata/DriveReports/Service.GetLatestReportForUser?personId=:id",
            transformResponse: function (data) {
                var res = angular.fromJson(data);
                return res;
            }
        },
        "getWithPoints": {
            method: "GET",
            isArray: false,
            url: "/odata/DriveReports?$filter=Id eq :id &$expand=DriveReportPoints",
            transformResponse: function(data) {
                var res = angular.fromJson(data);
                if (res.error == undefined) {
                    return res.value[0];
                }

                var modalInstance = $modal.open({
                    templateUrl: '/App/Services/Error/ServiceError.html',
                    controller: "ServiceErrorController",
                    backdrop: "static",
                    resolve: {
                        errorMsg: function () {
                            return res.error.innererror.message;
                        }
                    }
                });
                return res;
            }
        }
    });
}]);
angular.module("app.drive").service('LicensePlate', ["$resource", function ($resource) {
    return $resource("/odata/LicensePlates(:id)", { id: "@id" }, {
        "get": {
            url: "/odata/LicensePlates?$filter=PersonId eq :id",
            method: "GET", transformResponse: function (data) {
                var res = angular.fromJson(data);
                if (res.error == undefined) {
                    return res.value;
                }

                var modalInstance = $modal.open({
                    templateUrl: '/App/Services/Error/ServiceError.html',
                    controller: "ServiceErrorController",
                    backdrop: "static",
                    resolve: {
                        errorMsg: function () {
                            return res.error.innererror.message;
                        }
                    }
                });
                return res;
            },
            isArray: true
        },
        "delete": { method: "DELETE" },
        "patch": { method : "PATCH"},
       
    });
}]);
angular.module("app.drive").service("MkColumnFormatter", [function () {
    return {
        format: function (data) {
            
            if (data.KilometerAllowance === "CalculatedWithoutExtraDistance") {
                if (data.StartsAtHome || data.EndsAtHome) {
                    return "<div class='inline margin-left-5' kendo-tooltip k-content=\"'Der er kørt til og/eller fra bopælsadressen,<br>men anvendt Beregnet uden merkørsel'\"><i class='fa fa-minus'></i></div>";
                }
            } else {

                if (data.StartsAtHome || data.EndsAtHome) {
                  return "<div class='inline margin-left-5' kendo-tooltip k-content=\"'Der er kørt til og/eller fra bopælsadressen.<br/> Der er fratrukket merkørsel.'\"><i class='fa fa-check'></i></div>";
                }
            }
            return "";

        }
    }
}])
angular.module("app.drive").service('PersonalAddress', ["$resource", function ($resource) {
    return $resource("/odata/PersonalAddresses(:id)", { id: "@id" }, {
        "get": { method: "GET", isArray: false },
        "patch": { method: "PATCH" },
        "delete": { method: "DELETE" },
        "post": { method: "POST" },
        "GetHomeForUser": {
            method: "GET",
            isArray: false,
            url: "/odata/PersonalAddresses/Service.GetHome?personId=:id",
            transformResponse: function (data) {
                return angular.fromJson(data).value[0];

            }
        },
        "GetRealHomeForUser": {
            method: "GET",
            isArray: false,
            url: "/odata/PersonalAddresses/Service.GetRealHome?personId=:id",
            transformResponse: function (data) {
                var res = angular.fromJson(data);
                return res;

            }
        },
        "GetAlternativeHomeForUser": {
            method: "GET",
            isArray: false,
            url: "/odata/PersonalAddresses/Service.GetAlternativeHome?personId=:id",
            transformResponse: function (data) {
                var res = angular.fromJson(data);
                return res;

            }
        }
    });
}]);
angular.module("app.drive").service('PersonalAddressType', function () {
    return {
        Standard: "Standard",
        Home: "Home",
        Work: "Work",
        AlternativeHome: "AlternativeHome",
        AlternativeWork: "AlternativeWork",
        OldHome: "OldHome"
}
});




angular.module("app.drive").service('PersonalRoute', ["$resource", function ($resource) {
    return $resource("/odata/PersonalRoutes(:id)?:query", { id: "@id", query: "@query" }, {
        "get": { method: "GET", isArray: false },
        "delete": { method: "DELETE", isArray: false },
        "getForUser": {
            method: "GET",
            isArray: true,
            url: "/odata/PersonalRoutes?$filter=PersonId eq :id &$expand=Points",
            transformResponse: function(res) {
                return angular.fromJson(res).value;
            }
        },
    });
}]);
angular.module("app.drive").service('Point', ["$resource", function ($resource) {
    return $resource("/odata/Points(:id)?:query", { id: "@id", query: "@query" }, {
        "get": { method: "GET", isArray: false, transformResponse: function(data) {
            var res = angular.fromJson(data);
            if (res.error == undefined) {
                return res;
            }

            var modalInstance = $modal.open({
                templateUrl: '/App/Services/Error/ServiceError.html',
                controller: "ServiceErrorController",
                backdrop: "static",
                resolve: {
                    errorMsg: function () {
                        return res.error.innererror.message;
                    }
                }
            });
            return res;
        } },
        "patch": { method: "PATCH", isArray: false },
        "post": { method: "POST", isArray: false }
    });
}]);
angular.module("app.drive").service("Rate", ["$resource", function ($resource) {
    return $resource("/odata/Rates(:id)", { id: "@id" }, {
        "get": {
            method: "GET",
            isArray: true,
            transformResponse: function(data) {
                var res = angular.fromJson(data);
                if (res.error == undefined) {
                    return res.value;
                }

                var modalInstance = $modal.open({
                    templateUrl: '/App/Services/Error/ServiceError.html',
                    controller: "ServiceErrorController",
                    backdrop: "static",
                    resolve: {
                        errorMsg: function () {
                            return res.error.innererror.message;
                        }
                    }
                });
                return res;
            }
        },
        "ThisYearsRates": {
            method: "GET",
            isArray: true,
            transformResponse: function(data) {
                var res = angular.fromJson(data);
                if (res.error == undefined) {
                    return res.value;
                }

                var modalInstance = $modal.open({
                    templateUrl: '/App/Services/Error/ServiceError.html',
                    controller: "ServiceErrorController",
                    backdrop: "static",
                    resolve: {
                        errorMsg: function () {
                            return res.error.innererror.message;
                        }
                    }
                });
                return res;
            },
            url: "/odata/Rates/Service.ThisYearsRates?$expand=Type"
        },
        "post": {method: "POST"}
    });
}]);
angular.module("app.drive").service("RateType", ["$resource", function ($resource) {
    return $resource("/odata/RateTypes(:id)", { id: "@id" }, {
        "get": {
            method: "GET",
            isArray: true,
            transformResponse: function (data) {
                var res = angular.fromJson(data);
                if (res.error == undefined) {
                    return res.value;
                }

                var modalInstance = $modal.open({
                    templateUrl: '/App/Services/Error/ServiceError.html',
                    controller: "ServiceErrorController",
                    backdrop: "static",
                    resolve: {
                        errorMsg: function () {
                            return res.error.innererror.message;
                        }
                    }
                });
                return res;
            }
        },
        "getAll": {
            method: "GET",
            isArray: true,
            transformResponse: function (data) {
                var res = angular.fromJson(data).value;
                return res;
            }
        },
       "post": {method: "POST"}
    });
}]);
﻿angular.module("app.drive").service('Report', ["$resource", function ($resource) {
    return $resource("/odata/DriveReports(:id)", { id: "@id", emailText: "@emailText" }, {
        "get": { method: "GET", isArray: true },
        "patch": {
            method: "PATCH",
            isArray: true, 
            url: "/odata/DriveReports(:id)?emailText=:emailText",
        },
        "getOwner": { 
            url: "/odata/DriveReports?$filter=Id eq :id&$select=Person&$expand=Person",
            method: "GET", 
            isArray: false, 
            transformResponse: function(data){
                var res = angular.fromJson(data).value[0].Person;
                return res; 
            } 
        },
		"delete" : {method: "DELETE", isArray: true}
    });
}]);
angular.module("app.drive").service("RouteColumnFormatter", [function () {
    return {
        format: function (data) {
            
            var tooltipContent = "";
            var gridContent = "";
            if (data.DriveReportPoints != null && data.DriveReportPoints != undefined && data.DriveReportPoints.length > 0) {
                angular.forEach(data.DriveReportPoints, function (point, key) {
                    if (key != data.DriveReportPoints.length - 1) {
                        tooltipContent += point.StreetName + " " + point.StreetNumber + ", " + point.ZipCode + " " + point.Town + "<br/>";
                        gridContent += point.Town + "<br/>";
                    } else {
                        tooltipContent += point.StreetName + " " + point.StreetNumber + ", " + point.ZipCode + " " + point.Town;
                        gridContent += point.Town;
                    }
                });
            } else {
                tooltipContent = data.UserComment;
            }
            gridContent = "<i class='fa fa-road fa-2x'></i>";
            var toolTip = "<div class='inline margin-left-5' kendo-tooltip k-content=\"'" + tooltipContent + "'\">" + gridContent + "</div>";
            var globe = "<div class='inline pull-right margin-right-5' kendo-tooltip k-content=\"'Se rute på kort'\"><a ng-click='showRouteModal(" + data.Id + ")'><i class='fa fa-globe fa-2x'></i></a></div>";
            if (data.IsOldMigratedReport) {
                globe = "<div class='inline pull-right margin-right-5' kendo-tooltip k-content=\"'Denne indberetning er overført fra eIndberetning og der kan ikke genereres en rute på et kort'\"><i class='fa fa-circle-thin fa-2x'></i></a></div>";
            }
            var roundTrip = "";
            if (data.IsRoundTrip) {
                roundTrip = "<div class='inline margin-left-5' kendo-tooltip k-content=\"'Ruten er tur/retur'\"><i class='fa fa-exchange fa-2x'></i></div>";
            }

            var edited = "";

            if (data.CreatedDateTimestamp < data.EditedDateTimestamp) {
                edited = "<div class='inline pull-right margin-right-5' kendo-tooltip k-content=\"'Denne indberetning er blevet redigeret'\"><i class='fa fa-pencil fa-2x'></i></div>";
            }

            var result = toolTip + roundTrip + globe;
            var comment = data.UserComment != null ? data.UserComment : "Ingen kommentar angivet";
            

            var commentToolTip = "";
            if(comment != "Ingen kommentar angivet" && comment != "Ingen kommentar indtastet"){
                commentToolTip =  "<div class='inline margin-right-5 pull-right' kendo-tooltip k-content=\"'" + comment + "'\"><i class=\"fa fa-2x fa-comment-o\"></i></div>";
            }

            if (data.IsFromApp) {
                var fromAppTooltip = "<div class='inline margin-left-5'>Indberettet fra mobil app</div>" + commentToolTip;
                if (data.DriveReportPoints.length > 1) {
                    result = toolTip + roundTrip + globe + fromAppTooltip + edited;
                } else {
                    // Set road tooltip to just contain "Aflæst manuelt"
                    toolTip = "<div class='inline margin-left-5' kendo-tooltip k-content=\"'" + "Aflæst manuelt" + "'\">" + gridContent + "</div>";
                    result = toolTip + roundTrip + fromAppTooltip + edited;
                }
                return result;
            }

            if (data.KilometerAllowance != "Read") {
                    return result;
            } else {
                    return "<div class='inline' kendo-tooltip k-content=\"'" + comment + "'\">Aflæst manuelt</div>";
            }

        }
    }
}])
angular.module("app.drive").service('RouteContainer', ["$resource", function ($resource) {
    return $resource("/odata/RouteContainer(:id)", { id: "@id" }, {
        "get": { method: "GET", isArray: false }
    });
}]);
angular.module("app.drive").service('Route', ["$resource", function ($resource) {
    return $resource("/odata/PersonalRoutes(:id)?$expand=Points&:query", { id: "@id", query: "@query" }, {
        "get": { method: "GET", isArray: false },
        "getSingle": {
            method: "GET",
            isArray: false,
            url: "/odata/PersonalRoutes?$expand=Points &$filter=Id eq :id",
            transformResponse: function (data) {
                var res = angular.fromJson(data);
                if (res.error == undefined) {
                    return res.value[0];
                }

                var modalInstance = $modal.open({
                    templateUrl: '/App/Services/Error/ServiceError.html',
                    controller: "ServiceErrorController",
                    backdrop: "static",
                    resolve: {
                        errorMsg: function () {
                            return res.error.innererror.message;
                        }
                    }
                });
                return res;
            }
        },
        "patch": { method: "PATCH", isArray: false },
        "post": {
            method: "POST",
            isArray: false,
            url: "/odata/PersonalRoutes"
        },
        "delete": { method: "DELETE", isArray: false }
    });
}]);
angular.module("app.drive").service("SmartAdresseSource", function () {
    return {
        type: "json",
        minLength: 3,
        serverFiltering: true,
        crossDomain: true,
        transport: {
            read: {
                url: function (item) {
                    var req = 'https://dawa.aws.dk/adgangsadresser/autocomplete?q=' + encodeURIComponent(item.filter.filters[0].value);
                    return req;
                },
                dataType: "jsonp",
                data: {
                   
                }
            }
        },
        schema: {
            data: function (data) {
                return data; // <-- The result is just the data, it doesn't need to be unpacked.
            }
        },
    }
});
angular.module("app.drive").service('StandardAddress', ["$resource", function ($resource) {
    return $resource("/odata/Addresses(:id)", { id: "@id" }, {
        "get": { method: "GET", isArray: false },
        "delete": { method: "DELETE", isArray: false },
        "patch": { method: "PATCH", isArray: false },
        "post": { method: "POST", isArray: false },
        "GetStandard": {
            method: "GET",
            url: "/odata/Addresses/Service.GetStandard",
            isArray: true,
            transformResponse: function (data) {
                var res = angular.fromJson(data);
                if (res.error == undefined) {
                    return res.value;
                }

                var modalInstance = $modal.open({
                    templateUrl: '/App/Services/Error/ServiceError.html',
                    controller: "ServiceErrorController",
                    backdrop: "static",
                    resolve: {
                        errorMsg: function () {
                            return res.error.innererror.message;
                        }
                    }
                });
                return res;
            }
        }
    });
}]);


angular.module("app.drive").service('Token', ["$resource", function ($resource) {
    return $resource("/odata/MobileToken(:id)", { id: "@id" }, {
        "delete": { method: "DELETE" }
    });
}]);
angular.module("app.drive").controller('AlternativeAddressController', ["$scope", "SmartAdresseSource", "$rootScope", "$timeout", "PersonEmployments", "AddressFormatter", "Address", "NotificationService", "PersonalAddress", function ($scope, SmartAdresseSource, $rootScope, $timeout, PersonEmployments, AddressFormatter, Address, NotificationService, PersonalAddress) {

    $scope.employments = $rootScope.CurrentUser.Employments;
    $scope.homeAddress = "";
    $scope.alternativeHomeAddress = {};
    $scope.alternativeHomeAddress.string = "";

    var homeAddressIsDirty = false;
    var workAddressDirty = [];
    var workDistanceDirty = [];

    PersonalAddress.GetRealHomeForUser({ id: $rootScope.CurrentUser.Id }).$promise.then(function (res) {
        $scope.homeAddress = res.StreetName + " " + res.StreetNumber + ", " + res.ZipCode + " " + res.Town;
    });

    $scope.AlternativeWorkAddressHelpText = $rootScope.HelpTexts.AlternativeWorkAddressHelpText.text;
    $scope.AlternativeWorkDistanceHelpText = $rootScope.HelpTexts.AlternativeWorkDistanceHelpText.text;

    PersonalAddress.GetAlternativeHomeForUser({ id: $rootScope.CurrentUser.Id }).$promise.then(function (res) {
        if (!(res.StreetNumber == undefined)) {
            $scope.alternativeHomeAddress = res;
            $scope.alternativeHomeAddress.string = res.StreetName + " " + res.StreetNumber + ", " + res.ZipCode + " " + res.Town;
        }
    });
    $scope.Number = Number;
    $scope.toString = toString;
    $scope.replace = String.replace;
    $scope.alternativeWorkAddresses = [];
    $scope.alternativeWorkDistances = [];

    var loadLocalModel = function () {
        /// <summary>
        /// Fills local model variables with data.
        /// </summary>
        angular.forEach($scope.employments, function (empl, key) {
            if (empl.AlternativeWorkAddress != null) {
                var addr = empl.AlternativeWorkAddress;
                $scope.alternativeWorkAddresses[key] = addr.StreetName + " " + addr.StreetNumber + ", " + addr.ZipCode + " " + addr.Town;
            } if (empl.WorkDistanceOverride != "" && empl.WorkDistanceOverride != null) {
                $scope.alternativeWorkDistances[key] = empl.WorkDistanceOverride;
            }
        });
    }

    loadLocalModel();

      $scope.alternativeWorkDistanceChanged = function ($index) {
        /// <summary>
        /// Sets the address to be dirty when changed. This is used when prompting the user when leaving a page with unsaved changes.
        /// </summary>
        /// <param name="$index"></param>
        workDistanceDirty[$index] = true;
    }

    $scope.alternativeWorkAddressChanged = function ($index) {
        /// <summary>
        /// Sets the distance to be dirty when changed. This is used when prompting the user when leaving a page with unsaved changes.
        /// </summary>
        /// <param name="$index"></param>
        workAddressDirty[$index] = true;
    }

    var isAddressSet = function (index) {
        return ($scope.alternativeWorkAddresses[index] != "" && $scope.alternativeWorkAddresses[index] != undefined);
    }

    var isDistanceSet = function (index) {
        return ($scope.alternativeWorkDistances[index] != "" && $scope.alternativeWorkDistances[index] != undefined && $scope.alternativeWorkDistances > 0);
    }

    $scope.saveAlternativeWorkAddress = function (index) {
        // Timeout to allow the address to be written to the model.
        $timeout(function () {
            handleSaveAlternativeWork(index);
        });
    }

    var handleSavingAlternativeAddress = function(index){
        // Save alternative address
        var addr = AddressFormatter.fn($scope.alternativeWorkAddresses[index]);
        // No alternative address exists. Post.
        if ($scope.employments[index].AlternativeWorkAddress == null || $scope.employments[index].AlternativeWorkAddress == undefined) {
            Address.post({
                StreetName: addr.StreetName,
                StreetNumber: addr.StreetNumber,
                Town: addr.Town,
                ZipCode: addr.ZipCode,
                PersonId: $rootScope.CurrentUser.Id,
                Description: "Afvigende " + $scope.employments[index].OrgUnit.LongDescription,
                Longitude: "",
                Latitude: "",
                Type: "AlternativeWork"
            }).$promise.then(function (res) {
                workAddressDirty[index] = false;
                $scope.employments[index].AlternativeWorkAddress = res;
                $scope.employments[index].AlternativeWorkAddressId = res.Id;

                PersonEmployments.patchEmployment({ id: $scope.employments[index].Id }, { AlternativeWorkAddressId: res.Id }).$promise.then(function () {
                    NotificationService.AutoFadeNotification("success", "", "Afvigende arbejdsadresse oprettet.");
                    $rootScope.$emit('PersonalAddressesChanged');
                });
            });
        }
            // Alternative Address already exists. Patch it.
        else {
            Address.patch({ id: $scope.employments[index].AlternativeWorkAddressId }, {
                StreetName: addr.StreetName,
                StreetNumber: addr.StreetNumber,
                Town: addr.Town,
                ZipCode: addr.ZipCode,
                Longitude: "",
                Latitude: "",
            }).$promise.then(function (res) {
                $scope.employments[index].AlternativeWorkAddress = res;
                $scope.employments[index].AlternativeWorkAddressId = res.Id;
                workAddressDirty[index] = false;
                NotificationService.AutoFadeNotification("success", "", "Afvigende arbejdsadresse redigeret.");
                $rootScope.$emit('PersonalAddressesChanged');
            });
        }
    }

    var handleSavingAlternativeDistance = function (index) {
        if($scope.alternativeWorkDistances[index] == ""){
            $scope.alternativeWorkDistances[index] = 0;
        }
        PersonEmployments.patchEmployment({ id: $scope.employments[index].Id },
           {
               WorkDistanceOverride: $scope.alternativeWorkDistances[index],
           }).$promise.then(function () {

               workDistanceDirty[index] = false;
               $scope.employments[index].WorkDistanceOverride = $scope.alternativeWorkDistances[index];
               NotificationService.AutoFadeNotification("success", "", "Afvigende afstand mellem hjem og arbejde gemt.");
           });
    }

    var handleSaveAlternativeWork = function (index) {
        /// <summary>
        /// Handles saving alternative work address.
        /// </summary>
        /// <param name="index"></param>

        if($scope.alternativeWorkDistances[index] != undefined){
            if ($scope.alternativeWorkDistances[index].toString().indexOf(".") > -1 || $scope.alternativeWorkDistances[index].toString().indexOf(",") > -1) {
                  // Show popup if distance contains , or .
                  NotificationService.AutoFadeNotification("warning", "", "Afvigende km på ikke indeholde komma eller punktum.");
                  return;
            }
        }
        if(isAddressSet(index)){
            handleSavingAlternativeAddress(index);
        }
        handleSavingAlternativeDistance(index);

    }


    $scope.clearWorkClicked = function (index) {
        /// <summary>
        /// Clears alternative work address.
        /// </summary>
        /// <param name="index"></param>
        PersonEmployments.patchEmployment({ id: $scope.employments[index].Id }, {
            WorkDistanceOverride: 0,
            AlternativeWorkAddress: null,
            AlternativeWorkAddressId: null,
        }).$promise.then(function () {
            workAddressDirty[index] = false;
            workDistanceDirty[index] = false;
            $scope.alternativeWorkDistances[index] = 0;
            $scope.alternativeWorkAddresses[index] = "";
            if ($scope.employments[index].AlternativeWorkAddressId != null) {
                Address.delete({ id: $scope.employments[index].AlternativeWorkAddressId }).$promise.then(function () {
                    $rootScope.$emit('PersonalAddressesChanged');
                    $scope.employments[index].AlternativeWorkAddress = null;
                    $scope.employments[index].AlternativeWorkAddressId = null;
                    NotificationService.AutoFadeNotification("success", "", "Afvigende afstand og adresse slettet.");
                });
            } else {
                $rootScope.$emit('PersonalAddressesChanged');
                $scope.employments[index].AlternativeWorkAddress = null;
                $scope.employments[index].AlternativeWorkAddressId = null;
                NotificationService.AutoFadeNotification("success", "", "Afvigende afstand og adresse slettet.");
            }

        });


    }

    $scope.saveAlternativeHomeAddress = function () {
        $timeout(function () {
            handleSaveAltHome();
        });
    }

    var handleSaveAltHome = function () {
        /// <summary>
        /// Handles saving alternative home address.
        /// </summary>
        if ($scope.alternativeHomeAddress.string != undefined && $scope.alternativeHomeAddress.string != null && $scope.alternativeHomeAddress.string != "") {
            var addr = AddressFormatter.fn($scope.alternativeHomeAddress.string);
            if ($scope.alternativeHomeAddress.Id != undefined) {
                PersonalAddress.patch({ id: $scope.alternativeHomeAddress.Id }, {
                    StreetName: addr.StreetName,
                    StreetNumber: addr.StreetNumber,
                    ZipCode: addr.ZipCode,
                    Town: addr.Town,
                    Latitude: "",
                    Longitude: "",
                    Description: "Afvigende hjemmeadresse",
                    Type: "AlternativeHome"
                }).$promise.then(function () {
                    NotificationService.AutoFadeNotification("success", "", "Afvigende hjemmeadresse redigeret.");
                    homeAddressIsDirty = false;
                    $rootScope.$emit('PersonalAddressesChanged');
                });
            } else {
                PersonalAddress.post({
                    StreetName: addr.StreetName,
                    StreetNumber: addr.StreetNumber,
                    ZipCode: addr.ZipCode,
                    Town: addr.Town,
                    Latitude: "",
                    Longitude: "",
                    PersonId: $rootScope.CurrentUser.Id,
                    Type: "AlternativeHome",
                    Description: "Afvigende hjemmeadresse"
                }).$promise.then(function (res) {
                    $scope.alternativeHomeAddress = res;
                    $scope.alternativeHomeAddress.string = res.StreetName + " " + res.StreetNumber + ", " + res.ZipCode + " " + res.Town;
                    NotificationService.AutoFadeNotification("success", "", "Afvigende hjemmeadresse oprettet.");
                    homeAddressIsDirty = false;
                    $rootScope.$emit('PersonalAddressesChanged');
                });
            }
        } else if ($scope.alternativeHomeAddress.string == "" && $scope.alternativeHomeAddress.Id != undefined) {
            $scope.clearHomeClicked();
        }
    }

    $scope.clearHomeClicked = function () {
        /// <summary>
        /// Clears alternative home address.
        /// </summary>
        $scope.alternativeHomeAddress.string = "";
        if ($scope.alternativeHomeAddress.Id != undefined) {
            PersonalAddress.delete({ id: $scope.alternativeHomeAddress.Id }).$promise.then(function () {
                $scope.alternativeHomeAddress = null;
                NotificationService.AutoFadeNotification("success", "", "Afvigende hjemmeadresse slettet.");
                $rootScope.$emit('PersonalAddressesChanged');
            });
        } else {
            NotificationService.AutoFadeNotification("success", "", "Afvigende hjemmeadresse slettet.");
        }
    }

    $scope.homeAddressChanged = function () {
        homeAddressIsDirty = true;
    }

    var checkShouldPrompt = function () {
        /// <summary>
        /// Return true if there are unsaved changes on the page. 
        /// </summary>
        var returnVal = false;
        if ($scope.alternativeHomeAddress != undefined) {
            if (homeAddressIsDirty === true && $scope.alternativeHomeAddress.string != $scope.alternativeHomeAddress.StreetName + " " + $scope.alternativeHomeAddress.StreetNumber + ", " + $scope.alternativeHomeAddress.ZipCode + " " + $scope.alternativeHomeAddress.Town) {
                returnVal = true;
            }
        }
        angular.forEach(workAddressDirty, function (value, key) {
            if (value == true) {
                returnVal = true;
            }
        });
        angular.forEach(workDistanceDirty, function (value, key) {
            if (value == true) {
                returnVal = true;
            }
        });
        return returnVal;
    }

    // Alert the user when navigating away from the page if there are unsaved changes.
    $scope.$on('$stateChangeStart', function (event) {
        if (checkShouldPrompt() === true) {
            var answer = confirm("Du har lavet ændringer på siden, der ikke er gemt. Ønsker du at kassere disse ændringer?");
            if (!answer) {
                event.preventDefault();
            }
        }
    });

    window.onbeforeunload = function (e) {
        if (checkShouldPrompt() === true) {
            return "Du har lavet ændringer på siden, der ikke er gemt. Ønsker du at kassere disse ændringer?";
        }
    };

    $scope.$on('$destroy', function () {
        /// <summary>
        /// Unregister refresh event handler when leaving the page.
        /// </summary>
        window.onbeforeunload = undefined;
    });

    $scope.SmartAddress = SmartAdresseSource;

}]);
angular.module("app.drive").controller("SettingsController", [
    "$scope", "$modal", "Person", "LicensePlate", "PersonalRoute", "Point", "Address", "Route", "AddressFormatter", "$http", "NotificationService", "Token", "SmartAdresseSource", "$rootScope", "$timeout", "AppLogin",
    function ($scope, $modal, Person, LicensePlate, Personalroute, Point, Address, Route, AddressFormatter, $http, NotificationService, Token, SmartAdresseSource, $rootScope, $timeout, AppLogin) {
        $scope.gridContainer = {};
        $scope.isCollapsed = true;
        $scope.licenseplates = [];
        $scope.newLicensePlate = "";
        $scope.newLicensePlateDescription = "";
        $scope.workDistanceOverride = 0;
        $scope.routes = [];
        $scope.addresses = [];
        $scope.tokens = [];
        $scope.isCollapsed = true;
        $scope.tokenIsCollapsed = true;
        $scope.newTokenDescription = "";

        $scope.mobileTokenHelpText = $rootScope.HelpTexts.MobileTokenHelpText.text;
        $scope.primaryLicensePlateHelpText = $rootScope.HelpTexts.PrimaryLicensePlateHelpText.text;
        $scope.AlternativeHomeAddressHelpText = $rootScope.HelpTexts.AlternativeHomeAddressHelpText.text;


        var personId = $rootScope.CurrentUser.Id;
        $scope.currentPerson = $rootScope.CurrentUser;
        $scope.mailAdvice = $scope.currentPerson.RecieveMail;

        $scope.showMailNotification = $rootScope.CurrentUser.IsLeader || $rootScope.CurrentUser.IsSubstitute;

        // Used for alternative address template
        $scope.employments = $rootScope.CurrentUser.Employments;

        // Contains references to kendo ui grids.
        $scope.gridContainer = {};





        //Load licenseplates
        $scope.licenseplates = $rootScope.CurrentUser.LicensePlates;

        //Funtionalitet til opslag af adresser
        $scope.SmartAddress = SmartAdresseSource;



        $scope.saveNewLicensePlate = function () {
            /// <summary>
            /// Handles saving of new license plate.
            /// </summary>
            var plateWithoutSpaces = $scope.newLicensePlate.replace(/ /g, "");
            if (plateWithoutSpaces.length < 2 || plateWithoutSpaces.length > 7) {
                NotificationService.AutoFadeNotification("danger", "", "Nummerpladens længde skal være mellem 2 og 7 tegn (Mellemrum tæller ikke med)");
                return;
            }

            var newPlate = new LicensePlate({
                Plate: $scope.newLicensePlate,
                Description: $scope.newLicensePlateDescription,
                PersonId: personId
            });

            newPlate.$save(function (data) {
                $scope.licenseplates.push(data);
                $scope.licenseplates.sort(function (a, b) {
                    return a.Id > b.Id;
                });
                $scope.newLicensePlate = "";
                $scope.newLicensePlateDescription = "";

                NotificationService.AutoFadeNotification("success", "", "Ny nummerplade blev gemt");

                // Reload CurrentUser to update LicensePlates in DrivingController
                Person.GetCurrentUser().$promise.then(function (data) {
                    $rootScope.CurrentUser = data;
                });

            }, function () {
                NotificationService.AutoFadeNotification("danger", "", "Nummerplade blev ikke gemt");
            });
        };

        $scope.openConfirmDeleteLicenseModal = function (plate) {
            /// <summary>
            /// Opens confirm delete license modal.
            /// </summary>
            /// <param name="token"></param>
            var modalInstance = $modal.open({
                templateUrl: '/App/Drive/Settings/ConfirmDeleteLicenseModal.html',
                controller: 'AppLoginModalController',
                backdrop: 'static',
            });

            modalInstance.result.then(function () {
                $scope.deleteLicensePlate(plate);
            }, function () {

            });
        };


        $scope.deleteLicensePlate = function (plate) {
            /// <summary>
            /// Delete existing license plate.
            /// </summary>
            /// <param name="plate"></param>
            LicensePlate.delete({ id: plate.Id }, function () {
                NotificationService.AutoFadeNotification("success", "", "Nummerplade blev slettet");
                //Load licenseplates again
                LicensePlate.get({ id: personId }, function (data) {
                    $scope.licenseplates = data;
                });
                // Reload CurrentUser to update LicensePlates in DrivingController
                Person.GetCurrentUser().$promise.then(function (data) {
                    $rootScope.CurrentUser = data;
                });
            }), function () {
                NotificationService.AutoFadeNotification("danger", "", "Nummerplade blev ikke slettet");
            };
        }


        $scope.setReceiveMail = function (receiveMails) {
            /// <summary>
            /// Inverts choice of mail notification.
            /// </summary>

            $timeout(function () {
                var newPerson = new Person({
                    RecieveMail: receiveMails
                });

                newPerson.$patch({ id: personId }, function () {
                    $scope.mailAdvice = receiveMails;
                    $rootScope.CurrentUser.RecieveMail = receiveMails;
                    NotificationService.AutoFadeNotification("success", "", "Valg om modtagelse af mails blev gemt");
                }), function () {

                    NotificationService.AutoFadeNotification("danger", "", "Valg om modtagelse af mails blev ikke gemt");
                };
            });


        }

        $scope.loadGrids = function (id) {
            /// <summary>
            /// Loads personal routes and addresses to kendo grid datasources.
            /// </summary>
            /// <param name="id"></param>
            $scope.personalRoutes = {
                dataSource: {
                    type: "odata-v4",
                    transport: {
                        read: {
                            beforeSend: function(req) {
                                req.setRequestHeader('Accept', 'application/json;odata=fullmetadata');
                            },
                            url: "odata/PersonalRoutes()?$filter=PersonId eq " + id + "&$expand=Points",
                            dataType: "json",
                            cache: false
                        }
                    },
                    pageSize: 20,
                    serverPaging: true,
                    serverSorting: true
                },
                sortable: true,
                pageable: {
                    messages: {
                        display: "{0} - {1} af {2} personlige ruter", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                        empty: "Ingen personlige ruter at vise",
                        page: "Side",
                        of: "af {0}", //{0} is total amount of pages
                        itemsPerPage: "personlige ruter pr. side",
                        first: "Gå til første side",
                        previous: "Gå til forrige side",
                        next: "Gå til næste side",
                        last: "Gå til sidste side",
                        refresh: "Genopfrisk",
                    },
                    pageSizes: [5, 10, 20, 30, 40, 50, 100, 150, 200]
                },
                dataBound: function() {
                    this.expandRow(this.tbody.find("tr.k-master-row").first());
                },
                columns: [
                    {
                        field: "Description",
                        title: "Beskrivelse"
                    },
                    {
                        field: "Points",
                        template: function(data) {
                            var temp = [];

                            angular.forEach(data.Points, function(value, key) {
                                if (value.PreviousPointId == undefined) {
                                    this.push(value.StreetName + " " + value.StreetNumber + ", " + value.ZipCode + " " + value.Town);
                                }

                            }, temp);

                            return temp;
                        },
                        title: "Fra"
                    },
                    {
                        field: "Points",
                        template: function(data) {
                            var temp = [];

                            angular.forEach(data.Points, function(value, key) {
                                if (value.NextPointId == null) {
                                    this.push(value.StreetName + " " + value.StreetNumber + ", " + value.ZipCode + " " + value.Town);
                                }

                            }, temp);

                            return temp;
                        },
                        title: "Til"
                    },
                    {
                        title: "Via",
                        field: "Points",
                        width: 50,
                        template: function(data) {
                            var tooltipContent = "";
                            var gridContent = data.Points.length - 2;
                            angular.forEach(data.Points, function(point, key) {
                                if (key != 0 && key != data.Points.length - 1) {
                                    tooltipContent += point.StreetName + " " + point.StreetNumber + ", " + point.ZipCode + " " + point.Town + "<br/>";
                                }
                            });

                            var result = "<div kendo-tooltip k-content=\"'" + tooltipContent + "'\">" + gridContent + "</div>";
                            return result;
                        }
                    },
                    {
                        field: "Id",
                        title: "Muligheder",
                        template: "<a ng-click='openRouteEditModal(${Id})'>Rediger</a> | <a ng-click='openRouteDeleteModal(${Id})'>Slet</a>"
                    }
                ]
            };

            $scope.personalAddresses = {
                dataSource: {
                    type: "odata-v4",
                    transport: {
                        read: {
                            beforeSend: function(req) {
                                req.setRequestHeader('Accept', 'application/json;odata=fullmetadata');
                            },
                            url: "odata/PersonalAddresses()?$filter=PersonId eq " + personId + " and Type ne Core.DomainModel.PersonalAddressType'OldHome'",
                            dataType: "json",
                            cache: false
                        }
                    },
                    pageSize: 5,
                    serverPaging: false,
                    serverSorting: true
                },
                sortable: true,
                pageable: {
                    messages: {
                        display: "{0} - {1} af {2} personlige adresser", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                        empty: "Ingen personlige adresser at vise",
                        page: "Side",
                        of: "af {0}", //{0} is total amount of pages
                        itemsPerPage: "personlige adresser pr. side",
                        first: "Gå til første side",
                        previous: "Gå til forrige side",
                        next: "Gå til næste side",
                        last: "Gå til sidste side",
                        refresh: "Genopfrisk",
                    },
                    pageSizes: [5, 10, 20, 30, 40, 50, 100, 150, 200]
                },
                dataBound: function() {
                    this.expandRow(this.tbody.find("tr.k-master-row").first());
                },
                sort: {
                    field: "Description",
                    dir: "asc"
                },
                columns: [
                    {
                        field: "Description",
                        title: "Beskrivelse",
                        template: function(data) {
                            if (data.Type == "Home") {
                                return "Hjemmeadresse";
                            } else return data.Description;
                        }
                    },
                    {
                        field: "Id",
                        template: function(data) {
                            return (data.StreetName + " " + data.StreetNumber + ", " + data.ZipCode + " " + data.Town);
                        },
                        title: "Adresse"
                    },
                    {
                        field: "Id",
                        title: "Muligheder",
                        template: function(data) {
                            if (data.Type == "Standard") {
                                return "<a ng-click='openAddressEditModal(" + data.Id + ")'>Rediger</a> | <a ng-click='openAddressDeleteModal(" + data.Id + ")'>Slet</a>";
                            }
                            return "";
                        }
                    }
                ]
            };
        }

        $rootScope.$on('PersonalAddressesChanged', function () {
            // Event gets emitted from AlternativeAddressController when the user changes alternative home or work addresses.
            $scope.updatePersonalAddresses();
        });

        $scope.loadGrids($rootScope.CurrentUser.Id);

        $scope.updatePersonalAddresses = function () {
            /// <summary>
            /// Refreshes personal addresses data source.
            /// </summary>
            $scope.gridContainer.personalAddressesGrid.dataSource.transport.options.read.url = "odata/PersonalAddresses()?$filter=PersonId eq " + $scope.currentPerson.Id;
            $scope.gridContainer.personalAddressesGrid.dataSource.read();
            // Reload CurrentUser to update Personal Addresses in DrivingController
            Person.GetCurrentUser().$promise.then(function (data) {
                $rootScope.CurrentUser = data;
            });
        }

        $scope.updatePersonalRoutes = function () {
            /// <summary>
            /// refreshes personal routes data source.
            /// </summary>
            $scope.gridcontainer.personalRoutesGrid.dataSource.transport.options.read.url = "odata/PersonalRoutes()?$filter=PersonId eq " + $scope.currentPerson.Id + "&$expand=Points";
            $scope.gridcontainer.personalRoutesGrid.dataSource.read();
            // Reload CurrentUser to update Personal Routes in DrivingController
            Person.GetCurrentUser().$promise.then(function (data) {
                $rootScope.CurrentUser = data;
            });

        }

        $scope.openRouteEditModal = function (id) {
            /// <summary>
            /// Opens edit route modal.
            /// </summary>
            /// <param name="id"></param>
            var modalInstance = $modal.open({
                templateUrl: '/App/Drive/Settings/RouteEditModal.html',
                controller: 'RouteEditModalInstanceController',
                backdrop: 'static',
                resolve: {
                    routeId: function () {
                        return id;
                    },
                    personId: function () {
                        return $scope.currentPerson.Id;
                    }
                }
            });

            modalInstance.result.then(function () {
                $scope.updatePersonalRoutes();
            });
        };

        $scope.openRouteAddModal = function (id) {
            /// <summary>
            /// Opens add route modal.
            /// </summary>
            /// <param name="id"></param>

            var modalInstance = $modal.open({
                templateUrl: '/App/Drive/Settings/RouteAddModal.html',
                controller: 'RouteEditModalInstanceController',
                backdrop: 'static',
                resolve: {
                    routeId: function () {
                        return;
                    },
                    personId: function () {
                        return $scope.currentPerson.Id;
                    }
                }
            });

            modalInstance.result.then(function () {
                $scope.updatePersonalRoutes();
            });
        };

        $scope.openRouteDeleteModal = function (id) {
            /// <summary>
            /// Opens delete route modal.
            /// </summary>
            /// <param name="id"></param>
            var modalInstance = $modal.open({
                templateUrl: '/App/Drive/Settings/RouteDeleteModal.html',
                controller: 'RouteDeleteModalInstanceController',
                backdrop: 'static',
                resolve: {
                    routeId: function () {
                        return id;
                    },
                    personId: function () {
                        return $scope.currentPerson.Id;
                    }
                }
            });

            modalInstance.result.then(function () {
                $scope.updatePersonalRoutes();
            });
        };

        $scope.openAddressAddModal = function () {
            /// <summary>
            ///Opens add personal address modal.
            /// </summary>
            var modalInstance = $modal.open({
                templateUrl: '/App/Drive/Settings/AddressAddModal.html',
                controller: 'AddressEditModalInstanceController',
                backdrop: 'static',
                resolve: {
                    addressId: function () {
                        return;
                    },
                    personId: function () {
                        return $scope.currentPerson.Id;
                    }
                }
            });

            modalInstance.result.then(function () {
                $scope.updatePersonalAddresses();
            });
        };

        $scope.openAddressEditModal = function (id) {
            /// <summary>
            /// Opens edit personal address modal.
            /// </summary>
            /// <param name="id"></param>
            var modalInstance = $modal.open({
                templateUrl: '/App/Drive/Settings/AddressEditModal.html',
                controller: 'AddressEditModalInstanceController',
                backdrop: 'static',
                resolve: {
                    addressId: function () {
                        return id;
                    },
                    personId: function () {
                        return $scope.currentPerson.Id;
                    }
                }
            });

            modalInstance.result.then(function () {
                $scope.updatePersonalAddresses();
            });
        };

        $scope.openAddressDeleteModal = function (id) {
            /// <summary>
            /// Opens delete personal address modal.
            /// </summary>
            /// <param name="id"></param>
            var modalInstance = $modal.open({
                templateUrl: '/App/Drive/Settings/AddressDeleteModal.html',
                controller: 'AddressDeleteModalInstanceController',
                backdrop: 'static',
                resolve: {
                    addressId: function () {
                        return id;
                    },
                    personId: function () {
                        return $scope.currentPerson.Id;
                    }
                }
            });

            modalInstance.result.then(function () {
                $scope.updatePersonalAddresses();
            });
        };

        $scope.openConfirmDeleteAppPasswordModal = function () {
            /// <summary>
            /// Opens confirm delete app login modal.
            /// </summary>
            var modalInstance = $modal.open({
                templateUrl: '/App/Drive/Settings/confirmDeleteAppPasswordModal.html',
                controller: 'AppLoginModalController',
                backdrop: 'static',
            });

            modalInstance.result.then(function () {
                AppLogin.delete({ id: $scope.currentPerson.Id }).$promise.then(function () {
                    $scope.currentPerson.HasAppPassword = false;
                    $rootScope.CurrentUser.HasAppPassword = false;
                    NotificationService.AutoFadeNotification("success", "", "App login blev nulstillet.");
                });
            }, function () {

            });
        };

        $scope.openConfirmCreateAppPasswordModal = function () {
            /// <summary>
            /// Opens confirm create app login modal.
            /// </summary>
            var modalInstance = $modal.open({
                templateUrl: '/App/Drive/Settings/confirmCreateAppLoginModal.html',
                controller: 'AppLoginModalController',
                backdrop: 'static',
            });

            modalInstance.result.then(function (res) {
                var appLogin = {Password: res, UserName: $scope.currentPerson.Initials, PersonId: $scope.currentPerson.Id};
                AppLogin.post(appLogin).$promise.then(function () {
                    $scope.currentPerson.HasAppPassword = true;
                    $rootScope.CurrentUser.HasAppPassword = true;
                    NotificationService.AutoFadeNotification("success", "", "App login blev oprettet.");
                });
            }, function () {

            });
        };

        $scope.makeLicensePlatePrimary = function (plate) {
            /// <summary>
            /// Makes license plate primary.
            /// </summary>
            /// <param name="plate"></param>
            LicensePlate.patch({ id: plate.Id }, { IsPrimary: true }, function () {
                //Load licenseplates when finished request.
                LicensePlate.get({ id: personId }, function (data) {
                    $scope.licenseplates = data;
                });
            });
        }

        $scope.openAlternativeWorkAddressModal = function () {

            var modalInstance = $modal.open({
                templateUrl: '/App/Drive/Settings/AlternativeWorkAddressModal.html',
                controller: 'AlternativeWorkAddressModalController',
                backdrop: 'static',
            });

            modalInstance.result.then(function (res) {

            }, function () {

            });
        };

        var checkShouldPrompt = function () {
            /// <summary>
            /// Return true if there are unsaved changes on the page.
            /// </summary>

            if ($scope.newLicensePlate != "" ||
                $scope.newLicensePlateDescription != "") {
                return true;
            }
            return false;
        }

        // Alert the user when navigating away from the page if there are unsaved changes.
        $scope.$on('$stateChangeStart', function (event) {
            if (checkShouldPrompt() === true) {
                var answer = confirm("Du har lavet ændringer på siden, der ikke er gemt. Ønsker du at kassere disse ændringer?");
                if (!answer) {
                    event.preventDefault();
                }
            }
        });

        window.onbeforeunload = function (e) {
            if (checkShouldPrompt() === true) {
                return "Du har lavet ændringer på siden, der ikke er gemt. Ønsker du at kassere disse ændringer?";
            }
        };

        $scope.$on('$destroy', function () {
            /// <summary>
            /// Unregister refresh event handler when leaving the page.
            /// </summary>
            window.onbeforeunload = undefined;
        });
    }
]);
angular.module("app.drive").controller('AddressDeleteModalInstanceController', [
    "$scope", "Address", "Point", "NotificationService", "$modalInstance", "addressId", "personId", "AddressFormatter", function ($scope, Address, Point, NotificationService, $modalInstance, addressId, personId, AddressFormatter) {

        $scope.confirmDelete = function () {
            Address.delete({ id: addressId }, function () {
                NotificationService.AutoFadeNotification("success", "", "Adresse slettet");
                $modalInstance.close('');
            });
        }

        $scope.cancelDelete = function () {
            $modalInstance.dismiss('');
        }

    }]);
angular.module("app.drive").controller('AddressEditModalInstanceController', ["$scope", "$modalInstance", "Address", "personId", "addressId", "NotificationService", "AddressFormatter", "SmartAdresseSource", function ($scope, $modalInstance, Address, personId, addressId, NotificationService, AddressFormatter, SmartAdresseSource) {
    $scope.newAddress = "";
    $scope.oldAddressId = 0;
    $scope.oldAddress = "";
    $scope.addressDescription = "";

    $scope.loadAddressData= function() {
        if (addressId != undefined) {
            Address.get({ query: "$filter=Id eq " + addressId }, function (data) {
                $scope.oldAddressId = data.value[0].Id;
                $scope.addressDescription = data.value[0].Description;
                $scope.oldAddress = data.value[0].StreetName + " " + data.value[0].StreetNumber + ", " + data.value[0].ZipCode + " " + data.value[0].Town;
            });
        }
    }

    $scope.loadAddressData();

    $scope.addressNotFound = false;

    $scope.addressFieldOptions = {
            dataBound: function () {
                $scope.addressNotFound = this.dataSource._data.length == 0;
                $scope.$apply();
            }
        }

    $scope.saveEditedAddress = function () {

        if ($scope.addressNotFound) return;

        $scope.newAddress = $scope.oldAddress;

        var result = AddressFormatter.fn($scope.newAddress);

        if (addressId != undefined) {
            result.Id = $scope.oldAddressId;
            result.PersonId = personId;

            result.Description = $scope.addressDescription;

            var updatedAddress = new Address({
                PersonId: personId,
                StreetName: result.StreetName,
                StreetNumber: result.StreetNumber,
                ZipCode: parseInt(result.ZipCode),
                Town: result.Town,
                Description: $scope.addressDescription
            });

            updatedAddress.$patch({ id: result.Id }, function () {
                NotificationService.AutoFadeNotification("success", "", "Adresse opdateret");
                $modalInstance.close('');
            }, function () {
                NotificationService.AutoFadeNotification("danger", "", "Adresse blev ikke opdateret");
            });
        } else {
            var newAddress = new Address({
                PersonId: personId,
                StreetName: result.StreetName,
                StreetNumber: result.StreetNumber,
                ZipCode: parseInt(result.ZipCode),
                Town: result.Town,
                Description: $scope.addressDescription,
                Latitude: "",
                Longitude: "",
                Type: "Standard"
            });

            newAddress.$post(function() {
                NotificationService.AutoFadeNotification("success", "", "Adresse oprettet");
                $modalInstance.close('');
            }, function() {
                NotificationService.AutoFadeNotification("danger", "", "Adresse blev ikke oprettet");
            });
        }

    }

    $scope.SmartAddress = SmartAdresseSource;

    $scope.closeAddressEditModal = function () {
        $modalInstance.close({

        });
    };
}]);
angular.module("app.drive").controller('TokenInstanceController', ["$scope", "NotificationService", "$modalInstance", "Token", "personId", "$modal", function ($scope, NotificationService, $modalInstance, Token, personId, $modal) {




}]);


angular.module('app.drive').controller('AppLoginModalController', ["$scope","$modalInstance", function ($scope, $modalInstance) {
    
    $scope.confirmDelete = function () {
        $modalInstance.close();
    };

    $scope.cancelDelete = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.createAppPassword = function () {
        $modalInstance.close($scope.password);
    }
}]);
angular.module("app.drive").controller('RouteDeleteModalInstanceController', [
    "$scope", "Route", "Point", "NotificationService" +
    "", "$modalInstance", "routeId", "personId", "AddressFormatter", function ($scope, Route, Point, NotificationService, $modalInstance, routeId, personId, AddressFormatter) {
  
        $scope.confirmDelete = function () {
            Route.delete({ id: routeId }, function() {
                NotificationService.AutoFadeNotification("success", "", "Rute slettet");
                $modalInstance.close('');
            });
        }

        $scope.cancelDelete = function() {
            $modalInstance.dismiss('');
        }
    
}]);
angular.module("app.drive").controller('RouteEditModalInstanceController', [
    "$scope", "Route", "Point", "NotificationService", "$modalInstance", "routeId", "personId", "AddressFormatter", "SmartAdresseSource", function ($scope, Route, Point, NotificationService, $modalInstance, routeId, personId, AddressFormatter, SmartAdresseSource) {


        //Contains addresses as strings ex. "Road 1, 8220 Aarhus"
        $scope.viaPointModels = [];

        $scope.isSaveDisabled = false;

        $scope.addressFieldOptions = {
            dataBound: function () {
                $scope.addressNotFound = this.dataSource._data.length == 0;
                $scope.$apply();
            }
        }

        if (routeId != undefined) {
            Route.getSingle({ id: routeId }, function (res) {
                $scope.newRouteDescription = res.Description;

                $scope.newStartPoint = res.Points[0].StreetName + " " + res.Points[0].StreetNumber + ", " + res.Points[0].ZipCode + " " + res.Points[0].Town;
                $scope.newEndPoint = res.Points[res.Points.length - 1].StreetName + " " + res.Points[res.Points.length - 1].StreetNumber + ", " + res.Points[res.Points.length - 1].ZipCode + " " + res.Points[res.Points.length - 1].Town;

                angular.forEach(res.Points, function (viaPoint, key) {
                    if (key != 0 && key != res.Points.length - 1) {
                        // If its not the first or last element -> Its a via point
                        var pointModel = viaPoint.StreetName + " " + viaPoint.StreetNumber + ", " + viaPoint.ZipCode + " " + viaPoint.Town;
                        $scope.viaPointModels.push(pointModel);
                    }
                });
            });
        }

        $scope.saveRoute = function () {
            if ($scope.addressNotFound) return;
            $scope.isSaveDisabled = true;
            if (routeId != undefined) {
                // routeId is defined -> User is editing existing route ->  Delete it, and then post the edited route as a new route.
                Route.delete({ id: routeId }, function () {
                    handleSaveRoute();
                });
            } else {
                // routeId is undefined -> User is making a new route.
                handleSaveRoute();
            }

        }

        var handleSaveRoute = function () {
            // Validate start and end point
            if ($scope.newStartPoint == undefined || $scope.newStartPoint == "" || $scope.newEndPoint == undefined || $scope.newEndPoint == "") {
                NotificationService.AutoFadeNotification("danger", "", "Start- og slutadresse skal udfyldes.");
                $scope.isSaveDisabled = false;
                return;
            }

            // Validate description
            if ($scope.newRouteDescription == "" || $scope.newRouteDescription == undefined) {
                NotificationService.AutoFadeNotification("danger", "", "Beskrivelse må ikke være tom.");
                $scope.isSaveDisabled = false;
                return;
            }

            var points = [];

            var startAddress = AddressFormatter.fn($scope.newStartPoint);

            points.push({
                "StreetName": startAddress.StreetName,
                "StreetNumber": startAddress.StreetNumber,
                "ZipCode": startAddress.ZipCode,
                "Town": startAddress.Town,
                "Latitude": "",
                "Longitude": "",
                "Description": ""
            });
            angular.forEach($scope.viaPointModels, function (address, key) {
                var point = AddressFormatter.fn(address);

                points.push({
                    "StreetName": point.StreetName,
                    "StreetNumber": point.StreetNumber,
                    "ZipCode": point.ZipCode,
                    "Town": point.Town,
                    "Latitude": "",
                    "Longitude": "",
                    "Description": ""
                });
            });

            var endAddress = AddressFormatter.fn($scope.newEndPoint);

            points.push({
                "StreetName": endAddress.StreetName,
                "StreetNumber": endAddress.StreetNumber,
                "ZipCode": endAddress.ZipCode,
                "Town": endAddress.Town,
                "Latitude": "",
                "Longitude": "",
                "Description": ""
            });

            Route.post({
                "Description": $scope.newRouteDescription,
                "PersonId": personId,
                "Points": points
            }, function () {
                if (routeId != undefined) {
                    NotificationService.AutoFadeNotification("success", "", "Personlig rute blev redigeret.");
                } else {
                    NotificationService.AutoFadeNotification("success", "", "Personlig rute blev oprettet.");
                }
                $modalInstance.close();
            });
        }

        $scope.removeViaPoint = function ($index) {
           $scope.viaPointModels.splice($index, 1);
        }

        $scope.addNewViaPoint = function () {
            $scope.viaPointModels.push("");
        }

        $scope.closeRouteEditModal = function () {
            $modalInstance.dismiss();
        };

        $scope.SmartAddress = SmartAdresseSource;
    }]);
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (app) {
    var drive;
    (function (drive) {
        "use strict";
        var ReportType = app.core.models.ReportType;
        var BaseSubstitutesController = app.core.controllers.BaseSubstitutesController;
        var DriveSubstitutesController = (function (_super) {
            __extends(DriveSubstitutesController, _super);
            function DriveSubstitutesController($scope, Person, $rootScope, HelpText, Autocomplete, $modal, $timeout, moment) {
                _super.call(this, $scope, Person, $rootScope, HelpText, Autocomplete, $modal, $timeout, moment, ReportType.Drive);
                this.$scope = $scope;
                this.Person = Person;
                this.$rootScope = $rootScope;
                this.HelpText = HelpText;
                this.Autocomplete = Autocomplete;
                this.$modal = $modal;
                this.$timeout = $timeout;
                this.moment = moment;
            }
            DriveSubstitutesController.$inject = [
                "$scope",
                "Person",
                "$rootScope",
                "HelpText",
                "Autocomplete",
                "$modal",
                "$timeout",
                "moment"
            ];
            return DriveSubstitutesController;
        }(BaseSubstitutesController));
        angular.module("app.drive").controller("Drive.SubstitutesController", DriveSubstitutesController);
    })(drive = app.drive || (app.drive = {}));
})(app || (app = {}));
//# sourceMappingURL=SubstitutesController.js.map
var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        angular.module('app.vacation', [
            "app.core",
            "kendo.directives",
            "ui.router",
            "ui.bootstrap",
            "ui.bootstrap.tooltip",
            "ngResource",
            "template/modal/window.html",
            "template/modal/window.html",
            "template/modal/backdrop.html",
            "template/tabs/tab.html",
            "template/tabs/tabset.html",
            "angularMoment",
            "template/popover/popover.html",
            "kendo-ie-fix",
            "angular-loading-bar",
            "ui.router.tabs"
        ]);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=app.vacation.js.map
var app;
(function (app) {
    var vacation;
    (function (vacation) {
        var Routes = (function () {
            function Routes() {
            }
            Routes.init = function ($stateProvider) {
                $stateProvider
                    .state("vacation.report", {
                    url: "/report",
                    templateUrl: "/App/Vacation/ReportVacation/ReportVacationView.html",
                    controller: "CreateReportVacationController",
                    controllerAs: "rvc"
                })
                    .state("vacation.approve", {
                    url: "/approve",
                    templateUrl: "/App/Vacation/ApproveVacation/ApproveVacationView.html",
                    controller: "ApproveVacationController",
                    controllerAs: "avCtrl",
                    data: {
                        roles: ['Approver']
                    }
                })
                    .state("vacation.approve.pending", {
                    url: "/pending",
                    templateUrl: "/App/Vacation/ApproveVacation/ApproveVacationPending/ApproveVacationPendingView.html",
                    controller: "ApproveVacationPendingController",
                    controllerAs: "avpCtrl",
                    data: {
                        roles: ['Approver']
                    }
                })
                    .state("vacation.approve.balance", {
                    url: "/balance",
                    templateUrl: "/App/Vacation/ApproveVacation/ApproveVacationBalance/ApproveVacationBalanceView.html",
                    controller: "ApproveVacationBalanceController",
                    controllerAs: "avbCtrl",
                    data: {
                        roles: ['Approver']
                    }
                })
                    .state("vacation.approve.settings", {
                    url: "/settings",
                    templateUrl: "/App/Core/Views/ApproveReportsSettingsView.html",
                    controller: "ApproveVacationSettingsController",
                    controllerAs: "arsCtrl",
                    data: {
                        roles: ['Approver']
                    }
                })
                    .state("vacation.admin", {
                    url: "/admin",
                    templateUrl: "/App/Vacation/Admin/AdminView.html",
                    controller: "Vacation.AdminMenuController",
                    controllerAs: "ctrl",
                    data: {
                        roles: ['Admin']
                    }
                })
                    .state("vacation.overview", {
                    url: "/overview",
                    controller: 'VacationOverviewController',
                    controllerAs: 'voc',
                    templateUrl: "/App/Vacation/Overview/VacationOverviewView.html"
                })
                    .state("vacation.myreports", {
                    url: "/myreports",
                    controller: 'MyVacationReportsController',
                    controllerAs: 'mvrc',
                    templateUrl: "/App/Vacation/MyVacationReports/MyVacationReportsView.html"
                })
                    .state("vacation.myreports.pending", {
                    url: "/pending",
                    templateUrl: "/App/Vacation/MyVacationReports/MyPendingVacationReports/MyPendingVacationReportsView.html",
                    controller: 'MyPendingVacationReportsController',
                    controllerAs: 'mvrCtrl'
                })
                    .state("vacation.myreports.pending.edit", {
                    url: "/modal/:vacationReportId",
                    onEnter: [
                        "$state", "$modal", "$stateParams", function ($state, $modal, $stateParams) {
                            $modal.open({
                                templateUrl: '/App/Vacation/MyVacationReports/EditVacationReportTemplate.html',
                                controller: 'EditReportVacationController as rvc',
                                backdrop: "static",
                                windowClass: "app-modal-window-full",
                                resolve: {
                                    vacationReportId: function () {
                                        return $stateParams.vacationReportId;
                                    }
                                }
                            })
                                .result.then(function () {
                                $state.go("^", null, { reload: true });
                            }, function () {
                                $state.go("^");
                            });
                        }
                    ]
                })
                    .state("vacation.myreports.approved", {
                    url: "/approved",
                    templateUrl: "/App/Vacation/MyVacationReports/MyApprovedVacationReports/MyApprovedVacationReportsView.html",
                    controller: 'MyApprovedVacationReportsController',
                    controllerAs: 'mvrCtrl'
                })
                    .state("vacation.myreports.approved.edit", {
                    url: "/modal/:vacationReportId",
                    onEnter: [
                        "$state", "$modal", "$stateParams", function ($state, $modal, $stateParams) {
                            $modal.open({
                                templateUrl: '/App/Vacation/MyVacationReports/EditVacationReportTemplate.html',
                                controller: 'EditReportVacationController as rvc',
                                backdrop: "static",
                                windowClass: "app-modal-window-full",
                                resolve: {
                                    vacationReportId: function () {
                                        return $stateParams.vacationReportId;
                                    }
                                }
                            })
                                .result.then(function () {
                                $state.go("^", null, { reload: true });
                            }, function () {
                                $state.go("^");
                            });
                        }
                    ]
                })
                    .state("vacation.myreports.rejected", {
                    url: "/rejected",
                    templateUrl: "/App/Vacation/MyVacationReports/MyRejectedVacationReports/MyRejectedVacationReportsView.html",
                    controller: 'MyRejectedVacationReportsController',
                    controllerAs: 'mvrCtrl'
                });
            };
            Routes.$inject = [
                "$stateProvider"
            ];
            return Routes;
        }());
        vacation.Routes = Routes;
        angular.module("app.vacation").config(Routes.init);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=app.vacation.routes.js.map
var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var AdminMenuController = (function () {
            function AdminMenuController($scope, Person, $rootScope, HelpText) {
                this.$scope = $scope;
                this.Person = Person;
                this.$rootScope = $rootScope;
                this.HelpText = HelpText;
                this.currentUser = $scope.CurrentUser;
            }
            AdminMenuController.prototype.orgSettingsClicked = function () {
                this.$scope.$broadcast("Vacation.OrgSettingsClicked");
            };
            AdminMenuController.prototype.adminClicked = function () {
                this.$scope.$broadcast("Vacation.AdministrationClicked");
            };
            AdminMenuController.prototype.reportsClicked = function () {
                this.$scope.$broadcast("Vacation.ReportsClicked");
            };
            AdminMenuController.prototype.accountClicked = function () {
                this.$scope.$broadcast("Vacation.AccountClicked");
            };
            AdminMenuController.prototype.emailClicked = function () {
                this.$scope.$broadcast("Vacation.EmailClicked");
            };
            AdminMenuController.$inject = [
                "$scope",
                "Person",
                "$rootScope",
                "HelpText"
            ];
            return AdminMenuController;
        }());
        angular.module("app.vacation").controller("Vacation.AdminMenuController", AdminMenuController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=AdminMenuController.js.map
var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var VacationAdminOrgUnitController = (function () {
            function VacationAdminOrgUnitController($scope, $rootScope, OrgUnit, NotificationService, Autocomplete, $modal) {
                this.$scope = $scope;
                this.$rootScope = $rootScope;
                this.OrgUnit = OrgUnit;
                this.NotificationService = NotificationService;
                this.Autocomplete = Autocomplete;
                this.$modal = $modal;
                this.selectedHasAccess = -1;
                this.orgUnits = Autocomplete.orgUnits();
                this.autoCompleteOptions = {
                    filter: "contains",
                    select: function (e) {
                        this.orgUnit = this.dataItem(e.item.index());
                    }
                };
                this.gridOptions = {
                    autoBind: false,
                    dataSource: {
                        type: "odata-v4",
                        transport: {
                            read: {
                                beforeSend: function (req) {
                                    req.setRequestHeader('Accept', 'application/json;odata=fullmetadata');
                                },
                                url: "/odata/OrgUnits",
                                dataType: "json",
                                cache: false
                            }
                        },
                        schema: {
                            model: {
                                fields: {
                                    OrgId: {
                                        editable: false
                                    },
                                    ShortDescription: {
                                        editable: false
                                    },
                                    LongDescription: {
                                        editable: false
                                    },
                                    HasAccessToVacation: {
                                        editable: false
                                    }
                                }
                            }
                        },
                        pageSize: 20,
                        serverPaging: true,
                        serverFiltering: true
                    },
                    sortable: true,
                    pageable: {
                        messages: {
                            display: "{0} - {1} af {2} organisationsenheder",
                            empty: "Ingen organisationsenheder at vise",
                            page: "Side",
                            of: "af {0}",
                            itemsPerPage: "Organisationsenheder pr. side",
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
                    editable: true,
                    columns: [
                        {
                            field: "OrgId",
                            title: "Organisations ID"
                        },
                        {
                            field: "ShortDescription",
                            title: "Kort beskrivelse"
                        },
                        {
                            field: "LongDescription",
                            title: "Lang beskrivelse"
                        },
                        {
                            field: "HasAccessToVacation",
                            title: "Adgang til ferie",
                            template: function (data) {
                                if (data.HasAccessToVacation) {
                                    return "<input type='checkbox' ng-click='orgUnitsCtrl.rowChecked(" + data.Id + ", false)' checked></input>";
                                }
                                else {
                                    return "<input type='checkbox' ng-click='orgUnitsCtrl.rowChecked(" + data.Id + ", true)'></input>";
                                }
                            }
                        }
                    ]
                };
            }
            VacationAdminOrgUnitController.prototype.orgUnitChanged = function (item) {
                /// <summary>
                /// Filters grid content
                /// </summary>
                /// <param name="item"></param>
                this.updateSourceUrl();
            };
            VacationAdminOrgUnitController.prototype.updateSourceUrl = function () {
                var url = "/odata/OrgUnits";
                if (Object.keys(this.chosenUnit).length !== 0) {
                    url += "?$filter=contains(LongDescription," + "'" + encodeURIComponent(this.chosenUnit + "')");
                }
                else {
                    if (this.selectedHasAccess !== -1)
                        url += "?$filter=HasAccessToFourKmRule eq " + (this.selectedHasAccess === 0 ? "false" : "true");
                }
                this.grid.dataSource.transport.options.read.url = url;
                this.grid.dataSource.read();
            };
            VacationAdminOrgUnitController.prototype.refreshGrid = function () {
                this.grid.dataSource.read();
            };
            VacationAdminOrgUnitController.prototype.rowChecked = function (orgUnitId, newValue) {
                /// <summary>
                /// Is called when the user checks an orgunit in the grid.
                /// Patches HasAccessToFourKmRule on the backend.
                /// </summary>
                /// <param name="id"></param>
                var _this = this;
                this.$modal.open({
                    templateUrl: '/App/Vacation/Admin/OrgUnits/VacationHasAccessToVacationModalView.html',
                    controller: 'VacationHasAccessToVacationModalController as vhatvmc',
                    backdrop: "static"
                }).result.then(function (res) {
                    _this.OrgUnit.SetVacationAccess({ id: orgUnitId, value: newValue, recursive: res }, function () {
                        if (newValue) {
                            _this.NotificationService.AutoFadeNotification("success", "", "Adgang til ferie tilføjet.");
                        }
                        else {
                            _this.NotificationService.AutoFadeNotification("success", "", "Adgang til ferie fjernet.");
                        }
                        _this.refreshGrid();
                    });
                });
            };
            VacationAdminOrgUnitController.$inject = [
                "$scope",
                "$rootScope",
                "OrgUnit",
                "NotificationService",
                "Autocomplete",
                "$modal"
            ];
            return VacationAdminOrgUnitController;
        }());
        angular.module("app.vacation").controller("VacationAdminOrgUnitController", VacationAdminOrgUnitController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=VacationAdminOrgUnitController.js.map
var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var VacationHasAccessToVacationModalController = (function () {
            function VacationHasAccessToVacationModalController($scope, $modalInstance, $modal) {
                this.$scope = $scope;
                this.$modalInstance = $modalInstance;
                this.$modal = $modal;
            }
            VacationHasAccessToVacationModalController.prototype.close = function () {
                this.$modalInstance.close(false);
            };
            VacationHasAccessToVacationModalController.prototype.all = function () {
                this.$modalInstance.close(true);
            };
            VacationHasAccessToVacationModalController.$inject = [
                "$scope",
                "$modalInstance",
                "$modal",
            ];
            return VacationHasAccessToVacationModalController;
        }());
        angular.module("app.vacation").controller("VacationHasAccessToVacationModalController", VacationHasAccessToVacationModalController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=VacationHasAccessToVacationModalController.js.map
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var ReportType = app.core.models.ReportType;
        var BaseSubstitutesController = app.core.controllers.BaseSubstitutesController;
        var VacationSubstitutesController = (function (_super) {
            __extends(VacationSubstitutesController, _super);
            function VacationSubstitutesController($scope, Person, $rootScope, HelpText, Autocomplete, $modal, $timeout, moment) {
                _super.call(this, $scope, Person, $rootScope, HelpText, Autocomplete, $modal, $timeout, moment, ReportType.Vacation);
                this.$scope = $scope;
                this.Person = Person;
                this.$rootScope = $rootScope;
                this.HelpText = HelpText;
                this.Autocomplete = Autocomplete;
                this.$modal = $modal;
                this.$timeout = $timeout;
                this.moment = moment;
            }
            VacationSubstitutesController.$inject = [
                "$scope",
                "Person",
                "$rootScope",
                "HelpText",
                "Autocomplete",
                "$modal",
                "$timeout",
                "moment"
            ];
            return VacationSubstitutesController;
        }(BaseSubstitutesController));
        angular.module("app.vacation").controller("Vacation.SubstitutesController", VacationSubstitutesController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=VacationSubstitutesController.js.map
var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var ApproveVacationController = (function () {
            function ApproveVacationController() {
                this.tabData = [
                    {
                        heading: 'Overblik',
                        route: 'vacation.approve.pending'
                    },
                    {
                        heading: 'Feriesaldo',
                        route: 'vacation.approve.balance'
                    },
                    {
                        heading: 'Stedfortrædere',
                        route: 'vacation.approve.settings'
                    }
                ];
            }
            ApproveVacationController.$inject = [];
            return ApproveVacationController;
        }());
        angular.module("app.vacation").controller("ApproveVacationController", ApproveVacationController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=ApproveVacationController.js.map
var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var ShowVacationReportController = (function () {
            function ShowVacationReportController($scope, $rootScope, VacationReport, NotificationService, VacationBalanceResource, moment, $state, $modalInstance, $modal, report) {
                var _this = this;
                this.$scope = $scope;
                this.$rootScope = $rootScope;
                this.VacationReport = VacationReport;
                this.NotificationService = NotificationService;
                this.VacationBalanceResource = VacationBalanceResource;
                this.moment = moment;
                this.$state = $state;
                this.$modalInstance = $modalInstance;
                this.$modal = $modal;
                this.report = report;
                this.id = report.personId;
                VacationBalanceResource.forEmployment({ id: report.EmploymentId }).$promise.then(function (data) {
                    _this.vacationBalance = data;
                    _this.calculateBalance(data);
                    _this.calculatePayDeduction();
                });
                this.name = report.Person.FullName.split("[")[0];
                if (report.description == null) {
                    this.purpose = report.Purpose;
                }
                else {
                    this.purpose = report.description;
                }
                var startsOnFullDay = report.StartTime == null;
                var endsOnFullDay = report.EndTime == null;
                var endAsDate;
                var startAsDate;
                if (report.EndTimestamp == null) {
                    endAsDate = report.end;
                    startAsDate = report.start;
                }
                else {
                    endAsDate = moment.unix(report.EndTimestamp).toDate();
                    startAsDate = moment.unix(report.StartTimestamp).toDate();
                }
                this.vacationTime = moment(endAsDate).diff(moment(startAsDate), 'days') * 7.4;
                if (!startsOnFullDay) {
                    this.startTime = "Fra kl. " + moment(moment.duration(report.StartTime)._data).format('HH:mm');
                }
                else {
                    this.startTime = "Hele dagen";
                }
                if (!endsOnFullDay) {
                    this.endTime = "Til kl. " + moment(moment.duration(report.EndTime)._data).format('HH:mm');
                }
                else {
                    this.endTime = "Hele dagen";
                    endAsDate -= 86400;
                }
                this.start = moment(startAsDate).format("DD.MM.YYYY");
                this.end = moment(endAsDate).format("DD.MM.YYYY");
                var type;
                if (report.type == null) {
                    type = report.VacationType;
                }
                else {
                    type = report.type;
                }
                switch (type) {
                    case "Care":
                        this.type = "Omsorgsdage";
                        this.optionalText = report.OptionalText;
                        break;
                    case "Optional":
                        this.type = "Andet fravær";
                        this.optionalText = report.OptionalText;
                        break;
                    case "Regular":
                        this.type = "Almindelig Ferie";
                        break;
                    case "Senior":
                        this.type = "Seniordage";
                        break;
                    case "SixthVacationWeek":
                        this.type = "6. ferieuge";
                        break;
                    default:
                        this.type = "Andet";
                        break;
                }
                switch (this.report.status) {
                    case "Accepted":
                        this.status = "Godkendt";
                        break;
                    case "Rejected":
                        this.status = "Afvist";
                        break;
                    case "Pending":
                        this.status = "Afventende";
                        break;
                    default:
                        this.status = "Ukendt";
                        break;
                }
            }
            ShowVacationReportController.prototype.close = function () {
                this.$modalInstance.dismiss();
            };
            ShowVacationReportController.prototype.approve = function () {
                var _this = this;
                var report = new this.VacationReport();
                var reportId;
                if (this.report.id == null) {
                    reportId = this.report.Id;
                }
                else {
                    reportId = this.report.id;
                }
                this.loadingPromise = report.$approve({ id: reportId }, function () {
                    _this.NotificationService.AutoFadeNotification("success", "", "Indberetningen blev godkendt.");
                    _this.$modalInstance.close();
                }, function (err) {
                    console.log(err);
                    if (err.data.error.message == null) {
                        _this.NotificationService.AutoFadeNotification("danger", "", "Der skete en ukendt fejl");
                    }
                    else {
                        var message = err.data.error.message;
                        _this.NotificationService.AutoFadeNotification("danger", "", message);
                    }
                });
            };
            ShowVacationReportController.prototype.reject = function () {
                var _this = this;
                var reportId;
                if (this.report.id == null) {
                    reportId = this.report.Id;
                }
                else {
                    reportId = this.report.id;
                }
                this.$modal.open({
                    templateUrl: '/App/Core/Views/Modals/ConfirmRejectReport.html',
                    controller: 'RejectReportModalInstanceController',
                    backdrop: "static",
                    resolve: {
                        itemId: function () {
                            return reportId;
                        }
                    }
                }).result.then(function (res) {
                    var report = new _this.VacationReport();
                    _this.loadingPromise = report.$reject({ id: reportId, comment: res.Comment }, function () {
                        _this.NotificationService.AutoFadeNotification("success", "", "Indberetningen blev afvist.");
                        _this.$modalInstance.close();
                    });
                });
            };
            ShowVacationReportController.prototype.calculateBalance = function (data) {
                var totalVacation = data.VacationHours + data.TransferredHours;
                this.vacationHours = Math.floor(totalVacation);
                this.vacationMinutes = Math.round((totalVacation - this.vacationHours) * 60);
                this.freeVacationHours = Math.floor(data.FreeVacationHours);
                this.freeVacationMinutes = Math.round((data.FreeVacationHours - data.FreeVacationHours) * 60);
            };
            ShowVacationReportController.prototype.calculatePayDeduction = function () {
                var payDeduction = false;
                if (this.report.status === "Pending") {
                    var totalVacationHours = this.calculateTotalVacationHours();
                    switch (this.report.type) {
                        case "Care":
                            break;
                        case "Optional":
                            break;
                        case "Regular":
                            payDeduction = totalVacationHours < this.vacationTime;
                            break;
                        case "Senior":
                            break;
                        case "SixthVacationWeek":
                            payDeduction = totalVacationHours < this.vacationTime;
                            break;
                        default:
                            break;
                    }
                }
                if (payDeduction) {
                    this.payDeduction = "Ja";
                }
                else {
                    this.payDeduction = "Nej";
                }
            };
            ShowVacationReportController.prototype.calculateTotalVacationHours = function () {
                return this.vacationBalance.VacationHours + this.vacationBalance.TransferredHours;
            };
            ShowVacationReportController.$inject = [
                "$scope",
                "$rootScope",
                "VacationReport",
                "NotificationService",
                "VacationBalanceResource",
                "moment",
                "$state",
                "$modalInstance",
                "$modal",
                "report"
            ];
            return ShowVacationReportController;
        }());
        angular.module("app.vacation").controller("ShowVacationReportController", ShowVacationReportController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=ShowVacationReportController.js.map
var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var ApproveVacationBalanceController = (function () {
            function ApproveVacationBalanceController($http, VacationBalanceResource) {
                var _this = this;
                this.$http = $http;
                this.VacationBalanceResource = VacationBalanceResource;
                this.isReady = false;
                $http.get("/odata/Person/Service.LeadersPeople(Type=1)").then(function (response) {
                    _this.persons = response.data.value;
                    angular.forEach(_this.persons, function (value, key) {
                        _this.getVacationBalance(value.Id, key);
                    });
                });
            }
            ApproveVacationBalanceController.prototype.getVacationBalance = function (id, idx) {
                var _this = this;
                this.VacationBalanceResource.forEmployee({ id: id }).$promise.then(function (data) {
                    _this.calculateBalance(data, idx);
                    if (idx === _this.persons.length - 1) {
                        _this.isReady = true;
                    }
                });
            };
            ApproveVacationBalanceController.prototype.calculateBalance = function (data, idx) {
                var vacationHours, vacationMinutes, freeVacationHours, freeVacationMinutes;
                if (data) {
                    var totalVacation = data.VacationHours + data.TransferredHours;
                    vacationHours = Math.floor(totalVacation);
                    vacationMinutes = Math.round((totalVacation - vacationHours) * 60);
                    freeVacationHours = Math.floor(data.FreeVacationHours);
                    freeVacationMinutes = Math.round((data.FreeVacationHours - freeVacationHours) * 60);
                }
                else {
                    vacationHours = 0;
                    vacationMinutes = 0;
                    freeVacationHours = 0;
                    freeVacationMinutes = 0;
                }
                this.persons[idx].VacationBalance = { vacationHours: vacationHours, vacationMinutes: vacationMinutes, freeVacationHours: freeVacationHours, freeVacationMinutes: freeVacationMinutes };
            };
            ApproveVacationBalanceController.$inject = [
                "$http",
                "VacationBalanceResource"
            ];
            return ApproveVacationBalanceController;
        }());
        angular.module("app.vacation").controller("ApproveVacationBalanceController", ApproveVacationBalanceController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=ApproveVacationBalanceController.js.map
var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var ApproveVacationPendingController = (function () {
            function ApproveVacationPendingController($scope, $rootScope, VacationReport, NotificationService, $http, moment, $state, $modal) {
                var _this = this;
                this.$scope = $scope;
                this.$rootScope = $rootScope;
                this.VacationReport = VacationReport;
                this.NotificationService = NotificationService;
                this.$http = $http;
                this.moment = moment;
                this.$state = $state;
                this.$modal = $modal;
                this.pendingVacations = [];
                this.readPendingVacations();
                // Why is this used?
                var self = this;
                this.schedulerOptions = {
                    workDayStart: new Date("2010-01-01 00:00:00"),
                    workDayEnd: new Date("2010-01-01 23:59:59"),
                    views: [
                        {
                            type: "timelineMonth",
                            title: "Måned",
                            minorTickCount: 1,
                            columnWidth: 25,
                            dateHeaderTemplate: function (obj) {
                                var date = moment(obj.date);
                                var day = date.date();
                                var week = date.format('W');
                                var header = "";
                                if (date.weekday() === 0)
                                    header += "<span style=\"font-size:10px;\">" + week + "</span>";
                                return header + ("<br>" + day);
                            },
                            workWeekStart: 0,
                            workWeekEnd: 5
                        },
                        {
                            type: "timelineWeek",
                            title: "Uge",
                            minorTickCount: 6,
                            columnWidth: 40,
                            majorTick: 1440
                        }
                    ],
                    timezone: "Etc/UTC",
                    //This is kendo's save event. Label has been changed to 'Gem' in in "edit" event below.
                    save: function (e) {
                        e.preventDefault();
                    },
                    eventTemplate: kendo.template("<div class=\"schedule-vacation-template vacation-#= type.toLowerCase()#\"> # if (type == 'Care') { # O # } if (type == 'SixthVacationWeek') { # 6 # } if (type == 'Regular') { #  # } if (type == 'Senior') { # S # } if (type == 'Optional') { # V # } # </div>"),
                    editable: {
                        update: true,
                        move: false,
                        destroy: false,
                        resize: false,
                        confirmation: false
                    },
                    edit: function (e) {
                        e.preventDefault();
                        $modal.open({
                            templateUrl: '/App/Vacation/ApproveVacation/ShowVacationReportView.html',
                            controller: 'ShowVacationReportController as svrc',
                            backdrop: "static",
                            resolve: {
                                report: function () {
                                    return e.event;
                                }
                            }
                        }).result.then(function () {
                            _this.refresh();
                        });
                    },
                    dataSource: {
                        autoBind: false,
                        type: "odata-v4",
                        batch: true,
                        transport: {
                            read: {
                                url: "/odata/VacationReports()?$expand=Person($select=FullName)&$filter=ResponsibleLeaderId eq " + this.$rootScope.CurrentUser.Id,
                                dataType: "json",
                                cache: false
                            }
                        },
                        serverFiltering: true,
                        schema: {
                            data: function (data) {
                                var events = [];
                                angular.forEach(data.value, function (value, key) {
                                    var startsOnFullDay = value.StartTime == null;
                                    var endsOnFullDay = value.EndTime == null;
                                    if (!startsOnFullDay) {
                                        var duration = _this.moment.duration(value.StartTime);
                                        value.StartTimestamp += duration.asSeconds();
                                    }
                                    if (!endsOnFullDay) {
                                        var duration = _this.moment.duration(value.EndTime);
                                        value.EndTimestamp += duration.asSeconds();
                                    }
                                    else {
                                        // Add 86400/24 hours to enddate
                                        value.EndTimestamp += 86400;
                                    }
                                    switch (value.VacationType) {
                                        case "Care":
                                            value.type = "Omsorgsdage";
                                            break;
                                        case "Optional":
                                            value.type = "Valgfri ferie";
                                            break;
                                        case "Regular":
                                            value.type = "Almindelig Ferie";
                                            break;
                                        case "Senior":
                                            value.type = "Seniordage";
                                            break;
                                        case "SixthVacationWeek":
                                            value.type = "6. ferieuge";
                                            break;
                                        default:
                                            value.type = "Andet";
                                            break;
                                    }
                                    events.push(value);
                                });
                                return events;
                            },
                            model: {
                                fields: {
                                    id: { type: "number", from: "Id" },
                                    title: {
                                        parse: function (data) { return ""; }
                                    },
                                    start: {
                                        type: "date",
                                        from: "StartTimestamp",
                                        parse: function (data) { return self.moment.unix(data).toDate(); }
                                    },
                                    end: {
                                        type: "date",
                                        from: "EndTimestamp",
                                        parse: function (data) { return self.moment.unix(data).toDate(); }
                                    },
                                    personId: { from: "PersonId" },
                                    description: { from: "Purpose" },
                                    status: { from: "Status" },
                                    type: { from: "VacationType" }
                                }
                            }
                        }
                    },
                    group: {
                        resources: ["People"],
                        orientation: "vertical"
                    },
                    resources: [
                        {
                            field: "status",
                            dataSource: [
                                {
                                    text: "Pending",
                                    value: "Pending",
                                    color: "#f1eb47"
                                },
                                {
                                    text: "Accepted",
                                    value: "Accepted",
                                    color: "#5cb85c"
                                },
                                {
                                    text: "Rejected",
                                    value: "Rejected",
                                    color: "#d9534f"
                                }
                            ]
                        },
                        {
                            field: "personId",
                            name: "People",
                            dataValueField: "Id",
                            dataTextField: "FullName",
                            dataSource: {
                                type: "odata-v4",
                                transport: {
                                    read: {
                                        url: "/odata/Person/Service.LeadersPeople(Type=1)",
                                        dataType: "json",
                                        cache: false
                                    }
                                }
                            }
                        }
                    ],
                    footer: false
                };
            }
            ApproveVacationPendingController.prototype.readPendingVacations = function () {
                var _this = this;
                // TODO Change this to use Resource instead
                this.$http.get("/odata/VacationReports()?status=Pending &$expand=Person($select=FullName)&$filter=ResponsibleLeaderId eq " + this.$rootScope.CurrentUser.Id).then(function (response) {
                    //Sort of objects for Pending Vacation Reports
                    response.data.value.sort(function (a, b) { return ((a.StartTimestamp > b.StartTimestamp) ? 1 : ((b.StartTimestamp > a.StartTimestamp) ? -1 : 0)); });
                    _this.pendingVacations = [];
                    angular.forEach(response.data.value, function (value, key) {
                        var startTime = Number(value.StartTimestamp.toString() + "000");
                        var endTime = Number(value.EndTimestamp.toString() + "000");
                        var dateFrom = _this.moment(startTime).format("DD.MM.YYYY");
                        var dateTo = _this.moment(endTime).format("DD.MM.YYYY");
                        var obj = {
                            key: key,
                            startTime: startTime,
                            firstName: value.Person.FullName.split("[")[0],
                            dateFrom: dateFrom,
                            dateTo: dateTo,
                            reportdata: value
                        };
                        _this.pendingVacations.push(obj);
                    });
                });
            };
            ;
            ApproveVacationPendingController.prototype.goToDate = function (data) {
                var _this = this;
                var time = Number(data.startTime);
                this.scheduler.date(new Date(time));
                this.$modal.open({
                    templateUrl: '/App/Vacation/ApproveVacation/ShowVacationReportView.html',
                    controller: 'ShowVacationReportController as svrc',
                    backdrop: "static",
                    resolve: {
                        report: function () {
                            return data.reportdata;
                        }
                    }
                }).result.then(function () {
                    _this.refresh();
                });
            };
            ;
            ApproveVacationPendingController.prototype.refresh = function () {
                this.readPendingVacations();
                this.scheduler.dataSource.read();
            };
            ApproveVacationPendingController.$inject = [
                "$scope",
                "$rootScope",
                "VacationReport",
                "NotificationService",
                "$http",
                "moment",
                "$state",
                "$modal"
            ];
            return ApproveVacationPendingController;
        }());
        angular.module("app.vacation").controller("ApproveVacationPendingController", ApproveVacationPendingController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=ApproveVacationPendingController.js.map
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var BaseApproveReportsSettingsController = app.core.controllers.BaseApproveReportsSettingsController;
        var ReportType = app.core.models.ReportType;
        var ApproveVacationSettingsController = (function (_super) {
            __extends(ApproveVacationSettingsController, _super);
            function ApproveVacationSettingsController($scope, Person, $rootScope, Autocomplete, $modal, moment) {
                _super.call(this, $scope, Person, $rootScope, Autocomplete, $modal, moment, ReportType.Vacation);
                this.$scope = $scope;
                this.Person = Person;
                this.$rootScope = $rootScope;
                this.Autocomplete = Autocomplete;
                this.$modal = $modal;
                this.moment = moment;
            }
            ApproveVacationSettingsController.$inject = [
                "$scope",
                "Person",
                "$rootScope",
                "Autocomplete",
                "$modal",
                "moment"
            ];
            return ApproveVacationSettingsController;
        }(BaseApproveReportsSettingsController));
        angular.module("app.vacation").controller("ApproveVacationSettingsController", ApproveVacationSettingsController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=ApproveVacationSettingsController.js.map
var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var BaseMyVacationReportsController = (function () {
            function BaseMyVacationReportsController($scope, $modal, $rootScope, VacationReport, // TODO Make $resource interface for VacationReport
                $timeout, Person, moment, $state, NotificationService) {
                var _this = this;
                this.$scope = $scope;
                this.$modal = $modal;
                this.$rootScope = $rootScope;
                this.VacationReport = VacationReport;
                this.$timeout = $timeout;
                this.Person = Person;
                this.moment = moment;
                this.$state = $state;
                this.NotificationService = NotificationService;
                this.vacationYears = [];
                this.isGridLoaded = false;
                this.deleteClick = function (id) {
                    _this.$modal.open({
                        templateUrl: '/App/Vacation/MyVacationReports/ConfirmDeleteVacationReportTemplate.html',
                        controller: 'ConfirmDeleteVacationReportController as cdvrCtrl',
                        backdrop: "static",
                        resolve: {
                            itemId: function () {
                                return id;
                            }
                        }
                    }).result.then(function () {
                        _this.VacationReport.delete({ id: id }, function () {
                            _this.NotificationService.AutoFadeNotification("success", "", "Indberetningen blev slettet.");
                            _this.refreshGrid();
                        }, function () {
                            _this.NotificationService.AutoFadeNotification("error", "", "Fejl under sletning af indberetning.");
                        });
                    });
                };
                // Format for datepickers.
                this.dateOptions = {
                    format: "yyyy",
                    start: "decade",
                    depth: "decade"
                };
                this.loadInitialDate();
                // Set personId. The value on $rootScope is set in resolve in application.js
                this.personId = $rootScope.CurrentUser.Id;
                this.$scope.$on("kendoRendered", function () {
                    if (!_this.isGridLoaded) {
                        _this.isGridLoaded = true;
                        _this.refreshGrid();
                    }
                });
            }
            BaseMyVacationReportsController.prototype.refreshGrid = function () {
                if (!this.isGridLoaded)
                    return;
                this.vacationReportsGrid.dataSource.transport.options.read.url = this.getVacationReportsUrl();
                this.vacationReportsGrid.dataSource.read();
            };
            BaseMyVacationReportsController.prototype.clearClicked = function () {
                this.loadInitialDate();
                this.refreshGrid();
            };
            BaseMyVacationReportsController.prototype.loadInitialDate = function () {
                var currentDate = this.moment();
                // Vacation year changes every year on the 1th of May
                if (this.moment().isBefore(currentDate.year() + "-05-01")) {
                    currentDate = currentDate.subtract('year', 1);
                }
                this.vacationYear = currentDate.year();
                var minYear = Math.max(2016, this.vacationYear - 5); // Can't show vacation before 2016
                var maxYear = this.vacationYear + 5;
                for (var i = minYear; i < maxYear; i++) {
                    this.vacationYears.push({
                        Year: i,
                        YearString: i + "/" + (i + 1)
                    });
                }
            };
            return BaseMyVacationReportsController;
        }());
        vacation.BaseMyVacationReportsController = BaseMyVacationReportsController;
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=BaseMyVacationReportsController.js.map
var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var ConfirmDeleteVacationReportController = (function () {
            function ConfirmDeleteVacationReportController($modalInstance, itemId, NotificationService) {
                this.$modalInstance = $modalInstance;
                this.itemId = itemId;
                this.NotificationService = NotificationService;
                this.itemId = itemId;
            }
            ConfirmDeleteVacationReportController.prototype.confirmDelete = function () {
                this.$modalInstance.close(this.itemId);
            };
            ConfirmDeleteVacationReportController.prototype.cancel = function () {
                this.$modalInstance.dismiss('cancel');
                this.NotificationService.AutoFadeNotification("warning", "", "Sletning af indberetningen blev annulleret.");
            };
            ConfirmDeleteVacationReportController.$inject = [
                "$modalInstance",
                "itemId",
                "NotificationService"
            ];
            return ConfirmDeleteVacationReportController;
        }());
        angular.module("app.vacation").controller("ConfirmDeleteVacationReportController", ConfirmDeleteVacationReportController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=ConfirmDeleteVacationReportController.js.map
var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var MyVacationReportsController = (function () {
            function MyVacationReportsController() {
                this.tabData = [
                    {
                        heading: 'Afventer',
                        route: 'vacation.myreports.pending'
                    },
                    {
                        heading: 'Godkendte',
                        route: 'vacation.myreports.approved'
                    },
                    {
                        heading: 'Afviste',
                        route: 'vacation.myreports.rejected'
                    }
                ];
            }
            MyVacationReportsController.$inject = [];
            return MyVacationReportsController;
        }());
        angular.module("app.vacation").controller("MyVacationReportsController", MyVacationReportsController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=MyVacationReportsController.js.map
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var MyApprovedVacationReportsController = (function (_super) {
            __extends(MyApprovedVacationReportsController, _super);
            function MyApprovedVacationReportsController($scope, $modal, $rootScope, VacationReport, $timeout, Person, moment, $state, NotificationService) {
                var _this = this;
                _super.call(this, $scope, $modal, $rootScope, VacationReport, $timeout, Person, moment, $state, NotificationService);
                this.$scope = $scope;
                this.$modal = $modal;
                this.$rootScope = $rootScope;
                this.VacationReport = VacationReport;
                this.$timeout = $timeout;
                this.Person = Person;
                this.moment = moment;
                this.$state = $state;
                this.NotificationService = NotificationService;
                this.vacationReportsOptions = {
                    autoBind: false,
                    dataSource: {
                        type: "odata-v4",
                        transport: {
                            read: {
                                url: this.getVacationReportsUrl(),
                                dataType: "json",
                                cache: false
                            }
                        },
                        pageSize: 20,
                        serverPaging: true,
                        serverAggregates: false,
                        serverSorting: true,
                        serverFiltering: true,
                        sort: { field: "StartTimestamp", dir: "desc" }
                    },
                    pageable: {
                        messages: {
                            display: "{0} - {1} af {2} indberetninger",
                            //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                            empty: "Ingen indberetninger at vise",
                            page: "Side",
                            of: "af {0}",
                            itemsPerPage: "indberetninger pr. side",
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
                            title: "Feriestart",
                            template: function (data) {
                                var m = _this.moment.unix(data.StartTimestamp);
                                return m.format("L");
                            }
                        },
                        {
                            title: "Ferieafslutning",
                            template: function (data) {
                                var m = _this.moment.unix(data.EndTimestamp);
                                return m.format("L");
                            }
                        },
                        {
                            template: function (data) {
                                if (data.Purpose != "") {
                                    return "<button kendo-tooltip k-position=\"'right'\" k-content=\"'" + data.Purpose + "'\" class=\"transparent-background pull-right no-border\">\n                                        <i class=\"fa fa-comment-o\"></i></button>";
                                }
                                return "<i>Ingen bemærkning angivet</i>";
                            },
                            title: "Bemærkning"
                        },
                        {
                            title: "Fraværsårsag",
                            template: function (data) {
                                switch (data.VacationType) {
                                    case "Care":
                                        return "Omsorgsdage";
                                    case "Optional":
                                        if (data.OptionalText != "") {
                                            return "Andet frav\u00E6r <button kendo-tooltip k-position=\"'right'\" k-content=\"'" + data.OptionalText + "'\" class=\"transparent-background pull-right no-border\">\n                                        <i class=\"fa fa-comment-o\"></i></button>";
                                        }
                                        return "Andet fravær";
                                    case "Regular":
                                        return "Almindelig Ferie";
                                    case "Senior":
                                        return "Seniordage";
                                    case "SixthVacationWeek":
                                        return "6. ferieuge";
                                    default:
                                        return "Andet";
                                }
                            }
                        },
                        {
                            field: "CreatedDateTimestamp",
                            template: function (data) {
                                var m = _this.moment.unix(data.CreatedDateTimestamp);
                                return m.format("L");
                            },
                            title: "Indberettet"
                        },
                        {
                            field: "ClosedDateTimestamp",
                            title: "Godkendelsesdato",
                            template: function (data) {
                                var m = _this.moment.unix(data.ClosedDateTimestamp);
                                return m.format("L");
                            }
                        },
                        {
                            field: "ProcessedDateTimestamp",
                            title: "Afsendt til løn",
                            template: function (data) {
                                if (data.ProcessedDateTimestamp != 0 && data.ProcessedDateTimestamp != null && data.ProcessedDateTimestamp != undefined) {
                                    var m = _this.moment.unix(data.ProcessedDateTimestamp);
                                    return m.format("L");
                                }
                                return "";
                            }
                        },
                        {
                            field: "ApprovedBy.FullName",
                            title: "Godkendt af"
                        },
                        {
                            field: "Id",
                            template: function (data) { return ("<a ng-click=\"mvrCtrl.deleteClick(" + data.Id + ")\">Slet</a> | <a ui-sref=\".edit({vacationReportId:" + data.Id + "})\">Rediger</a>"); },
                            title: "Muligheder"
                        }
                    ],
                    scrollable: false
                };
            }
            MyApprovedVacationReportsController.prototype.getVacationReportsUrl = function () {
                return "/odata/VacationReports?status=Accepted&$expand=ResponsibleLeader,ApprovedBy &$filter=PersonId eq " + this.personId + " and VacationYear eq " + this.vacationYear;
            };
            MyApprovedVacationReportsController.$inject = [
                "$scope",
                "$modal",
                "$rootScope",
                "VacationReport",
                "$timeout",
                "Person",
                "moment",
                "$state",
                "NotificationService"
            ];
            return MyApprovedVacationReportsController;
        }(vacation.BaseMyVacationReportsController));
        angular.module("app.vacation").controller("MyApprovedVacationReportsController", MyApprovedVacationReportsController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=MyApprovedVacationReportsController.js.map
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var MyPendingVacationReportsController = (function (_super) {
            __extends(MyPendingVacationReportsController, _super);
            function MyPendingVacationReportsController($scope, $modal, $rootScope, VacationReport, $timeout, Person, moment, $state, NotificationService) {
                var _this = this;
                _super.call(this, $scope, $modal, $rootScope, VacationReport, $timeout, Person, moment, $state, NotificationService);
                this.$scope = $scope;
                this.$modal = $modal;
                this.$rootScope = $rootScope;
                this.VacationReport = VacationReport;
                this.$timeout = $timeout;
                this.Person = Person;
                this.moment = moment;
                this.$state = $state;
                this.NotificationService = NotificationService;
                this.vacationReportsOptions = {
                    autoBind: false,
                    dataSource: {
                        type: "odata-v4",
                        transport: {
                            read: {
                                url: this.getVacationReportsUrl(),
                                dataType: "json",
                                cache: false
                            }
                        },
                        pageSize: 20,
                        serverPaging: true,
                        serverAggregates: false,
                        serverSorting: true,
                        serverFiltering: true,
                        sort: { field: "StartTimestamp", dir: "desc" }
                    },
                    pageable: {
                        messages: {
                            display: "{0} - {1} af {2} indberetninger",
                            //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                            empty: "Ingen indberetninger at vise",
                            page: "Side",
                            of: "af {0}",
                            itemsPerPage: "indberetninger pr. side",
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
                            title: "Feriestart",
                            template: function (data) {
                                var m = _this.moment.unix(data.StartTimestamp);
                                return m.format("L");
                            }
                        },
                        {
                            title: "Ferieafslutning",
                            template: function (data) {
                                var m = _this.moment.unix(data.EndTimestamp);
                                return m.format("L");
                            }
                        },
                        {
                            template: function (data) {
                                if (data.Purpose != "") {
                                    return "<button kendo-tooltip k-position=\"'right'\" k-content=\"'" + data.Purpose + "'\" class=\"transparent-background pull-right no-border\"><i class=\"fa fa-comment-o\"></i></button>";
                                }
                                return "<i>Ingen bemærkning angivet</i>";
                            },
                            title: "Bemærkning"
                        },
                        {
                            title: "Fraværsårsag",
                            template: function (data) {
                                switch (data.VacationType) {
                                    case "Care":
                                        return "Omsorgsdage";
                                    case "Optional":
                                        if (data.OptionalText != "") {
                                            return "Andet frav\u00E6r <button kendo-tooltip k-position=\"'right'\" k-content=\"'" + data.OptionalText + "'\" class=\"transparent-background pull-right no-border\">\n                                        <i class=\"fa fa-comment-o\"></i></button>";
                                        }
                                        return "Andet fravær";
                                    case "Regular":
                                        return "Almindelig Ferie";
                                    case "Senior":
                                        return "Seniordage";
                                    case "SixthVacationWeek":
                                        return "6. ferieuge";
                                    default:
                                        return "Andet";
                                }
                            }
                        },
                        {
                            field: "CreatedDateTimestamp",
                            template: function (data) {
                                var m = _this.moment.unix(data.CreatedDateTimestamp);
                                return m.format("L");
                            },
                            title: "Indberettet"
                        },
                        {
                            title: "Godkender",
                            field: "ResponsibleLeader.FullName",
                            template: function (data) {
                                if (data.ResponsibleLeader != 0 &&
                                    data.ResponsibleLeader != null &&
                                    data.ResponsibleLeader != undefined) {
                                    return data.ResponsibleLeader.FullName;
                                }
                                return "";
                            }
                        },
                        {
                            field: "Id",
                            template: function (data) { return ("<a ng-click=\"mvrCtrl.deleteClick(" + data.Id + ")\">Slet</a> | <a ui-sref=\".edit({vacationReportId:" + data.Id + "})\">Rediger</a>"); },
                            title: "Muligheder"
                        }
                    ],
                    scrollable: false
                };
            }
            MyPendingVacationReportsController.prototype.getVacationReportsUrl = function () {
                return "/odata/VacationReports?status=Pending&$expand=ResponsibleLeader &$filter=PersonId eq " + this.personId + " and VacationYear eq " + this.vacationYear;
            };
            MyPendingVacationReportsController.$inject = [
                "$scope",
                "$modal",
                "$rootScope",
                "VacationReport",
                "$timeout",
                "Person",
                "moment",
                "$state",
                "NotificationService"
            ];
            return MyPendingVacationReportsController;
        }(vacation.BaseMyVacationReportsController));
        angular.module("app.vacation").controller("MyPendingVacationReportsController", MyPendingVacationReportsController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=MyPendingVacationReportsController.js.map
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var MyRejectedVacationReportsController = (function (_super) {
            __extends(MyRejectedVacationReportsController, _super);
            function MyRejectedVacationReportsController($scope, $modal, $rootScope, VacationReport, $timeout, Person, moment, $state, NotificationService) {
                var _this = this;
                _super.call(this, $scope, $modal, $rootScope, VacationReport, $timeout, Person, moment, $state, NotificationService);
                this.$scope = $scope;
                this.$modal = $modal;
                this.$rootScope = $rootScope;
                this.VacationReport = VacationReport;
                this.$timeout = $timeout;
                this.Person = Person;
                this.moment = moment;
                this.$state = $state;
                this.NotificationService = NotificationService;
                this.vacationReportsOptions = {
                    autoBind: false,
                    dataSource: {
                        type: "odata-v4",
                        transport: {
                            read: {
                                url: this.getVacationReportsUrl(),
                                dataType: "json",
                                cache: false
                            }
                        },
                        pageSize: 20,
                        serverPaging: true,
                        serverAggregates: false,
                        serverSorting: true,
                        serverFiltering: true,
                        sort: { field: "StartTimestamp", dir: "desc" }
                    },
                    pageable: {
                        messages: {
                            display: "{0} - {1} af {2} indberetninger",
                            //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                            empty: "Ingen indberetninger at vise",
                            page: "Side",
                            of: "af {0}",
                            itemsPerPage: "indberetninger pr. side",
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
                            title: "Feriestart",
                            template: function (data) {
                                var m = _this.moment.unix(data.StartTimestamp);
                                return m.format("L");
                            }
                        },
                        {
                            title: "Ferieafslutning",
                            template: function (data) {
                                var m = _this.moment.unix(data.EndTimestamp);
                                return m.format("L");
                            }
                        },
                        {
                            template: function (data) {
                                if (data.Purpose != "") {
                                    return "<button kendo-tooltip k-position=\"'right'\" k-content=\"'" + data.Purpose + "'\" class=\"transparent-background pull-right no-border\"><i class=\"fa fa-comment-o\"></i></button>";
                                }
                                return "<i>Ingen bemærkning angivet</i>";
                            },
                            title: "Bemærkning"
                        },
                        {
                            title: "Fraværsårsag",
                            template: function (data) {
                                switch (data.VacationType) {
                                    case "Care":
                                        return "Omsorgsdage";
                                    case "Optional":
                                        if (data.OptionalText != "") {
                                            return "Andet frav\u00E6r <button kendo-tooltip k-position=\"'right'\" k-content=\"'" + data.OptionalText + "'\" class=\"transparent-background pull-right no-border\">\n                                        <i class=\"fa fa-comment-o\"></i></button>";
                                        }
                                        return "Andet fravær";
                                    case "Regular":
                                        return "Almindelig Ferie";
                                    case "Senior":
                                        return "Seniordage";
                                    case "SixthVacationWeek":
                                        return "6. ferieuge";
                                    default:
                                        return "Andet";
                                }
                            }
                        },
                        {
                            field: "CreatedDateTimestamp",
                            template: function (data) {
                                var m = _this.moment.unix(data.CreatedDateTimestamp);
                                return m.format("L");
                            },
                            title: "Indberettet"
                        },
                        {
                            field: "Comment",
                            title: "Begrundelse",
                            template: function (data) {
                                if (data.Comment != "") {
                                    return "<button kendo-tooltip k-position=\"'right'\" k-content=\"'" + data.Comment + "'\" class=\"transparent-background pull-right no-border\"><i class=\"fa fa-comment-o\"></i></button>";
                                }
                                return "<i>Ingen begrundelse angivet</i>";
                            }
                        },
                        {
                            field: "ClosedDateTimestamp",
                            title: "Afvist dato",
                            template: function (data) {
                                var m = moment.unix(data.ClosedDateTimestamp);
                                return m.format("L");
                            }
                        },
                        {
                            field: "ApprovedBy.FullName",
                            title: "Afvist af",
                            template: function (data) { return (data.ApprovedBy.FullName); }
                        }
                    ],
                    scrollable: false
                };
            }
            MyRejectedVacationReportsController.prototype.getVacationReportsUrl = function () {
                return "/odata/VacationReports?status=Rejected&$expand=ApprovedBy($select=FullName) &$filter=PersonId eq " + this.personId + " and VacationYear eq " + this.vacationYear;
            };
            MyRejectedVacationReportsController.$inject = [
                "$scope",
                "$modal",
                "$rootScope",
                "VacationReport",
                "$timeout",
                "Person",
                "moment",
                "$state",
                "NotificationService"
            ];
            return MyRejectedVacationReportsController;
        }(vacation.BaseMyVacationReportsController));
        angular.module("app.vacation").controller("MyRejectedVacationReportsController", MyRejectedVacationReportsController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=MyRejectedVacationReportsController.js.map
var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var VacationOverviewController = (function () {
            function VacationOverviewController($scope, $rootScope, VacationReport, NotificationService, $http, moment, $state, $modal) {
                var _this = this;
                this.$scope = $scope;
                this.$rootScope = $rootScope;
                this.VacationReport = VacationReport;
                this.NotificationService = NotificationService;
                this.$http = $http;
                this.moment = moment;
                this.$state = $state;
                this.$modal = $modal;
                this.pendingVacations = [];
                this.currentUser = $scope.CurrentUser;
                this.employments = [];
                angular.forEach(this.currentUser.Employments, function (value) {
                    value.PresentationString = value.Position + " - " + value.OrgUnit.LongDescription + " (" + value.EmploymentId + ")";
                    if (value.OrgUnit.HasAccessToVacation)
                        _this.employments.push(value);
                });
                this.chosenEmployment = this.employments[0];
                // Why is this used?
                var self = this;
                this.schedulerOptions = {
                    workDayStart: new Date("2010-01-01 00:00:00"),
                    workDayEnd: new Date("2010-01-01 23:59:59"),
                    views: [
                        {
                            type: "timelineMonth",
                            title: "Måned",
                            minorTickCount: 1,
                            columnWidth: 25,
                            dateHeaderTemplate: function (obj) {
                                var date = moment(obj.date);
                                var day = date.date();
                                var week = date.format('W');
                                var header = "";
                                if (date.weekday() === 0)
                                    header += "<span style=\"font-size:10px;\">" + week + "</span>";
                                return header + ("<br>" + day);
                            },
                        },
                        {
                            type: "timelineWeek",
                            title: "Uge",
                            minorTickCount: 6,
                            columnWidth: 40,
                            majorTick: 1440
                        }
                    ],
                    timezone: "Etc/UTC",
                    //This is kendo's save event. Label has been changed to 'Gem' in in "edit" event below.
                    save: function (e) {
                        e.preventDefault();
                    },
                    eventTemplate: kendo.template("<div class=\"schedule-vacation-template vacation-#= type.toLowerCase()#\"> # if (type == 'Care') { # O # } if (type == 'SixthVacationWeek') { # 6 # } if (type == 'Regular') { #  # } if (type == 'Senior') { # S # } if (type == 'Optional') { # V # } # </div>"),
                    editable: {
                        update: true,
                        move: false,
                        destroy: false,
                        resize: false,
                        confirmation: false
                    },
                    edit: function (e) {
                        e.preventDefault();
                        //$modal.open({
                        //    templateUrl: '/App/Vacation/ApproveVacation/ShowVacationReportView.html',
                        //    controller: 'ShowVacationReportController as svrc',
                        //    backdrop: "static",
                        //    resolve: {
                        //        report() {
                        //            return e.event;
                        //        }
                        //    }
                        //}).result.then(() => {
                        //    this.refresh();
                        //});
                    },
                    dataSource: {
                        autoBind: false,
                        type: "odata-v4",
                        batch: true,
                        transport: {
                            read: {
                                url: "/odata/VacationReports()?$expand=Person($select=FullName)&$filter=Person/Employments/any(e:e/OrgUnitId eq " + this.chosenEmployment.OrgUnit.Id + ")",
                                dataType: "json",
                                cache: false
                            }
                        },
                        serverFiltering: true,
                        schema: {
                            data: function (data) {
                                var events = [];
                                angular.forEach(data.value, function (value, key) {
                                    var startsOnFullDay = value.StartTime == null;
                                    var endsOnFullDay = value.EndTime == null;
                                    if (!startsOnFullDay) {
                                        var duration = _this.moment.duration(value.StartTime);
                                        value.StartTimestamp += duration.asSeconds();
                                    }
                                    if (!endsOnFullDay) {
                                        var duration = _this.moment.duration(value.EndTime);
                                        value.EndTimestamp += duration.asSeconds();
                                    }
                                    else {
                                        // Add 86400/24 hours to enddate
                                        value.EndTimestamp += 86400;
                                    }
                                    switch (value.VacationType) {
                                        case "Care":
                                            value.type = "Omsorgsdag";
                                            break;
                                        case "Optional":
                                            value.type = "Valgfri ferie";
                                            break;
                                        case "Regular":
                                            value.type = "Almindelig Ferie";
                                            break;
                                        case "Senior":
                                            value.type = "Seniordag";
                                            break;
                                        case "SixthVacationWeek":
                                            value.type = "6. ferieuge";
                                            break;
                                        default:
                                            value.type = "Andet";
                                            break;
                                    }
                                    if (value.Status != 'Rejected') {
                                        events.push(value);
                                    }
                                });
                                return events;
                            },
                            model: {
                                fields: {
                                    id: { type: "number", from: "Id" },
                                    title: {
                                        parse: function (data) { return ""; }
                                    },
                                    start: {
                                        type: "date",
                                        from: "StartTimestamp",
                                        parse: function (data) { return self.moment.unix(data).toDate(); }
                                    },
                                    end: {
                                        type: "date",
                                        from: "EndTimestamp",
                                        parse: function (data) { return self.moment.unix(data).toDate(); }
                                    },
                                    personId: { from: "PersonId" },
                                    description: { from: "Purpose" },
                                    status: { from: "Status" },
                                    type: { from: "VacationType" }
                                }
                            }
                        }
                    },
                    group: {
                        resources: ["People"],
                        orientation: "vertical"
                    },
                    resources: [
                        {
                            field: "status",
                            dataSource: [
                                {
                                    text: "Pending",
                                    value: "Pending",
                                    color: "#f1eb47"
                                },
                                {
                                    text: "Accepted",
                                    value: "Accepted",
                                    color: "#5cb85c"
                                },
                                {
                                    text: "Rejected",
                                    value: "Rejected",
                                    color: "#d9534f"
                                }
                            ]
                        },
                        {
                            field: "personId",
                            name: "People",
                            dataValueField: "Id",
                            dataTextField: "FullName",
                            dataSource: {
                                type: "odata-v4",
                                transport: {
                                    read: {
                                        url: "/odata/Person/Service.PeopleInMyOrganisation(Id=" + this.chosenEmployment.Id + ")",
                                        dataType: "json",
                                        cache: false
                                    }
                                }
                            }
                        }
                    ],
                    footer: false
                };
            }
            VacationOverviewController.prototype.goToDate = function (time) {
                time = Number(time);
                this.scheduler.date(new Date(time));
            };
            ;
            VacationOverviewController.prototype.refresh = function () {
                this.scheduler.dataSource.read();
            };
            VacationOverviewController.$inject = [
                "$scope",
                "$rootScope",
                "VacationReport",
                "NotificationService",
                "$http",
                "moment",
                "$state",
                "$modal"
            ];
            return VacationOverviewController;
        }());
        angular.module("app.vacation").controller("VacationOverviewController", VacationOverviewController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=VacationOverviewController.js.map
var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var BaseReportVacationController = (function () {
            function BaseReportVacationController($scope, Person, $rootScope, VacationReport, // TODO Make $resource class
                NotificationService, VacationBalanceResource, moment) {
                var _this = this;
                this.$scope = $scope;
                this.Person = Person;
                this.$rootScope = $rootScope;
                this.VacationReport = VacationReport;
                this.NotificationService = NotificationService;
                this.VacationBalanceResource = VacationBalanceResource;
                this.moment = moment;
                this.vacationStartsOnFullDay = true;
                this.vacationEndsOnFullDay = true;
                this.mimimumVacationStartDate = new Date(2016, 4, 1); // Can't report vacation before the system was launched. Might be changed later.
                this.saveButtenDisabled = true;
                this.isEditingVacation = false;
                this.startWeeks = [];
                this.endWeeks = [];
                this.children = [];
                this.timePickerOptions = {
                    format: "HH:mm",
                    value: new Date(2000, 0, 1, 0, 0, 0, 0)
                };
                this.currentUser = $scope.CurrentUser;
                VacationBalanceResource.query().$promise.then(function (data) {
                    _this.vacationBalances = data;
                    _this.calculateBalance();
                    if (_this.vacationBalances.length > 0) {
                        _this.positionUpdated();
                        _this.hasVacationBalance = true;
                    }
                    else {
                        _this.hasVacationBalance = false;
                    }
                });
                this.startCalendarOptions = {
                    month: {
                        empty: '<a class="k-link disable-k-link"></a>'
                    },
                    navigate: function (current) {
                        var value = current.sender.current();
                        if (value != undefined) {
                            _this.startWeeks = _this.updateWeeks(value);
                            _this.$scope.$apply();
                        }
                    }
                };
                this.endCalendarOptions = {
                    month: {
                        empty: '<span class="calendar-week-empty"> </span>'
                    },
                    navigate: function (current) {
                        var value = current.sender.current();
                        if (value != undefined) {
                            _this.endWeeks = _this.updateWeeks(value);
                            _this.$scope.$apply();
                        }
                    }
                };
                this.vacationDaysInPeriod = 0;
                this.$scope.$watch(function () { return _this.startDate; }, function () {
                    _this.updateCalendarRange();
                });
                this.employments = [];
                angular.forEach(this.currentUser.Employments, function (value) {
                    value.PresentationString = value.Position + " - " + value.OrgUnit.LongDescription + " (" + value.EmploymentId + ")";
                    if (value.OrgUnit.HasAccessToVacation)
                        _this.employments.push(value);
                });
            }
            BaseReportVacationController.prototype.updateWeeks = function (currentDate) {
                var m = moment(currentDate);
                var firstOfMonth = m.clone().startOf('month'), currentWeek = firstOfMonth.clone().day(0), output = [];
                if (firstOfMonth.isoWeekday() === 7 || firstOfMonth.isoWeekday() === 1) {
                    output.push(currentWeek.isoWeek());
                }
                while (output.length < 6) {
                    currentWeek.add(7, "d");
                    output.push(currentWeek.isoWeek());
                }
                return output;
            };
            BaseReportVacationController.prototype.sameMonth = function (a, b, other) {
                if (a.month() !== b.month()) {
                    return other;
                }
                return a.date();
            };
            BaseReportVacationController.prototype.GetChildFromId = function (id) {
                var arrayLength = this.children.length;
                for (var i = 0; i < arrayLength; i++) {
                    if (this.children[i].Id == id) {
                        return this.children[i];
                    }
                }
                return null;
            };
            BaseReportVacationController.prototype.updateCalendarRange = function () {
                if (this.startDate > this.endDate) {
                    this.endDate = this.startDate;
                }
            };
            BaseReportVacationController.prototype.positionUpdated = function () {
                var _this = this;
                var selectedPostion = this.position;
                var vacationBalances = this.vacationBalances;
                for (var v in vacationBalances) {
                    if (vacationBalances.hasOwnProperty(v)) {
                        var vb = vacationBalances[v];
                        if (vb.EmploymentId == selectedPostion) {
                            this.vacationBalance = vb;
                        }
                    }
                }
                this.Person.GetChildren({ id: selectedPostion }).$promise.then(function (data) {
                    _this.children = data;
                });
            };
            BaseReportVacationController.prototype.childUpdated = function () {
            };
            BaseReportVacationController.prototype.clearReport = function () {
                this.initializeReport();
            };
            BaseReportVacationController.prototype.calculateBalance = function () {
                var totalVacation = this.vacationBalances[0].VacationHours + this.vacationBalances[0].TransferredHours;
                this.vacationHours = Math.floor(totalVacation);
                this.vacationMinutes = Math.round((totalVacation - this.vacationHours) * 60);
                this.freeVacationHours = Math.floor(this.vacationBalances[0].FreeVacationHours);
                this.freeVacationMinutes = Math.round((this.vacationBalances[0].FreeVacationHours - this.freeVacationHours) * 60);
            };
            return BaseReportVacationController;
        }());
        vacation.BaseReportVacationController = BaseReportVacationController;
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=BaseReportVacationController.js.map
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var CreateReportVacationController = (function (_super) {
            __extends(CreateReportVacationController, _super);
            function CreateReportVacationController($scope, Person, $rootScope, VacationReport, // TODO Make $resource class
                NotificationService, VacationBalanceResource, moment) {
                _super.call(this, $scope, Person, $rootScope, VacationReport, NotificationService, VacationBalanceResource, moment);
                this.$scope = $scope;
                this.Person = Person;
                this.$rootScope = $rootScope;
                this.VacationReport = VacationReport;
                this.NotificationService = NotificationService;
                this.VacationBalanceResource = VacationBalanceResource;
                this.moment = moment;
                this.initializeReport();
            }
            CreateReportVacationController.prototype.initializeReport = function () {
                this.startDate = new Date();
                this.endDate = new Date();
                this.maxEndDate = new Date();
                this.purpose = undefined;
                this.careCpr = undefined;
                this.optionalText = undefined;
                this.vacationStartsOnFullDay = true;
                this.vacationEndsOnFullDay = true;
                this.startTime; // = new Date(2000, 0, 1, 8, 0, 0, 0); // Only time is relevant, date is ignored by kendo
                this.endTime; // = new Date(2000, 0, 1, 16, 0, 0, 0);
                this.vacationType = undefined;
            };
            CreateReportVacationController.prototype.changefullday = function () {
                this.vacationEndsOnFullDay = !this.vacationEndsOnFullDay;
            };
            CreateReportVacationController.prototype.saveReport = function () {
                var _this = this;
                if (!this.vacationEndsOnFullDay && (this.endTime == null || this.startTime == null)) {
                    this.NotificationService
                        .AutoFadeNotification("danger", "", "Du skal vælge både et start- og et sluttidspunkt");
                    return;
                }
                if (this.startDate.getDate() == this.endDate.getDate() && this.endTime < this.startTime) {
                    this.NotificationService
                        .AutoFadeNotification("danger", "", "Sluttidspunkt må ikke være før starttidspunkt");
                    return;
                }
                var report = new this.VacationReport();
                report.StartTimestamp = this.moment(this.startDate).unix();
                report.EndTimestamp = this.moment(this.endDate).unix();
                report.EmploymentId = this.position;
                report.Purpose = this.purpose;
                report.PersonId = this.currentUser.Id;
                report.Status = "Pending";
                report.CreatedDateTimestamp = Math.floor(Date.now() / 1000);
                report.VacationType = this.vacationType;
                report.OptionalText = this.optionalText;
                if (this.vacationType == "Care") {
                    var child = this.GetChildFromId(this.child);
                    report.AdditionalData = String(child.Id);
                    report.OptionalText = child.FullName;
                }
                if (!this.vacationStartsOnFullDay) {
                    report.StartTime = "P0DT" + this.startTime.getHours() + "H" + this.startTime.getMinutes() + "M0S";
                }
                else {
                    report.StartTime = null;
                }
                if (!this.vacationEndsOnFullDay) {
                    report.EndTime = "P0DT" + this.endTime.getHours() + "H" + this.endTime.getMinutes() + "M0S";
                }
                else {
                    report.EndTime = null;
                }
                report.$save(function () {
                    _this.NotificationService
                        .AutoFadeNotification("success", "", "Din indberetning er sendt til godkendelse.");
                    _this.clearReport();
                    _this.saveButtenDisabled = false;
                }, function () {
                    _this.saveButtenDisabled = false;
                    _this.NotificationService
                        .AutoFadeNotification("danger", "", "Der opstod en fejl under oprettelsen af din ferieindberetning (Holder du allerede ferie i den valgte periode?).");
                });
            };
            CreateReportVacationController.$inject = [
                "$scope",
                "Person",
                "$rootScope",
                "VacationReport",
                "NotificationService",
                "VacationBalanceResource",
                "moment"
            ];
            return CreateReportVacationController;
        }(vacation.BaseReportVacationController));
        angular.module("app.vacation").controller("CreateReportVacationController", CreateReportVacationController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=CreateReportVacationController.js.map
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var EditReportVacationController = (function (_super) {
            __extends(EditReportVacationController, _super);
            function EditReportVacationController($scope, Person, $rootScope, VacationReport, // TODO Make $resource class
                NotificationService, VacationBalanceResource, moment, $modal, $modalInstance, vacationReportId) {
                _super.call(this, $scope, Person, $rootScope, VacationReport, NotificationService, VacationBalanceResource, moment);
                this.$scope = $scope;
                this.Person = Person;
                this.$rootScope = $rootScope;
                this.VacationReport = VacationReport;
                this.NotificationService = NotificationService;
                this.VacationBalanceResource = VacationBalanceResource;
                this.moment = moment;
                this.$modal = $modal;
                this.$modalInstance = $modalInstance;
                this.vacationReportId = vacationReportId;
                this.initializeReport();
                this.isEditingReport = true;
            }
            EditReportVacationController.prototype.initializeReport = function () {
                var _this = this;
                var report = this.VacationReport.get({ id: this.vacationReportId }, function () {
                    _this.startDate = _this.moment.utc(report.StartTimestamp, "X").toDate();
                    _this.endDate = _this.moment.utc(report.EndTimestamp, "X").toDate();
                    _this.vacationStartsOnFullDay = report.StartTime == null;
                    _this.vacationEndsOnFullDay = report.EndTime == null;
                    if (!_this.vacationStartsOnFullDay) {
                        var date = new Date();
                        var duration = _this.moment.duration(report.StartTime);
                        date.setHours(duration.hours());
                        date.setMinutes(duration.minutes());
                        _this.startTime = date;
                    }
                    if (!_this.vacationEndsOnFullDay) {
                        var date = new Date();
                        var duration = _this.moment.duration(report.EndTime);
                        date.setHours(duration.hours());
                        date.setMinutes(duration.minutes());
                        _this.endTime = date;
                    }
                    _this.purpose = report.Purpose;
                    _this.optionalText = report.OptionalText;
                    _this.vacationType = report.VacationType;
                    _this.position = report.EmploymentId;
                    if (report.VacationType == "Care") {
                        _this.child = report.AdditionalData;
                    }
                });
            };
            EditReportVacationController.prototype.saveReport = function () {
                var _this = this;
                var report = new this.VacationReport();
                report.StartTimestamp = this.moment(this.startDate).unix();
                report.EndTimestamp = this.moment(this.endDate).unix();
                report.EmploymentId = this.position;
                report.Purpose = this.purpose;
                report.OptionalText = this.optionalText;
                report.PersonId = this.currentUser.Id;
                report.Status = "Pending";
                report.CreatedDateTimestamp = Math.floor(Date.now() / 1000);
                report.VacationType = this.vacationType;
                if (this.vacationType == "Care") {
                    var child = this.GetChildFromId(this.child);
                    report.AdditionalData = String(child.Id);
                    report.OptionalText = child.FullName;
                }
                if (!this.vacationStartsOnFullDay) {
                    report.StartTime = "P0DT" + this.startTime.getHours() + "H" + this.startTime.getMinutes() + "M0S";
                }
                else {
                    report.StartTime = null;
                }
                if (!this.vacationEndsOnFullDay) {
                    report.EndTime = "P0DT" + this.endTime.getHours() + "H" + this.endTime.getMinutes() + "M0S";
                }
                else {
                    report.EndTime = null;
                }
                report.Id = this.vacationReportId;
                report.$update({ id: this.vacationReportId }, function () {
                    _this.NotificationService
                        .AutoFadeNotification("success", "", "Din indberetning er blevet rédigeret.");
                    _this.$modalInstance.close();
                }, function () {
                    _this.saveButtenDisabled = false;
                    _this.NotificationService
                        .AutoFadeNotification("danger", "", "Der opstod en fejl under rédigering af din ferieindberetning (Holder du allerede ferie i den valgte periode?).");
                });
            };
            EditReportVacationController.prototype.closeModalWindow = function () {
                this.$modalInstance.dismiss();
            };
            EditReportVacationController.$inject = [
                "$scope",
                "Person",
                "$rootScope",
                "VacationReport",
                "NotificationService",
                "VacationBalanceResource",
                "moment",
                "$modal",
                "$modalInstance",
                "vacationReportId"
            ];
            return EditReportVacationController;
        }(vacation.BaseReportVacationController));
        angular.module("app.vacation").controller("EditReportVacationController", EditReportVacationController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=EditReportVacationController .js.map
var app;
(function (app) {
    var vacation;
    (function (vacation) {
        var resources;
        (function (resources) {
            angular.module('app.vacation')
                .factory('VacationBalanceResource', [
                '$resource', function ($resource) {
                    var getAction = {
                        method: "GET",
                        isArray: true,
                        transformResponse: function (res) {
                            return angular.fromJson(res).value;
                        }
                    };
                    var queryAction = {
                        method: "GET",
                        isArray: true,
                        transformResponse: function (res) {
                            return angular.fromJson(res).value;
                        }
                    };
                    var vacationForEmploymentAction = {
                        method: "GET",
                        url: '/odata/VacationBalance/Service.VacationForEmployment(Id=:id)',
                        isArray: false,
                        transformResponse: function (res) {
                            var value = angular.fromJson(res);
                            return value;
                        }
                    };
                    var vacationForEmployeeAction = {
                        method: "GET",
                        url: '/odata/VacationBalance/Service.VacationForEmployee(Id=:id)',
                        isArray: false,
                        transformResponse: function (res) {
                            var value = angular.fromJson(res);
                            return value;
                        }
                    };
                    return $resource("/odata/VacationBalance(:id)?:query", { id: "@id", query: "@query" }, {
                        get: getAction,
                        query: queryAction,
                        forEmployment: vacationForEmploymentAction,
                        forEmployee: vacationForEmployeeAction
                    });
                }
            ]);
        })(resources = vacation.resources || (vacation.resources = {}));
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=VacationBalanceResource.js.map
angular.module("app.vacation").service('VacationReport', ["$resource", function ($resource) {
    return $resource("/odata/VacationReports(:id)?:query&emailText=:emailText", { id: "@id", query: "@query", emailText: "@emailText" }, {
        "get": {
            method: "GET",
            isArray: false,
            transformResponse: function (res) {
                return angular.fromJson(res).value[0];
            }
        },
        "create": {
            method: "POST",
            isArray: false
        },
        "approve": {
            method: "GET",
            isArray: false,
            url: "/odata/VacationReports/Service.ApproveReport(Key=:id)"
        },
        "reject": {
            method: "GET",
            isArray: false,
            url: "/odata/VacationReports/Service.RejectReport(Key=:id)?comment=:comment"
        },
        "update": {
            method: "PUT",
            isArray: false
        },
        "getLatest": {
            method: "GET",
            isArray: false,
            url: "/odata/VacationReports/Service.GetLatestReportForUser?personId=:id",
            transformResponse: function (data) {
                var res = angular.fromJson(data);
                return res;
            }
        }
    });
}]);