sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"wp/inbound/model/models",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/Text"
], function (Controller, MessageBox, Filter, JSONModel, MessageToast, Model, Dialog, DialogType, Button, ButtonType, List,
	StandardListItem, Text) {
	"use strict";

	return Controller.extend("wp.inbound.controller.STOList", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zewm.proto.zproto1.view.CrossDeck
		 */
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this.oRouteMatched, this);
				this.oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
		},
		oRouteMatched: function (oEvent) {
			if (oEvent.getParameter("name") === "STOListProcess") {

				this.globalModel = this.getOwnerComponent().getModel("globalModel");
                this.material = '';
                this._upcCode = "";
				var STOModel = new JSONModel();
				var oData = {};
				oData.Warehouse = '';

				oData.Ibd = '';
				oData.Product = '';
				oData.Item = '';
				oData.TargetQuantity = '';
				oData.QuantityVerif = '';
				oData.Uom = '';
				oData.AsnNumber = '';
				oData.ProductNewFlg = '';
				this.getView().byId("idSTOMaterial").setValue("");
				STOModel.setData(oData);
				this.getView().setModel(STOModel, "STOModel");
				//this.getView().getModel("STOModel").setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
				var ExceptionModel = new JSONModel();
				ExceptionModel.setProperty("/ExceptionCollection", []);
				this.getView().setModel(ExceptionModel, "ExceptionModel");
				this.getView().byId("idSTOMaterial").focus();
			}
			this.getView().byId("idSTOMaterial").focus();
		},
			goToMainMenu:function(oEvent){
				var hash = (this.oCrossAppNavigator && this.oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "landing",
					action: "show"
				}

			}));
			this.oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});
		},
		onConfirmMaterial: function (oEvent) {
			var oQuantity = this.getView().byId("idSTOQuantity").getValue();
			if (!oQuantity) {
				return;
			}
			var oCurrentMat = this.getView().getModel("STOModel").getData();
			var oMatList = this.getView().getModel("MatListModel").getProperty("/DeliverySet");
			if (!oCurrentMat.Product) {
				Model.triggerSound(this);
				MessageBox.error("Please scan Material");
				this.globalModel.setProperty("/STOMat", "Error");
				return;
			}
			var oFind = this.findMaterial(oMatList, oCurrentMat, oQuantity);
			if (oFind === "false") {

				oCurrentMat.QuantityVerif = Number(oQuantity);

				var data = {};
				data.Warehouse = this.globalModel.getData().Warehouse;
				data.Ibd = this.CountBin;
				data.Product = oCurrentMat.Product;

				data.TargetQuantity = oCurrentMat.TargetQuantity;
				data.ProductNewFlg = "X";
				data.QuantityVerif = Number(oQuantity);

				oMatList.push(data);
			}

			this.getView().getModel("MatListModel").refresh();
			this.getView().byId("idSTOMaterial").setValue("");

			this.getView().getModel("STOModel").refresh();
			this.getView().byId("idSTOQuantity").setValue("");

		},
		scanMaterial: function (oEvent) {
			this.getView().byId("idSTOQuantity").setValue("");
			var containerVal = oEvent.getSource().getValue();
			if (!containerVal) {
				Model.triggerSound(this);
				MessageBox.error("Please scan again Material/UPC");
				this.globalModel.setProperty("/STOMat", "Error");
				return;
			} else {
				this.globalModel.setProperty("/STOMat", "None");
			}

			if (this._upcCode !== containerVal) {
				this._upcCode = containerVal;
				var filters = "EanUpc='" + containerVal + "'";
				var entity = "/EANToProductSet(" + filters + ")";
				var whModel = this.getOwnerComponent().getModel("warehouse");
				Model.getEntitySingleMaterial(whModel, entity, this.upcSuss, this.upcFail, this);
				this.getView().byId("idSTOMaterial").setValue("");
			} else {
				this.upcToMat(this.material, this);
			}

		},
		upcFail: function (oController) {
			oController.getView().byId("idSTOMaterial").focus();
            oController._upcCode = "";
            Model.triggerSound(oController);
		},

		upcSuss: function (oData, oController) {
			oController.material = oData.Product;
			oController.upcToMat(oController.material, oController);
		},
		upcToMat: function (materialNum, oController) {
			if (!materialNum) {
				Model.triggerSound(oController);
				MessageBox.error("Please scan again Material/UPC");
				oController.globalModel.setProperty("/STOMat", "Error");
				oController.getView().byId("idSTOMaterial").setValue("");
				oController._upcCode = "";
				oController.getView().byId("idSTOMaterial").focus();
				return;
			}
			var oCurrentMat = oController.getView().getModel("STOModel").getData();
			var oMatList = oController.getView().getModel("MatListModel").getProperty("/DeliverySet");
			if (!oCurrentMat.Product) {
				oCurrentMat.Product = materialNum;
			}
			if (oCurrentMat.Product !== materialNum) {

				oCurrentMat.Product = materialNum;
			}
			oCurrentMat.ProductVerif = materialNum;
			var oFind = oController.findMaterial(oMatList, oCurrentMat);
			if (oFind === "false") {
				oCurrentMat.AllowScan = false;
				oCurrentMat.QuantityVerif = 1;

				var data = {};
				data.Warehouse = oController.globalModel.getData().Warehouse;
				data.Ibd = oController.CountBin;
				data.Product = materialNum;

				data.TargetQuantity = oCurrentMat.TargetQuantity;
				data.ProductNewFlg = "X";
				data.QuantityVerif = oCurrentMat.QuantityVerif;

				oMatList.push(data);
			}

			oController.getView().getModel("MatListModel").refresh();
			oController.getView().byId("idSTOMaterial").setValue("");

			oController.getView().getModel("STOModel").refresh();

		},

		findMaterial: function (oMatList, oCurrentMat, oManQty) {
			var ofind = "false";

			$.each(oMatList, function (i, el) {
				if (el.Product === oCurrentMat.Product) {
					if (oManQty) {
						el.QuantityVerif = Number(oManQty);
						oCurrentMat.QuantityVerif = Number(oManQty);

					} else {
						el.QuantityVerif = Number(el.QuantityVerif) + 1;
						oCurrentMat.QuantityVerif = Number(el.QuantityVerif);
					}
					ofind = "true";
					if (el.AllowScan) {
						oCurrentMat.AllowScan = el.AllowScan;
					} else {
						oCurrentMat.AllowScan = false;
					}

				}

			});
			return ofind;
		},

		onSaveSTO: function (oEvent) {

			var oMatList = this.getView().getModel("MatListModel").getProperty("/DeliverySet");
			var ExceptionList = [];
			$.each(oMatList, function (i, el) {
				if (el.ProductNewFlg === "X" || Number(el.TargetQuantity) !== Number(el.QuantityVerif) || Number(el.QuantityVerif) < 1) {
					ExceptionList.push(el);
				}

			});

			if (ExceptionList.length > 0) {
				this.getView().getModel("ExceptionModel").setProperty("/ExceptionCollection", ExceptionList);
				this.onExceptionDialog();
			} else {
				var oData = {};
				oData.Warehouse = this.globalModel.getData().Warehouse;

				oData.InboundDelivery = oMatList[0].Ibd;
				oData.Sto = "X";
				Model.postEntitySingle("/GoodsReceiptSet", oData, this, this.OnGRSucess, this.onGRFail);
			}
		},
		onExceptionDialog: function () {

			var oController = this;
			if (!oController._ExceptionDialog) { // fr wbs1 search
				oController._ExceptionDialog = new sap.ui.xmlfragment(
					"wp.inbound.view.ExceptionList",
					oController
				);
				oController.getView().addDependent(oController._ExceptionDialog);
			}

			oController._ExceptionDialog.open();

		},
		OnGRSucess: function (oController, oData) {
			oController.getView().getModel("MatListModel").setProperty("/DeliverySet", []);
			oController.getView().getModel("ExceptionModel").setProperty("/ExceptionCollection", []);
			oController.getView().byId("idSTOMaterial").setValue("");
			setTimeout(function demo() {
				// oController.oRouter.navTo("Delivery", {
				// 	process: "Pallet",
				// 	delId: oData.InboundDelivery
				// });
				oController.oRouter.navTo("WareHouse", {
					process: "STO",
					OBdelId: oData.AsnNumber

				});
				//MessageBox.close();
			}, 2500);
		},

		onGRFail: function (oController) {
			Model.triggerSound(oController);

		},

		onScanList: function (oEvent) {
			var oController = this;
			if (!oController._HistoryDialog) { // fr wbs1 search
				oController._HistoryDialog = new sap.ui.xmlfragment(
					"wp.inbound.view.MaterialFragment",
					oController
				);
				oController.getView().addDependent(oController._HistoryDialog);
			}

			oController._HistoryDialog.open();
		},
		onSaveSTOPOPUP: function () {
			this.onHistoryCancel();
			this.onSaveSTO();

		},
		onHistoryCancel: function () {
			this.getView().byId("idSTOMaterial").focus();
			if (this.launchpad === true) {
				this._HistoryDialog.close();
				// this._valueHelpDialog1.destroy();
				var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
				oCrossAppNavigator.toExternal({
					target: {
						semanticObject: "#"
					}
				});
			} else {
				this._HistoryDialog.close();
				this.getView().byId("idSTOMaterial").focus();
				// this._valueHelpDialog1.destroy();
			}
		},
		onExceptionCancel: function () {
			this.getView().byId("idSTOMaterial").focus();
			if (this.launchpad === true) {
				this._ExceptionDialog.close();
				// this._valueHelpDialog1.destroy();
				var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
				oCrossAppNavigator.toExternal({
					target: {
						semanticObject: "#"
					}
				});
			} else {
				this._ExceptionDialog.close();
				this.getView().byId("idSTOMaterial").focus();
				// this._valueHelpDialog1.destroy();
			}
		},

		// onBackPress: function (oEvent) {
		// 	this.oRouter.navTo("RouteLanding", true);
		// },

		onCanclePress: function (oEvent) {
				var that = this;
				var dialog = new sap.m.Dialog({
					title: 'Confirm',
					type: 'Message',
					content: new sap.m.Text({
						text: "Do You Want to Cancel"
					}),
					beginButton: new sap.m.Button({
						text: 'Ok',
						press: function () {

							dialog.close();
							that.getView().byId("idSTOMaterial").setValue("");
							window.history.go(-1);

						}
					}),
					endButton: new sap.m.Button({
						text: 'Cancel',
						press: function () {
							dialog.close();

						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});

				dialog.open();
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf zewm.proto.zproto1.view.CrossDeck
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zewm.proto.zproto1.view.CrossDeck
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zewm.proto.zproto1.view.CrossDeck
		 */
		//	onExit: function() {
		//
		//	}

	});

});