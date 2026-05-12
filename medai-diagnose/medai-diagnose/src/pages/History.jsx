import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  ChevronRight, 
  Download, 
  Trash2, 
  FileText,
  Clock,
  Activity
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { generateMedicalReport } from '../utils/pdfGenerator';

const History = () => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('scanHistory') || '[]');
    setHistory(stored);
  }, []);

  const handleDelete = (id) => {
    const updated = history.filter(h => h.id !== id);
    localStorage.setItem('scanHistory', JSON.stringify(updated));
    setHistory(updated);
  };

  const handleDownload = async (item) => {
    const imageElement = document.createElement('img');
    imageElement.src = item.scanData.file;
    await generateMedicalReport(
      { ...item.result, bodyPart: item.scanData.bodyPart },
      imageElement
    );
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen medical-gradient flex">
      <Sidebar />
      
      <main className="flex-1 ml-72 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Analysis History</h1>
            <p className="text-slate-500">View and manage your previous medical scans</p>
          </div>

          {history.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 flex items-center justify-center">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No history yet</h3>
              <p className="text-slate-500 mb-6">Start by uploading your first medical scan</p>
              <button 
                onClick={() => navigate('/upload')}
                className="btn-primary"
              >
                Upload Scan
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {history.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-panel rounded-2xl p-6 card-hover group"
                >
                  <div className="flex items-center gap-6">
                    {/* Thumbnail */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      <img 
                        src={item.scanData.file} 
                        alt="Scan thumbnail" 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-medical-100 text-medical-700 text-xs font-semibold">
                          {item.scanData.bodyPart}
                        </span>
                        <span className="flex items-center text-xs text-slate-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(item.timestamp)}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-1">
                        {item.result.diseaseName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Activity className="w-4 h-4 text-medical-500" />
                          Confidence: {item.result.confidence}%
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(item)}
                        className="p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-medical-100 hover:text-medical-600 transition-colors"
                        title="Download Report"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => navigate(`/result/${item.id}`)}
                        className="p-3 rounded-xl bg-medical-500 text-white hover:bg-medical-600 transition-colors"
                        title="View Details"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default History;