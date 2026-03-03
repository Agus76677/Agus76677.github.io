# 个人博客使用说明（论文阅读 / 每日笔记 / 项目）

## 1. 本地启动

```powershell
cd C:\blog\site
npm install
npm run dev
```

浏览器打开 `http://localhost:4321`

## 2. 新增论文阅读记录

1. 新建目录：`src/content/blog/user/<你的slug>/`
2. 复制 `templates/research-template.md` 到 `src/content/blog/user/<你的slug>/index.md`
3. 修改 frontmatter：
   - `title`
   - `description`
   - `publishDate`
   - `tags` 里必须包含 `research`
4. 填写正文

发布后会自动出现在：
- `/blog`
- `/blog/research`

## 3. 新增每日笔记

1. 新建目录：`src/content/blog/user/daily-YYYY-MM-DD/`
2. 复制 `templates/daily-template.md` 到 `src/content/blog/user/daily-YYYY-MM-DD/index.md`
3. 修改 frontmatter，确保 `tags` 包含 `daily`
4. 写当日内容

发布后会自动出现在：
- `/blog`
- `/blog/daily`

## 4. 新增项目

1. 打开 `src/data/projects.ts`
2. 按 `templates/project-template.ts` 的结构新增一个对象到 `projects` 数组
3. 保存后访问 `/projects`

## 5. 构建与部署

```powershell
cd C:\blog\site
npm run build
```

构建产物在 `dist/`，可直接部署到 Vercel / Netlify / GitHub Pages。

## 7. GitHub Pages 自动部署（推荐）

项目已内置工作流：`.github/workflows/deploy-github-pages.yml`。

第一次上线：

1. 在 GitHub 新建空仓库（例如 `my-blog`）。
2. 本地推送代码：

```powershell
cd C:\blog\site
git init
git add .
git commit -m "init blog"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<你的仓库名>.git
git push -u origin main
```

3. GitHub 仓库页面进入：
   - `Settings` -> `Pages` -> `Build and deployment`
   - Source 选择 `GitHub Actions`
4. 回到 `Actions` 页面等待 `Deploy to GitHub Pages` 成功。
5. 访问：
   - 项目仓库：`https://<你的用户名>.github.io/<你的仓库名>/`
   - 如果仓库名是 `<你的用户名>.github.io`：`https://<你的用户名>.github.io/`

之后每次 `git push` 到 `main` 都会自动更新网站。

## 6. 你最需要改的文件

- 站点名称与导航：`src/site.config.ts`
- 论文与日记内容：`src/content/blog/user/**/index.md`
- 项目列表：`src/data/projects.ts`
