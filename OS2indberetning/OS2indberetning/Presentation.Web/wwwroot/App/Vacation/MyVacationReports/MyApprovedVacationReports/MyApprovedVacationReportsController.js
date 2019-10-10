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