import {Path} from './lib/Path.js'
import {Hierarchy} from './lib/Hierarchy.js'
import * as StyleSheetFunctions from './lib/StyleSheetFunctions.js'

import {PageData, PageDataController} from './lib/PageNavigation.js'

class NavBar {
	#pageDataController;
	#homeNode;
	#currentNode;

	#rootDomNode = document.getElementById('mainNav');
	#backBtnDomNode;
	#navDomNode;

	#navBtnPool = [];

	#cssomNavBarVisible;

	set currentNode(hierarchyNode) {
		if (hierarchyNode === null) {
			this.#pageDataController.currentPageNode = null;
			this.#currentNode = this.#homeNode;
		} else {
			this.#currentNode = hierarchyNode;
		}

		// Setup BackBtn
		if (this.#currentNode == this.#homeNode) {
			this.#backBtnDomNode.firstElementChild.children[1].innerHTML = '';
		} else {
			this.#backBtnDomNode.firstElementChild.children[1].innerHTML = this.#currentNode.name;
		}

		// Setup ChildBtns
		this.#navDomNode.replaceChildren();
		if (this.#currentNode.isBranch) {
			for (let i = 0; i < this.#currentNode.data.length; ++i) {
				this.#navBtnPool[i].innerHTML = formatTitle(this.#currentNode.data[i].name);
				this.#navDomNode.append(this.#navBtnPool[i]);
			}
		} else {
			this.#pageDataController.currentPageNode = this.#currentNode;
		}
	}
	get currentNode() { return this.#currentNode; }

	setVisible(isVisible) {
		isVisible = (isVisible) ? '1' : '0';
		this.#cssomNavBarVisible.style.setProperty('--navBarVisible', isVisible);
	}

	toggleVisible() {
		let setVal = '1';
		if (this.#cssomNavBarVisible.style.getPropertyValue('--navBarVisible') == setVal) {
			setVal = '0';
		}
		this.#cssomNavBarVisible.style.setProperty('--navBarVisible', setVal);
	}

	navBtnFunc(eventObj) {
		let index = 0;
		while (index < this.#currentNode.data.length) {
			if (this.#navBtnPool[index] == eventObj.currentTarget) {
				break;
			}
			++index;
		}
		this.currentNode = this.#currentNode.data[index];
		if (!this.#currentNode.isBranch ||
			this.#currentNode === this.#pageDataController.hierarchy.getNode(new Path('/'))
		) {
			this.#pageDataController.currentPageNode = this.#currentNode;
			history.pushState({}, "", this.#currentNode.data.pagePath.str);
		}
	}

	constructor(pageDataController, currentPath) {
		this.#pageDataController = pageDataController;
		this.#homeNode = this.#pageDataController.hierarchy.root;
		this.#backBtnDomNode = this.#rootDomNode.children[1].children[1];
		this.#navDomNode = this.#rootDomNode.children[1].children[2];
		this.#cssomNavBarVisible = StyleSheetFunctions.findRule('/css/Global.css', 'body');

		for (let i = 0; i < 10; ++i) {
			let btn = document.createElement("button");
			btn.addEventListener('click', this.navBtnFunc.bind(this));
			this.#navBtnPool.push(btn);
		}

		let node = this.#pageDataController.hierarchy.getNode(currentPath);
		if (node === this.#homeNode) {
			this.#pageDataController.currentPageNode = this.#homeNode;
		}
		this.currentNode = node;

		this.#rootDomNode.children[0].addEventListener(
			'click',
			this.toggleVisible.bind(this)
		);

		this.#rootDomNode.children[1].children[0].children[0].addEventListener('click', (event) => {
			this.currentNode = this.#homeNode;
			this.#pageDataController.currentPageNode = this.#homeNode;
			history.pushState({}, "", '/');
		});

		this.#backBtnDomNode.addEventListener('click', (event) => {
			if (this.#currentNode != null &&
				this.#currentNode.parentNode != null
			) {
				this.currentNode = this.#currentNode.parentNode;
			}
		})
	}
};

function formatTitle(title) {
	let ret = title[0];
	for (let i = 1; i < title.length; ++i) {
		if (title[i] == '_') {
			ret += ' - ';
		} else if (title[i] == title[i].toUpperCase()) {
			ret += ' ' + title[i];
		} else {
			ret += title[i];
		}
	}
	return ret;
}

function dataReady(pageData) {
	if (pageDataController.currentPageData == pageData) {
		document.adoptedStyleSheets = [pageData.cssStyleSheet];
		let mainContentNode = document.getElementById('mainContent');
		pageTitleDomNode.innerHTML = formatTitle(pageData.fileSystemPath.tail);
		mainContentNode.replaceChild(pageData.fetchedHtmlNodes[0], mainContent.children[1]);
		mainContentNode.scrollTop = 0;
		navBar.setVisible(false);
	}
}

let pageDataController;
let navBar;
let pageTitleDomNode;
// Setup Function
(function () {
	let navPath = new Path((window.location.pathname.startsWith('/html/')) ? window.location.pathname.substring(5, window.location.pathname.length - 5) : window.location.pathname);
	pageDataController = new PageDataController([
		['blogs',
			'TheFileSystem_DataNavigation'
		],
		'About',
		'Contact'
	],
	dataReady
	);

	navBar = new NavBar(pageDataController, navPath);

	pageTitleDomNode = document.createElement('h1');
	document.getElementById('mainContent').children[0].append(pageTitleDomNode);

	addEventListener('popstate', (event) => {
		let navPath = new Path((window.location.pathname.startsWith('/html/')) ? window.location.pathname.substring(5, window.location.pathname.length - 5) : window.location.pathname);
		let destNode = pageDataController.hierarchy.getNode(navPath);
		if (destNode == pageDataController.hierarchy.root) {
			pageDataController.currentPageNode = destNode;
		}
		navBar.currentNode = pageDataController.hierarchy.getNode(navPath);
	});
})();
