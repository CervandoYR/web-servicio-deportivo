import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

interface Props {
  sectionId: string;
  onUploaded: () => void;
}

export default function ImageUploader({ sectionId, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      let url: string;
      let key: string | undefined;

      if (cloudName && uploadPreset) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', uploadPreset);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'Cloudinary error');
        url = data.secure_url;
        key = data.public_id;
      } else {
        const fd = new FormData();
        fd.append('file', file);
        const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        url = res.data.data.url;
        key = res.data.data.filename;
      }

      await api.post(`/landing/sections/${sectionId}/media`, { url, key });
      toast.success('Imagen subida correctamente');
      onUploaded();
    } catch (e: any) {
      toast.error(e.message || 'Error al subir imagen');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-50">
        {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
        {uploading ? 'Subiendo...' : 'Subir imagen'}
      </button>
    </>
  );
}
