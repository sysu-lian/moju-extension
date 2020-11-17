const vscode = require("vscode");
const util = require("./utils/util");
const fs = require("fs");
const path = require("path");
const exec = require('child_process').exec;

const { generate,writeFile,readFolderData } = require("./compiler/generate/router")
const extensionPath = __dirname;
const rootPath = vscode.workspace.rootPath;
let projectPath = rootPath
let projectName = ""
let key={}

/**
 * 从某个HTML文件读取能被Webview加载的HTML内容
 * @param {*} context 上下文
 * @param {*} templatePath 相对于插件根目录的html文件相对路径
 */
function getWebViewContent(context, templatePath) {
  const resourcePath = util.getExtensionFileAbsolutePath(context, templatePath);
  const dirPath = path.dirname(resourcePath);
  let html = fs.readFileSync(resourcePath, "utf-8");
  // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
  html = html
    .replace(/(href|content|src)=([^\s">]+)/g, '$1="$2')
    .replace(
      /(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g,
      (m, $1, $2) => {
        const res =
          $1 +
          vscode.Uri.file(path.resolve(dirPath, $2))
            .with({ scheme: "vscode-resource" })
            .toString() +
          '"';
        console.log(res);
        return res;
      }
    );
  return html;
}

/**
 * 执行回调函数
 * @param {*} panel
 * @param {*} message
 * @param {*} resp
 */
function invokeCallback(panel, message, resp) {
  console.log("回调消息：", resp);
  // 错误码在400-600之间的，默认弹出错误提示
  if (
    typeof resp == "object" &&
    resp.code &&
    resp.code >= 400 &&
    resp.code < 600
  ) {
    util.showError(resp.message || "发生未知错误！");
  }
  panel.webview.postMessage({
    cmd: "vscodeCallback",
    cbid: message.cbid,
    data: resp,
  });
}

/**
 * 存放所有消息回调函数，根据 message.cmd 来决定调用哪个方法
 */
const messageHandler = {
  // 选择工程路径
  chooseProjectPath(global,message){

    vscode.window.showOpenDialog({canSelectFolders:true,canSelectFiles:false}).then(fileInfos => {
      // 获取信息
      let folderPath = fileInfos[0].path;
      folderPath = folderPath.substring(1, folderPath.length)

      // 发送结果
      global.panel.webview.postMessage({
        cmd: "vscodeCallback",
        cbid: message.cbid,
        data: folderPath,
      });
    })
  },
  // 生成代码
  generateCode(global, message) {
    if(message.type ==="design_router"){
       // 保存配置文件
       fs.writeFileSync(rootPath + "/projectConfig.json", JSON.stringify(key, null, 2))
      // 生成文件
      writeFile(message.data, rootPath, 2)
    }else if(message.type === "create_project"){
      if(message.data.length===0){
        return;
      }
      // 生成文件
      writeFile(message.data, projectPath, 2)

      // 打开工程
    let folderUrl = vscode.Uri.file(projectPath+"/"+projectName)
    vscode.commands.executeCommand("vscode.openFolder", folderUrl, true)
    }


    global.panel.webview.postMessage({
      cmd: "vscodeCallback",
      cbid: message.cbid,
      data: "生成成功",
    });
  },
// 计算路由文件
  computeCode(global, message) {
    let computedData = generate(message.key.data)
    key = message.key;
    // console.log(11, message);
    global.panel.webview.postMessage({
      cmd: "vscodeCallback",
      cbid: message.cbid,
      data: computedData,
    });

    // let folderName = path.dirname(extensionPath);
    // let folderUrl = vscode.Uri.file(folderName)
    // console.log(1,folderUrl,folderName);
    // vscode.commands.executeCommand("vscode.openFolder", folderUrl, true)
    // vscode.commands.executeCommand(`start ${rootPath}`);
    // exec(`start ${extensionPath}`);
  },
  // 生成模板工程文件
  computeProjectCode(global, message) {
    projectName= message.params.name;
    projectPath= message.params.projectPath;
    
    let dirPath = path.resolve(extensionPath,"./template-project/vue-basic-js")

    let computedData = readFolderData(dirPath,projectName)
    console.log(1,dirPath,projectName,projectPath);

    global.panel.webview.postMessage({
      cmd: "vscodeCallback",
      cbid: message.cbid,
      data: computedData,
    });
  },
  getProjectConfig(global, message) {
    try {
      let routerInfo = fs.readFileSync(rootPath + "/projectConfig.json", { encoding: 'utf-8' });
      global.panel.webview.postMessage({
        cmd: "vscodeCallback",
        cbid: message.cbid,
        data: {routerInfo,rootPath},
      });
      vscode.window.showInformationMessage("读取工程配置成功");
    } catch (error) {
      let config = {
        data: [
          {
            id: "1",
            name: "moduleA",
            title: "模块A",
            children: [
              {
                id: "2",
                name: "pageA",
                title: "页面A",
                children: []
              },
              {
                id: "3",
                name: "pageB",
                title: "页面B",
                children: []
              }
            ]
          },
          {
            id: "4",
            name: "moduleB",
            title: "模块B",
            children: [
              {
                id: "5",
                name: "subModuleB",
                title: "次级模块B",
                children: [
                  {
                    id: "6",
                    name: "pageC",
                    title: "页面C",
                    children: []
                  }
                ]
              }
            ]
          }
        ], id: 7
      }
      global.panel.webview.postMessage({
        cmd: "vscodeCallback",
        cbid: message.cbid,
        data: {routerInfo:JSON.stringify(config),rootPath},
      });
      vscode.window.showInformationMessage("读取工程配置失败，使用默认值");

    }

  },
  getConfig(global, message) {
    const result = vscode.workspace.getConfiguration().get(message.key);
    invokeCallback(global.panel, message, result);
  },
  setConfig(global, message) {
    // 写入配置文件，注意，默认写入工作区配置，而不是用户配置，最后一个true表示写入全局用户配置
    vscode.workspace
      .getConfiguration()
      .update(message.key, message.value, true);
    util.showInfo("修改配置成功！");
  },
};

module.exports = function (context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.openCreateProjectWebview", function (
      uri
    ) {
      const panel = vscode.window.createWebviewPanel(
        "testWelcome", // viewType
        "自定义欢迎页", // 视图标题
        vscode.ViewColumn.One, // 显示在编辑器的哪个部位
        {
          enableScripts: true, // 启用JS，默认禁用
          retainContextWhenHidden:true
        }
      );
      let global = { panel };
      let html = getWebViewContent(context, "src/view/dist/index.html");
      html = html.replace(
        `window.pageName = "createProjectPage"`,
        `window.pageName="createProjectPage"`
      );
      panel.webview.html = html;
      panel.webview.onDidReceiveMessage(
        (message) => {
          if (messageHandler[message.cmd]) {
            messageHandler[message.cmd](global, message);
          } else {
            util.showError(`未找到名为 ${message.cmd} 回调方法!`);
          }
        },
        undefined,
        context.subscriptions
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.openConfigWebview", function (
      uri
    ) {
      const panel = vscode.window.createWebviewPanel(
        "testWelcome", // viewType
        "自定义欢迎页", // 视图标题
        vscode.ViewColumn.One, // 显示在编辑器的哪个部位
        {
          enableScripts: true, // 启用JS，默认禁用
          retainContextWhenHidden:true
        }
      );
      let global = { panel };
      let html = getWebViewContent(context, "src/view/dist/index.html");
      html = html.replace(
        `window.pageName = "createProjectPage"`,
        `window.pageName="configPage"`
      );
      panel.webview.html = html;
      panel.webview.onDidReceiveMessage(
        (message) => {
          if (messageHandler[message.cmd]) {
            messageHandler[message.cmd](global, message);
          } else {
            util.showError(`未找到名为 ${message.cmd} 回调方法!`);
          }
        },
        undefined,
        context.subscriptions
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.openHelpWebview", function (
      uri
    ) {
      const panel = vscode.window.createWebviewPanel(
        "testWelcome", // viewType
        "帮助手册", // 视图标题
        vscode.ViewColumn.One, // 显示在编辑器的哪个部位
        {
          enableScripts: true, // 启用JS，默认禁用
        }
      );
      let global = { panel };
      let html = getWebViewContent(context, "src/view/dist/index.html");
      html = html.replace(
        `window.pageName = "createProjectPage"`,
        `window.pageName="helpPage"`
      );
      panel.webview.html = html;
      panel.webview.onDidReceiveMessage(
        (message) => {
          if (messageHandler[message.cmd]) {
            messageHandler[message.cmd](global, message);
          } else {
            util.showError(`未找到名为 ${message.cmd} 回调方法!`);
          }
        },
        undefined,
        context.subscriptions
      );
    })
  );
  const key = "vscodePluginDemo.showTip";
  // 如果设置里面开启了欢迎页显示，启动欢迎页
  if (vscode.workspace.getConfiguration().get(key)) {
    vscode.commands.executeCommand("extension.demo.showWelcome");
  }
};
