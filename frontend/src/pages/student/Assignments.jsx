/* eslint-disable react/prop-types */
import { useState, useMemo } from 'react';
import { studentAssignmentsData } from '../../services/mock/studentMockData';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Award,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Calendar,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PagePlaceholder } from '../../components/common/PagePlaceholder';

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: AlertCircle,
    color: 'warning',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
    iconClass: 'text-amber-500'
  },
  submitted: {
    label: 'Submitted',
    icon: Clock,
    color: 'info',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
    iconClass: 'text-blue-500'
  },
  graded: {
    label: 'Graded',
    icon: CheckCircle2,
    color: 'success',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
    iconClass: 'text-emerald-500'
  },
  late: {
    label: 'Late',
    icon: AlertCircle,
    color: 'danger',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    borderClass: 'border-red-200',
    iconClass: 'text-red-500'
  }
};

const Assignments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // Filter and sort assignments
  const filteredAssignments = useMemo(() => {
    let filtered = [...studentAssignmentsData];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(assignment => 
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.course.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(assignment => assignment.status === filterStatus);
    }
    
    // Sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'dueDate':
          aVal = new Date(a.dueDate);
          bVal = new Date(b.dueDate);
          break;
        case 'title':
          aVal = a.title;
          bVal = b.title;
          break;
        case 'points':
          aVal = a.points;
          bVal = b.points;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          aVal = a.title;
          bVal = b.title;
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  }, [searchTerm, filterStatus, sortBy, sortOrder]);

  const stats = {
    total: studentAssignmentsData.length,
    pending: studentAssignmentsData.filter(a => a.status === 'pending').length,
    submitted: studentAssignmentsData.filter(a => a.status === 'submitted').length,
    graded: studentAssignmentsData.filter(a => a.status === 'graded').length,
    averageGrade: studentAssignmentsData
      .filter(a => a.grade)
      .reduce((acc, a) => acc + a.grade, 0) / studentAssignmentsData.filter(a => a.grade).length || 0
  };

  const handleSubmitAssignment = async () => {
    if (!selectedFile) {
      alert('Please select a file to submit');
      return;
    }
    
    setSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitting(false);
    setShowSubmissionModal(false);
    setSelectedFile(null);
    // Refresh assignments (in real app, you'd refetch data)
    alert('Assignment submitted successfully!');
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days remaining`;
  };

  const getDaysRemainingColor = (dueDate) => {
    const days = getDaysRemaining(dueDate);
    if (days === 'Overdue') return 'text-red-600';
    if (days === 'Due today') return 'text-amber-600';
    return 'text-slate-500';
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <Card variant="white" padding="md" className="hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon size={24} className={color} />
        </div>
      </div>
    </Card>
  );

  const AssignmentCard = ({ assignment }) => {
    const config = statusConfig[assignment.status];
    const daysRemaining = getDaysRemaining(assignment.dueDate);
    const daysColor = getDaysRemainingColor(assignment.dueDate);
    
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:border-indigo-200 group">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${config.bgClass}`}>
              <config.icon size={16} className={config.iconClass} />
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${config.bgClass} ${config.textClass}`}>
              {config.label}
            </span>
          </div>
          {assignment.grade && (
            <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
              <Award size={14} className="text-emerald-600" />
              <span className="text-sm font-bold text-emerald-700">{assignment.grade}/{assignment.points}</span>
            </div>
          )}
        </div>
        
        {/* Content */}
        <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{assignment.title}</h3>
        <p className="text-sm text-slate-500 mb-3">{assignment.course}</p>
        
        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar size={14} />
            <span>Due: {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <FileText size={14} />
            <span>{assignment.points} points</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Clock size={14} className={daysColor} />
            <span className={daysColor}>{daysRemaining}</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-slate-100">
          {assignment.status === 'pending' && (
            <Button 
              size="sm" 
              variant="primary"
              fullWidth
              onClick={() => {
                setSelectedAssignment(assignment);
                setShowSubmissionModal(true);
              }}
            >
              Submit Assignment
            </Button>
          )}
          {assignment.status === 'graded' && assignment.feedback && (
            <Button 
              size="sm" 
              variant="secondary"
              fullWidth
              leftIcon={<MessageSquare size={14} />}
              onClick={() => alert(`Feedback: ${assignment.feedback}`)}
            >
              View Feedback
            </Button>
          )}
          {assignment.attachment && (
            <Button 
              size="sm" 
              variant="ghost"
              leftIcon={<Download size={14} />}
              onClick={() => window.open(assignment.attachment, '_blank')}
            >
              Materials
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (studentAssignmentsData.length === 0) {
    return (
      <PagePlaceholder 
        variant="empty"
        title="No Assignments Yet"
        description="You don't have any assignments at the moment. Check back later or contact your teacher."
        actionText="Browse Courses"
        onAction={() => window.location.href = '/student/courses'}
      />
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Assignments</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track, submit, and manage all your coursework in one place
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-full">
            <AlertCircle size={16} className="text-amber-600" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              {stats.pending} Pending
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Assignments" value={stats.total} icon={FileText} color="text-indigo-600" />
        <StatCard title="Submitted" value={stats.submitted} icon={CheckCircle2} color="text-blue-600" trend={12} />
        <StatCard title="Graded" value={stats.graded} icon={Award} color="text-emerald-600" trend={8} />
        <StatCard title="Average Grade" value={`${Math.round(stats.averageGrade)}%`} icon={TrendingUp} color="text-purple-600" trend={5} />
      </div>

      {/* Filters and Search Bar */}
      <Card variant="white" padding="md" className="sticky top-20 z-30">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search assignments by title or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          
          {/* Filter Toggle Button (Mobile) */}
          <Button 
            variant="secondary" 
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden"
            leftIcon={<Filter size={18} />}
          >
            Filters
          </Button>
          
          {/* Filters (Desktop) */}
          <div className={`flex flex-wrap gap-3 ${showFilters ? 'flex' : 'hidden md:flex'}`}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="graded">Graded</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="title">Sort by Title</option>
              <option value="points">Sort by Points</option>
              <option value="status">Sort by Status</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              {sortOrder === 'asc' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </button>
            
            {(searchTerm || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
              >
                <X size={18} />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing {filteredAssignments.length} of {studentAssignmentsData.length} assignments
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <FileText size={18} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Assignments List/Grid */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredAssignments.map((assignment) => (
            <AssignmentListItem key={assignment.id} assignment={assignment} onViewDetails={setSelectedAssignment} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      )}

      {/* No Results */}
      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No assignments found</h3>
          <p className="text-slate-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Submission Modal */}
      {showSubmissionModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSubmissionModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">Submit Assignment</h3>
              <button onClick={() => setShowSubmissionModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-slate-800">{selectedAssignment.title}</p>
                <p className="text-sm text-slate-500">{selectedAssignment.course}</p>
              </div>
              
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Upload File</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full p-2 border border-slate-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="text-xs text-slate-400 mt-1">Supported formats: PDF, DOC, DOCX, ZIP (Max 10MB)</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="secondary" onClick={() => setShowSubmissionModal(false)} fullWidth>
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleSubmitAssignment} 
                  isLoading={submitting}
                  loadingText="Submitting..."
                  fullWidth
                >
                  Submit Assignment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// List Item Component
const AssignmentListItem = ({ assignment, onViewDetails }) => {
  const config = statusConfig[assignment.status];
  const daysRemaining = getDaysRemaining(assignment.dueDate);
  const daysColor = getDaysRemainingColor(assignment.dueDate);
  
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all hover:border-indigo-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${config.bgClass}`}>
              <config.icon size={14} className={config.iconClass} />
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.bgClass} ${config.textClass}`}>
              {config.label}
            </span>
            {assignment.grade && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Grade: {assignment.grade}/{assignment.points}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-slate-800 mb-1">{assignment.title}</h3>
          <p className="text-sm text-slate-500">{assignment.course}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-slate-500">
            <Calendar size={14} />
            <span>{new Date(assignment.dueDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <FileText size={14} />
            <span>{assignment.points} pts</span>
          </div>
          <div className={`flex items-center gap-1 ${daysColor}`}>
            <Clock size={14} />
            <span>{daysRemaining}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {assignment.status === 'pending' && (
            <Button size="sm" variant="primary" onClick={() => onViewDetails(assignment)}>
              Submit
            </Button>
          )}
          {assignment.attachment && (
            <Button size="sm" variant="ghost" leftIcon={<Download size={14} />}>
              Files
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getDaysRemaining = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  return `${diffDays} days left`;
};

const getDaysRemainingColor = (dueDate) => {
  const days = getDaysRemaining(dueDate);
  if (days === 'Overdue') return 'text-red-600';
  if (days === 'Due today') return 'text-amber-600';
  return 'text-slate-500';
};

export default Assignments;