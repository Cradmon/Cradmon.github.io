export function findRule(styleSheet, selectorText) {
	let styleSheetRules = styleSheet.cssRules;
	for (let i = 0; i < styleSheetRules.length; ++i) {
		if (styleSheetRules[i].selectorText === selectorText) {
			return styleSheetRules[i];
		}
	}
	return null;
}

export function setValue(styleSheet, selectorText, propertyName, val) {
	let rule = findRule(styleSheet, selectorText);
	if (rule == null) { return null; }
	rule.style.setProperty(propertyName, val);
	return val;
}

export function toggleValue(styleSheet, selectorText, propertyName, defaultVal, alternateVal) {
	let rule = findRule(styleSheet, selectorText);
	if (rule == null) { return null; }

	let ret = defaultVal;
	if (rule.style.getPropertyValue(propertyName) == defaultVal) {
		ret = alternateVal;
	}
	rule.style.setProperty(propertyName, ret);
	return ret;
}
