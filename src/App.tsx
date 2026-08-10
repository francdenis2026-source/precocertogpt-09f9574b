import "./performance/disableClientImageProcessing";
import "./performance/tolerantDomMutations";
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
import { RadarShowcaseUx } from "./components/RadarShowcaseUx";
import { PreferredProductPngUpgrade } from "./components/PreferredProductPngUpgrade";
import { MerchantDashboard } from "./components/MerchantDashboard";
import { PlatformAdminDashboard } from "./components/PlatformAdminDashboard";
import { CustomerOrders } from "./components/CustomerOrders";
import { MercadoPagoCallback } from "./components/MercadoPagoCallback";
import { CollaboratePage, ContactPage, MerchantSignupPage, PharmaciesPage } from "./components/PublicFooterServicePages";

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
      <RadarShowcaseUx />
      <PreferredProductPngUpgrade />
      <Routes>
        <Route path="/lojista" element={<MerchantSignupPage />} />
        <Route path="/painel-lojista" element={<MerchantDashboard />} />
        <Route path="/meus-pedidos" element={<CustomerOrders />} />
        <Route path="/integracoes/mercadopago/callback" element={<MercadoPagoCallback />} />
        <Route path="/admin/plataforma" element={<PlatformAdminDashboard />} />
        <Route path="/colaborar" element={<CollaboratePage />} />
        <Route path="/fale-conosco" element={<ContactPage />} />
        <Route path="/farmacias" element={<PharmaciesPage />} />
        <Route path="*" element={<PrecoCertoApp />} />
      </Routes>
    </BrowserRouter>
  );
}
