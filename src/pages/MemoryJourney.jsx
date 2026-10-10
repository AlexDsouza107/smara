import { useState } from 'react';
import { Plus, X, Calendar } from 'lucide-react';
import { getTimeline, addTimelineEvent, getPatient } from '../utils/storage';
import Timeline from '../components/Timeline';
import EmptyState from '../components/EmptyState';

function MemoryJourney() {
  const [timeline, setTimeline] = useState(getTimeline());
  const firstName = getPatient()?.name?.split(' ')[0] || 'the patient';
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    year: new Date().getFullYear(),
    title: '',
    description: '',
  });

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (newEvent.title && newEvent.year) {
      addTimelineEvent(newEvent);
      setTimeline(getTimeline());
      setShowAddForm(false);
      setNewEvent({
        year: new Date().getFullYear(),
        title: '',
        description: '',
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Memory Journey</h1>
          <p className="text-gray-600">A timeline of important life events and memories</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Add Event Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900">Add Life Event</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  value={newEvent.year}
                  onChange={(e) => setNewEvent({ ...newEvent, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1900"
                  max={new Date().getFullYear()}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Started new job"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Add more details..."
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Add Event
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8 border border-purple-100">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Using Life Stories for Cognitive Engagement
            </h2>
            <p className="text-gray-700">
              This timeline shows {firstName}'s life journey. These personal milestones help create meaningful
              activities and conversations, making cognitive engagement more familiar and comfortable.
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {timeline.length > 0 ? (
        <Timeline events={timeline} />
      ) : (
        <EmptyState
          icon={Calendar}
          title="No events yet"
          description="Start building the memory journey by adding the first life milestone."
          actionLabel="Add First Event"
          actionIcon={Plus}
          onAction={() => setShowAddForm(true)}
        />
      )}
    </div>
  );
}

export default MemoryJourney;
