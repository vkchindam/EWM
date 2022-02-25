sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"wp/inbound/model/models",
	"sap/m/MessageBox"
], function (Controller, Model,MessageBox) {
	"use strict";

	return Controller.extend("wp.inbound.controller.Delivery", {
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this.onRouteMatched, this);
				this.oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
		},
		// onBackPress: function (oEvent) {
		// 	this.oRouter.navTo("RouteLanding",true);
		// },
		onRouteMatched: function (oEvent) {
			this.globalModel = this.getOwnerComponent().getModel("globalModel");
			this.getView().byId("idscanInboundDeliveryPO").setValue('');
			if (oEvent.getParameter("name") === "Delivery") {
				this.sProcess = oEvent.getParameter("arguments").process;
				var odelId = oEvent.getParameter("arguments").delId;
				if (odelId) {
					this.getView().byId("idscanInboundDeliveryPO").setValue(odelId);
					this.validateInbound();
				}
			}
			if (this.sProcess === "Pallet") {
				this.getView().byId("idDeliveryText").setText("Inbound Delivery");
				// this.getView().byId("idDeliveryTitleText").setText("Pallet Build");
			} else if (this.sProcess === "Putaway") {
				// this.getView().byId("idDeliveryText").setText("Warehouse Task");
				// this.getView().byId("idDeliveryTitleText").setText("Putaway");

			}
			this.getView().byId("idscanInboundDeliveryPO").focus();
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
		validateInbound: function (oEvent) {
			var odelId = this.getView().byId("idscanInboundDeliveryPO").getValue();
			if(!odelId){
				Model.triggerSound(this);
				MessageBox.error("Please enter some value");
				this.globalModel.setProperty("/PalletIBD", "Error");
				//MessageBox.success("Entered data is valid");
				return;
			} else {
				this.globalModel.setProperty("/PalletIBD", "None");
			
			}
			
			
			if (this.sProcess === "Pallet") {
				// var filters = "Warehouse='" + this.globalModel.getData().Warehouse + "'," + "Ibd='" + odelId + "'";
				// var entity = "/DeliverySet(" + filters + ")";
				// Model.getEntitySingle(entity, " ", this.OnPalletDetails, this);
					this.oRouter.navTo("PalletBuildProcess", {
					delId: odelId
				});

			} else if (this.sProcess === "Putaway") {
				// var filters = "Warehouse='" + this.globalModel.Warehouse + "'," + "WarehouseTask='" + odelId + "'";
				// var entity = "/PutawaySet(" + filters + ")";
				// Model.getEntitySingle(entity, " ", this.OnPutawatDetails, this);
				this.oRouter.navTo("PutawayProcess", {
					delId: odelId
				});
			}
			//	this.oRouter.navTo("PackingProcess",true);

		},
		OnPalletDetails: function (oData, oController, res) {
			var odelId = oController.getView().byId("idscanInboundDeliveryPO").getValue();
			// oController.getView().getModel("PutawayModel").setData(oData);
			if (res !== "E") {
				oController.oRouter.navTo("PalletBuildProcess", {
					delId: odelId
				});
			}else{
				Model.triggerSound(oController);
				oController.getView().byId("idscanInboundDeliveryPO").setValue('');
			}
		},
		onCanclePress: function (oEvent) {

			this.oRouter.navTo("RouteLanding", true);

		},
		OnPutawatDetails: function (oData, oController) {
			var odelId = oController.getView().byId("idscanInboundDeliveryPO").getValue();
			// oController.getView().getModel("PutawayModel").setData(oData);
			oController.oRouter.navTo("PutawayProcess", {
				delId: odelId
			});

		}
	});
});