var app;
(function (app) {
    var vacation;
    (function (vacation) {
        var resources;
        (function (resources) {
            angular.module('app.vacation')
                .factory('VacationBalanceResource', [
                '$resource', function ($resource) {
                    var getAction = {
                        method: "GET",
                        isArray: true,
                        transformResponse: function (res) {
                            return angular.fromJson(res).value;
                        }
                    };
                    var queryAction = {
                        method: "GET",
                        isArray: true,
                        transformResponse: function (res) {
                            return angular.fromJson(res).value;
                        }
                    };
                    var vacationForEmploymentAction = {
                        method: "GET",
                        url: '/odata/VacationBalance/Service.VacationForEmployment(Id=:id)',
                        isArray: false,
                        transformResponse: function (res) {
                            var value = angular.fromJson(res);
                            return value;
                        }
                    };
                    var vacationForEmployeeAction = {
                        method: "GET",
                        url: '/odata/VacationBalance/Service.VacationForEmployee(Id=:id)',
                        isArray: false,
                        transformResponse: function (res) {
                            var value = angular.fromJson(res);
                            return value;
                        }
                    };
                    return $resource("/odata/VacationBalance(:id)?:query", { id: "@id", query: "@query" }, {
                        get: getAction,
                        query: queryAction,
                        forEmployment: vacationForEmploymentAction,
                        forEmployee: vacationForEmployeeAction
                    });
                }
            ]);
        })(resources = vacation.resources || (vacation.resources = {}));
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=VacationBalanceResource.js.map