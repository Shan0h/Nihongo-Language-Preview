'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { questions as initialQuestions, Category, Question } from '@/data/questions';
import Link from 'next/link';

interface GitStatus {
  hasChanges: boolean;
  hasQuestionChanges: boolean;
  branch: string;
  lastCommit: string;
  changedFiles: string[];
  environment?: 'local' | 'vercel-serverless';
  hasToken?: boolean;
}

export default function AdminQuestions() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [questionsList, setQuestionsList] = useState<Question[]>(initialQuestions);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [mediaFilter, setMediaFilter] = useState<'All' | 'Images' | 'Emojis'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Upload and Save states
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncingGit, setIsSyncingGit] = useState(false);
  const [autoPushToGit, setAutoPushToGit] = useState(true);
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formCategory, setFormCategory] = useState('Greetings');
  const [formJapaneseText, setFormJapaneseText] = useState('');
  const [formHiragana, setFormHiragana] = useState('');
  const [formRomaji, setFormRomaji] = useState('');
  const [formEnglish, setFormEnglish] = useState('');
  const [formOptions, setFormOptions] = useState('');
  const [formCorrectAnswer, setFormCorrectAnswer] = useState('');
  const [formEmoji, setFormEmoji] = useState('❓');
  const [formImageUrl, setFormImageUrl] = useState<string>('');

  // Selected file for upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast notifications
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  useEffect(() => {
    const adminAuth = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminAuth);
    if (adminAuth) {
      fetchQuestions();
      fetchGitStatus();
    }
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/admin/questions');
      const data = await res.json();
      if (data.success && Array.isArray(data.questions)) {
        setQuestionsList(data.questions);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    }
  };

  const fetchGitStatus = async () => {
    try {
      const res = await fetch('/api/admin/git-sync');
      const data = await res.json();
      if (data.success) {
        setGitStatus({
          hasChanges: data.hasChanges,
          hasQuestionChanges: data.hasQuestionChanges,
          branch: data.branch,
          lastCommit: data.lastCommit,
          changedFiles: data.changedFiles || [],
          environment: data.environment,
          hasToken: data.hasToken,
        });
      }
    } catch (err) {
      console.error('Failed to fetch git status:', err);
    }
  };

  const handleSyncGit = async (customMsg?: string) => {
    setIsSyncingGit(true);
    try {
      const res = await fetch('/api/admin/git-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: customMsg || 'Sync questions & uploaded images from Admin portal',
          questions: questionsList,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🚀 GitHub Sync Successful! (${data.commitHash || 'Updated'})`, 'success');
        fetchGitStatus();
      } else if (data.needsToken) {
        setShowTokenModal(true);
        showToast(data.error || 'GITHUB_TOKEN required in Vercel settings', 'info');
      } else {
        showToast(data.error || 'Failed to sync to GitHub', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error executing GitHub sync', 'error');
    } finally {
      setIsSyncingGit(false);
    }
  };

  const handleExportJson = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questionsList, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `questions-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast(`📥 Exported ${questionsList.length} questions to questions.json!`, 'success');
    } catch (err: any) {
      showToast('Failed to export questions: ' + err.message, 'error');
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0 && (parsed[0].japanese_text || parsed[0].id)) {
          setQuestionsList(parsed);
          showToast(`📥 Successfully imported ${parsed.length} questions from JSON! Click "Push to GitHub" to sync.`, 'success');
        } else {
          showToast('Invalid format. An array of question objects is required.', 'error');
        }
      } catch (err: any) {
        showToast('Failed to parse JSON file: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    setIsAdmin(false);
    router.push('/admin/login');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4">
        <div className="text-center max-w-sm w-full bg-white p-6 rounded-2xl shadow-md border border-[#f4c2c2]">
          <p className="text-xl mb-4 font-bold text-[#2d2d2d]">Access Denied</p>
          <p className="text-sm text-[#8a8a8a] mb-6">Please log in to manage questions.</p>
          <Link href="/admin/login" className="btn-torii w-full py-3 block text-center">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Categories list
  const categoryNames = Array.from(new Set(questionsList.map((q) => q.category)));
  const categories: Category[] = [
    { name: 'All', japanese: 'すべて', emoji: '📋', description: '', slug: 'All', difficulty: '', questionCount: questionsList.length },
    ...categoryNames.map((cat) => ({
      name: cat,
      japanese: '',
      emoji: '❓',
      description: '',
      slug: cat,
      difficulty: '',
      questionCount: questionsList.filter((q) => q.category === cat).length,
    })),
  ];

  // Filtering
  const filteredQuestions = questionsList.filter((q) => {
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    const matchesMedia =
      mediaFilter === 'All' ||
      (mediaFilter === 'Images' && !!q.imageUrl) ||
      (mediaFilter === 'Emojis' && !q.imageUrl);
    const matchesSearch =
      q.japanese_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.romaji.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.english_translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesMedia && matchesSearch;
  });

  const handleDelete = async (id: string, text: string) => {
    if (!confirm(`Are you sure you want to delete question "${text}" (${id})?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/questions?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Question deleted successfully', 'info');
        fetchQuestions();
        fetchGitStatus();
      } else {
        showToast(data.error || 'Failed to delete question', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting question', 'error');
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormCategory(question.category || 'Greetings');
    setFormJapaneseText(question.japanese_text || '');
    setFormHiragana(question.hiragana || question.japanese_text || '');
    setFormRomaji(question.romaji || '');
    setFormEnglish(question.english_translation || '');
    setFormOptions(question.options ? question.options.join(', ') : '');
    setFormCorrectAnswer(question.correct_answer || '');
    setFormEmoji(question.image || '❓');
    setFormImageUrl(question.imageUrl || '');
    setSelectedFile(null);
    setImagePreview(question.imageUrl || null);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingQuestion(null);
    setFormCategory(selectedCategory !== 'All' ? selectedCategory : 'Greetings');
    setFormJapaneseText('');
    setFormHiragana('');
    setFormRomaji('');
    setFormEnglish('');
    setFormOptions('');
    setFormCorrectAnswer('');
    setFormEmoji('🎌');
    setFormImageUrl('');
    setSelectedFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingQuestion(null);
    setSelectedFile(null);
    setImagePreview(null);
  };

  // Image file selection handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJapaneseText.trim() || !formCorrectAnswer.trim()) {
      showToast('Japanese Text and Correct Answer are required.', 'error');
      return;
    }

    setIsSaving(true);
    let finalImageUrl = formImageUrl;

    try {
      // 1. If a new file is chosen, upload it first
      if (selectedFile) {
        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        uploadData.append('category', formCategory);
        uploadData.append('questionId', editingQuestion?.id || formCategory.toLowerCase());

        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          body: uploadData,
        });
        const uploadResult = await uploadRes.json();

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload image file');
        }

        finalImageUrl = uploadResult.imageUrl;
        setIsUploading(false);
      }

      // Parse options
      const optionsArray = formOptions
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (optionsArray.length > 0 && !optionsArray.includes(formCorrectAnswer.trim())) {
        optionsArray.push(formCorrectAnswer.trim());
      }

      // 2. Save Question
      const questionPayload: Partial<Question> = {
        id: editingQuestion?.id,
        category: formCategory,
        japanese_text: formJapaneseText.trim(),
        hiragana: formHiragana.trim() || formJapaneseText.trim(),
        romaji: formRomaji.trim(),
        english_translation: formEnglish.trim(),
        options: optionsArray,
        correct_answer: formCorrectAnswer.trim(),
        image: formEmoji.trim() || '❓',
        imageUrl: finalImageUrl.trim() ? finalImageUrl.trim() : undefined,
      };

      const saveRes = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionPayload }),
      });
      const saveResult = await saveRes.json();

      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save question');
      }

      showToast(
        editingQuestion ? 'Question updated successfully!' : 'New question added successfully!',
        'success'
      );

      setShowForm(false);
      setEditingQuestion(null);
      setSelectedFile(null);
      setImagePreview(null);
      await fetchQuestions();
      await fetchGitStatus();

      // 3. Auto-push to GitHub if checked
      if (autoPushToGit) {
        handleSyncGit(
          `Update question "${formJapaneseText.trim()}" (${formCategory})`
        );
      }
    } catch (err: any) {
      console.error('Save error:', err);
      showToast(err.message || 'An error occurred while saving', 'error');
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-4 sm:p-6 text-[#2d2d2d]">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-semibold transition-all transform duration-300 animate-in fade-in slide-in-from-top-4 ${
            notification.type === 'success'
              ? 'bg-[#1b4332] text-white border-[#40916c]'
              : notification.type === 'error'
              ? 'bg-[#9d0208] text-white border-[#d00000]'
              : 'bg-[#1976d2] text-white border-[#42a5f5]'
          }`}
        >
          <span>{notification.type === 'success' ? '✅' : notification.type === 'error' ? '⚠️' : 'ℹ️'}</span>
          <span>{notification.message}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-sm text-[#8a8a8a] hover:text-[#d32f2f] mb-1 font-medium transition-colors"
            >
              ← Back to Admin Dashboard
            </Link>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2d2d2d]">Manage Questions</h1>
              <span className="bg-[#f4c2c2]/50 text-[#d32f2f] text-xs px-2.5 py-1 rounded-full font-bold">
                Admin Studio
              </span>
            </div>
          </div>

          {/* Action Buttons: Export/Import, GitHub Sync & Logout */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Export JSON button */}
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-[#e5e5e5] bg-white hover:bg-stone-50 text-stone-700 transition-all shadow-xs"
              title="Download questions.json backup to your computer"
            >
              <span>📥</span>
              <span>Export JSON</span>
            </button>

            {/* Import JSON button */}
            <label
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-[#e5e5e5] bg-white hover:bg-stone-50 text-stone-700 transition-all shadow-xs cursor-pointer"
              title="Upload and load a questions.json file"
            >
              <span>📤</span>
              <span>Import JSON</span>
              <input
                ref={jsonFileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportJson}
              />
            </label>

            {/* GitHub Sync Button */}
            <button
              onClick={() => handleSyncGit()}
              disabled={isSyncingGit}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all ${
                isSyncingGit
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : gitStatus?.hasChanges
                  ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                  : 'bg-[#24292e] hover:bg-[#1a1e22] text-white'
              }`}
              title="Sync all question updates and uploaded assets directly to GitHub"
            >
              {isSyncingGit ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Pushing to GitHub...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Push to GitHub</span>
                  {gitStatus?.hasChanges && (
                    <span className="w-2 h-2 rounded-full bg-yellow-300"></span>
                  )}
                </>
              )}
            </button>

            {/* Setup Cloud Sync helper button if in serverless without token */}
            {gitStatus?.environment === 'vercel-serverless' && !gitStatus?.hasToken && (
              <button
                onClick={() => setShowTokenModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-colors shadow-xs"
                title="Setup GitHub Token in Vercel for 1-click cloud sync"
              >
                <span>⚙️</span>
                <span>Setup Cloud Sync</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="text-xs sm:text-sm text-[#8a8a8a] hover:text-[#d32f2f] px-3 py-2 rounded-lg hover:bg-[#f4c2c2]/20 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Git & Status Info Banner */}
        {gitStatus && (
          <div className="mb-6 p-3.5 rounded-xl bg-white border border-[#f4c2c2]/80 shadow-sm flex flex-wrap items-center justify-between text-xs text-[#5a5a5a] gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                <strong>Env:</strong> {gitStatus.environment === 'vercel-serverless' ? '☁️ Vercel Serverless' : '💻 Local Dev'}
              </span>
              <span className="text-[#8a8a8a]">|</span>
              <span className="flex items-center gap-1.5 font-mono">
                <strong>Branch:</strong> {gitStatus.branch}
              </span>
              <span className="text-[#8a8a8a]">|</span>
              <span className="truncate max-w-md font-mono" title={gitStatus.lastCommit}>
                <strong>Commit:</strong> {gitStatus.lastCommit}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {gitStatus.environment === 'vercel-serverless' ? (
                gitStatus.hasToken ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                    ✅ GitHub API Token Ready
                  </span>
                ) : (
                  <button
                    onClick={() => setShowTokenModal(true)}
                    className="px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>⚠️</span>
                    <span>GITHUB_TOKEN Required (Click to Setup)</span>
                  </button>
                )
              ) : gitStatus.hasChanges ? (
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold">
                  ⚠️ Uncommitted Changes Ready to Push
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                  ✨ Repos Up to Date
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="card-cultural p-4 text-center">
            <div className="text-2xl font-bold text-[#d32f2f]">{questionsList.length}</div>
            <div className="text-xs text-[#8a8a8a]">Total Questions</div>
          </div>
          <div className="card-cultural p-4 text-center">
            <div className="text-2xl font-bold text-[#f59e0b]">
              {questionsList.filter((q) => !!q.imageUrl).length}
            </div>
            <div className="text-xs text-[#8a8a8a]">With Custom Pictures</div>
          </div>
          <div className="card-cultural p-4 text-center">
            <div className="text-2xl font-bold text-[#2e7d32]">
              {questionsList.filter((q) => !q.imageUrl).length}
            </div>
            <div className="text-xs text-[#8a8a8a]">Emoji Only</div>
          </div>
          <div className="card-cultural p-4 text-center">
            <div className="text-2xl font-bold text-[#1976d2]">{filteredQuestions.length}</div>
            <div className="text-xs text-[#8a8a8a]">Matching Filter</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-cultural p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="w-full md:w-1/4">
              <label className="block text-xs font-semibold mb-1.5 text-[#5a5a5a]">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#d32f2f] bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name} ({cat.questionCount})
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-1/4">
              <label className="block text-xs font-semibold mb-1.5 text-[#5a5a5a]">Media Type</label>
              <select
                value={mediaFilter}
                onChange={(e) => setMediaFilter(e.target.value as any)}
                className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#d32f2f] bg-white"
              >
                <option value="All">All Types (🖼️ & ✨)</option>
                <option value="Images">🖼️ Has Picture Uploaded</option>
                <option value="Emojis">✨ Emoji Only</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-semibold mb-1.5 text-[#5a5a5a]">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Japanese, Romaji, English, or ID..."
                className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#d32f2f] bg-white"
              >
              </input>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleAddNew}
                className="btn-torii px-5 py-2.5 text-sm whitespace-nowrap w-full md:w-auto shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>➕</span>
                <span>Add Question</span>
              </button>
            </div>
          </div>
        </div>

        {/* Question List */}
        <div className="space-y-3">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="card-cultural p-4 hover:shadow-md transition-all border border-[#f4c2c2]/40 hover:border-[#d32f2f]/40"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Image / Thumbnail + Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Picture preview or emoji box */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#fff5f5] border-2 border-[#f4c2c2] flex items-center justify-center flex-shrink-0 relative group shadow-sm">
                      {q.imageUrl ? (
                        <img
                          src={q.imageUrl}
                          alt={q.japanese_text}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            // Fallback if image fails
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.querySelector('.fallback-emoji')?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <span
                        className={`text-2xl fallback-emoji ${
                          q.imageUrl ? 'hidden' : 'block'
                        }`}
                      >
                        {q.image || '❓'}
                      </span>
                    </div>

                    {/* Question details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-lg text-[#2d2d2d] tracking-wide">
                          {q.japanese_text}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#f4c2c2]/50 text-[#d32f2f] font-semibold">
                          {q.category}
                        </span>
                        {q.imageUrl ? (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                            🖼️ Picture
                          </span>
                        ) : (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                            ✨ Emoji
                          </span>
                        )}
                        <span className="text-[11px] text-[#8a8a8a] font-mono">#{q.id}</span>
                      </div>

                      <div className="text-sm font-medium text-[#5a5a5a] mb-0.5">{q.romaji}</div>
                      <div className="text-sm text-[#8a8a8a] line-clamp-1 mb-2">
                        {q.english_translation}
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-[#e8f5e9] text-[#2e7d32] font-medium">
                          ✓ Correct: {q.correct_answer}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                          {q.options?.length || 0} choices
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 sm:justify-end w-full sm:w-auto">
                    <button
                      onClick={() => handleEdit(q)}
                      className="flex-1 sm:flex-initial px-4 py-2 bg-[#f59e0b] text-white rounded-xl text-sm font-bold hover:bg-[#d97706] transition-colors shadow-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(q.id, q.japanese_text)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-bold hover:bg-red-200 transition-colors"
                      title="Delete question"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 card-cultural">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-[#8a8a8a] font-medium">No questions found matching your filter.</p>
            </div>
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
            <div className="card-cultural p-6 sm:p-7 w-full max-w-2xl max-h-[92vh] overflow-y-auto my-auto shadow-2xl border-2 border-[#f4c2c2]">
              <div className="flex items-center justify-between pb-3 border-b border-[#f4c2c2]/50 mb-5">
                <div>
                  <h2 className="text-xl font-bold text-[#2d2d2d]">
                    {editingQuestion ? 'Edit Question' : 'Add New Question'}
                  </h2>
                  <p className="text-xs text-[#8a8a8a]">
                    {editingQuestion
                      ? `Updating question #${editingQuestion.id}`
                      : 'Create a new question with picture upload and GitHub sync'}
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {/* 1. PICTURE UPLOAD SECTION */}
                <div className="p-4 rounded-2xl bg-[#fff8f8] border-2 border-[#f4c2c2]">
                  <label className="block text-sm font-bold text-[#d32f2f] mb-1.5 flex items-center gap-1.5">
                    <span>🖼️</span> Question Picture
                  </label>
                  <p className="text-xs text-[#5a5a5a] mb-3">
                    Upload an illustration or photo (JPG, PNG, WebP, SVG). Files are saved to your repository and committed to GitHub.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Preview Box */}
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl border-2 border-dashed border-[#f4c2c2] bg-white overflow-hidden flex items-center justify-center relative flex-shrink-0 shadow-inner">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Question Preview"
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <div className="text-center p-2 text-[#8a8a8a]">
                          <span className="text-2xl block mb-1">📷</span>
                          <span className="text-[11px] block">No Picture</span>
                        </div>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                        onChange={handleFileChange}
                        className="hidden"
                        id="question-image-upload"
                      />

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-[#d32f2f] hover:bg-[#b71c1c] text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                        >
                          <span>📁</span>
                          <span>{imagePreview ? 'Change Picture' : 'Upload Picture'}</span>
                        </button>

                        {imagePreview && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-semibold transition-colors"
                          >
                            Remove Picture
                          </button>
                        )}
                      </div>

                      {selectedFile && (
                        <p className="text-xs text-[#2e7d32] font-semibold">
                          Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </p>
                      )}

                      {/* Manual Image Path Input */}
                      <div className="pt-1">
                        <label className="block text-[11px] text-[#8a8a8a] mb-0.5">
                          Or direct image path:
                        </label>
                        <input
                          type="text"
                          value={formImageUrl}
                          onChange={(e) => {
                            setFormImageUrl(e.target.value);
                            if (!selectedFile) {
                              setImagePreview(e.target.value.trim() || null);
                            }
                          }}
                          placeholder="/images/questions/category/example.jpg"
                          className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#d32f2f] bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. CATEGORY & FALLBACK EMOJI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#5a5a5a]">
                      Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#d32f2f] bg-white"
                    >
                      {categories
                        .filter((c) => c.slug !== 'All')
                        .map((cat) => (
                          <option key={cat.slug} value={cat.slug}>
                            {cat.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#5a5a5a]">
                      Fallback Emoji (when image unavailable)
                    </label>
                    <input
                      type="text"
                      value={formEmoji}
                      onChange={(e) => setFormEmoji(e.target.value)}
                      maxLength={4}
                      placeholder="🎌"
                      className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#d32f2f] bg-white"
                    />
                  </div>
                </div>

                {/* 3. TEXT FIELDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#5a5a5a]">
                      Japanese Text (Kanji / Kana) *
                    </label>
                    <input
                      type="text"
                      value={formJapaneseText}
                      onChange={(e) => {
                        setFormJapaneseText(e.target.value);
                        if (!formHiragana) setFormHiragana(e.target.value);
                      }}
                      required
                      placeholder="例: こんにちは"
                      className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#d32f2f] bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#5a5a5a]">
                      Hiragana (Reading)
                    </label>
                    <input
                      type="text"
                      value={formHiragana}
                      onChange={(e) => setFormHiragana(e.target.value)}
                      placeholder="例: こんにちは"
                      className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#d32f2f] bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#5a5a5a]">
                      Romaji
                    </label>
                    <input
                      type="text"
                      value={formRomaji}
                      onChange={(e) => setFormRomaji(e.target.value)}
                      placeholder="例: Konnichiwa"
                      className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#d32f2f] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#5a5a5a]">
                      English Translation *
                    </label>
                    <input
                      type="text"
                      value={formEnglish}
                      onChange={(e) => setFormEnglish(e.target.value)}
                      required
                      placeholder="例: Hello / Good afternoon"
                      className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#d32f2f] bg-white"
                    />
                  </div>
                </div>

                {/* 4. CHOICES & CORRECT ANSWER */}
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#5a5a5a]">
                    Choices / Options (comma separated)
                  </label>
                  <textarea
                    value={formOptions}
                    onChange={(e) => setFormOptions(e.target.value)}
                    rows={2}
                    placeholder="こんにちは, こんばんは, おはよう, さようなら"
                    className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#d32f2f] bg-white"
                  />
                  <p className="text-[11px] text-[#8a8a8a] mt-0.5">
                    Separate multiple choices with commas. The correct answer must be one of them.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#5a5a5a]">
                    Correct Answer *
                  </label>
                  <input
                    type="text"
                    value={formCorrectAnswer}
                    onChange={(e) => setFormCorrectAnswer(e.target.value)}
                    required
                    placeholder="例: こんにちは"
                    className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#d32f2f] bg-white font-semibold text-[#2e7d32]"
                  />
                </div>

                {/* 5. GITHUB AUTO-PUSH TOGGLE */}
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoPushToGit}
                      onChange={(e) => setAutoPushToGit(e.target.checked)}
                      className="w-4 h-4 rounded text-[#d32f2f] focus:ring-[#d32f2f]"
                    />
                    <span className="font-semibold text-amber-900">
                      ⚡ Automatically commit & push changes to GitHub after saving
                    </span>
                  </label>
                  <span className="text-[10px] text-amber-700 font-mono hidden sm:inline">
                    origin/main
                  </span>
                </div>

                {/* Modal Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving || isUploading}
                    className="btn-torii flex-1 py-3 text-sm font-bold shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Uploading Picture...</span>
                      </>
                    ) : isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving Question...</span>
                      </>
                    ) : (
                      <>
                        <span>💾</span>
                        <span>{editingQuestion ? 'Update Question' : 'Add Question'}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving || isUploading}
                    className="px-5 py-3 bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* GitHub Cloud Sync Setup Modal */}
        {showTokenModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-rose-200 animate-in zoom-in-95 duration-200 text-[#2d2d2d]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">⚙️</span>
                  <div>
                    <h3 className="text-lg font-bold text-[#2d2d2d]">Setup GitHub Cloud Sync</h3>
                    <p className="text-xs text-[#8a8a8a]">Enable 1-click updates on Vercel</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTokenModal(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-sm transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/70 text-xs text-amber-900 mb-4">
                <strong>Why is this needed?</strong> Vercel runs in cloud serverless containers where the terminal <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">git</code> command does not exist. Adding a GitHub Token allows this app to commit questions directly to your repository via GitHub&apos;s REST API!
              </div>

              <div className="space-y-3 text-xs mb-5">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/80">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <div>
                    <p className="font-bold text-stone-800">Generate a GitHub Personal Access Token</p>
                    <p className="text-stone-600 mt-0.5">
                      Go to GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic). Create a token with <strong className="font-mono text-rose-700">repo</strong> scope checked.
                    </p>
                    <a
                      href="https://github.com/settings/tokens/new?scopes=repo&description=Nihongo+Vercel+Sync"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-rose-600 hover:underline font-semibold mt-1"
                    >
                      <span>Create Token on GitHub</span>
                      <span>↗</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/80">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <div>
                    <p className="font-bold text-stone-800">Add to Vercel Environment Variables</p>
                    <p className="text-stone-600 mt-0.5">
                      In your Vercel Project Dashboard → <strong>Settings</strong> → <strong>Environment Variables</strong>:
                    </p>
                    <div className="mt-1 font-mono bg-stone-200/70 px-2 py-1 rounded text-[11px] text-stone-800 select-all">
                      GITHUB_TOKEN = ghp_your_token_here
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/80">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                  <div>
                    <p className="font-bold text-stone-800">Click Push to GitHub</p>
                    <p className="text-stone-600 mt-0.5">
                      Once added, clicking <strong>&quot;Push to GitHub&quot;</strong> will commit directly to GitHub, and Vercel will automatically redeploy!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="text-xs font-bold text-stone-700 hover:text-[#d32f2f] flex items-center gap-1"
                >
                  <span>📥</span>
                  <span>Export JSON Backup</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowTokenModal(false)}
                  className="px-5 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}