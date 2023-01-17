'use strict';

import {Path, Hierarchy} from './Hierarchy.js'
import * as StyleSheetFunctions from './StyleSheetFunctions.js'

class NavData {
	nodePath;
	jsonPath;
	jsonData = null;

	fetchData(callbackFunc) {
		fetch(this.jsonPath.str).then(response => {
			return response.json();
		}).then(fetchedData => {
			this.jsonData = fetchedData;
			callbackFunc(this);
		});
	}

	constructor(inputNodePath) {
		this.nodePath = new Path.Path(inputNodePath);
		this.jsonPath = this.nodePath.createModifiedPath([['html', 'json'], [this.nodePath.tail, this.nodePath.stem + '.json']]);
	}
}

class DataController {
	#hierarchy;
	#currentNode;
	#navDataArray;

	set currentNode(path) {
		if (path.isAbsolute) {
			this.#currentNode = this.#hierarchy.getNode(path);
		} else {
			this.#currentNode = this.#currentNode.getNode(path);
		}

		let navData = null;
		if (!this.#currentNode.isBranch) {
			navData = this.#currentNode.data;
		} else if (this.#currentNode === this.#hierarchy.root) {
			navData = this.#navDataArray[0];
		} else {
			return;
		}

		if (navData.jsonData === null) {
			navData.fetchData(dataReady);
		} else {
			dataReady(navData);
		}
	}

	get currentNode() { return this.#currentNode; };

	constructor(inputCurrentPath = new Path.Path('/')) {
		this.#navDataArray = [
			new NavData('/html/index'),
			new NavData('/html/blogs/TheFileSystem_DataNavigation'),
			new NavData('/html/About'),
			new NavData('/html/Contact')
		];
		this.#navDataArray[0].nodePath = new Path.Path('/');

		let pathDataArray = [];
		for (let i = 1; i < this.#navDataArray.length; ++i) {
			pathDataArray.push([
				this.#navDataArray[i].nodePath,
				this.#navDataArray[i]
			]);
		};

		this.#hierarchy = new Hierarchy([
			'html',
				['blogs',
					'TheFileSystem_DataNavigation'],
				'About',
				'Contact'
		], pathDataArray);

		this.currentNode = inputCurrentPath;
	}
};

class NavBar {
	setVisible(isVisible) {
		isVisible = (isVisible) ? '1' : '0';
		StyleSheetFunctions.setValue(document.styleSheets[0], 'body', '--navBarVisible', isVisible);
	}

	toggleVisible() {
		StyleSheetFunctions.toggleValue(document.styleSheets[0], 'body', '--navBarVisible', '0', '1');
	}

	setupBtns() {
		if (dataController.currentNode.isBranch) {
			let htmlContent = "";
			for (let i = 0; i < dataController.currentNode.data.length; ++i) {
				htmlContent += '<button>' + dataController.currentNode.data[i].name + '</button>';
			}
			document.querySelector('nav').innerHTML = htmlContent;
		}

		let navBtns = document.querySelectorAll('nav > button');
		for (let i = 0; i < navBtns.length; ++i) {
			if (dataController.currentNode.data[i].isBranch) {
				navBtns[i].addEventListener('click', (event) => {
					let pathStr = '';
					if (!dataController.currentNode.isBranch) {
						pathStr = '../' + dataController.currentNode.parentNode.data[i].name;
					} else {
						pathStr = dataController.currentNode.data[i].name;
					}
					dataController.currentNode = new Path.Path(pathStr);
					this.setupBtns();
				});
			} else {
				navBtns[i].addEventListener('click', (event) => {
					let pathStr = '';
					if (!dataController.currentNode.isBranch) {
						pathStr = '../' + dataController.currentNode.parentNode.data[i].name;
					} else {
						pathStr = dataController.currentNode.data[i].name;
					}
					dataController.currentNode = new Path.Path(pathStr);
				});
			}
		}
	}

	constructor() {
		document.querySelector('#menuToggleBtn').addEventListener(
			'click',
			this.toggleVisible
		);

		let homeBtn = document.querySelector('#titleBox');
		homeBtn.addEventListener('click', (event) => {
			dataController.currentNode = new Path.Path('/');
			this.setupBtns();
		});

		this.setupBtns();
	}
};

function dataReady(navData) {
	if (navData.nodePath === dataController.currentNode.data.nodePath ||
		(navData.nodePath.str === '/' && dataController.currentNode.name === 'html')) {
		setupMainContent(navData);
		navBar.setVisible(false);
	}
}

// function addHistoryEntry() { 
	// histroy.pushState(null, null, ); 
// } 

function setupMainContent(navData) {
	document.querySelector('#mainContent #titleBar').innerHTML = navData.jsonData.title;
	var mainContentText = "";
	for (var i = 0; i < navData.jsonData.mainContentText.length; ++i) {
		mainContentText += navData.jsonData.mainContentText[i];
	}
	document.querySelector('#mainContent #content').innerHTML = mainContentText;
	document.querySelector('.slideBarLayout >:nth-child(2)').scrollTop = 0;
}

let dataController;
let navBar;
// Setup Function
(function () {
	dataController = new DataController();
	navBar = new NavBar();

	// Button Events
	window.addEventListener('popstate', (event) => {
		let pathString = window.location.pathname;
		navBar.setupBtns();
	});
})();
