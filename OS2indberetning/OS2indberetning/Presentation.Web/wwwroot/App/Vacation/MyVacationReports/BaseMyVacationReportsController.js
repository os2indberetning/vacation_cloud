var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var BaseMyVacationReportsController = (function () {
            function BaseMyVacationReportsController($scope, $modal, $rootScope, VacationReport, // TODO Make $resource interface for VacationReport
                $timeout, Person, moment, $state, NotificationService) {
                var _this = this;
                this.$scope = $scope;
                this.$modal = $modal;
                this.$rootScope = $rootScope;
                this.VacationReport = VacationReport;
                this.$timeout = $timeout;
                this.Person = Person;
                this.moment = moment;
                this.$state = $state;
                this.NotificationService = NotificationService;
                this.vacationYears = [];
                this.isGridLoaded = false;
                this.deleteClick = function (id) {
                    _this.$modal.open({
                        templateUrl: '/App/Vacation/MyVacationReports/ConfirmDeleteVacationReportTemplate.html',
                        controller: 'ConfirmDeleteVacationReportController as cdvrCtrl',
                        backdrop: "static",
                        resolve: {
                            itemId: function () {
                                return id;
                            }
                        }
                    }).result.then(function () {
                        _this.VacationReport.delete({ id: id }, function () {
                            _this.NotificationService.AutoFadeNotification("success", "", "Indberetningen blev slettet.");
                            _this.refreshGrid();
                        }, function () {
                            _this.NotificationService.AutoFadeNotification("error", "", "Fejl under sletning af indberetning.");
                        });
                    });
                };
                // Format for datepickers.
                this.dateOptions = {
                    format: "yyyy",
                    start: "decade",
                    depth: "decade"
                };
                this.loadInitialDate();
                // Set personId. The value on $rootScope is set in resolve in application.js
                this.personId = $rootScope.CurrentUser.Id;
                this.$scope.$on("kendoRendered", function () {
                    if (!_this.isGridLoaded) {
                        _this.isGridLoaded = true;
                        _this.refreshGrid();
                    }
                });
            }
            BaseMyVacationReportsController.prototype.refreshGrid = function () {
                if (!this.isGridLoaded)
                    return;
                this.vacationReportsGrid.dataSource.transport.options.read.url = this.getVacationReportsUrl();
                this.vacationReportsGrid.dataSource.read();
            };
            BaseMyVacationReportsController.prototype.clearClicked = function () {
                this.loadInitialDate();
                this.refreshGrid();
            };
            BaseMyVacationReportsController.prototype.loadInitialDate = function () {
                var currentDate = this.moment();
                // Vacation year changes every year on the 1th of May
                if (this.moment().isBefore(currentDate.year() + "-05-01")) {
                    currentDate = currentDate.subtract('year', 1);
                }
                this.vacationYear = currentDate.year();
                var minYear = Math.max(2016, this.vacationYear - 5); // Can't show vacation before 2016
                var maxYear = this.vacationYear + 5;
                for (var i = minYear; i < maxYear; i++) {
                    this.vacationYears.push({
                        Year: i,
                        YearString: i + "/" + (i + 1)
                    });
                }
            };
            return BaseMyVacationReportsController;
        }());
        vacation.BaseMyVacationReportsController = BaseMyVacationReportsController;
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=BaseMyVacationReportsController.js.map