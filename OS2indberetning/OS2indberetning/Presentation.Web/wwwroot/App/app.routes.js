var app;
(function (app) {
    "use strict";
    var routes = (function () {
        function routes() {
        }
        routes.init = function ($stateProvider, $urlRouterProvider) {
            $stateProvider.
                state('default', {
                url: '/',
                templateUrl: '/App/app.html',
                resolve: {
                    authorize: ['Authorization',
                        function (Authorization) { return Authorization.authorize(); }
                    ]
                }
            });
            $stateProvider.state("drive", {
                url: "/drive",
                templateUrl: "/App/Drive/app.drive.html",
                abstract: true,
                resolve: {
                    authorize: ['Authorization',
                        function (Authorization) { return Authorization.authorize(); }
                    ]
                }
            });
            $stateProvider.state("vacation", {
                url: "/vacation",
                templateUrl: "/App/Vacation/app.vacation.html",
                abstract: true,
                resolve: {
                    authorize: ['Authorization',
                        function (Authorization) { return Authorization.authorize(); }
                    ]
                }
            });
            $urlRouterProvider.when("/drive", "/drive/driving");
            $urlRouterProvider.when("/vacation", "/vacation/report");
            $urlRouterProvider.otherwise("/");
            $urlRouterProvider.rule(function ($injector, $location) {
                var path = $location.path();
                var hasTrailingSlash = path[path.length - 1] === "/";
                if (hasTrailingSlash) {
                    var newPath = path.substr(0, path.length - 1);
                    return newPath;
                }
                return path;
            });
        };
        routes.$inject = ["$stateProvider", "$urlRouterProvider"];
        return routes;
    }());
    app.routes = routes;
    angular.module("app").config(routes.init);
})(app || (app = {}));
//# sourceMappingURL=app.routes.js.map