import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Upload, 
  History, 
  Scan, 
  Shield, 
  Clock, 
  FileText,
  ChevronRight,
  Activity
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Scans Analyzed', value: '12', icon: Scan, color: 'from-blue-500 to-blue-600' },
    { label: 'Reports Generated', value: '8', icon: FileText, color: 'from-teal-500 to-teal-600' },
    { label: 'Avg. Confidence', value: '89%', icon: Shield, color: 'from-medical-500 to-medical-600' },
  ];

  const quickActions = [
    {
      title: 'Upload New Scan',
      description: 'Analyze X-ray, CT, MRI, or Mammogram images',
      icon: Upload,
      action: () => navigate('/upload'),
      color: 'bg-gradient-to-br from-medical-500 to-teal-500',
    },
    {
      title: 'View History',
      description: 'Access previous analyses and reports',
      icon: History,
      action: () => navigate('/history'),
      color: 'bg-gradient-to-br from-slate-600 to-slate-700',
    },
  ];

  return (
    <div className="min-h-screen medical-gradient flex">
      <Sidebar />
      
      <main className="flex-1 ml-72 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Dashboard</h1>
            <p className="text-slate-500">Welcome back to MedAI Diagnose</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-panel rounded-2xl p-6 card-hover"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</p>
                <p className="text-slate-500 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={action.action}
                className="glass-panel rounded-2xl p-6 text-left card-hover group relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 ${action.color} opacity-10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150`}></div>
                
                <div className={`w-14 h-14 rounded-xl ${action.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <action.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{action.title}</h3>
                <p className="text-slate-500 mb-4">{action.description}</p>
                
                <div className="flex items-center text-medical-600 font-medium group-hover:translate-x-2 transition-transform">
                  Get Started <ChevronRight className="w-5 h-5 ml-1" />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Recent Activity</h3>
              <button 
                onClick={() => navigate('/history')}
                className="text-medical-600 hover:text-medical-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-medical-100 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-medical-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">Chest X-Ray Analysis</p>
                    <p className="text-sm text-slate-500">Completed • 87% confidence</p>
                  </div>
                  <div className="flex items-center text-slate-400 text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    2h ago
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;