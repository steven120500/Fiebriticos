import { Toaster } from "react-hot-toast";
import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// --- CONTEXTOS ---
import { CartProvider } from "./context/CartContext";
import CartDrawer from "./components/CartDrawer";

// --- COMPONENTES ---
import Header from "./components/Header";
import ProductCard from "./components/ProductCard";
import AddProductModal from "./components/AddProductModal";
import LoginModal from "./components/LoginModal";
import RegisterUserModal from "./components/RegisterUserModal";
import Footer from "./components/Footer";
import LoadingOverlay from "./components/LoadingOverlay";
import TopBanner from "./components/TopBanner";
import UserListModal from "./components/UserListModal";
import Medidas from "./components/Medidas";
import Bienvenido from "./components/Bienvenido";
import FilterBar from "./components/FilterBar";

// --- UTILS & ASSETS ---
import tallaPorTipo from "./utils/tallaPorTipo";
import { FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

// --- PÁGINAS ---
import ResetPassword from "./pages/ResetPassword";
import ProductDetail from "./pages/ProductDetail.jsx";
import Checkout from "./pages/Checkout.jsx"; 
import OrdersPage from "./pages/OrdersPage.jsx"; 
import HistoryPage from "./pages/HistoryPage.jsx";

const API_BASE = "https://fiebriticos.onrender.com"; 

function buildPages(page, pages) {
  const out = new Set([1, pages, page, page - 1, page - 2, page + 1, page + 2]);
  return [...out].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
}

const getPid = (p) => String(p?._id ?? p?.id ?? "");

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSizes, setFilterSizes] = useState([]);

  // Estados de Modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegisterUserModal, setShowRegisterUserModal] = useState(false);
  const [showUserListModal, setShowUserListModal] = useState(false);
  const [showMedidas, setShowMedidas] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const pages = Math.max(1, Math.ceil(total / limit));
  const pageTopRef = useRef(null);

  // --- AUTENTICACIÓN ---
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch { return null; }
  });

  // 🔹 VALIDACIÓN DE SUPER USUARIO CORREGIDA
  // Esto atrapa todos los casos posibles que mande tu base de datos
  const isSuperUser = user?.isSuperUser === true || user?.role === "admin" || user?.role === "superadmin" || user?.role === "super_user";
  
  const canSeeHistory = isSuperUser || (user?.roles && user.roles.includes("history"));
  const canAdd = isSuperUser || (user?.roles && user.roles.includes("add"));
  const canEdit = isSuperUser || (user?.roles && user.roles.includes("edit"));

  // 🧪 TEST DEL VAR (Revisá la consola del navegador con F12)
  console.log("👤 Usuario actual:", user);
  console.log("👑 ¿Es super usuario?:", isSuperUser);
  console.log("➕ ¿Puede agregar chemas?:", canAdd);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.success("Sesión cerrada. ¡Vuelve pronto, FIEBRE! ⚽");
  };

  // --- FETCH DE PRODUCTOS ---
  const fetchProducts = async (opts = {}) => {
    const p = opts.page ?? page;
    const q = (opts.q ?? searchTerm).trim();
    const tp = (opts.type ?? filterType).trim();
    const sizes = (opts.sizes ?? filterSizes).join(",");
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(p),
        limit: String(limit),
        ...(q ? { q } : {}),
        ...(tp ? { type: tp } : {}),
        ...(sizes ? { sizes } : {}),
      });

      const res = await fetch(`${API_BASE}/api/products?${params.toString()}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setProducts(json.items);
      setTotal(json.total);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    if (pageTopRef.current) {
        window.scrollTo({ top: pageTopRef.current.offsetTop - 150, behavior: "smooth" });
    }
  }, [page, searchTerm, filterType, filterSizes]);

  const handleProductUpdate = (updatedProduct, deletedId = null) => {
    if (deletedId) {
      setProducts((prev) => prev.filter((p) => getPid(p) !== String(deletedId)));
      return;
    }
    setProducts((prev) =>
      prev.map((p) => getPid(p) === getPid(updatedProduct) ? { ...p, ...updatedProduct } : p)
    );
  };

  return (
    <CartProvider>
      <Router>
        <CartDrawer />
        <Routes>
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pedidos" element={<OrdersPage user={user} onLogout={handleLogout} setShowUserListModal={setShowUserListModal} />} /> 
          <Route path="/historial" element={<HistoryPage user={user} onLogout={handleLogout} />} />
          <Route path="/product/:id" element={<ProductDetail user={user} onUpdate={handleProductUpdate} onLogout={handleLogout} setShowRegisterUserModal={setShowRegisterUserModal} setShowUserListModal={setShowUserListModal} onMedidasClick={() => setShowMedidas(true)} />} />
          
          <Route path="/" element={
            <div className="bg-fiebriGris min-h-screen">
              {/* MODALES GLOBALES */}
              <AnimatePresence>
                {showRegisterUserModal && <RegisterUserModal onClose={() => setShowRegisterUserModal(false)} />}
                {showUserListModal && <UserListModal open={showUserListModal} onClose={() => setShowUserListModal(false)} />}
                {showMedidas && <Medidas open={showMedidas} onClose={() => setShowMedidas(false)} />}
                {showAddModal && <AddProductModal user={user} onAdd={(newP) => { setProducts([newP, ...products]); setShowAddModal(false); }} onCancel={() => setShowAddModal(false)} />}
                {showLogin && <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLoginSuccess={(u) => setUser(u)} />}
              </AnimatePresence>
              
              {loading && <LoadingOverlay />}

              {/* NAVEGACIÓN FIJA */}
              <div className="fixed top-0 left-0 w-full z-50">
                <TopBanner />
                <Header
                  onLoginClick={() => setShowLogin(true)}
                  onLogout={handleLogout}
                  onLogoClick={() => { setFilterType(""); setSearchTerm(""); setPage(1); }}
                  onMedidasClick={() => setShowMedidas(true)}
                  user={user}
                  isSuperUser={isSuperUser}
                  canSeeHistory={canSeeHistory}
                  setShowRegisterUserModal={setShowRegisterUserModal}
                  setShowUserListModal={setShowUserListModal}
                />
              </div>

              {/* ESPACIADOR Y HERO */}
              <div className="h-28 sm:h-32" />
              <Bienvenido />

              {/* BARRA DE FILTROS STICKY */}
              <FilterBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterType={filterType} setFilterType={setFilterType} filterSizes={filterSizes} setFilterSizes={setFilterSizes} />

              {/* BOTÓN FLOTANTE ADMIN */}
              {canAdd && (
                <button 
                  className="fixed bottom-10 right-10 boton-fiebri-verde w-16 h-16 rounded-2xl shadow-2xl z-50 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all"
                  onClick={() => setShowAddModal(true)}
                >
                  <FaPlus size={24} />
                </button>
              )}

              {/* GRILLA DE PRODUCTOS */}
              <main className="max-w-7xl mx-auto px-6 pb-20">
                <div ref={pageTopRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                  {products.map((product) => (
                    <ProductCard
                      canEdit={canEdit}
                      key={getPid(product)}
                      product={product}
                      user={user}
                      onClick={() => window.location.href = `/product/${getPid(product)}`}
                    />
                  ))}
                </div>

                {/* PAGINACIÓN ESTILO FIEBRITICOS */}
                {pages > 1 && (
                  <div className="mt-16 flex justify-center items-center gap-3">
                    <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))} 
                        disabled={page === 1}
                        className="p-4 bg-white rounded-xl text-fiebriAzul disabled:opacity-30 hover:bg-fiebriVerde transition-colors shadow-sm"
                    >
                        <FaChevronLeft />
                    </button>
                    
                    {buildPages(page, pages).map(n => (
                      <button 
                        key={n} 
                        onClick={() => setPage(n)} 
                        className={`w-12 h-12 rounded-xl font-black transition-all ${n === page ? "bg-fiebriAzul text-fiebriVerde scale-110 shadow-lg" : "bg-white text-gray-400 hover:bg-gray-100"}`}
                      >
                        {n}
                      </button>
                    ))}

                    <button 
                        onClick={() => setPage(p => Math.min(pages, p + 1))} 
                        disabled={page === pages}
                        className="p-4 bg-white rounded-xl text-fiebriAzul disabled:opacity-30 hover:bg-fiebriVerde transition-colors shadow-sm"
                    >
                        <FaChevronRight />
                    </button>
                  </div>
                )}
              </main>

              <Footer />
            </div>
          } />
        </Routes>
      </Router>
      <ToastContainer position="bottom-right" theme="dark" />
      <Toaster />
    </CartProvider>
  );
}