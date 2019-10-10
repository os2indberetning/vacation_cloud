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