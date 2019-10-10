var app;
(function (app) {
    var core;
    (function (core) {
        var services;
        (function (services) {
            var Authorization = (function () {
                function Authorization($rootScope, $state, principal, EnabledApplications) {
                    this.$rootScope = $rootScope;
                    this.$state = $state;
                    this.principal = principal;
                    this._authenticated = false;
                    this.enabledModules = [];
                    this.enabledModules = EnabledApplications.toLowerCase().split(', ');
                }
                Authorization.prototype.getModule = function (state) {
                    return state.split('.')[0];
                };
                Authorization.prototype.isModuleEnabled = function (module) {
                    return this.enabledModules.indexOf(module) !== -1;
                };
                Authorization.prototype.authorize = function () {
                    var _this = this;
                    return this.principal.identity().then(function () {
                        var isAuthenticated = _this.principal.isAuthenticated();
                        var module = _this.getModule(_this.$rootScope.toState.name);
                        var modules = _this.intersect(_this.enabledModules, _this.principal.accessibleModules());
                        if (isAuthenticated) {
                            if (modules.length == 0) {
                                _this.$rootScope.hasAccess = false;
                            }
                            else if (module != 'default' && !_this.canAccessModule(module, modules)) {
                                // Trying to access inaccessible module, so redirect to start
                                _this.$state.go("default");
                            }
                            else if (module == 'default' && modules.length == 1) {
                                // Only has access to one module, so redirect to it.
                                if (modules == 'drive') {
                                    _this.$state.go("drive.driving");
                                }
                                else if (modules == 'vacation') {
                                    _this.$state.go("vacation.report");
                                }
                            }
                            else {
                                // Has access to module, so see if user has access to state otherwise redirect to start
                                if (_this.$rootScope.toState.data && _this.$rootScope.toState.data.roles
                                    && _this.$rootScope.toState
                                        .data.roles.length > 0
                                    && !_this.principal.isInAnyRole(_this.$rootScope.toState.data.roles)) {
                                    _this.$state.go("default");
                                }
                            }
                        }
                    });
                };
                Authorization.prototype.canAccessModule = function (module, modules) {
                    return modules.indexOf(module) !== -1;
                };
                Authorization.prototype.intersect = function (a, b) {
                    var t;
                    if (b.length > a.length)
                        t = b, b = a, a = t; // indexOf to loop over shorter
                    return a.filter(function (e) {
                        if (b.indexOf(e) !== -1)
                            return true;
                    });
                };
                Authorization.$inject = [
                    "$rootScope",
                    "$state",
                    "Principal",
                    "EnabledApplications"
                ];
                return Authorization;
            }());
            angular.module("app.core").service("Authorization", Authorization);
        })(services = core.services || (core.services = {}));
    })(core = app.core || (app.core = {}));
})(app || (app = {}));
//# sourceMappingURL=Authorization.js.map