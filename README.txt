Clinic Financial Care Plan Generator

How to use
1. Extract this folder anywhere on your computer.
2. Double-click "Start Clinic App.bat".
3. The app opens in your default web browser.
4. Select an insurance company, enter benefits, adjust CPT quantities if needed, and print or save the estimate.

What's included
- Your uploaded fee schedule converted into an offline web app
- 47 insurance fee schedules from "Fee Schedule - Updated 03.16.2026.xlsx"
- Standard 24-visit corrective plan preloaded
- Editable CPT quantities for all codes listed in the fee sheet
- Non-covered items preloaded:
  - Radiologist Fee $50
  - Stim Pad Fee $15
  - Custom Orthotics $339

Important assumptions
- 99213-25 uses the 99213 allowed amount because the workbook listed 99213 instead of 99213-25.
- Blank payer cells are treated as not covered / no estimate available.
- Payer-specific spreadsheet notes are shown in the Notes column when present.

Files
- index.html: main application
- styles.css: styling
- app.js: calculator logic
- data.js: fee schedule data
- Start Clinic App.bat: double-click launcher



Version 2 additions:
- Enter your clinic name and patient name, then print a branded Financial Care Plan Agreement.
- The printed agreement only shows services with units greater than zero.
- Signature lines are included for patient/responsible party and clinic representative.


Version 3 updates:
- Default clinic name set to Chiropractic Company.
- Added quantity-based non-covered/self-pay items including 98941, 98943, 97110, G0283, 97012, 99213, 99203, and Supportive E/M.
- Printed agreement only shows services with units and non-covered items with quantities greater than 0.


Version 12 updates:
- Print agreement now shows total cost at full fees, total allowed amount, and estimated patient responsibility instead of an itemized insurance service table.
- Added average cost per visit to payment options.
- Updated full fee amounts for all CPT codes provided by the clinic.


Version 13 fixed updates:
- Removed the clinic representative signature line and its date line from the printable agreement.
- Default payment plan options changed to 3 months and 6 months.
- Comprehensive package restored with all required files.


Version 13 no-logo update:
- Removed the Chiropractic Company logo from the printable agreement header.
- Kept all V13 functionality intact, including calculations, full-fee totals, 3- and 6-month defaults, and signature layout.


Version 14 updates:
- Changed the on-screen layout so the major sections stack vertically from top to bottom instead of side by side.
- Restored the itemized service table on the printable agreement.
- Updated Total Cost at Full Fees to include non-covered services at full-fee amounts where applicable.


Version 15 updates:
- Changed Stim Pad Fee to $15.82.
- Added a new non-covered option for Custom Orthotics (2 Pairs) at $559.
- Updated Average Cost per Visit to use the combined total of covered and non-covered 98941 visits.

Version 16 updates:
- Added OTHER non-covered option with custom description and amount.


Version 17 updates:
- Added a working OTHER non-covered option with custom description, amount ($0-$1000), and quantity.
- OTHER now correctly flows into patient totals and the printed agreement.
- Added autosave for commonly used OTHER entries using your browser's local storage, with suggestions when you reuse them.

Version 18 updates:
- Removed the extra nonfunctional blank row under OTHER custom non-covered line item.


Version 19 updates:
- Pay-in-full discount now applies only to non-covered services, not insurance-covered services.
- Reduced on-screen font sizes, spacing, padding, and boxes by roughly 25% for less scrolling.
- Added a subtle semi-transparent spinal anatomy background design for the on-screen app.


Version 20 updates:
- Made the white panel/window backgrounds more transparent so more of the background design shows through.
- Matched the Non-covered / Self-Pay box sizing and font sizing to the smaller compact UI scale.
