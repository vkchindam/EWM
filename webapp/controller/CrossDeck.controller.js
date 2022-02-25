sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"wp/inbound/model/models",
	"sap/m/MessageBox"
], function (Controller,Model, MessageBox) {
	"use strict";

	return Controller.extend("wp.inbound.controller.CrossDeck", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zewm.proto.zproto1.view.CrossDeck
		 */
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this.onRouteMatched, this);
				this.oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
		},
		onRouteMatched:function(oEvent){
			if (oEvent.getParameter("name") === "crossDeckProcess"){
					this.globalModel = this.getOwnerComponent().getModel("globalModel");
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
		// onBackPress: function (oEvent) {
		// 	this.oRouter.navTo("RouteLanding", true);
		// },
		validateContainer: function (oEvent) {
				var containerVal = oEvent.getSource().getValue();
				if (!containerVal) {
					MessageBox.error("Please enter some value");
					//MessageBox.success("Entered data is valid");
				}
				
				Model.getFuncttionImport(this.globalModel.getData().Warehouse,containerVal,"",this);
				
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