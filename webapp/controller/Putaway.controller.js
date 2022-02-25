sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"wp/inbound/model/models",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageBox, Model, JSONModel) {
	"use strict";

	return Controller.extend("wp.inbound.controller.Putaway", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zewm.proto.zproto1.view.Inbound
		 */
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this.oRouteMatched, this);
				this.oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
		},
		oRouteMatched: function (oEvent) {

			if (oEvent.getParameter("name") === "PutawayProcess") {
				this.sProcess = oEvent.getParameter("arguments").process;
                this.material = "";
                this._upcCode = "";
				var PutawayModel = new sap.ui.model.json.JSONModel();
				//	 this.getView().setModel(PutawayModel, "PutawayModel");
				this.globalModel = this.getOwnerComponent().getModel("globalModel");
				//this.getView().setModel(this.getOwnerComponent().getModel("PutawayModel"), "PutawayModel");
				PutawayModel = this.getOwnerComponent().getModel("PutawayModel").getData();
				this.getView().byId("PutawayQuantity").setValue("");
				PutawayModel.ProductVerif = "";
				PutawayModel.DestinationBinVerif = "";
				PutawayModel.QuantityVerif = 0;
				this.getOwnerComponent().getModel("PutawayModel").refresh();
				this.globalModel.setProperty("/PutawayMat", "None");
				this.globalModel.setProperty("/PutawayDest", "None");
				this.getView().byId("PutawayDestBin").focus();

			}

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
						that.getView().getModel("PutawayModel").setData('');
						that.oRouter.navTo("RouteLanding", true);
						//	window.history.go(-1);

					}
				}),
				endButton: new sap.m.Button({
					text: 'Cancel',
					press: function () {
						dialog.close();
						that.materialFocus();

					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();
		},
		OnPutawatDetails: function (oData, oController, res) {
			// var odelId = oController.getView().byId("idscanInboundDeliveryPO").getValue();
			if (res === "E") {
				// oController.oRouter.navTo("Delivery",{process : "Putaway"});
				//	window.history.go(-1);
			} else {
				var item = oController.getView().getModel("PutawayModel").getData();
				if (oData.DestinationBin) {
					item.DestinationBin = oData.DestinationBin;
					item.WarehouseTask = oData.WarehouseTask;
				}

				item.DestinationBinVerif = "";

				oController.getView().getModel("PutawayModel").setData(item);
				//oController.materialFocus();
			}
			// oController.oRouter.navTo("PutawayProcess", {
			// 	delId: odelId
			// });

		},
		scanMaterial: function (oEvent) {
			var containerVal = oEvent.getSource().getValue();
			if (!containerVal) {
				Model.triggerSound(this);
				MessageBox.error("Please scan Material");
				this.globalModel.setProperty("/PutawayMat", "Error");
				this.materialFocus();
				//MessageBox.success("Entered data is valid");
			} else {
				this.globalModel.setProperty("/PutawayMat", "None");
			}
			if (this._upcCode !== containerVal) {
				this._upcCode = containerVal;
				var filters = "EanUpc='" + containerVal + "'";
				var entity = "/EANToProductSet(" + filters + ")";
				var whModel = this.getOwnerComponent().getModel("warehouse");
				Model.getEntitySingleMaterial(whModel, entity, this.upcSuss, this.upcFail,this);
				this.getView().byId("PutawayMaterial").setValue("");
			} else {
				this.upcToMat(this.material, this);
			}

		},
		upcFail:function(oController){
			oController.materialFocus();
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
				oController.getView().byId("PutawayMaterial").setValue("");
				oController.globalModel.setProperty("/PutawayMat", "Error");
				oController.getView().byId("PutawayMaterial").focus();
				oController._upcCode = "";
				oController.materialFocus();
				return;
			}
			var oData = oController.getView().getModel("PutawayModel").getData();
			oData.Quantity = parseFloat(oData.Quantity);
			oData.QuantityVerif = parseFloat(oData.QuantityVerif);
			if (oData.Product === materialNum) {
				oController.material = materialNum;
				if (oData.Quantity === oData.QuantityVerif) {
					Model.triggerSound(oController);
					oController.getView().byId("PutawayMaterial").setValue("");
					MessageBox.error("You can not put more than Open Quanity");

					return;
				} else {
					var oQty = oData.QuantityVerif + 1;
					oData.QuantityVerif = oQty;
				}
				oController.getView().byId("PutawayMaterial").setValue("");
				oController.getView().getModel("PutawayModel").refresh();
			} else if (oController.oMaterial !== materialNum) {
				Model.triggerSound(oController);
				MessageBox.error("Product Does not match");
				oController.getView().byId("PutawayMaterial").setValue("");
				oController.globalModel.setProperty("/PutawayMat", "Error");
				oController.getView().byId("PutawayMaterial").focus();
			}
		},
		scanSourceBin: function (oEvent) {
			var containerVal = oEvent.getSource().getValue();
			if (!containerVal) {
				Model.triggerSound(this);
				MessageBox.error("Please enter some value");
				//MessageBox.success("Entered data is valid");
				this.globalModel.setProperty("/PutawaySource", "Error");

				//MessageBox.success("Entered data is valid");
			} else {
				this.globalModel.setProperty("/PutawaySource", "None");
			}

		},
		scanDestBin: function (oEvent) {
			var containerVal = oEvent.getSource().getValue();
			if (!containerVal) {

				Model.triggerSound(this);
				MessageBox.error("Please Scan Dest. Bin");
				this.globalModel.setProperty("/PutawayDest", "Error");

				//MessageBox.success("Entered data is valid");
			} else {
				this.globalModel.setProperty("/PutawayDest", "None");
				//this.getView().byId("PutawayMaterial").focus();
				containerVal = containerVal.toUpperCase();
				this.getView().byId("PutawayDestBin").setValue(containerVal);
				this.materialFocus();
			}

		},
		// onBackPress: function (oEvent) {
		// 	this.oRouter.navTo("RouteLanding",true);
		// },
		onMaterialList: function (oEvent) {
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
		onSavePutaway: function (oEvent) {
			var that = this;
			var oData = this.getView().getModel("PutawayModel").getData();
			oData.Quantity = parseFloat(oData.Quantity);
			oData.QuantityVerif = parseFloat(oData.QuantityVerif);
			var oManualQty = this.getView().byId("PutawayQuantity").getValue();
			if (oManualQty) {
				oData.QuantityVerif = parseFloat(oManualQty);

			}
			if (oData.DestinationBin !== oData.DestinationBinVerif) {
				Model.triggerSound(this);
				MessageBox.error("Dest. Bin does not match");
				this.globalModel.setProperty("/PutawayDest", "Error");
				this.getView().byId("PutawayDestBin").focus();
				return;
			}

			oData.ProductVerif = this.material;

			if (oData.Product !== oData.ProductVerif) {
				Model.triggerSound(this);
				MessageBox.error("Product does not match");
				this.globalModel.setProperty("/PutawayMat", "Error");
				this.materialFocus();
				return;
			}

			if (oData.QuantityVerif > oData.Quantity) {
				Model.triggerSound(this);
				MessageBox.error("You can not put more than Open Quanity");
				this.materialFocus();
				return;
			}

			if (oData.Quantity !== oData.QuantityVerif) {

				var dialog = new sap.m.Dialog({
					title: 'Confirm',
					type: 'Message',
					content: new sap.m.Text({
						text: "Do You Want to Continue Partial Putaway"
					}),
					beginButton: new sap.m.Button({
						text: 'Ok',
						press: function () {

							dialog.close();
							oData.Quantity = oData.Quantity.toString();
							oData.QuantityVerif = oData.QuantityVerif.toString();
							Model.postEntitySingle("/PutawaySet", oData, that, that.onPutawatSucess, that.onPutawatFail, "X");

						}
					}),
					endButton: new sap.m.Button({
						text: 'Cancel',
						press: function () {
							dialog.close();
							//that.getView().byId("PutawayMaterial").focus();
							that.materialFocus();
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});

				dialog.open();

				// MessageBox.error("Quantity does not match");
				// return;
			} else {

				oData.Quantity = oData.Quantity.toString();
				oData.QuantityVerif = oData.QuantityVerif.toString();
				Model.postEntitySingle("/PutawaySet", oData, this, this.onPutawatSucess, this.onPutawatFail);

			}
		},

		materialFocus: function () {
			var oInpId = this.getView().byId("PutawayMaterial");
			jQuery.sap.delayedCall(500, this, function () {
				oInpId.focus();
			});
		},
		onPutawatFail: function (oController) {
			Model.triggerSound(oController);
			oController.getView().byId("PutawayMaterial").setValue("");

			oController.getView().byId("PutawayQuantity").setValue("");

			var PutawayModel = oController.getOwnerComponent().getModel("PutawayModel").getData();

			PutawayModel.ProductVerif = "";
			PutawayModel.DestinationBinVerif = "";
			PutawayModel.QuantityVerif = 0;
			oController.getOwnerComponent().getModel("PutawayModel").refresh();
			//	oController.getView().byId("PutawayMaterial").focus();
			oController.materialFocus();
		},
		onPutawatSucess: function (oController, oData, text, parQty) {
			//var oDummy = [];
			oController.getView().byId("PutawayQuantity").setValue("");

			var oPutawayList = oController.getOwnerComponent().getModel("PutawayListModel").getProperty("/PutawaySet");
			var oPutaway = oController.getView().getModel("PutawayModel").getData();
			var oPutNew = [];

			$.each(oPutawayList, function (i, el) {
				if (oPutawayList[i].WarehouseTask !== oPutaway.WarehouseTask) {
					oPutNew.push(el);

				}
			});

			if (parQty) {
				oData.Quantity = parseFloat(oData.Quantity);
				oData.QuantityVerif = parseFloat(oData.QuantityVerif);
				oController.getView().getModel("PutawayModel").setData(oData);
				oPutNew.push(oData);
				oController.getOwnerComponent().getModel("PutawayListModel").setProperty("/PutawaySet", oPutNew);
				//oController.getView().byId("PutawayDestBin").focus();
				oController.materialFocus();
				// if (oController.sProcess === "STO") {
				// 	window.history.go(-1);

				// }
			} else {
				oController.material = "";

				oController.getView().getModel("PutawayModel").setData('');
				oController.getOwnerComponent().getModel("PutawayListModel").setProperty("/PutawaySet", oPutNew);
				if (oPutNew.length > 0) {
					window.history.go(-1);
				} else {
					if (oController.sProcess === "STO") {
						oController.oRouter.navTo("GoodsReceiptSTOProcess", true);
					} else if (oController.sProcess === "PO" || oController.sProcess === "POIBD") {
						oController.oRouter.navTo("GoodsReceiptProcess", true);
					}
				}

			}

			// var dialog = new sap.m.Dialog({
			// 	title: 'Result',
			// 	type: 'Message',
			// 	content: new sap.m.Text({
			// 		text: text
			// 	}),
			// 	beginButton: new sap.m.Button({
			// 		text: 'Ok',
			// 		press: function () {

			// 			dialog.close();

			// 		}
			// 	}),

			// 	afterClose: function () {
			// 		dialog.destroy();
			// 	}
			// });

			// dialog.open();

			// oController.getView().byId("PutawayMaterial").setValue(' ');
		},
		onNextBin: function (oEvent) {
			var oPutaway = this.getView().getModel("PutawayModel").getData();
			var filters = "Warehouse='" + this.globalModel.getData().Warehouse + "'," + "WarehouseTask='" + oPutaway.WarehouseTask + "'," +
				"DestinationBin='" + oPutaway.DestinationBin + "'";
			var entity = "/PutawaySet(" + filters + ")";
			Model.getEntitySingle(entity, " ", this.OnPutawatDetails, this);
			// PutawayDestBin1
		},
		onManualBin: function (oEvent) {

			var oPutaway = this.getView().getModel("PutawayModel").getData();
			oPutaway.DestinationBin = oPutaway.DestinationBinVerif;
			this.getView().byId("PutawayDestBin1").setValue(oPutaway.DestinationBinVerif);
			this.materialFocus();
			//this.getView().byId("PutawayMaterial").focus();
		},
		onHistoryCancel: function () {
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
					// this._valueHelpDialog1.destroy();
				}
				this.materialFocus();
				//	this.getView().byId("PutawayMaterial").focus();
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf zewm.proto.zproto1.view.Inbound
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zewm.proto.zproto1.view.Inbound
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zewm.proto.zproto1.view.Inbound
		 */
		//	onExit: function() {
		//
		//	}

	});

});