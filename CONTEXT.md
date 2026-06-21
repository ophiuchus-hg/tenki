# Mobile Road Weather Forecast

This context describes a new smartphone-only roadway weather forecast display built from the Forecast CSV, using the pasted desktop HTML only as a display reference.

## Language

**72-Hour Forecast Table**:
The tabular roadway weather forecast that keeps hourly forecast columns across a 72-hour horizon, with weather elements shown as rows per forecast point.
_Avoid_: Mobile cards, simplified forecast feed

**Forecast CSV**:
The fixed-name `forecast.csv` source data file bundled with the Smartphone-Only Site. It provides the forecast rows, hourly columns, section names, weather elements, and values used for rendering; updating the file is handled outside this site, and the site must prevent stale cached CSV data.
_Avoid_: HAR response, live JSON API

**Cached Forecast Fallback**:
The previous successfully loaded Forecast CSV stored on the device. If the latest `forecast.csv` fetch fails, the site may render this cached data while clearly indicating that the latest data could not be retrieved.
_Avoid_: Silent stale data

**Announcement Time**:
The publication time read from the Forecast CSV, shown persistently in the mobile header so users can confirm which forecast issuance they are viewing.
_Avoid_: Hidden metadata

**Pasted Display HTML**:
The reference for how the current desktop forecast table is rendered. It is used for display behavior and layout comparison, while the Forecast CSV remains the data source.
_Avoid_: Source data

**Smartphone-Only Site**:
The new forecast site targeted only at smartphone portrait viewing. Desktop layouts and desktop behavior are outside the scope.
_Avoid_: Responsive desktop adaptation

**Simple Static Implementation**:
The site implementation style: plain HTML, CSS, and JavaScript with no React, Vue, or build step required.
_Avoid_: Framework app

**Safe-Area Table Padding**:
The bottom padding inside the table scroll area that prevents the final rows from being hidden by smartphone browser UI or the iPhone home indicator.
_Avoid_: Edge-to-edge clipped table

**Mobile Portrait Table**:
A compact version of the 72-Hour Forecast Table for smartphone portrait screens that preserves the table model as one continuous table while reducing cell width through abbreviation, iconography, and controlled horizontal scrolling.
_Avoid_: Responsive cards, stacked timeline

**Pinned Identity Columns**:
The non-scrolling columns on the left side of the Mobile Portrait Table. For this forecast table, only the road section and weather element remain pinned; the road section may wrap so hourly data columns remain as visible as possible, while the office column, forecast point column, route column, and aggregate element columns are omitted.
_Avoid_: All summary columns, desktop left columns

**Mobile Weather Elements**:
The hourly element rows shown in the Mobile Portrait Table. Precipitation amount, wind direction, and wind speed are omitted on mobile; remaining hourly weather and road-condition data stay visible. Weather values are displayed exactly as supplied by the Forecast CSV until a complete icon mapping is provided, while road-condition values are abbreviated for compact hourly cells.
_Avoid_: Full desktop element set

**Mobile Element Label**:
The shortened label for a weather element in the pinned element column. `降雪量(cm/h)` is displayed as `降雪`; other retained elements use compact labels such as `天気`, `気温`, `路温`, and `路面`.
_Avoid_: Full CSV element labels

**Blank Snowfall Dash**:
The mobile rendering rule for snowfall values. A CSV value of `-` in the snowfall row is displayed as an empty cell.
_Avoid_: Dash-filled snowfall rows

**Road Condition Abbreviation**:
The mobile display form of a road-condition value. It is always the first character of the road-condition text supplied by the Forecast CSV.
_Avoid_: Hand-maintained road-condition mapping

**Mobile Road Section Name**:
The shortened road section label used in the pinned road section column. It keeps only the section endpoints, omits forecast point and expressway names, normalizes known district names such as `須坂長野東` to `須坂`, `信州中野` to `中野`, `豊田飯山` to `飯山`, and `更埴JCT` to `更埴`, and renders the endpoints vertically with a separator line instead of the `〜` character.
_Avoid_: Full route label, forecast point label

**Sticky Date Header**:
The date-range header above hourly forecast columns that scrolls horizontally until it reaches the pinned identity columns, then remains visible until the next date header pushes it away. It includes the weekday; weekdays are black, Saturdays are blue, and Sundays are red.
_Avoid_: Static table header, hidden date row

**Section Filter**:
A compact control that lets the user choose which road sections appear in the single Mobile Portrait Table. It is opened from a small always-visible filter icon in the top-right of the mobile view, and filtering hides or shows whole section row groups, not individual weather-element rows.
_Avoid_: Point filter, route filter

**Excluded Road Sections**:
Road sections that are never shown in the Smartphone-Only Site even if they exist in the Forecast CSV. The excluded sections are `松井田妙義〜碓氷軽井沢`, `碓氷軽井沢〜佐久`, `佐久〜東部湯の丸・佐久小諸JCT〜小諸御影TB`, and `東部湯の丸〜坂城`.
_Avoid_: User-toggleable hidden sections

**Persisted Section Selection**:
The saved Section Filter state for this page on a device. The mobile view restores the user's selected road sections on the next visit; other forecast pages are outside the scope of this design.
_Avoid_: Session-only filter

**Display Size Setting**:
A saved display-density control inside the filter bottom sheet. It lets the user choose a site-managed table size such as small, standard, or large; browser pinch zoom remains temporary and is not restored by the site.
_Avoid_: Restored browser zoom

**Initial Section Selection**:
The default Section Filter state before the user has saved a preference. All road sections are visible.
_Avoid_: Empty initial table

**Empty Section Selection**:
The state where the Section Filter has no selected road sections. It is allowed, and the mobile view shows an empty-state message instead of the table.
_Avoid_: Forced selection
