import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 15,
    fontSize: 9,
  },
  header: {
    marginBottom: 15,
    textAlign: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 3,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#1f2937",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 3,
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    minHeight: 18,
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
    fontWeight: "bold",
  },
  tableCell: {
    padding: 4,
    fontSize: 9,
    flex: 1,
    wordWrap: "break-word",
  },
  tableCellRight: {
    textAlign: "right",
  },
  tableCellCenter: {
    textAlign: "center",
  },
  totalRow: {
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
  },
  emptyState: {
    textAlign: "center",
    color: "#6b7280",
    fontStyle: "italic",
    padding: 10,
    fontSize: 9,
  },
  grid: {
    flexDirection: "column",
    flexWrap: "wrap",
  },
  gridItem: {
    width: "100%",
    marginBottom: 8,
  },
  fullWidth: {
    width: "100%",
  },
  grandTotal: {
    backgroundColor: "#1f2937",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 12,
  },
});

interface DetailedMonthlyReportData {
  anestesi: Array<{ name: string; visite: number; total: number }>;
  anestesiTotal: number;
  dpjp: Array<{ name: string; visite: number; total: number }>;
  dpjpTotal: number;
  konsulAnastesi: Array<{ name: string; visite: number; total: number }>;
  konsulAnastesiTotal: number;
  konsul: Array<{
    name: string;
    visite: number;
    konsul2: number;
    konsul3: number;
    total: number;
  }>;
  konsulTotal: number;
  dokterUmum: Array<{ name: string; visite: number; total: number }>;
  dokterUmumTotal: number;
  operator: Array<{ name: string; visite: number; total: number }>;
  operatorTotal: number;
  penunjang: Array<{ name: string; visite: number; total: number }>;
  penunjangTotal: number;
  labTotal: number;
  radTotal: number;
  rekapBulanan: Array<{ name: string; visite: number; total: number }>;
  grandTotal: number;
}

interface RawatInapDetailedMonthlyReportPDFProps {
  data: DetailedMonthlyReportData;
  filters: {
    dateFrom?: string;
    dateTo?: string;
    selectedCsvFile?: string;
    selectedDoctor?: string;
    selectedKamar?: string;
  };
}

