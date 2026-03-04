# Sitepins 在线编辑接入说明（当前仓库）

本仓库已经预置了 Sitepins 配置文件：`.sitepins/config.json`。  
因为你的 Astro 站点在 `site/` 子目录，所以路径必须按本文填写。

## 1. 在 Sitepins 连接仓库

1. 打开 `https://app.sitepins.com/new`
2. 登录并授权 GitHub
3. 选择仓库：`Agus76677/Agus76677.github.io`
4. Branch 选择：`main`
5. 点击 `Add Site`

## 2. 确认项目路径（最关键）

在 Site Settings -> Configure Site 中，确认以下字段：

- `code_folder`: `site/src`
- `content_folder`: `site/src/content/blog/user`
- `media_folder`: `site/public/images`
- `media_library`: `native`

如果你看到的值和上面不一致，手动改成上面的路径再保存。

## 3. 你能在线做什么

- 编辑现有文章：`site/src/content/blog/user/**/index.md(x)`
- 上传图片到 `site/public/images`，并在正文里用 `/images/xxx.webp`
- 保存后直接提交到 GitHub（main 分支）

## 4. 提交后如何上线

你的仓库已经开启 GitHub Actions 自动部署。  
Sitepins 每次提交到 `main` 后会自动触发部署，等待 Actions 绿色后即可在线查看。

## 5. 关于 .md 与 .mdx

- 普通日记可以用 `.md`
- 论文卡片（例如 `<PaperCard />`）建议用 `.mdx`
- 在线编辑时不要删掉 MDX 里的 `import` 行，否则论文组件会失效

## 6. 当前推荐编辑入口

- 论文阅读：`site/src/content/blog/user/paper-reading-*/index.mdx`
- 每日笔记：`site/src/content/blog/user/daily-YYYY-MM-DD/index.md`

