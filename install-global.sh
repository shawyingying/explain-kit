#!/usr/bin/env bash
# explain-kit · 全局安装
# 一次安装，所有原型 demo 通用：在任意 demo 文件夹敲 /explain 即可。
# 幂等，可重复执行（用于更新）。
set -euo pipefail

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXPLAIN_HOME="${HOME}/.explain-kit"
CLAUDE_CMDS="${HOME}/.claude/commands"

echo "→ 安装 explain-kit 到全局..."
mkdir -p "$EXPLAIN_HOME/engine" "$CLAUDE_CMDS"

# 引擎 + AI 手册 + 配置模板
cp -R "$KIT_DIR/engine/." "$EXPLAIN_HOME/engine/"
cp "$KIT_DIR/PLAYBOOK.md" "$EXPLAIN_HOME/PLAYBOOK.md"
cp "$KIT_DIR/explain-config.template.js" "$EXPLAIN_HOME/explain-config.template.js"

# Claude Code 用户级 /explain 命令（所有项目可用）
cp "$KIT_DIR/launchers/explain.global.md" "$CLAUDE_CMDS/explain.md"

echo ""
echo "✅ 安装完成："
echo "   引擎与手册  → $EXPLAIN_HOME/"
echo "   /explain 命令 → $CLAUDE_CMDS/explain.md"
echo ""
echo "用法："
echo "   • Claude Code：在任意原型 demo 文件夹敲 /explain（自动拷引擎进 demo + 加 include + 生成配置）"
echo "   • Codex / 其它 AI 工具：对其说「读 $EXPLAIN_HOME/PLAYBOOK.md，给当前 demo 加需求讲解」"
echo ""
echo "更新：重新跑 ./install-global.sh 即可。"
