import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Export a clinical care-plan PDF bundle.
 * bundle = {
 *   title: "FLACC Pain Assessment",
 *   source: "Merkel 1997 · IAP/F&L/Harriet Lane",
 *   weight: 20,
 *   total: 8,
 *   interpretation: "Severe (7–10)",
 *   band: "severe" | "emerald" | "amber" | "red" | "mild" | "moderate",
 *   findings: [["Face", "Frequent grimace"], ...],
 *   nonPharm: ["Distraction", ...],
 *   drugs: [{ name, dose, route, note }],
 *   additionalNotes: ["..."],
 * }
 */
export function exportCarePlanPDF(bundle) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();

  // Header
  const bandColor = {
    emerald: [47, 158, 68], mild: [47, 158, 68],
    amber: [247, 103, 7], moderate: [247, 103, 7],
    red: [224, 49, 49], severe: [224, 49, 49],
  };
  const color = bandColor[bundle.band] || [26, 29, 32];

  doc.setFillColor(26, 29, 32);
  doc.rect(0, 0, w, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Clinical Care Plan", 40, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${bundle.title}`, 40, 48);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()} · Weight: ${bundle.weight} kg`, 40, 62);

  // Colored band with interpretation
  doc.setFillColor(...color);
  doc.rect(0, 70, w, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`Total ${bundle.total} — ${bundle.interpretation}`, 40, 93);

  // Source
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.text(`Source: ${bundle.source}`, 40, 124);

  let y = 140;

  // Findings table
  if (bundle.findings?.length) {
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Assessment Findings", 40, y);
    autoTable(doc, {
      startY: y + 8,
      head: [["Domain", "Finding"]],
      body: bundle.findings,
      theme: "grid",
      headStyles: { fillColor: [40, 40, 40], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 5 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 140 } },
    });
    y = doc.lastAutoTable.finalY + 16;
  }

  // Non-pharm
  if (bundle.nonPharm?.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Non-pharmacological Measures", 40, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    bundle.nonPharm.forEach((n) => {
      doc.text(`• ${n}`, 50, y);
      y += 14;
    });
    y += 4;
  }

  // Drugs
  if (bundle.drugs?.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Recommended Drugs (${bundle.weight} kg)`, 40, y);
    autoTable(doc, {
      startY: y + 8,
      head: [["Drug", "Dose", "Route", "Note"]],
      body: bundle.drugs.map((d) => [d.name, d.dose, d.route || "—", d.note || ""]),
      theme: "striped",
      headStyles: { fillColor: color, textColor: 255 },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 0: { fontStyle: "bold" }, 1: { textColor: color, fontStyle: "bold" } },
    });
    y = doc.lastAutoTable.finalY + 16;
  }

  // Additional notes
  if (bundle.additionalNotes?.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Additional Notes", 40, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    bundle.additionalNotes.forEach((n) => {
      const lines = doc.splitTextToSize(`• ${n}`, w - 80);
      doc.text(lines, 50, y);
      y += 14 * lines.length;
    });
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "PED.RESUS · Reference only. Verify against local formularies before administration.",
      40,
      doc.internal.pageSize.getHeight() - 20
    );
    doc.text(`Page ${i}/${pageCount}`, w - 60, doc.internal.pageSize.getHeight() - 20);
  }

  const fname = bundle.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  doc.save(`care-plan-${fname}-${bundle.weight}kg.pdf`);
}
