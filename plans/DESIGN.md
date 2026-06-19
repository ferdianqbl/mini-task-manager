# UI/UX Design System Specification - Mini Task Manager

This document defines the visual theme, typography, layout structures, components, and animations for the **Mini Task Manager** frontend interface.

---

## 1. Design Philosophy: Functional, Clear & Audit-Ready

To provide a premium internal dashboard that minimizes operational mistakes and highlights task history, we focus on:
1.  **Secure & Seamless Access**: Clean, centered login/registration layouts with glassmorphic cards to make onboarding feel premium.
2.  **Status Visual Clarity**: Clear color distinctions for each task state so columns or statuses are readable at a distance.
3.  **Contextual Actions**: Disable or hide buttons that would result in invalid state transitions, guiding users along the sequential path.
4.  **Visible Audit History**: Enable quick access to chronological logs (per task) via clean modal windows with glassmorphic overlays.
5.  **Role-Based Data Separation**:
    *   `USER` accounts see and audit only **their own** tasks and actions.
    *   `ADMIN` accounts see all tasks from all users (with user attribution badges) and all log details globally.

---

## 2. Color Palette & Theme (Tailwind CSS v4)

We define a custom theme in `src/app/globals.css` using Tailwind v4's CSS-first directives:

```css
@import "tailwindcss";

@theme {
  --color-background: #0B0F19;          /* Deep dark slate obsidian */
  --color-card-surface: rgba(17, 24, 39, 0.7); /* Translucent obsidian card glass */
  --color-card-border: rgba(255, 255, 255, 0.06); /* Thin subtle border */
  
  /* Status Colors */
  --color-status-todo: #64748B;          /* Slate Gray */
  --color-status-pending: #D97706;       /* Amber Yellow */
  --color-status-inprogress: #0284C7;    /* Sky Blue */
  --color-status-done: #059669;          /* Emerald Green */
  
  --color-text-primary: #F9FAFB;        /* Crisp Slate White */
  --color-text-secondary: #9CA3AF;      /* Muted Cool Gray */
  
  --radius-card: 12px;                  /* Rounded modern corners */
}
```

---

## 3. Typography & Spacing

*   **Font Choice**: Google Fonts `Inter` or `Geist` (clean, geometric sans-serif optimized for data-dense dashboards).
*   **Scale**:
    *   App Header: `font-bold tracking-tight text-2xl text-text-primary`
    *   Columns/Headers: `font-semibold text-sm uppercase tracking-wider text-text-secondary`
    *   Task Card Titles: `font-medium text-base text-text-primary`
*   **Spacing**: Generous gaps (`gap-6` or `1.5rem`) between lists and cards to keep the layout organized and structured.

---

## 4. Layout Specifications

### A. Auth Layout (Login / Register)
*   A centered card layout with a dark glass backdrop blur (`backdrop-blur-md bg-card-surface border border-card-border`).
*   Form inputs for Username and Password with clean focus outlines.

### B. Dashboard Layout
*   **Header**:
    *   Left side: App logo + Title.
    *   Right side: Pre-labeled badge displaying role (`USER` or `ADMIN`), user's username, and a "Logout" button.
    *   **Admin Toolbar**: If authenticated as `ADMIN`, display a toolbar below the header allowing the user to toggle between the "Task Boards" view and the "System Audit Stream" view.
*   **Grid (Screens >= 1024px)**:
    *   A 4-column Kanban board layout:
        $$\text{To Do} \rightarrow \text{Pending} \rightarrow \text{In Progress} \rightarrow \text{Done}$$
    *   *User view:* Displays only cards owned by the logged-in user.
    *   *Admin view:* Displays all tasks from all users (each card features a small, subtle badge: `Owner: [username]`).

---

## 5. UI Component Specifications

We use lightweight custom components built on Radix UI primitives:
*   **Task Card**: Displays title, description, status badge, sequential action buttons, delete triggers, and a "View Task logs" icon.
*   **Audit Log Modal**: Centered popover dialog using `@radix-ui/react-dialog` displaying:
    *   A header indicating: "Audit Logs for: [Task Title]"
    *   A vertical timeline list of logs, sorted chronologically.
    *   *User view:* displays only logs created by themselves.
    *   *Admin view:* displays logs created by any user (each log specifies the actor's username).
*   **Admin Global Logs Stream**: A dedicated list view containing a filterable table of all audit logs across all users, swapped in place of the Kanban board when the Admin selects the System Audit Stream view.

---

## 6. Micro-Animations & States

*   **State Transition Pulse**: Successfully clicking a transition button triggers a brief color pulse before updating the card columns.
*   **Card Hover Expansion**: Task cards hover-elevate by `scale-[1.015]` and borders brighten slightly (`hover:border-white/10`) to indicate interactivity.
