import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DRUGS, computeDrugDose } from "../data/drugs";
import { estimateAge, estimateETT, estimateDepth, minSBP } from "./calc";
import { maintenanceFluid } from "../data/fluids";
import { zoneForWeight } from "../data/broselow";

export function exportPatientCasePDF(weight) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(26, 29, 32);
  doc.rect(0, 0, pageWidth, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Pediatric Emergency Dose Sheet", 40, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 50);

  // Patient Snapshot
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Patient Snapshot", 40, 100);

  const zone = zoneForWeight(weight);
  const snapshot = [
    ["Weight", `${weight} kg`],
    ["Estimated Age", estimateAge(weight)],
    ["Broselow Zone", `${zone.label} (${zone.weightLabel})`],
    ["ETT Size (est.)", `${estimateETT(weight)} mm ID`],
    ["ETT Depth (oral)", `${estimateDepth(weight)} cm`],
    ["Min Systolic BP", `${minSBP(weight)} mmHg`],
    ["Maintenance Fluid (4-2-1)", `${maintenanceFluid(weight)} mL/hr`],
    ["Blood Volume (est.)", `${Math.round(weight * 80)} mL`],
    ["Defibrillation (4 J/kg)", `${Math.min(weight * 4, 200).toFixed(0)} J`],
  ];

  autoTable(doc, {
    startY: 110,
    head: [["Parameter", "Value"]],
    body: snapshot,
    theme: "grid",
    headStyles: { fillColor: [25, 113, 194], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 180 } },
  });

  // Drug doses
  const afterSnapshot = doc.lastAutoTable.finalY + 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Calculated Drug Doses", 40, afterSnapshot);

  const drugRows = DRUGS.map((d) => [
    d.name,
    d.indication,
    computeDrugDose(d, weight),
    d.route || "",
  ]);

  autoTable(doc, {
    startY: afterSnapshot + 10,
    head: [["Drug", "Indication", "Dose", "Route"]],
    body: drugRows,
    theme: "striped",
    headStyles: { fillColor: [224, 49, 49], textColor: 255 },
    styles: { fontSize: 8, cellPadding: 4 },
    alternateRowStyles: { fillColor: [248, 249, 250] },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "Reference only. Verify against local formularies before administration.",
      40,
      doc.internal.pageSize.getHeight() - 20
    );
    doc.text(
      `Page ${i}/${pageCount}`,
      pageWidth - 60,
      doc.internal.pageSize.getHeight() - 20
    );
  }

  doc.save(`ped-emergency-${weight}kg.pdf`);
}
