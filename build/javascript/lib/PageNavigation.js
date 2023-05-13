import {Hierarchy} from './Hierarchy.js'
import {Path} from './Path.js'

export class PageData {
	static defaultPageDataLoadFunc;

	hierarchyNode = null;
	#fileSystemPath = null;
	#pagePath = null;
	#cssPath = null;

	fetchedHtmlNodes = null;
	cssStyleSheet = null;

	get fileSystemPath() {
		if (this.#fileSystemPath === null) {
			this.#fileSystemPath = this.hierarchyNode.getAbsolutePath();
		}
		return this.#fileSystemPath;
	}

	get pagePath() {
		if (this.#pagePath === null) {
			this.#pagePath = new Path('/html' + this.fileSystemPath.str + '.html');
		}
		return this.#pagePath;
	}

	get cssPath() {
		if (this.#cssPath === null) {
			this.#cssPath = new Path('/css' + this.fileSystemPath.str + '.css');
		}
		return this.#cssPath;
	}

	activatePage(callbackFunc = PageData.defaultPageDataLoadFunc) {
		if (this.fetchedHtmlNodes === null) {
			this.fetchedHtmlNodes = 1;
			this.cssStyleSheet = 1;
			fetch('/FetchedHtml' + this.fileSystemPath.str + '.html').then(response => {
				return response.text();
			}).then(fetchedData => {
				let node = document.createElement('div');
				node.innerHTML = fetchedData;
				this.fetchedHtmlNodes = [node];
				if (this.cssStyleSheet != 1) {
					callbackFunc(this);
				}
			});
			fetch(this.cssPath.str).then(response => {
				return response.text();
			}).then(fetchedData => {
				let styleSheet = new CSSStyleSheet();
				return styleSheet.replace(fetchedData);
			}).then(styleSheet => {
				this.cssStyleSheet = styleSheet;
				if (this.fetchedHtmlNodes != 1) {
					callbackFunc(this);
				}
			});
		} else if (this.fetchedHtmlNodes === 1 || this.cssStyleSheet === 1) {
			return;
		} else {
			callbackFunc(this);
		}
	}

	constructor(inputFileSystemPath = null, inputPagePath = null) {
		this.#fileSystemPath = inputFileSystemPath;
		this.#pagePath = inputPagePath;
	}
}

export class PageDataController {
	hierarchy;
	#currentPageNode;
	#currentPageData;

	#pageHome;
	#page404;

	set currentPageNode(hierarchyNode) {
		this.#currentPageNode = hierarchyNode;
		if (this.#currentPageNode === null) {
			this.#currentPageData = this.#page404;
		} else if (this.#currentPageNode.parentNode === null) {
			this.#currentPageData = this.#pageHome;
		} else if (!this.currentPageNode.isBranch) {
			this.#currentPageData = this.#currentPageNode.data;
		}
		this.#currentPageData.activatePage();
	}
	get currentPageNode() { return this.#currentPageNode; }

	get currentPageData() { return this.#currentPageData; }

	constructor(inputNamesArray, defaultPageDataLoadFunc) {
		PageData.defaultPageDataLoadFunc = defaultPageDataLoadFunc;

		this.#pageHome = new PageData(new Path('/index'), new PageData('/index.html'));
		this.#page404 = new PageData(new Path('/404'), new PageData('/404.html'));

		this.hierarchy = new Hierarchy(inputNamesArray);
		this.#pageHome.hierarchyNode = this.hierarchy.root;
		for (let i = 0; i < this.hierarchy.leafNodes.length; ++i) {
			let leafNode = this.hierarchy.leafNodes[i];
			leafNode.data = new PageData();
			leafNode.data.hierarchyNode = leafNode;
		}
	}
};
