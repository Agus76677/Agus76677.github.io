# 个人博客使用说明（论文阅读 / 每日笔记 / 项目）

## 1. 本地启动

```powershell
cd C:\blog\site
npm.cmd install
npm.cmd run dev
```

浏览器打开 `http://localhost:4321`。

## 2. 论文阅读（统一使用 MDX + PaperCard）

### 推荐流程

1. 新建目录：`src/content/blog/user/paper-reading-你的slug/`
2. 复制模板：`templates/paper-reading-template.mdx` 到 `src/content/blog/user/paper-reading-你的slug/index.mdx`
3. 如果有封面图，放到同目录并在 frontmatter 填 `heroImage.src`
4. 填写 frontmatter 与正文后保存

发布后会自动出现在：
- `/blog`
- `/blog/research`

### PaperCard 标准写法

```mdx
<PaperCard
  title='论文标题'
  arxiv='2307.15818'
  score={4}
  tldr='一句话总结'
>
  - 核心方法：...
  - 价值：...
  - 局限：...
</PaperCard>
```

说明：`tldr` 会以“小灯泡摘要条”显示在卡片上方。

### 在 PaperCard 中插入图片

```mdx
<img src='/images/your-figure.png' alt='figure' class='zoomable rounded-xl border border-border my-3' />
```

图片文件放在：`site/public/images/`。

## 3. 新增每日笔记

1. 新建目录：`src/content/blog/user/daily-YYYY-MM-DD/`
2. 复制模板：`templates/daily-template.md` 到 `src/content/blog/user/daily-YYYY-MM-DD/index.md`
3. 修改 frontmatter，确保 `tags` 包含 `daily`
4. 写正文

发布后会自动出现在：
- `/blog`
- `/blog/daily`

## 4. 新增项目

1. 打开 `src/data/projects.ts`
2. 按 `templates/project-template.ts` 新增对象到 `projects` 数组
3. 保存后访问 `/projects`

## 5. 构建与部署

```powershell
cd C:\blog\site
npm.cmd run build
```

GitHub Pages 已配置自动部署，推送到 `main` 后会自动更新网站。

## 6. 常见错误排查

1. Actions 报 MDX 语法错误（Unexpected character...）
- 通常是 `PaperCard` 标签被改坏。
- 必须使用 `title/arxiv/score/tldr` 这套字段，不能写成 `<PaperCard 1 2307 ...>`。

2. 图片不显示
- 图片必须在 `site/public/images/`。
- 正文里使用绝对路径：`/images/文件名.png`。

3. Sitepins 编辑后构建失败
- 优先在代码模式编辑 `.mdx`。
- 不要把 `.mdx` 从 Raw 切到可视化再切回。
- 不要删除 `import PaperCard ...` / `import PaperRatingGuide ...`。
- 检查每个 `<PaperCard ...>` 都有匹配的 `</PaperCard>`。

## 7. 你最常改的文件

- 网站配置：`src/site.config.ts`
- 论文文章：`src/content/blog/user/paper-reading-*/index.mdx`
- 每日笔记：`src/content/blog/user/daily-*/index.md`
- 项目列表：`src/data/projects.ts`
