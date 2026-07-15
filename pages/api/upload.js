import { callLLM } from "../../lib/llm";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { fileName, headers, sampleRows, totalRows } = req.body || {};

    if (!headers || !sampleRows) {
      return res.status(400).json({ error: "headers and sampleRows are required." });
    }

    if (!Array.isArray(headers) || !Array.isArray(sampleRows)) {
      return res.status(400).json({ error: "headers and sampleRows must be arrays." });
    }

    // Input limitations and validation
    if (headers.length > 100) {
      return res.status(400).json({ error: "Too many columns. Maximum allowed is 100." });
    }
    if (sampleRows.length > 50) {
      return res.status(400).json({ error: "Too many sample rows. Maximum allowed is 50." });
    }
    if (typeof totalRows !== "number" || totalRows < 0) {
      return res.status(400).json({ error: "totalRows must be a non-negative number." });
    }

    // Clean inputs
    const cleanFileName = String(fileName || "uploaded_data").replace(/[^a-zA-Z0-9_\-\.]/g, "").slice(0, 100);
    const cleanHeaders = headers.map(h => String(h).replace(/<[^>]*>/g, "").slice(0, 50));
    const cleanSampleRows = sampleRows.map(row => {
      if (typeof row !== "object" || row === null) return {};
      const newRow = {};
      Object.keys(row).forEach(k => {
        const cleanKey = String(k).replace(/<[^>]*>/g, "").slice(0, 50);
        newRow[cleanKey] = String(row[k]).replace(/<[^>]*>/g, "").slice(0, 200);
      });
      return newRow;
    });

    const system = `You are the data analysis module of StadiumOps AI. A user has uploaded a dataset for analysis.
Analyze the data and provide:
1. DATA SUMMARY — What this data represents, key columns, and data types
2. KEY INSIGHTS — 3-5 notable patterns, outliers, or trends in the data
3. STADIUM OPERATIONS RELEVANCE — How this data could be used for crowd management, safety, or operations
4. RECOMMENDATIONS — Specific actions based on the data
5. DATA QUALITY — Any issues, missing values, or concerns

Use specific numbers from the data. Be concise but thorough.`;

    const userPrompt = `File: ${cleanFileName}
Total rows: ${totalRows}
Columns: ${cleanHeaders.join(", ")}

Sample data (first ${cleanSampleRows.length} rows):
${cleanSampleRows.map((row, i) => `Row ${i + 1}: ${JSON.stringify(row)}`).join("\n")}

Analyze this data now.`;

    const analysis = await callLLM({
      system,
      messages: [{ role: "user", content: userPrompt }],
      maxTokens: 800,
    });

    return res.status(200).json({ analysis });
  } catch (err) {
    console.error("[/api/upload] error:", err.message);
    return res.status(500).json({
      error: "Could not analyze uploaded data.",
      detail: err.message,
    });
  }
}
