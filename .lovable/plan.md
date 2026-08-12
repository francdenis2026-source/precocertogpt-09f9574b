# Plan: SEO, Breadcrumbs, and Navigation Refinement

Enhance the writer's store pages with better SEO, navigation aids, and user experience improvements, including favorites management.

## User Review Required

> [!IMPORTANT]
> The "Favorites Dropdown" will be a new UI element in the header. Do you have a preference for how it should look (e.g., a simple list vs. cards)?

- **SEO Tags**: Are there specific keywords or descriptions you'd like for /dorinha besides the defaults I'll set?
- **Redirection**: Should the post-checkout redirection be automatic or ask the user if they want to return?

## Proposed Changes

### SEO and Metadata
- Configure specific `<title>` and `<meta>` tags (Open Graph/Twitter) for `/dorinha` and `/escritora` routes.
- Ensure proper canonical URLs for these routes.

### Navigation and UI
- **Active State**: Highlight "Dorinha Barroso" in the header and mobile menu when on her routes.
- **Breadcrumbs**: Add a navigation path (e.g., "Início > Dorinha Barroso > [Livro]") on the writer's store page.
- **Return Buttons**: Add "Voltar para Loja da Dorinha" buttons in the checkout and profile pages if the user originated from her store.
- **Post-Checkout**: Store the originating store slug in `sessionStorage` to redirect the user back after a successful purchase.

### Favorites Dropdown
- Implement a dropdown menu for the Heart icon in the desktop header.
- Display a quick list of favorited products with images, prices, and a link to view all.

## Technical Details

### SEO Implementation
- Use a dedicated `SEO` component or `useEffect` to manage `document.title` and meta tags dynamically based on the current path.

### Breadcrumbs Logic
- Implement a `Breadcrumbs` component that parses the current path and generates links.

### Redirection Logic
- Update `handleCheckout` and payment success handlers to check for a `return_to` parameter or session variable.

### Favorites Dropdown
- Create a `FavoritesDropdown` component using `Radix UI` or a custom absolute-positioned div.
- Sync with the existing `favorites` state in `PrecoCertoApp`.
