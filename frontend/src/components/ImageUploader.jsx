import { useState, useRef } from 'react';
import { Upload, Camera, X, Image as ImageIcon, Loader2, Images, Plus } from 'lucide-react';

const ImageUploader = ({ onImagesSelect, onClear, isProcessing, processingCount, totalCount }) => {
  const [previews, setPreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Tipo no soportado' };
    }
    if (file.size > 10 * 1024 * 1024) {
      return { valid: false, error: 'Muy grande (max 10MB)' };
    }
    return { valid: true };
  };

  const handleFilesSelect = (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles = [];
    const newPreviews = [];

    fileArray.forEach((file, index) => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews(prev => [...prev, {
            id: `${Date.now()}-${index}`,
            src: e.target.result,
            name: file.name
          }]);
        };
        reader.readAsDataURL(file);
      }
    });

    if (validFiles.length > 0) {
      onImagesSelect(validFiles);
    }

    if (validFiles.length < fileArray.length) {
      alert(`${fileArray.length - validFiles.length} archivo(s) no válido(s) fueron ignorados`);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelect(e.dataTransfer.files);
  };

  const handleInputChange = (e) => {
    handleFilesSelect(e.target.files);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const removePreview = (id) => {
    setPreviews(prev => prev.filter(p => p.id !== id));
  };

  const clearAll = () => {
    setPreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    onClear?.();
  };

  // Show previews if we have images
  if (previews.length > 0 || isProcessing) {
    return (
      <div className="space-y-3">
        {/* Previews Grid */}
        <div className="grid grid-cols-3 gap-2">
          {previews.map((preview, index) => (
            <div key={preview.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              <img
                src={preview.src}
                alt={`Imagen ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {!isProcessing && (
                <button
                  type="button"
                  onClick={() => removePreview(preview.id)}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X size={12} className="text-white" />
                </button>
              )}
            </div>
          ))}

          {/* Add more button */}
          {!isProcessing && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1"
            >
              <Plus size={20} className="text-muted" />
              <span className="text-xs text-muted">Agregar</span>
            </button>
          )}
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center justify-center gap-3 py-4 bg-primary/5 rounded-xl">
            <Loader2 size={24} className="animate-spin text-primary" />
            <div>
              <p className="text-sm font-medium text-primary">
                Analizando imágenes...
              </p>
              {totalCount > 1 && (
                <p className="text-xs text-muted">
                  {processingCount} de {totalCount} completadas
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {!isProcessing && previews.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">
              {previews.length} imagen{previews.length !== 1 ? 'es' : ''} lista{previews.length !== 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-expense hover:underline"
            >
              Eliminar todas
            </button>
          </div>
        )}

        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Drag and Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          <div className={`p-3 rounded-full ${isDragging ? 'bg-primary/10' : 'bg-gray-100'}`}>
            <Images size={24} className={isDragging ? 'text-primary' : 'text-muted'} />
          </div>
          <div>
            <p className="font-medium text-primary">
              {isDragging ? 'Suelta las imágenes aquí' : 'Arrastra imágenes'}
            </p>
            <p className="text-sm text-muted mt-1">
              o haz clic para seleccionar varias
            </p>
          </div>
          <p className="text-xs text-muted">
            JPG, PNG, GIF o WebP. Máximo 10MB cada una
          </p>
        </div>
      </div>

      {/* Camera and Gallery Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl text-muted hover:text-primary hover:border-primary transition-colors"
        >
          <Camera size={18} />
          <span>Tomar foto</span>
        </button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleInputChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl text-muted hover:text-primary hover:border-primary transition-colors"
        >
          <ImageIcon size={18} />
          <span>Galería</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-primary/5 rounded-xl p-3">
        <p className="text-xs text-muted">
          <strong className="text-primary">Tip:</strong> Puedes subir varios pantallazos a la vez.
          Extractos bancarios, movimientos de la app, o SMS de notificación.
        </p>
      </div>
    </div>
  );
};

export default ImageUploader;
