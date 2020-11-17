// 生成路由代码

const { travels, genSpace, travelsRoute, writeFile, travels2 } = require('./tree');
const { toConstant, toCamel, toPascal, toHyphenate } = require('./string');
const fs = require('fs-extra');
const path = require('path');

const config = {
	indent: 2
}

// 生成注释
function genComment(node, higherNodes) {
	const currentNode = {
		fileName: node.fileName,
		fileDesc: node.fileDesc
	}
	let commentList = [...higherNodes, currentNode].filter(item => item.fileName !== '').map(item => item.fileDesc);
	let comment = `${commentList.join("-")}`
	return comment
}

// 生成路由清单
function genPageLists(root) {
	let result = [];
	result.push({ code: `export default {`, indent: 0 })
	travels2(root, (node, higherNodes) => {
		// if (node.level === 0) return;
		let commentStr = [...higherNodes, {name:node.name,title:node.title}].map(item => item.title).join("-");
		let comment = `// ${commentStr}`
		let code = `${toConstant(node.name)}: '${node.name}',`
		result.push({ code: comment, indent: 1 });
		result.push({ code, indent: 1 });
		// console.log(comment, code);
	})
	result.push({ code: `}`, indent: 0 })
	return [{ filePath: `src/router/pageList.js`, pageContent: [...result] }];
}

// 生成页面文件
function genViewLists(root) {
	let result = [];
	travels2(root, (node, higherNodes) => {
		if(node.children.length>0){
			return;
		}
		let relativePath = [...higherNodes,{name:node.name,title:node.title}].map(i => toCamel(i.name)).join("/")
		let targetPath = `src/views/${relativePath}.vue`
		let pageTemplate = ''
		try {
			pageTemplate = fs.readFileSync(path.resolve(__dirname, '../template/page.vue'), { encoding: 'utf-8' });
		} catch (error) {

		}
		pageTemplate = pageTemplate.replace(/{{ PageName }}/g, `${toPascal(node.name)}`)
		pageTemplate = pageTemplate.replace(/page-name/g, `${toHyphenate(node.name)}`)
		let code = pageTemplate.split('\n');
		let pageContent = []
		code.forEach((line) => { pageContent.push({ code: line, indent: 0 }); })
		result.push({ filePath: targetPath, pageContent })
	})

	return result;
}

function genTemplate(src, dst) {
	let result = []
	let containerTemplate = ''
	try {
		containerTemplate = fs.readFileSync(path.resolve(__dirname, src), { encoding: 'utf-8' });
	} catch (error) {

	}
	let code = containerTemplate.split('\n');
	let pageContent = []
	code.forEach((line) => { pageContent.push({ code: line, indent: 0 }); })
	result.push({ filePath: dst, pageContent })
	return result;
}

// 生成普通文件
function genFile() {
	// let result1 = genTemplate('../template/container.vue', `src/Container.vue`)
	// let result2 = genTemplate('../template/index.js.template', `src/router/index.js`)
	// return [...result1, ...result2]
	return []
}

// 生成路由文件
function genModules(root) {
	let result = [];
	result.push({ code: `import PageList from './pageList'`, indent: 0 });
	result.push({
		code: `const Container = () => import(/* webpackChunkName: 'Container' */ '@/${toPascal('container')
			}.vue')`, indent: 0
	});
	let componentList = []
	let routeContent = []

	travels2(root, (node, higherNodes) => {
		let commentStr = [...higherNodes, {name:node.name,title:node.title}].map(item => item.title).join("-");
		let comment = `// ${commentStr}`

		let path =[...higherNodes,{name:node.name,title:node.title}].map(i=>toCamel(i.name)).join("/");
		let code = `() => import(/* webpackChunkName: '${toCamel(node.name)}' */ '@/views/${path}.vue')`
		if (node.children.length > 0) {
			code = `Container`
		}
		componentList.push({ key: toPascal(node.name), code, comment })
	})
	routeContent = travelsRoute(root, componentList)
	result.push(...routeContent)

	return [{ filePath: `src/router/custom.js`, pageContent: [...result] }];
}

let root  = [ { "id": "1", "name": "moduleA", "title": "模块A", "children": [ { "id": "2", "name": "pageA", "title": "页面A", "children": [] }, { "id": "3", "name": "pageB", "title": "页面B", "children": [] } ] }, { "id": "4", "name": "moduleB", "title": "模块B", "children": [ { "id": "5", "name": "subModuleB", "title": "次级模块B", "children": [ { "id": "6", "name": "pageC", "title": "页面C", "children": [] } ] } ] } ]


