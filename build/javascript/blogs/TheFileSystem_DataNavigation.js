import * as FileBrowserAssets from '/javascript/FileBrowserAssets.js'

let init = 0;

export function loadPage() {
	if (!init) {
		init = 1;
		let fileBrowserInitBtns = document.getElementById('mainContent').querySelectorAll(".fileBrowserInitBtn");
		let ex1Btn = new FileBrowserAssets.InitBtn(fileBrowserInitBtns[0]);
	}
}
