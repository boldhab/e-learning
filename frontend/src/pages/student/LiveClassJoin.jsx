// pages/student/LiveClassJoinEnhanced.jsx (future implementation)
import { 
  Video, 
  Mic, 
  Users,
  Download,
  ChevronRight,
  Clock
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

const LiveClassJoin = () => {
  // Mock upcoming classes
  const upcomingClasses = [
    {
      id: 1,
      title: 'Advanced React Hooks',
      course: 'Web Development',
      teacher: 'Prof. Sarah Johnson',
      time: 'Today, 3:00 PM',
      duration: '1.5 hours',
      status: 'upcoming',
      attendees: 45
    },
    {
      id: 2,
      title: 'Machine Learning Basics',
      course: 'Data Science',
      teacher: 'Dr. Michael Chen',
      time: 'Tomorrow, 10:00 AM',
      duration: '2 hours',
      status: 'upcoming',
      attendees: 52
    },
    {
      id: 3,
      title: 'Database Normalization',
      course: 'Database Systems',
      teacher: 'Prof. Emily Watson',
      time: 'Dec 20, 2:00 PM',
      duration: '1.5 hours',
      status: 'scheduled',
      attendees: 38
    }
  ];
  
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Live Classes</h1>
          <p className="text-slate-500 mt-1">Join interactive sessions with your teachers</p>
        </div>
        <Button variant="primary" leftIcon={<Video size={18} />}>
          Join Now
        </Button>
      </div>
      
      {/* Current/Next Class Banner */}
      <Card variant="gradient" padding="lg" className="relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/80 text-sm font-medium">Next Class in 30 minutes</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Advanced React Hooks</h2>
            <p className="text-white/70">with Prof. Sarah Johnson • 45 students enrolled</p>
          </div>
          <div className="flex gap-3">
            <Button variant="glass" size="lg">
              Join Class
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
      </Card>
      
      {/* Upcoming Classes */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4">Upcoming Classes</h3>
        <div className="space-y-3">
          {upcomingClasses.map((classItem) => (
            <div key={classItem.id} className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {classItem.course}
                    </span>
                    <span className="text-xs text-slate-400">{classItem.duration}</span>
                  </div>
                  <h4 className="font-bold text-slate-800">{classItem.title}</h4>
                  <p className="text-sm text-slate-500">{classItem.teacher}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {classItem.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {classItem.attendees} attending
                    </span>
                  </div>
                </div>
                <Button variant="primary" size="sm">
                  Join
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="white" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Video size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">HD Quality</p>
              <p className="text-xs text-slate-500">Up to 1080p resolution</p>
            </div>
          </div>
        </Card>
        <Card variant="white" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Clock size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Recorded Sessions</p>
              <p className="text-xs text-slate-500">Watch anytime</p>
            </div>
          </div>
        </Card>
        <Card variant="white" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Users size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Interactive</p>
              <p className="text-xs text-slate-500">Chat & Q&A features</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* System Check Card */}
      <Card variant="glass" padding="lg">
        <h3 className="font-bold text-slate-800 mb-3">System Check</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <Video size={16} className="text-emerald-600" />
              <span className="text-sm text-slate-600">Camera</span>
            </div>
            <span className="text-xs text-emerald-600 font-semibold">Working</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <Mic size={16} className="text-emerald-600" />
              <span className="text-sm text-slate-600">Microphone</span>
            </div>
            <span className="text-xs text-emerald-600 font-semibold">Connected</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <Download size={16} className="text-emerald-600" />
              <span className="text-sm text-slate-600">Internet Speed</span>
            </div>
            <span className="text-xs text-emerald-600 font-semibold">25 Mbps</span>
          </div>
        </div>
        <Button variant="secondary" size="sm" className="mt-3">
          Run Full Test
        </Button>
      </Card>
    </div>
  );
};

export default LiveClassJoin;