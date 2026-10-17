# Contributing

This is a group project. Work is tracked as GitHub issues and merged through pull requests.

## 1. Claim an issue

1. Pick an open issue that has no assignee.
2. Comment `claim` on the issue. A bot assigns you and reacts with a thumbs-up within about 20 seconds.
3. To release it, comment `unclaim`.

Only owners, members, and collaborators are processed. Issues you open yourself are assigned to you automatically. Claiming is not exclusive: if two people claim the same issue, both are assigned, so coordinate in the issue thread.

## 2. Create a branch

Create the branch from the issue so it is linked automatically:

    gh issue develop <issue-number> --checkout --name <type>/<short-name>

Branch types: `feat`, `fix`, `docs`, `chore`, `ci`, `refactor`.

## 3. Commit

Use Conventional Commits, for example `feat(e2e): add BVA tests for register form field length`. Before pushing, run:

    npm run check:fix
    npm run verify

## 4. Open a pull request

- Put `Closes #<issue-number>` in the description so the issue closes on merge.
- Request a review from another team member.
- `main` is protected: it needs one approving review, resolved conversations, and a squash merge.

## Testing rules

The tests run against the production site (https://www.gramedia.com).

- Never complete a real payment, and never click the register submit button.
- Boundary values must come from direct observation of the live site, not from assumptions.
- Keep the delay between actions (`ACTION_DELAY_MS`) and use explicit waits, never fixed sleeps.
- Use a dedicated test account, never a personal one.

See the [README](README.md) for setup and the [Test Plan](docs/TEST_PLAN.md) for scope.