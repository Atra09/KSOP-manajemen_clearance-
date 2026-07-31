import React from "react";

const PrintableSPB = React.forwardRef(({ data }, ref) => {
  if (!data) return null;

  const tanggalClearance = new Date(data.tanggal_clearance);
  const bulan = tanggalClearance.getMonth() + 1;
  const tahun = tanggalClearance.getFullYear();
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatLongDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    const [hour, minute] = timeString.split(":");
    return `${hour}:${minute}`;
  };

  const getCargoStatus = () => {
    if (data.status_muatan_berangkat) {
      return data.status_muatan_berangkat;
    }
    if (data.muatans && data.muatans.length > 0) {
      return "SESUAI MANIFEST";
    }
    return "NIHIL";
  };

  // === Render A4 Page ===
  return (
    <div
      ref={ref}
      className="page-container print-only"
      style={{
        width: "210mm",
        minHeight: "287mm",
        margin: "0 auto",
        position: "relative",
        backgroundColor: "#fff",
        fontFamily: "Calibri, sans-serif",
        fontSize: "11pt",
        overflow: "hidden",
        boxSizing: "border-box",
        paddingTop: "10mm",
        paddingBottom: "0mm",
      }}
    >
      {/* === PPK Number (Top Right) === */}
      <div
        style={{
          position: "absolute",
          top: "21mm",
          left: "136mm",
          display: "flex",
          gap: "10px",
          fontWeight: "bold",
          fontSize: "12pt",
        }}
      >
        <div style={{ width: "11mm" }}>PK. {data.ppk}</div>
        <div style={{ width: "11mm" }}>{data.no_urut}</div>
        <div style={{ width: "11mm" }}>{bulan}</div>
        <div style={{ width: "11mm" }}>{tahun}</div>
      </div>

      {/* === Warning Box === */}
      <div
        style={{
          position: "absolute",
          top: "47mm",
          left: "122mm",
          width: "70mm",
          border: "5px double #c00000",
          padding: "4px",
          color: "#c00000",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        <div style={{ fontSize: "14pt", textDecoration: "underline" }}>
          *PERINGATAN AWAL*
        </div>
        <div style={{ lineHeight: 1.2, fontSize: "11pt" }}>
          UTAMAKAN KESELAMATAN BERLAYAR
          <br />
          BERLINDUNG JIKA CUACA BURUK
        </div>
      </div>

      {/* === SPB Number === */}
      <div
        style={{
          position: "absolute",
          top: "101mm",
          left: "280.1px",
          display: "flex",
          gap: "10px",
          fontWeight: "bold",
          fontSize: "11pt",
        }}
      >
        <div style={{ width: "13.3mm", textAlign: "center" }}>N.7</div>
        <div style={{ width: "12.1mm", textAlign: "center" }}>K.M.17</div>
        <div style={{ width: "12.1mm", textAlign: "center" }}>{data.spb?.no_spb}</div>
        <div style={{ width: "12.1mm", textAlign: "center" }}>{bulan}</div>
        <div style={{ width: "12.1mm", textAlign: "center" }}>{tahun}</div>
      </div>

      {/* === Kapal & Data === */}
      <div
        style={{
          position: "absolute",
          top: "117mm",
          left: "41.5mm",
          fontWeight: "bold",
          fontSize: "12pt",
        }}
      >
        {data.kapal?.nama_kapal}
      </div>

      <div
        style={{
          position: "absolute",
          top: "117mm",
          left: "137.2mm",
          fontWeight: "bold",
          fontSize: "12pt",
        }}
      >
        GT. {data.kapal?.gt}
      </div>

      <div
        style={{
          position: "absolute",
          top: "128mm",
          left: "60mm",
          fontWeight: "bold",
          fontSize: "12pt",
        }}
      >
        {data.kapal?.bendera?.kode_negara}
      </div>

      <div
        style={{
          position: "absolute",
          top: "128mm",
          left: "135mm",
          fontWeight: "bold",
          fontSize: "12pt",
        }}
      >
        {data.nahkoda?.nama_nahkoda}
      </div>

      <div
        style={{
          position: "absolute",
          top: "141mm",
          left: "42mm",
          fontWeight: "bold",
          fontSize: "12pt",
        }}
      >
        {data.kapal?.nomor_imo || "-"}
      </div>

      <div
        style={{
          position: "absolute",
          top: "141mm",
          left: "142mm",
          fontWeight: "bold",
          fontSize: "12pt",
        }}
      >
        {data.kapal?.call_sign || "-"}
      </div>

      {/* === tanggal clearance + waktu === */}
      <div
        style={{
          position: "absolute",
          top: "151mm",
          left: "140.2mm",
          fontWeight: "bold",
          fontSize: "9pt",
        }}
      >
        {formatDate(data.tanggal_clearance)}
      </div>

      <div
        style={{
          position: "absolute",
          top: "151mm",
          left: "166.2mm",
          fontWeight: "bold",
          fontSize: "9pt",
        }}
      >
        {formatTime(data.pukul_agen_clearance)}
      </div>

      {/* === Pelabuhan, Tujuan, dan Data === */}
      <div
        style={{
          position: "absolute",
          top: "179.2mm",
          left: "42mm",
          fontWeight: "bold",
          fontSize: "12pt",
        }}
      >
        KALIANGET
      </div>

      <div
        style={{
          position: "absolute",
          top: "180mm",
          left: "105mm",
          fontWeight: "bold",
          fontSize: "10pt",
        }}
      >
        {formatDate(data.tanggal_berangkat)}
      </div>

      <div
        style={{
          position: "absolute",
          top: "185mm",
          left: "105mm",
          fontWeight: "bold",
          fontSize: "10pt",
        }}
      >
        {formatTime(data.pukul_kapal_berangkat)}
      </div>

      <div
        style={{
          position: "absolute",
          top: "179.2mm",
          left: "153mm",
          fontWeight: "bold",
          fontSize: "12pt",
        }}
      >
        {data.tujuan_akhir?.nama_kecamatan}
      </div>

      <div
        style={{
          position: "absolute",
          top: "190mm",
          left: "55mm",
          fontWeight: "bold",
          fontSize: "12pt",
        }}
      >
        {data.jumlah_crew} ORANG
      </div>

      <div
        style={{
          position: "absolute",
          top: "189mm",
          left: "151mm",
          fontWeight: "bold",
          fontSize: "12pt",
        }}
      >
        {getCargoStatus()}
      </div>

      <div
        style={{
          position: "absolute",
          top: "200mm",
          left: "55mm",
          fontWeight: "bold",
          fontSize: "12pt",
        }}
      >
        KALIANGET
      </div>

      <div
        style={{
          position: "absolute",
          top: "211mm",
          left: "55mm",
          fontWeight: "bold",
          fontSize: "12pt",
        }}
      >
        {formatLongDate(data.tanggal_berangkat)}
      </div>
    </div>
  );
});

export default PrintableSPB;