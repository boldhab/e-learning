import { useState, useMemo } from 'react';
import { mockCourses } from '../../services/mock/mockData';
import { studentLearningData } from '../../services/mock/studentMockData';
import { 
  BookOpen, 
  Target, 
  CheckCircle2,
  TrendingUp,
  Clock,
  Award,
  Flame,
  Zap,
  Play,
  ChevronRight,
  Star,
  Calendar,
  Search,
  Sparkles,
  Brain
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

const MyLearning = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Calculate learning statistics
  const stats = useMemo(() => {
    const totalCourses = mockCourses.length;
    const totalLessons = mockCourses.reduce((sum, c) => sum + c.lessons.length, 0);
    const completedLessons = mockCourses.reduce(
      (sum, c) => sum + c.lessons.filter(l => l.complete).length, 0
    );
    const averageProgress = Math.round(
      mockCourses.reduce((sum, c) => sum + c.progress, 0) / totalCourses
    );
    const totalStudyTime = mockCourses.reduce((sum, c) => sum + (c.studyTime || 0), 0);
    
    return {
      totalCourses,
      totalLessons,
      completedLessons,
      averageProgress,
      totalStudyTime,
      completionRate: Math.round((completedLessons / totalLessons) * 100)
    };
  }, []);

  const filteredCourses = mockCourses.filter(course => {
    if (searchTerm && !course.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterStatus === 'active' && course.progress >= 100) return false;
    if (filterStatus === 'completed' && course.progress < 100) return false;
    return true;
  });

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'emerald';
    if (progress >= 40) return 'indigo';
    if (progress >= 20) return 'amber';
    return 'slate';
  };

  const getMotivationalMessage = () => {
    if (stats.completionRate >= 75) return "Outstanding progress! You're a learning machine! 🚀";
    if (stats.completionRate >= 50) return "Great momentum! Keep pushing forward! 💪";
    if (stats.completionRate >= 25) return "Good start! Consistency is key! 📚";
    return "Every journey begins with a single step. Start today! 🌟";
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Learning</h1>
          <p className="text-slate-500 mt-1">Track your courses, progress, and learning journey</p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" leftIcon={<Play size={16} />}>
            Continue Learning
          </Button>
          <Button variant="secondary" leftIcon={<Calendar size={16} />}>
            Study Plan
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="white" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Enrolled Courses</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalCourses}</p>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingUp size={12} />
                +2 this month
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <BookOpen size={24} className="text-indigo-600" />
            </div>
          </div>
        </Card>
        
        <Card variant="white" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Lessons Completed</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stats.completedLessons}/{stats.totalLessons}</p>
              <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
                <div 
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={24} className="text-emerald-600" />
            </div>
          </div>
        </Card>
        
        <Card variant="white" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Avg. Progress</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stats.averageProgress}%</p>
              <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
                <div 
                  className="bg-indigo-500 h-1.5 rounded-full"
                  style={{ width: `${stats.averageProgress}%` }}
                />
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Target size={24} className="text-indigo-600" />
            </div>
          </div>
        </Card>
        
        <Card variant="white" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Study Streak</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{studentLearningData.streakDays} days</p>
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <Flame size={12} />
                Best: 15 days
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Flame size={24} className="text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Motivational Banner */}
      <Card variant="gradient" padding="lg" className="relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles size={24} className="text-yellow-300" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Your Learning Journey</p>
              <p className="text-white font-semibold">{getMotivationalMessage()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-center">
              <p className="text-white/70 text-xs">Weekly Goal</p>
              <p className="text-xl font-bold text-white">{studentLearningData.weeklyGoal}%</p>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <p className="text-white/70 text-xs">Completed</p>
              <p className="text-xl font-bold text-white">{studentLearningData.weeklyProgress}%</p>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === 'all' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Courses
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === 'active' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === 'completed' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourses.map((course) => {
          const lessonsComplete = course.lessons.filter(l => l.complete).length;
          const progressColor = getProgressColor(course.progress);
          const nextLesson = course.lessons.find(l => !l.complete);
          
          return (
            <div key={course.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100">
              {/* Course Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between text-white">
                    <span className="text-xs font-semibold bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                      {course.level}
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      {course.rating}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Course Content */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{course.title}</h3>
                    <p className="text-sm text-slate-500">{course.instructor}</p>
                  </div>
                  {course.progress === 100 && (
                    <div className="px-2 py-1 bg-emerald-50 rounded-lg">
                      <span className="text-xs font-semibold text-emerald-600">Completed ✓</span>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{course.description}</p>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-500">Course Progress</span>
                    <span className={`text-${progressColor}-600`}>{course.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-${progressColor}-500 rounded-full transition-all duration-500`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
                
                {/* Course Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-400">Lessons</p>
                    <p className="font-bold text-slate-700">{lessonsComplete}/{course.lessons.length}</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-400">Duration</p>
                    <p className="font-bold text-slate-700">{course.duration}</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-400">Students</p>
                    <p className="font-bold text-slate-700">{course.students || 234}</p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  {course.progress < 100 && nextLesson && (
                    <Button variant="primary" fullWidth leftIcon={<Play size={16} />}>
                      Continue: {nextLesson.title}
                    </Button>
                  )}
                  {course.progress === 100 && (
                    <Button variant="success" fullWidth leftIcon={<Award size={16} />}>
                      Certificate Available
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout for Milestones and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Milestones Section */}
        <Card variant="white" padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Target size={20} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Learning Milestones</h3>
              <p className="text-xs text-slate-500">Track your achievements</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {studentLearningData.milestones.map((milestone) => (
              <div key={milestone.id} className="relative">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    milestone.progress === 100 ? 'bg-emerald-100' : 'bg-slate-100'
                  }`}>
                    {milestone.progress === 100 ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : (
                      <Clock size={16} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm text-slate-800">{milestone.title}</p>
                        <p className="text-xs text-slate-500">Due {new Date(milestone.dueDate).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm font-semibold text-indigo-600">{milestone.progress}%</span>
                    </div>
                    <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all ${
                          milestone.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommended Topics & Study Tips */}
        <div className="space-y-6">
          {/* Recommended Topics */}
          <Card variant="glass" padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Sparkles size={20} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Recommended for You</h3>
                <p className="text-xs text-slate-500">Based on your learning pattern</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {studentLearningData.recommendedTopics.map((topic, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <Brain size={16} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{topic}</p>
                      <p className="text-xs text-slate-400">Recommended based on your progress</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>
          </Card>

          {/* Study Tips */}
          <Card variant="white" padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Zap size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Study Tips</h3>
                <p className="text-xs text-slate-500">Maximize your learning efficiency</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Take short breaks every 25 minutes (Pomodoro technique)</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Review notes within 24 hours for better retention</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Practice active recall instead of passive reading</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Set specific, achievable daily learning goals</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyLearning;