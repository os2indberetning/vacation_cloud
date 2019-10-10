var app;
(function (app) {
    var core;
    (function (core) {
        var models;
        (function (models) {
            "use strict";
            var Person = (function () {
                function Person() {
                }
                return Person;
            }());
            models.Person = Person;
        })(models = core.models || (core.models = {}));
    })(core = app.core || (app.core = {}));
})(app || (app = {}));
//# sourceMappingURL=Person.js.map