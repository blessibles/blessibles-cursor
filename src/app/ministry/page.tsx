"use client";
import { useState } from "react";

export default function MinistryPage() {
  const [form, setForm] = useState({ name: "", organization: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Simulate submission (replace with real API/email logic as needed)
    if (!form.name || !form.organization || !form.email || !form.message) {
      setError("Please fill in all fields.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-blue-50 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-blue-900 mb-4 text-center">Ministry Partnerships & Bulk Pricing</h1>
        <p className="mb-6 text-blue-800 text-center">
          Blessibles is honored to support churches, ministries, and Christian organizations with special partnership opportunities and bulk pricing on our faith-filled printables. Whether you're equipping a Sunday school, planning a retreat, or blessing your community, we're here to help!
        </p>
        <ul className="mb-6 list-disc list-inside text-blue-700">
          <li>Discounted bulk pricing for large orders</li>
          <li>Custom packages for events, classes, or outreach</li>
          <li>Exclusive resources for ministry partners</li>
        </ul>
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Request More Information</h2>
          {submitted ? (
            <div className="text-green-700 font-semibold">Thank you! We've received your request and will be in touch soon.</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-blue-900 font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-blue-900 font-medium mb-1">Organization</label>
                <input
                  type="text"
                  name="organization"
                  value={form.organization}
                  onChange={handleChange}
                  className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-blue-900 font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-blue-900 font-medium mb-1">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  rows={4}
                  required
                />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <button
                type="submit"
                className="w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-800 transition"
              >
                Send Request
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 