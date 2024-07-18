---
title: A better AI-powered Development Environment
date: 2024-07-15
tags: [neovim, vim, supermaven, copilot, lsp, ai, dx]
description: An objectively better, unobtrusive AI-powered development environment. Making use of a mixture of language servers and AI suggestions within the same flow.
---

## So... Why exactly?

LLM-powered coding suggestions have been a hot topic since they were [first introduced to the mainstream development industry with the launch of GitHub's Copilot program](https://github.blog/2021-06-29-introducing-github-copilot-ai-pair-programmer/). Some developers swear by their productivity gains (and some stats show it is helpful), while droves of other developers have found themselves turning off LLM-powered suggestions for a plethora of reasons: too distracting, too much reliability on the suggestions, less engaging work, and honestly much more.

I don't think anyone is wrong here. I think AI pair programming is likely going to become the future of an ideal development environment, but... The way we currently deliver AI-powered suggestions just won't cut it in the long-term IMO.

So, here is my rather basic premise: use a completion engine, wire up LSPs &amp; your LLM of choice to that completion engine, and then manage suggestions through a singular interface.

> Note:
>
> This flow should work just fine for Copilot or Supermaven. Just ensure you include [`copilot-cmp`](https://github.com/zbirenbaum/copilot-cmp) and [`copilot`](https://github.com/github/copilot.vim]) plugins.

## Neovim Plugins Required

* [nvim-cmp](https://github.com/hrsh7th/nvim-cmp)
  * A LUA-based neovim completion engine, which will be used to manage our LLM suggestions (supermaven or copilot) and the builtin Neovim LSP
* [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig)
  * An official neovim community plugin which handles defaults of MANY lsp configs
* [cmp-nvim-lsp](https://github.com/hrsh7th/cmp-nvim-lsp)
  * Provides the `"nvim_lsp"` source, enabling support for use with `nvim-cmp`
* [supermaven-inc/supermaven-nvim](https://github.com/supermaven-inc/supermaven-nvim)
  * Objectively better, and faster AI-powered coding suggestions, with builtin support for `nvim-cmp`


## Neovim LUA Configuration

```lua
require'supermaven-nvim'.setup({
  keymaps = {
    accept_suggestion = "",
    clear_suggestion = "",
    accept_word = ""
  },
  disable_inline_completion = true
})

local cmp = require'cmp'
cmp.setup({
  sources = {
    {name = "supermaven"},
    {name = "nvim_lsp"}
  },
  map = cmp.mapping.preset.insert({
    # control + space to accept the top suggestion
    ['<C-Space>'] = cmp.mapping.confirm({select = true}),
  })
})
```

