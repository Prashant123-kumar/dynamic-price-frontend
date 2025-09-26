// src/App.js
import React, { useState } from "react";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:5000";

/* small choices */
const FAT_CHOICES = ["Regular", "Low Fat", "Non-Edible"];
const ITEM_TYPES = ["Baking Goods","Breads","Breakfast","Dairy","Soft Drinks","Meat","Fruits and Vegetables","Snack Foods","Household","Health and Hygiene","Others"];
const OUTLET_SIZES = ["Small","Medium","High"];
const OUTLET_LOCATIONS = ["Tier 1","Tier 2","Tier 3"];
const OUTLET_TYPES = ["Grocery Store","Supermarket Type1","Supermarket Type2","Supermarket Type3"];

const PRESETS = [
  {
    id: "preset_1",
    label: "Baking (FDW12)",
    features: {
      Item_Identifier: "FDW12",
      Item_Weight: null,
      Item_Fat_Content: "Regular",
      Item_Visibility: 0.035399923,
      Item_Type: "Baking Goods",
      Item_MRP: 144.5444,
      Outlet_Establishment_Year: 1985,
      Outlet_Size: "Medium",
      Outlet_Location_Type: "Tier 3",
      Outlet_Type: "Supermarket Type3",
      Outlet_Age: 40,
      avg_sales_by_item: 0.0,
      avg_sales_by_outlet_item: 0.0,
      item_category_aggregates: 0.0,
      is_perishable: 0
    }
  },
  {
    id: "preset_2",
    label: "Grocery Small",
    features: {
      Item_Identifier: "GR01",
      Item_Weight: 0.75,
      Item_Fat_Content: "Low Fat",
      Item_Visibility: 0.02,
      Item_Type: "Household",
      Item_MRP: 45.0,
      Outlet_Establishment_Year: 2005,
      Outlet_Size: "Small",
      Outlet_Location_Type: "Tier 2",
      Outlet_Type: "Grocery Store",
      Outlet_Age: 20,
      avg_sales_by_item: 1.0,
      avg_sales_by_outlet_item: 0.5,
      item_category_aggregates: 0.2,
      is_perishable: 0
    }
  },
  {
    id: "preset_3",
    label: "Fresh Veg",
    features: {
      Item_Identifier: "FV02",
      Item_Weight: 1.2,
      Item_Fat_Content: "Non-Edible",
      Item_Visibility: 0.08,
      Item_Type: "Fruits and Vegetables",
      Item_MRP: 60.0,
      Outlet_Establishment_Year: 1998,
      Outlet_Size: "High",
      Outlet_Location_Type: "Tier 1",
      Outlet_Type: "Supermarket Type1",
      Outlet_Age: 27,
      avg_sales_by_item: 3.5,
      avg_sales_by_outlet_item: 2.2,
      item_category_aggregates: 1.1,
      is_perishable: 1
    }
  }
];

