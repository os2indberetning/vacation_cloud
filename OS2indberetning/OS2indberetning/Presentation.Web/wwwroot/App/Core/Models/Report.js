var app;
(function (app) {
    var core;
    (function (core) {
        var models;
        (function (models) {
            "use strict";
            (function (ReportStatus) {
                ReportStatus[ReportStatus["Pending"] = 0] = "Pending";
                ReportStatus[ReportStatus["Accepted"] = 1] = "Accepted";
                ReportStatus[ReportStatus["Rejected"] = 2] = "Rejected";
                ReportStatus[ReportStatus["Invoiced"] = 3] = "Invoiced";
            })(models.ReportStatus || (models.ReportStatus = {}));
            var ReportStatus = models.ReportStatus;
            (function (ReportType) {
                ReportType[ReportType["Unknown"] = -1] = "Unknown";
                ReportType[ReportType["Drive"] = 0] = "Drive";
                ReportType[ReportType["Vacation"] = 1] = "Vacation";
            })(models.ReportType || (models.ReportType = {}));
            var ReportType = models.ReportType;
            var Report = (function () {
                function Report() {
                }
                return Report;
            }());
            models.Report = Report;
        })(models = core.models || (core.models = {}));
    })(core = app.core || (app.core = {}));
})(app || (app = {}));
//# sourceMappingURL=Report.js.map