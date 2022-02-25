sap.ui.define(["wp/inbound/controller/Formatter"], function (Formatter) {
	"use strict";
	return {

		
		showQuantity: function (scan,open) {
			return scan + '/' + open;
		}
	};
});