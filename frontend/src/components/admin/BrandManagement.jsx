import { useState, useEffect } from 'react';
import {
  fetchBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  fetchModels,
  createModel,
  updateModel,
  deleteModel,
} from '../../services/api';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Layers,
  Car,
  Tag,
  AlertCircle,
  Search,
  Globe,
  Calendar,
  Fuel,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Berline',
  'Berline de luxe',
  'SUV',
  '4x4',
  'Coupé',
  'Cabriolet',
  'Citadine',
  'Monospace',
  'Pick-up',
];

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandForm, setBrandForm] = useState({ name: '', country: '', logo_url: '' });

  const [showModelModal, setShowModelModal] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [modelForm, setModelForm] = useState({
    name: '',
    brand_id: '',
    category: 'Berline',
    year_start: '',
    year_end: '',
    default_fuel_type: 'Essence',
    default_transmission: 'Automatique',
  });

  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'brand' | 'model', item }
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [brandsData, modelsData] = await Promise.all([
        fetchBrands(),
        fetchModels(),
      ]);
      setBrands(brandsData);
      setModels(modelsData);
    } catch {
      toast.error('Erreur lors du chargement des marques et modèles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered lists
  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.country && b.country.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const displayedModels = selectedBrand
    ? models.filter((m) => m.brand_id === selectedBrand.id)
    : models;

  // Handlers - Brand
  const openCreateBrand = () => {
    setEditingBrand(null);
    setBrandForm({ name: '', country: '', logo_url: '' });
    setShowBrandModal(true);
  };

  const openEditBrand = (brand) => {
    setEditingBrand(brand);
    setBrandForm({
      name: brand.name,
      country: brand.country || '',
      logo_url: brand.logo_url || '',
    });
    setShowBrandModal(true);
  };

  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    if (!brandForm.name.trim()) {
      toast.error('Le nom de la marque est requis');
      return;
    }
    setSaving(true);
    try {
      if (editingBrand) {
        await updateBrand(editingBrand.id, brandForm);
        toast.success(`Marque ${brandForm.name} mise à jour`);
      } else {
        await createBrand(brandForm);
        toast.success(`Marque ${brandForm.name} ajoutée`);
      }
      setShowBrandModal(false);
      setEditingBrand(null);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l’enregistrement');
    } finally {
      setSaving(false);
    }
  };

  // Handlers - Model
  const openCreateModel = (defaultBrandId = null) => {
    setEditingModel(null);
    setModelForm({
      name: '',
      brand_id: defaultBrandId || selectedBrand?.id || (brands[0]?.id || ''),
      category: 'Berline',
      year_start: '',
      year_end: '',
      default_fuel_type: 'Essence',
      default_transmission: 'Automatique',
    });
    setShowModelModal(true);
  };

  const openEditModel = (model) => {
    setEditingModel(model);
    setModelForm({
      name: model.name,
      brand_id: model.brand_id,
      category: model.category || 'Berline',
      year_start: model.year_start || '',
      year_end: model.year_end || '',
      default_fuel_type: model.default_fuel_type || 'Essence',
      default_transmission: model.default_transmission || 'Automatique',
    });
    setShowModelModal(true);
  };

  const handleModelSubmit = async (e) => {
    e.preventDefault();
    if (!modelForm.name.trim() || !modelForm.brand_id) {
      toast.error('Nom et marque obligatoires');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...modelForm,
        brand_id: Number(modelForm.brand_id),
        year_start: modelForm.year_start ? Number(modelForm.year_start) : undefined,
        year_end: modelForm.year_end ? Number(modelForm.year_end) : undefined,
      };

      if (editingModel) {
        await updateModel(editingModel.id, payload);
        toast.success(`Modèle ${modelForm.name} mis à jour`);
      } else {
        await createModel(payload);
        toast.success(`Modèle ${modelForm.name} ajouté`);
      }
      setShowModelModal(false);
      setEditingModel(null);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l’enregistrement');
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      if (deleteConfirm.type === 'brand') {
        await deleteBrand(deleteConfirm.item.id);
        toast.success(`Marque "${deleteConfirm.item.name}" supprimée`);
        if (selectedBrand?.id === deleteConfirm.item.id) {
          setSelectedBrand(null);
        }
      } else {
        await deleteModel(deleteConfirm.item.id);
        toast.success(`Modèle "${deleteConfirm.item.name}" supprimé`);
      }
      setDeleteConfirm(null);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de suppression');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full bg-dark border border-border rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-gold transition placeholder-gray-600 text-sm';
  const labelClass = 'block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-light text-white">Catalogue Marques & Modèles</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gérez le référentiel des constructeurs et gammes de véhicules
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateBrand}
            className="flex items-center gap-2 bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25 px-4 py-2.5 rounded-lg text-sm font-medium transition"
          >
            <Plus size={16} /> Nouvelle Marque
          </button>
          <button
            onClick={() => openCreateModel()}
            className="flex items-center gap-2 bg-gold text-black hover:bg-gold/90 px-4 py-2.5 rounded-lg text-sm font-medium transition"
          >
            <Plus size={16} /> Nouveau Modèle
          </button>
        </div>
      </div>

      {/* Grid: Marques à gauche, Modèles à droite */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne Marques (5/12) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Tag size={18} className="text-gold" />
                Marques automobiles ({brands.length})
              </h2>
              {selectedBrand && (
                <button
                  onClick={() => setSelectedBrand(null)}
                  className="text-xs text-gold hover:underline"
                >
                  Voir tous les modèles
                </button>
              )}
            </div>

            {/* Barre de recherche marques */}
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une marque..."
                className="w-full bg-dark border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
              />
            </div>

            {/* Liste des marques */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredBrands.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Aucune marque trouvée.
                </div>
              ) : (
                filteredBrands.map((brand) => {
                  const isSelected = selectedBrand?.id === brand.id;
                  return (
                    <div
                      key={brand.id}
                      onClick={() => setSelectedBrand(isSelected ? null : brand)}
                      className={`p-3 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-gold bg-gold/10'
                          : 'border-border bg-dark/40 hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {brand.logo_url ? (
                          <img
                            src={brand.logo_url}
                            alt={brand.name}
                            className="w-8 h-8 object-contain rounded bg-white/5 p-1 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-dark border border-border flex items-center justify-center text-xs font-semibold text-gold flex-shrink-0">
                            {brand.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {brand.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                            {brand.country && <span>{brand.country}</span>}
                            <span>• {brand.modelsCount || 0} modèle(s)</span>
                            {brand.carsCount > 0 && (
                              <span className="text-gold">• {brand.carsCount} en flotte</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openEditBrand(brand)}
                          className="p-1.5 text-gray-400 hover:text-blue-400 rounded transition"
                          title="Modifier"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'brand', item: brand })}
                          className="p-1.5 text-gray-400 hover:text-red-400 rounded transition"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Colonne Modèles (7/12) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Layers size={18} className="text-gold" />
                  {selectedBrand ? (
                    <span>
                      Modèles <span className="text-gold">{selectedBrand.name}</span> (
                      {displayedModels.length})
                    </span>
                  ) : (
                    <span>Tous les modèles du catalogue ({models.length})</span>
                  )}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedBrand
                    ? `Modèles rattachés au constructeur ${selectedBrand.name}`
                    : 'Sélectionnez une marque à gauche pour filtrer ses modèles'}
                </p>
              </div>
              <button
                onClick={() => openCreateModel(selectedBrand?.id)}
                className="text-xs bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25 px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1"
              >
                <Plus size={14} /> Ajouter un modèle
              </button>
            </div>

            {/* Tableau des modèles */}
            <div className="overflow-x-auto">
              {displayedModels.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                  <Car size={32} className="mx-auto mb-2 text-gray-700" />
                  Aucun modèle enregistré {selectedBrand ? `pour ${selectedBrand.name}` : ''}.
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-dark/50 border-b border-border text-xs text-gray-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2.5">Modèle</th>
                      <th className="px-3 py-2.5">Marque</th>
                      <th className="px-3 py-2.5">Catégorie</th>
                      <th className="px-3 py-2.5">Période</th>
                      <th className="px-3 py-2.5">Config par défaut</th>
                      <th className="px-3 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {displayedModels.map((model) => (
                      <tr key={model.id} className="hover:bg-white/[0.02] transition">
                        <td className="px-3 py-3 font-medium text-white">{model.name}</td>
                        <td className="px-3 py-3 text-gray-300">
                          {model.brand?.name || '—'}
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-block px-2 py-0.5 rounded text-xs bg-dark border border-border text-gray-300">
                            {model.category || 'Standard'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-400">
                          {model.year_start
                            ? `${model.year_start} - ${model.year_end || 'actuel'}`
                            : '—'}
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-400">
                          {model.default_transmission || 'Auto'} •{' '}
                          {model.default_fuel_type || 'Essence'}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => openEditModel(model)}
                              className="p-1.5 text-gray-400 hover:text-blue-400 rounded transition"
                              title="Modifier"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ type: 'model', item: model })}
                              className="p-1.5 text-gray-400 hover:text-red-400 rounded transition"
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Marque */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl w-full max-w-md border border-border p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-white">
                {editingBrand ? 'Modifier la marque' : 'Nouvelle marque automobile'}
              </h3>
              <button
                onClick={() => setShowBrandModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleBrandSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Nom de la marque *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Mercedes-Benz, BMW, Porsche"
                  value={brandForm.name}
                  onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Pays d'origine</label>
                <input
                  type="text"
                  placeholder="ex: Allemagne, Japon, Royaume-Uni"
                  value={brandForm.country}
                  onChange={(e) => setBrandForm({ ...brandForm, country: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>URL du logo (optionnel)</label>
                <input
                  type="url"
                  placeholder="https://... logo.png"
                  value={brandForm.logo_url}
                  onChange={(e) => setBrandForm({ ...brandForm, logo_url: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowBrandModal(false)}
                  className="px-4 py-2 border border-border rounded-lg text-gray-400 hover:text-white text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-gold text-black rounded-lg font-medium hover:bg-gold/90 text-sm disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : editingBrand ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modèle */}
      {showModelModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl w-full max-w-lg border border-border p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-white">
                {editingModel ? 'Modifier le modèle' : 'Nouveau modèle automobile'}
              </h3>
              <button
                onClick={() => setShowModelModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleModelSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelClass}>Marque associée *</label>
                  <select
                    required
                    value={modelForm.brand_id}
                    onChange={(e) => setModelForm({ ...modelForm, brand_id: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Sélectionnez une marque</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Nom du modèle *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Classe E, Série 5, Cayenne, Land Cruiser"
                    value={modelForm.name}
                    onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Catégorie de carrosserie</label>
                  <select
                    value={modelForm.category}
                    onChange={(e) => setModelForm({ ...modelForm, category: e.target.value })}
                    className={inputClass}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Transmission standard</label>
                  <select
                    value={modelForm.default_transmission}
                    onChange={(e) =>
                      setModelForm({ ...modelForm, default_transmission: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option>Automatique</option>
                    <option>Manuelle</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Carburant standard</label>
                  <select
                    value={modelForm.default_fuel_type}
                    onChange={(e) =>
                      setModelForm({ ...modelForm, default_fuel_type: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option>Essence</option>
                    <option>Diesel</option>
                    <option>Hybride</option>
                    <option>Électrique</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Année de début (génération)</label>
                  <input
                    type="number"
                    min="1950"
                    max="2035"
                    placeholder="ex: 2020"
                    value={modelForm.year_start}
                    onChange={(e) => setModelForm({ ...modelForm, year_start: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModelModal(false)}
                  className="px-4 py-2 border border-border rounded-lg text-gray-400 hover:text-white text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-gold text-black rounded-lg font-medium hover:bg-gold/90 text-sm disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : editingModel ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmation de Suppression Sécurisée */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full border border-red-500/30">
            <div className="flex items-center gap-3 mb-3 text-red-400">
              <AlertCircle size={24} />
              <h3 className="text-lg font-semibold text-white">Confirmer la suppression</h3>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Voulez-vous vraiment supprimer {deleteConfirm.type === 'brand' ? 'la marque' : 'le modèle'}{' '}
              <strong className="text-white">"{deleteConfirm.item.name}"</strong> ?
              <br />
              <span className="text-xs text-gray-500 mt-2 block">
                La suppression sera automatiquement rejetée par le serveur si des modèles ou des
                véhicules en location y sont rattachés.
              </span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-border rounded-lg text-gray-400 hover:text-white text-sm transition"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={saving}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 text-sm transition disabled:opacity-50"
              >
                {saving ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandManagement;
