﻿angular.module("app.drive").service('Token', ["$resource", function ($resource) {
    return $resource("/odata/MobileToken(:id)", { id: "@id" }, {
        "delete": { method: "DELETE" }
    });
}]);