import { useState, useEffect } from 'react';
import {
  fetchAllCars,
  createCar,
  updateCar,
  deleteCar,
  uploadCarPhotos,
  fetchCarPhotos,
  fetchBrands,
  fetchModels,
} from '../../services/api';
import { Plus, Edit, Trash2, X, Car, Fuel, Users, Zap, Image, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PhotoUpload from './PhotoUpload';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const EMPTY_FORM = {
  name: '',
  brand: '',
  brand_id: null,
  model: '',
  model_id: null,
  year: new Date().getFullYear(),
  description: '',
  transmission: 'Automatique',
  fuel_type: 'Essence',
  horsepower: '',
  seats: 5,
  price_per_day: '',
  available: true,
  features: [],
};

const FEATURES_OPTIONS = [
  'Climatisation',
  'GPS Intégré',
  'Bluetooth & Carplay',
  'Caméra 360 / Recul',
  'Régulateur adaptatif',
  'Sièges cuir ventilés',
  'Toit ouvrant panoramique',
  'Capteurs de parking',
  'Démarrage sans clé',
  'Système audio Burmester/Bose',
  'Suspension pneumatique',
  'Vitres teintées',
];

const CarManagement = () => {
  const [cars, setCars] = useState([]);
  const [brands, setBrands] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCar, setEditingCar] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [carsData, brandsData] = await Promise.all([
        fetchAllCars(),
        fetchBrands().catch(() => []),
      ]);
      setCars(carsData);
      setBrands(brandsData);
    } catch {
      toast.error('Erreur lors du chargement des véhicules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Quand une marque est choisie dans le formulaire, charger ses modèles associés
  const handleBrandChange = async (brandName) => {
    const matchedBrand = brands.find(
      (b) => b.name.toLowerCase() === brandName.toLowerCase()
    );

    setFormData((prev) => ({
      ...prev,
      brand: brandName,
      brand_id: matchedBrand ? matchedBrand.id : null,
      model: '',
      model_id: null,
    }));

    if (matchedBrand) {
      try {
        const models = await fetchModels(matchedBrand.id);
        setAvailableModels(models);
      } catch {
        setAvailableModels([]);
      }
    } else {
      setAvailableModels([]);
    }
  };

  // Quand un modèle est choisi dans le formulaire, pré-remplir les specs si disponibles
  const handleModelChange = (modelName) => {
    const matchedModel = availableModels.find(
      (m) => m.name.toLowerCase() === modelName.toLowerCase()
    );

    setFormData((prev) => ({
      ...prev,
      model: modelName,
      model_id: matchedModel ? matchedModel.id : null,
      transmission: matchedModel?.default_transmission || prev.transmission,
      fuel_type: matchedModel?.default_fuel_type || prev.fuel_type,
      // Générer automatiquement un nom commercial élégant si vide
      name:
        prev.name === '' || prev.name === `${prev.brand} ${prev.model}`
          ? `${prev.brand} ${modelName}`
          : prev.name,
    }));
  };

  const getCarPrimaryPhoto = (car) => {
    if (car.photos && car.photos.length > 0) {
      const primary = car.photos.find((p) => p.is_primary) || car.photos[0];
      return `${API_URL}${primary.file_path}`;
    }
    return car.image_url || null;
  };

  const handleFeatureToggle = (feature) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handlePhotosChange = (photos, files) => {
    setExistingPhotos(photos);
    setPendingFiles(files);
  };

  const openCreate = () => {
    setEditingCar(null);
    setFormData(EMPTY_FORM);
    setExistingPhotos([]);
    setPendingFiles([]);
    setAvailableModels([]);
    setShowForm(true);
  };

  const openEdit = async (car) => {
    setEditingCar(car);
    setFormData({
      name: car.name || '',
      brand: car.brand || '',
      brand_id: car.brand_id || null,
      model: car.model || '',
      model_id: car.model_id || null,
      year: car.year || new Date().getFullYear(),
      description: car.description || '',
      transmission: car.transmission || 'Automatique',
      fuel_type: car.fuel_type || 'Essence',
      horsepower: car.horsepower || '',
      seats: car.seats || 5,
      price_per_day: car.price_per_day || '',
      available: car.available ?? true,
      features: car.features || [],
    });

    // Charger les modèles associés à cette marque pour le select
    const matchedBrand = brands.find(
      (b) => b.name.toLowerCase() === (car.brand || '').toLowerCase()
    );
    if (matchedBrand) {
      try {
        const models = await fetchModels(matchedBrand.id);
        setAvailableModels(models);
      } catch {
        setAvailableModels([]);
      }
    } else {
      setAvailableModels([]);
    }

    // Charger les photos
    try {
      const photos = await fetchCarPhotos(car.id);
      setExistingPhotos(photos);
    } catch {
      setExistingPhotos(car.photos || []);
    }
    setPendingFiles([]);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        brand_id: formData.brand_id ? Number(formData.brand_id) : undefined,
        model: formData.model.trim(),
        model_id: formData.model_id ? Number(formData.model_id) : undefined,
        year: Number(formData.year),
        description: formData.description,
        transmission: formData.transmission,
        fuel_type: formData.fuel_type,
        horsepower: Number(formData.horsepower),
        seats: Number(formData.seats),
        price_per_day: Number(formData.price_per_day),
        available: formData.available,
        features: formData.features,
      };

      let savedCar;
      if (editingCar) {
        savedCar = await updateCar(editingCar.id, payload);
        toast.success(`Véhicule ${savedCar.brand} ${savedCar.model} mis à jour`);
      } else {
        savedCar = await createCar(payload);
        toast.success(`Véhicule ${savedCar.brand} ${savedCar.model} créé`);
      }

      // Upload des photos en attente s'il y en a
      if (pendingFiles.length > 0) {
        await uploadCarPhotos(savedCar.id, pendingFiles);
        toast.success(`${pendingFiles.length} photo(s) téléversée(s)`);
      }

      setShowForm(false);
      setEditingCar(null);
      setFormData(EMPTY_FORM);
      setPendingFiles([]);
      await loadInitialData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Erreur lors de l’enregistrement du véhicule'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCar(id);
      toast.success('Véhicule supprimé de la flotte');
      setDeleteConfirm(null);
      await loadInitialData();
    } catch {
      toast.error('Erreur lors de la suppression du véhicule');
    }
  };

  const inputClass =
    'w-full bg-dark border border-border rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-gold transition placeholder-gray-600 text-sm';
  const labelClass = 'block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-light text-white">Gestion de la Flotte</h1>
          <p className="text-gray-500 text-sm mt-1">
            {cars.length} véhicule{cars.length !== 1 ? 's' : ''} enregistré
            {cars.length !== 1 ? 's' : ''} au catalogue
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gold text-black px-5 py-2.5 rounded-lg hover:bg-gold/90 font-medium transition text-sm shadow-lg shadow-gold/10"
        >
          <Plus size={18} /> Ajouter un véhicule
        </button>
      </div>

      {/* Modal formulaire de création/édition */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl w-full max-w-3xl border border-border max-h-[95vh] overflow-y-auto">
            {/* Header modal */}
            <div className="flex justify-between items-center p-6 border-b border-border sticky top-0 bg-card z-10">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {editingCar ? 'Modifier le véhicule' : 'Nouveau véhicule de location'}
                </h2>
                {editingCar && (
                  <p className="text-gray-500 text-xs mt-0.5">
                    ID #{editingCar.id} • {editingCar.brand} {editingCar.model}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Informations générales */}
              <div>
                <h3 className="text-sm font-semibold text-gold uppercase tracking-wider mb-4">
                  1. Identification & Marque
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Marque */}
                  <div>
                    <label className={labelClass}>Marque automobile *</label>
                    <div className="space-y-2">
                      {brands.length > 0 && (
                        <select
                          value={formData.brand}
                          onChange={(e) => handleBrandChange(e.target.value)}
                          className={inputClass}
                        >
                          <option value="">Sélectionner dans le catalogue...</option>
                          {brands.map((b) => (
                            <option key={b.id} value={b.name}>
                              {b.name}
                            </option>
                          ))}
                          <option value="__custom__">+ Saisie manuelle...</option>
                        </select>
                      )}
                      {(brands.length === 0 || formData.brand === '__custom__') && (
                        <input
                          type="text"
                          required
                          value={formData.brand === '__custom__' ? '' : formData.brand}
                          onChange={(e) =>
                            setFormData({ ...formData, brand: e.target.value, brand_id: null })
                          }
                          className={inputClass}
                          placeholder="Nom de la marque (ex: Mercedes-Benz)"
                        />
                      )}
                    </div>
                  </div>

                  {/* Modèle */}
                  <div>
                    <label className={labelClass}>Modèle *</label>
                    <div className="space-y-2">
                      {availableModels.length > 0 ? (
                        <select
                          value={formData.model}
                          onChange={(e) => handleModelChange(e.target.value)}
                          className={inputClass}
                        >
                          <option value="">Sélectionner un modèle...</option>
                          {availableModels.map((m) => (
                            <option key={m.id} value={m.name}>
                              {m.name} {m.category ? `(${m.category})` : ''}
                            </option>
                          ))}
                          <option value="__custom_model__">+ Saisie manuelle...</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          value={formData.model}
                          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                          className={inputClass}
                          placeholder="ex: Classe E, Série 5, Cayenne"
                        />
                      )}
                    </div>
                  </div>

                  {/* Nom commercial */}
                  <div className="col-span-1 md:col-span-2">
                    <label className={labelClass}>Nom commercial affiché *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClass}
                      placeholder="ex: Mercedes Classe E 350d Pack AMG"
                    />
                  </div>

                  {/* Année */}
                  <div>
                    <label className={labelClass}>Année *</label>
                    <input
                      type="number"
                      required
                      min="1990"
                      max="2030"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  {/* Prix par jour */}
                  <div>
                    <label className={labelClass}>Prix par jour (FCFA) *</label>
                    <input
                      type="number"
                      required
                      min="1000"
                      step="1000"
                      value={formData.price_per_day}
                      onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                      className={inputClass}
                      placeholder="ex: 150000"
                    />
                  </div>
                </div>
              </div>

              {/* Caractéristiques techniques */}
              <div>
                <h3 className="text-sm font-semibold text-gold uppercase tracking-wider mb-4">
                  2. Caractéristiques techniques
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>Transmission</label>
                    <select
                      value={formData.transmission}
                      onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                      className={inputClass}
                    >
                      <option>Automatique</option>
                      <option>Manuelle</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Carburant</label>
                    <select
                      value={formData.fuel_type}
                      onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                      className={inputClass}
                    >
                      <option>Essence</option>
                      <option>Diesel</option>
                      <option>Hybride</option>
                      <option>Électrique</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Puissance (ch)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.horsepower}
                      onChange={(e) => setFormData({ ...formData, horsepower: e.target.value })}
                      className={inputClass}
                      placeholder="ex: 300"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Nombre de places</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="20"
                      value={formData.seats}
                      onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gold uppercase tracking-wider mb-4">
                  3. Description & Expérience client
                </h3>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={inputClass}
                  placeholder="Décrivez les atouts majeurs, le confort, la finition de ce véhicule de prestige..."
                />
              </div>

              {/* Équipements */}
              <div>
                <h3 className="text-sm font-semibold text-gold uppercase tracking-wider mb-3">
                  4. Équipements & Options de confort
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FEATURES_OPTIONS.map((feature) => (
                    <label
                      key={feature}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition ${
                        formData.features.includes(feature)
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-border text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                      />
                      <CheckCircle2
                        size={14}
                        className={
                          formData.features.includes(feature) ? 'text-gold' : 'text-gray-600'
                        }
                      />
                      <span className="text-xs">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Photos & Galerie */}
              <div>
                <h3 className="text-sm font-semibold text-gold uppercase tracking-wider mb-3">
                  5. Galerie photos (Upload multiple)
                </h3>
                <PhotoUpload
                  carId={editingCar?.id}
                  existingPhotos={existingPhotos}
                  onPhotosChange={handlePhotosChange}
                />
              </div>

              {/* Disponibilité */}
              <div className="flex items-center gap-3 p-4 bg-dark rounded-lg border border-border">
                <div
                  className={`relative w-10 h-6 rounded-full transition cursor-pointer ${
                    formData.available ? 'bg-gold' : 'bg-gray-600'
                  }`}
                  onClick={() => setFormData({ ...formData, available: !formData.available })}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      formData.available ? 'left-5' : 'left-1'
                    }`}
                  />
                </div>
                <span className="text-sm text-gray-300">
                  Statut :{' '}
                  {formData.available ? (
                    <span className="text-green-400 font-medium">
                      Disponible à la location publique
                    </span>
                  ) : (
                    <span className="text-red-400 font-medium">
                      Indisponible / En maintenance
                    </span>
                  )}
                </span>
              </div>

              {/* Actions footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 border border-border rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gold text-black rounded-lg font-medium hover:bg-gold/90 disabled:opacity-50 transition flex items-center gap-2 text-sm shadow-md"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                      Enregistrement...
                    </>
                  ) : editingCar ? (
                    'Mettre à jour le véhicule'
                  ) : (
                    'Ajouter le véhicule à la flotte'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full border border-red-500/30">
            <h3 className="text-lg font-semibold text-white mb-2">Confirmer la suppression</h3>
            <p className="text-gray-400 text-sm mb-6">
              Voulez-vous vraiment supprimer le véhicule{' '}
              <strong className="text-white">
                {deleteConfirm.brand} {deleteConfirm.model}
              </strong>{' '}
              ?
              <br />
              <span className="text-xs text-gray-500 mt-2 block">
                Toutes les photos associées seront également supprimées du serveur.
              </span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-border rounded-lg text-gray-400 hover:text-white transition text-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition text-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tableau des véhicules */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {cars.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Car size={40} className="mx-auto mb-3 text-gray-700" />
            <p>Aucun véhicule dans la flotte pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-dark/50 border-b border-border">
                <tr>
                  <th className="px-5 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Véhicule
                  </th>
                  <th className="px-5 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Catégorie & Énergie
                  </th>
                  <th className="px-5 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Tarif journalier
                  </th>
                  <th className="px-5 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Galerie
                  </th>
                  <th className="px-5 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-5 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cars.map((car) => {
                  const photoCount = car.photos ? car.photos.length : car.image_url ? 1 : 0;
                  return (
                    <tr key={car.id} className="hover:bg-white/[0.02] transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-11 rounded-lg overflow-hidden bg-dark border border-border flex-shrink-0">
                            {getCarPrimaryPhoto(car) ? (
                              <img
                                src={getCarPrimaryPhoto(car)}
                                alt={car.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Car size={18} className="text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">
                              {car.name || `${car.brand} ${car.model}`}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {car.brand} {car.model} · {car.year} • {car.transmission}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm text-gray-300">{car.fuel_type || 'Essence'}</div>
                        <div className="text-xs text-gray-500">
                          {car.horsepower} ch • {car.seats || 5} places
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-white font-medium text-sm">
                          {Number(car.price_per_day).toLocaleString()} FCFA
                        </span>
                        <span className="text-gray-500 text-xs block">par jour</span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-dark border border-border text-gray-300">
                          <Image size={12} className="text-gold" />
                          {photoCount} photo{photoCount !== 1 ? 's' : ''}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            car.available
                              ? 'bg-green-500/15 text-green-400'
                              : 'bg-red-500/15 text-red-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              car.available ? 'bg-green-400' : 'bg-red-400'
                            }`}
                          />
                          {car.available ? 'Disponible' : 'Indisponible'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEdit(car)}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition"
                            title="Modifier ce véhicule"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(car)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                            title="Supprimer ce véhicule"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarManagement;
