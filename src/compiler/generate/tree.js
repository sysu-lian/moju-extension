const { toCamel, toConstant, toPascal, toHyphenate } = require('./string')
const fs = require('fs-extra')
const path = require('path')
function travels(root, handler, higherNodes = [], params = ["fileName", "fileDesc"]) {
	if (!root) {
		return;
	}
	handler(root, higherNodes)
	if (root.children) {
		const currentNode = {}
		params.forEach(item => {
			currentNode[item] = root[item]
		})
		root.children.forEach(item => {
			travels(item, handler, [...higherNodes, currentNode])
		})
	}
}

function travels2(root, handler, higherNodes = [], params = ["name", "title"]) {
	if (root.length === 0) {
		return;
	}
	root.forEach(node => {
		handler(node, higherNodes);
		const currentNode = {}
		params.forEach(item => {
			currentNode[item] = node[item]
		})
		travels2(node.children, handler, [...higherNodes, currentNode], params)
	})
}

function genSpace(num) {
	if (num < 0) return ""
	return Array.from({ length: num }).fill(" ").join('')
}

function injectContent(template, params) {
	let result = template
	Object.keys(params).forEach(item => {
		result = result.replace(`/\\*{{${item}}}\\*/g`, params[item]).replace(`/{{${item}}}/g`, params[item])
	})
	return result;
}

function travelsRoute(root, componentList) {
	let res = [];
	res.push({ code: `export const routes = [`, indent: 0 });

	function dfs(node, level, dst) {
		// console.log(node);
		node.forEach(child => {
			dst.push({ code: `{`, indent: level });
			let component = componentList.filter(item => item.key === toPascal(child.name))[0]
			dst.push({ code: `${component.comment},`, indent: level + 1 })
			dst.push({ code: `path: '${level === 1 ? '/' : ''}${toHyphenate(child.name)}',`, indent: level + 1 })
			dst.push({ code: `name: PageList.${toConstant(child.name)},`, indent: level + 1 })
			dst.push({ code: `meta: { title: '${child.title}'},`, indent: level+1 })
			dst.push({ code: `component: ${component.code},`, indent: level + 1 })
			if (child.children.length > 0) {
				dst.push({ code: `children:[`, indent: level + 1 })
				dfs(child.children, level + 1, dst);
				dst.push({ code: `]`, indent: level + 1 })
			}
			dst.push({ code: `},`, indent: level })
		})
	}
	dfs(root, 1, res);
	res.push({ code: `]`, indent: 0 })
	return res
}

function writeFile(arr, rootPath, indent = 2) {
	arr.forEach(item => {
		let filePath = item.filePath;
		let pageContent = item.pageContent;
		let pageStr = pageContent.map(item => {
			let res = genSpace(item.indent * indent) + item.code
			return res
		}).join("\n")
		fs.mkdirpSync(rootPath + "/" + path.dirname(filePath));
		fs.writeFileSync(rootPath + '/' + filePath, pageStr)
	})
}

module.exports = {
	travels,
	genSpace,
	injectContent,
	travelsRoute,
	writeFile,
	travels2
}