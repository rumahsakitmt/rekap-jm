import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 20,
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1f2937",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 4,
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    minHeight: 20,
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
    fontWeight: "bold",
  },
  tableCell: {
    padding: 6,
    fontSize: 10,
    flex: 1,
    wordWrap: "break-word",
  },
  tableCellRight: {
    textAlign: "right",
  },
  totalRow: {
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
  },
  emptyState: {
    textAlign: "center",
    color: "#6b7280",
    fontStyle: "italic",
    padding: 15,
    fontSize: 10,
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  gridItem: {
    width: "48%",
    marginBottom: 10,
  },
});

interface SummaryReportPDFProps {
  data: {
    dpjp: Array<{ name: string; total: number }>;
    dpjpTotal: number;
    konsul: Array<{ name: string; total: number }>;
    konsulTotal: number;
    labTotal?: number;
    radTotal?: number;
  };
  filters: {
    dateFrom?: string;
    dateTo?: string;
    selectedCsvFile?: string;
    selectedDoctor?: string;
    selectedPoliklinik?: string;
  };
}

export function SummaryReportPDF({ data, filters }: SummaryReportPDFProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.title}>
            Laporan Rekap Klaim - RSUD Mamuju Tengah
          </Text>
          <Text style={styles.subtitle}>
            Pasien Rawat Jalan, Pediode tanggal{" "}
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
          {filters.selectedPoliklinik && (
            <Text style={styles.subtitle}>
              Poliklinik: {filters.selectedPoliklinik}
            </Text>
          )}
        </View>

        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DPJP</Text>

              {data.dpjp.length > 0 ? (
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={styles.tableCell}>Nama Dokter</Text>
                    <Text style={[styles.tableCell, styles.tableCellRight]}>
                      Total
                    </Text>
                  </View>

                  {data.dpjp.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{item.name}</Text>
                      <Text style={[styles.tableCell, styles.tableCellRight]}>
                        {formatCurrency(item.total)}
                      </Text>
                    </View>
                  ))}

                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={styles.tableCell}>Total DPJP</Text>
                    <Text style={[styles.tableCell, styles.tableCellRight]}>
                      {formatCurrency(data.dpjpTotal)}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.emptyState}>Tidak ada DPJP</Text>
              )}
            </View>
          </View>

          <View style={styles.gridItem}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Konsul</Text>

              {data.konsul.length > 0 ? (
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={styles.tableCell}>Nama Dokter</Text>
                    <Text style={[styles.tableCell, styles.tableCellRight]}>
                      Total
                    </Text>
                  </View>

                  {data.konsul.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{item.name}</Text>
                      <Text style={[styles.tableCell, styles.tableCellRight]}>
                        {formatCurrency(item.total)}
                      </Text>
                    </View>
                  ))}

                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={styles.tableCell}>Total Konsul</Text>
                    <Text style={[styles.tableCell, styles.tableCellRight]}>
                      {formatCurrency(data.konsulTotal)}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.emptyState}>Tidak ada konsul</Text>
              )}
            </View>
          </View>
        </View>
      </Page>
      <Page size="A4" orientation="landscape" style={styles.page} wrap>
        {(data.labTotal && data.labTotal > 0) ||
        (data.radTotal && data.radTotal > 0) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ruangan</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Jenis</Text>
                <Text style={[styles.tableCell, styles.tableCellRight]}>
                  Total
                </Text>
              </View>
              {data.labTotal && data.labTotal > 0 && (
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Laboratorium</Text>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>
                    {formatCurrency(data.labTotal)}
                  </Text>
                </View>
              )}
              {data.radTotal && data.radTotal > 0 && (
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Radiologi</Text>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>
                    {formatCurrency(data.radTotal)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
