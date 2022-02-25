sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"wp/inbound/model/models",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter"
], function (Controller, MessageBox, Model, JSONModel, Filter) {
	"use strict";

	return Controller.extend("wp.inbound.controller.GoodsReceiptSTO", {

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
			if (oEvent.getParameter("name") === "GoodsReceiptSTOProcess") {
				this.globalModel = this.getOwnerComponent().getModel("globalModel");
				this.getView().byId("idscanOutboundDelivery").focus();
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
		// onSavePress: function (oEvent) {
		// 	var oData = {};
		// 	oData.Warehouse = this.globalModel.getData().Warehouse;
		// 	oData.InboundDelivery = this.getView().byId("idscanInboundDelivery").getValue();
		// 	if(!oData.InboundDelivery){
		// 		Model.triggerSound(this);
		// 		MessageBox.error("Please enter some value");
		// 		this.globalModel.setProperty("/GoodsRep", "Error");
		// 		return;
		// 	}
		// 	Model.postEntitySingle("/GoodsReceiptSet", oData, this,this.OnGRSucess, this.onGRFail);
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
					//	window.history.go(-1);
						that.oRouter.navTo("RouteLanding", true);

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
		},
		validateOutboundDel: function (oEvent) {
			var containerVal = oEvent.getSource().getValue();
			if (!containerVal) {
				Model.triggerSound(this);
				MessageBox.error("Please enter some value");
				this.globalModel.setProperty("/GoodsRepSTO", "Error");
				//MessageBox.success("Entered data is valid");
			} else {
				this.globalModel.setProperty("/GoodsRepSTO", "None");
				var entity = "/DeliverySet";
				var oFilterItems = [];
				oFilterItems.push(new Filter({
					path: "Warehouse",
					operator: "EQ",
					value1: this.globalModel.getData().Warehouse,
					value2: ""
				}));
				oFilterItems.push(new Filter({
					path: "AsnNumber",
					operator: "EQ",
					value1: containerVal,
					value2: ""
				}));

				Model.getEntitySet(entity, oFilterItems, this.OnGRSTOSucess, this.onGRSTOFail, this);
			}

		},

		OnGRSTOSucess: function (oData, oController) {

			var MatListModel = new JSONModel();
			MatListModel.setProperty("/DeliverySet", oData.results);
			oController.getOwnerComponent().setModel(MatListModel, "MatListModel");
			// 
			oController.getView().byId("idscanOutboundDelivery").setValue("");
			oController.oRouter.navTo("STOListProcess", true);
		},
		onGRSTOFail: function (oController) {
			Model.triggerSound(oController);

			oController.getView().byId("idscanOutboundDelivery").setValue("");
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
		},
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