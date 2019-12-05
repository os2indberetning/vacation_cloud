var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var ConfirmApproveAllVacationController = (function () {
            function ConfirmApproveAllVacationController($modalInstance, NotificationService) {
                this.$modalInstance = $modalInstance;
                this.NotificationService = NotificationService;
            }
            ConfirmApproveAllVacationController.prototype.confirmApprove = function () {
                this.$modalInstance.close();
            };
            ConfirmApproveAllVacationController.prototype.cancel = function () {
                this.$modalInstance.dismiss('cancel');
                this.NotificationService.AutoFadeNotification("warning", "", "Godkendelse af indberetningerne blev annulleret.");
            };
            ConfirmApproveAllVacationController.$inject = [
                "$modalInstance",
                "NotificationService"
            ];
            return ConfirmApproveAllVacationController;
        }());
        angular.module("app.vacation").controller("ConfirmApproveAllVacationController", ConfirmApproveAllVacationController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));