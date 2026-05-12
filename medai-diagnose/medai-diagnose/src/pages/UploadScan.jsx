import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, X, Scan, ChevronRight, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Sidebar from '../components/Sidebar';

const UploadScan = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [bodyPart, setBodyPart] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      if (uploadedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setFile(uploadedFile);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(uploadedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.dicom'],
    },
    maxFiles: 1,
  });

  const handleAnalyze = () => {
    if (!file || !bodyPart) {
      setError('Please upload an image and select body part');
      return;
    }

    // Store in session for result page
    sessionStorage.setItem('currentScan', JSON.stringify({
      file: preview,
      bodyPart,
      fileName: file.name,
    }));

    navigate('/result');
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setError('');
  };

  return (
    <div className="min-h-screen medical-gradient flex">
      <Sidebar />
      
      <main className="flex-1 ml-72 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Upload Medical Scan</h1>
            <p className="text-slate-500">Upload your medical image for AI analysis</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Area */}
            <div className="space-y-6">
              {!preview ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  {...getRootProps()}
                  className={`glass-panel rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive ? 'border-medical-500 bg-medical-50/50 scale-105' : 'border-dashed border-2 border-slate-300'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-medical-100 to-teal-100 flex items-center justify-center">
                    <Upload className={`w-10 h-10 ${isDragActive ? 'text-medical-600' : 'text-slate-400'}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    {isDragActive ? 'Drop your image here' : 'Drag & drop your scan'}
                  </h3>
                  <p className="text-slate-500 mb-4">or click to browse files</p>
                  <p className="text-xs text-slate-400">
                    Supports: JPEG, PNG, DICOM (Max 10MB)
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="glass-panel rounded-3xl p-6 relative"
                >
                  <button
                    onClick={clearFile}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="relative rounded-2xl overflow-hidden bg-slate-100">
                    <img 
                      src={preview} 
                      alt="Medical scan preview" 
                      className="w-full h-64 object-contain"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                      <p className="text-white text-sm font-medium truncate">{file.name}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl"
                >
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-6">
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Scan className="w-5 h-5 text-medical-600" />
                  Select Body Part
                </h3>
                
                <div className="space-y-3">
                  {['Lung', 'Brain', 'Breast'].map((part) => (
                    <button
                      key={part}
                      onClick={() => setBodyPart(part)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        bodyPart === part
                          ? 'border-medical-500 bg-medical-50 shadow-md'
                          : 'border-slate-200 hover:border-medical-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">{part} Scan</p>
                          <p className="text-sm text-slate-500">
                            {part === 'Lung' && 'Chest X-ray or CT scan'}
                            {part === 'Brain' && 'MRI or CT head scan'}
                            {part === 'Breast' && 'Mammogram imaging'}
                          </p>
                        </div>
                        {bodyPart === part && (
                          <div className="w-6 h-6 rounded-full bg-medical-500 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnalyze}
                disabled={!file || !bodyPart}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Start AI Analysis
                <ChevronRight className="w-5 h-5" />
              </motion.button>

              <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                <p className="text-sm text-teal-800">
                  <span className="font-semibold">Privacy Note:</span> Your images are processed securely and never stored permanently. All analysis is done using encrypted connections.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default UploadScan;