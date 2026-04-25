import { useState, useMemo } from 'react';
import { studentGradesData } from '../../services/mock/studentMockData';
import { 
  GraduationCap, 
  Percent, 
  TrendingUp, 
  TrendingDown,
  Award,
  BookOpen,
  Download,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Target
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

const toLetterGrade = (score) => {
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
};

const getGradeColor = (score) => {
  if (score >= 90) return 'text-emerald-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-amber-600';
  if (score >= 60) return 'text-orange-600';
  return 'text-red-600';
};

const getGradeBgColor = (score) => {
  if (score >= 90) return 'bg-emerald-50';
  if (score >= 80) return 'bg-blue-50';
  if (score >= 70) return 'bg-amber-50';
  if (score >= 60) return 'bg-orange-50';
  return 'bg-red-50';
};

const MyGrades = () => {
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('Fall 2024');
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // table, chart, detailed

  // Calculate statistics
  const stats = useMemo(() => {
    const grades = studentGradesData.gradebook;
    const totalPoints = grades.reduce((sum, g) => sum + (g.score || 0), 0);
    const maxPoints = grades.reduce((sum, g) => sum + (g.maxScore || 0), 0);
    const overallPercentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    
    const courseGroups = grades.reduce((acc, g) => {
      if (!acc[g.course]) {
        acc[g.course] = {
          course: g.course,
          total: 0,
          max: 0,
          items: []
        };
      }
      acc[g.course].total += g.score || 0;
      acc[g.course].max += g.maxScore || 0;
      acc[g.course].items.push(g);
      return acc;
    }, {});
    
    const courseAverages = Object.values(courseGroups).map(c => ({
      name: c.course,
      percentage: c.max > 0 ? Math.round((c.total / c.max) * 100) : 0,
      letter: toLetterGrade(c.max > 0 ? (c.total / c.max) * 100 : 0),
      items: c.items
    }));
    
    return {
      overallPercentage,
      overallLetter: toLetterGrade(overallPercentage),
      totalPoints,
      maxPoints,
      courseCount: Object.keys(courseGroups).length,
      courseAverages
    };
  }, []);

  const getPerformanceTrend = () => {
    const grades = studentGradesData.gradebook;
    const lastFive = grades.slice(-5);
    const average = lastFive.reduce((sum, g) => sum + ((g.score / g.maxScore) * 100), 0) / lastFive.length;
    const previousAverage = grades.slice(-10, -5).reduce((sum, g) => sum + ((g.score / g.maxScore) * 100), 0) / 5;
    const trend = average - previousAverage;
    return { trend: trend.toFixed(1), isPositive: trend > 0 };
  };

  const trend = getPerformanceTrend();

  const filteredGrades = selectedCourse === 'all' 
    ? studentGradesData.gradebook 
    : studentGradesData.gradebook.filter(g => g.course === selectedCourse);

  const uniqueCourses = [...new Set(studentGradesData.gradebook.map(g => g.course))];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Grades</h1>
          <p className="text-slate-500 mt-1">Track your academic performance and progress</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<Download size={16} />}>
            Export Report
          </Button>
          <select 
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          >
            <option>Fall 2024</option>
            <option>Spring 2024</option>
            <option>Fall 2023</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="white" padding="lg" className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Overall GPA</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{studentGradesData.summary.gpa}</p>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingUp size={12} />
                +0.15 from last sem
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <GraduationCap size={24} className="text-indigo-600" />
            </div>
          </div>
        </Card>
        
        <Card variant="white" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Average Score</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stats.overallPercentage}%</p>
              <p className={`text-xs mt-1 flex items-center gap-1 ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {trend.trend}% from last month
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getGradeBgColor(stats.overallPercentage)}`}>
              <span className={`text-xl font-bold ${getGradeColor(stats.overallPercentage)}`}>
                {stats.overallLetter}
              </span>
            </div>
          </div>
        </Card>
        
        <Card variant="white" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Attendance Rate</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{studentGradesData.summary.attendance}%</p>
              <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
                <div 
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: `${studentGradesData.summary.attendance}%` }}
                />
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Percent size={24} className="text-emerald-600" />
            </div>
          </div>
        </Card>
        
        <Card variant="white" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Courses Taken</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stats.courseCount}</p>
              <p className="text-xs text-slate-500 mt-1">This semester</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <BookOpen size={24} className="text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Overview Card */}
      <Card variant="gradient" padding="lg" className="relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award size={20} className="text-yellow-300" />
              <span className="text-white/80 text-sm font-medium">Performance Summary</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {stats.overallPercentage >= 85 ? "Excellent Performance! 🎉" :
               stats.overallPercentage >= 70 ? "Good Progress! 📈" :
               "Keep Improving! 💪"}
            </h3>
            <p className="text-white/70 text-sm max-w-md">
              {stats.overallPercentage >= 85 ? "You're in the top 15% of your class. Keep up the great work!" :
               stats.overallPercentage >= 70 ? "You're on track. Focus on areas with lower scores to improve." :
               "You have room for improvement. Reach out to teachers for extra help."}
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-white/70 text-xs">Current Rank</p>
              <p className="text-2xl font-bold text-white">Top 15%</p>
            </div>
            <div className="text-center">
              <p className="text-white/70 text-xs">Credit Hours</p>
              <p className="text-2xl font-bold text-white">48</p>
            </div>
            <div className="text-center">
              <p className="text-white/70 text-xs">Completed</p>
              <p className="text-2xl font-bold text-white">32/48</p>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
      </Card>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'table' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'detailed' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Detailed View
          </button>
        </div>
        
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
        >
          <option value="all">All Courses</option>
          {uniqueCourses.map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
      </div>

      {/* Grade Table */}
      <Card variant="white" padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Course</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Assessment</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Score</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Weight</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrades.map((item, idx) => {
                const percent = Math.round((item.score / item.maxScore) * 100);
                const letter = toLetterGrade(percent);
                const isPassing = percent >= 60;
                
                return (
                  <tr key={item.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-slate-400" />
                        <span className="font-medium text-slate-800">{item.course}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{item.assessment}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{item.score}/{item.maxScore}</span>
                        <span className="text-xs text-slate-500">({percent}%)</span>
                      </div>
                      <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1">
                        <div 
                          className={`h-1.5 rounded-full ${percent >= 70 ? 'bg-emerald-500' : percent >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-10 h-8 rounded-lg font-bold ${getGradeBgColor(percent)} ${getGradeColor(percent)}`}>
                        {letter}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{item.weight}%</td>
                    <td className="px-6 py-4">
                      {isPassing ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                          <CheckCircle size={12} />
                          Passing
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                          <AlertCircle size={12} />
                          Needs Improvement
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Course Breakdown Section */}
      {viewMode === 'detailed' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800">Course Performance Breakdown</h3>
          {stats.courseAverages.map((course, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div 
                className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedCourse(expandedCourse === course.name ? null : course.name)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen size={16} className="text-indigo-600" />
                      <h4 className="font-bold text-slate-800">{course.name}</h4>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>{course.items.length} assessments</span>
                      <span>Average: {course.percentage}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getGradeBgColor(course.percentage)}`}>
                      <span className={`text-lg font-bold ${getGradeColor(course.percentage)}`}>
                        {course.letter}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Course Grade</p>
                      <p className="text-xl font-bold text-slate-800">{course.percentage}%</p>
                    </div>
                    {expandedCourse === course.name ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>
              
              {expandedCourse === course.name && (
                <div className="border-t border-slate-100 p-5 bg-slate-50">
                  <h5 className="font-semibold text-slate-800 mb-3">Assessment Breakdown</h5>
                  <div className="space-y-3">
                    {course.items.map((item, i) => {
                      const percent = Math.round((item.score / item.maxScore) * 100);
                      return (
                        <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl">
                          <div className="flex-1">
                            <p className="font-medium text-slate-700 text-sm">{item.assessment}</p>
                            <p className="text-xs text-slate-400">Weight: {item.weight}%</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-800">
                              {item.score}/{item.maxScore}
                            </p>
                            <p className={`text-xs font-medium ${getGradeColor(percent)}`}>
                              {percent}% ({toLetterGrade(percent)})
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tips for Improvement */}
      <Card variant="glass" padding="lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Target size={24} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-1">Tips for Improvement</h3>
            <p className="text-sm text-slate-600 mb-2">
              Based on your performance, here are some recommendations:
            </p>
            <ul className="space-y-1 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" />
                Focus on assignments with highest weight (≥25%)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" />
                Review feedback on Database Systems assignments
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" />
                Schedule office hours for Web Development
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MyGrades;