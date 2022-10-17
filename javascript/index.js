import {PathFunctions, Hierarchy} from './Hierarchy.js'
import * as StyleSheetFunctions from './StyleSheetFunctions.js'

class NavData {
	nodePath;
	jsonPath;
	jsonData = null;

	constructor(inputNodePath) {
		this.nodePath = inputNodePath;
		this.jsonPath = PathFunctions.getModifiedPath(
			this.nodePath,
			[
				['html', 'json'],
				[this.nodePath.split('/').at(-1), PathFunctions.getTailName(this.nodePath) + '.json']
			]
		);
	}
}

class DataController {
	#hierarchy;
	#currentNode;
	#navDataArray;

	#fetchNodeData(navData) {
		fetch(navData.jsonPath).then(response => {
			return response.json();
		}).then(fetchedData => {
			navData.jsonData = fetchedData;
			dataReady(navData);
		});
	}

	set currentNode(nodePath) {
		this.#currentNode = this.#hierarchy.getNode(nodePath, this.#currentNode);

		let navData = null;
		if (!this.#currentNode.isBranch) {
			navData = this.#currentNode.data;
		} else if (this.#currentNode == this.#hierarchy.root) {
			navData = this.#navDataArray[0];
		}

		if (navData != null) {
			if (navData.jsonData == null) {
				navData.jsonData = this.#fetchNodeData(navData);
			} else {
				dataReady(navData);
			}
		}
	}

	get currentNode() { return this.#currentNode; };

	constructor() {
		this.#navDataArray = [
			new NavData('/'),
			new NavData('/html/blogs/TheFileSystem_DataNavigation'),
			new NavData('/html/Portfolio'),
			new NavData('/html/Contact')
		];
		this.#navDataArray[0].jsonPath = '/json/index.json'

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
				'Portfolio',
				'Contact'
		], pathDataArray);
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
		let htmlContent = "";
		if (dataController.currentNode.isBranch) {
			for (let i = 0; i < dataController.currentNode.data.length; ++i) {
				htmlContent += '<button>' + dataController.currentNode.data[i].name + '</button>';
			}
		}

		document.querySelector('nav').innerHTML = htmlContent;
		let navBtns = document.querySelectorAll('nav > button');
		for (let i = 0; i < navBtns.length; ++i) {
			navBtns[i].addEventListener('click', (event) => {
				if (!dataController.currentNode.isBranch) {
					if (navBtns[i].innerHTML == dataController.currentNode.name) {
					dataController.currentNode = '.';
					} else {
						dataController.currentNode = '../' + dataController.currentNode.parentNode.data[i].name;
						if (dataController.currentNode.isBranch) {
							this.setupBtns();
						}
					}
				} else if (dataController.currentNode.data[i].isBranch) {
					dataController.currentNode = dataController.currentNode.data[i].name;
					this.setupBtns();
				} else {
					dataController.currentNode = dataController.currentNode.data[i].name;
				}
			});
		}
	}

	constructor(pathString) {
		document.querySelector('#menuToggleBtn').addEventListener(
			'click',
			() => {
				StyleSheetFunctions.toggleValue(document.styleSheets[0], 'body', '--navBarVisible', '0', '1');
			}
		);

		let homeBtn = document.querySelector('#titleBox');
		homeBtn.addEventListener('click', (event) => {
			dataController.currentNode = '/';
			this.setupBtns();
		});

		this.setupBtns();
	}
};

function dataReady(navData) {
	if (navData.nodePath == dataController.currentNode.data.nodePath ||
		(navData.nodePath == '/' && dataController.currentNode.name == 'html')) {
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
	dataController.currentNode = '/';

	navBar = new NavBar(window.location.pathname);

	// Button Events
	window.addEventListener('popstate', (event) => {
		let pathString = window.location.pathname;
		navBar.setupBtns();
	});
})();
