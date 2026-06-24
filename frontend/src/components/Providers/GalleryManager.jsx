import React, { useState, useEffect } from "react";
import api from "../../services/api.js";
import { toast } from "react-toastify";
import { TrashIcon, PlusIcon, PhotoIcon, PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

const GALLERY_LIMIT = 20;

function detectUrlType(url) {
  if (!url || !url.trim()) return null;
  try { new URL(url.trim()); } catch { return null; }
  const u = url.trim().toLowerCase();
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("youtube.com") || u.includes("youtu.be/")) return "youtube";
  if (u.includes("vimeo.com")) return "vimeo";
  return "image";
}

function getYoutubeEmbedUrl(url) {
  try {
    const u = new URL(url.trim());
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
    if (u.hostname === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.pathname.startsWith("/shorts/")) return `https://www.youtube.com/embed/${u.pathname.replace("/shorts/", "")}`;
    if (u.pathname.startsWith("/embed/")) return url.trim();
    return null;
  } catch { return null; }
}

function getTikTokEmbedUrl(url) {
  try {
    const u = new URL(url.trim());
    const match = u.pathname.match(/\/video\/(\d+)/);
    if (match) return `https://www.tiktok.com/embed/v2/${match[1]}`;
    return null;
  } catch { return null; }
}

function getVimeoEmbedUrl(url) {
  try {
    const u = new URL(url.trim());
    const match = u.pathname.match(/\/(?:video\/)?(\d+)/);
    if (match) return `https://player.vimeo.com/video/${match[1]}`;
    return null;
  } catch { return null; }
}

function UrlPreview({ type, imageUrl }) {
  if (!type) return null;
  if (type === "image") {
    return (
      <div className="mt-2 flex items-center gap-2">
        <img src={imageUrl} alt="Preview" className="w-10 h-10 object-cover rounded-md border border-gray-200" onError={(e) => { e.target.style.display = "none"; }} />
        <span className="text-xs text-gray-500">Image preview</span>
      </div>
    );
  }
  const labels = { youtube: { icon: "🎬", label: "YouTube video" }, tiktok: { icon: "🎵", label: "TikTok video" }, vimeo: { icon: "🎬", label: "Vimeo video" } };
  const info = labels[type];
  if (!info) return null;
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-lg">{info.icon}</div>
      <span className="text-xs text-gray-500">{info.label}</span>
    </div>
  );
}

