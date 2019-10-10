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