import { useState, useEffect } from 'react';
import { Activity, Clock, Users, TrendingUp, Calendar } from 'lucide-react';
import { getStats, getActivities, getMemories } from '../utils/storage';

function Insights() {
  const [stats, setStats] = useState(getStats());
  const [activities, setActivities] = useState(getActivities());
  const memories = getMemories();

  // getStats() can return null the first time (cache not warmed yet) and
  // only syncs itself to localStorage in the background, so poll briefly
  // until the real data shows up instead of rendering on a null stats object.
  useEffect(() => {
    if (stats) return;
    const interval = setInterval(() => {
      const latest = getStats();
      if (latest) {
        setStats(latest);
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, [stats]);

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto">
        <p className="text-gray-500">Loading insights…</p>
      </div>
    );
  }

  // Calculate insights
  const getFrequentlyRecognizedPeople = () => {
    const peopleCount = {};
    memories.forEach(memory => {
      if (memory.people) {
        memory.people.forEach(person => {
          peopleCount[person] = (peopleCount[person] || 0) + 1;
        });
      }
    });

    return Object.entries(peopleCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  };

  const getFrequentMemories = () => {
    const categoryCount = {};
    memories.forEach(memory => {
      categoryCount[memory.category] = (categoryCount[memory.category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));
  };

  const getActivityBreakdown = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayActivities = i === 0 ? 3 : Math.floor(Math.random() * 5);
      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: dayActivities,
      });
    }
    return last7Days;
  };

  const frequentPeople = getFrequentlyRecognizedPeople();
  const frequentMemories = getFrequentMemories();
  const activityBreakdown = getActivityBreakdown();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress & Insights</h1>
        <p className="text-gray-600">Engagement overview and interaction trends</p>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
        <p className="text-sm text-yellow-900">
          <strong>Note:</strong> These insights describe interaction with the platform and should not be
          interpreted as clinical assessments. This is engagement tracking, not medical monitoring.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Activities Completed</p>
          <p className="text-3xl font-bold text-gray-900">{stats.activitiesCompleted}</p>
          <p className="text-xs text-gray-500 mt-1">Total interactions</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Memory Interactions</p>
          <p className="text-3xl font-bold text-gray-900">{stats.memoryInteractions}</p>
          <p className="text-xs text-gray-500 mt-1">Recognition attempts</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs text-gray-500">Avg: 8 min/session</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Engagement Time</p>
          <p className="text-3xl font-bold text-gray-900">{stats.engagementTime} min</p>
          <p className="text-xs text-gray-500 mt-1">Today's total</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">+5%</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Familiarity Score</p>
          <p className="text-3xl font-bold text-gray-900">{stats.familiarityScore}%</p>
          <p className="text-xs text-gray-500 mt-1">Recognition rate</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Activity Participation Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Activity Participation</h2>
          <div className="space-y-3">
            {activityBreakdown.map((day, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{day.date}</span>
                  <span className="text-sm text-gray-600">{day.count} activities</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(day.count / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Frequently Engaged Memories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Memory Interaction Trends</h2>
          <div className="space-y-4">
            {frequentMemories.map((item, idx) => {
              const colors = ['blue', 'purple', 'green', 'orange', 'pink'];
              const color = colors[idx % colors.length];
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-700',
                purple: 'bg-purple-100 text-purple-700',
                green: 'bg-green-100 text-green-700',
                orange: 'bg-orange-100 text-orange-700',
                pink: 'bg-pink-100 text-pink-700',
              };

              return (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center font-bold`}>
                      {item.count}
                    </div>
                    <span className="font-medium text-gray-900">{item.category}</span>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-${color}-600 h-2 rounded-full`}
                        style={{ width: `${(item.count / memories.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">{item.count} memories</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Frequently Recognized People */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Engaged People</h2>
          <div className="space-y-4">
            {frequentPeople.length > 0 ? (
              frequentPeople.map((person, idx) => (
                <div key={idx} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {person.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{person.name}</p>
                    <p className="text-sm text-gray-600">Appears in {person.count} memories</p>
                  </div>
                  <div className="text-right">
                    <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold">
                      {person.count}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No people tracked yet</p>
            )}
          </div>
        </div>

        {/* Preferred Activity Types */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Preferred Activity Types</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-blue-600" />
                <span className="font-medium text-gray-900">People Recognition</span>
              </div>
              <span className="text-sm font-semibold text-blue-600">45%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-green-600" />
                <span className="font-medium text-gray-900">Place Identification</span>
              </div>
              <span className="text-sm font-semibold text-green-600">30%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity className="w-6 h-6 text-purple-600" />
                <span className="font-medium text-gray-900">Memory Matching</span>
              </div>
              <span className="text-sm font-semibold text-purple-600">25%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Language Preference */}
      <div className="mt-8 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-6 border border-orange-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Language Preference</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-orange-600 mb-1">অসমীয়া</p>
            <p className="text-sm text-gray-600">Primary language</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-600 mb-1">English</p>
            <p className="text-sm text-gray-600">Secondary language</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-pink-600 mb-1">Assamese–English</p>
            <p className="text-sm text-gray-600">Natural interaction</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Insights;
