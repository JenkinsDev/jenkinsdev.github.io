---
title: How to remove all files from Git LFS quickly.
date: 2022-09-20
tags: [git, lfs]
description: Prerequisites A Git repo with files stored using Git LFS The BFG Repo Cleaner tool (requires java itself) Have a clean HEAD The BFG is a simpler, faster alternative to git-filter-branch for cleansing bad data out of your Git repository history…
---

# Prerequisites

1. A Git repo with files stored using [Git LFS](https://git-lfs.github.com/)
2. The [BFG Repo Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) tool (requires java itself)
3. Have a clean [HEAD](https://git-scm.com/book/en/v2/Git-Internals-Git-References#ref_the_ref)

> The BFG is a simpler, faster alternative to git-filter-branch for cleansing bad data out of your Git repository history...

# The One-Liner

```
git lfs ls-files --all | awk '{split($0,a," - ");l=split(a[2],b,"/"); print b[l]}' | xargs -d\\n -n1 java -jar ../bfg.jar -D && \
    git reflog expire --expire=now --all && \
    git gc --prune=now --aggressive
```

# What's Happening?

1. `git lfs ls-files --all` -> list all files & hashes
2. `awk '{split($0,a," - ");l=split(a[2],b,"/"); print b[l]}'` -> split the data to only get file names, since bfg does not work with paths
3. `xargs -d\\n -n1 java -jar ../bfg.jar -D` -> for each file emitted by awk, run bfg with `--delete-files/-D` (removes the file)
4. `git reflog expire --expire=now --all` -> The "expire" subcommand prunes old reflog entries.
5. `git gc --prune=now --aggressive` -> [`git-gc`](https://git-scm.com/docs/git-gc) cleans up unnecessary files and optimizes the local repository. `--prune=now` prunes loose objects older than now (all loose), `--aggressive` forces `git-gc` to optimize "heavier".
