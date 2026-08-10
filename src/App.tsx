import "./performance/disableClientImageProcessing";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PrecoCertoApp from "./PrecoCertoApp";
import { MaxPriceStoreLabels } from "./components/MaxPriceStoreLabels";
import { SearchUxClarity } from "./components/SearchUxClarity";
import { ProductInteractionUx } from "./components/ProductInteractionUx";
import { PublicCatalogUxFixes } from "./components/PublicCatalogUxFixes";

export default function App() {
  return (
    <BrowserRouter>
      <MaxPriceStoreLabels />
      <SearchUxClarity />
      <ProductInteractionUx />
      <PublicCatalogUxFixes />
      <Routes>
        <Route path="*" element={<PrecoCertoApp />} />
      </Routes>
    </BrowserRouter>
  );
}
