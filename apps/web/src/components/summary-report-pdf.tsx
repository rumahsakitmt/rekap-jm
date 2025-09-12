import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency } from "@/lib/utils";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1f2937",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 5,
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
    fontWeight: "bold",
  },
  tableCell: {
    padding: 8,
    fontSize: 12,
    flex: 1,
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
    padding: 20,
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
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
  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("id-ID");
  };

  return (
    <Document>
      {/* First Page - DPJP and Konsul */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Laporan Ringkasan Rawat Jalan</Text>
          <Text style={styles.subtitle}>
            Periode: {formatDate(filters.dateFrom)} -{" "}
            {formatDate(filters.dateTo)}
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

        {/* Content Grid */}
        <View style={styles.grid}>
          {/* DPJP Section */}
          <View style={styles.gridItem}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DPJP</Text>

              {data.dpjp.length > 0 ? (
                <View style={styles.table}>
                  {/* Table Header */}
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={styles.tableCell}>Nama Dokter</Text>
                    <Text style={[styles.tableCell, styles.tableCellRight]}>
                      Total
                    </Text>
                  </View>

                  {/* Table Rows */}
                  {data.dpjp.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{item.name}</Text>
                      <Text style={[styles.tableCell, styles.tableCellRight]}>
                        {formatCurrency(item.total)}
                      </Text>
                    </View>
                  ))}

                  {/* Total Row */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={styles.tableCell}>Total DPJP</Text>
                    <Text style={[styles.tableCell, styles.tableCellRight]}>
                      {formatCurrency(data.dpjpTotal)}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.emptyState}>No DPJP data available</Text>
              )}
            </View>
          </View>

          {/* Konsul Section */}
          <View style={styles.gridItem}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Konsul</Text>

              {data.konsul.length > 0 ? (
                <View style={styles.table}>
                  {/* Table Header */}
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={styles.tableCell}>Nama Dokter</Text>
                    <Text style={[styles.tableCell, styles.tableCellRight]}>
                      Total
                    </Text>
                  </View>

                  {/* Table Rows */}
                  {data.konsul.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{item.name}</Text>
                      <Text style={[styles.tableCell, styles.tableCellRight]}>
                        {formatCurrency(item.total)}
                      </Text>
                    </View>
                  ))}

                  {/* Total Row */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={styles.tableCell}>Total Konsul</Text>
                    <Text style={[styles.tableCell, styles.tableCellRight]}>
                      {formatCurrency(data.konsulTotal)}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.emptyState}>
                  No consultation data available
                </Text>
              )}
            </View>
          </View>
        </View>
      </Page>

      {(data.labTotal && data.labTotal > 0) ||
      (data.radTotal && data.radTotal > 0) ? (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ringkasan Lainnya</Text>
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
        </Page>
      ) : null}
    </Document>
  );
}
