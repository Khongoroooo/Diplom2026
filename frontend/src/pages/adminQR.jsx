import { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { RefreshCw } from "lucide-react";

export default function AdminQR() {
  // Token болон PIN-г нэг объект болгож хадгалах нь илүү цэгцтэй
  const [data, setData] = useState({ qrToken: "", pinCode: "" });
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(30);

  const fetchQRToken = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        "http://127.0.0.1:8000/api/attendance/generate-qr/",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Backend-ээс ирсэн qr_token болон pin_code-ыг оноож байна
      setData({
        qrToken: response.data.qr_token,
        pinCode: response.data.pin_code,
      });

      setCountdown(30);
      setLoading(false);
    } catch (error) {
      console.error("Дата авах боломжгүй:", error);
    }
  };

  useEffect(() => {
    fetchQRToken();

    // 30 секунд тутамд шинэчлэх (Backend timeout-той тааруулж)
    const interval = setInterval(() => {
      fetchQRToken();
    }, 30000);

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 30));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100 text-center max-w-md w-full">
        <h2 className="text-3xl font-black text-slate-800 mb-2">Ирц бүртгэл</h2>
        <p className="text-slate-500 mb-6 text-sm">
          QR уншуулах эсвэл кодыг оруулна уу
        </p>

        {/* QR Кодын хэсэг */}
        <div className="bg-white p-4 rounded-3xl inline-block mb-8 shadow-inner border-2 border-blue-500">
          {loading ? (
            <div className="w-64 h-64 flex items-center justify-center">
              <RefreshCw className="animate-spin text-blue-500" size={48} />
            </div>
          ) : (
            <QRCodeCanvas
              value={data.qrToken}
              size={240}
              level={"H"}
              includeMargin={false}
            />
          )}
        </div>

        {/* 6 Оронтой PIN кодны хэсэг */}
        <div className="mb-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Баталгаажуулах код
          </p>
          <div className="flex justify-center gap-2">
            {data.pinCode ? (
              data.pinCode.split("").map((digit, index) => (
                <div
                  key={index}
                  className="w-12 h-16 bg-slate-50 border-b-4 border-blue-600 rounded-xl flex items-center justify-center text-3xl font-black text-blue-700 shadow-sm"
                >
                  {digit}
                </div>
              ))
            ) : (
              <div className="text-slate-300 italic">Ачаалж байна...</div>
            )}
          </div>
        </div>

        {/* Хугацаа тоологч */}
        <div className="flex items-center justify-center gap-3 bg-blue-50 py-3 rounded-2xl">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
          </div>
          <p className="text-slate-700 font-semibold">
            Шинэчлэгдэхэд:{" "}
            <span className="text-blue-600 font-mono text-lg">
              {countdown}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
