import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Booking from './pages/Booking';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen bg-dark">
      <Routes>
        {/* Routes publiques avec Navbar */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
            </>
          }
        />
        <Route
          path="/booking/:carId?"
          element={
            <>
              <Navbar />
              <Booking />
            </>
          }
        />
        <Route
          path="/payment/success"
          element={
            <>
              <Navbar />
              <PaymentSuccess />
            </>
          }
        />
        <Route
          path="/payment/cancel"
          element={
            <>
              <Navbar />
              <PaymentCancel />
            </>
          }
        />

        {/* Routes Admin (sans Navbar) */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard/*"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#131313',
            color: '#fff',
            border: '1px solid #222',
          },
        }}
      />
    </div>
  );
}

// Pages de callback après paiement
function PaymentSuccess() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-gold mb-4">Paiement Réussi !</h1>
      <p className="text-gray-300">Merci pour votre réservation. Vous recevrez un email de confirmation.</p>
    </div>
  );
}

function PaymentCancel() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-red-500 mb-4">Paiement Annulé</h1>
      <p className="text-gray-300">Votre paiement a été annulé. Vous pouvez réessayer.</p>
    </div>
  );
}

export default App;