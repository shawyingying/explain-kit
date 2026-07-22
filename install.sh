#!/usr/bin/env bash
# explain-kit · 把 explain 安装为 Claude Code 个人级 Skill
# 一次安装，所有原型 demo 通用：在任意 demo 文件夹敲 /explain 即可。幂等，可重复执行（用于更新）。
set -euo pipefail

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_HOME="${HOME}/.claude/skills/explain"
OLD_CMD="${HOME}/.claude/commands/explain.md"
OLD_HOME="${HOME}/.explain-kit"

echo "→ 安装 explain skill..."
mkdir -p "$SKILL_HOME/engine" "$SKILL_HOME/examples"
cp "$KIT_DIR/SKILL.md" "$SKILL_HOME/SKILL.md"
cp -R "$KIT_DIR/engine/." "$SKILL_HOME/engine/"
cp "$KIT_DIR/PLAYBOOK.md" "$SKILL_HOME/PLAYBOOK.md"
cp "$KIT_DIR/explain-config.template.js" "$SKILL_HOME/explain-config.template.js"
rm -rf "$SKILL_HOME/examples"
cp -R "$KIT_DIR/examples" "$SKILL_HOME/examples"

# 清理旧版 slash command（与新 skill 同名，skill 优先，但移除以免混淆）
[ -f "$OLD_CMD" ] && rm -f "$OLD_CMD" && echo "   已移除旧版命令 $OLD_CMD"

echo ""
echo "✅ 安装完成：$SKILL_HOME"
echo ""
echo "用法："
echo "  • Claude Code：在任意原型 demo 文件夹敲 /explain（自动拷引擎进 demo + 加 include + 生成配置）"
echo "  • Codex / 其它 AI 工具：对其说「读 $SKILL_HOME/PLAYBOOK.md，给当前 demo 加需求讲解」"
if [ -d "$OLD_HOME" ]; then
  echo ""
  echo "ℹ️  旧版目录 $OLD_HOME 已不再使用，可手动删除：rm -rf \"$OLD_HOME\""
fi
echo ""
echo "更新：重新跑 ./install.sh 即可。"
