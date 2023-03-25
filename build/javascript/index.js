import {Path, Hierarchy} from './lib/Hierarchy.js'
import * as StyleSheetFunctions from './lib/StyleSheetFunctions.js'

class PageData {
	nodePath;
	pagePath;
	fetchedHtmlPath;
	fetchedHtml = null;
	fetchedCssPath;
	fetchedCss = null;

	fetchData(callbackFunc) {
		fetch(this.fetchedHtmlPath.str).then(response => {
			return response.text();
		}).then(fetchedData => {
			this.fetchedHtml = fetchedData;
			callbackFunc(this);
		});
	}

	constructor(inputNodePath) {
		this.nodePath = new Path.Path(inputNodePath);
		this.pagePath = new Path.Path('/html' + this.nodePath.str + '.html');
		this.fetchedHtmlPath = new Path.Path('/FetchedHtml' + this.nodePath.str + '.html');
		this.fetchedCssPath = new Path.Path('/css' + this.nodePath.str + '.css');
	}
}

class DataController {
	#hierarchy;
	#currentNode;
	#pageDataArray;

	set currentNode(path) {
		if (path.isAbsolute) {
			this.#currentNode = this.#hierarchy.getNode(path);
		} else {
			this.#currentNode = this.#currentNode.getNode(path);
		}

		let pageData;
		if (!this.#currentNode.isBranch) {
			pageData = this.#currentNode.data;
		} else if (this.#currentNode.parentNode === null) {
			pageData = this.#pageDataArray[0];
		} else {
			return;
		}

		if (pageData.fetchedHtml === null) {
			pageData.fetchData(dataReady);
		} else {
			dataReady(pageData);
		}
	}

	get currentNode() { return this.#currentNode; }

	constructor(inputCurrentPath = new Path.Path('/')) {
		this.#pageDataArray = [
			new PageData('/index'),
			new PageData('/blogs/TheFileSystem_DataNavigation'),
			new PageData('/About'),
			new PageData('/Contact')
		];
		this.#pageDataArray[0].pagePath = new Path.Path('/');

		let pathDataArray = [];
		for (let i = 1; i < this.#pageDataArray.length; ++i) {
			pathDataArray.push([
				this.#pageDataArray[i].nodePath,
				this.#pageDataArray[i]
			]);
		};

		this.#hierarchy = new Hierarchy([
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
		StyleSheetFunctions.setValue('/css/index.css', 'body', '--navBarVisible', isVisible);
	}

	toggleVisible() {
		StyleSheetFunctions.toggleValue('/css/index.css', 'body', '--navBarVisible', '0', '1');
	}

	setupBtns() {
		let branchNode = dataController.currentNode;
		if (!branchNode.isBranch) {
			branchNode = branchNode.parentNode;
		}

		let htmlContent = "";
		for (let i = 0; i < branchNode.data.length; ++i) {
			htmlContent += '<button>' + branchNode.data[i].name + '</button>';
		}
		document.querySelector('nav').innerHTML = htmlContent;

		let navBtns = document.querySelectorAll('nav > button');
		for (let i = 0; i < navBtns.length; ++i) {
			let relativePathStr = branchNode.data[i].name;
			if (!(branchNode === dataController.currentNode)) {
				relativePathStr = '../' + relativePathStr;
			}
			navBtns[i].addEventListener('click', (event) => {
				dataController.currentNode = new Path.Path(relativePathStr);
				this.setupBtns();
				if (!dataController.currentNode.isBranch) {
					history.pushState({}, "", dataController.currentNode.data.pagePath.str);
				}
			});
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
			history.pushState({}, "", '/');
		});

		this.setupBtns();
	}
};

function dataReady(pageData) {
	if (pageData === dataController.currentNode.data ||
		(dataController.currentNode.parentNode === null &&
			pageData.nodePath.str === '/index')
	) {
		setupMainContent(pageData);
		navBar.setVisible(false);
	}
}

function setupMainContent(pageData) {
	document.querySelector('#mainContent #titleBar').innerHTML = '<h1>' + pageData.nodePath.tail + '</h1>';
	document.querySelector('#mainContent #content').innerHTML = pageData.fetchedHtml;
	document.querySelector('.slideBarLayout >:nth-child(2)').scrollTop = 0;
}

let dataController;
let navBar;
// Setup Function
(function () {
	let navPath = (window.location.pathname.startsWith('/html/')) ? window.location.pathname.substring(5, window.location.pathname.length - 5) : '/';
	dataController = new DataController(new Path.Path(navPath));
	navBar = new NavBar();

	addEventListener('popstate', (event) => {
		let navPath = (window.location.pathname.startsWith('/html/')) ? window.location.pathname.substring(5, window.location.pathname.length - 5) : '/';
		dataController.currentNode = new Path.Path(navPath);
		navBar.setupBtns();
	});
})();
