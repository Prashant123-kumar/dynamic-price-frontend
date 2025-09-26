// src/api.js
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

// Predict function
export async function predict(features) {
  try {
    const response = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ features })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("Error calling API:", err);
    return { error: err.message };
  }
}

// Health check (optional, for testing backend connection)
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return await response.json();
  } catch (err) {
    return { error: "Backend not reachable" };
  }
}
