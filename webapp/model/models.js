sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {
		mainModel: new sap.ui.model.json.JSONModel(),
		WHModel: new sap.ui.model.json.JSONModel(),
		globalModel: new JSONModel(),

		initialPropertyModel: function () {
			this.oPropertyModel = new sap.ui.model.json.JSONModel({
				EditHU: false,
				EditProduct: false,
				EditBatch: false,
				EditPdate: false,
				EditQty: false,
				HUProductVisi: true,
				NoHUVisible: false,
				PalletBuildSave: false,
				ActionSTO: true,
				ActionHU: true,
				ActionMassHU: true,
				PalletBuildTitle: "Pallet Build",

				Status: false
			});
			return this.oPropertyModel;
		},
		setCustomPropertyValue: function (sName, oValue) {
			sName = "/" + sName;
			this.oPropertyModel.setProperty(sName, oValue);
		},
		getCustomPropertyValue: function (sName) {
			sName = "/" + sName;
			return this.oPropertyModel.getProperty(sName);
		},
		getAudio: function () {
		//	var audio = new Audio("/sap/public/bc/its/mimes/itsmobile/99/sounds/all/sapsoundmsg.wav");
			var audio = new Audio("/sap/public/bc/zrfui/audio/beepbeep.mp3");
			
			return audio;
		},
		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		mainDataModel: function () {
			//debugger;
			var sServerUrl = '/sap/opu/odata/sap/ZGW_RFUI_IBPROC_SRV';

			this.mainModel = new sap.ui.model.odata.v2.ODataModel(
				sServerUrl);

		},
		// globalModel: function () {

		// 	var sServerUrl = '/sap/opu/odata/sap/ZGW_RFUI_WHPROC_SRV';

		// 	this.WHModel = new sap.ui.model.odata.v2.ODataModel(
		// 		sServerUrl);

		// },
		triggerSound: function (self) {
			var audio = self.getOwnerComponent().getModel("audio");
			//	audio.oncanplaythrough = function () {
			audio.loop = false;
			audio.play();
			//	};

		},
		getGlobalDetails: function (self, whModel) {
			var that = self;
			var oGlobalBusyDialog = new sap.m.BusyDialog();

			oGlobalBusyDialog.open();
			var globalModel = new JSONModel();
			var entity = "/ResourceDetailsSet(Resource='')"; //SHRINIVASG
			whModel.read(entity, {
				success: function (oData, oRes) {
					oGlobalBusyDialog.close();
					globalModel.setData(oData);
					that.getOwnerComponent().setModel(globalModel, "globalModel");
					if (globalModel.getProperty("/WarehouseType") === "LOC") {
						globalModel.setProperty("/BtnVisible", true);
					} else {

						globalModel.setProperty("/BtnVisible", false);

					}
				},
				error: function (oResponse) {
					oGlobalBusyDialog.close();
					oResponse = jQuery.parseJSON(oResponse.responseText);

					sap.m.MessageBox.error(oResponse.error.message.value, {
						title: "Result"
					});
				}
			});
		},
		getPrinterDetails: function (entity, self, whModel) {
			var that = self;
			var oGlobalBusyDialog = new sap.m.BusyDialog();

			oGlobalBusyDialog.open();
			//	var globalModel = new JSONModel();

			whModel.read(entity, {
				success: function (oData, oRes) {
					oGlobalBusyDialog.close();
					//	globalModel.setData(oData);
					that.getOwnerComponent().getModel("globalModel").setProperty("/Printer", oData.Printer);
				},
				error: function (oResponse) {
					oGlobalBusyDialog.close();
					oResponse = jQuery.parseJSON(oResponse.responseText);

					sap.m.MessageBox.error(oResponse.error.message.value, {
						title: "Result"
					});
				}
			});
		},
		getEntitySet: function (entity, filter, callBacksucess, callBackfail, oController) {

			var oGlobalBusyDialog = new sap.m.BusyDialog();

			oGlobalBusyDialog.open();
			this.mainModel.read(entity, {
				filters: filter,
				success: function (oData, oRes) {
					oGlobalBusyDialog.close();
					callBacksucess(oData, oController);
				},
				error: function (oResponse) {
					oGlobalBusyDialog.close();
					if (entity !== "/PackHuSet") {
						oResponse = jQuery.parseJSON(oResponse.responseText);

						sap.m.MessageBox.error(oResponse.error.message.value, {
							title: "Result"
						});
					}
					callBackfail(oController, oResponse);
				}
			});
		},
		getEntitySingle: function (entity, filter, callBack, oController) {

			//	var that = this;
			var oGlobalBusyDialog = new sap.m.BusyDialog();

			oGlobalBusyDialog.open();

			this.mainModel.read(entity, {
				success: function (oData, oRes) {
					oGlobalBusyDialog.close();
					callBack(oData, oController, "S");
				},
				error: function (oResponse) {
					oGlobalBusyDialog.close();

					oResponse = jQuery.parseJSON(oResponse.responseText);

					sap.m.MessageBox.error(oResponse.error.message.value, {
						title: "Result"
					});
					callBack("", oController, "E");
				}
			});
		},
		getEntitySingleMaterial: function (whModel, entity, callBackSuss, callBackFail,oController) {

			//	var that = this;
			var oGlobalBusyDialog = new sap.m.BusyDialog();

			oGlobalBusyDialog.open();

			whModel.read(entity, {
				success: function (oData, oRes) {
					oGlobalBusyDialog.close();
					callBackSuss(oData, oController);
				},
				error: function (oResponse) {
					oGlobalBusyDialog.close();

					oResponse = jQuery.parseJSON(oResponse.responseText);

					sap.m.MessageBox.error(oResponse.error.message.value, {
						title: "Result"
					});
					callBackFail(oController);
				}
			});
		},
		getFuncttionImport: function (Warehouse, Container, Delivery, oController) {
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			this.mainModel.callFunction(
				"/getContainer", {
					method: "GET",
					urlParameters: {
						Container: Container,
						Warehouse: Warehouse,
						Delivery: Delivery

					},
					success: function (oData, response) {
						oGlobalBusyDialog.close();
						sap.m.MessageBox.show("Container has been submitted", {
							title: "Result"
						});
					},
					error: function (oResponse) {
						oGlobalBusyDialog.close();

						oResponse = jQuery.parseJSON(oResponse.responseText);

						sap.m.MessageBox.error(oResponse.error.message.value, {
							title: "Result"
						});
					}
				});
		},
		postEntitySingle: function (entity, odata, oController, callBackSucess, callBackFail, PartialQty) {
			//	var that = this;
			var oGlobalBusyDialog = new sap.m.BusyDialog();

			oGlobalBusyDialog.open();
			this.mainModel.create(entity, odata, {
				success: function (oData, oResponse) {
					oGlobalBusyDialog.close();

					try {
						var message = oResponse.headers["sap-message"];
						var messageText = JSON.parse(message);
						var msgValue = messageText.message;
						// oController.                         

						sap.m.MessageToast.show(messageText.message, {
							title: "Results"
						});
					} catch (e) {
						sap.m.MessageToast.show("Data Saved Sucessfully");
					}
					callBackSucess(oController, oData, msgValue, PartialQty);
					//	oController.callback(oData);
				},
				error: function (oResponse) {
					oGlobalBusyDialog.close();

					try {
						oResponse = jQuery.parseJSON(oResponse.responseText);

						sap.m.MessageBox.error(oResponse.error.message.value, {
							title: "Result"
						});
					} catch (e) {
						//
					}

					callBackFail(oController, oResponse);
				}
			});
		}

	};
});