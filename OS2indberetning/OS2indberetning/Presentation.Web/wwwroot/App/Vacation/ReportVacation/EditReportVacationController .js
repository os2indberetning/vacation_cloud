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