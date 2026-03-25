import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../components/API";
import MenuNameCard2 from "../../components/MainCardOption/MenuNameCard2";
import SummaryCard from "../../components/Card/SummaryCard";

function MyAlertManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentTab, setCurrentTab] = useState("unread");
  const [severityFilter, setSeverityFilter] = useState("all");

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["myAlerts"],
    queryFn: async () => {
      const res = await api.get("/alerts/my");
      return res.data;
    },
    refetchInterval: 3000,
  });

  const handleAction = async (id, action, e) => {
    e.stopPropagation();
    try {
      if (action === "read") await api.put(`/alerts/${id}/read`);
      if (action === "delete") {
        if (!window.confirm("คุณต้องการลบบันทึกเหตุการณ์นี้ใช่หรือไม่?"))
          return;
        await api.delete(`/alerts/${id}`);
      }

      queryClient.invalidateQueries(["myAlerts"]);
    } catch (err) {
      console.error(`Error ${action}:`, err);
    }
  };

  const displayAlerts = useMemo(() => {
    if (!Array.isArray(alerts)) return [];
    let list = alerts.filter((a) => a.status === currentTab);
    if (severityFilter !== "all") {
      list = list.filter((a) => a.severity?.toLowerCase() === severityFilter);
    }
    return [...list].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
  }, [alerts, currentTab, severityFilter]);

  const summaryCards = [
    {
      name: "All New Alert",
      value: alerts.filter(
        (a) =>
          (a.severity?.toLowerCase() === "high" ||
            a.severity?.toLowerCase() === "medium" ||
            a.severity?.toLowerCase() === "low") &&
          a.status === "unread",
      ).length,
      color: "text-red-500 font-black",
    },
    {
      name: "High",
      value: alerts.filter(
        (a) => a.severity?.toLowerCase() === "high" && a.status === "unread",
      ).length,
      color: "text-red-500 font-black",
    },
    {
      name: "Medium",
      value: alerts.filter(
        (a) => a.severity?.toLowerCase() === "medium" && a.status === "unread",
      ).length,
      color: "text-amber-500 font-bold",
    },
    {
      name: "Low",
      value: alerts.filter(
        (a) => a.severity?.toLowerCase() === "low" && a.status === "unread",
      ).length,
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 antialiased">
      {/* Header Section: ล้ำๆ สะอาดๆ */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Incident <span className="text-red-600">Reports</span>
          </h1>
          <p className="text-gray-400 font-medium mt-1">
            Real-time safety monitoring system
          </p>
        </div>

        {/* Advanced Filter Pills */}
        <div className="flex bg-gray-100/80 p-1.5 rounded-2xl backdrop-blur-md">
          {["all", "high", "medium", "low"].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                severityFilter === s
                  ? "bg-white text-gray-900 shadow-sm scale-105"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-10 transition-all duration-500 hover:scale-[1.01]">
        <SummaryCard data={summaryCards} />
      </div>

      {/* Tab Management */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-100">
        <div className="flex gap-8">
          {[
            {
              id: "unread",
              label: "เคสใหม่",
              count: alerts.filter((a) => a.status === "unread").length,
              color: "bg-red-500",
            },
            {
              id: "read",
              label: "ประวัติการตรวจ",
              count: alerts.filter((a) => a.status === "read").length,
              color: "bg-emerald-500",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`pb-4 text-sm font-black transition-all relative ${
                currentTab === tab.id
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 px-2 py-0.5 text-[10px] rounded-full text-white ${tab.color}`}
              >
                {tab.count}
              </span>
              {currentTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-900 rounded-full animate-in slide-in-from-left duration-300" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Incident List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-24 animate-pulse text-gray-300 font-bold tracking-widest">
            LOADING DATA...
          </div>
        ) : displayAlerts.length > 0 ? (
          displayAlerts.map((item) => (
            <div
              key={item._id}
              onClick={() => navigate(`/eldery-monitoring/${item.elder_id}`)}
              className="group flex items-center gap-6 p-6 bg-white rounded-[2rem] border border-gray-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 cursor-pointer"
            >
              {/* <div
                className={`w-3 h-3 rounded-full shrink-0 ${
                  item.severity?.toLowerCase() === "high"
                    ? "bg-red-500 animate-pulse"
                    : "bg-blue-400"
                }`}
              /> */}

              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`text-[9px] tracking-widest font-black px-2.5 py-1 rounded-lg ${
                      item.severity?.toLowerCase() === "high"
                        ? "bg-red-50 text-red-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {item.severity?.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-bold text-gray-300 uppercase tracking-tighter">
                    {new Date(item.created_at).toLocaleTimeString("th-TH")} น.
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400 font-medium line-clamp-1">
                  {item.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                {item.status === "unread" && (
                  <button
                    onClick={(e) => handleAction(item._id, "read", e)}
                    className="px-6 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-gray-200"
                  >
                    RESOLVE
                  </button>
                )}
                <button
                  onClick={(e) => handleAction(item._id, "delete", e)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-300 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"
                >
                  <span className="text-lg">🗑️</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-32 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold italic">
              No incidents found in this category
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyAlertManagement;
