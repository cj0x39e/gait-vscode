// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { exec } from "child_process";

type GitExtension = {
  getAPI: (version: number) => GitAPI;
};

type GitAPI = {
  repositories: Repository[];
};

type Repository = {
  rootUri?: vscode.Uri;
  inputBox: { value: string };
  state: {
    workingTreeChanges: Change[];
    indexChanges: Change[];
    mergeChanges: Change[];
  };
};

type Change = {
  uri: vscode.Uri;
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "gait-vscode" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const helloWorldDisposable = vscode.commands.registerCommand(
    "gait-vscode.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from gait-vscode!");
    },
  );

  const outputChannel = vscode.window.createOutputChannel("Gait");

  const generateMessageDisposable = vscode.commands.registerCommand(
    "gait-vscode.generateScmMessage",
    async () => {
      const gitExtension =
        vscode.extensions.getExtension<GitExtension>("vscode.git");
      if (!gitExtension) {
        vscode.window.showErrorMessage("Git extension not found.");
        return;
      }

      const gitApi = gitExtension.isActive
        ? gitExtension.exports.getAPI(1)
        : (await gitExtension.activate()).getAPI(1);
      const repository = gitApi.repositories[0];
      if (!repository) {
        vscode.window.showWarningMessage("No Git repository detected.");
        return;
      }

      const repoRoot =
        repository.rootUri?.fsPath ??
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!repoRoot) {
        vscode.window.showWarningMessage("No workspace folder detected.");
        return;
      }

      const command = `claude -p "生成 commit message" --system-prompt "你的唯一任务是输出符合以下格式的文本，不得输出格式外的任何内容：

<commit_message>
主题行

- 要点1
- 要点2
</commit_message>

禁止：分析过程、代码块、分隔线(---)、解释性文字。
规范：commitlint.config.js 存在则遵循，否则用 type(scope): subject，type∈{feat,fix,refactor,chore,docs,test,style,perf,build,ci,revert}，subject 中文。
"`;

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.SourceControl,
          title: "生成提交信息...",
          cancellable: false,
        },
        async () => {
          try {
            const { stdout, stderr } = await runCommand(
              command,
              repoRoot,
              outputChannel,
            );
            if (stderr) {
              outputChannel.appendLine("[stderr]");
              outputChannel.appendLine(stderr.trim());
            }

            if (stdout) {
              outputChannel.appendLine("[stdout]");
              outputChannel.appendLine(stdout.trim());
            }

            const message = extractCommitMessage(stdout);
            if (!message) {
              vscode.window.showWarningMessage("未生成有效的提交信息。");
              return;
            }

            repository.inputBox.value = message;
            vscode.window.showInformationMessage("SCM message generated.");
          } catch (error) {
            const err = error as NodeJS.ErrnoException;
            if (err.code === "ENOENT") {
              vscode.window.showErrorMessage(
                "未找到 claude 命令，请确认已安装并在 PATH 中。",
              );
              return;
            }
            if (
              (err as NodeJS.ErrnoException).code === "ETIMEDOUT" ||
              (err as any).killed
            ) {
              vscode.window.showErrorMessage(
                "生成超时（120s），请检查 claude 命令是否在等待输入或网络异常。",
              );
              return;
            }
            outputChannel.appendLine("[error]");
            outputChannel.appendLine(err.stack ?? err.message ?? String(err));
            outputChannel.show(true);
            vscode.window.showErrorMessage(
              `生成失败: ${err.message ?? String(err)}`,
            );
          }
        },
      );
    },
  );

  context.subscriptions.push(
    helloWorldDisposable,
    generateMessageDisposable,
    outputChannel,
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}

function extractCommitMessage(output: string): string {
  const trimmed = output.trim();
  const match = trimmed.match(
    /<commit_message>([\s\S]*?)<\/commit_message>/i,
  );
  if (match?.[1]) {
    return match[1].trim();
  }
  return trimmed;
}

function runCommand(
  command: string,
  cwd: string,
  outputChannel: vscode.OutputChannel,
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    outputChannel.appendLine(`[run] ${command}`);
    outputChannel.appendLine(`[cwd] ${cwd}`);

    const child = exec(command, {
      cwd,
      maxBuffer: 10 * 1024 * 1024,
      env: process.env,
    });
    outputChannel.appendLine("[status] process spawned");
    child.stdin?.end();
    let stdout = "";
    let stderr = "";
    let settled = false;

    const timeout = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      child.kill();
      reject(Object.assign(new Error("ETIMEDOUT"), { code: "ETIMEDOUT" }));
    }, 120000);

    child.stdout?.on("data", (chunk) => {
      const text = String(chunk);
      stdout += text;
      outputChannel.appendLine(text.trimEnd());
    });

    child.stderr?.on("data", (chunk) => {
      const text = String(chunk);
      stderr += text;
      outputChannel.appendLine(text.trimEnd());
    });

    child.on("error", (error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      reject(error);
    });

    child.on("close", (code, signal) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      if (code && code !== 0) {
        const error = new Error(
          `Process exited with code ${code}${signal ? ` (signal ${signal})` : ""}`,
        );
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}
