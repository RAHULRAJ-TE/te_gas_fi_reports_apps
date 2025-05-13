/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/te/fi/report/comtefireport/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
