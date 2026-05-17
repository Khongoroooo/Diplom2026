// utils/reportExport.js
// Requires: npm install xlsx jspdf jspdf-autotable docx file-saver

// ─── EXCEL EXPORT ──────────────────────────────────────────────────────────────
export async function exportExcel(stats, users, tasks, attendance, projects) {
  const XLSX = await import("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm");

  const wb = XLSX.utils.book_new();

  // Sheet 1: Хэрэглэгчид
  const usersData = [
    ["Нэр", "Имэйл", "Алба", "Дүр", "Тасалгаа"],
    ...users.map((u) => [
      `${u.last_name || ""} ${u.first_name || ""}`.trim() || u.username,
      u.email,
      u.department_name || "-",
      u.role,
      u.position_name || "-",
    ]),
  ];
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(usersData),
    "Хэрэглэгчид",
  );

  // Sheet 2: Төслүүд
  const PROJECT_STATUS = {
    new: "Шинэ",
    in_progress: "Хийгдэж буй",
    maintenance: "Арчилгаа",
    half_balance: "Хагас",
    completed: "Дууссан",
  };
  const projData = [
    ["ID", "Нэр", "Тайлбар", "Статус", "Эхлэх огноо", "Даалгавар"],
    ...projects.map((p) => [
      p.id,
      p.title,
      p.description || "",
      PROJECT_STATUS[p.status] || p.status,
      p.start_date || "",
      p.taskCount ?? "-",
    ]),
  ];
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(projData),
    "Төслүүд",
  );

  // Sheet 3: Даалгаврууд
  const TASK_STATUS = {
    todo: "To Do",
    working: "Working",
    review: "Review",
    stuck: "Stuck",
    completed: "Done",
  };
  const taskData = [
    ["ID", "Гарчиг", "Статус", "Хариуцагч", "Тэмдэглэл"],
    ...tasks.map((t) => [
      t.id,
      t.title,
      TASK_STATUS[t.status] || t.status,
      t.assigned_to_name || "-",
      t.note || "",
    ]),
  ];
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(taskData),
    "Даалгаврууд",
  );

  // Sheet 4: Ирц
  const attData = [
    ["Хэрэглэгч", "Огноо", "Ирсэн цаг", "Явсан цаг", "Статус"],
    ...attendance.map((a) => [
      a.full_name || "-",
      a.date,
      a.check_in ? new Date(a.check_in).toLocaleTimeString("mn-MN") : "-",
      a.check_out ? new Date(a.check_out).toLocaleTimeString("mn-MN") : "-",
      a.status,
    ]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(attData), "Ирц");

  // Sheet 5: Дэлгэрэнгүй статистик
  if (stats) {
    const summaryData = [
      ["Үзүүлэлт", "Тоо"],
      ["Нийт хэрэглэгч", stats.totalUsers],
      ["Нийт төсөл", stats.totalProjects],
      ["Нийт даалгавар", stats.totalTasks],
      ["", ""],
      ["Даалгавар — To Do", stats.tasksByStatus.todo],
      ["Даалгавар — Working", stats.tasksByStatus.working],
      ["Даалгавар — Review", stats.tasksByStatus.review],
      ["Даалгавар — Stuck", stats.tasksByStatus.stuck],
      ["Даалгавар — Done", stats.tasksByStatus.completed],
      ["", ""],
      ["Ирц — Ирсэн", stats.attendanceStats.present],
      ["Ирц — Хоцорсон", stats.attendanceStats.late],
      ["Ирц — Тасалсан", stats.attendanceStats.absent],
      ["Ирц — Чөлөөтэй", stats.attendanceStats.leave],
    ];
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(summaryData),
      "Нийт статистик",
    );
  }

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `admin-report-${date}.xlsx`);
}

