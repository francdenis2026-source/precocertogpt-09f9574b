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
import { MerchantBusinessSetup } from "./components/MerchantBusinessSetup";
import { MerchantBusinessSetupShortcut } from "./components/MerchantBusinessSetupShortcut";
import { MerchantManagementCenter } from "./components/MerchantManagementCenter";
import { MerchantOnboardingPage } from "./components/MerchantOnboardingPage";
import { PlatformAdminDashboard } from "./components/PlatformAdminDashboard";
import { AdminMerchantManagement } from "./components/AdminMerchantManagement";
import { CustomerOrders } from "./components/CustomerOrders";
import { MercadoPagoCallback } from "./components/MercadoPagoCallback";
import { CollaboratePage, ContactPage, PharmaciesPage } from "./components/PublicFooterServicePages";

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
      <MerchantBusinessSetupShortcut />
      <Routes>
        <Route path="/lojista" element={<MerchantOnboardingPage />} />
        <Route path="/painel-lojista" element={<MerchantDashboard />} />
        <Route path="/painel-lojista/gestao" element={<MerchantManagementCenter />} />
        <Route path="/painel-lojista/configurar-negocio" element={<MerchantBusinessSetup />} />
        <Route path="/meus-pedidos" element={<CustomerOrders />} />
        <Route path="/integracoes/mercadopago/callback" element={<MercadoPagoCallback />} />
        <Route path="/admin/plataforma" element={<PlatformAdminDashboard />} />
        <Route path="/admin/comercios" element={<AdminMerchantManagement />} />
        <Route path="/colaborar" element={<CollaboratePage />} />
        <Route path="/fale-conosco" element={<ContactPage />} />
        <Route path="/farmacias" element={<PharmaciesPage />} />
        <Route path="*" element={<PrecoCertoApp />} />
      </Routes>
    </BrowserRouter>
  );
}
