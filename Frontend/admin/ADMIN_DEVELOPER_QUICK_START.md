# Admin Frontend - Developer Quick Start Guide

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm 9+

### Quick Start

```bash
# Navigate to admin directory
cd d:\Frontend\admin

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Architecture Overview

### Tech Stack
- **React 19.2.5** - UI framework
- **Vite 8.0.10** - Build tool
- **React Router DOM 7.15.0** - Routing
- **Framer Motion** - Animations
- **Tailwind CSS 3.4** - Styling
- **React Icons** - Icon library

### Core Concepts

#### 1. Protected Routes
All admin routes require authentication:
```javascript
<ProtectedAdminRoute>
  <AdminLayout />
</ProtectedAdminRoute>
```

#### 2. Admin Context
Access authenticated admin session:
```javascript
const { isAuthenticated, admin, loading, loginAdmin, logoutAdmin } = useAdmin();
```

#### 3. Responsive Layout
- AdminLayout provides sidebar + header
- Nested routes render in Outlet
- Mobile-responsive design

---

## Folder Structure

```
admin/src/
├── components/admin/
│   ├── layout/
│   │   └── AdminLayout.jsx (main shell)
│   ├── shared/
│   │   └── AdminComponents.jsx (12+ reusable components)
│   └── [feature folders]/ (review, payment, batch, etc.)
├── contexts/
│   └── AdminContext.jsx (admin auth)
├── routes/
│   └── adminRoutes.jsx (protected routing)
├── pages/admin/
│   ├── AdminLoginScreen.jsx
│   ├── AdminDashboard.jsx
│   ├── PendingReviewList.jsx
│   ├── ReviewDetailScreen.jsx
│   ├── PaymentQueueScreen.jsx
│   ├── Form2ReviewList.jsx
│   ├── Form2DetailReview.jsx
│   ├── SearchProfilesScreen.jsx
│   ├── BatchCreationScreen.jsx
│   ├── BatchManagementScreen.jsx
│   ├── InterestTrackingScreen.jsx
│   ├── InterestDetailScreen.jsx
│   ├── MonitoringDashboard.jsx
│   └── AdminSettingsScreen.jsx
├── App.jsx (main router)
└── main.jsx (entry point)
```

---

## Key Components

### AdminCard
Luxury container component:
```jsx
<AdminCard>
  <h2 className="text-xl font-semibold text-luxe-gray">Title</h2>
  {/* Content */}
</AdminCard>
```

### MetricCard
Display operational metrics:
```jsx
<MetricCard
  label="Total Profiles"
  value="248"
  icon={Users}
  tone="default" // "default", "warning", "positive"
  change={12}
/>
```

### AdminTable
Render data tables:
```jsx
<AdminTable
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' }
  ]}
  rows={[
    { id: 1, name: 'Priya', status: () => <Badge /> }
  ]}
/>
```

### StatusBadge
Status indicators:
```jsx
<StatusBadge
  status="pending" // "pending", "approved", "active", "expiring"
  size="sm" // "sm", "md", "lg"
/>
```

### FilterPanel
Sidebar filters:
```jsx
<FilterPanel
  filters={{ name: '', city: '' }}
  onFilterChange={(key, value) => handleChange(key, value)}
/>
```

### ConfirmationModal
Action confirmations:
```jsx
<ConfirmationModal
  isOpen={showConfirmation}
  title="Confirm Action?"
  message="Action details"
  isDangerous={false}
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
```

---

## Common Patterns

### Protected Page Template

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AdminCard } from '../../components/admin/shared/AdminComponents';

export const NewPage = () => {
  const navigate = useNavigate();
  const [state, setState] = useState({});

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-playfair text-luxe-gray mb-2">Page Title</h1>
        <p className="text-luxe-gray-400">Subtitle</p>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <AdminCard>
          {/* Page content */}
        </AdminCard>
      </motion.div>
    </div>
  );
};

export default NewPage;
```

### Adding New Routes

1. Create page component in `src/pages/admin/`
2. Add import in `src/routes/adminRoutes.jsx`
3. Add route to the Routes component
4. Update AdminLayout navigation (if needed)

