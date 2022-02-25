sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"wp/inbound/model/models"
], function (UIComponent, Device, Model) {
	"use strict";

	return UIComponent.extend("wp.inbound.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */

		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();
			Model.mainDataModel();
			this.setModel(Model.getAudio(), "audio");
			// set the device model
			// Model.globalModel();
			this.setModel(Model.createDeviceModel(), "device");
		}
	});
});