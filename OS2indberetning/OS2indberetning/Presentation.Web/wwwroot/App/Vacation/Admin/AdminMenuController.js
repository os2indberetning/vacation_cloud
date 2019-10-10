var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var AdminMenuController = (function () {
            function AdminMenuController($scope, Person, $rootScope, HelpText) {
                this.$scope = $scope;
                this.Person = Person;
                this.$rootScope = $rootScope;
                this.HelpText = HelpText;
                this.currentUser = $scope.CurrentUser;
            }
            AdminMenuController.prototype.orgSettingsClicked = function () {
                this.$scope.$broadcast("Vacation.OrgSettingsClicked");
            };
            AdminMenuController.prototype.adminClicked = function () {
                this.$scope.$broadcast("Vacation.AdministrationClicked");
            };
            AdminMenuController.prototype.reportsClicked = function () {
                this.$scope.$broadcast("Vacation.ReportsClicked");
            };
            AdminMenuController.prototype.accountClicked = function () {
                this.$scope.$broadcast("Vacation.AccountClicked");
            };
            AdminMenuController.prototype.emailClicked = function () {
                this.$scope.$broadcast("Vacation.EmailClicked");
            };
            AdminMenuController.$inject = [
                "$scope",
                "Person",
                "$rootScope",
                "HelpText"
            ];
            return AdminMenuController;
        }());
        angular.module("app.vacation").controller("Vacation.AdminMenuController", AdminMenuController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=AdminMenuController.js.map