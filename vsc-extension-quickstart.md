# Welcome to gait-vscode

## What's in the folder

* This folder contains all of the files necessary for your extension.
* `package.json` - extension manifest (commands + SCM title menu).
* `src/extension.ts` - command implementation and claude CLI invocation.
* `resources/` - SCM title bar icon assets.
* `scripts/install-extension.sh` - 打包并安装扩展的脚本。

## Setup

* install the recommended extensions (amodio.tsl-problem-matcher, ms-vscode.extension-test-runner, and dbaeumer.vscode-eslint)
* 确保 `claude` CLI 已安装且在 PATH 中

## Get up and running straight away

* Press `F5` to open a new window with your extension loaded.
* 打开 Source Control 面板，点击标题栏的“生成提交信息”图标按钮。
* Set breakpoints in your code inside `src/extension.ts` to debug your extension.
* Output 面板里选择 “Gait” 查看 stdout/stderr。

## Make changes

* You can relaunch the extension from the debug toolbar after changing code in `src/extension.ts`.
* You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the VS Code window with your extension to load your changes.


## Explore the API

* You can open the full set of our API when you open the file `node_modules/@types/vscode/index.d.ts`.

## Run tests

* Install the [Extension Test Runner](https://marketplace.visualstudio.com/items?itemName=ms-vscode.extension-test-runner)
* Run the "watch" task via the **Tasks: Run Task** command. Make sure this is running, or tests might not be discovered.
* Open the Testing view from the activity bar and click the Run Test" button, or use the hotkey `Ctrl/Cmd + ; A`
* See the output of the test result in the Test Results view.
* Make changes to `src/test/extension.test.ts` or create new test files inside the `test` folder.
  * The provided test runner will only consider files matching the name pattern `**.test.ts`.
  * You can create folders inside the `test` folder to structure your tests any way you want.

## Go further

* Reduce the extension size and improve the startup time by [bundling your extension](https://code.visualstudio.com/api/working-with-extensions/bundling-extension).
* [Publish your extension](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) on the VS Code extension marketplace.
* Automate builds by setting up [Continuous Integration](https://code.visualstudio.com/api/working-with-extensions/continuous-integration).
