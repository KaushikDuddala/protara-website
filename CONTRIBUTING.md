# How to Contribute to Protara Front-End

Thanks for taking the time to contribute. This is an open-source project, and help of any size is appreciated.

## Where to Start

New here? Start with issues labeled `good first issue`; they are small and well-scoped. Otherwise browse the issues page and pick something that interests you.

To request to work on an issue, comment on the issue itself. A maintainer will update its status and you are free to begin. Keep up with the comment thread in case there are details from the maintainers or other contributors.

## Bug Reports

If you find a bug, open an issue and describe it in as much detail as possible:

- What you expected to happen and what actually happened
- Steps to reproduce
- Browser/device and relevant environment details
- Any error messages or logs

If you would like to fix the bug yourself, see [Resolving Bugs or Tackling Issues](#resolving-bugs-or-tackling-issues).

## Feature Requests

Open an issue and describe the feature as specifically as you can. Mockups, links, or other resources help. To implement it yourself, see the next section.

## Resolving Bugs or Tackling Issues

Claim an issue **before** you start working on it, so two people do not work on the same thing. Simply comment "I want to work on this issue" (or something similar) on the issue you plan to take. When you open a pull request, reference the issue next to `Fixes #` so it links and closes automatically on merge.

## Submitting Changes

Once your changes are ready, open a pull request using the pull request template. Keep the title short, simple, and descriptive. Use the body to describe in detail what you changed and why.

## Coding Conventions

Following these conventions keeps the codebase consistent and easy to read.

### File Naming and Organization

- Name files in **lowercase** with **dash separators** (kebab case), for example `use-pin-progress.ts`. Keep type names and file names aligned where it is natural to do so.
- Place files in the directory that best matches their purpose:
  - `app/`: pages, layouts, API routes, and components used only by a single route group
  - `components/`: shared components; primitives go under `components/ui`
  - `contexts/`: React context providers
  - `hooks/`: custom React hooks
  - `lib/`: utilities, Supabase clients, and shared TypeScript types

### TypeScript Conventions

The project uses strict TypeScript. Prettier is the formatter of choice, so format your code with it (or run the equivalent formatting command in your editor) before submitting.

- Every exported function that is not a React component **must** have a TSDoc comment describing what it does, its parameters, and its return value.
- Every React component should declare a `Props` interface. Document each prop with a short comment and add a block comment above the component describing what it renders.
- Keep state variable definitions at the top of a component, and place hooks such as `useEffect` just before the `return` statement when possible.
- If the same code is used in more than one place, extract it into a shared utility function or hook rather than duplicating it.

Example of a documented utility function:

```typescript
/**
 * Formats a UTC millisecond time while converting to central timezone.
 *
 * @param millis UTC millisecond timestamp to format
 * @param format Dayjs format string to format the time to
 * @returns The formatted time string
 */
export function formatTimestamp(millis: number, format: string): string {
    return dayjs(millis).format(format);
}
```

Example of a documented component:

```tsx
interface ButtonProps {
    /** Text to display inside the button */
    label: string;

    /** Called when the button is clicked */
    onClick: () => void;
}

/**
 * Renders a clickable button that invokes a callback.
 * The button is disabled until the user is authenticated.
 */
const SubmitButton = (props: ButtonProps) => { /* ... */ };
```

### Import Order

Group imports in the following order, with a blank line between groups:

1. React and standard library / function imports
2. External libraries (Next.js, Supabase, Stripe, etc.)
3. Local project modules (`@/components`, `@/hooks`, `@/lib`, etc.)
4. JSON and static asset imports

### Comments

Use comments to explain **why** a piece of code exists, not what it does. The code itself should make the "what" clear. Remove commented-out code and placeholder text. Inline notes such as `TODO:` and `FIXME:` are fine when they point at a concrete next step.

### Accessibility and Motion

- Respect the `prefers-reduced-motion` media query. Animations and scroll-scrubbed effects must have a non-animated fallback.
- Add `aria-hidden` to decorative elements and provide text alternatives for meaningful content.
- Keep contrast and focus states accessible; do not rely on color alone to convey information.

### Final Notes

These conventions exist to make the code easier to follow, not to slow you down. If breaking one produces clearer code, do it. Readability and maintainability come first.

Questions? Ask a maintainer.