function toggleStyleSheetVal(styleSheetRules, selectorText, propertyName, defaultVal, alternateVal) {
	for (let i = 0; i < styleSheetRules.length; ++i) {
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

document.querySelector('#navBar > button').addEventListener(
	'click',
	toggleStyleSheetVal.bind(null, document.styleSheets[0].cssRules, 'body', '--headerActive', '0', '1')
);

let navSelected = document.querySelector('nav > button');
let jsonData;

async function fetchData(requestURL) {
	jsonData = await fetch(requestURL).then(response => {
		return response.json();
	});
	document.querySelector('#titleBar > h1').innerHTML = jsonData.title;
	var mainContentText = "";
	for (var i = 0; i < jsonData.mainContentText.length; ++i) {
		mainContentText += jsonData.mainContentText[i];
	}
	document.querySelector('#mainContent').innerHTML = mainContentText;
}

function navBtnClicked(btn, jsonPath) {
	fetchData(jsonPath);
	navSelected.classList.remove('navSelected');
	navSelected = btn;
	navSelected.classList.add('navSelected');
}

// setupFunc
(function () {
	navSelected.classList.add('navSelected');
	fetchData("/json/home.json");

	navBtns = document.querySelectorAll('nav > button');
	navJsonData = [
		"/json/home.json",
		"/json/blogs.json",
		"/json/portfolio.json",
		"/json/contact.json"
	];
	for (var i = 0; i < navBtns.length; ++i) {
		navBtns[i].addEventListener('click', navBtnClicked.bind(null, navBtns[i], navJsonData[i]));
	}
})();