// fs.mkdirp(path.join(__dirname, "../codeGenerator"));

// console.log(path.dirname("/src/a/b.js"));

// let list = [...genFile()]
// let page = list[0].pageContent
// let listStr = page.map(item => {
// 	let res = genSpace(item.indent * config.indent) + item.code
// 	return res
// }).join("\n")
// console.log(list);

// 文件路径转树结构
function list2tree(arr) {
	let arrTree = [];

	arr.forEach(item => {
		let pathArr = item.split('/');
		let root = []
		let currentIndex = root;
		pathArr.forEach(i => {
			let element = { name: i, children: [] }
			currentIndex.push(element);
			currentIndex = currentIndex[0].children
		})
		// console.log(JSON.stringify(root));
		arrTree.push(root)
	})
	// console.log(JSON.stringify(arrTree));

	let result = []
	arrTree.forEach(item => {
		result = mergeTrees(result, item)
	})
	return result;
	// console.log(JSON.stringify(result));
}

// 合并树结构（内部）
const mergeTrees = (t1, t2) => {
	if (t1 == [] && t2.length > 0) {
		return t2;
	}
	if (t2 == [] && t1.length > 0) {
		return t1;
	}
	let t1list = t1.map(i => i.name)
	t2.forEach(item => {
		if (t1list.indexOf(item.name) > -1) {
			t1.forEach(i => {
				if (i.name === item.name) {
					i.children = mergeTrees(i.children, item.children)
				}
			})
		} else {
			t1.push(item)
		}
	})

	return t1;
};

// 添加节点标签
function addTreeTag(root) {
	let result = [];
	travels2(root, (item, higherNodes) => {
		let filePath = [...higherNodes, { name: item.name }].map(node => {
			return node.name
		}).join("/")
		// console.log(2, item.name, higherNodes, filePath);
		item.filePath = filePath
		item.isLeaf = item.children.length > 0 ? false : true;
	}, [], ["name"])
	return root;
}

// 默认输出函数
function generate(root) {
	// 供生成的文件数据
	let fileData = [...genPageLists(root), ...genModules(root), ...genViewLists(root), ...genFile()]
	// 文件清单
	let fileList = fileData.map(i=>i.filePath)
	let tree = list2tree(fileList)
	let fileTree = addTreeTag(tree)
	return {fileData,fileTree}
}
// 读取模板工程代码
function readFolderData(dirPath,projectName="demo"){
  let fileTree = [{name:projectName,filePath:projectName,isLeaf:false,children:[]}]
  let fileData = []
  function dfs(path,higherNodes,dst){
    try {
      fs.readdirSync(path,{encoding: 'utf-8'}).forEach(file=>{
        let filePath = [...higherNodes,{name:file}].map(i=>i.name).join("/")
        let item = {name:file,filePath,children:[]}

        if(fs.lstatSync(`${path}/${file}`).isDirectory()){
          item.isLeaf=false;
          dst.push(item)
          // console.log(filePath,item);
          dfs(`${path}/${file}`,[...higherNodes,{name:file}],item.children)
        }else{
          item.isLeaf=true
          dst.push(item)
          let code = genTemplate(`${path}/${file}`,filePath)
          fileData.push(...code)
          // console.log(code);
        }
        // console.log(item);
      })
    } catch (error) {
      console.log(error);
    }
  }
  dfs(dirPath,[{name:projectName}],fileTree[0].children)
//   console.log(1,fileTree);
  // console.log(2,fileData);

  return {fileData,fileTree}
}
let dirPath=path.resolve(__dirname,"../../template-project/vue-basic-js")
readFolderData(dirPath)
let arr = ["src/views/app.vue", "src/views/container.vue", "src/views/moduleA/pageA.vue", "src/views/moduleA/pageB.vue", "src/router/pageList.js", "src/router/index.js", "src/router/custom.js"]
// let result = list2tree(arr)
// let result2 = addTreeTag(result)
// console.log(JSON.stringify(result2));

let t1 = [{ "name": "src", "children": [{ "name": "views", "children": [{ "name": "app.vue", "children": [] }] }] }]
let t2 = [{ "name": "src", "children": [{ "name": "views", "children": [{ "name": "container.vue", "children": [] }] }] }]
// let t = mergeTrees(t1, t2)
// console.log(JSON.stringify(t));
// console.log(toHyphenate("moduelA"));


module.exports = {
	generate,
  writeFile,
  readFolderData
}