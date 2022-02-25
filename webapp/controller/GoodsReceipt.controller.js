sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"wp/inbound/model/models"
], function (Controller, MessageBox, Model) {
	"use strict";

	return Controller.extend("wp.inbound.controller.GoodsReceipt", {

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
			if (oEvent.getParameter("name") === "GoodsReceiptProcess") {
				this.globalModel = this.getOwnerComponent().getModel("globalModel");
				this.getView().byId("idscanInboundDelivery").focus();
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
		onSavePress: function (oEvent) {
			var oData = {};
			oData.Warehouse = this.globalModel.getData().Warehouse;
			oData.InboundDelivery = this.getView().byId("idscanInboundDelivery").getValue();
			if(!oData.InboundDelivery){
				Model.triggerSound(this);
				MessageBox.error("Please enter some value");
				this.globalModel.setProperty("/GoodsRep", "Error");
				return;
			}
			Model.postEntitySingle("/GoodsReceiptSet", oData, this,this.OnGRSucess, this.onGRFail);
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
		OnGRSucess: function (oController) {
			var odel = oController.getView().byId("idscanInboundDelivery").getValue();

			oController.getView().byId("idscanInboundDelivery").setValue("");
			oController.oRouter.navTo("Delivery", {
				process: "Pallet",
				delId: odel
			});
		},
		onGRFail:function(oController){
			Model.triggerSound(oController);
			
			oController.getView().byId("idscanInboundDelivery").setValue("");
				oController.getView().byId("idscanInboundDelivery").focus();
		},
		validateInboundDel: function (oEvent) {
			var containerVal = oEvent.getSource().getValue();
			if (!containerVal) {
				Model.triggerSound(this);
				MessageBox.error("Please enter some value");
				this.globalModel.setProperty("/GoodsRep", "Error");
				//MessageBox.success("Entered data is valid");
			} else {
				this.globalModel.setProperty("/GoodsRep", "None");
			}
		
		},

		// onBackPress: function (oEvent) {
		// 	this.oRouter.navTo("Master",true);
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