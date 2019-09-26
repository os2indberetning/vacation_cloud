﻿module app.vacation {
    "use strict";

    import Person = core.models.Person;
    import NotificationService = app.core.interfaces.NotificationService;

    class MyApprovedVacationReportsController extends BaseMyVacationReportsController {

        static $inject: string[] = [
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

        constructor(
            protected $scope,
            protected $modal: angular.ui.bootstrap.IModalService,
            protected $rootScope,
            protected VacationReport,
            protected $timeout: ng.ITimeoutService,
            protected Person: Person,
            protected moment: moment.MomentStatic,
            protected $state: ng.ui.IStateService,
            protected NotificationService: NotificationService) {

            super($scope, $modal, $rootScope, VacationReport, $timeout, Person, moment, $state, NotificationService);

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
                dataBound: function () {
                    this.expandRow(this.tbody.find("tr.k-master-row").first());
                },
                columns: [
                    {
                        title: "Feriestart",
                        template: data => {
                            const m = this.moment.unix(data.StartTimestamp);
                            return m.format("L");
                        }
                    },
                    {
                        title: "Ferieafslutning",
                        template: data => {
                            const m = this.moment.unix(data.EndTimestamp);
                            return m.format("L");
                        }
                    },
                    {
                        template: data => {
                            if (data.Purpose != "") {
                                return `<button kendo-tooltip k-position="'right'" k-content="'${data.Purpose}'" class="transparent-background pull-right no-border">
                                        <i class="fa fa-comment-o"></i></button>`;
                            }
                            return "<i>Ingen bemærkning angivet</i>";
                        },
                        title: "Bemærkning"
                    },
                    {
                        title: "Fraværsårsag",
                        template: data => {
                            switch (data.VacationType) {
                                case "Care":
                                    return "Omsorgsdage";
                                case "Optional":
                                    if (data.OptionalText != "") {
                                        return `Andet fravær <button kendo-tooltip k-position="'right'" k-content="'${data.OptionalText}'" class="transparent-background pull-right no-border">
                                        <i class="fa fa-comment-o"></i></button>`;
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
                        template: data => {
                            var m = this.moment.unix(data.CreatedDateTimestamp);
                            return m.format("L");
                        },
                        title: "Indberettet"
                    },
                    {
                        field: "ClosedDateTimestamp",
                        title: "Godkendelsesdato",
                        template: data => {
                            var m = this.moment.unix(data.ClosedDateTimestamp);
                            return m.format("L");
                        }
                    },
                    {
                        field: "ProcessedDateTimestamp",
                        title: "Afsendt til løn",
                        template: data => {
                            if (data.ProcessedDateTimestamp != 0 && data.ProcessedDateTimestamp != null && data.ProcessedDateTimestamp != undefined) {
                                const m = this.moment.unix(data.ProcessedDateTimestamp);
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
                        template: (data) => `<a ng-click="mvrCtrl.deleteClick(${data.Id})">Slet</a> | <a ui-sref=".edit({vacationReportId:${data.Id}})">Rediger</a>`,
                        title: "Muligheder"
                    }
                ],
                scrollable: false
            };
        }

        getVacationReportsUrl() {
            return `/odata/VacationReports?status=Accepted&$expand=ResponsibleLeader,ApprovedBy &$filter=PersonId eq ${this.personId} and VacationYear eq ${
                this.vacationYear}`;
        }
    }

    angular.module("app.vacation").controller("MyApprovedVacationReportsController", MyApprovedVacationReportsController);
}
