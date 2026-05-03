import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  X,
  Send,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageSquare,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Download,
  ZoomIn,
  File,
} from "lucide-react";
import { BASE_URL } from "../constants/url";

/* ─── Lightbox ─────────────────────────────────────────── */
const Lightbox = ({ src, onClose }) => {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
      >
        <X size={20} />
      </button>
      <img
        src={src}
        alt="Preview"
        className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "scaleIn 0.2s ease" }}
      />
    </div>
  );
};

/* ─── File Attachment Preview ──────────────────────────── */
const AttachmentPreview = ({ file, onRemove }) => {
  const isImage = file.type?.startsWith("image/");
  const url = file.preview || URL.createObjectURL(file);

  return (
    <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
      {isImage ? (
        <img src={url} alt={file.name} className="w-20 h-20 object-cover" />
      ) : (
        <div className="w-20 h-20 flex flex-col items-center justify-center gap-1">
          <FileText size={24} className="text-indigo-400" />
          <span className="text-[9px] text-slate-400 px-1 text-center truncate w-full">
            {file.name}
          </span>
        </div>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={10} />
        </button>
      )}
    </div>
  );
};

/* ─── Attachment in message ────────────────────────────── */
const CommentAttachments = ({ attachments, onImageClick }) => {
  if (!attachments || attachments.length === 0) return null;

  const images = attachments.filter(
    (a) => a.type?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(a.url || a.name)
  );
  const files = attachments.filter(
    (a) => !a.type?.startsWith("image/") && !/\.(jpg|jpeg|png|gif|webp)$/i.test(a.url || a.name)
  );

  return (
    <div className="mt-2 space-y-2">
      {images.length > 0 && (
        <div
          className={`grid gap-1.5 ${
            images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-3"
          }`}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className="relative group rounded-xl overflow-hidden cursor-zoom-in aspect-square max-w-[200px]"
              onClick={() => onImageClick(img.url || img.preview)}
            >
              <img
                src={img.url || img.preview}
                alt={img.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                <ZoomIn
                  size={20}
                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {files.map((file, i) => (
        <a
          key={i}
          href={file.url || file.preview}
          download={file.name}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group w-fit max-w-xs"
        >
          <File size={14} className="text-indigo-500 shrink-0" />
          <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">
            {file.name}
          </span>
          <Download
            size={12}
            className="text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0"
          />
        </a>
      ))}
    </div>
  );
};

/* ─── Main Component ───────────────────────────────────── */
const CommentSection = ({ task, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedComments, setExpandedComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const token = localStorage.getItem("access_token");

  /* ── Fetch ── */
  useEffect(() => {
    const fetchComments = async () => {
      const activeToken = localStorage.getItem("access_token");
      if (!task?.id || !activeToken) return;
      try {
        const res = await axios.get(
          `${BASE_URL}/api/tasks/comments/?task=${task.id}`,
          { headers: { Authorization: `Bearer ${activeToken}` } }
        );
        setComments(Array.isArray(res.data) ? res.data : res.data.results || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchComments();
  }, [task?.id]);

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!newComment.trim() && attachments.length === 0) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("task", task.id);
      formData.append("content", newComment);
      if (replyingTo) formData.append("parent", replyingTo.id);
      attachments.forEach((f) => formData.append("attachments", f));

      const res = await axios.post(`${BASE_URL}/api/tasks/comments/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Attach local previews for immediate display
      const newEntry = {
        ...res.data,
        _localAttachments: attachments.map((f) => ({
          name: f.name,
          type: f.type,
          preview: URL.createObjectURL(f),
        })),
      };

      setComments((prev) => [...prev, newEntry]);
      if (replyingTo) toggleExpand(replyingTo.id, true);
      setNewComment("");
      setAttachments([]);
      setReplyingTo(null);
    } catch {
      alert("Алдаа гарлаа.");
    } finally {
      setSending(false);
    }
  };

  /* ── File pick ── */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  /* ── Expand ── */
  const toggleExpand = (id, forceOpen = false) =>
    setExpandedComments((prev) =>
      forceOpen
        ? [...new Set([...prev, id])]
        : prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );

  /* ── Avatar color ── */
  const avatarColors = [
    "from-violet-500 to-indigo-500",
    "from-rose-400 to-pink-500",
    "from-emerald-400 to-teal-500",
    "from-amber-400 to-orange-500",
    "from-sky-400 to-blue-500",
  ];
  const getAvatarColor = (name = "") => {
    const idx = (name.charCodeAt(0) || 0) % avatarColors.length;
    return avatarColors[idx];
  };

  /* ── Export ── */
  const exportComments = () => {
    const topLevel = comments.filter((c) => !c.parent);
    const buildText = (list, depth = 0) =>
      list
        .map((c) => {
          const indent = "  ".repeat(depth);
          const replies = comments.filter((r) => r.parent === c.id);
          return (
            `${indent}${c.user_name} · ${new Date(c.created_at).toLocaleString("mn-MN")}\n` +
            `${indent}${c.content}\n` +
            (replies.length ? buildText(replies, depth + 1) : "")
          );
        })
        .join("\n");

    const text = `# ${task.title} - Discussion\n\n${buildText(topLevel)}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${task.title}-comments.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Render comment ── */
  const renderCommentItem = (comment, isReply = false) => {
    const replies = comments.filter((c) => c.parent === comment.id);
    const isExpanded = expandedComments.includes(comment.id);
    const attachData = comment._localAttachments || comment.attachments || [];

    return (
      <div key={comment.id} className={`${isReply ? "ml-10 mt-3" : "mt-5"}`}>
        <div className="flex gap-3">
          {/* Avatar */}
          <div
            className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${getAvatarColor(
              comment.user_name
            )} flex items-center justify-center font-bold text-white shrink-0 shadow-md text-xs`}
          >
            {comment.user_name?.substring(0, 2).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            {/* Bubble */}
            <div
              className={`rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border transition-colors
              ${isReply
                ? "bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-700/30"
                : "bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/40"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12.5px] font-bold text-slate-800 dark:text-white">
                  {comment.user_name}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0 ml-2">
                  <Clock size={9} />
                  {new Date(comment.created_at).toLocaleString("mn-MN", {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </span>
              </div>
              {comment.content && (
                <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {comment.content}
                </p>
              )}
              <CommentAttachments
                attachments={attachData}
                onImageClick={(src) => setLightboxSrc(src)}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-1.5 ml-1">
              <button
                onClick={() => {
                  setReplyingTo(comment);
                  textareaRef.current?.focus();
                }}
                className="text-[11px] font-semibold text-slate-400 hover:text-indigo-500 transition-colors flex items-center gap-1"
              >
                <CornerDownRight size={11} /> Хариулах
              </button>

              {!isReply && replies.length > 0 && (
                <button
                  onClick={() => toggleExpand(comment.id)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {isExpanded ? "Нуух" : `${replies.length} хариулт`}
                </button>
              )}
            </div>

            {/* Replies */}
            {isExpanded && (
              <div className="mt-1 pl-4 border-l-2 border-slate-100 dark:border-slate-700/50 space-y-1">
                {replies.map((reply) => renderCommentItem(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const topLevelComments = comments.filter((c) => !c.parent);

  return (
    <>
      {lightboxSrc && (
        <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}

      <div className="fixed inset-y-0 right-0 w-full md:w-[460px] bg-white dark:bg-[#0c1220] shadow-[-20px_0_60px_rgba(0,0,0,0.08)] z-[9998] flex flex-col">
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 mb-1">
                <MessageSquare size={10} fill="currentColor" /> Discussion
              </p>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-lg leading-tight truncate">
                {task.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-2.5 py-1 rounded-full text-xs font-black shadow">
                {comments.length}
              </span>
              <button
                onClick={exportComments}
                title="Export comments"
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
              >
                <Download size={17} />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Comments list ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1 scrollbar-hide">
          {topLevelComments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-300 dark:text-slate-600">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <MessageSquare size={28} />
              </div>
              <p className="text-sm font-semibold">Сэтгэгдэл алга</p>
              <p className="text-xs">Эхний сэтгэгдлийг үлдээгээрэй</p>
            </div>
          ) : (
            topLevelComments.map((c) => renderCommentItem(c))
          )}
        </div>

        {/* ── Input ── */}
        <div className="px-6 pb-6 pt-3 bg-white dark:bg-[#0c1220] border-t border-slate-100 dark:border-slate-800">
          {/* Reply banner */}
          {replyingTo && (
            <div className="mb-3 flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2.5 rounded-xl border-l-4 border-indigo-400">
              <span className="text-[11.5px] text-indigo-600 dark:text-indigo-300 font-semibold flex items-center gap-1.5">
                <CornerDownRight size={12} />
                <strong>{replyingTo.user_name}</strong>-д хариулах
              </span>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-indigo-400 hover:text-indigo-600 transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Attachment previews */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachments.map((f, i) => (
                <AttachmentPreview
                  key={i}
                  file={f}
                  onRemove={() =>
                    setAttachments((prev) => prev.filter((_, idx) => idx !== i))
                  }
                />
              ))}
            </div>
          )}

          {/* Input box */}
          <div className="relative flex flex-col bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 p-[1.5px] rounded-2xl shadow-lg shadow-indigo-200/30 dark:shadow-indigo-900/20">
            <div className="flex flex-col w-full bg-white dark:bg-slate-900 rounded-[14px]">
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Сэтгэгдэл үлдээх..."
                className="flex-1 bg-transparent dark:text-white px-4 pt-3 pb-1 text-[13.5px] outline-none resize-none max-h-32 placeholder:text-slate-300 dark:placeholder:text-slate-600 leading-relaxed"
                rows="2"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <div className="flex items-center justify-between px-3 pb-2">
                <div className="flex items-center gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                    title="Файл хавсаргах"
                  >
                    <Paperclip size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.setAttribute("accept", "image/*");
                      fileInputRef.current?.click();
                      setTimeout(() =>
                        fileInputRef.current?.setAttribute(
                          "accept",
                          "image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
                        ), 100
                      );
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                    title="Зураг хавсаргах"
                  >
                    <ImageIcon size={16} />
                  </button>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={sending || (!newComment.trim() && attachments.length === 0)}
                  className="w-8 h-8 flex items-center justify-center bg-gradient-to-tr from-indigo-500 via-violet-500 to-pink-500 text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 shadow-sm"
                >
                  {sending ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={14} fill="currentColor" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-300 dark:text-slate-600 text-center mt-2">
            Enter → илгээх · Shift+Enter → мөр шилжих
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: scaleIn 0.18s ease; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default CommentSection;