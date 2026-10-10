import { useState, useEffect } from 'react';
import { Edit2, Save, X, MapPin, Music, Heart, Users, Upload, Mic, Image as ImageIcon, Play, Pause } from 'lucide-react';
import { assetUrl } from '../utils/api';
import { getPatient, setPatient, addFamilyMember, updateFamilyMember, deleteFamilyMember } from '../utils/storage';

function PatientProfile() {
  const [patient, setPatientState] = useState(getPatient());
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState(patient);

  // getPatient() can return null the first time (cache not warmed yet) and
  // only syncs itself to localStorage in the background, so poll briefly
  // until the real data shows up instead of rendering on a null patient.
  useEffect(() => {
    if (patient) return;
    const interval = setInterval(() => {
      const latest = getPatient();
      if (latest) {
        setPatientState(latest);
        setEditedPatient(latest);
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, [patient]);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', relation: '', description: '' });
  const [newMemberPhoto, setNewMemberPhoto] = useState(null);
  const [newMemberVoice, setNewMemberVoice] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);

  const handleSave = async () => {
    await setPatient(editedPatient);
    setPatientState(editedPatient);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPatient(patient);
    setIsEditing(false);
  };

  const updateField = (field, value) => {
    setEditedPatient({ ...editedPatient, [field]: value });
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.relation) {
      alert('Please enter name and relation');
      return;
    }

    setUploading(true);
    try {
      await addFamilyMember(newMember, newMemberPhoto, newMemberVoice);

      // Refresh patient data
      const updated = getPatient();
      setPatientState(updated);
      setEditedPatient(updated);

      // Reset form
      setNewMember({ name: '', relation: '', description: '' });
      setNewMemberPhoto(null);
      setNewMemberVoice(null);
      setIsAddingMember(false);
    } catch (error) {
      alert('Failed to add family member: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this family member?')) {
      return;
    }

    try {
      await deleteFamilyMember(memberId);

      // Refresh patient data
      const updated = getPatient();
      setPatientState(updated);
      setEditedPatient(updated);
    } catch (error) {
      alert('Failed to delete family member: ' + error.message);
    }
  };

  const toggleAudio = (audioUrl) => {
    if (playingAudio === audioUrl) {
      const audio = document.getElementById('audio-player');
      audio.pause();
      setPlayingAudio(null);
    } else {
      const audio = document.getElementById('audio-player');
      audio.src = assetUrl(audioUrl);
      audio.play();
      setPlayingAudio(audioUrl);
    }
  };

  if (!patient) {
    return (
      <div className="max-w-5xl mx-auto">
        <p className="text-gray-500">Loading patient profile…</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hidden audio player */}
      <audio
        id="audio-player"
        onEnded={() => setPlayingAudio(null)}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Profile</h1>
          <p className="text-gray-600">Personal information and preferences</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-brand-purple-600 text-white rounded-lg hover:bg-brand-purple-700 transition-colors font-medium"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-3 bg-brand-green-600 text-white rounded-lg hover:bg-brand-green-700 transition-colors font-medium"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedPatient.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                />
              ) : (
                <p className="text-gray-900 text-lg">{patient.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={editedPatient.age}
                  onChange={(e) => updateField('age', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                />
              ) : (
                <p className="text-gray-900 text-lg">{patient.age} years</p>
              )}
            </div>
          </div>
        </div>

        {/* Language Preferences */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Language Preferences</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Language
              </label>
              {isEditing ? (
                <select
                  value={editedPatient.preferredLanguage}
                  onChange={(e) => updateField('preferredLanguage', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                >
                  <option value="Hindi">Hindi</option>
                  <option value="Assamese (অসমীয়া)">Assamese (অসমীয়া)</option>
                  <option value="English">English</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Assamese">Assamese</option>
                </select>
              ) : (
                <p className="text-gray-900 text-lg">{patient.preferredLanguage}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Language
              </label>
              {isEditing ? (
                <select
                  value={editedPatient.secondaryLanguage}
                  onChange={(e) => updateField('secondaryLanguage', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Assamese (অসমীয়া)">Assamese (অসমীয়া)</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Assamese">Assamese</option>
                </select>
              ) : (
                <p className="text-gray-900 text-lg">{patient.secondaryLanguage}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Familiar Code-Mixing
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedPatient.codeMixing}
                  onChange={(e) => updateField('codeMixing', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                  placeholder="e.g., Hindi + English"
                />
              ) : (
                <p className="text-gray-900 text-lg">{patient.codeMixing}</p>
              )}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Preferences & Interests</h2>
          <div className="space-y-6">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Music className="w-4 h-4" />
                <span>Favorite Music</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedPatient.favoriteMusic}
                  onChange={(e) => updateField('favoriteMusic', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                />
              ) : (
                <p className="text-gray-900 text-lg">{patient.favoriteMusic}</p>
              )}
            </div>
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Heart className="w-4 h-4" />
                <span>Favorite Food</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedPatient.favoriteFood}
                  onChange={(e) => updateField('favoriteFood', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                />
              ) : (
                <p className="text-gray-900 text-lg">{patient.favoriteFood}</p>
              )}
            </div>
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4" />
                <span>Favorite Places</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedPatient.favoritePlaces?.join(', ') || ''}
                  onChange={(e) => updateField('favoritePlaces', e.target.value.split(',').map(s => s.trim()))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                  placeholder="Separate with commas"
                />
              ) : (
                <p className="text-gray-900 text-lg">{patient.favoritePlaces?.join(', ')}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hobbies
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedPatient.hobbies?.join(', ') || ''}
                  onChange={(e) => updateField('hobbies', e.target.value.split(',').map(s => s.trim()))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                  placeholder="Separate with commas"
                />
              ) : (
                <p className="text-gray-900 text-lg">{patient.hobbies?.join(', ')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Family Members */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Family Members</span>
            </h2>
            <button
              onClick={() => setIsAddingMember(true)}
              className="text-sm px-4 py-2 bg-brand-blue-600 text-white rounded-lg hover:bg-brand-blue-700 font-medium"
            >
              + Add Family Member
            </button>
          </div>

          {/* Add Member Form */}
          {isAddingMember && (
            <div className="mb-6 p-4 border-2 border-brand-blue-200 rounded-lg bg-brand-blue-50">
              <h3 className="font-semibold text-gray-900 mb-4">Add New Family Member</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Relation (e.g., Daughter, Son)"
                    value={newMember.relation}
                    onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newMember.description}
                  onChange={(e) => setNewMember({ ...newMember, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <ImageIcon className="w-4 h-4 inline mr-1" />
                      Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewMemberPhoto(e.target.files[0])}
                      className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-purple-50 file:text-brand-purple-700 hover:file:bg-brand-purple-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mic className="w-4 h-4 inline mr-1" />
                      Voice Recording
                    </label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setNewMemberVoice(e.target.files[0])}
                      className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-purple-50 file:text-brand-purple-700 hover:file:bg-brand-purple-100"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleAddMember}
                    disabled={uploading}
                    className="flex items-center space-x-2 px-4 py-2 bg-brand-green-600 text-white rounded-lg hover:bg-brand-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{uploading ? 'Uploading...' : 'Add Member'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingMember(false);
                      setNewMember({ name: '', relation: '', description: '' });
                      setNewMemberPhoto(null);
                      setNewMemberVoice(null);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Family Members List */}
          <div className="space-y-4">
            {patient.familyMembers?.map((member) => (
              <div key={member.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-brand-purple-300 transition-colors">
                <div className="flex-shrink-0">
                  {member.photo ? (
                    <img
                      src={assetUrl(member.photo)}
                      alt={member.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-blue-400 to-brand-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {member.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-lg">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.relation}</p>
                  {member.description && (
                    <p className="text-sm text-gray-500 mt-1">{member.description}</p>
                  )}
                  {member.voice && (
                    <button
                      onClick={() => toggleAudio(member.voice)}
                      className="mt-2 flex items-center space-x-2 text-sm text-brand-purple-600 hover:text-brand-purple-700"
                    >
                      {playingAudio === member.voice ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      <span>{playingAudio === member.voice ? 'Pause' : 'Play'} Voice</span>
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Remove family member"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientProfile;
