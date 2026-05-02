import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  Send,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Trash2,
  MessageSquare
} from "lucide-react";
import { BASE_URL } from "../constants/url";

const CommentSection = ({ task, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedComments, setExpandedComments] = useState([]);

  const token = localStorage.getItem("access_token");
  const currentUserId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchComments = async () => {
      const activeToken = localStorage.getItem("access_token");
      if (!task?.id || !activeToken) return;
      try {
        const res = await axios.get(`${BASE_URL}/api/tasks/comments/?task=${task.id}`, {
          headers: { Authorization: `Bearer ${activeToken}` },
        });
        setComments(Array.isArray(res.data) ? res.data : res.data.results || []);
      } catch (err) { console.error(err); }
    };
    fetchComments();
  }, [task?.id]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(`${BASE_URL}/api/tasks/comments/`, {
        task: task.id,
        content: newComment,
        parent: replyingTo ? replyingTo.id : null,
      }, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      setComments((prev) => [...prev, res.data]);
      if (replyingTo) toggleExpand(replyingTo.id, true);
      setNewComment("");
      setReplyingTo(null);
    } catch (err) { alert("Алдаа гарлаа."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Устгах уу?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/tasks/comments/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) { alert("Алдаа."); }
  };

  const toggleExpand = (id, forceOpen = false) => {
    setExpandedComments(prev => 
      forceOpen ? [...new Set([...prev, id])] :
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('mn-MN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const rootComments = comments.filter(c => !c.parent);
  const getReplies = (parentId) => comments.filter(c => c.parent === parentId);

  const renderCommentItem = (comment, isReply = false) => {
    const replies = getReplies(comment.id);
    const isExpanded = expandedComments.includes(comment.id);

    return (
      <div key={comment.id} className={`${isReply ? "ml-8 mt-3 pl-4 border-l border-slate-200 dark:border-slate-700/50" : "mt-6"}`}>
        <div className="group flex gap-3">
          <div className={`${isReply ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-[12px]'} rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-200 shrink-0`}>
            {comment.user_name?.substring(0, 2).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl rounded-tl-none px-4 py-3 inline-block max-w-full border border-transparent dark:border-slate-700/30">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100">{comment.user_name}</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                   <Clock size={10} /> {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="text-[13.5px] text-slate-600 dark:text-slate-300 leading-relaxed break-words">{comment.content}</p>
            </div>

            <div className="flex items-center gap-4 mt-1.5 ml-2">
              <button onClick={() => setReplyingTo(comment)} className="text-[11px] font-semibold text-slate-400 hover:text-blue-500 transition-colors">Хариулах</button>
              {comment.user === parseInt(currentUserId) && (
                <button onClick={() => handleDelete(comment.id)} className="text-[11px] font-semibold text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">Устгах</button>
              )}
            </div>

            {!isReply && replies.length > 0 && (
              <button onClick={() => toggleExpand(comment.id)} className="flex items-center gap-2 mt-2 text-[11px] font-bold text-blue-500/80 hover:text-blue-500">
                <div className="w-4 border-t border-blue-200 dark:border-blue-900"></div>
                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {isExpanded ? "Нуух" : `${replies.length} хариулт харах`}
              </button>
            )}
            {isExpanded && replies.map(reply => renderCommentItem(reply, true))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white dark:bg-[#0f172a] shadow-2xl z-[9999] border-l dark:border-slate-800/50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header: Task-ийн нэрийг харуулна */}
      <div className="px-6 py-5 flex items-center justify-between border-b dark:border-slate-800/50">
        <div className="min-w-0 flex-1 mr-4">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg truncate" title={task.title}>
            {task.title}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
            <MessageSquare size={12} /> Discussion
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 px-2.5 py-0.5 rounded-full text-xs font-bold">{comments.length}</span>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400"><X size={20} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
        {rootComments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
             <p className="text-sm font-medium">Сэтгэгдэл алга</p>
          </div>
        ) : ( rootComments.map(c => renderCommentItem(c)) )}
      </div>

      {/* Input Section: pb-16 нэмсэн нь Dark Mode товчны дээр гаргах зориулалттай */}
      <div className="p-5 pb-5 bg-white dark:bg-[#0f172a] border-t dark:border-slate-800/50 relative z-[10000]">
        {replyingTo && (
          <div className="mb-3 flex items-center justify-between bg-blue-50 dark:bg-blue-500/5 px-3 py-2 rounded-xl border border-blue-100 dark:border-blue-500/10">
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
              <CornerDownRight size={12} /> @{replyingTo.user_name}-д хариулах
            </span>
            <button onClick={() => setReplyingTo(null)} className="text-blue-400 hover:text-blue-600"><X size={14} /></button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-2 border border-transparent dark:border-slate-800 focus-within:ring-2 ring-blue-500/20 transition-all">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Сэтгэгдэл үлдээх..."
            className="flex-1 bg-transparent dark:text-white px-3 py-2 text-[13px] outline-none resize-none min-h-[44px] max-h-32"
            rows="1"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-xl disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 transition-all hover:bg-blue-700 shrink-0 shadow-lg shadow-blue-500/20"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentSection;