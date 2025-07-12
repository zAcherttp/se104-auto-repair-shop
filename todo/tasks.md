# Pending Tasks

## Todo template

- [ ] Task
  - [ ] Sub-task

## Planned

- [ ] **Edit cell causing waterfall rerendering in Adding repair line item**

### Table Optimization Implementation Steps

1. **Investigation Focus**: The issue is in TanStack Table inline editing with waterfall re-renders

   - **Key Files**: `components/dialogs/update-repair-order/update-repair-line-items-table.tsx`
   - **Problem Pattern**: EditCell components triggering cascading re-renders across table cells
   - **Current Mitigations**: Extensive use of React.memo and useMemo throughout table components

2. **Optimization Strategy**:

   - **Check Cell Rendering Logic**: Focus on `EditCell` and `TableCell` components
   - **Validate Memoization**: Ensure proper dependency arrays in useMemo/useCallback
   - **State Isolation**: Consider moving edit state to individual cell level vs table level
   - **Performance Profiling**: Use React DevTools Profiler to identify render cascades

3. **Files to Examine**:
   - Search patterns: `semantic_search("EditCell TableCell memoization react.memo")`
   - Look for: Unnecessary dependency changes, state lifting issues, prop drilling
   - Test: Cell edit interactions with console.log on renders

---

- [ ] **AppSidebar Dynamic Content Integration**

### Sidebar Integration Implementation Steps

1. **Current State Analysis**:

   - **File**: `components/app-sidebar.tsx` (line 60)
   - **Issue**: Uses static `GARAGE_INFO` constant with hardcoded "My Garage" name
   - **Target**: Dynamic garage info from settings with optional logo upload

2. **Integration Tasks**:

   ```tsx
   // Replace static GARAGE_INFO in app-sidebar.tsx
   import { useGarageInfo } from "@/hooks/use-garage-info";

   // Inside AppSidebar component:
   const { data: garageInfo, isLoading } = useGarageInfo();

   // Replace current AppBanner usage with:
   <AppBanner
     garage={{
       name: garageInfo?.garageName || "My Garage",
       logo: Package2, // Keep default until banner image implemented
     }}
   />;
   ```

3. **Files to Modify**:

   - `components/app-sidebar.tsx`: Import useGarageInfo, replace static data
   - `components/sidebar-banner.tsx`: Already supports dynamic props
   - `hooks/use-garage-info.ts`: Already exists and functional

4. **Testing**: Verify sidebar updates when garage name changes in settings

---

- [ ] **Vietnamese Currency and Date Localization**

### Localization Implementation Steps

1. **Current State**: Comprehensive i18n infrastructure exists, missing currency/date formatting

2. **Currency Formatting Enhancement**:

   ```typescript
   // Create new utility: lib/currency-utils.ts
   export function formatCurrency(
     amount: number,
     locale: string = "en-US"
   ): string {
     const currency = locale === "vi" ? "VND" : "USD";
     return new Intl.NumberFormat(locale, {
       style: "currency",
       currency: currency,
     }).format(amount);
   }
   ```

3. **Files Using Currency Formatting** (Replace hardcoded USD):

   - `components/dialogs/payment-dialog.tsx` (line 141)
   - `app/(protected)/payments/invoice-dialog.tsx` (line 20)
   - `components/order-data-detail.tsx` (line 36)
   - Multiple test files (update test expectations)

4. **Date Formatting Enhancement**:

   ```typescript
   // Update existing date formatting functions
   // In components/date-range-picker.tsx (line 42)
   const formatDate = (date: Date, locale: string = "en-US"): string => {
     return date.toLocaleDateString(locale, {
       month: "short",
       day: "numeric",
       year: "numeric",
     });
   };
   ```

5. **Translation Updates**:

   - **Currency**: Add `messages/vi.json` entries for currency symbols
   - **Date Formats**: Add date format preferences to translation files
   - **Number Separators**: Configure Vietnamese number formatting

6. **Integration Points**:
   - Use `useLocale()` from next-intl to get current locale
   - Pass locale to all currency/date formatting functions
   - Update all hardcoded `"en-US"` references

---

- [ ] **[TASK00619] Garage Banner Image Implementation**

### Banner Image Implementation Steps

1. **Backend Infrastructure** (Already Exists):

   - `app/actions/settings.ts`: `getGarageInfo()` function ready for extension
   - `components/settings/garage-settings-tab.tsx`: Settings form infrastructure
   - Database: `system_settings` table supports additional keys

2. **Database Schema Extension**:

   ```sql
   -- Add banner_image_url to system_settings
   INSERT INTO system_settings (setting_key, setting_value)
   VALUES ('banner_image_url', '');
   ```

3. **Settings Form Enhancement**:

   ```tsx
   // In garage-settings-tab.tsx, add:
   const [bannerImage, setBannerImage] = useState<File | null>(null);
   const [bannerImageUrl, setBannerImageUrl] = useState("");

   // Add file input component
   <div className="space-y-2">
     <Label htmlFor="bannerImage">Banner Image</Label>
     <Input
       id="bannerImage"
       type="file"
       accept="image/*"
       onChange={handleBannerImageChange}
     />
     {bannerImageUrl && (
       <img src={bannerImageUrl} alt="Banner preview" className="max-h-32" />
     )}
   </div>;
   ```

4. **File Upload Integration**:

   - **Storage**: Use Supabase Storage bucket for images
   - **Upload Function**: Create `uploadBannerImage()` server action
   - **Update Settings**: Extend `updateSystemSetting()` for `banner_image_url`

5. **Landing Page Integration**:

   ```tsx
   // In app/page.tsx, extend useGarageInfo response:
   const { data: garageInfo } = useGarageInfo(); // Add bannerImageUrl to response

   // Add banner display logic:
   {
     garageInfo?.bannerImageUrl && (
       <div className="banner-container">
         <img src={garageInfo.bannerImageUrl} alt="Garage Banner" />
       </div>
     );
   }
   ```

6. **Files to Modify**:

   - `app/actions/settings.ts`: Add banner image upload/retrieval
   - `components/settings/garage-settings-tab.tsx`: Add file upload UI
   - `app/page.tsx`: Display banner image
   - `hooks/use-garage-info.ts`: Include banner URL in response type
   - `types/settings.ts`: Add banner image types

7. **AppSidebar Logo Integration** (Future):
   - Extend sidebar to support uploaded logo images
   - Create image processing for sidebar-appropriate sizes
   - Fallback to default Package2 icon when no image uploaded

### Notes:

- **Image Processing**: Consider image optimization/resizing
- **Validation**: File type, size limits
- **Caching**: Update TanStack Query cache on image upload
- **Error Handling**: Graceful fallbacks for missing/broken images
