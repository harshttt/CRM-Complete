import { Transform } from "stream";
import ExcelJS from "exceljs";
import Lead from "../lead.model.js";
import Papa from "papaparse";
import { Parser } from "json2csv";
import BatchUpload from "../../batchUpload/batchUpload.model.js";

export class LeadExportService {

  
  /* =========================
   * EXPORT EXCEL
   * ========================= */
  static async exportExcel(leads = []) {
    const workbook = new ExcelJS.Workbook();

    //Leads
    const sheet = workbook.addWorksheet("Leads");

    sheet.columns = [
      { header: "Full Name", key: "fullName", width: 25 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Email", key: "email", width: 30 },
      { header: "Source", key: "source", width: 18 },
      { header: "Branch", key: "branch", width: 15 },
      { header: "Region", key: "region", width: 15 },
      { header: "Stage", key: "stage", width: 20 },
      { header: "Created At", key: "createdAt", width: 18 },
    ];

    //DATE FILTER ALREADY APPLIED IN finalFilter
    // const leads = await Lead.find(finalFilter).sort({ createdAt: -1 }).lean();

    leads.forEach((l) => {
      sheet.addRow({
        fullName: l.fullName,
        phone: l.phone,
        email: l.email || "",
        source: l.source,
        branch: l.branch || "",
        region: l.region || "",
        stage: l.stage,
        createdAt: l.createdAt
          ? new Date(l.createdAt).toISOString().split("T")[0]
          : "",
      });
    });

    sheet.getRow(1).font = { bold: true };

    sheet.views = [{ state: "frozen", ySplit: 1 }];
    // sheet.autoFilter = {
    //   from: "A1",
    //   to: "K1",
    // };

     const buffer = await workbook.xlsx.writeBuffer();

    return buffer;

    // return {
    //   workbook,
    //   fileName: `leads_export_${Date.now()}.xlsx`,
    // };
  }


  
  /* =========================
   * BULK IMPORT
   * ========================= */
  static async bulkImport(buffer, fileName, userId) {
    // Parse CSV
    const csvString = buffer.toString("utf8");
    const parsed = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
    });

    const rows = parsed.data || [];

    //Create batch record
    const batch = await BatchUpload.create({
      createdBy: userId,
      source: "csv_import",
      totalCount: rows.length,
      processedCount: 0,
      failedCount: 0,
      status: "processing",
      filePath: fileName,
    });

    let processedCount = 0;
    let failedCount = 0;  
    const failedRows = [];

    //Process rows
    for (const row of rows) {
      try {
        // Required validation
        if (!row.fullName || !row.phone) {
          failedCount++;
          failedRows.push({
            row,
            error: "fullName and phone are required",
          });
          continue;
        }

        // Duplicate detection
        const exists = await Lead.findOne({
          $or: [{ phone: row.phone }, { email: row.email }],
        });

        if (exists) {
          failedCount++;
          failedRows.push({
            row,
            error: "Duplicate lead (phone/email already exists)",
          });
          continue;
        }

        // Create lead
        await Lead.create({
          fullName: row.fullName,
          phone: row.phone,
          email: row.email || "",
          source: row.source || "other",
          budgetMin: Number(row.budgetMin) || null,
          budgetMax: Number(row.budgetMax) || null,
          branch: row.branch || null,
          region: row.region || null,
          projectName: row.projectName || "",
          sourceBatchId: batch._id,
          createdBy: userId,
          lastActivityAt: new Date(),
        });

        processedCount++;
      } catch (err) {
        failedCount++;
        failedRows.push({
          row,
          error: err.message || "Unknown error",
        });
      }
    }

    //Update batch summary
    batch.processedCount = processedCount;
    batch.failedCount = failedCount;
    batch.failedRows = failedRows;
    batch.status = "done";

    await batch.save();

    //Return response (safe + small)
    return {
      batchId: batch._id,
      totalRows: batch.totalCount,
      processedCount,
      failedCount,
      failedRowsPreview: failedRows.slice(0, 5),
    };
  }
}
