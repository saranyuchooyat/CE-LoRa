import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../components/api";
import MenuNameCard from "../components/card/menuNameCard";
import SummaryCard from "../components/card/summaryCard";
import { showConfirm, showPopup } from "../components/modalForm/popup";

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

  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  const handleAction = async (id, action, e) => {
    e.stopPropagation();
    try {
      if (action === "read") await api.put(`/alerts/${id}/read`);
      if (action === "delete") {
        const isConfirmed = await showConfirm(
          "ยืนยันการลบ", 
          "คุณต้องการลบบันทึกเหตุการณ์นี้ใช่หรือไม่?"
        );
        if (!isConfirmed) return;
        await api.delete(`/alerts/${id}`);
        await showPopup("สำเร็จ", "ลบข้อมูลเรียบร้อยแล้ว", "success");
      }

      queryClient.invalidateQueries(["myAlerts"]);
    } catch (err) {
      console.error(`Error ${action}:`, err);
      showPopup("เกิดข้อผิดพลาด", "ไม่สามารถลบข้อมูลได้", "error");
    }
  };

  const displayAlerts = useMemo(() => {
    let list = safeAlerts.filter((a) => a.status === currentTab);
    if (severityFilter !== "all") {
      list = list.filter((a) => a.severity?.toLowerCase() === severityFilter);
    }
    return [...list].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
  }, [safeAlerts, currentTab, severityFilter]);

  const summaryCards = [
    {
      name: "รายงานทั้งหมด",
      value: safeAlerts.filter(
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
      value: safeAlerts.filter(
        (a) => a.severity?.toLowerCase() === "high" && a.status === "unread",
      ).length,
      color: "text-red-500 font-black",
    },
    {
      name: "Medium",
      value: safeAlerts.filter(
        (a) => a.severity?.toLowerCase() === "medium" && a.status === "unread",
      ).length,
      color: "text-amber-500 font-bold",
    },
    {
      name: "Low",
      value: safeAlerts.filter(
        (a) => a.severity?.toLowerCase() === "low" && a.status === "unread",
      ).length,
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="mx-5">
      {/* Header Section: ล้ำๆ สะอาดๆ */}
      <div className="mb-6">
        <MenuNameCard
            title="รายงานเหตุการณ์"
            description="Real-time safety monitoring system"
            detail={false}
        >
        {/* Advanced Filter Pills */}
          <div className="flex bg-gray-100/80 p-1.5 rounded-2xl backdrop-blur-md gap-1">
            {["all", "high", "medium", "low"].map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                  severityFilter === s
                    ? s === "high"
                      ? "bg-red-500 text-white shadow-md scale-105"
                      : s === "medium"
                      ? "bg-blue-500 text-white shadow-md scale-105"
                      : s === "low"
                      ? "bg-green-500 text-white shadow-md scale-105"
                      : "bg-white text-gray-900 shadow-sm scale-105"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </MenuNameCard>
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
              count: safeAlerts.filter((a) => a.status === "unread").length,
              color: "bg-red-500",
            },
            {
              id: "read",
              label: "ประวัติการตรวจ",
              count: safeAlerts.filter((a) => a.status === "read").length,
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
                    className="px-2 py-1 table-btn hover:bg-green-500 hover:text-white transition-all"
                  >
                    ดำเนินการเสร็จสิ้น
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(item._id, "delete", e);
                  }}
                  className="px-2 py-1 table-btn hover:bg-main-red hover:text-white transition-all"
                >
                  <span className="text-lg">ลบ</span>
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