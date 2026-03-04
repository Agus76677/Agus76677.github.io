import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  DiffSourceToggleWrapper,
  headingsPlugin,
  imagePlugin,
  InsertImage,
  InsertThematicBreak,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  Separator,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  type MDXEditorMethods
} from '@mdxeditor/editor'
import { useMemo, useRef, useState, type ChangeEvent } from 'react'

import '@mdxeditor/editor/style.css'

const DEFAULT_MDX = `---
title: 'Paper Reading: New Draft'
description: '一句话描述这篇读后感。'
publishDate: 2026-03-04
tags:
  - research
  - paper reading
---

import PaperCard from '@/components/papers/PaperCard.astro'

## Paper 1

<PaperCard title='Paper title' arxiv='2307.15818' score={4} tldr='一句话总结。'>
  - 核心方法：
  - 价值：
  - 局限：

  ![figure](/images/your-figure.png)
</PaperCard>
`

function todayStamp() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return `${y}${m}${d}-${hh}${mm}`
}

export default function LocalMdxEditor() {
  const editorRef = useRef<MDXEditorMethods>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [markdown, setMarkdown] = useState(DEFAULT_MDX)
  const [fileName, setFileName] = useState(`draft-${todayStamp()}.mdx`)
  const [status, setStatus] = useState('已加载默认模板。')

  const plugins = useMemo(
    () => [
      headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4] }),
      listsPlugin(),
      quotePlugin(),
      thematicBreakPlugin(),
      linkPlugin(),
      linkDialogPlugin(),
      imagePlugin(),
      markdownShortcutPlugin(),
      toolbarPlugin({
        toolbarContents: () => (
          <>
            <DiffSourceToggleWrapper>
              <UndoRedo />
              <Separator />
              <BlockTypeSelect />
              <BoldItalicUnderlineToggles />
              <Separator />
              <CreateLink />
              <ListsToggle />
              <Separator />
              <InsertImage />
              <InsertThematicBreak />
            </DiffSourceToggleWrapper>
          </>
        )
      })
    ],
    []
  )

  const loadMarkdown = (content: string, nextName?: string) => {
    setMarkdown(content)
    editorRef.current?.setMarkdown(content)
    if (nextName) setFileName(nextName)
  }

  const handleOpen = () => {
    fileInputRef.current?.click()
  }

  const handleFilePicked = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      loadMarkdown(text, file.name)
      setStatus(`已打开文件：${file.name}`)
    } catch {
      setStatus('读取文件失败，请重试。')
    } finally {
      event.target.value = ''
    }
  }

  const handleExport = () => {
    const content = editorRef.current?.getMarkdown() ?? markdown
    const outName = fileName.trim().toLowerCase().endsWith('.mdx')
      ? fileName.trim()
      : `${fileName.trim()}.mdx`
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = outName
    a.click()
    URL.revokeObjectURL(url)
    setStatus(`已导出：${outName}`)
  }

  const handleCopy = async () => {
    const content = editorRef.current?.getMarkdown() ?? markdown
    try {
      await navigator.clipboard.writeText(content)
      setStatus('已复制 MDX 内容到剪贴板。')
    } catch {
      setStatus('复制失败，请手动复制。')
    }
  }

  const handleResetTemplate = () => {
    const name = `draft-${todayStamp()}.mdx`
    loadMarkdown(DEFAULT_MDX, name)
    setStatus('已重置为默认模板。')
  }

  return (
    <section className='editor-shell'>
      <div className='editor-actions'>
        <button type='button' onClick={handleOpen}>
          打开 .mdx/.md
        </button>
        <button type='button' onClick={handleExport}>
          导出 .mdx
        </button>
        <button type='button' onClick={handleCopy}>
          复制 MDX
        </button>
        <button type='button' onClick={handleResetTemplate}>
          重置模板
        </button>
      </div>

      <div className='editor-file'>
        <label htmlFor='local-mdx-filename'>文件名：</label>
        <input
          id='local-mdx-filename'
          type='text'
          value={fileName}
          onChange={(event) => setFileName(event.target.value)}
        />
      </div>

      <p className='editor-status'>{status}</p>

      <input
        ref={fileInputRef}
        type='file'
        accept='.mdx,.md,text/markdown,text/plain'
        style={{ display: 'none' }}
        onChange={handleFilePicked}
      />

      <MDXEditor
        ref={editorRef}
        markdown={markdown}
        onChange={(value) => setMarkdown(value)}
        plugins={plugins}
        contentEditableClassName='prose prose-pure dark:prose-invert dark:prose-pure max-w-none'
      />
    </section>
  )
}
