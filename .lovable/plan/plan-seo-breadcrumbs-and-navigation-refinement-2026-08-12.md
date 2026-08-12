# Plan: SEO, Breadcrumbs, and Navigation Refinement

Enhance the writer's store pages with better SEO, navigation aids, and user experience improvements, including favorites management.

## User Review Required

> [!IMPORTANT]
> The "Favorites Dropdown" will be a new UI element in the header. I will implement it as a clean, professional list with small product thumbnails and prices.

## Proposed Changes

### SEO and Metadata
- Configure specific `<title>` and `<meta>` tags (Open Graph/Twitter) for `/dorinha` and `/escritora` routes.
- Set descriptive tags: "Dorinha Barroso · Livros Acreanos" with her bio and professional cover images.

### Navigation and UI
- **Active State**: Highlight "Dorinha Barroso" in the header and mobile menu when on her routes.
- **Breadcrumbs**: Add a navigation path (e.g., "Início > Dorinha Barroso") on the writer's store page.
- **Return Buttons**: Add a "Voltar" button in the checkout and other internal pages if the user originated from the writer's store.
- **Post-Checkout**: Redirect the user back to `/dorinha` after a successful purchase if they started there.

### Favorites Dropdown
- Implement a professional dropdown menu for the Heart icon in the desktop header.
- Display favorited products with quick links and the ability to add to the basket directly.

## Technical Details

- **SEO**: Update `src/components/DorinhaAuthorStore.tsx` to include dynamic meta tag injection using `document.querySelector('meta[property="og:title"]')` etc.
- **State Management**: Use `localStorage` to track the "Originating Store" to ensure the "Voltar" button persists even after refresh.
- **UI Components**: 
  - Add a `Breadcrumbs` component to `DorinhaAuthorStore`.
  - Add a `FavoritesMenu` component to `src/PrecoCertoApp.tsx`'s Header.
- **Checkout**: Update `handleCheckout` and success callbacks to check for the stored origin.
