# gait-vscode

在 Source Control 面板中新增一个按钮，基于当前工作区改动调用 `claude` CLI 自动生成 commit message 并写入 message 输入框。

## Features

- Source Control 标题栏按钮（Git 仓库生效）
- 执行 `claude "根据当前工作区内容变化生成 commit message"` 并写入 SCM message
- 输出面板 “Gait” 显示 stdout/stderr 便于排查
- 生成格式：主题行 + 空行 + 2-3 条要点（中文）
- 默认遵循 Conventional Commits（`type(scope): subject`），如存在 commitlint 规则则以其为准

## Requirements

- 已安装 `claude` CLI 且在 VS Code 的 PATH 中可用
- 当前工作区为 Git 仓库
- VS Code 版本 >= 1.108.1

## Extension Settings

暂无。

## Known Issues

- 依赖 `claude` CLI，若未配置会报错
- 多仓库仅使用第一个 Git 仓库

## Release Notes

详见 `CHANGELOG.md`

## Development

- 本地调试：按 `F5` 启动 Extension Development Host
- 打包安装：运行 `./scripts/install-extension.sh`
