import {Path} from '/javascript/lib/Path.js'
import {Hierarchy} from '/javascript/lib/Hierarchy.js'
import {PageData, PageDataController} from '/javascript/lib/PageNavigation.js'

import {svgNamespace, MenuIcon} from '/javascript/lib/svgIcons.js'
import * as StyleSheetFunctions from '/javascript/lib/StyleSheetFunctions.js'
import {FolderItem, FileItem} from '/javascript/FileBrowserAssets.js'

class NavBar {
	#pageDataController;
	#homeNode;
	#currentNode;

	rootNode;
	menuBtn;
	logoBtn;
	backBtn;
	navBtns;

	#cssNavBarVisible = new StyleSheetFunctions.CssToggleValue('/css/Global.css', 'body', '--navBarVisible', ['0', '1']);
	close = this.#cssNavBarVisible.close;
	open = this.#cssNavBarVisible.open;

	set currentNode(hierarchyNode) {
		if (hierarchyNode == null) {
			this.#currentNode = this.#homeNode;
			this.#pageDataController.currentPage = null;
		} else {
			this.#currentNode = hierarchyNode;
			if (this.#currentNode.hasData) {
				this.#pageDataController.currentPage = this.#currentNode;
			}
		}

		this.backBtn.nodeUpdate(this.#currentNode);
		this.navBtns.nodeUpdate(this.#currentNode);
	}
	get currentNode() { return this.#currentNode; }

	constructor(rootNode, pageDataController, currentPath) {
		// PageDataController
		this.#pageDataController = pageDataController;
		this.#homeNode = this.#pageDataController.hierarchy.root;

		// Root
		this.rootNode = rootNode;

		// MenuBtn
		this.menuBtn = this.rootNode.appendChild(document.createElement("button"));
		this.menuBtn.setAttribute("type", "button");

		let svgElem = new MenuIcon();
		this.menuBtn.appendChild(svgElem.rootNode);

		let pNode = this.menuBtn.appendChild(document.createElement("p"));
		pNode.appendChild(new Text('MENU'));

		this.menuBtn.addEventListener('click',
			this.#cssNavBarVisible.toggle.bind(this.#cssNavBarVisible));

		// NavBar
		let div = this.rootNode.appendChild(document.createElement('div'));

		// LogoBtn
		this.logoBtn = div.appendChild(document.createElement('div'));
		let imgElem = this.logoBtn.appendChild(document.createElement('img'));
		imgElem.setAttribute("src", "/images/Banner_NoPadding_945x189.png");
		this.logoBtn.addEventListener('click', (event) => {
			this.currentNode = this.#homeNode;
			history.pushState({}, "", '/');
		});

		// BackBtn
		this.backBtn = div.appendChild(document.createElement('button'));
		this.backBtn.setAttribute('type', 'button');

		svgElem = this.backBtn.appendChild(document.createElementNS(svgNamespace, 'svg'));
		let svgPath = svgElem.appendChild(document.createElementNS(svgNamespace, 'path'));

		pNode = this.backBtn.appendChild(document.createElement('p'));
		this.backBtn.textNode = pNode.appendChild(new Text());
		this.backBtn.nodeUpdate = (function (node) {
			if (node === null || node.parentNode === null) {
				this.textNode.nodeValue = '';
			} else {
				this.textNode.nodeValue = formatTitle(node.name);
			}
		}).bind(this.backBtn);

		this.backBtn.addEventListener('click', (event) => {
			if (this.#currentNode != null &&
				this.#currentNode.parentNode != null
			) {
				if (this.#currentNode.parentNode === this.#homeNode) {
					this.#currentNode = this.#homeNode;
					this.backBtn.nodeUpdate(this.#currentNode);
					this.navBtns.nodeUpdate(this.#currentNode);
				} else {
					this.currentNode = this.#currentNode.parentNode;
				}
			}
		});

		// NavBtns
		this.navBtns = div.appendChild(document.createElement('nav'));
		this.navBtns.btnPool = [];

		this.navBtns.nodeUpdate = (function (node) {
			if (node.isBranch) {
				this.replaceChildren(...this.btnPool.slice(0, node.children.length));
				for (let i = 0; i < node.children.length; ++i) {
					this.btnPool[i].text.nodeValue = formatTitle(node.children[i].name);
				}
			} else {
				this.replaceChildren();
			}
		}).bind(this.navBtns);

		const btnEvent = (function (eventObj) {
			for (let i = 0; i < this.navBtns.btnPool.length; ++i) {
				if (this.navBtns.btnPool[i] === event.currentTarget) {
					this.currentNode = this.#currentNode.children[i];
					if (this.#currentNode.hasData) {
						history.pushState({}, "", this.#currentNode.data.pagePath.str);
					}
					return;
				}
			}
		}).bind(this);
		for (let i = 0; i < 10; ++i) {
			let btn = document.createElement("button");
			btn.text = btn.appendChild(new Text());
			btn.addEventListener('click', btnEvent);
			this.navBtns.btnPool.push(btn);
		}

		// Setup
		this.currentNode = this.#pageDataController.hierarchy.getNode(currentPath);
	}
};

class MainContent {
	rootNode;

	constructor() {
		this.rootNode = document.getElementById('mainContent');
		this.rootNode.appendChild(document.createElement('div'));
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
	if (pageDataController.currentPageData === pageData) {
		let mainContentNode = document.getElementById('mainContent');
		mainContentNode.children[0].replaceWith(pageData.fetchedHtmlNode);
		document.title = mainContentNode.children[0].children[0].children[0].childNodes[0].data;
		mainContentNode.scrollTop = 0;
		document.adoptedStyleSheets[0] = pageData.cssStyleSheet;
		pageData.jsModule.loadPage();
		navBar.close();
	}
}

function pageUrlToNodePath() {
	return new Path((window.location.pathname.startsWith('/html/')) ? window.location.pathname.substring(5, window.location.pathname.length - 5) : window.location.pathname);
}

let pageDataController;
let navBar;
let pageTitleDomNode;

// Setup Function
(function () {
	pageDataController = new PageDataController([
		['blogs',
			'TheFileSystem_DataNavigation'
		],
		'About',
		'Contact'
	],
	dataReady
	);
	document.adoptedStyleSheets = [new CSSStyleSheet()];

	navBar = new NavBar(document.getElementById('navBar'), pageDataController, pageUrlToNodePath());

	addEventListener('popstate', (event) => {
		let destNode = pageDataController.hierarchy.getNode(pageUrlToNodePath());
		navBar.currentNode = destNode;
	});
})();
