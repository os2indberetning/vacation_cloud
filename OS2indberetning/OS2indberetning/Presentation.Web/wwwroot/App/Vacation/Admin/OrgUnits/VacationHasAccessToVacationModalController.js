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