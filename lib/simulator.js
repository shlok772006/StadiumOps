/**
 * lib/simulator.js
 * Fallback simulator providing high-fidelity mock AI responses in keyless demo mode.
 * Extracted from llm.js to improve codebase maintainability and modularity.
 */

/**
 * High-fidelity AI response simulator for keyless demo mode.
 * Provides realistic mock responses matching each AI module's expected output format.
 * @param {Object} opts
 * @param {string} opts.system - the system prompt identifying the module
 * @param {Array<{role: string, content: string}>} opts.messages - conversation history
 * @returns {string} simulated AI text response
 */
function simulateAIResponse({ system, messages }) {
  const lastMsg = messages[messages.length - 1]?.content || "";
  const query = lastMsg.toLowerCase();

  // 1. Dashboard Briefing
  if (system.includes("operational intelligence")) {
    return `• Gate B and Gate D are currently showing elevated density (92% occupancy) with average wait times reaching 18 minutes. Recommendation: Dispatch 4 support stewards to concourse B and D immediately to manage queue lanes.
• Shuttle Bus Route 2 is reporting a 5-minute delay due to congestion on Route 3 exit lanes. Shuttle bus load is at 90%. Recommendation: Notify gate staff to suggest Metro lines to departing fans.
• Concession vendor Concession South is reporting low stock (45% remaining). Stock levels will fall below critical line during halftime. Recommendation: Instruct back-house logistics to replenish beverage inventory.
• Weather conditions are stable at 26°C with 60% humidity. Forecast remains favorable for the rest of match hours.`;
  }

  // 2. Emergency Action Plan
  if (system.includes("real-time decision support")) {
    return `1. Alert medical response team 2 near the North gate area.
2. Establish a clear 3-meter pathway to allow rapid entry and exit of the emergency team.
3. Instruct stewards near the affected section to gently guide fans to clear the immediate corridor.
4. Prepare the stretcher and AED transport.
5. Update central command room with a status report on patient stability within 2 minutes.

Estimated response time: 2.5 minutes.`;
  }

  // 3. Crowd Analytics
  if (system.includes("predictive analytics")) {
    return `### 1. CURRENT STATUS
Gates B, D, and F are currently at high-density thresholds (>90%). Flow rates remain elevated across all north gates. Average wait time across the venue is 12.5 minutes.

### 2. PREDICTION (NEXT 60 MIN)
- **Next 15 min**: Density at Gates B and D will peak and stabilize as entry shifts to inner seating bowls.
- **Next 30 min**: Kickoff arrival surge will subside; gates will transition to normal flow (<50%).
- **Next 60 min**: Entry gates completely clear. Concourse concessions will experience peak demand.

### 3. RECOMMENDATIONS
- Reroute incoming fans from Gate B to Gate C (currently 32% occupancy).
- Reallocate 3 volunteers from Gate E to Gate D for queue line management.
- Highlight alternative concessions on digital signage to redistribute halftime demand.`;
  }

  // 4. Report Generation
  if (system.includes("report generation")) {
    return `# MATCH DAY OPERATIONS REPORT

**Tournament**: FIFA World Cup 2026
**Match**: Argentina vs. France
**Venue**: MetLife Stadium
**Generated At**: ${new Date().toLocaleString()}

## 1. Executive Summary
Operations completed successfully. Gates processed entry flow within target times with peak congestion managed dynamically.

## 2. Gate Congestion Summary
- **Gate A/C/E/G/H**: Maintained normal green/busy thresholds. Average wait time: 8.5 minutes.
- **Gate B/D/F**: Experienced peak loads during 18:30-18:50 surge. Average wait time peaked at 18 minutes.

## 3. Incident Summary
- A minor medical emergency was resolved near Gate A. Response time was 2.5 minutes.

## 4. Operational Recommendations
- For high-demand matchdays, pre-emptively redirect Gate B queues to Gate C 10 minutes earlier.
- Scale up concession staff near south zones prior to halftime.`;
  }

  // 5. Data Upload Analysis
  if (system.includes("data analysis module")) {
    return `### 1. DATA SUMMARY
The uploaded dataset has been parsed successfully. It contains gate occupancy metrics, queue lengths, and processing rates.

### 2. KEY INSIGHTS
- Peak gate occupancy occurred between 18:15 and 18:45.
- Wait times are highly correlated with processing rates rather than base gate capacities.

### 3. RELEVANCE & RECOMMENDATION
Deploy 2 additional ticket-scanning personnel to gates during the 30-minute pre-kickoff window to prevent backlog.`;
  }

  // 6. Chat Bot Assistant
  if (query.includes("gate") || query.includes("congest") || query.includes("crowd")) {
    return `Currently, Gate B and Gate D are experiencing high density (92%). I recommend redirecting fans entering from the east side to Gate C (32% density, 7m wait time). This will save them approximately 11 minutes in queue time.`;
  }

  if (query.includes("exit") || query.includes("route") || query.includes("section")) {
    return `For Section S2, the fastest exit route is via Gate C. Gate C has a wait time of only 7 minutes and is currently operating at normal flow capacity. Avoid Gate B, which is currently at critical occupancy.`;
  }

  if (query.includes("staff") || query.includes("volunteer")) {
    return `Based on live gate metrics, I recommend reallocating 3 volunteers from Gate E (accessible entry, currently normal flow) to Gate D to assist with queue management and fan routing.`;
  }

  if (query.includes("vendor") || query.includes("food") || query.includes("drink")) {
    return `concession vendor 'Concession South' near Gate D has low stock (45% remaining). I recommend directing the replenishment team to deliver 2 crates of soft drinks prior to the halftime rush.`;
  }

  return `I am StadiumOps AI. I can assist you with real-time crowd management, incident support, and operational analysis for the Argentina vs. France match. Ask me about gates, wait times, nearest amenities, or emergency protocols.`;
}

module.exports = { simulateAIResponse };
