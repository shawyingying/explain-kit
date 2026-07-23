#!/usr/bin/env bash
# explain-kit · 把 explain 安装为 Claude Code + Codex 的个人级 Skill
# 一次安装，两个工具通用：在任意 demo 文件夹敲 /explain 或说「给 demo 加需求讲解」即可。幂等。
set -euo pipefail

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_SKILL="${HOME}/.claude/skills/explain"
CODEX_SKILL="${HOME}/.codex/skills/explain"
OLD_CMD="${HOME}/.claude/commands/explain.md"
OLD_HOME="${HOME}/.explain-kit"

install_to () {
  local dest="$1"
  mkdir -p "$dest/engine" "$dest/examples"
  cp "$KIT_DIR/SKILL.md" "$dest/SKILL.md"
  cp -R "$KIT_DIR/engine/." "$dest/engine/"
  cp "$KIT_DIR/PLAYBOOK.md" "$dest/PLAYBOOK.md"
  cp "$KIT_DIR/explain-config.template.js" "$dest/explain-config.template.js"
  rm -rf "$dest/examples"
  cp -R "$KIT_DIR/examples" "$dest/examples"
}

echo "→ 安装 explain skill..."
install_to "$CLAUDE_SKILL"
echo "   ✅ Claude Code: $CLAUDE_SKILL"
if [ -d "${HOME}/.codex" ]; then
  install_to "$CODEX_SKILL"
  echo "   ✅ Codex:        $CODEX_SKILL"
fi

# 清理旧版 slash command（与新 skill 同名，skill 优先，但移除以免混淆）
[ -f "$OLD_CMD" ] && rm -f "$OLD_CMD" && echo "   已移除旧版命令 $OLD_CMD"

echo ""
echo "用法："
echo "  • Claude Code：在任意原型 demo 文件夹敲 /explain"
echo "  • Codex：在任意原型 demo 文件夹说「给 demo 加需求讲解」（或敲 /explain）"
echo "  两者都会自动：读 PLAYBOOK → 复制 demo 到同级 <原名>-讲解/ 副本 → 在副本里拷 engine/ + 加 include + 生成 explain-config.js（原 demo 不动；缺文档/多份文档会先问你）"
if [ -d "$OLD_HOME" ]; then
  echo ""
  echo "ℹ️  旧版目录 $OLD_HOME 已不再使用，可手动删除：rm -rf \"$OLD_HOME\""
fi
echo ""
echo "更新：重新跑 ./install.sh 即可。"
