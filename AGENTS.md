<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Task tracking

GitHub Issues on `FOXSimRacing/stintly` is the centralized, canonical task tracker for the project's roadmap — see the `stintly-github-tasks` skill before creating or updating any issue there (required label/type/assignee/milestone conventions).

Within a single working session, use the Task tools (`TaskCreate`/`TaskUpdate`/`TaskList`) to track your own steps and keep them current as you go — mark a task `in_progress` before starting it and `completed` immediately after finishing it, not batched at the end. This is session-scoped only and never substitutes for a GitHub issue.

For manual/browser QA testing of the app, see the `stintly-qa-testing` skill — it documents a fixed test account to reuse instead of creating and deleting throwaway users.
