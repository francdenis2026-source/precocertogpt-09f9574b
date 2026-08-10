import "./performance/disableClientImageProcessing";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PrecoCertoApp from "./PrecoCertoApp";
import { MaxPriceStoreLabels } from "./components/MaxPriceStoreLabels";
import { SearchUxClarity } from "./components/SearchUxClarity";
import { ProductInteractionUx } from "./components/ProductInteractionUx";
import { PublicCatalogUxFixes } from "./components/PublicCatalogUxFixes";
import { HeaderStickyUx } from "./components/HeaderStickyUx";
import { HomeExperienceRefactor } from "./components/HomeExperienceRefactor";
import { HomeMobilePolish } from "./components/HomeMobilePolish";
import { HomeSearchPortalPolish } from "./components/HomeSearchPortalPolish";
import { HomeSearchKeyboardUx } from "./components/HomeSearchKeyboardUx";
import { FooterCompactUx } from "./components/FooterCompactUx";

export default function App() {
  return (
    <BrowserRouter>
      <MaxPriceStoreLabels />
      <SearchUxClarity />
      <ProductInteractionUx />
      <PublicCatalogUxFixes />
      <HeaderStickyUx />
      <HomeExperienceRefactor />
      <HomeMobilePolish />
      <HomeSearchPortalPolish />
      <HomeSearchKeyboardUx />
      <FooterCompactUx />
      <Routes>
        <Route path="*" element={<PrecoCertoApp />} />
      </Routes>
    </BrowserRouter>
  );
}
