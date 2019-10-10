var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (app) {
    var drive;
    (function (drive) {
        "use strict";
        var ReportType = app.core.models.ReportType;
        var BaseSubstitutesController = app.core.controllers.BaseSubstitutesController;
        var DriveSubstitutesController = (function (_super) {
            __extends(DriveSubstitutesController, _super);
            function DriveSubstitutesController($scope, Person, $rootScope, HelpText, Autocomplete, $modal, $timeout, moment) {
                _super.call(this, $scope, Person, $rootScope, HelpText, Autocomplete, $modal, $timeout, moment, ReportType.Drive);
                this.$scope = $scope;
                this.Person = Person;
                this.$rootScope = $rootScope;
                this.HelpText = HelpText;
                this.Autocomplete = Autocomplete;
                this.$modal = $modal;
                this.$timeout = $timeout;
                this.moment = moment;
            }
            DriveSubstitutesController.$inject = [
                "$scope",
                "Person",
                "$rootScope",
                "HelpText",
                "Autocomplete",
                "$modal",
                "$timeout",
                "moment"
            ];
            return DriveSubstitutesController;
        }(BaseSubstitutesController));
        angular.module("app.drive").controller("Drive.SubstitutesController", DriveSubstitutesController);
    })(drive = app.drive || (app.drive = {}));
})(app || (app = {}));
//# sourceMappingURL=SubstitutesController.js.map