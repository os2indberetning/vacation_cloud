var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var ApproveVacationController = (function () {
            function ApproveVacationController() {
                this.tabData = [
                    {
                        heading: 'Overblik',
                        route: 'vacation.approve.pending'
                    },
                    {
                        heading: 'Feriesaldo',
                        route: 'vacation.approve.balance'
                    },
                    {
                        heading: 'Stedfortrædere',
                        route: 'vacation.approve.settings'
                    }
                ];
            }
            ApproveVacationController.$inject = [];
            return ApproveVacationController;
        }());
        angular.module("app.vacation").controller("ApproveVacationController", ApproveVacationController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=ApproveVacationController.js.map