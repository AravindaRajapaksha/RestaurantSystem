import React, { useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, X, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFoods } from '../context/FoodsContext';
import { useToast } from '../context/ToastContext';
import './AdminManageItems.css';

const EMPTY_FORM = {
  name: '',
  category: '',
  price: '',
  description: '',
  image: '',
  is_featured_offer: false,
  offer_title: '',
  offer_description: '',
  discount_percent: '',
};

const CATEGORIES = ['Burger', 'Pizza', 'Salad', 'Appetizer', 'Dessert', 'Sides', 'Drinks', 'Kottu', 'Rice', 'Other'];

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Unable to read this image file.'));
    reader.readAsDataURL(file);
  });

const AdminManageItems = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { foods, loading, error, addFood, updateFood, deleteFood } = useFoods();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('items');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  if (authLoading) {
    return null;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin-login" />;
  }

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featuredOffers = foods.filter((food) => food.is_featured_offer);

  const openAdd = () => {
    setEditingFood(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (food) => {
    setEditingFood(food);
    setForm({
      name: food.name,
      category: food.category,
      price: String(food.price),
      description: food.description,
      image: food.image || '',
      is_featured_offer: Boolean(food.is_featured_offer),
      offer_title: food.offer_title || '',
      offer_description: food.offer_description || '',
      discount_percent: food.discount_percent ? String(food.discount_percent) : '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingFood(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitting(false);
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = 'Name is required.';
    if (!form.category) nextErrors.category = 'Select an item type.';
    if (!form.price || Number.isNaN(Number(form.price)) || Number(form.price) <= 0) {
      nextErrors.price = 'Enter a valid price.';
    }
    if (!form.description.trim()) nextErrors.description = 'Description is required.';
    if (!form.image.trim()) nextErrors.image = 'Photo URL or uploaded image is required.';

    if (form.is_featured_offer) {
      if (!form.offer_title.trim()) nextErrors.offer_title = 'Offer title is required.';
      if (!form.offer_description.trim()) nextErrors.offer_description = 'Offer description is required.';
      if (!form.discount_percent || Number.isNaN(Number(form.discount_percent)) || Number(form.discount_percent) <= 0) {
        nextErrors.discount_percent = 'Enter a valid discount percentage.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    const payload = {
      name: form.name,
      category: form.category,
      price: Number(Number(form.price).toFixed(2)),
      description: form.description,
      image: form.image,
      is_featured_offer: form.is_featured_offer,
      offer_title: form.is_featured_offer ? form.offer_title : null,
      offer_description: form.is_featured_offer ? form.offer_description : null,
      discount_percent: form.is_featured_offer ? Number(form.discount_percent) : null,
    };

    try {
      if (editingFood) {
        await updateFood(editingFood.id, payload);
        addToast(`"${payload.name}" updated successfully!`, 'info', 'EDIT');
      } else {
        await addFood(payload);
        addToast(`"${payload.name}" added to menu!`, 'success', 'OK');
      }
      closeModal();
    } catch (actionError) {
      addToast(actionError.message || 'Unable to save this menu item.', 'error', 'ERR');
      setSubmitting(false);
    }
  };

  const handleDelete = async (food) => {
    if (!window.confirm(`Delete "${food.name}" from the menu?`)) {
      return;
    }

    try {
      await deleteFood(food.id);
      addToast(`"${food.name}" removed from menu.`, 'error', 'DEL');
    } catch (actionError) {
      addToast(actionError.message || 'Unable to delete this menu item.', 'error', 'ERR');
    }
  };

  const handleFileDrop = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Please upload an image file.' }));
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((prev) => ({ ...prev, image: dataUrl }));
      setErrors((prev) => ({ ...prev, image: '' }));
    } catch (uploadError) {
      addToast(uploadError.message || 'Unable to upload this image.', 'error', 'ERR');
    }
  };

  const handleFileChange = async (event) => {
    const [file] = event.target.files || [];
    await handleFileDrop(file);
  };

  return (
    <div className="admin-manage-page container section animate-fade-in">
      <div className="admin-header mb-5">
        <div>
          <h1>Manage Menu Items</h1>
          <p className="text-secondary">
            {foods.length} item{foods.length !== 1 ? 's' : ''} on the menu
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openAdd}>
          <Plus size={18} /> Add New Item
        </button>
      </div>

      <div className="admin-tab-row mb-4">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          Menu Items
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'offers' ? 'active' : ''}`}
          onClick={() => setActiveTab('offers')}
        >
          Offers and Deals
        </button>
      </div>

      {activeTab === 'items' && (
        <div className="manage-controls mb-4">
          <div className="search-bar glass-panel">
            <Search size={20} className="text-muted" />
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm && (
              <button type="button" className="search-clear" onClick={() => setSearchTerm('')}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="glass panel mb-4">
          <p className="text-secondary">Loading menu items from database...</p>
        </div>
      )}

      {error && (
        <div className="glass panel mb-4">
          <p style={{ color: 'var(--danger)' }}>Database error: {error}</p>
        </div>
      )}

      {activeTab === 'items' ? (
        <div className="glass panel table-responsive">
          <table className="admin-table w-100">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFoods.map((food) => (
                <tr key={food.id}>
                  <td>
                    <img src={food.image} alt={food.name} className="item-thumbnail" />
                  </td>
                  <td>
                    <span className="font-bold">{food.name}</span>
                    <p className="item-desc-preview">{food.description}</p>
                    {food.is_featured_offer && (
                      <span className="offer-pill">
                        <Tag size={12} /> Deal Active
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-category">{food.category}</span>
                  </td>
                  <td className="text-brand font-bold">${food.price.toFixed(2)}</td>
                  <td className="text-right">
                    <div className="action-buttons">
                      <button type="button" className="icon-btn btn-edit" title="Edit" onClick={() => openEdit(food)}>
                        <Edit2 size={18} />
                      </button>
                      <button type="button" className="icon-btn btn-delete" title="Delete" onClick={() => handleDelete(food)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredFoods.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center p-5 text-muted">
                    No items found. Try a different search term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="offers-admin-grid">
          {featuredOffers.map((food) => (
            <div key={food.id} className="offer-admin-card glass">
              <img src={food.image} alt={food.name} className="offer-admin-image" />
              <div className="offer-admin-body">
                <div className="offer-admin-top">
                  <span className="offer-badge-admin">{food.discount_percent || 0}% OFF</span>
                  <span className="offer-admin-type">{food.category}</span>
                </div>
                <h3>{food.offer_title || food.name}</h3>
                <p>{food.offer_description || food.description}</p>
                <div className="offer-admin-footer">
                  <span className="text-brand">Base price: ${food.price.toFixed(2)}</span>
                  <button type="button" className="btn btn-outline" onClick={() => openEdit(food)}>
                    Edit Offer
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!loading && featuredOffers.length === 0 && (
            <div className="glass panel p-5">
              <h3>No active deals yet</h3>
              <p className="text-secondary">Add a menu item and enable the offer switch to make it appear here and on the home page.</p>
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box glass" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{editingFood ? 'Edit Item' : 'Add New Item'}</h3>
                <p className="text-secondary">Choose the item type, set the price, upload a photo URL, and optionally create a deal.</p>
              </div>
              <button type="button" className="modal-close" onClick={closeModal}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Item Name *</label>
                <input
                  type="text"
                  className={`input-base ${errors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Spicy Chicken Burger"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Item Type *</label>
                  <select
                    className={`input-base ${errors.category ? 'input-error' : ''}`}
                    value={form.category}
                    onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                  >
                    <option value="">Select item type...</option>
                    {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                  {errors.category && <span className="error-msg">{errors.category}</span>}
                </div>

                <div className="form-group">
                  <label>Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={`input-base ${errors.price ? 'input-error' : ''}`}
                    placeholder="e.g. 9.99"
                    value={form.price}
                    onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                  />
                  {errors.price && <span className="error-msg">{errors.price}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  rows={3}
                  className={`input-base ${errors.description ? 'input-error' : ''}`}
                  placeholder="Short description of the dish..."
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                />
                {errors.description && <span className="error-msg">{errors.description}</span>}
              </div>

              <div className="form-group">
                <label>Photo URL or Upload *</label>
                <input
                  type="url"
                  className={`input-base ${errors.image ? 'input-error' : ''}`}
                  placeholder="https://images.unsplash.com/..."
                  value={form.image}
                  onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))}
                />
                <div
                  className={`image-dropzone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                  }}
                  onDrop={async (event) => {
                    event.preventDefault();
                    setDragActive(false);
                    const [file] = event.dataTransfer.files || [];
                    await handleFileDrop(file);
                  }}
                >
                  <p>Drag and drop a photo here</p>
                  <span>or</span>
                  <button
                    type="button"
                    className="btn btn-outline dropzone-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose Image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden-file-input"
                    onChange={handleFileChange}
                  />
                </div>
                {errors.image && <span className="error-msg">{errors.image}</span>}
                {form.image && !errors.image && (
                  <img src={form.image} alt="preview" className="img-preview" onError={(event) => { event.target.style.display = 'none'; }} />
                )}
              </div>

              <div className="offer-settings glass-panel">
                <label className="offer-toggle">
                  <input
                    type="checkbox"
                    checked={form.is_featured_offer}
                    onChange={(event) => setForm((prev) => ({ ...prev, is_featured_offer: event.target.checked }))}
                  />
                  <span>Display this item in the Offers tab and home deals section</span>
                </label>

                {form.is_featured_offer && (
                  <>
                    <div className="form-group">
                      <label>Offer Title *</label>
                      <input
                        type="text"
                        className={`input-base ${errors.offer_title ? 'input-error' : ''}`}
                        placeholder="e.g. Weekend Pizza Deal"
                        value={form.offer_title}
                        onChange={(event) => setForm((prev) => ({ ...prev, offer_title: event.target.value }))}
                      />
                      {errors.offer_title && <span className="error-msg">{errors.offer_title}</span>}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Discount % *</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          className={`input-base ${errors.discount_percent ? 'input-error' : ''}`}
                          placeholder="e.g. 20"
                          value={form.discount_percent}
                          onChange={(event) => setForm((prev) => ({ ...prev, discount_percent: event.target.value }))}
                        />
                        {errors.discount_percent && <span className="error-msg">{errors.discount_percent}</span>}
                      </div>

                      <div className="form-group">
                        <label>Offer Copy *</label>
                        <input
                          type="text"
                          className={`input-base ${errors.offer_description ? 'input-error' : ''}`}
                          placeholder="e.g. Get 20% off all weekend"
                          value={form.offer_description}
                          onChange={(event) => setForm((prev) => ({ ...prev, offer_description: event.target.value }))}
                        />
                        {errors.offer_description && <span className="error-msg">{errors.offer_description}</span>}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingFood ? 'Save Changes' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManageItems;