function formatNumber(n, digits = 2) {
  if (n === null || n === undefined) return "-";
  return Number(n).toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export default function App() {
  const [features, setFeatures] = useState(PRESETS[0].features);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function onChange(e) {
    const name = e.target.name;
    let value = e.target.value;
    const numericKeys = [
      "Item_Weight","Item_Visibility","Item_MRP","Outlet_Establishment_Year",
      "Outlet_Age","avg_sales_by_item","avg_sales_by_outlet_item","item_category_aggregates","is_perishable"
    ];
    if (numericKeys.includes(name)) {
      value = value === "" ? null : Number(value);
    }
    setFeatures(prev => ({ ...prev, [name]: value }));
  }

  function applyPreset(preset) {
    setFeatures({ ...preset.features });
    setResult(null);
    setError(null);
  }

  function validate(f) {
    if (!f.Item_Identifier || String(f.Item_Identifier).trim() === "") return "Item Identifier is required.";
    if (f.Item_MRP == null || Number.isNaN(f.Item_MRP)) return "Item MRP must be a number.";
    return null;
  }

  async function predict() {
    setError(null);
    setResult(null);
    const v = validate(features);
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features })
      });

      const text = await resp.text();
      let json;
      try { json = JSON.parse(text); } catch { throw new Error("Server returned non-JSON response: " + text); }
      if (!resp.ok) throw new Error(json?.error || `Server error ${resp.status}`);
      setResult(Array.isArray(json) ? json[0] : json);
      // small confetti effect (basic)
      try {
        if (window.confetti && typeof window.confetti === "function") {
          window.confetti();
        }
      } catch {}
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  function copyResult() {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
  }

  return (
    
    <div className="app-root colorful">
      <div className="hero-section">
          <div className="hero-text-container">
            <h1>Dynamic Price Services</h1>
            <p>Empowering businesses with data-driven pricing strategies for optimal revenue.</p>
          </div>
      </div>

      <header className="hero">
        <div className="hero-inner">
          <div>
            <h1>Dynamic Pricing</h1>
            <p className="hero-sub">Smart prices powered by ML — see predicted sales & recommended dynamic price.</p>
            <div className="hero-badges">
              <span className="badge">Realtime</span>
              <span className="badge green">Model v1</span>
              <span className="badge">Alpha {formatNumber(0.05,2)}</span>
            </div>
          </div>
          <div className="hero-image" role="img" aria-label="pricing hero" />
        </div>
      </header>

      <main>
        <section className="left-panel">
          <div className="card">
            <div className="card-head">
              <h3>Inputs</h3>
              <div className="preset-row">
                {PRESETS.map(p => (
                  <button key={p.id} className="btn tiny" onClick={() => applyPreset(p)}>{p.label}</button>
                ))}
              </div>
            </div>

            <div className="grid">
              <div className="field"><label>Item Identifier</label><input name="Item_Identifier" value={features.Item_Identifier || ""} onChange={onChange}/></div>
              <div className="field"><label>Item Weight</label><input name="Item_Weight" value={features.Item_Weight ?? ""} onChange={onChange}/></div>

              <div className="field"><label>Item Fat Content</label><select name="Item_Fat_Content" value={features.Item_Fat_Content} onChange={onChange}>{FAT_CHOICES.map(x => <option key={x} value={x}>{x}</option>)}</select></div>
              <div className="field"><label>Item Visibility</label><input name="Item_Visibility" value={features.Item_Visibility ?? ""} onChange={onChange}/></div>

              <div className="field"><label>Item Type</label><select name="Item_Type" value={features.Item_Type} onChange={onChange}>{ITEM_TYPES.map(x => <option key={x} value={x}>{x}</option>)}</select></div>
              <div className="field"><label>Item MRP</label><input name="Item_MRP" value={features.Item_MRP ?? ""} onChange={onChange}/></div>

              <div className="field"><label>Outlet Year</label><input name="Outlet_Establishment_Year" value={features.Outlet_Establishment_Year ?? ""} onChange={onChange}/></div>
              <div className="field"><label>Outlet Size</label><select name="Outlet_Size" value={features.Outlet_Size} onChange={onChange}>{OUTLET_SIZES.map(x => <option key={x} value={x}>{x}</option>)}</select></div>

              <div className="field"><label>Outlet Location</label><select name="Outlet_Location_Type" value={features.Outlet_Location_Type} onChange={onChange}>{OUTLET_LOCATIONS.map(x => <option key={x} value={x}>{x}</option>)}</select></div>
              <div className="field"><label>Outlet Type</label><select name="Outlet_Type" value={features.Outlet_Type} onChange={onChange}>{OUTLET_TYPES.map(x => <option key={x} value={x}>{x}</option>)}</select></div>

              <div className="field"><label>Outlet Age</label><input name="Outlet_Age" value={features.Outlet_Age ?? ""} onChange={onChange}/></div>
              <div className="field"><label>Is Perishable (0/1)</label><input name="is_perishable" value={features.is_perishable ?? ""} onChange={onChange}/></div>
            </div>

            <div className="actions-row">
              <button className="btn primary" onClick={predict} disabled={loading}>{loading ? "Predicting..." : "Predict"}</button>
              <div className="muted small">{error ? <span className="error">Error: {error}</span> : "Fill inputs and predict"}</div>
            </div>
          </div>
        </section>

        <section className="right-panel">
          <div className={`result-card ${result ? "pop" : ""}`}>
            {!result ? (
              <div className="placeholder">
                <h4>No result yet</h4>
                <p className="muted">Use presets or fill the left form, then press Predict.</p>
              </div>
            ) : (
              <>
                <div className="result-top">
                  <div>
                    <div className="label-muted">Predicted Sales</div>
                    <div className="metric sales">{formatNumber(result.predicted_sales)}</div>
                  </div>

                  <div>
                    <div className="label-muted">Dynamic Price</div>
                    <div className="metric price">₹ {formatNumber(result.dynamic_price)}</div>
                  </div>
                </div>

                <pre className="json">{JSON.stringify(result, null, 2)}</pre>

                <div className="result-actions">
                  <button className="btn" onClick={copyResult}>Copy JSON</button>
                  <button className="btn ghost" onClick={() => { setResult(null); setError(null); }}>Clear</button>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <small>API: {API_BASE} • Local demo</small>
      </footer>
    </div>
  );
}