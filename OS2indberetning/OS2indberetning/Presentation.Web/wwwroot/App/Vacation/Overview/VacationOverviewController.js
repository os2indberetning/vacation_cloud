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