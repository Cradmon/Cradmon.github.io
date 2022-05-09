function changeStyleSheetVal(styleSheetRules, selectorText, propertyName, newVal) {
	for (let i = 0; i <styleSheetRules.length; ++i) {
		var cssRule = styleSheetRules[i];
		if (cssRule.selectorText === selectorText) {
			cssRule.style.setProperty(propertyName, newVal);
			break;
		}
	}
}

function toggleStyleSheetVal(styleSheetRules, selectorText, propertyName, defaultVal, alternateVal) {
	for (let i = 0; i <styleSheetRules.length; ++i) {
		var cssRule = styleSheetRules[i];
		if (cssRule.selectorText === selectorText) {
			var retVal = defaultVal;
			if (cssRule.style.getPropertyValue(propertyName) == defaultVal) {
				retVal = alternateVal;
			}
			cssRule.style.setProperty(propertyName, retVal);
			break;
		}
	}
}

function toggleMenu() {
	toggleStyleSheetVal(document.styleSheets[0].cssRules, 'body', '--headerActive', '0', '1');
}
