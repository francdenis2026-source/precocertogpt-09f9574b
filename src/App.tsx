import "./performance/disableClientImageProcessing";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PrecoCertoApp from "./PrecoCertoApp";
import { MaxPriceStoreLabels } from "./components/MaxPriceStoreLabels";
import { SearchUxClarity } from "./components/SearchUxClarity";
import { ProductInteractionUx } from "./components/ProductInteractionUx";
import { PublicCatalogUxFixes } from "./components/PublicCatalogUxFixes";
import { HeaderStickyUx } from "./components/HeaderStickyUx";
import { HomepageProfessionalRewrite } from "./components/HomepageProfessionalRewrite";
import { HomeSearchFocusUx } from "./components/HomeSearchFocusUx";

export default function App() {
  return (
    <BrowserRouter>
      <MaxPriceStoreLabels />
      <SearchUxClarity />
      <ProductInteractionUx />
      <PublicCatalogUxFixes />
      <HeaderStickyUx />
      <HomepageProfessionalRewrite />
      <HomeSearchFocusUx />
      <Routes>
        <Route path="*" element={<PrecoCertoApp />} />
      </Routes>
    </BrowserRouter>
  );
}
