﻿angular.module("app.drive").service('RouteContainer', ["$resource", function ($resource) {
    return $resource("/odata/RouteContainer(:id)", { id: "@id" }, {
        "get": { method: "GET", isArray: false }
    });
}]);