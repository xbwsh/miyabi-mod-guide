# 绝区零与星见雅 · 模组使用手册

饥荒联机版绝区零公共模组与星见雅角色模组的静态使用手册。使用 HTML、CSS、JavaScript 和本地图片，无需安装依赖或构建。玩法内容的对应版本见角色页“配置与版本”；网站样式更新不代表模组已经实机验收。

## 发布

在仓库 Settings → Pages → Build and deployment 中选择 GitHub Actions。推送到 `main` 后自动部署。

网站地址：https://xbwsh.github.io/miyabi-mod-guide/

## 文件

- `index.html`：启用步骤、两份手册入口与常用操作。
- `miyabi.html`：角色能力、装备、衣装和配置。
- `zzz.html`：角色资料、驱动盘、公共材料、建筑与邦布。
- `style.css`：布局、移动端和主题。
- `app.js`：搜索、衣装切换、主题选择与群号复制。
- `assets/`：随网站保存的图片。
- `particles.js`：桌面端表情点阵互动，窄屏隐藏并按可见性暂停。
- `legacy-links.js`：将旧首页书签跳转到对应手册。
- `tools/check-site.py`：检查 HTML 结构、唯一 ID、站内链接与资源引用。
- `.github/workflows/pages.yml`：自动部署配置。

默认纸色浅色主题，尊重访客保存的深浅主题选择。三页共用布局与交互脚本，所有脚本均为本地资源。

## 本地检查

运行 `python tools/check-site.py` 与 `node --check app.js`。运行 `python -m http.server 8766 --bind 127.0.0.1` 后，在浏览器查看首页与两个手册，检查搜索、旧书签、折叠内容、衣装切换及手机目录。

## 内容说明

模组作者：关东。游戏原版图标属于其原权利人；本项目为非官方同人模组介绍。此仓库仅包含网站，不包含模组运行文件、制作源文件或访问凭据。
