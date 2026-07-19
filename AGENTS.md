<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Task tracking

GitHub Issues on `FOXSimRacing/stintly` is the centralized, canonical task tracker for the project's roadmap — see the `stintly-github-tasks` skill before creating or updating any issue there (required label/type/assignee/milestone conventions).

Within a single working session, use the Task tools (`TaskCreate`/`TaskUpdate`/`TaskList`) to track your own steps and keep them current as you go — mark a task `in_progress` before starting it and `completed` immediately after finishing it, not batched at the end. This is session-scoped only and never substitutes for a GitHub issue.

For manual/browser QA testing of the app, see the `stintly-qa-testing` skill — it documents a fixed test account to reuse instead of creating and deleting throwaway users.

# Where persistent knowledge lives

Nothing about this project should live only in an assistant's private cross-session memory — that's local to one machine and invisible to the rest of the team. Anything worth remembering across sessions goes into one of these, whichever fits:

- A project skill under `.claude/skills/` for a procedure or domain convention (e.g. how to manage GitHub issues, how to QA-test the app).
- This `AGENTS.md` file for a standing rule that applies broadly across the whole repo, not scoped to one workflow.
- Code/config/docs themselves, when the knowledge is really just "how the system behaves" (e.g. a schema comment, a migration note).

When a process correction or new discipline comes up (e.g. "always do X after Y"), encode it as a concrete rule in whichever of the above owns that domain in the same turn — don't just apply it for the rest of the session and leave it unrecorded. If nothing existing owns that domain, that's a signal a new skill may be worth creating.
