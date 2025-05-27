export const svgNamespace = 'http://www.w3.org/2000/svg'

export class MenuIcon {
	rootNode;

	constructor(rootNode = null) {
		if (rootNode != null) {
			this.rootNode = rootNode;
		} else {
			this.rootNode = document.createElementNS(svgNamespace, 'svg');
		}

		for (let i = 0; i < 3; ++i) {
			let svgRect = this.rootNode.appendChild(document.createElementNS(svgNamespace, 'rect'));
			svgRect.setAttribute('class', 'menuIcon');
		}
	}
};
