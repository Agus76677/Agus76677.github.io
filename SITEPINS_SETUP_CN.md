# Sitepins 在线编辑接入说明（当前仓库）

你的仓库已经包含 Sitepins 配置：`.sitepins/config.json`。
当前关键路径：

- `content`: `site/src/content/blog/user`
- `media`: `site/public/images`

## 1. 连接仓库

1. 打开 `https://app.sitepins.com/new`
2. 登录并授权 GitHub
3. 选择仓库：`Agus76677/Agus76677.github.io`
4. 选择分支：`main`
5. 点击 `Add Site`

## 2. 配置页面怎么填

在 Site Settings 里确认：

- Content Folder = `site/src/content/blog/user`
- Media Folder = `site/public/images`

如果某些“可选配置”搜不到值，保持留空即可，不影响使用。

## 3. 在线编辑入口

- 论文阅读：`site/src/content/blog/user/paper-reading-*/index.mdx`
- 每日笔记：`site/src/content/blog/user/daily-YYYY-MM-DD/index.md`

## 4. MDX 编辑模式（非常重要）

- 编辑论文 `.mdx` 时，只使用 `Raw Markdown` 模式。
- 不要在编辑中途切回可视化模式，否则 Sitepins 可能吞掉 `</PaperCard>`。
- 如果你切换过模式，发布前必须检查每个 `PaperCard` 是否成对闭合。

## 5. 论文页面的强约束（重要）

`PaperCard` 必须用标准写法：

```mdx
<PaperCard title='...' arxiv='2307.15818' score={4} tldr='...'>
  - 核心方法：...
  - 价值：...
  - 局限：...
</PaperCard>
```

不要使用下面这种写法（会导致构建失败）：

```mdx
<PaperCard 1 2307 15818 score="4" ...>
```

## 6. 图片插入方式

1. 先上传图片到 `site/public/images`
2. 在 MDX 正文或 `PaperCard` 内写：

```mdx
<img src='/images/your-image.png' alt='figure' class='zoomable rounded-xl border border-border my-3' />
```

## 7. 提交后上线

Sitepins 每次保存会提交到 `main`，GitHub Actions 会自动部署。
等 Actions 变绿后刷新网站即可。
