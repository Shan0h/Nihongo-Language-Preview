'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { questions, Category, Question } from '@/data/questions';
import Link from 'next/link';

export default function AdminQuestions() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdmin') === 'true');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    setIsAdmin(false);
    router.push('/admin/login');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4">
        <div className="text-center max-w-sm w-full">
          <p className="text-xl mb-4">Access Denied</p>
          <Link href="/admin/login" className="btn-torii w-full py-3">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const categories: Category[] = [
    { name: 'All', japanese: 'すべて', emoji: '📋', description: '', slug: 'All', difficulty: '', questionCount: 0 },
    ...Array.from(new Set(questions.map(q => q.category))).map(cat => ({
      name: cat,
      japanese: '',
      emoji: '❓',
      description: '',
      slug: cat,
      difficulty: '',
      questionCount: questions.filter(q => q.category === cat).length,
    })),
  ];

  const filteredQuestions = questions.filter(q => {
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    const matchesSearch = 
      q.japanese_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.english_translation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this question?')) {
      alert('Delete functionality needs to be implemented');
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingQuestion(null);
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Save functionality needs to be implemented');
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingQuestion(null);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-[#8a8a8a] hover:text-[#d32f2f] mb-1">
              ← Back to Admin Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2d2d2d]">Manage Questions</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleLogout}
              className="text-sm text-[#8a8a8a] hover:text-[#d32f2f] px-3 py-1.5 rounded-lg hover:bg-[#f4c2c2]/20 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="card-cultural p-4 text-center">
            <div className="text-2xl font-bold text-[#d32f2f]">{questions.length}</div>
            <div className="text-xs text-[#8a8a8a]">Total Questions</div>
          </div>
          <div className="card-cultural p-4 text-center">
            <div className="text-2xl font-bold text-[#f59e0b]">{categories.filter(c => c.slug !== 'All').length}</div>
            <div className="text-xs text-[#8a8a8a]">Categories</div>
          </div>
          <div className="card-cultural p-4 text-center">
            <div className="text-2xl font-bold text-[#2e7d32]">{filteredQuestions.length}</div>
            <div className="text-xs text-[#8a8a8a]">Showing</div>
          </div>
          <div className="card-cultural p-4 text-center">
            <div className="text-2xl font-bold text-[#1976d2]">{questions.filter(q => q.category === 'Greetings').length}</div>
            <div className="text-xs text-[#8a8a8a]">Greetings</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-cultural p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold mb-1.5 text-[#5a5a5a]">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#d32f2f]"
              >
                {categories.map(cat => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold mb-1.5 text-[#5a5a5a]">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search questions..."
                className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#d32f2f]"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddNew}
                className="btn-torii px-4 py-2.5 text-sm whitespace-nowrap"
              >
                + Add Question
              </button>
            </div>
          </div>
        </div>

        {/* Question List */}
        <div className="space-y-3">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((q) => (
              <div key={q.id} className="card-cultural p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg mb-1 text-[#2d2d2d]">{q.japanese_text}</div>
                    <div className="text-sm text-[#5a5a5a] mb-1">{q.romaji}</div>
                    <div className="text-sm text-[#8a8a8a] mb-2 line-clamp-1">{q.english_translation}</div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-[#f4c2c2] text-[#d32f2f]">
                        {q.category}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#e8f5e9] text-[#2e7d32]">
                        {q.options.length} options
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:justify-end">
                    <button
                      onClick={() => handleEdit(q)}
                      className="px-4 py-2 bg-[#f59e0b] text-white rounded-lg text-sm hover:bg-[#f97316] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="px-4 py-2 bg-[#d32f2f] text-white rounded-lg text-sm hover:bg-[#b71c1c] transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 card-cultural">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-[#8a8a8a]">No questions found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card-cultural p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-[#2d2d2d]">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-[#5a5a5a]">Japanese Text</label>
                  <input
                    type="text"
                    defaultValue={editingQuestion?.japanese_text}
                    required
                    className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#d32f2f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-[#5a5a5a]">Romaji</label>
                  <input
                    type="text"
                    defaultValue={editingQuestion?.romaji}
                    required
                    className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#d32f2f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-[#5a5a5a]">English Translation</label>
                  <input
                    type="text"
                    defaultValue={editingQuestion?.english_translation}
                    required
                    className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#d32f2f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-[#5a5a5a]">Category</label>
                  <select
                    defaultValue={editingQuestion?.category || 'Greetings'}
                    className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#d32f2f]"
                  >
                    {categories.filter(c => c.slug !== 'All').map(cat => (
                      <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-[#5a5a5a]">Options (comma separated)</label>
                  <textarea
                    defaultValue={editingQuestion?.options?.join(', ')}
                    rows={3}
                    className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#d32f2f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-[#5a5a5a]">Correct Answer</label>
                  <input
                    type="text"
                    defaultValue={editingQuestion?.correct_answer}
                    required
                    className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#d32f2f]"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="btn-torii flex-1 py-2.5 text-sm">
                    {editingQuestion ? 'Update' : 'Add'} Question
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2.5 bg-[#8a8a8a] text-white rounded-xl text-sm hover:bg-[#616161] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}