function MediaEmbed({ imageUrl, caption, type: propType }) {
  const type = propType || detectUrlType(imageUrl);

  if (type === "youtube") {
    const embedUrl = getYoutubeEmbedUrl(imageUrl);
    return embedUrl ? (
      <iframe
        src={embedUrl}
        className="w-full h-full"
        title={caption || "YouTube video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-red-50 text-4xl">🎬</div>
    );
  }

  if (type === "tiktok") {
    const embedUrl = getTikTokEmbedUrl(imageUrl);
    return embedUrl ? (
      <iframe
        src={embedUrl}
        className="w-full h-full"
        title={caption || "TikTok video"}
        allow="autoplay; gyroscope;"
        allowFullScreen
      />
    ) : (
      <a
        href={imageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full h-full bg-gray-900 flex flex-col items-center justify-center gap-2 no-underline"
      >
        <span className="text-4xl">🎵</span>
        <span className="text-xs text-gray-300 font-medium">Watch on TikTok</span>
      </a>
    );
  }

  if (type === "vimeo") {
    const embedUrl = getVimeoEmbedUrl(imageUrl);
    return embedUrl ? (
      <iframe
        src={embedUrl}
        className="w-full h-full"
        title={caption || "Vimeo video"}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-blue-50 text-4xl">🎬</div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={caption || "Gallery image"}
      className="w-full h-full object-cover"
    />
  );
}

function GalleryItemCard({ item, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editUrl, setEditUrl] = useState(item.image_url);
  const [editCaption, setEditCaption] = useState(item.caption || "");
  const [isSaving, setIsSaving] = useState(false);

  const type = detectUrlType(item.image_url);
  const isVideo = type === "youtube" || type === "tiktok" || type === "vimeo";

  const handleSave = async () => {
    if (!editUrl.trim()) return;
    try { new URL(editUrl.trim()); } catch { toast.error("Please enter a valid URL."); return; }
    setIsSaving(true);
    try {
      await onUpdate(item.gallery_id, { imageUrl: editUrl.trim(), caption: editCaption.trim() });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditUrl(item.image_url);
    setEditCaption(item.caption || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="rounded-xl border-2 border-green-400 bg-white p-3 shadow-md space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">URL</label>
          <input
            type="url"
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="https://..."
            maxLength={2000}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Caption</label>
          <input
            type="text"
            value={editCaption}
            onChange={(e) => setEditCaption(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Optional caption..."
            maxLength={255}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <CheckIcon className="w-3 h-3" />
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
          >
            <XMarkIcon className="w-3 h-3" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-md border border-gray-200 bg-white group">
      <div className={`relative ${isVideo ? "aspect-video" : "aspect-square"}`}>
        <MediaEmbed imageUrl={item.image_url} caption={item.caption} type={type} />
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => setIsEditing(true)}
            className="w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md"
            aria-label="Edit gallery item"
          >
            <PencilIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (window.confirm("Delete this item from your gallery?")) {
                onDelete(item.gallery_id);
              }
            }}
            className="w-7 h-7 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-md"
            aria-label="Delete gallery item"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {item.caption && (
        <div className="px-3 py-2">
          <p className="text-sm text-gray-700 truncate">{item.caption}</p>
        </div>
      )}
    </div>
  );
}

export default function GalleryManager({ providerId }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [previewType, setPreviewType] = useState(null);

  useEffect(() => {
    if (!providerId) { setIsLoading(false); return; }
    api
      .get(`/providers/${providerId}/gallery`)
      .then((r) => setItems(r.data.data))
      .catch(() => toast.error("Failed to load gallery"))
      .finally(() => setIsLoading(false));
  }, [providerId]);

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setImageUrl(val);
    setUrlError("");
    setPreviewType(val.trim() ? detectUrlType(val) : null);
  };

  const validateForm = () => {
    if (!imageUrl.trim()) { setUrlError("URL is required."); return false; }
    if (imageUrl.trim().length > 2000) { setUrlError("URL must be 2000 characters or fewer."); return false; }
    try { new URL(imageUrl.trim()); } catch { setUrlError("Please enter a valid URL."); return false; }
    if (caption.length > 255) { toast.error("Caption must be 255 characters or fewer."); return false; }
    return true;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsAdding(true);
    try {
      const res = await api.post("/providers/me/gallery", { imageUrl: imageUrl.trim(), caption: caption.trim() });
      setItems((prev) => [res.data.data, ...prev]);
      setImageUrl("");
      setCaption("");
      setPreviewType(null);
      setUrlError("");
      toast.success("Added to your gallery!");
    } catch (error) {
      const msg = error.response?.data?.message || "";
      if (error.response?.status === 400 && msg.toLowerCase().includes("limit")) {
        toast.error("Gallery limit reached. Delete an item to add new ones.");
      } else {
        toast.error(msg || "Failed to add. Please try again.");
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (galleryId) => {
    try {
      await api.delete(`/providers/me/gallery/${galleryId}`);
      setItems((prev) => prev.filter((item) => item.gallery_id !== galleryId));
      toast.success("Removed from gallery.");
    } catch {
      toast.error("Failed to delete. Please try again.");
    }
  };

  const handleUpdate = async (galleryId, updates) => {
    try {
      const res = await api.put(`/providers/me/gallery/${galleryId}`, updates);
      const updated = res.data.data;
      setItems((prev) => prev.map((item) => item.gallery_id === galleryId ? updated : item));
      toast.success("Gallery item updated.");
    } catch {
      toast.error("Failed to update. Please try again.");
      throw new Error("update failed");
    }
  };

  const count = items.length;
  const isAtLimit = count >= GALLERY_LIMIT;
  const isNearLimit = count >= GALLERY_LIMIT - 2 && !isAtLimit;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4 w-8 h-8"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <PhotoIcon className="w-5 h-5 text-green-600" />
            Photo &amp; Video Gallery
          </h2>
          <p className="text-sm text-gray-500 mt-1">Showcase your work with photos and videos.</p>
        </div>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${isAtLimit ? "bg-red-100 text-red-700" : isNearLimit ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
          {count} / {GALLERY_LIMIT}
        </span>
      </div>

      {isAtLimit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          Gallery full — delete an item to add new ones.
        </div>
      )}
      {isNearLimit && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
          Almost at limit — {GALLERY_LIMIT - count} slot{GALLERY_LIMIT - count === 1 ? "" : "s"} remaining.
        </div>
      )}

      {!isAtLimit && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PlusIcon className="w-4 h-4 text-green-600" />
            Add Photo or Video
          </h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label htmlFor="gallery-url" className="block text-sm font-medium text-gray-700 mb-1">
                Image or Video URL <span className="text-red-500">*</span>
              </label>
              <input
                id="gallery-url"
                type="url"
                value={imageUrl}
                onChange={handleUrlChange}
                placeholder="https://example.com/photo.jpg  •  YouTube  •  TikTok  •  Vimeo"
                className={`w-full px-4 py-2 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${urlError ? "border-red-400" : "border-gray-300"}`}
                maxLength={2000}
                disabled={isAdding}
              />
              {urlError && <p className="mt-1 text-xs text-red-600">{urlError}</p>}
              <UrlPreview type={previewType} imageUrl={imageUrl} />
            </div>

            <div>
              <label htmlFor="gallery-caption" className="block text-sm font-medium text-gray-700 mb-1">
                Caption <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="gallery-caption"
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Describe this photo or video..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                maxLength={255}
                disabled={isAdding}
              />
              <p className="mt-1 text-xs text-gray-400 text-right">{caption.length} / 255</p>
            </div>

            <button
              type="submit"
              disabled={isAdding || !imageUrl.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition-colors duration-200"
            >
              <PlusIcon className="w-4 h-4" />
              {isAdding ? "Adding..." : "Add to Gallery"}
            </button>
          </form>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-200">
          <div className="text-5xl mb-4">📷</div>
          <p className="text-lg font-medium text-gray-700 mb-2">No items yet</p>
          <p className="text-sm text-gray-400">Add your first photo or video to showcase your work!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <GalleryItemCard
              key={item.gallery_id}
              item={item}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
