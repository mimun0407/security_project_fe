import React, { useEffect, useState } from "react";
import axiosClient from "../../services/axiosClient";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

function History() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axiosClient.get("/auth");
        setLogs(res.data.content || []);
      } catch (error) {
        console.error("Lỗi khi load history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatTime = (timeArr) => {
    if (!timeArr) return "-";
    const [year, month, day, hour, minute, second] = timeArr;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )} ${String(hour).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0"
    )}:${String(second).padStart(2, "0")}`;
  };

  const renderJson = (data) => {
    if (!data) return "-";
    try {
      const obj = JSON.parse(data);
      return (
        <pre
          className="bg-light border rounded p-2 small text-muted"
          style={{ maxHeight: "200px", overflowY: "auto" }}
        >
          {JSON.stringify(obj, null, 2)}
        </pre>
      );
    } catch {
      return <span className="text-muted">{data}</span>;
    }
  };

  // Thêm Badge màu cho action
  const renderAction = (action) => {
    const mapColor = {
      CREATE: "success",
      UPDATE: "warning",
      DELETE: "danger",
      LOGIN: "primary",
    };
    const color = mapColor[action?.toUpperCase()] || "secondary";
    return <span className={`badge bg-${color}`}>{action}</span>;
  };

  return (
    <>
      <Header />
      <div className="container my-5">
        <h2 className="mb-4 text-center fw-bold text-primary">
          📜 Lịch sử thao tác
        </h2>

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2">Đang tải dữ liệu...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="alert alert-info text-center">
            Không có log nào để hiển thị.
          </div>
        ) : (
          <div className="table-responsive shadow rounded">
            <table className="table align-middle table-hover">
              <thead className="table-primary">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Hành động</th>
                  <th scope="col">User ID</th>
                  <th scope="col">Tên User</th>
                  <th scope="col">Thời gian</th>
                  <th scope="col">Dữ liệu cũ</th>
                  <th scope="col">Dữ liệu mới</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={log.id}>
                    <td className="fw-bold">{index + 1}</td>
                    <td>{renderAction(log.action)}</td>
                    <td>{log.userId}</td>
                    <td className="fw-semibold">{log.userName}</td>
                    <td>
                      <span className="text-muted small">
                        {formatTime(log.time)}
                      </span>
                    </td>
                    <td>{renderJson(log.oldData)}</td>
                    <td>{renderJson(log.newData)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default History;
