/**
 * Nadesoft lead form -> Google Sheets
 *
 * SETUP
 * 1. Create a new Google Sheet (e.g. "Nadesoft Leads"). In row 1, add headers:
 *    Timestamp | Name | Email | Engagement Type | Project Brief
 * 2. In the Sheet, go to Extensions > Apps Script.
 * 3. Delete any starter code and paste this entire file in.
 * 4. Click Deploy > New deployment.
 *    - Select type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Click Deploy, authorize the permissions Google asks for.
 * 6. Copy the "Web app URL" it gives you (ends in /exec).
 * 7. In index.html, find SHEET_ENDPOINT near the bottom <script> tag and
 *    replace 'YOUR_DEPLOYMENT_ID' in the URL with your deployed URL.
 *
 * If you edit this script later, you must create a new deployment
 * (or use "Manage deployments" > edit > new version) for changes to go live.
 */
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var params = e.parameter;

  sheet.appendRow([
    new Date(),
    params.name || '',
    params.email || '',
    params.engagement_type || '',
    params.project_brief || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
