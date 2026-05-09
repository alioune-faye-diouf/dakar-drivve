import { useState, useEffect } from 'react';
import { fetchCars, createCar, updateCar, deleteCar } from '../../services/api';
import { getAdminToken } from '../../services/adminApi';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CarManagement = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCar, setEditingCar] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    description: '',
    transmission: 'Automatique',
    horsepower: '',
    price_per_day: '',
    available: true,
    image_url: '',
  });

  const token = getAdminToken();

  const loadCars = async () => {
    try {
      const data = await fetchCars();
      setCars(data);
    } catch (error) {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        year: Number(formData.year),
        horsepower: Number(formData.horsepower),
        price_per_day: Number(formData.price_per_day),
      };
      if (editingCar) {
        await updateCar(editingCar.id, payload, token);
        toast.success('Voiture mise à jour');
      } else {
        await createCar(payload, token);
        toast.success('Voiture ajoutée');
      }
      setShowForm(false);
      setEditingCar(null);
      resetForm();
      loadCars();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette voiture ?')) {
      try {
        await deleteCar(id, token);
        toast.success('Voiture supprimée');
        loadCars();
      } catch (error) {
        toast.error('Erreur de suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      description: '',
      transmission: 'Automatique',
      horsepower: '',
      price_per_day: '',
      available: true,
      image_url: '',
    });
  };

  const openEdit = (car) => {
    setEditingCar(car);
    setFormData({
      name: car.name,
      brand: car.brand,
      model: car.model,
      year: car.year,
      description: car.description,
      transmission: car.transmission,
      horsepower: car.horsepower,
      price_per_day: car.price_per_day,
      available: car.available,
      image_url: car.image_url || '',
    });
    setShowForm(true);
  };

  if (loading) return <div className="text-center py-10">Chargement...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-light text-white">Gestion des voitures</h1>
        <button
          onClick={() => { setEditingCar(null); resetForm(); setShowForm(true); }}
          className="flex items-center bg-gold text-black px-4 py-2 rounded-md hover:bg-gold/90"
        >
          <Plus size={18} className="mr-2" /> Ajouter
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-6 rounded-xl w-full max-w-2xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{editingCar ? 'Modifier' : 'Nouvelle'} voiture</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-dark border border-border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Marque</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    className="w-full bg-dark border border-border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Modèle</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="w-full bg-dark border border-border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Année</label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="w-full bg-dark border border-border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Transmission</label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => setFormData({...formData, transmission: e.target.value})}
                    className="w-full bg-dark border border-border rounded px-3 py-2"
                  >
                    <option>Automatique</option>
                    <option>Manuelle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Chevaux</label>
                  <input
                    type="number"
                    required
                    value={formData.horsepower}
                    onChange={(e) => setFormData({...formData, horsepower: e.target.value})}
                    className="w-full bg-dark border border-border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Prix/jour (FCFA)</label>
                  <input
                    type="number"
                    required
                    value={formData.price_per_day}
                    onChange={(e) => setFormData({...formData, price_per_day: e.target.value})}
                    className="w-full bg-dark border border-border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">URL image</label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="w-full bg-dark border border-border rounded px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm mb-1">Description</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-dark border border-border rounded px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({...formData, available: e.target.checked})}
                      className="mr-2"
                    />
                    Disponible
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-500 rounded hover:bg-gray-700">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-gold text-black rounded hover:bg-gold/90">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-dark/50 border-b border-border">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Prix/jour</th>
              <th className="px-4 py-3">Disponible</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car.id} className="border-b border-border hover:bg-white/5">
                <td className="px-4 py-3">
                  {car.image_url ? (
                    <img src={car.image_url} alt={car.name} className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-xs">N/A</div>
                  )}
                </td>
                <td className="px-4 py-3">{car.brand} {car.model}</td>
                <td className="px-4 py-3">{car.price_per_day.toLocaleString()} FCFA</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${car.available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {car.available ? 'Oui' : 'Non'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => openEdit(car)} className="text-blue-400 hover:text-blue-300 mr-3">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(car.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CarManagement;