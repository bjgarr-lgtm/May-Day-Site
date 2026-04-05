import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import EditableTable from "../components/EditableTable";
import RecordEditor from "../components/RecordEditor";
import { blankTask } from "../seedData";
import { formatDate, isOverdue } from "../utils/date";

const statusOptions = ["Not Started", "In Progress", "Blocked", "Done"];
const priorityOptions = ["Low", "Medium", "High", "Critical"];
const categoryOptions = [
  "Operations",
  "Publicity",
  "Food",
  "Programming",
  "Printing",
  "Sponsors",
  "Volunteers",
  "Finance",
];

export default function TasksView() {
  const store = useOpsStore();
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [categoryFilter, setCategoryFilter] = React.useState("All");
  const [editor, setEditor] = React.useState(blankTask());

  const filteredRows = store.tasks
    .filter((task) => {
      const haystack = `${task.title} ${task.owner} ${task.notes} ${task.category}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || task.status === statusFilter;
      const matchesCategory = categoryFilter === "All" || task.category === categoryFilter;
      return matchesQuery && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });

  const handleSave = () => {
    if (!editor.title.trim()) {
      window.alert("Task title is required.");
      return;
    }

    const exists = store.tasks.some((item) => item.id === editor.id);
    if (exists) {
      store.updateItem("tasks", editor.id, editor);
    } else {
      store.addItem("tasks", editor);
    }
    setEditor(blankTask());
  };

  const columns = [
    { key: "title", label: "Task" },
    { key: "category", label: "Category" },
    { key: "owner", label: "Owner" },
    {
      key: "status",
      label: "Status",
      render: (value) => <span className={`ops-pill status-${slug(value)}`}>{value}</span>,
    },
    {
      key: "priority",
      label: "Priority",
      render: (value) => <span className={`ops-pill priority-${slug(value)}`}>{value}</span>,
    },
    {
      key: "deadline",
      label: "Deadline",
      render: (value, row) => (
        <span className={isOverdue(row.deadline) && row.status !== "Done" ? "ops-text-danger" : ""}>
          {formatDate(value)}
        </span>
      ),
    },
    { key: "notes", label: "Notes" },
  ];

  return (
    <div className="ops-page">
      <SectionCard title="Tasks" subtitle="This is the spine. Everything real lives here.">
        <div className="ops-toolbar">
          <input
            className="ops-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            {statusOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option>All</option>
            {categoryOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>

        <EditableTable
          columns={columns}
          rows={filteredRows}
          onEdit={setEditor}
          onDelete={(id) => store.removeItem("tasks", id)}
          rowClassName={(row) => isOverdue(row.deadline) && row.status !== "Done" ? "is-overdue" : ""}
        />
      </SectionCard>

      <SectionCard title={editor.title ? "Edit task" : "Add task"} subtitle="Quick entry, quick cleanup, less spreadsheet necromancy.">
        <RecordEditor
          title={editor.title ? "Task editor" : "New task"}
          value={editor}
          onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))}
          onSave={handleSave}
          onCancel={() => setEditor(blankTask())}
          fields={[
            { name: "title", label: "Task title", full: true },
            { name: "category", label: "Category", type: "select", options: categoryOptions },
            { name: "owner", label: "Owner" },
            { name: "status", label: "Status", type: "select", options: statusOptions },
            { name: "priority", label: "Priority", type: "select", options: priorityOptions },
            { name: "deadline", label: "Deadline", type: "date" },
            { name: "notes", label: "Notes", type: "textarea", full: true, rows: 4 },
          ]}
        />
      </SectionCard>
    </div>
  );
}

function slug(value = "") {
  return value.toLowerCase().replace(/\s+/g, "-");
}