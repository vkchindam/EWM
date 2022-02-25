sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"wp/inbound/model/models",
	"wp/inbound/controller/Formatter",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel"
], function (Controller, Model, Formatter, MessageBox, Filter, JSONModel) {

	return Controller.extend("wp.inbound.controller.PalletBuild", {
		Formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zewm.proto.zproto1.view.Outbound
		 */
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this.onRouteMatched, this);
				this.oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
		},
		// onBackPress: function (oEvent) {
		// 	this.oRouter.navTo("RouteLanding",true);
		// },
		onRouteMatched: function (oEvent) {

			if (oEvent.getParameter("name") === "PalletBuildProcess") {
				this.globalModel = this.getOwnerComponent().getModel("globalModel");
				var oPropertyModel = Model.initialPropertyModel();
				this.getView().setModel(oPropertyModel, "Property");
                this.oMaterial = "";
                this._upcCode = "";
				this._savePack = [];
				//	this.WarehouseTask = [];
				this.sdelId = oEvent.getParameter("arguments").delId;
				this.getView().byId("idDeliveryNumber").setText(this.sdelId);
				var PalletModel = new sap.ui.model.json.JSONModel();
				var oData = {};
				oData.Warehouse = '';

				oData.Ibd = '';
				oData.DestinationBin = '';
				oData.Product = '';
				oData.ProductVar = '';
				oData.TargetQuantity = '';
				oData.Uom = '';
				oData.OpenQuantity = '';
				oData.DestinationHu = '';
				oData.PackNew = '';
				oData.WarehouseTask = '';

				PalletModel.setData(oData);
				this.getView().setModel(PalletModel, "PalletModel");

				this.getView().byId("idQuantity").setValue("");
				this.getMaterialList();
				this.getView().byId("idProduct").focus();
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
		getMaterialList: function () {
			var entity = "/PackHuSet";
			var oFilterItems = [];
			oFilterItems.push(new Filter({
				path: "Warehouse",
				operator: "EQ",
				value1: this.globalModel.getData().Warehouse,
				value2: ""
			}));
			oFilterItems.push(new Filter({
				path: "Ibd",
				operator: "EQ",

				value1: this.sdelId,
				value2: ""
			}));

			Model.getEntitySet(entity, oFilterItems, this.OnGRPOSucess, this.onGRPOFail, this);
		},
		OnGRPOSucess: function (oData, oController) {

			var MatListModel = new JSONModel();
			MatListModel.setProperty("/PackHuSet", oData.results);
			oController.getView().setModel(MatListModel, "MatListModel");
			oController.getView().getModel("MatListModel").refresh();
			//oController.getView().byId("idProduct").focus();
			oController.materialFocus();
			// 

		},
		onGRPOFail: function (oController, oResponse) {
			 Model.triggerSound(oController);
			//	oController.getView().getModel("MatListModel").setProperty("/PackHuSet", []);
			//	oController.getView().getModel("MatListModel").refresh();
			// setTimeout(function demo() {
			// 	oController.oRouter.navTo("Delivery", {
			// 		process: "Pallet"
			// 	});
			// }, 2500);
			try {
				oResponse = jQuery.parseJSON(oResponse.responseText);

				sap.m.MessageBox.information(oResponse.error.message.value, {
					title: "Result"
				});
			} catch (e) {
				//
			}
			//	oController.getView().byId("idProduct").focus();
			oController.materialFocus();
		},
		scanMaterial: function (oEvent) {
			var containerVal = oEvent.getSource().getValue();
			if (!containerVal) {
				Model.triggerSound(this);
				MessageBox.error("Please enter some value");
				this.globalModel.setProperty("/PalletMat", "Error");
				return;
				//MessageBox.success("Entered data is valid");
			} else {
				this.globalModel.setProperty("/PalletMat", "None");
			}

			if (this._upcCode !== containerVal) {
				this._upcCode = containerVal;
				
				var filters = "EanUpc='" + containerVal + "'";
				var entity = "/EANToProductSet(" + filters + ")";
				var whModel = this.getOwnerComponent().getModel("warehouse");
				Model.getEntitySingleMaterial(whModel, entity, this.upcSuss, this.upcFail,this);
				this.getView().byId("idProduct").setValue("");
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
				oController.globalModel.setProperty("/PalletMat", "Error");
				oController.getView().byId("idProduct").setValue("");
				oController._upcCode = "";
				oController.materialFocus();
				return;
			}
			var oData = oController.getView().getModel("PalletModel").getData();
			var oMatList = oController.getView().getModel("MatListModel").getProperty("/PackHuSet");

			oData = oController.findMaterial(oMatList, oData, materialNum);

			oController.getView().getModel("MatListModel").refresh();

			oController.getView().byId("idProduct").setValue("");

			oController.getView().getModel("PalletModel").setData(oData);
			oController.getView().getModel("PalletModel").refresh();

		},
		saveMaterial: function (oMatList, oCurrentMat, Material, oManQty) {
			//var ofind = "false";
			var that = this;
			$.each(oMatList, function (i, el) {
				if (el.Product === Material) {
					oCurrentMat = el;
					oCurrentMat.OpenQuantity = Number(el.OpenQuantity);
					if (oManQty) {
						if (Number(el.OpenQuantity) < Number(oManQty)) {
							Model.triggerSound(that);
							MessageBox.error("You can not pack more than Open Quanity");
							return;
						}
						el.TargetQuantity = Number(oManQty);
					} else {
						if (Number(el.TargetQuantity) === Number(el.OpenQuantity)) {
							Model.triggerSound(that);
							MessageBox.error("You can not pack more than Open Quanity");
							return;
						}
						el.TargetQuantity = Number(el.TargetQuantity) + 1;
					}
					//	ofind = "true";
				}

			});

			return oCurrentMat;
		},
		findMaterial: function (oMatList, oCurrentMat, Material, oManQty) {
			var ofind = "false";
			var that = this;
			$.each(oMatList, function (i, el) {
				if (el.Product === Material) {
					oCurrentMat = el;
					oCurrentMat.OpenQuantity = Number(el.OpenQuantity);
					if (oManQty) {
						if (Number(el.OpenQuantity) < Number(oManQty)) {
							Model.triggerSound(that);
							MessageBox.error("You can not pack more than Open Quanity");
							return;
						}
						el.TargetQuantity = Number(oManQty);
					} else {
						if (Number(el.TargetQuantity) === Number(el.OpenQuantity)) {
							Model.triggerSound(that);
							MessageBox.error("You can not pack more than Open Quanity");
							return;
						}
						el.TargetQuantity = Number(el.TargetQuantity) + 1;
					}
					ofind = "true";
				}

			});
			if (ofind === "false") {
				this.getView().byId("idProduct").setValue("");
				Model.triggerSound(this);
				MessageBox.error("Material not found in IDN");
				return;
			}
			return oCurrentMat;
		},
		onSaveQty: function (oEvent) {
			var oManualQty = this.getView().byId("idQuantity").getValue();
			if (oManualQty) {
				var oData = this.getView().getModel("PalletModel").getData();
				var oMatList = this.getView().getModel("MatListModel").getProperty("/PackHuSet");
				this.saveMaterial(oMatList, oData, oData.Product, oManualQty);

			}
			this.getView().getModel("PalletModel").refresh();
			this.getView().getModel("MatListModel").refresh();
			this.getView().byId("idQuantity").setValue("");
			//	this.getView().byId("idProduct").focus();
			this.materialFocus();
		},
		onDailogSelect: function (text) {
			var that = this;
			var dialog = new sap.m.Dialog({
				title: 'Confirm',
				type: 'Message',
				content: new sap.m.Text({
					text: text
				}),
				beginButton: new sap.m.Button({
					text: 'Ok',
					press: function () {

						dialog.close();
						that.getView().byId("idProduct").focus();
						// var oSaveData =
						// that.getView().getModel('saveModel').getProperty("/BPTreeSet");
						return true;

					}
				}),
				endButton: new sap.m.Button({
					text: 'Cancel',
					press: function () {
						dialog.close();
						that.getView().byId("idProduct").focus();
						return false;

					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();
		},
		OnSubmitMaterial: function (oData, oController, res) {
			if (res === "S") {
				var PalletModel = new sap.ui.model.json.JSONModel();
				oData.TargetQuantity = parseFloat(oData.TargetQuantity);
				oData.OpenQuantity = parseFloat(oData.OpenQuantity);
				oController.getView().setModel(PalletModel, "PalletModel");
				oController.getView().getModel("PalletModel").setData(oData);
				oController.getView().byId("idProduct").setValue("");
				var oMatList = oController.getView().getModel("MatListModel").getProperty("/PackHuSet");
				oController.findMaterial(oMatList, oData);
			} else {
				oController.oMaterial = '';

				oController.getView().byId("idProduct").setValue("");
				Model.triggerSound(oController);

			}
		},
		onPriorPack: function (oEvent) {
			var that = this;
			var oData = this.getView().getModel("PalletModel").getData();

			oData.TargetQuantity = parseFloat(oData.TargetQuantity);
			oData.OpenQuantity = parseFloat(oData.OpenQuantity);
			oData.PackNew = '';
			var oManualQty = this.getView().byId("idQuantity").getValue();
			if (oManualQty) {
				oData.TargetQuantity = parseFloat(oManualQty);
			}
			if (oData.TargetQuantity > oData.OpenQuantity) {
				MessageBox.error("You can not pack more than Open Quanity");
				return;
			} else if (oData.TargetQuantity !== oData.OpenQuantity) {
				var dialog = new sap.m.Dialog({
					title: 'Confirm',
					type: 'Message',
					content: new sap.m.Text({
						text: "Do You Want to Continue Partial Packing"
					}),
					beginButton: new sap.m.Button({
						text: 'Ok',
						press: function () {

							dialog.close();
							oData.OpenQuantity = oData.OpenQuantity.toString();
							oData.TargetQuantity = oData.TargetQuantity.toString();
							oData.Product = oData.ProductVar;
							Model.postEntitySingle("/PackHuSet", oData, that.onPackHUSucess, that);

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
			} else {
				oData.OpenQuantity = oData.OpenQuantity.toString();
				oData.TargetQuantity = oData.TargetQuantity.toString();
				oData.Product = oData.ProductVar;
				Model.postEntitySingle("/PackHuSet", oData, this.onPackHUSucess, this);
			}

		},
		onPalletBulid: function (oEvent) {

			var oQuantity = this.getView().byId("idQuantity").getValue();
			if (oQuantity) {
				Model.triggerSound(this);
				MessageBox.error("Please save manual QTY before submit");
				return;
			}

			var oMatList = this.getView().getModel("MatListModel").getProperty("/PackHuSet");

			var oContinue = "false";
			$.each(oMatList, function (i, el) {
				el.OpenQuantity = el.OpenQuantity.toString();
				el.TargetQuantity = el.TargetQuantity.toString();
				if (Number(el.TargetQuantity) > 0) {
					oContinue = "ture";
				}

			});
			if (oContinue === "false") {
				Model.triggerSound(this);
				MessageBox.error("No Data to Save");
				return;

			}
			var oData = {};
			oData.Warehouse = this.globalModel.getData().Warehouse;
			oData.PackHUSet = oMatList;
			oData.Ibd = this.sdelId;
			Model.postEntitySingle("/IbdPackSet", oData, this, this.onPackPalletSucc, this.onPackPalletfail);

		},
		onPackPalletfail: function (oController) {
			Model.triggerSound(oController);
			//oController.getView().byId("idProduct").focus();
			oController.materialFocus();
		},
		onPackPalletSucc: function (oController, data) {
			//var oDummy = [];
			oController.oMaterial = '';
			var oData = oController.getView().getModel("PalletModel").getData();
			if (data.WarehouseTask) {
				//oController.WarehouseTask.push(data.WarehouseTask);
			}
			oData.DestinationBin = "";
			oData.Product = "";
			oData.ProductVar = "";
			oData.TargetQuantity = "";
			oData.OpenQuantity = "";
			oData.Uom = "";
			oData.DestinationHu = "";
			oData.PackNew = "";
			oController.getView().getModel("PalletModel").refresh();
			oController._savePack = [];
			oController.getView().byId("idQuantity").setValue("");
			oController.getView().byId("idProduct").focus();
			oController.getMaterialList();

		},
		onPackNew: function (oEvent) {
			var that = this;
			//Model.setCustomPropertyValue("HUProductVisi", false);
			var oData = this.getView().getModel("PalletModel").getData();

			oData.TargetQuantity = parseFloat(oData.TargetQuantity);
			oData.OpenQuantity = parseFloat(oData.OpenQuantity);
			oData.PackNew = 'X';
			var oManualQty = this.getView().byId("idQuantity").getValue();
			if (oManualQty) {
				oData.TargetQuantity = parseFloat(oManualQty);
			}
			if (oData.TargetQuantity > oData.OpenQuantity) {
				Model.triggerSound(this);
				MessageBox.error("You can not pack more than Open Quanity");
				return;
			} else if (oData.TargetQuantity !== oData.OpenQuantity) {
				var dialog = new sap.m.Dialog({
					title: 'Confirm',
					type: 'Message',
					content: new sap.m.Text({
						text: "Do You Want to Continue Partial Packing"
					}),
					beginButton: new sap.m.Button({
						text: 'Ok',
						press: function () {

							dialog.close();
							oData.OpenQuantity = oData.OpenQuantity.toString();
							oData.TargetQuantity = oData.TargetQuantity.toString();
							oData.Product = oData.ProductVar;
							Model.postEntitySingle("/PackHuSet", oData, that, that.onPackHUSucess, that.onPackHUfail);

						}
					}),
					endButton: new sap.m.Button({
						text: 'Cancel',
						press: function () {
							dialog.close();
							//	that.getView().byId("idProduct").focus();
							that.materialFocus();

						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});

				dialog.open();

			} else {
				oData.OpenQuantity = oData.OpenQuantity.toString();
				oData.TargetQuantity = oData.TargetQuantity.toString();
				oData.Product = oData.ProductVar;
				Model.postEntitySingle("/PackHuSet", oData, this, this.onPackHUSucess, this.onPackHUfail);
			}

		},
		onPackHUfail: function (oController) {
			Model.triggerSound(oController);
			//oController.getView().byId("idProduct").focus();
			oController.materialFocus();
		},
		onPackHUSucess: function (oController, data) {
			//var oDummy = [];
			oController.oMaterial = '';
			var oData = oController.getView().getModel("PalletModel").getData();
			if (data.WarehouseTask) {
				//oController.WarehouseTask.push(data.WarehouseTask);
			}
			oData.DestinationBin = "";
			oData.Product = "";
			oData.ProductVar = "";
			oData.TargetQuantity = "";
			oData.OpenQuantity = "";
			oData.Uom = "";
			oData.DestinationHu = "";
			oData.PackNew = "";
			oController.getView().getModel("PalletModel").refresh();

			oController.getView().byId("idQuantity").setValue("");
			oController.getView().byId("idProduct").focus();
			oController.getMaterialList();

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
						try {
							that.oMaterial = '';
							var oData = that.getView().getModel("PalletModel").getData();

							oData.DestinationBin = '';
							oData.Product = '';
							oData.ProductVar = '';
							oData.TargetQuantity = '';
							oData.OpenQuantity = '';
							oData.Uom = '';
							oData.DestinationHu = '';
							oData.PackNew = '';
							that.getView().getModel("PalletModel").refresh();
							that.getView().getModel("MatListModel").setProperty("/PackHuSet", []);
						} catch (e) {
							//
						}
						that.oRouter.navTo("Delivery", {
							process: "Pallet"
						});

					}
				}),
				endButton: new sap.m.Button({
					text: 'Cancel',
					press: function () {
						dialog.close();
						//that.getView().byId("idProduct").focus();
						that.materialFocus();

					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();
		},
		onScanList: function (oEvent) {
			var oController = this;
			if (!oController._HistoryDialog) { // fr wbs1 search
				oController._HistoryDialog = new sap.ui.xmlfragment(
					"wp.inbound.view.PalletMaterialFragment",
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
				//this.getView().byId("idSTOMaterial").focus();
				// this._valueHelpDialog1.destroy();
			}
			this.materialFocus();
			// oInpId.addEventDelegate({
			// 	onAfterRendering: function () {
			// 		oInpId.focus();
			// 	}
			// });
		},
		materialFocus: function () {
			var oInpId = this.getView().byId("idProduct");
			jQuery.sap.delayedCall(500, this, function () {
				oInpId.focus();
			});
		},
		onSaveSTOPOPUP: function () {
			this.onHistoryCancel();
			this.onPalletBulid();

		},
		onContinuePutaway: function (oEvent) {
			//	this.globalModel.setProperty("/PalletPutaway", this.WarehouseTask);
			this.globalModel.setProperty("/PalletPutaway", this.sdelId);

			//	this.oRouter.navTo("WareHouse",true);
			this.oRouter.navTo("WareHouse", {
				process: "PO"

			});
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zewm.proto.zproto1.view.Outbound
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zewm.proto.zproto1.view.Outbound
		 */
		onAfterRendering: function () {
			this.getView().byId("idProduct").focus();
		}

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zewm.proto.zproto1.view.Outbound
		 */
		//	onExit: function() {
		//
		//	}

	});

});