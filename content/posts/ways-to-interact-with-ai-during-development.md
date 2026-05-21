---
title: Ways to Interact With AI During Development (Incomplete Thoughts / Draft)
date: 2026-05-21
tags: [ai, coding-agents, ai-harnesses, development, structured-processes]
description: There are many ways to reach a given goal, when working with AI during software development. Here I go over some of my favorite patterns.
---

## Why Patterns?

If you aren't following structured, repeatable patterns you are just vibing it. You're throwing queries at an AI Coding Agent and hoping for the best. Even if you're reviewing all (hopefully) of the outputs, you're still vibing the inference.

When you're working with AI agents you're playing the role of a manager. And, while any **humans you "manage" shouldn't need micromanaging**; you sure as shit **better be micromanaging AI**.

If you're not applying processes to your AI coding agent flows, I can promise you're using up additional time, tokens, and your patience.

## Patterns

### Plan + Grill Mode

Enter plan mode + explicitly request grilling. You go back and forth with AI and grill each other and ask questions. You continue until a serious resolution on all parts is conceded.

Grill sessions are exceedingly more beneficial when dealing with large rewrites, heavy new functionality, or changing anything that is mission critical.

### Scrutinize an Implementation

Enter plan mode + explain what your current issue is. Ask the LLM to scrutinize the implementation. This works similar to grill mode, but instead of staying in theory mode, you are scrutinizing the implementation. Lean into skills and your CLAUDE/AGENT files to help guide towards appropriate patterns and implementations.

Scrutiny is helpful when you are trying to iron out bugs, fix implementation holes, or whenever you just feel like something "isn't quite right".

### TODO files

Todo markdown files are a great way to keep context aligned, provide the ability to track progress and assert logic.

While these are markedly similar to plan mode and plan files, these persist beyond the agent's conversation & context. I tend to write these in application tmp directories (e.g. `./tmp/feature-directory/*md`). These can be combined with grill mode & scrutinization.
