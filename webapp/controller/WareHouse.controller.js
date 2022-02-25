sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"wp/inbound/model/models",
	"sap/ui/model/Filter",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, Model, Filter, MessageBox, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("wp.inbound.controller.WareHouse", {

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this.onRouteMatched, this);
			this.oWarehouseTask = [];
			this.OBdelId = "";
				this.oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
		},
		// onBackPress: function (oEvent) {
		// 	this.oRouter.navTo("RouteLanding",true);
		// },
		onRouteMatched: function (oEvent) {

			if (oEvent.getParameter("name") === "WareHouse") {
				//	this.sProcess = oEvent.getParameter("arguments").process;
				this.globalModel = this.getOwnerComponent().getModel("globalModel");
				//this.getView().byId("idscanWareHouse").setValue("");
				this.getView().byId("idscanIBD").setValue("");
				this.sProcess = oEvent.getParameter("arguments").process;
				if (this.sProcess === "PO") {
					this.getView().byId("idSwitchState").setState(true);
					this.inboundFocus();
					this.oIBD = this.globalModel.getProperty("/PalletPutaway");
					if (this.oIBD) {
						this.onWareHouseConfirm();
						//	this.globalModel.setProperty("/PalletPutaway","");
					}
					//	this.getView().setModel(this.getOwnerComponent().getModel("PutawayListModel"), "PutawayListModel");
					//	this.oWarehouseTask = this.globalModel.getProperty("/PalletPutaway");
					if (!this.oWarehouseTask) {
						this.oWarehouseTask = [];
					}
					try {
						if (this.oWarehouseTask.length > 0) {
							this.onWareHouseConfirm();
							//			this.globalModel.setProperty("/PalletPutaway", []);
						}
					} catch (err) {
						//
					}
				} else if (this.sProcess === "STO") {
					this.OBdelId = oEvent.getParameter("arguments").OBdelId;
					this.getView().byId("idSwitchState").setState(false);
					this.outboundFocus();
					if (this.OBdelId) {
						//	this.getView().byId("idSwitchState").setState(true);
						this.onWareHouseConfirm();
					}
					//
				} else if (this.sProcess === "POIBD") {
					this.getView().byId("idSwitchState").setState(true);
					this.onWareHouseConfirm();
					this.inboundFocus();
				}
				//	this.getOwnerComponent().getModel("PutawayListModel").setProperty("/PutawaySet",[]);
				this.onStateChange();
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
		// validateWareHouse: function (oEvent) {
		// var oWarehouseTask = this.getView().byId("idscanWareHouse").getValue();
		// if (oWarehouseTask) {
		// 	this.globalModel.setProperty("/WarehouseNum", "None");
		// 	if ($.inArray(this.oWarehouseTask, oWarehouseTask) === -1) {
		// 		this.oWarehouseTask.push(oWarehouseTask);

		// 	}
		// 	MessageToast.show(oWarehouseTask + " Scanned");
		// } else {
		// 	Model.triggerSound(this);
		// 	MessageBox.error("Please enter Warehouse Task");
		// 	this.globalModel.setProperty("/WarehouseNum", "Error");
		// }
		// this.getView().byId("idscanWareHouse").setValue("");
		// },
		validateOBDel: function (oEvent) {
			this.OBdelId = this.getView().byId("idscanOBDel").getValue();
			if (this.OBdelId) {
				this.globalModel.setProperty("/OBDel", "None");

				this.onWareHouseConfirm();
			} else {
				Model.triggerSound(this);
				MessageBox.error("Please enter OB Delivery");
				this.globalModel.setProperty("/OBDel", "Error");
				this.outboundFocus();
			}

		},
		validateIBD: function (oEvent) {
			this.oIBD = this.getView().byId("idscanIBD").getValue();
			if (this.oIBD) {
				this.globalModel.setProperty("/IBDNum", "None");
				//this.OBdelId = oIBD;
				this.onWareHouseConfirm();
			} else {
				Model.triggerSound(this);
				MessageBox.error("Please enter IBD Delivery");
				this.globalModel.setProperty("/IBDNum", "Error");
				this.inboundFocus();
			}

		},
		onReturnPress: function (oEvent) {
			var entity = "/PutawaySet";
			var oFilterItems = [];
			oFilterItems.push(new Filter({
				path: "Warehouse",
				operator: "EQ",
				value1: this.globalModel.getData().Warehouse,
				value2: ""
			}));
			oFilterItems.push(new Filter({
				path: "ReturnOrders",
				operator: "EQ",
				value1: true,
				value2: ""
			}));
			this.getView().byId("idscanOBDel").setValue("");
			this.getView().byId("idscanIBD").setValue("");
			Model.getEntitySet(entity, oFilterItems, this.OnWareHouseTaskSucess, this.OnWareHouseTaskfail, this);

		},
		onWareHouseConfirm: function (oEvent) {
			var entity = "/PutawaySet";
			var oFilterItems = [];
			if (this.sProcess === "PO") {

				//var oIBD = this.getView().byId("idscanIBD").getValue();
				oFilterItems.push(new Filter({
					path: "Ibd",
					operator: "EQ",
					value1: this.oIBD,
					value2: ""
				}));
				// if (this.oWarehouseTask.length === 0) {
				// 	Model.triggerSound(this);
				// 	MessageBox.error("Please enter Warehouse Task");
				// 	this.globalModel.setProperty("/WarehouseNum", "Error");
				// 	return;
				// }

				// $.each(this.oWarehouseTask, function (i, el) {

				// 	oFilterItems.push(new Filter({
				// 		path: "WarehouseTask",
				// 		operator: "EQ",
				// 		value1: el,
				// 		value2: ""
				// 	}));

				// oFilterGroupItems.push(oItems);
				//});
			} else if (this.sProcess === "STO") {
				if (!this.OBdelId) {
					Model.triggerSound(this);
					MessageBox.error("Please enter OB Delivery");
					this.globalModel.setProperty("/OBDel", "Error");
					return;
				}
				oFilterItems.push(new Filter({
					path: "ObDelivery",
					operator: "EQ",
					value1: this.OBdelId,
					value2: ""
				}));
			} else if (this.sProcess === "POIBD") {
				//	oIBD = this.globalModel.getProperty("/PalletPutaway");
				oFilterItems.push(new Filter({
					path: "Ibd",
					operator: "EQ",
					value1: this.oIBD,
					value2: ""
				}));
			}
			oFilterItems.push(new Filter({
				path: "DestinationBin",
				operator: "EQ",
				value1: "Dummy",
				value2: ""
			}));

			oFilterItems.push(new Filter({
				path: "Warehouse",
				operator: "EQ",
				value1: this.globalModel.getData().Warehouse,
				value2: ""
			}));
			this.getView().byId("idscanOBDel").setValue("");
			this.getView().byId("idscanIBD").setValue("");
			Model.getEntitySet(entity, oFilterItems, this.OnWareHouseTaskSucess, this.OnWareHouseTaskfail, this);
		},
		OnWareHouseTaskSucess: function (oData, oController, res) {

			var PutawayListModel = new JSONModel();
			PutawayListModel.setProperty("/PutawaySet", oData.results);
			oController.getOwnerComponent().setModel(PutawayListModel, "PutawayListModel");
			oController.oWarehouseTask = [];
			oController.OBdelId = "";
			//	oController.sProcess = "";
		},
		handleMaterialPress: function (oEvent) {
			var oSelectedContext = oEvent.getSource().getBindingContext("PutawayListModel");

			var oItemData = oEvent.getSource().getModel("PutawayListModel").getProperty(oSelectedContext.getPath());
			oItemData.Quantity = parseFloat(oItemData.Quantity);
			oItemData.QuantityVerif = parseFloat(oItemData.QuantityVerif);

			oItemData.DestinationBinVerif = "";
			var PutawayModel = new JSONModel();
			PutawayModel.setData(oItemData);
			this.getOwnerComponent().setModel(PutawayModel, "PutawayModel");
			//	this.oRouter.navTo("PutawayProcess", true);

			this.oRouter.navTo("PutawayProcess", {
				process: this.sProcess
			});
		},
		OnWareHouseTaskfail: function (oController) {
			oController.oWarehouseTask = [];
			var dummy = [];
			try {
				oController.getOwnerComponent().getModel("PutawayListModel").setProperty("/PutawaySet", dummy);
			} catch (e) {
				//	sap.m.MessageToast.show("Data Saved Sucessfully");
			}
			Model.triggerSound(oController);
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
						that.getView().byId("idscanOBDel").setValue("");
						that.getView().byId("idscanIBD").setValue("");
						that.getOwnerComponent().getModel("PutawayListModel").setProperty("/PutawaySet", []);
						window.history.go(-1);

					}
				}),
				endButton: new sap.m.Button({
					text: 'Cancel',
					press: function () {
						dialog.close();
						that.onStateChange();

					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();
		},
		onStateChange: function (oEvent) {
			var state = this.getView().byId("idSwitchState").getState();
			if (state) {
				this.globalModel.setProperty("/OBDelVisi", false);
				//	this.globalModel.setProperty("/WarehouseNumVisi", true);
				this.globalModel.setProperty("/IBDNumVisi", true);
				//	this.getView().byId("idscanWareHouse").focus();

				this.sProcess = "PO";
				this.inboundFocus();
			} else {
				this.globalModel.setProperty("/OBDelVisi", true);
				//	this.globalModel.setProperty("/WarehouseNumVisi", false);
				this.globalModel.setProperty("/IBDNumVisi", false);

				this.sProcess = "STO";
				this.outboundFocus();
			}
		//	this.getView().getModel('PutawayListModel').setProperty("/PutawaySet",[]);
				this.globalModel.setProperty("/IBDNum", "None");
				//	this.globalModel.setProperty("/IBDNum", "OBDel");
		},
		outboundFocus: function () {
			var oInpId = this.getView().byId("idscanOBDel");
			jQuery.sap.delayedCall(500, this, function () {
				oInpId.focus();
			});
		},
		inboundFocus: function () {
			var oInpId = this.getView().byId("idscanIBD");
			jQuery.sap.delayedCall(500, this, function () {
				oInpId.focus();
			});
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