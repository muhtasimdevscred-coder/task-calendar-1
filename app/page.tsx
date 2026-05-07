"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Download,
  Pencil,
  Plus,
  Trash2,
  Check,
  X,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import { formatDate, formatDateForInput } from "@/lib/dates";

type Task = {
  id: string;
  date: string;
  task: string;
  postType: string;
};

type Filter = "all" | "week" | "month";
type Theme = "light" | "dark";

const POST_TYPES = [
  "Reel",
  "Carousel",
  "Static Post",
  "Story",
  "Video",
  "Blog",
  "Newsletter",
  "Other",
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [refDate, setRefDate] = useState(formatDateForInput(new Date()));
  const [theme, setTheme] = useState<Theme>("light");

  const [date, setDate] = useState(formatDateForInput(new Date()));
  const [task, setTask] = useState("");
  const [postType, setPostType] = useState(POST_TYPES[0]);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTask, setEditTask] = useState("");
  const [editPostType, setEditPostType] = useState("");

  // Load saved theme on mount
  useEffect(() => {
    const saved = (typeof window !== "undefined" &&
      localStorage.getItem("theme")) as Theme | null;
    const initial: Theme =
      saved ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ filter });
      if (filter !== "all") params.set("refDate", refDate);
      const res = await fetch(`/api/tasks?${params.toString()}`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, refDate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, task, postType }),
      });
      if (res.ok) {
        setTask("");
        await fetchTasks();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (t: Task) => {
    setEditingId(t.id);
    setEditDate(formatDateForInput(t.date));
    setEditTask(t.task);
    setEditPostType(t.postType);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: editDate,
        task: editTask,
        postType: editPostType,
      }),
    });
    if (res.ok) {
      setEditingId(null);
      await fetchTasks();
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) await fetchTasks();
  };

  const downloadExcel = () => {
    const params = new URLSearchParams({ filter });
    if (filter !== "all") params.set("refDate", refDate);
    window.location.href = `/api/export?${params.toString()}`;
  };

  const grouped = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((t) => {
      const key = formatDateForInput(t.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [tasks]);

  return (
    <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-16">
      {/* Header with theme toggle */}
      <header className="mb-12 animate-fade-up flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--accent)" }}
            />
            <span
              className="text-xs uppercase tracking-[0.2em] font-medium"
              style={{ color: "var(--muted)" }}
            >
              Daily Planner
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-medium leading-[1.05] tracking-tight">
            Task <em className="italic" style={{ color: "var(--accent)" }}>Calendar</em>
          </h1>
          <p
            className="mt-4 text-base max-w-xl"
            style={{ color: "var(--ink-soft)" }}
          >
            Plan your daily tasks and post types in one place. Filter by week or
            month, edit on the fly, and export to Excel.
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="theme-toggle flex-shrink-0"
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </header>

      {/* Add new task */}
      <section
        className="card p-6 mb-10 animate-fade-up"
        style={{ animationDelay: "0.05s", animationFillMode: "backwards" }}
      >
        <h2 className="font-display text-xl font-medium mb-4 flex items-center gap-2">
          <Plus size={18} strokeWidth={2.2} />
          New Task
        </h2>
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-12 gap-3"
        >
          <div className="md:col-span-3">
            <label
              className="block text-xs mb-1.5 font-medium"
              style={{ color: "var(--muted)" }}
            >
              Date
            </label>
            <input
              type="date"
              className="field"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-5">
            <label
              className="block text-xs mb-1.5 font-medium"
              style={{ color: "var(--muted)" }}
            >
              Task
            </label>
            <input
              type="text"
              className="field"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Describe the task…"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label
              className="block text-xs mb-1.5 font-medium"
              style={{ color: "var(--muted)" }}
            >
              Post Type
            </label>
            <select
              className="field"
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
            >
              {POST_TYPES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={submitting || !task.trim()}
              className="btn-primary w-full justify-center"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Add
            </button>
          </div>
        </form>
      </section>

      {/* Filters */}
      <section
        className="flex flex-wrap items-center justify-between gap-4 mb-6 animate-fade-up"
        style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "week", "month"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`pill ${filter === f ? "active" : ""}`}
            >
              {f === "all"
                ? "All Tasks"
                : f === "week"
                ? "This Week"
                : "This Month"}
            </button>
          ))}
          {filter !== "all" && (
            <div className="flex items-center gap-2 ml-2">
              <CalendarDays size={14} style={{ color: "var(--muted)" }} />
              <input
                type="date"
                className="field"
                style={{ width: "auto", padding: "6px 10px", fontSize: 13 }}
                value={refDate}
                onChange={(e) => setRefDate(e.target.value)}
              />
            </div>
          )}
        </div>
        <button onClick={downloadExcel} className="btn-ghost">
          <Download size={14} />
          Export to Excel
        </button>
      </section>

      {/* Task list */}
      <section
        className="card overflow-hidden animate-fade-up"
        style={{ animationDelay: "0.15s", animationFillMode: "backwards" }}
      >
        {loading ? (
          <div
            className="p-12 text-center flex items-center justify-center gap-2"
            style={{ color: "var(--muted)" }}
          >
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        ) : tasks.length === 0 ? (
          <div
            className="p-16 text-center"
            style={{ color: "var(--muted)" }}
          >
            <p className="font-display text-2xl mb-1" style={{ color: "var(--ink-soft)" }}>
              No tasks yet
            </p>
            <p className="text-sm">
              Add one above to get started, or change your filter.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--line)" }}>
            {grouped.map(([dateKey, items]) => (
              <div key={dateKey}>
                <div
                  className="px-6 py-3 flex items-baseline gap-3 sticky top-0 backdrop-blur"
                  style={{
                    background: "color-mix(in srgb, var(--cream) 85%, transparent)",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <span
                    className="font-display text-sm font-medium"
                    style={{ color: "var(--ink)" }}
                  >
                    {formatDate(dateKey)}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--muted)" }}
                  >
                    · {items.length} {items.length === 1 ? "task" : "tasks"}
                  </span>
                </div>
                <ul>
                  {items.map((t) => (
                    <li
                      key={t.id}
                      className="px-6 py-4 flex items-start gap-4 transition-colors"
                      style={{ borderTop: "1px solid var(--line)" }}
                    >
                      {editingId === t.id ? (
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2">
                          <input
                            type="date"
                            className="field md:col-span-3"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                          />
                          <input
                            type="text"
                            className="field md:col-span-6"
                            value={editTask}
                            onChange={(e) => setEditTask(e.target.value)}
                          />
                          <select
                            className="field md:col-span-3"
                            value={editPostType}
                            onChange={(e) => setEditPostType(e.target.value)}
                          >
                            {POST_TYPES.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                            {!POST_TYPES.includes(editPostType) && (
                              <option value={editPostType}>
                                {editPostType}
                              </option>
                            )}
                          </select>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[15px] leading-snug mb-1.5"
                              style={{ color: "var(--ink)" }}
                            >
                              {t.task}
                            </p>
                            <span className="tag">{t.postType}</span>
                          </div>
                        </>
                      )}

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {editingId === t.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(t.id)}
                              className="btn-icon"
                              title="Save"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="btn-icon"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(t)}
                              className="btn-icon"
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => deleteTask(t.id)}
                              className="btn-icon danger"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer
        className="mt-12 text-center text-xs"
        style={{ color: "var(--muted)" }}
      >
        {tasks.length > 0 && (
          <p>
            Showing {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
            {filter !== "all" && ` for the current ${filter}`}
          </p>
        )}
      </footer>
    </main>
  );
}