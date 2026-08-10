import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "../components/TopBar";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from "../api/categories";
import { parseErrorMessage } from "../api/axios";
import { SkeletonCard } from "../components/Skeleton";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true
  });

  // Feedback & Toast
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [errorMessage, setErrorMessage] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast({ message: "", type: "success" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.message]);

  const fetchCategoryList = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await getCategories({ all: "true" });
      if (res && res.success) {
        setCategories(res.data || []);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Failed to load staff categories:", err);
      const friendly = parseErrorMessage(err, "Unable to fetch staff categories from server.");
      setErrorMessage(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryList();
  }, []);

  const openAddModal = () => {
    setSelectedCategory(null);
    setFormData({ name: "", description: "", isActive: true });
    setIsFormModalOpen(true);
  };

  const openEditModal = (cat) => {
    setSelectedCategory(cat);
    setFormData({
      name: cat.name || "",
      description: cat.description || "",
      isActive: cat.isActive !== undefined ? cat.isActive : true
    });
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (cat) => {
    setSelectedCategory(cat);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Category name is required.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedCategory) {
        const id = selectedCategory._id || selectedCategory.slug;
        const res = await updateCategory(id, formData);
        showToast(`Category "${res.data?.name || formData.name}" updated successfully!`, "success");
      } else {
        const res = await createCategory(formData);
        showToast(`Category "${res.data?.name || formData.name}" created successfully!`, "success");
      }
      setIsFormModalOpen(false);
      setSelectedCategory(null);
      await fetchCategoryList();
    } catch (err) {
      console.error("Failed to save category:", err);
      const friendly = parseErrorMessage(err, "Failed to save staff category.");
      showToast(friendly, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;
    setIsSubmitting(true);
    try {
      const id = selectedCategory._id || selectedCategory.slug;
      await deleteCategory(id);
      showToast(`Category "${selectedCategory.name}" removed successfully.`, "success");
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
      await fetchCategoryList();
    } catch (err) {
      console.error("Failed to delete category:", err);
      const friendly = parseErrorMessage(err, "Failed to remove staff category.");
      showToast(friendly, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col flex-grow w-full">
      <TopBar
        placeholder="Search staff categories..."
        searchValue={searchTerm}
        onSearchChange={(val) => setSearchTerm(val)}
      />

      <div className="p-gutter w-full space-y-gutter flex-grow">
        {/* Header */}
        <div className="header-bar flex items-end justify-between flex-wrap gap-4 border-b border-outline-variant/20 pb-4 select-none">
          <div className="header-title space-y-1">
            <h1 className="text-headline-md font-headline-md text-on-surface font-extrabold tracking-tight">
              Doctor &amp; Staff Categories
            </h1>
            <p className="text-body-md text-on-surface-variant opacity-80">
              Manage dynamic clinical practitioner and staff role classifications across the clinic.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAddModal}
            className="bg-primary text-on-primary py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 font-semibold hover:opacity-95 transition-opacity shadow-md cursor-pointer text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Add Staff Category</span>
          </motion.button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span className="font-medium">{errorMessage}</span>
            </div>
            <button
              onClick={fetchCategoryList}
              className="px-3.5 py-1.5 bg-error text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Category Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-outline-variant/30 flex flex-col items-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[36px]">category</span>
            </div>
            <h3 className="text-title-lg font-bold text-on-surface">No Categories Found</h3>
            <p className="text-body-md text-on-surface-variant max-w-sm">
              Create dynamic staff categories to organize doctors, hygienists, and specialists.
            </p>
            <button
              onClick={openAddModal}
              className="mt-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold shadow-xs hover:opacity-90"
            >
              Create Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
            {filteredCategories.map((cat) => (
              <div
                key={cat._id || cat.slug}
                className="glass-card rounded-2xl p-5 border border-outline-variant/30 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                      {cat.name}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        cat.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-surface-container text-on-surface-variant opacity-70"
                      }`}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant line-clamp-3 mb-4">
                    {cat.description || "No description provided."}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/20">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    title="Edit Category"
                  >
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button
                    onClick={() => openDeleteModal(cat)}
                    className="p-2 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-2xl border border-outline-variant/30 p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <h3 className="text-title-lg font-bold text-on-surface">
                  {selectedCategory ? "Edit Staff Category" : "Add Staff Category"}
                </h3>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Periodontist, Implantologist"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of this clinical role classification..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveCat"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-primary border-outline-variant focus:ring-primary"
                  />
                  <label htmlFor="isActiveCat" className="text-sm font-medium text-on-surface cursor-pointer select-none">
                    Active (visible in dropdowns and filters)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-on-primary shadow-md hover:opacity-90 disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : selectedCategory ? "Update Category" : "Create Category"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-2xl border border-outline-variant/30 p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-error">
                <span className="material-symbols-outlined text-[28px]">warning</span>
                <h3 className="text-title-md font-bold text-on-surface">Delete Category?</h3>
              </div>
              <p className="text-body-sm text-on-surface-variant">
                Are you sure you want to delete <strong className="text-on-surface">{selectedCategory.name}</strong>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-error text-white shadow-md hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Feedback */}
      <AnimatePresence>
        {toast.message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 text-sm font-semibold ${
              toast.type === "error"
                ? "bg-error text-white border-error-container"
                : "bg-emerald-600 text-white border-emerald-500"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {toast.type === "error" ? "error" : "check_circle"}
            </span>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
