sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/BusyDialog",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "com/te/fi/report/utils/formatter",
], (Controller,
    Fragment,
    JSONModel,
    MessageToast,
    BusyDialog,
    Filter,
    FilterOperator,
    MessageBox,
    formatter) => {
    "use strict";

    return Controller.extend("com.te.fi.report.controller.Main", {
        onInit() {
            this.BusyDialog = new BusyDialog();
            let oLocalModel = new JSONModel();
            let oReportModel = new JSONModel();
            this.getView().setModel(oLocalModel, "oLocalModel");
            this.getView().setModel(oReportModel, "oReportModel");
            this.getView().setModel(this.getOwnerComponent().getModel("mainReport"));
        },
        _onRouteMatchListDisplay: function (oEvent) {

        },

        onSearch:async function(){
            let oView = this.getView();
            oView.setBusy(true);
            //get variant and TCode details
            let aReportColumn = [];
            let aReportData = [];
            var filterCollection = []
                filterCollection.push(new Filter("Tcode", FilterOperator.EQ, "FBL4N"));
                filterCollection.push(new Filter("Variant", FilterOperator.EQ, "INTERIM-RPT")); 
                var oFilter = new Array(new Filter({
                        filters: filterCollection,
                        and: true
                    }));

                aReportColumn = await this._fetchReportColumn(
                        oFilter
                    ).catch(function (oError) {
                        oView.setBusy(false);
                        MessageBox.error(`OData Service failed while fetching Varinat from S4HANA!`)
                    });
                aReportData = await this._fetchReportData(
                        oFilter
                    ).catch(function (oError) {
                        oView.setBusy(false);
                        MessageBox.error(`OData Service failed while fetching Varinat from S4HANA!`)
                    });

            //Read Data for Variant
            //oReportDetail = await this._fetchReportDetails();
            oView.setBusy(false);
            if(aReportColumn.length == 0 ){
                return MessageBox.information("No Records found.");
            }
            //Create Table Columns
            var oTable = this.getView().byId("idReportTable");
            oTable.removeAllColumns();
            var aColumns = Object.keys(aReportColumn.d.results[0]);
            var aColumnsHasData = Object.values(aReportColumn.d.results[0]);
            var aColumnValue = Object.values(aReportColumn.d.results[1]);
            //add 1st 3 column
            var countColumn = 0 ;
            for(var i = 0 ; i < 3 ; i ++){
                oTable.addColumn(new sap.m.Column({
                    header: new sap.m.Label({ text: aColumns[i] }),
                    text: new sap.m.Text({ text: aColumns[i]  })
                    }));
                    countColumn++
            }

            aColumns.forEach(function (col,index) {
                if(col.includes("field") && aColumnsHasData[index] !== ''){
                    oTable.addColumn(new sap.m.Column({
                        header: new sap.m.Label({ text: aColumnValue[index] }),
                        text: new sap.m.Text({ text: aColumnValue[index] })
                        }));
                        countColumn++
                }
            }
        );
                // === Bind Data with JSON Model ===
            const oModel = new sap.ui.model.json.JSONModel(aReportData.d);
            oView.setModel(oModel, "reportModel");

            //Create Table Items
            var aTColumnValue = aReportData.d.results;
            var oTemplate = new sap.m.ColumnListItem();
            var oFirstRow = aTColumnValue[0];
            for (const key in oFirstRow) {
                if (oFirstRow.hasOwnProperty(key)) {
                    oTemplate.addCell(new sap.m.Text({ text: `{reportModel>${key}}` }));
                }
            }
            oTemplate.removeCell(0);
            oTemplate.removeCell(0);
            // Bind table items
            oTable.bindItems({
                path: "reportModel>/results",
                template: oTemplate
            });
            oTable.removeColumn(0);
            oTable.removeColumn(0);

        },

        _fetchReportColumn: function (aFilters) { 
            // let oReportModel = this.getOwnerComponent().getModel("mainReport");
            // var that = this;
            // return new Promise(function (resolve, reject) {
            //     oReportModel.read("/ReportDataSet", {
            //         filters: aFilters,
            //         success: function (response) {
            //             resolve(response);
            //         },
            //         error: function (oError) {
            //             reject(oError);
            //             that.getView().setBusy(false);
            //         },
            //     });
            // });

            var settings = {
                "url": "/odata/v2/cap/ReportColumnDS4?$filter=Tcode%20eq%20%27FBL4N%27%20and%20Variant%20eq%20%27INTERIM-RPT%27",
                "method": "GET",
                "timeout": 0
              };
            var that = this;
            return new Promise(function (resolve, reject) {
                $.ajax(settings).done(function (response) {
                    resolve(response);
                  });
            });

        },

        _fetchReportData: function (aFilters) { 

            var settings = {
                "url": "/odata/v2/cap/ReportDataDS4?$filter=Tcode%20eq%20%27FBL4N%27%20and%20Variant%20eq%20%27INTERIM-RPT%27&$top=20",
                "method": "GET",
                "timeout": 0
              };
            var that = this;
            return new Promise(function (resolve, reject) {
                $.ajax(settings).done(function (response) {
                    resolve(response);
                  });
            });

        }
        
    });
});