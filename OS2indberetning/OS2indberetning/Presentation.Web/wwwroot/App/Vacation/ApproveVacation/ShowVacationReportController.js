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