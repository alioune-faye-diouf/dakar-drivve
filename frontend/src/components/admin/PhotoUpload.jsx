import { useState, useCallback, useRef } from 'react';
import { Upload, X, Star, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  deleteCarPhoto,
  setPhotoAsPrimary,
  uploadCarPhotos,
  fetchCarPhotos,
} from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const PhotoUpload = ({ carId, existingPhotos = [], onPhotosChange }) => {
  const [dragOver, setDragOver] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [photos, setPhotos] = useState(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const getPhotoUrl = (photo) => {
    if (photo.file_path) return `${API_URL}${photo.file_path}`;
    return photo.preview || '';
  };

  const validateFile = (file) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error(`Type non autorisé: ${file.name}`);
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`Fichier trop volumineux (max 5 Mo): ${file.name}`);
      return false;
    }
    return true;
  };

  const addFiles = useCallback((files) => {
    const valid = Array.from(files).filter(validateFile);
    if (valid.length === 0) return;

    const newPending = valid.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: `pending-${Date.now()}-${Math.random()}`,
    }));
    setPendingFiles((prev) => {
      const updated = [...prev, ...newPending];
      onPhotosChange?.(photos, updated.map((p) => p.file));
      return updated;
    });
  }, [photos, onPhotosChange]);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleFileInput = (e) => addFiles(e.target.files);

  const removePending = (id) => {
    setPendingFiles((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      const updated = prev.filter((p) => p.id !== id);
      onPhotosChange?.(photos, updated.map((p) => p.file));
      return updated;
    });
  };

  const removeExisting = async (photoId) => {
    if (!carId) {
      const updated = photos.filter((p) => p.id !== photoId);
      setPhotos(updated);
      onPhotosChange?.(updated, pendingFiles.map((p) => p.file));
      return;
    }
    try {
      await deleteCarPhoto(carId, photoId);
      const updated = photos.filter((p) => p.id !== photoId);
      setPhotos(updated);
      onPhotosChange?.(updated, pendingFiles.map((p) => p.file));
      toast.success('Photo supprimée avec succès');
    } catch {
      toast.error('Erreur lors de la suppression de la photo');
    }
  };

  const handleSetPrimary = async (photoId) => {
    if (!carId) return;
    try {
      await setPhotoAsPrimary(carId, photoId);
      const updated = photos.map((p) => ({ ...p, is_primary: p.id === photoId }));
      setPhotos(updated);
      onPhotosChange?.(updated, pendingFiles.map((p) => p.file));
      toast.success('Photo principale définie');
    } catch {
      toast.error('Erreur lors de la définition de la photo principale');
    }
  };

  const uploadPending = async () => {
    if (!carId || pendingFiles.length === 0) return;
    setUploading(true);
    try {
      await uploadCarPhotos(carId, pendingFiles.map((p) => p.file));
      pendingFiles.forEach((p) => URL.revokeObjectURL(p.preview));
      setPendingFiles([]);
      const refreshed = await fetchCarPhotos(carId);
      setPhotos(refreshed);
      onPhotosChange?.(refreshed, []);
      toast.success(`${pendingFiles.length} photo(s) téléversée(s) avec succès`);
    } catch {
      toast.error('Erreur lors du téléversement des photos');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Zone drag & drop */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-gold bg-gold/10 scale-[1.01]'
            : 'border-border hover:border-gold/50 hover:bg-white/[0.02]'
        }`}
      >
        <Upload className="mx-auto mb-2 text-gold" size={28} />
        <p className="text-white font-medium text-sm mb-1">
          Glissez-déposez vos photos ici ou cliquez pour parcourir
        </p>
        <p className="text-gray-500 text-xs">
          Formats acceptés : JPEG, PNG, WebP • 5 Mo max par fichier • Jusqu'à 10 photos
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Photos enregistrées sur le serveur */}
      {photos.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <Image size={13} className="text-gold" /> Photos enregistrées ({photos.length})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={`relative group rounded-lg overflow-hidden border aspect-square ${
                  photo.is_primary ? 'border-gold shadow-md shadow-gold/15' : 'border-border'
                }`}
              >
                <img
                  src={getPhotoUrl(photo)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {photo.is_primary && (
                  <div className="absolute top-1 left-1 bg-gold text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                    Principale
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  {!photo.is_primary && carId && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetPrimary(photo.id);
                      }}
                      className="p-1.5 bg-gold text-black rounded-full hover:scale-110 transition shadow"
                      title="Définir comme photo principale"
                    >
                      <Star size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeExisting(photo.id);
                    }}
                    className="p-1.5 bg-red-500 text-white rounded-full hover:scale-110 transition shadow"
                    title="Supprimer cette photo"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos en attente d'enregistrement/upload */}
      {pendingFiles.length > 0 && (
        <div className="pt-2">
          <p className="text-xs font-medium text-yellow-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <Upload size={13} /> Photos sélectionnées en attente ({pendingFiles.length})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {pendingFiles.map((p) => (
              <div
                key={p.id}
                className="relative group rounded-lg overflow-hidden border border-yellow-500/40 aspect-square"
              >
                <img src={p.preview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePending(p.id)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-90 hover:opacity-100 transition shadow"
                  title="Retirer"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          {carId && (
            <button
              type="button"
              onClick={uploadPending}
              disabled={uploading}
              className="mt-3 w-full py-2 bg-gold/15 text-gold border border-gold/40 hover:bg-gold/25 rounded-lg text-xs font-semibold disabled:opacity-50 transition"
            >
              {uploading
                ? 'Téléversement en cours...'
                : `Téléverser immédiatement ces ${pendingFiles.length} photo(s)`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
