# Styles Directory

This directory contains all CSS styles organized by component and page.

## Structure

```
styles/
├── components/       # Component-specific styles
│   ├── Button.css
│   ├── Card.css
│   └── Input.css
├── pages/           # Page-specific styles
│   ├── Auth.css
│   ├── Dashboard.css
│   └── Kanban.css
├── styles.css       # Main styles file that imports all styles
└── README.md        # This file
```

## Usage

The main `styles.css` file imports all component and page styles:

```css
@import "./components/Button.css";
@import "./components/Card.css";
@import "./components/Input.css";
@import "./pages/Dashboard.css";
@import "./pages/Kanban.css";
@import "./pages/Auth.css";
```

This file is imported in `app/layout.tsx` to apply all styles globally.

## Component Styles

### Button.css

- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.btn-danger` - Danger button style
- `.btn-ghost` - Ghost button style
- `.btn-sm`, `.btn-md`, `.btn-lg` - Button size variants

### Card.css

- `.card` - Base card style
- `.card-hover` - Hover effect for cards

### Input.css

- `.input` - Base input style
- `.input-error` - Error state for inputs
- `.input-label` - Label style for inputs

## Page Styles

### Auth.css

- `.auth-container` - Authentication page container
- `.auth-form` - Form container
- `.auth-title` - Page title
- `.auth-subtitle` - Page subtitle
- `.auth-link` - Link style
- `.auth-error` - Error message style

### Dashboard.css

- `.dashboard-nav` - Navigation bar
- `.dashboard-main` - Main content area
- `.project-grid` - Projects grid layout
- `.project-card` - Project card style

### Kanban.css

- `.kanban-column` - Base column style
- `.kanban-column-todo` - Todo column color
- `.kanban-column-in-progress` - In Progress column color
- `.kanban-column-done` - Done column color
- `.kanban-grid` - Kanban board grid
- `.issue-card` - Issue card style
- `.priority-low`, `.priority-medium`, `.priority-high` - Priority badge styles

## Common Styles

- `.container` - Max-width container
- `.nav` - Navigation bar
- `.main` - Main content area
