'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { categories, Category } from '@/data/questions';
import Link from 'next/link';

export default function AdminCategories() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isAdmin') === 'true';
    }
    return false;
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

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

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this category?')) {
      alert('Delete functionality needs to be implemented');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Save functionality needs to be implemented');
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
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
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2d2d2d]">Manage Categories</h1>
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
        <div className="card-cultural p-4 mb-6 bg-gradient-to-br from-white to-[#fff5f5]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-[#d32f2f]">{categories.length}</div>
              <div className="text-xs text-[#8a8a8a]">Total Categories</div>
            </div>
            <div className="text-4xl">📂</div>
          </div>
        </div>

        {/* Add Category Button */}
        <div className="mb-6">
          <button
            onClick={handleAddNew}
            className="btn-torii px-4 py-2.5 text-sm"
          >
            + Add Category
          </button>
        </div>

        {/* Categories List */}
        <div className="space-y-3">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <div key={cat.slug} className="card-cultural p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#f4c2c2] text-3xl flex items-center justify-center flex-shrink-0">
                      {cat.emoji}
                    </div>
                    <div>
                      <div className="font-bold text-lg text-[#2d2d2d]">{cat.name}</div>
                      <div className="text-sm text-[#5a5a5a]">{cat.japanese}</div>
                      <div className="text-xs text-[#8a8a8a] mt-1">
                        {cat.questionCount} questions • {cat.difficulty}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:justify-end">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="px-4 py-2 bg-[#f59e0b] text-white rounded-lg text-sm hover:bg-[#f97316] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete()}
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
              <div className="text-4xl mb-3">📂</div>
              <p className="text-[#8a8a8a]">No categories found.</p>
            </div>
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card-cultural p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-[#2d2d2d]">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-[#5a5a5a]">Category Name</label>
                  <input
                    type="text"
                    defaultValue={editingCategory?.name}
                    required
                    className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#d32f2f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-[#5a5a5a]">Japanese Name</label>
                  <input
                    type="text"
                    defaultValue={editingCategory?.japanese}
                    required
                    className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#d32f2f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-[#5a5a5a]">Emoji</label>
                  <input
                    type="text"
                    defaultValue={editingCategory?.emoji}
                    maxLength={2}
                    className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2.5 text-center text-xl focus:outline-none focus:border-[#d32f2f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-[#5a5a5a]">Difficulty</label>
                  <select
                    defaultValue={editingCategory?.difficulty || 'Easy'}
                    className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#d32f2f]"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="btn-torii flex-1 py-2.5 text-sm">
                    {editingCategory ? 'Update' : 'Add'} Category
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