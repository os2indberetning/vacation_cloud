var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var MyVacationReportsController = (function () {
            function MyVacationReportsController() {
                this.tabData = [
                    {
                        heading: 'Afventer',
                        route: 'vacation.myreports.pending'
                    },
                    {
                        heading: 'Godkendte',
                        route: 'vacation.myreports.approved'
                    },
                    {
                        heading: 'Afviste',
                        route: 'vacation.myreports.rejected'
                    }
                ];
            }
            MyVacationReportsController.$inject = [];
            return MyVacationReportsController;
        }());
        angular.module("app.vacation").controller("MyVacationReportsController", MyVacationReportsController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=MyVacationReportsController.js.map