import "./performance/disableClientImageProcessing";
import "./performance/tolerantDomMutations";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PrecoCertoApp from "./PrecoCertoApp";
import { MaxPriceStoreLabels } from "./components/MaxPriceStoreLabels";
import { SearchUxClarity } from "./components/SearchUxClarity";
import { ProductInteractionUx } from "./components/ProductInteractionUx";
import { PublicCatalogUxFixes } from "./components/PublicCatalogUxFixes";
import { PublicOnlineSalesAvailability } from "./components/PublicOnlineSalesAvailability";
import { HeaderStickyUx } from "./components/HeaderStickyUx";
import { HomeExperienceRefactor } from "./components/HomeExperienceRefactor";
import { HomeMobilePolish } from "./components/HomeMobilePolish";
import { HomeSearchPortalPolish } from "./components/HomeSearchPortalPolish";
import { HomeSearchKeyboardUx } from "./components/HomeSearchKeyboardUx";
import { FooterCompactUx } from "./components/FooterCompactUx";
import { RadarShowcaseUx } from "./components/RadarShowcaseUx";
import { PreferredProductPngUpgrade } from "./components/PreferredProductPngUpgrade";
import { MarketplacePositioningSection } from "./components/MarketplacePositioningSection";
import { EstablishmentsMarketplacePage } from "./components/EstablishmentsMarketplacePage";
import { EstablishmentsNavBridge } from "./components/EstablishmentsNavBridge";
import { BasketSessionFlow } from "./components/BasketSessionFlow";
import { MerchantDashboard } from "./components/MerchantDashboard";
import { MerchantBusinessSetup } from "./components/MerchantBusinessSetup";
import { MerchantBusinessSetupShortcut } from "./components/MerchantBusinessSetupShortcut";
import { MerchantDemoSwitcher } from "./components/MerchantDemoSwitcher";
import { MerchantCatalogStudio } from "./components/MerchantCatalogStudio";
import { MerchantManagementCenter } from "./components/MerchantManagementCenter";
import { MerchantOnlineSalesControl } from "./components/MerchantOnlineSalesControl";
import { MerchantOnlineStoreRoute } from "./components/MerchantOnlineStoreRoute";
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
      <PublicOnlineSalesAvailability />
      <HeaderStickyUx />
      <HomeExperienceRefactor />
      <HomeMobilePolish />
      <HomeSearchPortalPolish />
      <HomeSearchKeyboardUx />
      <FooterCompactUx />
      <RadarShowcaseUx />
      <PreferredProductPngUpgrade />
      <MarketplacePositioningSection />
      <MerchantBusinessSetupShortcut />
      <MerchantDemoSwitcher />
      <EstablishmentsNavBridge />
      <BasketSessionFlow />
      <Routes>
        <Route path="/estabelecimentos" element={<EstablishmentsMarketplacePage />} />
        <Route path="/lojista" element={<MerchantOnboardingPage />} />
        <Route path="/loja/:merchantId" element={<MerchantOnlineStoreRoute />} />
        <Route path="/painel-lojista" element={<MerchantDashboard />} />
        <Route path="/painel-lojista/gestao" element={<MerchantManagementCenter />} />
        <Route path="/painel-lojista/catalogo" element={<MerchantCatalogStudio />} />
        <Route path="/painel-lojista/configurar-negocio" element={<MerchantBusinessSetup />} />
        <Route path="/painel-lojista/vendas-online" element={<MerchantOnlineSalesControl />} />
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
