var app;
(function (app) {
    var core;
    (function (core) {
        var services;
        (function (services) {
            var Principal = (function () {
                function Principal($q, $rootScope, Person) {
                    this.$q = $q;
                    this.$rootScope = $rootScope;
                    this.Person = Person;
                    this._authenticated = false;
                    this._roles = [];
                    this._accessibleModules = [];
                }
                Principal.prototype.isIdentityResolved = function () {
                    return angular.isDefined(this._identity);
                };
                Principal.prototype.isAuthenticated = function () {
                    return this._authenticated;
                };
                Principal.prototype.accessibleModules = function () {
                    return this._accessibleModules;
                };
                Principal.prototype.isInRole = function (role) {
                    if (!this._authenticated)
                        return false;
                    return this._roles.indexOf(role) !== -1;
                };
                Principal.prototype.isInAnyRole = function (roles) {
                    if (!this._authenticated)
                        return false;
                    for (var i = 0; i < roles.length; i++) {
                        if (this.isInRole(roles[i]))
                            return true;
                    }
                    return false;
                };
                Principal.prototype.authenticated = function (identity) {
                    this._identity = identity;
                    this._authenticated = identity != null;
                };
                Principal.prototype.identity = function (force) {
                    var _this = this;
                    if (force === void 0) { force = false; }
                    var deferred = this.$q.defer();
                    if (force)
                        this._identity = undefined;
                    if (angular.isDefined(this._identity)) {
                        deferred.resolve(this._identity);
                        return deferred.promise;
                    }
                    this.Person.GetCurrentUser(function (data) {
                        _this._identity = data;
                        if (data.IsAdmin) {
                            _this._roles.push('Admin');
                        }
                        if (data.IsLeader || data.IsSubstitute) {
                            _this._roles.push('Approver');
                        }
                        if (data.isLeader) {
                            _this._roles.push('Leader');
                        }
                        // All org units can access the drive module.
                        _this._accessibleModules.push("drive");
                        // Loop to find if the person has an employment with access to vacation
                        for (var i = 0; i < data.Employments.length; i++) {
                            var employment = data.Employments[i];
                            if (employment.OrgUnit.HasAccessToVacation || data.IsAdmin) {
                                _this._accessibleModules.push("vacation");
                                break;
                            }
                        }
                        // The rootscope assignments is all used in (old)code for fallback safety
                        // New code should use Principal.Identity() instead of $rootScope.CurrentUser
                        _this.$rootScope.CurrentUser = data;
                        _this.$rootScope.showAdministration = data.IsAdmin;
                        _this.$rootScope.showApproveReports = data.IsLeader || data.IsSubstitute;
                        _this.$rootScope.UserName = data.FullName;
                        _this.$rootScope.loaded = true;
                        _this._authenticated = true;
                        deferred.resolve(_this._identity);
                    }, function () {
                        _this._identity = null;
                        _this._authenticated = false;
                        _this._roles = [];
                        _this.$rootScope.loaded = false;
                        deferred.resolve(_this._identity);
                    });
                    return deferred.promise;
                };
                Principal.$inject = [
                    "$q",
                    "$rootScope",
                    "Person"
                ];
                return Principal;
            }());
            services.Principal = Principal;
            angular.module("app.core").service("Principal", Principal);
        })(services = core.services || (core.services = {}));
    })(core = app.core || (app.core = {}));
})(app || (app = {}));
//# sourceMappingURL=Principal.js.map