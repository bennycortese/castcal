# Castcal — Technical Knowledge

## Clerk v6 (`@clerk/react`) Setup

### The working setup

**`src/index.tsx`** — ClerkProvider lives here, at the root, wrapping everything:
```tsx
import { ClerkProvider } from '@clerk/react';

root.render(
  // @ts-ignore — Clerk v6 types incorrectly strip all ClerkProvider props (known bug)
  <ClerkProvider publishableKey={process.env.REACT_APP_CLERK_PUBLISHABLE_KEY ?? ''}>
    <App />
  </ClerkProvider>
);
```

**`src/App.tsx`** — Router lives here, inside App which is a child of ClerkProvider:
```tsx
import { useUser } from '@clerk/react';

function App() {
  const { user } = useUser(); // works because ClerkProvider is above this in index.tsx
  return (
    <Router>
      <Routes>...</Routes>
    </Router>
  );
}
```

**`src/SignInPage.tsx`**:
```tsx
<SignIn routing="hash" signUpUrl="/login" fallbackRedirectUrl="/create" />
```

**`src/RegistrationPage.tsx`**:
```tsx
<SignUp routing="hash" signInUrl="/sign-in" />
```

### Why this structure

- `ClerkProvider` must be **above** `Router` in the tree — never inside it
- `publishableKey` is passed explicitly because auto-reading from env can be unreliable in CRA
- `// @ts-ignore` is needed because Clerk v6's TypeScript type for ClerkProvider is `Omit<IsomorphicClerkOptions, string | number | symbol>` which strips **all** string-keyed props — this is a Clerk bug, not our code
- `routing="hash"` is used instead of `routing="path"` because path routing requires Clerk to have access to React Router's `useNavigate`, which it can't when ClerkProvider sits above the Router. Hash routing works standalone with no router dependency.

### Environment variable

```
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_...
```

Must have the `REACT_APP_` prefix for create-react-app to expose it to the browser.

### What breaks things (do not do these)

- Putting `ClerkProvider` inside `<Router>` or in `App.tsx` below the Router
- Using `routing="path"` when ClerkProvider is above Router — the component renders blank
- Removing `publishableKey` prop — VSCode lint will complain about the key potentially being undefined
- Upgrading Clerk and assuming types are fixed — check the `Omit<IsomorphicClerkOptions, string | number | symbol>` type before removing `@ts-ignore`