export function RawatInapDetailedMonthlyReportPDF({
  data,
  filters,
}: RawatInapDetailedMonthlyReportPDFProps) {
  const monthName = filters.dateFrom
    ? format(new Date(filters.dateFrom), "MMMM yyyy", { locale: id })
    : "Bulan";

  return (
    <Document>
      <Page size="LEGAL" orientation="portrait" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.title}>
            REKAPAN {monthName.toUpperCase()} - RSUD MAMUJU TENGAH
          </Text>
          <Text style={styles.subtitle}>
            Pasien Rawat Inap, Periode tanggal{" "}
            {format(new Date(filters.dateFrom || ""), "dd MMMM yyyy", {
              locale: id,
            })}{" "}
            s/d{" "}
            {format(new Date(filters.dateTo || ""), "dd MMMM yyyy", {
              locale: id,
            })}
          </Text>
          {filters.selectedDoctor && (
            <Text style={styles.subtitle}>
              Dokter: {filters.selectedDoctor}
            </Text>
          )}
          {filters.selectedKamar && (
            <Text style={styles.subtitle}>
              Bangsal: {filters.selectedKamar}
            </Text>
          )}
        </View>

        <View style={styles.grid}>
          {/* Remun DPJP */}
          <View style={styles.gridItem}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Remun DPJP</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCell}>Nama Dokter</Text>
                  <Text style={[styles.tableCell, styles.tableCellCenter]}>
                    Visite
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>
                    Total
                  </Text>
                </View>
                {data.dpjp.length > 0 ? (
                  data.dpjp.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{item.name}</Text>
                      <Text style={[styles.tableCell, styles.tableCellCenter]}>
                        {item.visite > 0 ? item.visite : "-"}
                      </Text>
                      <Text style={[styles.tableCell, styles.tableCellRight]}>
                        {formatCurrency(item.total)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.emptyState]}>
                      Tidak ada data DPJP
                    </Text>
                  </View>
                )}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={styles.tableCell}>Total</Text>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>
                    {formatCurrency(data.dpjpTotal)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          {/* Rekap dr. Konsul Anestesi */}
          <View style={styles.gridItem}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rekap Visite Anestesi</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCell}>Nama Dokter</Text>
                  <Text style={[styles.tableCell, styles.tableCellCenter]}>
                    Visite
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>
                    Total
                  </Text>
                </View>
                {data.konsulAnastesi.length > 0 ? (
                  data.konsulAnastesi.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{item.name}</Text>
                      <Text style={[styles.tableCell, styles.tableCellCenter]}>
                        {item.visite > 0 ? item.visite : "-"}
                      </Text>
                      <Text style={[styles.tableCell, styles.tableCellRight]}>
                        {item.total > 0 ? formatCurrency(item.total) : "-"}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.emptyState]}>
                      Tidak ada data Anestesi
                    </Text>
                  </View>
                )}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={styles.tableCell}>Total</Text>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>
                    {formatCurrency(data.konsulAnastesiTotal)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          {/* Rekap dr. Konsul */}
          <View style={styles.gridItem}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Rekap Visite Dokter Antar Spesialis
              </Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCell}>Nama Dokter</Text>
                  <Text style={[styles.tableCell, styles.tableCellCenter]}>
                    Visite
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>
                    Total
                  </Text>
                </View>
                {data.konsul.length > 0 ? (
                  data.konsul.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{item.name}</Text>
                      <Text style={[styles.tableCell, styles.tableCellCenter]}>
                        {item.visite > 0 ? item.visite : "-"}
                      </Text>
                      <Text style={[styles.tableCell, styles.tableCellRight]}>
                        {formatCurrency(item.total)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.emptyState]}>
                      Tidak ada data Konsul
                    </Text>
                  </View>
                )}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={styles.tableCell}>Total</Text>
                  <Text style={[styles.tableCell, styles.tableCellCenter]}>
                    {formatCurrency(data.konsulTotal)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View>
          {/* Rekap dr. Umum */}
          <View style={styles.gridItem}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rekap Visite Dokter Umum</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCell}>Nama Dokter</Text>
                  <Text style={[styles.tableCell, styles.tableCellCenter]}>
                    Visite
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>
                    Total
                  </Text>
                </View>
                {data.dokterUmum.length > 0 ? (
                  data.dokterUmum.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{item.name}</Text>
                      <Text style={[styles.tableCell, styles.tableCellCenter]}>
                        {item.visite > 0 ? item.visite : "-"}
                      </Text>
                      <Text style={[styles.tableCell, styles.tableCellRight]}>
                        {formatCurrency(item.total)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.emptyState]}>
                      Tidak ada data Visite Dokter Umum
                    </Text>
                  </View>
                )}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={styles.tableCell}>Total</Text>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>
                    {formatCurrency(data.dokterUmumTotal)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Remun Operator */}
          <View style={styles.gridItem}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Remun Operator Operasi</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCell}>Nama Dokter</Text>
                  <Text style={[styles.tableCell, styles.tableCellCenter]}>
                    Operator
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>
                    Total
                  </Text>
                </View>
                {data.operator.length > 0 ? (
                  data.operator.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{item.name}</Text>
                      <Text style={[styles.tableCell, styles.tableCellCenter]}>
                        {item.visite > 0 ? item.visite : "-"}
                      </Text>
                      <Text style={[styles.tableCell, styles.tableCellRight]}>
                        {formatCurrency(item.total)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.emptyState]}>
                      Tidak ada data Operator
                    </Text>
                  </View>
                )}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={styles.tableCell}>Total</Text>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>
                    {formatCurrency(data.operatorTotal)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Remun Anestesi */}
          <View style={styles.gridItem}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Remun Anestesi Operasi</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCell}>Nama Dokter</Text>
                  <Text style={[styles.tableCell, styles.tableCellCenter]}>
                    Anestesi
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>
                    Total
                  </Text>
                </View>
              </View>
              {data.anestesi.length > 0 ? (
                data.anestesi.map((item, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{item.name}</Text>
                    <Text style={[styles.tableCell, styles.tableCellCenter]}>
                      {item.visite > 0 ? item.visite : "-"}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellRight]}>
                      {formatCurrency(item.total)}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.emptyState]}>
                    Tidak ada data Anestesi
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.grid}>
          {/* Remun Penunjang */}
          <View style={styles.gridItem}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Remun Penunjang</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCell}>Nama Dokter</Text>
                  <Text style={[styles.tableCell, styles.tableCellCenter]}>
                    Visite
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>
                    Total
                  </Text>
                </View>
                {data.penunjang.length > 0 ? (
                  data.penunjang.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{item.name}</Text>
                      <Text style={[styles.tableCell, styles.tableCellCenter]}>
                        {item.visite > 0 ? item.visite : "-"}
                      </Text>
                      <Text style={[styles.tableCell, styles.tableCellRight]}>
                        {formatCurrency(item.total)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.emptyState]}>
                      Tidak ada data Penunjang
                    </Text>
                  </View>
                )}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={styles.tableCell}>Total</Text>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>
                    {formatCurrency(data.penunjangTotal)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Page>

      {/* Second page for REKAPAN MEI */}
      <Page size="LEGAL" orientation="portrait" style={styles.page} wrap>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            REKAPAN {monthName.toUpperCase()}
          </Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Nama Dokter</Text>
              <Text style={[styles.tableCell, styles.tableCellRight]}>
                Total
              </Text>
            </View>
            {data.rekapBulanan.length > 0 ? (
              data.rekapBulanan.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{item.name}</Text>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>
                    {formatCurrency(item.total)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.emptyState]}>
                  Tidak ada data
                </Text>
              </View>
            )}
            <View style={[styles.tableRow, styles.grandTotal]}>
              <Text style={styles.tableCell}>TOTAL KESELURUHAN</Text>
              <Text style={[styles.tableCell, styles.tableCellRight]}>
                {formatCurrency(data.grandTotal)}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
