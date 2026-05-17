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
  Trash2,
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

  // Backend: { id, file: "https://...", name: "foo.png", uploaded_at }
  // Local preview: { name, type, preview: objectURL }
  const getSrc = (a) => a.file || a.preview || a.url || "";
  const getName = (a) => a.name || a.file?.split("/").pop() || "file";
  const isImg = (a) => {
    if (a.type?.startsWith("image/")) return true;
    const src = getSrc(a);
    return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(src);
  };

  const images = attachments.filter(isImg);
  const files = attachments.filter((a) => !isImg(a));

  return (
    <div className="mt-2 space-y-2">
      {images.length > 0 && (
        <div
          className={`grid gap-1.5 ${
            images.length === 1
              ? "grid-cols-1"
              : images.length === 2
                ? "grid-cols-2"
                : "grid-cols-3"
          }`}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className="relative group rounded-xl overflow-hidden cursor-zoom-in aspect-square max-w-[200px]"
              onClick={() => onImageClick(getSrc(img))}
            >
              <img
                src={getSrc(img)}
                alt={getName(img)}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Hover overlay: zoom + download */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3">
                <ZoomIn
                  size={18}
                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow"
                />
                <a
                  href={getSrc(img)}
                  download={getName(img)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Татах"
                >
                  <Download size={18} className="text-white drop-shadow" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      {files.map((file, i) => (
        <a
          key={i}
          href={getSrc(file)}
          download={getName(file)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group w-fit max-w-xs"
        >
          <File size={14} className="text-indigo-500 shrink-0" />
          <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">
            {getName(file)}
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

/* ─── Mention Dropdown ─────────────────────────────────── */
const MentionDropdown = ({ members, query, onSelect, position }) => {
  const filtered = members.filter((m) => {
    const q = query.toLowerCase();
    return (
      (m.display || "").toLowerCase().includes(q) ||
      (m.username || "").toLowerCase().includes(q)
    );
  });

  if (filtered.length === 0) return null;

  // Highlight matching part
  const highlight = (text, q) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-indigo-500 font-bold">
          {text.slice(idx, idx + q.length)}
        </span>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div
      className="absolute z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden w-64 mb-2"
      style={{ bottom: position.bottom, left: position.left }}
    >
      <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
          @ Mention
        </span>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {filtered.map((member) => {
          // Use display name (last+first) or fall back to username
          const displayName = member.display?.trim() || member.username;
          const initials = displayName.substring(0, 2).toUpperCase();
          return (
            <button
              key={member.id}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(member);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left group"
            >
              <div
                className={`w-8 h-8 rounded-xl bg-gradient-to-br ${getAvatarColorStatic(displayName)} flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm`}
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                {/* Овог нэр — том, тод */}
                <p className="text-[13px] font-semibold text-slate-800 dark:text-white truncate leading-tight">
                  {highlight(displayName, query)}
                </p>
                {/* username — жижиг, саарал */}
                <p className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
                  @{highlight(member.username, query)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Avatar color (static, no hook) ──────────────────── */
const AVATAR_COLORS = [
  "from-violet-500 to-indigo-500",
  "from-rose-400 to-pink-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-sky-400 to-blue-500",
];
function getAvatarColorStatic(name = "") {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

/* ─── Main Component ───────────────────────────────────── */
const CommentSection = ({ task, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedComments, setExpandedComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [sending, setSending] = useState(false);

  // Mention state
  const [members, setMembers] = useState([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMention, setShowMention] = useState(false);
  const [mentionStart, setMentionStart] = useState(-1);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const wrapperRef = useRef(null);

  const token = localStorage.getItem("access_token");

  // JWT-ээс одоогийн хэрэглэгчийн ID decode хийх
  const currentUserId = (() => {
    try {
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.user_id || payload.id || null;
    } catch {
      return null;
    }
  })();

  /* ── Fetch comments ── */
  useEffect(() => {
    const fetchComments = async () => {
      const activeToken = localStorage.getItem("access_token");
      if (!task?.id || !activeToken) return;
      try {
        const res = await axios.get(
          `${BASE_URL}/api/tasks/comments/?task=${task.id}`,
          {
            headers: { Authorization: `Bearer ${activeToken}` },
          },
        );
        setComments(
          Array.isArray(res.data) ? res.data : res.data.results || [],
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchComments();
  }, [task?.id]);

  /* ── Fetch project members for mention ── */
  useEffect(() => {
    if (!task?.project) return;
    const fetchMembers = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/tasks/projects/${task.project}/members/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setMembers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Members fetch error:", err);
      }
    };
    fetchMembers();
  }, [task?.project]);

  /* ── Handle textarea input for @ mention ── */
  const handleTextareaChange = (e) => {
    const val = e.target.value;
    setNewComment(val);

    const cursor = e.target.selectionStart;
    // Find the last @ before cursor
    const textUpToCursor = val.slice(0, cursor);
    const atIdx = textUpToCursor.lastIndexOf("@");

    if (atIdx !== -1) {
      const afterAt = textUpToCursor.slice(atIdx + 1);
      // Only show if no space after @
      if (!/\s/.test(afterAt)) {
        setMentionStart(atIdx);
        setMentionQuery(afterAt);
        setShowMention(true);
        return;
      }
    }
    setShowMention(false);
    setMentionStart(-1);
  };

  /* ── Insert mention ── */
  const handleMentionSelect = (member) => {
    const before = newComment.slice(0, mentionStart);
    const after = newComment.slice(mentionStart + 1 + mentionQuery.length);
    const inserted = `@${member.username} `;
    const nextVal = before + inserted + after;
    setNewComment(nextVal);
    setShowMention(false);
    setMentionStart(-1);
    setMentionQuery("");
    setTimeout(() => {
      if (textareaRef.current) {
        const pos = before.length + inserted.length;
        textareaRef.current.setSelectionRange(pos, pos);
        textareaRef.current.focus();
      }
    }, 0);
  };

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

      const res = await axios.post(
        `${BASE_URL}/api/tasks/comments/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // Use server attachments if available, fallback to local previews
      const serverAttachments =
        res.data.attachments && res.data.attachments.length > 0
          ? res.data.attachments
          : attachments.map((f) => ({
              name: f.name,
              type: f.type,
              preview: URL.createObjectURL(f),
            }));

      const newEntry = {
        ...res.data,
        attachments: serverAttachments,
      };

      setComments((prev) => [...prev, newEntry]);
      if (replyingTo) toggleExpand(replyingTo.id, true);
      setNewComment("");
      setAttachments([]);
      setReplyingTo(null);
      setShowMention(false);
    } catch {
      alert("Алдаа гарлаа.");
    } finally {
      setSending(false);
    }
  };

  /* ── Delete comment ── */
  const handleDelete = async (comment) => {
    if (!window.confirm("Энэ сэтгэгдлийг устгах уу?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/tasks/comments/${comment.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // comment болон түүний reply-г хоёуланг нь устга
      setComments((prev) =>
        prev.filter((c) => c.id !== comment.id && c.parent !== comment.id),
      );
    } catch {
      alert("Устгахад алдаа гарлаа.");
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
          : [...prev, id],
    );

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

  /* ── Render mention highlighted text ── */
  const renderContent = (text) => {
    if (!text) return null;
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (/^@\w+$/.test(part)) {
        const uname = part.slice(1);
        const member = members.find((m) => m.username === uname);
        const fullName = member?.display?.trim();
        return (
          <span
            key={i}
            className="inline-flex items-center gap-0.5 text-indigo-500 font-semibold bg-indigo-50 dark:bg-indigo-900/20 px-1 py-0.5 rounded-md text-[12px] cursor-default relative group/mention"
            title={fullName ? `${fullName} (@${uname})` : `@${uname}`}
          >
            {fullName ? fullName : part}
            {/* Tooltip */}
            {fullName && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover/mention:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                @{uname}
              </span>
            )}
          </span>
        );
      }
      return part;
    });
  };

  /* ── Render comment ── */
  const renderCommentItem = (comment, isReply = false) => {
    const replies = comments.filter((c) => c.parent === comment.id);
    const isExpanded = expandedComments.includes(comment.id);
    const attachData = comment.attachments || [];

    return (
      <div key={comment.id} className={`${isReply ? "ml-10 mt-3" : "mt-5"}`}>
        <div className="flex gap-3">
          <div
            className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${getAvatarColorStatic(comment.user_name)} flex items-center justify-center font-bold text-white shrink-0 shadow-md text-xs`}
          >
            {comment.user_name?.substring(0, 2).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div
              className={`rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border transition-colors
              ${
                isReply
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
                  {renderContent(comment.content)}
                </p>
              )}
              <CommentAttachments
                attachments={attachData}
                onImageClick={(src) => setLightboxSrc(src)}
              />
            </div>

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
                  {isExpanded ? (
                    <ChevronUp size={12} />
                  ) : (
                    <ChevronDown size={12} />
                  )}
                  {isExpanded ? "Нуух" : `${replies.length} хариулт`}
                </button>
              )}

              {/* Зөвхөн өөрийн comment-д устгах товч */}
              {currentUserId && comment.user === currentUserId && (
                <button
                  onClick={() => handleDelete(comment)}
                  className="text-[11px] font-semibold text-slate-300 hover:text-red-400 dark:text-slate-600 dark:hover:text-red-400 transition-colors flex items-center gap-1 ml-auto"
                  title="Устгах"
                >
                  <Trash2 size={11} /> Устгах
                </button>
              )}
            </div>

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

          {/* Input box with mention dropdown */}
          <div className="relative" ref={wrapperRef}>
            {/* Mention dropdown — appears above textarea */}
            {showMention && (
              <MentionDropdown
                members={members}
                query={mentionQuery}
                onSelect={handleMentionSelect}
                position={{ bottom: "100%", left: 0 }}
              />
            )}

            <div className="relative flex flex-col bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 p-[1.5px] rounded-2xl shadow-lg shadow-indigo-200/30 dark:shadow-indigo-900/20">
              <div className="flex flex-col w-full bg-white dark:bg-slate-900 rounded-[14px]">
                <textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={handleTextareaChange}
                  placeholder="Сэтгэгдэл үлдээх... @ — mention"
                  className="flex-1 bg-transparent dark:text-white px-4 pt-3 pb-1 text-[13.5px] outline-none resize-none max-h-32 placeholder:text-slate-300 dark:placeholder:text-slate-600 leading-relaxed"
                  rows="2"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setShowMention(false);
                      return;
                    }
                    if (e.key === "Enter" && !e.shiftKey && !showMention) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  onBlur={() => {
                    // Small delay so onMouseDown on dropdown items fires first
                    setTimeout(() => setShowMention(false), 150);
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
                        setTimeout(
                          () =>
                            fileInputRef.current?.setAttribute(
                              "accept",
                              "image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt",
                            ),
                          100,
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
                    disabled={
                      sending ||
                      (!newComment.trim() && attachments.length === 0)
                    }
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
          </div>

          <p className="text-[10px] text-slate-300 dark:text-slate-600 text-center mt-2">
            Enter → илгээх · Shift+Enter → мөр шилжих · @ → mention
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
