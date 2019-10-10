var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var BaseReportVacationController = (function () {
            function BaseReportVacationController($scope, Person, $rootScope, VacationReport, // TODO Make $resource class
                NotificationService, VacationBalanceResource, moment) {
                var _this = this;
                this.$scope = $scope;
                this.Person = Person;
                this.$rootScope = $rootScope;
                this.VacationReport = VacationReport;
                this.NotificationService = NotificationService;
                this.VacationBalanceResource = VacationBalanceResource;
                this.moment = moment;
                this.vacationStartsOnFullDay = true;
                this.vacationEndsOnFullDay = true;
                this.mimimumVacationStartDate = new Date(2016, 4, 1); // Can't report vacation before the system was launched. Might be changed later.
                this.saveButtenDisabled = true;
                this.isEditingVacation = false;
                this.startWeeks = [];
                this.endWeeks = [];
                this.children = [];
                this.timePickerOptions = {
                    format: "HH:mm",
                    value: new Date(2000, 0, 1, 0, 0, 0, 0)
                };
                this.currentUser = $scope.CurrentUser;
                VacationBalanceResource.query().$promise.then(function (data) {
                    _this.vacationBalances = data;
                    _this.calculateBalance();
                    if (_this.vacationBalances.length > 0) {
                        _this.positionUpdated();
                        _this.hasVacationBalance = true;
                    }
                    else {
                        _this.hasVacationBalance = false;
                    }
                });
                this.startCalendarOptions = {
                    month: {
                        empty: '<a class="k-link disable-k-link"></a>'
                    },
                    navigate: function (current) {
                        var value = current.sender.current();
                        if (value != undefined) {
                            _this.startWeeks = _this.updateWeeks(value);
                            _this.$scope.$apply();
                        }
                    }
                };
                this.endCalendarOptions = {
                    month: {
                        empty: '<span class="calendar-week-empty"> </span>'
                    },
                    navigate: function (current) {
                        var value = current.sender.current();
                        if (value != undefined) {
                            _this.endWeeks = _this.updateWeeks(value);
                            _this.$scope.$apply();
                        }
                    }
                };
                this.vacationDaysInPeriod = 0;
                this.$scope.$watch(function () { return _this.startDate; }, function () {
                    _this.updateCalendarRange();
                });
                this.employments = [];
                angular.forEach(this.currentUser.Employments, function (value) {
                    value.PresentationString = value.Position + " - " + value.OrgUnit.LongDescription + " (" + value.EmploymentId + ")";
                    if (value.OrgUnit.HasAccessToVacation)
                        _this.employments.push(value);
                });
            }
            BaseReportVacationController.prototype.updateWeeks = function (currentDate) {
                var m = moment(currentDate);
                var firstOfMonth = m.clone().startOf('month'), currentWeek = firstOfMonth.clone().day(0), output = [];
                if (firstOfMonth.isoWeekday() === 7 || firstOfMonth.isoWeekday() === 1) {
                    output.push(currentWeek.isoWeek());
                }
                while (output.length < 6) {
                    currentWeek.add(7, "d");
                    output.push(currentWeek.isoWeek());
                }
                return output;
            };
            BaseReportVacationController.prototype.sameMonth = function (a, b, other) {
                if (a.month() !== b.month()) {
                    return other;
                }
                return a.date();
            };
            BaseReportVacationController.prototype.GetChildFromId = function (id) {
                var arrayLength = this.children.length;
                for (var i = 0; i < arrayLength; i++) {
                    if (this.children[i].Id == id) {
                        return this.children[i];
                    }
                }
                return null;
            };
            BaseReportVacationController.prototype.updateCalendarRange = function () {
                if (this.startDate > this.endDate) {
                    this.endDate = this.startDate;
                }
            };
            BaseReportVacationController.prototype.positionUpdated = function () {
                var _this = this;
                var selectedPostion = this.position;
                var vacationBalances = this.vacationBalances;
                for (var v in vacationBalances) {
                    if (vacationBalances.hasOwnProperty(v)) {
                        var vb = vacationBalances[v];
                        if (vb.EmploymentId == selectedPostion) {
                            this.vacationBalance = vb;
                        }
                    }
                }
                this.Person.GetChildren({ id: selectedPostion }).$promise.then(function (data) {
                    _this.children = data;
                });
            };
            BaseReportVacationController.prototype.childUpdated = function () {
            };
            BaseReportVacationController.prototype.clearReport = function () {
                this.initializeReport();
            };
            BaseReportVacationController.prototype.calculateBalance = function () {
                var totalVacation = this.vacationBalances[0].VacationHours + this.vacationBalances[0].TransferredHours;
                this.vacationHours = Math.floor(totalVacation);
                this.vacationMinutes = Math.round((totalVacation - this.vacationHours) * 60);
                this.freeVacationHours = Math.floor(this.vacationBalances[0].FreeVacationHours);
                this.freeVacationMinutes = Math.round((this.vacationBalances[0].FreeVacationHours - this.freeVacationHours) * 60);
            };
            return BaseReportVacationController;
        }());
        vacation.BaseReportVacationController = BaseReportVacationController;
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=BaseReportVacationController.js.map