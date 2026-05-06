---
title: AI In Mid-2026 (Draft, In-Progress)
date: 2026-05-04
tags: [ai, coding-agents, ai-harnesses, moving-fast, development, leadership]
description: Here's how I'm using generative AI to help propel my performace, while controlling quality of output. From software, graphic & UI/UX design, general workflows, tracking my knowledge, and everything in between.
---

## Where it all started

### Magic, but not really useful

Let's rewind all the way back to 2022/2023 - a time when LLMs were introduced and 'AI' was relatively new to the general public.

Most people understood AI would become a force-multiplier, but it was still more of a toy than any form of tool. Something used to create gimmicks and ask silly questions. Many found joy in testing its limits and trying to make it break, but usefulness was still missing. Those that trusted too heavily in its "intelligence" were quick to stumble.

Overall, it inspired the sort of awe that [Akinator](https://akinator.com) did in the mid-2000's. Intruiging to play with, but generally not overly useful. Felt little like magic.

### Things started to change... On second thought - only a little.

Then something happened around late-2023. Or was it mid-2024? Honestly, the exact timing evades me. But, a new service was thrust upon the software community. It sent shockwaves for months. Doomsayers said our time was over; software engineers were no longer needed and we should find a new job, and quick. Pollyannas thought they wielded a superpower. Stubborn individuals denied to even give it more than a quick glance before dismissal... It was the one and only: GitHub Copilot.

GitHub Copilot proved itself to be "sort of useful" in the end. No, not as a full-fledged software engineer - our jobs were safe. More like an IDE's autocomplete on steroids. An autocomplete that felt like it could read your mind. You'd start to type a thought and it would complete it.

Of course this power came from the decades of compounding knowledge and repetitive code examples it was trained on. It excelled in spitting information back out that it was trained on:

- **Needed to sort an array?** Name your method + a docblock and it'd generate an autocomplete for you.
- **Wanted to implement the Fisher-Yates shuffle algorithm? Maybe a path finding algorithm?** There are probably hundreds of thousands of examples within its training dataset. Its got you covered.

Maybe *THIS* was the moment where it felt like "magic" for the software field. It felt like AI was really learning software development, but most knew it was a facade. It was akin to doing a card trick for your friends: maybe you could throw them off with your sleight-of-hand, but you weren't performing "real magic". You were just playing an elaborate 'trick'.

It could help you cut out tons of boilerplate, but it was far from a silver-bullet. It completely failed at net-new concepts:

- **Need to develop something novel?** That's on you, *bud*. 
- **Work in a newer, or fast evolving, language?** You may get a semblence of code, but I doubt it would work.
- **Need to pull in context from other files?** Pft, that limited context window was your enemy.

Hell, tools & IDEs like cursor were coming out of the woodwork. But these all were bandages for the symptom, not a fix for the root cause. Perhaps this was the correct move at the time, but it has slowly felt like a huage waste of human-hours. Though, I'd be amiss to ignore that best-practices were learned and folded into the products and AI models that came after.

### Okay.. It really changed this time

In 2025 something really changed. It wasn't just model quality (which was proving to be on the rise), nor model efficiency (which was also getting better), and it also wasn't random symptom fixes like one-off tools that provided longer-term memory or guidance markdown files (they helped)... No, what really changed was the advent of Claude Code, and subsequently Codex. We got what soon became known as "Agent Harnesses".

#### [Super]-Agent Harnesses

Agent harnesses changed a lot. You could probably call earlier tools like Cursor an agent harness, but this felt different. A CLI-based agent harness gave the power of the command line, not just your raw code &amp; the model.

A harness could call on *tools*. These tools translate to system executable calls: `ls`, `cd`, `grep`, `cat`, `curl` (oh god), etc. The models felt more alive, could crawl AND evolve your codebase (or crash your computer, [delete your production database](https://x.com/lifeof_jer/status/2048103471019434248)) by stringing together learned skills and tools.

This was akin to the moment a layman gets a power tool - sure they can use it, but the real benefit is seen when a highly-skilled contractor uses it. It's democratizing and lower's the threshold for entry into software development, but it won't turn everyone into a software developer. It will, however, be an introduction for *many* new faces in spaces that software resides.
