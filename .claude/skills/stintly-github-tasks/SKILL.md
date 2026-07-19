---
name: stintly-github-tasks
description: Use when creating/updating GitHub issues, committing code, or opening PRs for Stintly (FOXSimRacing/stintly) — issues are the canonical task tracker, and every commit ships through a branch + PR linked to one, never a direct push to main.
---

# Managing Stintly's tasks on GitHub

GitHub Issues on `FOXSimRacing/stintly` is the **centralized task tracker**
for this project — not the Claude Code Task tool. The Task tool is only for
tracking steps within a single working session (see `AGENTS.md`); it never
substitutes for or duplicates what belongs in a GitHub issue.

Before creating a new issue, check `gh issue list --repo FOXSimRacing/stintly
--state all` — the roadmap is usually already broken into issues; prefer
updating an existing one over creating a near-duplicate.

## Every issue needs four things set — not just a title/body

1. **Label** — one of the repo's existing labels (`gh label list --repo
   FOXSimRacing/stintly`): `enhancement`, `bug`, `documentation`, etc. Don't
   leave an issue unlabeled.
2. **Type** — GitHub's issue-type field, separate from labels
   (org-level types: `Task`, `Bug`, `Feature`):
   ```bash
   gh issue edit <n> --repo FOXSimRacing/stintly --type Feature
   ```
   Use `Task` for infra/process work (CI, migrations, deploy config),
   `Feature` for user-facing functionality, `Bug` for defects.
3. **Assignee** — the person developing or who developed that piece of work:
   ```bash
   gh issue edit <n> --repo FOXSimRacing/stintly --add-assignee gusribeiro
   ```
   Only assign once work has actually started or finished on the issue —
   don't assign not-yet-started issues just to have a name on them. As of
   2026-07-19 the sole collaborator/developer on this repo is `gusribeiro`.
4. **Milestone** — issues are grouped by scope, not by date:
   - **MVP** — foundational work: auth, team onboarding, basic CRUD
     (races/roster), infra (migrations/RLS, CI/deploy). App is minimally
     usable without the stint builder.
   - **V1** — the product's actual differentiator: the stint-timeline
     builder and everything that depends on it (realtime sync, shareable
     view).
   ```bash
   gh issue edit <n> --repo FOXSimRacing/stintly --milestone "MVP"
   ```
   If a new piece of work doesn't obviously fit either, ask before
   inventing a third milestone.

## Recording progress

When you make progress on an issue but it isn't done, leave a comment
summarizing what shipped and what's still open — don't close it:

```bash
gh issue comment <n> --repo FOXSimRacing/stintly --body "$(cat <<'EOF'
**Progresso:** ...
**Ainda pendente:** ...
EOF
)"
```

Only close an issue when the described scope is actually complete — check
with the user first if it's ambiguous whether remaining sub-items (e.g. "OAuth
Discord" inside an otherwise-done auth issue) should split into a new issue
or stay open under the current one.

## Never push directly to `main` — always branch + PR, linked to an issue

1. **Find or create the issue first**, with the full metadata above (label,
   type, assignee, milestone), before writing any code for it.
2. **Branch off `main`** — don't commit on `main` itself:
   ```bash
   git checkout -b feat/<issue-number>-<short-slug> main
   ```
   Prefix by the issue's type: `feat/` for Feature, `fix/` for Bug, `chore/`
   for Task.
3. Commit on that branch as normal.
4. **Push the branch and open a PR linked to the issue** — never
   `git push origin main`:
   ```bash
   git push -u origin feat/<issue-number>-<short-slug>
   gh pr create --repo FOXSimRacing/stintly --base main \
     --title "..." --body "Closes #<n>"
   ```
   Use `Closes #<n>` (auto-closes the issue on merge) only when the PR fully
   resolves the issue's scope. For partial progress toward a larger issue,
   reference it without the closing keyword (e.g. "Part of #<n>") so the
   issue stays open after merge — same judgment call as the "recording
   progress" section above, just expressed via the PR body instead of (or
   alongside) a comment.
5. **Never merge the PR without the user's explicit go-ahead.** Opening the
   PR is standing-authorized by this workflow; merging into `main` is a
   separate, always-confirmed step.

## Before calling GitHub issue work done

Re-check all four fields on every issue you touched this session — it's easy
to update the body/comment and forget label/type/assignee/milestone:

```bash
gh issue list --repo FOXSimRacing/stintly --json number,title,assignees,labels,milestone \
  --jq '.[] | "#\(.number) [\(.milestone.title // "-")] \(.title) — assignee: \([.assignees[].login] | join(","))"'
```
