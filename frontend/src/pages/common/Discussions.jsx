import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Search, MessageCircle, Eye, AlertCircle } from 'lucide-react';
import discussionService from '../../services/discussionService';
import DiscussionForm from '../../components/discussions/DiscussionForm';
import DiscussionGroupForm from '../../components/discussions/DiscussionGroupForm';
import useAuth from '../../hooks/useAuth';
import { ROLES } from '../../constants/roles';
import { normalizeError } from '../../utils/errorHandler';

export default function Discussions() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [groupSearch, setGroupSearch] = useState('');

  const limit = 10;

  useEffect(() => {
    setSelectedGroup('');
    setPage(1);
  }, [courseId]);

  useEffect(() => {
    loadGroups();
    loadDiscussions();
  }, [courseId, page, sortBy, selectedGroup]);

  const loadGroups = async (preferredGroupId = null) => {
    try {
      const data = await discussionService.getGroups(courseId);
      const nextGroups = data.groups || [];
      setGroups(nextGroups);

      if (!nextGroups.length) {
        setSelectedGroup('');
        return;
      }

      const preferredId = preferredGroupId ? String(preferredGroupId) : null;
      const currentId = selectedGroup ? String(selectedGroup) : null;
      const hasPreferred = preferredId && nextGroups.some((group) => String(group.id) === preferredId);
      const hasCurrent = currentId && nextGroups.some((group) => String(group.id) === currentId);

      if (hasPreferred) {
        setSelectedGroup(preferredId);
        return;
      }

      if (!hasCurrent) {
        setSelectedGroup(String(nextGroups[0].id));
      }
    } catch (err) {
      setGroups([]);
    }
  };

  const loadDiscussions = async () => {
    try {
      setLoading(true);
      const data = await discussionService.getDiscussions(courseId, page, limit, sortBy, selectedGroup || null);
      setDiscussions(data.discussions || []);
      setTotalPages(data.pagination?.pages || 1);
      setError(null);
    } catch (err) {
      setError(normalizeError(err, 'Failed to load discussions'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadDiscussions();
      return;
    }

    try {
      setLoading(true);
      const data = await discussionService.searchDiscussions(courseId, searchQuery, 1, limit, selectedGroup || null);
      setDiscussions(data.results || []);
      setError(null);
    } catch (err) {
      setError(normalizeError(err, 'Search failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async (formData) => {
    try {
      await discussionService.createDiscussion(
        courseId,
        formData.title,
        formData.content,
        formData.attachment,
        selectedGroup || null
      );
      setShowForm(false);
      setPage(1);
      await loadDiscussions();
    } catch (err) {
      setError(normalizeError(err, 'Failed to create discussion'));
    }
  };

  const handleCreateGroup = async (formData) => {
    try {
      const response = await discussionService.createGroup(courseId, formData.name, formData.description);
      const createdGroup = response?.group || null;

      if (createdGroup) {
        await loadGroups(createdGroup.id);
        setSelectedGroup(String(createdGroup.id));
        setDiscussions([]);
        setTotalPages(1);
        setSearchQuery('');
        setGroupSearch('');
      } else {
        await loadGroups();
      }

      setShowGroupForm(false);
      setShowForm(false);
      setPage(1);
      setError(null);
    } catch (err) {
      setError(normalizeError(err, 'Failed to create discussion group'));
    }
  };

  const activeGroup = groups.find((group) => String(group.id) === String(selectedGroup));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-screen">
      {/* Sidebar - Discussion Groups */}
      <div className="lg:col-span-1">
        {/* Groups Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Discussion Groups</h2>
          <p className="text-sm text-gray-600">Groups are scoped to class &amp; subject</p>
        </div>

        {(user?.role === ROLES.TEACHER || user?.role === ROLES.ADMIN) && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 space-y-3">
            <p className="text-sm text-gray-600">
              Create a group for your course so students can join the right discussion space.
            </p>
            <button
              onClick={() => setShowGroupForm(!showGroupForm)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
            >
              <Plus className="w-5 h-5" />
              New Group
            </button>
          </div>
        )}

        {showGroupForm && (user?.role === ROLES.TEACHER || user?.role === ROLES.ADMIN) && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Create Discussion Group</h3>
            <DiscussionGroupForm
              onSubmit={handleCreateGroup}
              onCancel={() => setShowGroupForm(false)}
            />
          </div>
        )}

        {/* Group Search */}
        <div className="mb-4 relative">
          <input
            type="text"
            value={groupSearch}
            onChange={(e) => setGroupSearch(e.target.value)}
            placeholder="Search discussion groups..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        {/* Groups List */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Discussion Groups</h3>
          {groups.length === 0 ? (
            <div className="text-center p-4 text-gray-500 text-sm">
              <p>No discussion groups available yet</p>
              {(user?.role === ROLES.TEACHER || user?.role === ROLES.ADMIN) && (
                <p className="mt-2 text-xs text-gray-400">Create the first group to let students start discussing.</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {groups
                .filter((group) => {
                  if (!groupSearch.trim()) return true;
                  const haystack = `${group.name} ${group.description || ''} ${group.subject_name || ''} ${group.class_name || ''}`.toLowerCase();
                  return haystack.includes(groupSearch.toLowerCase());
                })
                .map((group) => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroup(String(group.id))}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      String(selectedGroup) === String(group.id)
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-3 h-3 rounded-full ${String(selectedGroup) === String(group.id) ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm font-medium text-gray-900 truncate">{group.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">{group.discussion_count || 0} posts</span>
                    </div>

                    {(group.subject_name || group.class_name) && (
                      <div className="flex flex-wrap gap-1 mt-1.5 ml-5">
                        {group.subject_name && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                            {group.subject_name}
                          </span>
                        )}
                        {group.class_name && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                            {group.class_name}
                          </span>
                        )}
                      </div>
                    )}

                    {group.description && (
                      <p className="text-xs text-gray-500 mt-1 ml-5 line-clamp-1">{group.description}</p>
                    )}
                  </div>
                ))}

              {groupSearch.trim() && groups.filter((group) => {
                const haystack = `${group.name} ${group.description || ''} ${group.subject_name || ''} ${group.class_name || ''}`.toLowerCase();
                return haystack.includes(groupSearch.toLowerCase());
              }).length === 0 && (
                <div className="text-center p-4 text-gray-500 text-sm">
                  <p>No discussion groups match your search</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Discussion Center */}
      <div className="lg:col-span-3 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discussion Center</h1>
            <p className="text-sm text-gray-600 mt-1">
              {activeGroup
                ? `Now viewing ${activeGroup.name}`
                : 'Select or create a discussion group to get started.'}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            disabled={!selectedGroup}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            New Discussion
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Create Discussion Form */}
        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Start a New Discussion</h2>
            <p className="text-sm text-gray-600 mb-4">
              Posting in: {activeGroup?.name || 'No group selected'}
            </p>
            <DiscussionForm
              onSubmit={handleCreateDiscussion}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search discussions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Search
            </button>
          </form>

          {/* Sort Options */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="recent"
                checked={sortBy === 'recent'}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-4 h-4"
              />
              <span className="text-gray-700">Recent</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="popular"
                checked={sortBy === 'popular'}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-4 h-4"
              />
              <span className="text-gray-700">Popular</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="unanswered"
                checked={sortBy === 'unanswered'}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-4 h-4"
              />
              <span className="text-gray-700">Unanswered</span>
            </label>
          </div>
        </div>

        {/* Discussions List */}
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : discussions.length === 0 ? (
          <div className="text-center p-12 bg-gray-50 rounded-lg">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              {selectedGroup ? 'No discussions in this group yet' : 'No discussion groups available'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {selectedGroup
                ? 'Be the first to start a discussion in this group'
                : 'Create a group to begin discussing this course'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {discussions.map((discussion) => (
              <div
                key={discussion.id}
                onClick={() => navigate(`/course/${courseId}/discussions/${discussion.id}`)}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                    {discussion.title}
                  </h3>
                  {discussion.reply_count === 0 && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                      Unanswered
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {discussion.content}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{discussion.reply_count} replies</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{discussion.views} views</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      src={discussion.student_avatar}
                      alt={discussion.student_name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{discussion.student_name}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(discussion.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
