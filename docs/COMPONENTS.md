# Component Hierarchy — Le Génie Web

This document describes the Atomic Design component structure used in the `/web` workspace. Every component lives under `web/src/components/` and belongs to one of five levels: atoms, molecules, organisms, templates, or editor (a domain-specific group).

---

## Table of Contents

1. [Atomic Design principles](#atomic-design-principles)
2. [Import rules](#import-rules)
3. [Atoms](#atoms)
4. [Molecules](#molecules)
5. [Organisms](#organisms)
6. [Templates](#templates)
7. [Editor components](#editor-components)
8. [Data-fetching hooks](#data-fetching-hooks)
9. [Adding a new component](#adding-a-new-component)

---

## Atomic Design principles

Atomic Design breaks UI into five levels of increasing complexity:

```
Atoms → Molecules → Organisms → Templates → Pages
```

Each level is allowed to import from the same level or any level below it. Going upward is forbidden.

| Level | Imports allowed from |
|-------|---------------------|
| Atoms | shadcn/ui, Tailwind utilities |
| Molecules | Atoms, shadcn/ui |
| Organisms | Molecules, Atoms, hooks, providers |
| Templates | Organisms, Molecules, Atoms |
| Pages (app/) | Templates, Organisms, Molecules, Atoms |

---

## Import rules

```
GOOD  Organism  → imports Molecule
GOOD  Molecule  → imports Atom
BAD   Atom      → imports Organism   ← creates a circular dep
BAD   Molecule  → imports Organism   ← breaks isolation
BAD   Organism  → imports Page       ← pages are not components
```

A component that needs data **must** be at the organism level or above. Atoms and molecules receive data only through props.

---

## Atoms

**Directory:** `web/src/components/atoms/`

Atoms are the smallest reusable building blocks. They are **stateless** (or carry only trivial display state like hover), accept only typed props, and have no side effects.

**Rules for atoms:**
- No `useQuery`, `useMutation`, `useAuth`, or context consumption.
- No direct `fetch` calls.
- Must be usable anywhere without configuration.

---

### `StatusBadge`

**File:** `atoms/status-badge.tsx`

Displays a color-coded pill for a post's lifecycle status.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `status` | `PostStatus` | Yes | `EMPTY \| DRAFT \| PUBLISHED \| ARCHIVED` |
| `className` | `string` | No | Additional Tailwind classes |

**Usage:**

```tsx
import { StatusBadge } from '@/components/atoms/status-badge'

<StatusBadge status="PUBLISHED" />
<StatusBadge status="DRAFT" className="ml-2" />
```

**Color map:**

| Status | Style |
|--------|-------|
| `EMPTY` | Gray |
| `DRAFT` | Amber |
| `PUBLISHED` | Emerald |
| `ARCHIVED` | Red |

---

### `UserAvatar`

**File:** `atoms/user-avatar.tsx`

Circular avatar image with a fallback to the user's initials when no image is available.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `user` | `{ name: string; avatarPath?: string \| null }` | Yes | User data |
| `size` | `number` | No | Pixel size (default `32`) |
| `className` | `string` | No | Additional classes |

**Usage:**

```tsx
import { UserAvatar } from '@/components/atoms/user-avatar'

<UserAvatar user={{ name: 'Alice Dupont', avatarPath: 'https://...' }} size={40} />
```

---

### `EmptyState`

**File:** `atoms/empty-state.tsx`

Centered empty-state placeholder shown when a list has no items.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `icon` | `LucideIcon` | Yes | Icon to display above the title |
| `title` | `string` | Yes | Primary message |
| `description` | `string` | No | Secondary explanatory text |
| `className` | `string` | No | Additional classes |

**Usage:**

```tsx
import { EmptyState } from '@/components/atoms/empty-state'
import { MessageSquare } from 'lucide-react'

<EmptyState
  icon={MessageSquare}
  title="No comments yet"
  description="Be the first to leave a comment."
/>
```

---

### `LoadingSpinner`

**File:** `atoms/loading-spinner.tsx`

Animated spinner for loading states. Used inside organisms while queries are pending.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `size` | `"sm" \| "md" \| "lg"` | No | Size variant (default `"md"`) |
| `className` | `string` | No | Additional classes |

**Usage:**

```tsx
import { LoadingSpinner } from '@/components/atoms/loading-spinner'

if (isLoading) return <LoadingSpinner />
```

---

## Molecules

**Directory:** `web/src/components/molecules/`

Molecules combine multiple atoms to represent a meaningful UI unit. They may have **local UI state** (e.g., form field values, open/close toggles) but must not fetch or mutate remote data.

**Rules for molecules:**
- Accept all required data via props.
- May use `useState` and `useReducer`.
- No `useQuery`, `useMutation`, `useAuth`, or async operations.
- Emit events upward via callback props.

---

### `PostCard`

**File:** `molecules/post-card.tsx`

A card showing a post's cover image, title, status badge, reading time, tags, and author avatar. Used in lists and grids.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `post` | `Post` | Yes | Post data object |
| `className` | `string` | No | Additional classes |

**Usage:**

```tsx
import { PostCard } from '@/components/molecules/post-card'

<PostCard post={post} />
```

---

### `ContributorItem`

**File:** `molecules/contributor-item.tsx`

A single row representing a collaborator on a post. Displays their avatar, name, role label, and an owner crown badge when applicable.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `contributor` | `Contributor` | Yes | Contributor data including nested `user` |
| `onRemove` | `() => void` | No | Callback when the remove button is clicked |
| `canRemove` | `boolean` | No | Whether to show the remove button |

**Usage:**

```tsx
import { ContributorItem } from '@/components/molecules/contributor-item'

<ContributorItem
  contributor={contributor}
  canRemove={isOwner}
  onRemove={() => handleRemove(contributor.id)}
/>
```

---

### `InvitationForm`

**File:** `molecules/invitation-form.tsx`

An email input with a send button for inviting collaborators. Handles its own input state and validation; calls the `onSubmit` callback with the email.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onSubmit` | `(email: string) => Promise<void>` | Yes | Called when the user submits a valid email |
| `isPending` | `boolean` | No | Disables the submit button during the mutation |

**Usage:**

```tsx
import { InvitationForm } from '@/components/molecules/invitation-form'

<InvitationForm
  onSubmit={handleInvite}
  isPending={isSendingInvitation}
/>
```

---

### `CommentItem`

**File:** `molecules/comment-item.tsx`

Renders a single comment with the author's avatar, name, timestamp, comment text, and edit/delete actions for the author.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `comment` | `Comment` | Yes | Comment data including nested `user` |
| `postId` | `string` | Yes | Parent post ID (needed for delete mutation key) |
| `currentUser` | `User \| null` | Yes | Used to conditionally show edit/delete buttons |

**Usage:**

```tsx
import { CommentItem } from '@/components/molecules/comment-item'

<CommentItem comment={comment} postId={post.id} currentUser={user} />
```

---

## Organisms

**Directory:** `web/src/components/organisms/`

Organisms are **self-contained, stateful sections** of the UI. They own their data fetching (via TanStack Query hooks) and represent complete functional areas of the application.

**Rules for organisms:**
- May use `useQuery`, `useMutation`, and `useAuth`.
- Compose multiple molecules and atoms.
- Are placed directly in templates or pages.
- Should not receive raw data arrays as props — they fetch their own data.

---

### `SiteHeader`

**File:** `organisms/site-header.tsx`

The global top navigation bar. Reads auth state from `useAuth()` and displays the user's avatar and logout button when authenticated, or a sign-in link otherwise.

**Props:** none

**Usage:**

```tsx
import { SiteHeader } from '@/components/organisms/site-header'

<SiteHeader />
```

**Internal composition:** `UserAvatar`, shadcn `NavigationMenu`, auth state from `useAuth()`

---

### `PostEditor`

**File:** `organisms/post-editor.tsx`

The full post editing surface. Combines the TipTap `BlogEditor`, title input, cover image upload, status controls, and the `CollaboratorsPanel`. Uses `useUpdatePost` and `usePublishPost` mutations.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `post` | `Post` | Yes | The post being edited (initial data) |
| `isOwner` | `boolean` | Yes | Controls visibility of publish/archive/delete buttons |

**Usage:**

```tsx
import { PostEditor } from '@/components/organisms/post-editor'

<PostEditor post={post} isOwner={currentUser.id === post.ownerId} />
```

**Internal composition:** `BlogEditor`, `CollaboratorsPanel`, `StatusBadge`, `useUpdatePost`, `usePublishPost`

---

### `CollaboratorsPanel`

**File:** `organisms/collaborators-panel.tsx`

A slide-over or inline panel showing all contributors on a post and pending invitations. Allows the owner to invite new collaborators and remove existing ones.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `postId` | `string` | Yes | Post ID to load contributors and invitations for |

**Usage:**

```tsx
import { CollaboratorsPanel } from '@/components/organisms/collaborators-panel'

<CollaboratorsPanel postId={post.id} />
```

**Internal composition:** `ContributorItem`, `InvitationForm`, `UserAvatar`, `LoadingSpinner`, `EmptyState`

---

### `CommentsSection`

**File:** `organisms/comments-section.tsx`

The full comment thread for a post. Fetches comments with `useComments`, renders each with `CommentItem`, and shows a compose form for authenticated users.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `postId` | `string` | Yes | Post ID |

**Usage:**

```tsx
import { CommentsSection } from '@/components/organisms/comments-section'

<CommentsSection postId={post.id} />
```

**Internal composition:** `CommentItem`, `LoadingSpinner`, `EmptyState`, `useComments`, `useCreateComment`, `useAuth`

---

### `PostsGrid`

**File:** `organisms/posts-grid.tsx`

A paginated grid of `PostCard` components. Fetches posts with `usePosts` and handles loading, empty, and error states.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `filters` | `PostFilters` | No | Tag, status, sort, and `me` filters |

**Usage:**

```tsx
import { PostsGrid } from '@/components/organisms/posts-grid'

<PostsGrid filters={{ sort: 'recent' }} />
```

**Internal composition:** `PostCard`, `LoadingSpinner`, `EmptyState`, `usePosts`

---

## Templates

**Directory:** `web/src/components/templates/`

Templates define the **structural skeleton** of a page. They wire the chrome (header, footer, sidebar) around a `{children}` slot. They never fetch data.

**Rules for templates:**
- `children` prop only — no data props.
- Place `SiteHeader`, footer, and layout containers here.
- Do not call any hooks or context consumers directly.

---

### `MainLayout`

**File:** `templates/main-layout.tsx`

Standard application layout: `SiteHeader` at the top, a centered `<main>` container, and a minimal footer.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | Yes | Page content |
| `className` | `string` | No | Additional classes for `<main>` |

**Usage:**

```tsx
import { MainLayout } from '@/components/templates/main-layout'

export default function HomePage() {
  return (
    <MainLayout>
      <PostsGrid />
    </MainLayout>
  )
}
```

**Internal composition:** `SiteHeader`, `<main>`, `<footer>`

---

### `EditorLayout`

**File:** `templates/editor-layout.tsx`

Full-screen layout for the post editor. No header or footer — the editor occupies the entire viewport height.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | Yes | Editor content (`PostEditor`) |
| `className` | `string` | No | Additional classes |

**Usage:**

```tsx
import { EditorLayout } from '@/components/templates/editor-layout'
import { PostEditor } from '@/components/organisms/post-editor'

export default function EditPage() {
  return (
    <EditorLayout>
      <PostEditor post={post} isOwner={true} />
    </EditorLayout>
  )
}
```

---

## Editor components

**Directory:** `web/src/components/editor/`

TipTap editor components are grouped separately from the Atomic Design hierarchy because they depend on TipTap internals and have unique lifecycle requirements.

| Component | Type | Description |
|-----------|------|-------------|
| `BlogEditor` | Client Component | Rich text editor (TipTap) with toolbar and image upload support |
| `BlogViewer` | Server Component | Converts TipTap JSON to HTML server-side using `generateHTML()` for SEO |
| `EditorToolbar` | Client Component | Formatting toolbar for `BlogEditor` |
| `editorExtensions` | Config | Shared TipTap extension array used by both editor and viewer |

`BlogViewer` is a **React Server Component** and must never be imported inside a `'use client'` component. It accepts `content` as a TipTap JSON object or string.

```tsx
// Server Component usage (no 'use client')
import { BlogViewer } from '@/components/editor/blog-viewer'

<BlogViewer content={post.content} className="my-8" />
```

---

## Data-fetching hooks

Hooks live in `web/src/hooks/` and follow a consistent naming pattern.

```
hooks/
├── queries/
│   ├── use-posts.ts           useQuery(['posts', filters])
│   ├── use-post.ts            useQuery(['post', id])
│   └── use-comments.ts        useQuery(['comments', postId])
└── mutations/
    ├── use-update-post.ts     useMutation — PATCH /posts/:id
    ├── use-publish-post.ts    useMutation — PATCH /posts/:id (status)
    ├── use-create-post.ts     useMutation — POST /posts
    ├── use-delete-post.ts     useMutation — DELETE /posts/:id
    └── use-comment.ts         useMutation — POST/PATCH/DELETE /posts/:id/comments
```

Each hook wraps a typed function from `web/src/lib/api/`. This separation ensures:
- Hooks are testable without a real API.
- Cache invalidation is co-located with the mutation.
- Components never contain raw `fetch` calls.

---

## Adding a new component

1. **Determine the level.** Does it fetch data? → Organism. Does it combine atoms? → Molecule. Is it a single UI element? → Atom.

2. **Create the file** in the correct directory with a kebab-case name.

3. **Export as a named export** — no default exports.

4. **Add props types inline** using a `interface ComponentNameProps {}` declaration directly above the component.

5. **Import only from the same level or below.**

6. **Document it here** in the relevant section.

```tsx
// components/atoms/reading-time.tsx
interface ReadingTimeProps {
  minutes: number
  className?: string
}

export function ReadingTime({ minutes, className }: ReadingTimeProps) {
  return (
    <span className={cn('text-sm text-muted-foreground', className)}>
      {minutes} min read
    </span>
  )
}
```
