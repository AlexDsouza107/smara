import { useState } from 'react';
import { Plus, X, Image as ImageIcon, Search } from 'lucide-react';
import { getMemories, addMemory } from '../utils/storage';

function MemoryLibrary() {
  const [memories, setMemories] = useState(getMemories());
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMemory, setNewMemory] = useState({
    title: '',
    category: 'Events',
    description: '',
    imageUrl: '',
    people: [],
    date: '',
  });

  const categories = ['All', 'People', 'Places', 'Family', 'Music', 'Events', 'Objects', 'Stories'];

  const filteredMemories = memories.filter((memory) => {
    const matchesCategory = selectedCategory === 'All' || memory.category === selectedCategory;
    const matchesSearch =
      (memory.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (memory.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddMemory = (e) => {
    e.preventDefault();
    if (newMemory.title && newMemory.description) {
      const added = addMemory(newMemory);
      setMemories(getMemories());
      setShowAddForm(false);
      setNewMemory({
        title: '',
        category: 'Events',
        description: '',
        imageUrl: '',
        people: [],
        date: '',
      });
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      People: 'bg-blue-100 text-blue-700',
      Places: 'bg-green-100 text-green-700',
      Family: 'bg-purple-100 text-purple-700',
      Music: 'bg-pink-100 text-pink-700',
      Events: 'bg-orange-100 text-orange-700',
      Objects: 'bg-yellow-100 text-yellow-700',
      Stories: 'bg-indigo-100 text-indigo-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Memory Library</h1>
          <p className="text-gray-600">Personal memories used for cognitive activities</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Add Memory</span>
        </button>
      </div>

      {/* Add Memory Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add New Memory</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddMemory} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newMemory.title}
                  onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Family Trip to Goa"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={newMemory.category}
                  onChange={(e) => setNewMemory({ ...newMemory, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.filter(c => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={newMemory.description}
                  onChange={(e) => setNewMemory({ ...newMemory, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Describe this memory..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={newMemory.imageUrl}
                  onChange={(e) => setNewMemory({ ...newMemory, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  People Involved
                </label>
                <input
                  type="text"
                  value={newMemory.people.join(', ')}
                  onChange={(e) => setNewMemory({ ...newMemory, people: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Priya, Rahul (comma-separated)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newMemory.date}
                  onChange={(e) => setNewMemory({ ...newMemory, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Add Memory
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

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search memories..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMemories.map((memory) => (
          <div
            key={memory.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative h-48 bg-gray-100">
              {memory.image ? (
                <img
                  src={memory.image}
                  alt={memory.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`absolute inset-0 flex items-center justify-center ${memory.image ? 'hidden' : 'flex'}`}
                style={{ display: memory.image ? 'none' : 'flex' }}
              >
                <ImageIcon className="w-16 h-16 text-gray-300" />
              </div>
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(memory.category)}`}>
                  {memory.category}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-2">{memory.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{memory.description}</p>
              {memory.people && memory.people.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {memory.people.map((person, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                    >
                      {person}
                    </span>
                  ))}
                </div>
              )}
              {memory.date && (
                <p className="text-xs text-gray-500">
                  {new Date(memory.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredMemories.length === 0 && (
        <div className="text-center py-16">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No memories found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory !== 'All'
              ? 'Try adjusting your filters'
              : 'Start adding memories to build the library'}
          </p>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Add First Memory</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default MemoryLibrary;
