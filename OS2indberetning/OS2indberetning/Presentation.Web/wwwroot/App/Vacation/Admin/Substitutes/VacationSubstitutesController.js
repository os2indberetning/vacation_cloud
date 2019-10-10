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
        var ReportType = app.core.models.ReportType;
        var BaseSubstitutesController = app.core.controllers.BaseSubstitutesController;
        var VacationSubstitutesController = (function (_super) {
            __extends(VacationSubstitutesController, _super);
            function VacationSubstitutesController($scope, Person, $rootScope, HelpText, Autocomplete, $modal, $timeout, moment) {
                _super.call(this, $scope, Person, $rootScope, HelpText, Autocomplete, $modal, $timeout, moment, ReportType.Vacation);
                this.$scope = $scope;
                this.Person = Person;
                this.$rootScope = $rootScope;
                this.HelpText = HelpText;
                this.Autocomplete = Autocomplete;
                this.$modal = $modal;
                this.$timeout = $timeout;
                this.moment = moment;
            }
            VacationSubstitutesController.$inject = [
                "$scope",
                "Person",
                "$rootScope",
                "HelpText",
                "Autocomplete",
                "$modal",
                "$timeout",
                "moment"
            ];
            return VacationSubstitutesController;
        }(BaseSubstitutesController));
        angular.module("app.vacation").controller("Vacation.SubstitutesController", VacationSubstitutesController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=VacationSubstitutesController.js.map