### Creating Reusable Components

1. Add to `AdminComponents.jsx` in shared folder
2. Export as named export
3. Import in pages as needed
4. Keep consistent with luxury design system

---

## Design System

### Colors
```javascript
// Primary colors
navy-950: #020817
navy-900: #072047
navy-800: #0B1F3B
gold-500: #C6A64A

// Text
luxe-gray: #e8e8e8
luxe-gray-400: #a0a0a0
```

### Typography
- **Headings:** Playfair Display
- **Body:** Poppins

### Layout
- **Container:** `p-6 md:p-8` (padding)
- **Spacing:** `space-y-6`, `gap-4` (between elements)
- **Grid:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### Animations
- **Entry:** `initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}`
- **Stagger:** `transition={{ staggerChildren: 0.05 }}`
- **Hover:** `whileHover={{ scale: 1.02 }}`

---

## Authentication Flow

### Login
```javascript
const { loginAdmin } = useAdmin();

// Mock login
loginAdmin(email, password);
// Sets: isAuthenticated = true, admin = { id, name, email }
```

### Logout
```javascript
const { logoutAdmin } = useAdmin();

// Logout
logoutAdmin();
// Sets: isAuthenticated = false, clears localStorage
```

### Session Persistence
- Session stored in localStorage as `admin_session`
- Hydrated on app load
- Cleared on logout

---

## Common Tasks

### Add a New Metric Card
```jsx
// In AdminDashboard.jsx
const metrics = [
  {
    label: 'New Metric',
    value: '100',
    icon: NewIcon,
    tone: 'positive',
    change: 5
  }
];
```

### Add a Filter Option
```jsx
// In AdminComponents.jsx FilterPanel
const filterOptions = {
  name: '',
  city: '',
  newFilter: '' // Add new filter
};
```

### Add a Table Column
```jsx
const columns = [
  { key: 'name', label: 'Name' },
  { key: 'newField', label: 'New Field' } // Add column
];
```

### Create a Modal Action
```jsx
const [showModal, setShowModal] = useState(false);

<ConfirmationModal
  isOpen={showModal}
  title="Confirm?"
  message="Action details"
  onConfirm={handleConfirm}
  onCancel={() => setShowModal(false)}
/>
```

---

## Performance Tips

1. **Use React.memo** for frequently rendered components
2. **Lazy load heavy modules** with React.lazy()
3. **Debounce filter changes** (use debounce utility)
4. **Memoize callbacks** with useCallback()
5. **Avoid unnecessary re-renders** with proper dependency arrays

---

## Debugging

### Enable Debug Mode
Add to AdminContext.jsx:
```javascript
if (process.env.NODE_ENV === 'development') {
  console.log('Admin state:', adminState);
}
```

### Check Route Registration
- Verify route in `adminRoutes.jsx`
- Check component export in page file
- Verify navigation link in AdminLayout

### Style Issues
- Check Tailwind config
- Verify class names (no typos)
- Use browser DevTools to inspect
- Check CSS priority

---

## Testing Pages

### Local Development
```bash
npm run dev
# Visit http://localhost:5173/admin/login
# Login with demo credentials
# Navigate through pages
```

### Production Build
```bash
npm run build
npm run preview
# Test at http://localhost:4173/admin/login
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Page not rendering | Check route in adminRoutes.jsx and component import |
| Styling not applied | Verify Tailwind classes, check tailwind.config.js |
| Navigation not working | Ensure useNavigate() hook used, verify route path |
| Auth redirect loop | Check ProtectedAdminRoute wrapper, verify isAuthenticated |
| Components not showing | Verify export statement, check import path |

---

## Resources

- [React Documentation](https://react.dev)
- [React Router Docs](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Vite Guide](https://vitejs.dev)

---

## Next Steps for Backend Integration

1. Replace mock data with API calls
2. Implement payment verification API
3. Add profile approval workflow API
4. Create batch sharing API
5. Implement interest tracking API
6. Add admin audit logging

---

**Last Updated:** [Current Date]  
**Maintained By:** Development Team  
**Status:** Production Ready
