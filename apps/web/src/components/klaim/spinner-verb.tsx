import { useState, useEffect } from "react";

const EKLAIM_STEPS = [
  "Menyiapkan data klaim...",
  "Mengirim ke server INACBG...",
  "Menunggu respons server...",
  "Memproses data pasien...",
  "Menyimpan diagnosa dan prosedur...",
  "Melakukan grouping klaim...",
  "Menyimpan hasil ke database...",
  "Memfinalisasi klaim...",
];

export function SpinnerVerb() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % EKLAIM_STEPS.length);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return <span>{EKLAIM_STEPS[index]}</span>;
}