// ─── PDF EXPORT ────────────────────────────────────────────────────────────────
export async function exportPDF(stats, users, projects, tasks) {
  const { default: jsPDF } =
    await import("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm");
  const { default: autoTable } =
    await import("https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/+esm");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const date = new Date().toLocaleDateString("mn-MN");

  // Title page header
  doc.setFillColor(67, 56, 202);
  doc.rect(0, 0, 297, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("Admin Тайлан", 14, 14);
  doc.setFontSize(10);
  doc.text(`Огноо: ${date}`, 14, 22);

  let y = 38;

  // Summary stats
  if (stats) {
    doc.setTextColor(30, 30, 60);
    doc.setFontSize(13);
    doc.text("Нийт статистик", 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["Үзүүлэлт", "Тоо"]],
      body: [
        ["Нийт хэрэглэгч", stats.totalUsers],
        ["Нийт төсөл", stats.totalProjects],
        ["Нийт даалгавар", stats.totalTasks],
        ["Дууссан даалгавар", stats.tasksByStatus.completed],
        ["Хүндрэлтэй даалгавар", stats.tasksByStatus.stuck],
        ["Ирц — Ирсэн", stats.attendanceStats.present],
        ["Ирц — Тасалсан", stats.attendanceStats.absent],
      ],
      theme: "striped",
      headStyles: { fillColor: [67, 56, 202] },
      styles: { font: "helvetica", fontSize: 10 },
      margin: { left: 14 },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // New page: Users
  doc.addPage();
  doc.setFillColor(67, 56, 202);
  doc.rect(0, 0, 297, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.text("Хэрэглэгчид", 14, 13);

  autoTable(doc, {
    startY: 25,
    head: [["Нэр", "Имэйл", "Алба", "Дүр"]],
    body: users
      .slice(0, 50)
      .map((u) => [
        `${u.last_name || ""} ${u.first_name || ""}`.trim() || u.username,
        u.email,
        u.department_name || "-",
        u.role,
      ]),
    theme: "striped",
    headStyles: { fillColor: [67, 56, 202] },
    styles: { fontSize: 9 },
    margin: { left: 14 },
  });

  // New page: Projects
  doc.addPage();
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 297, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.text("Төслүүд", 14, 13);

  const PROJECT_STATUS = {
    new: "Шинэ",
    in_progress: "Хийгдэж буй",
    maintenance: "Арчилгаа",
    half_balance: "Хагас",
    completed: "Дууссан",
  };
  autoTable(doc, {
    startY: 25,
    head: [["Нэр", "Статус", "Эхлэх огноо", "Даалгавар", "Явц%"]],
    body: projects.map((p) => [
      p.title,
      PROJECT_STATUS[p.status] || p.status,
      p.start_date || "-",
      p.taskCount ?? "-",
      `${p.progress ?? 0}%`,
    ]),
    theme: "striped",
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 9 },
    margin: { left: 14 },
  });

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`admin-report-${dateStr}.pdf`);
}

// ─── WORD (DOCX) EXPORT ────────────────────────────────────────────────────────
export async function exportWord(stats, users, projects, tasks) {
  // Use docx library via CDN
  const docxLib = await import("https://cdn.jsdelivr.net/npm/docx@8.5.0/+esm");
  const {
    Document,
    Packer,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    TextRun,
    HeadingLevel,
    WidthType,
    AlignmentType,
    BorderStyle,
  } = docxLib;

  const cellStyle = (text, bold = false, color = "000000") =>
    new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({ text: String(text ?? ""), bold, color, size: 20 }),
          ],
          alignment: AlignmentType.LEFT,
        }),
      ],
      width: { size: 25, type: WidthType.PERCENTAGE },
    });

  const headerRow = (cols, fillColor = "4338CA") =>
    new TableRow({
      children: cols.map(
        (c) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: c,
                    bold: true,
                    color: "FFFFFF",
                    size: 20,
                  }),
                ],
              }),
            ],
            shading: { fill: fillColor },
          }),
      ),
      tableHeader: true,
    });

  const PROJECT_STATUS = {
    new: "Шинэ",
    in_progress: "Хийгдэж буй",
    maintenance: "Арчилгаа",
    half_balance: "Хагас",
    completed: "Дууссан",
  };

  const sections = [
    // Title
    new Paragraph({ text: "ADMIN ТАЙЛАН", heading: HeadingLevel.HEADING_1 }),
    new Paragraph({
      text: `Огноо: ${new Date().toLocaleDateString("mn-MN")}`,
      spacing: { after: 400 },
    }),

    // Summary
    new Paragraph({ text: "Нийт статистик", heading: HeadingLevel.HEADING_2 }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        headerRow(["Үзүүлэлт", "Тоо"], "4338CA"),
        ...(stats
          ? [
              ["Нийт хэрэглэгч", stats.totalUsers],
              ["Нийт төсөл", stats.totalProjects],
              ["Нийт даалгавар", stats.totalTasks],
              ["Дууссан даалгавар", stats.tasksByStatus?.completed],
              ["Хүндрэлтэй (Stuck)", stats.tasksByStatus?.stuck],
              ["Ирц — Ирсэн", stats.attendanceStats?.present],
              ["Ирц — Тасалсан", stats.attendanceStats?.absent],
            ]
          : []
        ).map(
          ([label, val]) =>
            new TableRow({
              children: [cellStyle(label, true), cellStyle(val)],
            }),
        ),
      ],
    }),

    new Paragraph({ text: "", spacing: { after: 300 } }),

    // Users
    new Paragraph({ text: "Хэрэглэгчид", heading: HeadingLevel.HEADING_2 }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        headerRow(["Нэр", "Имэйл", "Алба", "Дүр"]),
        ...users.slice(0, 30).map(
          (u) =>
            new TableRow({
              children: [
                cellStyle(
                  `${u.last_name || ""} ${u.first_name || ""}`.trim() ||
                    u.username,
                ),
                cellStyle(u.email),
                cellStyle(u.department_name || "-"),
                cellStyle(u.role),
              ],
            }),
        ),
      ],
    }),

    new Paragraph({ text: "", spacing: { after: 300 } }),

    // Projects
    new Paragraph({ text: "Төслүүд", heading: HeadingLevel.HEADING_2 }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        headerRow(["Нэр", "Статус", "Эхлэх огноо", "Явц %"], "059669"),
        ...projects.map(
          (p) =>
            new TableRow({
              children: [
                cellStyle(p.title),
                cellStyle(PROJECT_STATUS[p.status] || p.status),
                cellStyle(p.start_date || "-"),
                cellStyle(`${p.progress ?? 0}%`),
              ],
            }),
        ),
      ],
    }),
  ];

  const doc = new Document({ sections: [{ children: sections }] });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `admin-report-${new Date().toISOString().slice(0, 10)}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
