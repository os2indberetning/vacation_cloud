var app;
(function (app) {
    var vacation;
    (function (vacation) {
        "use strict";
        var VacationAdminOrgUnitController = (function () {
            function VacationAdminOrgUnitController($scope, $rootScope, OrgUnit, NotificationService, Autocomplete, $modal) {
                this.$scope = $scope;
                this.$rootScope = $rootScope;
                this.OrgUnit = OrgUnit;
                this.NotificationService = NotificationService;
                this.Autocomplete = Autocomplete;
                this.$modal = $modal;
                this.selectedHasAccess = -1;
                this.orgUnits = Autocomplete.orgUnits();
                this.autoCompleteOptions = {
                    filter: "contains",
                    select: function (e) {
                        this.orgUnit = this.dataItem(e.item.index());
                    }
                };
                this.gridOptions = {
                    autoBind: false,
                    dataSource: {
                        type: "odata-v4",
                        transport: {
                            read: {
                                beforeSend: function (req) {
                                    req.setRequestHeader('Accept', 'application/json;odata=fullmetadata');
                                },
                                url: "/odata/OrgUnits",
                                dataType: "json",
                                cache: false
                            }
                        },
                        schema: {
                            model: {
                                fields: {
                                    OrgId: {
                                        editable: false
                                    },
                                    ShortDescription: {
                                        editable: false
                                    },
                                    LongDescription: {
                                        editable: false
                                    },
                                    HasAccessToVacation: {
                                        editable: false
                                    }
                                }
                            }
                        },
                        pageSize: 20,
                        serverPaging: true,
                        serverFiltering: true
                    },
                    sortable: true,
                    pageable: {
                        messages: {
                            display: "{0} - {1} af {2} organisationsenheder",
                            empty: "Ingen organisationsenheder at vise",
                            page: "Side",
                            of: "af {0}",
                            itemsPerPage: "Organisationsenheder pr. side",
                            first: "Gå til første side",
                            previous: "Gå til forrige side",
                            next: "Gå til næste side",
                            last: "Gå til sidste side",
                            refresh: "Genopfrisk"
                        },
                        pageSizes: [5, 10, 20, 30, 40, 50, 100, 150, 200]
                    },
                    dataBound: function () {
                        this.expandRow(this.tbody.find("tr.k-master-row").first());
                    },
                    editable: true,
                    columns: [
                        {
                            field: "OrgId",
                            title: "Organisations ID"
                        },
                        {
                            field: "ShortDescription",
                            title: "Kort beskrivelse"
                        },
                        {
                            field: "LongDescription",
                            title: "Lang beskrivelse"
                        },
                        {
                            field: "HasAccessToVacation",
                            title: "Adgang til ferie",
                            template: function (data) {
                                if (data.HasAccessToVacation) {
                                    return "<input type='checkbox' ng-click='orgUnitsCtrl.rowChecked(" + data.Id + ", false)' checked></input>";
                                }
                                else {
                                    return "<input type='checkbox' ng-click='orgUnitsCtrl.rowChecked(" + data.Id + ", true)'></input>";
                                }
                            }
                        }
                    ]
                };
            }
            VacationAdminOrgUnitController.prototype.orgUnitChanged = function (item) {
                /// <summary>
                /// Filters grid content
                /// </summary>
                /// <param name="item"></param>
                this.updateSourceUrl();
            };
            VacationAdminOrgUnitController.prototype.updateSourceUrl = function () {
                var url = "/odata/OrgUnits";
                if (Object.keys(this.chosenUnit).length !== 0) {
                    url += "?$filter=contains(LongDescription," + "'" + encodeURIComponent(this.chosenUnit + "')");
                }
                else {
                    if (this.selectedHasAccess !== -1)
                        url += "?$filter=HasAccessToFourKmRule eq " + (this.selectedHasAccess === 0 ? "false" : "true");
                }
                this.grid.dataSource.transport.options.read.url = url;
                this.grid.dataSource.read();
            };
            VacationAdminOrgUnitController.prototype.refreshGrid = function () {
                this.grid.dataSource.read();
            };
            VacationAdminOrgUnitController.prototype.rowChecked = function (orgUnitId, newValue) {
                /// <summary>
                /// Is called when the user checks an orgunit in the grid.
                /// Patches HasAccessToFourKmRule on the backend.
                /// </summary>
                /// <param name="id"></param>
                var _this = this;
                this.$modal.open({
                    templateUrl: '/App/Vacation/Admin/OrgUnits/VacationHasAccessToVacationModalView.html',
                    controller: 'VacationHasAccessToVacationModalController as vhatvmc',
                    backdrop: "static"
                }).result.then(function (res) {
                    _this.OrgUnit.SetVacationAccess({ id: orgUnitId, value: newValue, recursive: res }, function () {
                        if (newValue) {
                            _this.NotificationService.AutoFadeNotification("success", "", "Adgang til ferie tilføjet.");
                        }
                        else {
                            _this.NotificationService.AutoFadeNotification("success", "", "Adgang til ferie fjernet.");
                        }
                        _this.refreshGrid();
                    });
                });
            };
            VacationAdminOrgUnitController.$inject = [
                "$scope",
                "$rootScope",
                "OrgUnit",
                "NotificationService",
                "Autocomplete",
                "$modal"
            ];
            return VacationAdminOrgUnitController;
        }());
        angular.module("app.vacation").controller("VacationAdminOrgUnitController", VacationAdminOrgUnitController);
    })(vacation = app.vacation || (app.vacation = {}));
})(app || (app = {}));
//# sourceMappingURL=VacationAdminOrgUnitController.js.map