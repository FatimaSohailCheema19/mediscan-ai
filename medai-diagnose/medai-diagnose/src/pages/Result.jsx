import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Brain,
  Activity,
  Shield,
  Clock
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { mockAnalyzeMedicalImage } from '../services/gptService';
import { generateMedicalReport } from '../utils/pdfGenerator';

const Result = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const reportRef = useRef(null);
  
  const [scanData, setScanData] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        let data;
        
        if (id) {
          // Load from history
          const history = JSON.parse(localStorage.getItem('scanHistory') || '[]');
          data = history.find(h => h.id === id);
          if (data) {
            setScanData(data.scanData);
            setResult(data.result);
            setLoading(false);
            return;
          }
        } else {
          // New analysis
          const current = JSON.parse(sessionStorage.getItem('currentScan') || '{}');
          if (!current.file) {
            navigate('/upload');
            return;
          }
          
          setScanData(current);
          
          // Call GPT API (using mock for demo)
          const base64Data = current.file.split(',')[1];
          const analysisResult = await mockAnalyzeMedicalImage(base64Data, current.bodyPart);
          
          setResult(analysisResult);
          
          // Save to history
          const historyItem = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            scanData: current,
            result: analysisResult,
          };
          
          const existingHistory = JSON.parse(localStorage.getItem('scanHistory') || '[]');
          localStorage.setItem('scanHistory', JSON.stringify([historyItem, ...existingHistory]));
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to analyze image. Please try again.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, navigate]);

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !result) return;
    
    setGeneratingPDF(true);
    try {
      const imageElement = reportRef.current.querySelector('img');
      await generateMedicalReport(
        { ...result, bodyPart: scanData.bodyPart },
        imageElement
      );
    } catch (err) {
      console.error('PDF generation failed:', err);
    }
    setGeneratingPDF(false);
  };

  const handleNewScan = () => {
    sessionStorage.removeItem('currentScan');
    navigate('/upload');
  };

  if (loading) {
    return (
      <div className="min-h-screen medical-gradient flex">
        <Sidebar />
        <main className="flex-1 ml-72 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-medical-500 to-teal-500 flex items-center justify-center animate-pulse">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Analyzing your scan...</h2>
            <p className="text-slate-500">Our AI is examining the medical imaging data</p>
            <div className="mt-6 w-64 h-2 bg-slate-200 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-gradient-to-r from-medical-500 to-teal-500 animate-pulse rounded-full"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen medical-gradient flex">
        <Sidebar />
        <main className="flex-1 ml-72 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Analysis Failed</h2>
            <p className="text-slate-500 mb-6">{error}</p>
            <button onClick={() => navigate('/upload')} className="btn-primary">
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen medical-gradient flex">
      <Sidebar />
      
      <main className="flex-1 ml-72 p-8 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">AI Analysis Results</h1>
              <p className="text-slate-500 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Analysis completed on {new Date().toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleNewScan}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                New Scan
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={generatingPDF}
                className="btn-primary flex items-center gap-2 disabled:opacity-70"
              >
                {generatingPDF ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Download Report
              </button>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" ref={reportRef}>
            {/* Left Column - Image */}
            <div className="space-y-6">
              <div className="glass-panel rounded-3xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-medical-600" />
                  Uploaded Scan
                </h3>
                <div className="relative rounded-2xl overflow-hidden bg-slate-900">
                  <img 
                    src={scanData.file} 
                    alt="Medical scan" 
                    className="w-full h-auto object-contain"
                  />
                  {/* Mock Heatmap Overlay */}
                  <div className="absolute inset-0 heatmap-overlay pointer-events-none"></div>
                  <div className="absolute top-4 right-4 bg-red-500/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                    AI Attention Map
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                  <span>Body Part: <span className="font-semibold text-slate-700">{scanData.bodyPart}</span></span>
                  <span>Format: {scanData.fileName?.split('.').pop().toUpperCase()}</span>
                </div>
              </div>

              {/* Confidence Meter */}
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Confidence Score</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-medical-500 to-teal-500 rounded-full"
                      ></motion.div>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-medical-600">{result.confidence}%</span>
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  AI confidence level based on image quality and pattern recognition
                </p>
              </div>
            </div>

            {/* Right Column - Analysis */}
            <div className="space-y-6">
              {/* Diagnosis Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel rounded-2xl p-6 border-l-4 border-medical-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Detected Condition</p>
                    <h2 className="text-3xl font-bold text-slate-800">{result.diseaseName}</h2>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-medical-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-medical-600" />
                  </div>
                </div>
              </motion.div>

              {/* AI Explanation */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-medical-600" />
                  AI Explanation
                </h3>
                <p className="text-slate-600 leading-relaxed">{result.explanation}</p>
              </motion.div>

              {/* Reasoning */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-panel rounded-2xl p-6 bg-gradient-to-br from-medical-50/50 to-transparent"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Analysis Reasoning</h3>
                <div className="space-y-2">
                  {result.reasoning.split('\n').map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-medical-100 text-medical-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <p className="text-slate-600 text-sm">{step.replace(/^\d+\.\s*/, '')}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Precautions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-panel rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-teal-600" />
                  Recommended Precautions
                </h3>
                <ul className="space-y-3">
                  {result.precautions.map((precaution, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 flex-shrink-0"></div>
                      <span className="text-slate-600">{precaution}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Doctor Advice */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-panel rounded-2xl p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200"
              >
                <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Medical Consultation Advice
                </h3>
                <p className="text-amber-900 leading-relaxed">{result.doctorAdvice}</p>
              </motion.div>

              {/* Disclaimer */}
              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 text-center">
                  <span className="font-semibold">Disclaimer:</span> This analysis is generated by artificial intelligence and is for informational purposes only. 
                  It does not constitute medical advice. Always consult with a qualified healthcare provider for diagnosis and treatment.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Result;