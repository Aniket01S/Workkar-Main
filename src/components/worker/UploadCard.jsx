import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Check, Trash2, Eye } from 'lucide-react';

export default function UploadCard({
  title,
  description,
  accept = 'image/*,application/pdf',
  file,
  previewUrl,
  onChange,
  onRemove,
  isCircular = false,
}) {
  const fileInputRef = useRef(null);

  const handleContainerClick = () => {
    if (!file && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onChange(e.target.files[0]);
    }
  };

  const triggerSelect = (e) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Check if file is image or PDF
  const isImage = file
    ? file.type.startsWith('image/')
    : previewUrl && !previewUrl.endsWith('.pdf');
  const isPdf = file
    ? file.type === 'application/pdf'
    : previewUrl && previewUrl.endsWith('.pdf');

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center justify-between"
    >
      <div className="w-full flex flex-col items-center">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{title}</h3>
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-4 px-4">{description}</p>

        <input
          type="file"
          ref={fileInputRef}
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Upload Slot / Preview */}
        {!file && !previewUrl ? (
          <motion.div
            onClick={handleContainerClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl cursor-pointer bg-slate-50/50 dark:bg-slate-800/50 flex flex-col items-center justify-center transition-colors ${
              isCircular ? 'aspect-square max-w-[150px] !rounded-full' : ''
            }`}
          >
            <div className="p-3 bg-blue-50 dark:bg-slate-700/50 rounded-full text-blue-600 dark:text-blue-400 mb-2">
              <Upload size={22} className="animate-pulse" />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isCircular ? 'Upload Photo' : 'Select Document'}
            </span>
          </motion.div>
        ) : (
          <div className="relative w-full flex justify-center">
            {isCircular ? (
              // Circular avatar preview
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100 dark:border-slate-700 shadow-inner group">
                {previewUrl ? (
                  <img
                    src={previewUrl.startsWith('data:') || previewUrl.startsWith('blob:') ? previewUrl : `http://localhost:5000${previewUrl}`}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <FileText size={32} className="text-slate-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={triggerSelect}
                    className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors"
                    title="Replace"
                  >
                    <Upload size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove();
                    }}
                    className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ) : (
              // Rectangular document preview
              <div className="w-full border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 p-3 flex flex-col items-center">
                {isImage && previewUrl && (
                  <img
                    src={previewUrl.startsWith('data:') || previewUrl.startsWith('blob:') ? previewUrl : `http://localhost:5000${previewUrl}`}
                    alt={title}
                    className="w-full h-32 object-contain rounded mb-3 bg-white dark:bg-slate-800"
                  />
                )}
                {isPdf && (
                  <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 rounded flex flex-col items-center justify-center mb-3">
                    <FileText size={40} className="text-red-500 mb-2" />
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[90%]">
                      {file ? file.name : 'Uploaded Document (PDF)'}
                    </span>
                  </div>
                )}
                {!isImage && !isPdf && (
                  <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 rounded flex flex-col items-center justify-center mb-3">
                    <FileText size={40} className="text-blue-500 mb-2" />
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[90%]">
                      {file ? file.name : 'Uploaded File'}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 w-full mt-2">
                  <button
                    type="button"
                    onClick={triggerSelect}
                    className="flex-1 py-1.5 px-3 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Upload size={13} />
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={onRemove}
                    className="py-1.5 px-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center justify-center"
                    title="Remove File"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {(file || previewUrl) && (
        <div className="w-full mt-4 flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 py-1 px-3 rounded-full">
          <Check size={14} />
          <span>Ready to upload</span>
        </div>
      )}
    </motion.div>
  );
}
