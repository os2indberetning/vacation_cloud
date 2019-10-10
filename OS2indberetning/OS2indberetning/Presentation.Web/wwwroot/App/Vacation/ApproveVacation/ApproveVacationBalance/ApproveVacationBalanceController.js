var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var ApproveVacationBalanceController = (function () {
            function ApproveVacationBalanceController($http, VacationBalanceResource) {
                var _this = this;
                this.$http = $http;
                this.VacationBalanceResource = VacationBalanceResource;
                this.isReady = false;
                $http.get("/odata/Person/Service.LeadersPeople(Type=1)").then(function (response) {
                    _this.persons = response.data.value;
                    angular.forEach(_this.persons, function (value, key) {
                        _this.getVacationBalance(value.Id, key);
                    });
                });
            }
            ApproveVacationBalanceController.prototype.getVacationBalance = function (id, idx) {
                var _this = this;
                this.VacationBalanceResource.forEmployee({ id: id }).$promise.then(function (data) {
                    _this.calculateBalance(data, idx);
                    if (idx === _this.persons.length - 1) {
                        _this.isReady = true;
                    }
                });
            };
            ApproveVacationBalanceController.prototype.calculateBalance = function (data, idx) {
                var vacationHours, vacationMinutes, freeVacationHours, freeVacationMinutes;
                if (data) {
                    var totalVacation = data.VacationHours + data.TransferredHours;
                    vacationHours = Math.floor(totalVacation);
                    vacationMinutes = Math.round((totalVacation - vacationHours) * 60);
                    freeVacationHours = Math.floor(data.FreeVacationHours);
                    freeVacationMinutes = Math.round((data.FreeVacationHours - freeVacationHours) * 60);
                }
                else {
                    vacationHours = 0;
                    vacationMinutes = 0;
                    freeVacationHours = 0;
                    freeVacationMinutes = 0;
                }
                this.persons[idx].VacationBalance = { vacationHours: vacationHours, vacationMinutes: vacationMinutes, freeVacationHours: freeVacationHours, freeVacationMinutes: freeVacationMinutes };
            };
            ApproveVacationBalanceController.$inject = [
                "$http",
                "VacationBalanceResource"
            ];
            return ApproveVacationBalanceController;
        }());
        angular.module("app.vacation").controller("ApproveVacationBalanceController", ApproveVacationBalanceController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=ApproveVacationBalanceController.js.map