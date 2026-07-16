/**
 * pages/api/upload.js
 * -----------------------------------------------------------------------
 * Data upload analysis endpoint. Receives parsed file data (headers and
 * sample rows) and uses the AI to analyze the dataset, identify patterns,
 * assess stadium operations relevance, and provide recommendations.
 * -----------------------------------------------------------------------
 */

const { callLLM } = require("../../lib/llm");
const { API_LIMITS } = require("../../lib/constants");
const { logError } = require("../../lib/logger");

/**
 * Handle POST requests for uploaded data analysis.
 * @param {import('next').NextApiRequest} req - Next.js API request
 * @param {import('next').NextApiResponse} res - Next.js API response
 * @returns {Promise<void>}
 */
async function handler(req, res) {
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
    if (headers.length > API_LIMITS.MAX_UPLOAD_COLUMNS) {
      return res.status(400).json({ error: `Too many columns. Maximum allowed is ${API_LIMITS.MAX_UPLOAD_COLUMNS}.` });
    }
    if (sampleRows.length > API_LIMITS.MAX_UPLOAD_SAMPLE_ROWS) {
      return res.status(400).json({ error: `Too many sample rows. Maximum allowed is ${API_LIMITS.MAX_UPLOAD_SAMPLE_ROWS}.` });
    }
    if (typeof totalRows !== "number" || totalRows < 0) {
      return res.status(400).json({ error: "totalRows must be a non-negative number." });
    }

    // Clean inputs
    const cleanFileName = String(fileName || "uploaded_data").replace(/[^a-zA-Z0-9_\-\.]/g, "").slice(0, API_LIMITS.MAX_FILENAME_LENGTH);
    const cleanHeaders = headers.map(h => String(h).replace(/<[^>]*>/g, "").slice(0, API_LIMITS.MAX_HEADER_LENGTH));
    const cleanSampleRows = sampleRows.map(row => {
      if (typeof row !== "object" || row === null) { return {}; }
      const newRow = {};
      Object.keys(row).forEach(k => {
        const cleanKey = String(k).replace(/<[^>]*>/g, "").slice(0, API_LIMITS.MAX_HEADER_LENGTH);
        newRow[cleanKey] = String(row[k]).replace(/<[^>]*>/g, "").slice(0, API_LIMITS.MAX_CELL_VALUE_LENGTH);
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
    logError("/api/upload", "Failed to analyze uploaded data", err);
    return res.status(500).json({
      error: "Could not analyze uploaded data.",
      detail: err.message,
    });
  }
}

module.exports = handler;
