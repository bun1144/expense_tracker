"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// --- Types ---
type Expense = {
  id: number;
  header: string;
  description: string;
  category: "operation" | "financial" | "other";
  cost: string;
  date: string;
};

type Summary = {
  category: "operation" | "financial" | "other";
  total: number;
};

// --- Component ---
export default function Dashboard() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<Summary[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    header: "",
    description: "",
    category: "operation",
    cost: "",
    date: "",
  });

  const COLORS = ["#4f46e5", "#16a34a", "#f59e0b"]; // Operation, Financial, Other

  // --- Load Data ---
  const loadData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/");

    try {
      // Expenses
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/expense/list`;
      if (from && to) url += `?from=${from}&to=${to}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setExpenses(data.expenses || []);

      // Summary
      let summaryUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/expense/summary`;
      if (from && to) summaryUrl += `?from=${from}&to=${to}`;
      const sumRes = await fetch(summaryUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sumData = await sumRes.json();
      setSummary(sumData.summary || []);
    } catch (error) {
      console.error(error);
    }
  }, [from, to, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Add Expense ---
  const handleAddExpense = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/expense/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newExpense),
      });

      setShowModal(false);
      setNewExpense({
        header: "",
        description: "",
        category: "operation",
        cost: "",
        date: "",
      });

      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const total = expenses.reduce((acc, e) => acc + parseFloat(e.cost || "0"), 0);

  const pieData = summary.map((s) => ({
    name: s.category,
    value: parseFloat(s.total.toString()),
  }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 text-gray-800 font-sans p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700 drop-shadow-sm">
          💰 Expense Dashboard
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-2xl font-bold rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition"
        >
          +
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 items-center">
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border rounded px-3 py-2 shadow-sm"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border rounded px-3 py-2 shadow-sm"
        />
        <button
          onClick={loadData}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow-sm transition"
        >
          Filter
        </button>
        <button
          onClick={() => {
            setFrom("");
            setTo("");
          }}
          className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded shadow-sm"
        >
          Clear
        </button>
      </div>

      {/* Total */}
      <h2 className="text-xl font-semibold text-blue-600 mb-4">
        ยอดรวมทั้งหมด: ฿{total.toFixed(2)}
      </h2>

      {/* Pie Chart */}
      <div className="w-full h-64 mb-6 bg-white shadow rounded-lg p-4">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent, value }) =>
                `${name}: ฿${value.toFixed(2)} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `฿${value.toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Expenses Table */}
      <h3 className="text-lg font-semibold text-gray-700 mb-2">รายการทั้งหมด</h3>
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-blue-50 text-blue-700">
            <tr>
              <th className="border p-2">ชื่อรายการ</th>
              <th className="border p-2">เหตุผล</th>
              <th className="border p-2">หมวดหมู่</th>
              <th className="border p-2">จำนวนเงิน</th>
              <th className="border p-2">วันที่</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr
                key={e.id}
                className={`hover:bg-slate-50 transition ${
                  e.category === "operation"
                    ? "bg-purple-50"
                    : e.category === "financial"
                    ? "bg-green-50"
                    : "bg-yellow-50"
                }`}
              >
                <td className="border p-2">{e.header}</td>
                <td className="border p-2">{e.description}</td>
                <td className="border p-2 capitalize">{e.category}</td>
                <td className="border p-2 text-right">{parseFloat(e.cost).toFixed(2)}</td>
                <td className="border p-2">
                  {new Date(e.date).toLocaleDateString("th-TH")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-96 space-y-3">
            <h2 className="text-xl font-bold text-blue-600 mb-2">เพิ่มรายการใหม่</h2>

            <input
              type="text"
              placeholder="ชื่อรายการ"
              value={newExpense.header}
              onChange={(e) => setNewExpense({ ...newExpense, header: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            />

            <input
              type="text"
              placeholder="เหตุผล / รายละเอียด"
              value={newExpense.description}
              onChange={(e) =>
                setNewExpense({ ...newExpense, description: e.target.value })
              }
              className="w-full border px-3 py-2 rounded"
            />

            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="operation">Operation</option>
              <option value="financial">Financial</option>
              <option value="other">Other</option>
            </select>

            <input
              type="number"
              placeholder="จำนวนเงิน"
              value={newExpense.cost}
              onChange={(e) => setNewExpense({ ...newExpense, cost: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            />

            <input
              type="date"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            />

            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddExpense}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
