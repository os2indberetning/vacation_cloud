var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (app) {
    var core;
    (function (core) {
        var models;
        (function (models) {
            "use strict";
            (function (VacationType) {
                VacationType[VacationType["Regular"] = 0] = "Regular";
                VacationType[VacationType["SixthVacationWeek"] = 1] = "SixthVacationWeek";
                VacationType[VacationType["Care"] = 2] = "Care";
                VacationType[VacationType["Senior"] = 3] = "Senior";
                VacationType[VacationType["Optional"] = 4] = "Optional";
                VacationType[VacationType["Other"] = 5] = "Other";
            })(models.VacationType || (models.VacationType = {}));
            var VacationType = models.VacationType;
            var VacationReport = (function (_super) {
                __extends(VacationReport, _super);
                function VacationReport() {
                    _super.apply(this, arguments);
                }
                return VacationReport;
            }(models.Report));
            models.VacationReport = VacationReport;
        })(models = core.models || (core.models = {}));
    })(core = app.core || (app.core = {}));
})(app || (app = {}));
//# sourceMappingURL=VacationReport.js.map