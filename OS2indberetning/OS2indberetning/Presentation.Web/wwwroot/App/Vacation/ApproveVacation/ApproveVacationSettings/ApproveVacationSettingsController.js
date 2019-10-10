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