import { db } from "@/db";
import {
  inacbg_klaim_baru,
  inacbg_klaim_baru2,
  inacbg_data_terkirim,
  inacbg_data_terkirim2,
  inacbg_grouping_stage1,
  inacbg_grouping_stage12,
  inacbg_grouping_stage1_internal,
  inacbg_klaim_baru_internal,
  inacbg_data_terkirim_internal
} from "@/db/schema";
import * as crypto from "crypto";
import { eq } from "drizzle-orm";

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set.`);
  }
  return value;
}

export const EKLAIM_CONFIG = {
  KEY: getEnvVar("ECLAIM_CONFIG_KEY"),
  URL_WS: getEnvVar("ECLAIM_CONFIG_URL_WS"),
  KELAS_RS: getEnvVar("ECLAIM_CONFIG_KELAS_RS"),
};

export function mc_encrypt(data: string, strkey: string): string {
  const key = Buffer.from(strkey, "hex");
  if (key.length !== 32) {
    throw new Error("Needs a 256-bit key!");
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  let encrypted = cipher.update(data, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const hmac = crypto.createHmac("sha256", key);
  hmac.update(encrypted);
  const signature = hmac.digest().subarray(0, 10);

  const combined = Buffer.concat([signature, iv, encrypted]);
  const base64Encoded = combined.toString("base64");

  // Equivalent to chunk_split in PHP
  const chunks = base64Encoded.match(/.{1,76}/g) || [base64Encoded];
  return chunks.join("\r\n") + "\r\n";
}

function mc_compare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}

export function mc_decrypt(str: string, strkey: string): string {
  const key = Buffer.from(strkey, "hex");
  if (key.length !== 32) {
    throw new Error("Needs a 256-bit key!");
  }

  const base64Clean = str.replace(/\s+/g, "");
  const decoded = Buffer.from(base64Clean, "base64");

  const signature = decoded.subarray(0, 10);
  const iv = decoded.subarray(10, 26);
  const encrypted = decoded.subarray(26);

  const hmac = crypto.createHmac("sha256", key);
  hmac.update(encrypted);
  const calcSignature = hmac.digest().subarray(0, 10);

  if (!crypto.timingSafeEqual(signature, calcSignature)) {
    throw new Error("SIGNATURE_NOT_MATCH");
  }

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}

export async function requestEKlaim(payload: any): Promise<any> {
  const requestStr = typeof payload === "string" ? payload : JSON.stringify(payload);
  const encryptedJson = mc_encrypt(requestStr, EKLAIM_CONFIG.KEY);

  try {
    const response = await fetch(EKLAIM_CONFIG.URL_WS, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: encryptedJson
    });

    const responseText = (await response.text()).trim();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }

    // Log raw response for debugging decryption issues
    console.log("[E-Klaim] Raw response length:", responseText.length);
    console.log("[E-Klaim] Raw response snippet:", responseText.substring(0, 200));

    // mc_decrypt removes all whitespace internally; no need to strip lines here.
    const decryptedJson = mc_decrypt(responseText, EKLAIM_CONFIG.KEY);
    return JSON.parse(decryptedJson);
  } catch (error) {
    console.error("E-Klaim Request Error:", error);
    throw error;
  }
}

// --- E-KLAIM HELPERS ---

export async function GenerateNomorCovid() {
  const request = {
    metadata: { method: "generate_claim_number" },
    data: { payor_id: "71" },
  };
  const msg = await requestEKlaim(request);
  let nomor = "";
  if (msg?.metadata?.message === "Ok") {
    nomor = msg.response.claim_number;
  }
  return nomor;
}

export async function BuatKlaimBaru(
  nomor_kartu: string,
  nomor_sep: string,
  nomor_rm: string,
  nama_pasien: string,
  tgl_lahir: string,
  gender: string
) {
  const request = {
    metadata: { method: "new_claim" },
    data: { nomor_kartu, nomor_sep, nomor_rm, nama_pasien, tgl_lahir, gender },
  };
  const msg = await requestEKlaim(request);
  if (msg?.metadata?.message === "Ok") {
    await db.delete(inacbg_klaim_baru).where(eq(inacbg_klaim_baru.no_sep, nomor_sep));
    await db.insert(inacbg_klaim_baru).values({
      no_sep: msg.response.claim_number,
      patient_id: msg.response.patient_id,
      admission_id: msg.response.admission_id,
      hospital_admission_id: msg.response.hospital_admission_id,
    });
  } else {
    console.error("Respon Klaim Baru : " + msg?.metadata?.message);
  }
  return msg;
}

export async function BuatKlaimBaruInternal(
  nomor_kartu: string,
  nomor_sep: string,
  nomor_rm: string,
  nama_pasien: string,
  tgl_lahir: string,
  gender: string
) {
  const request = {
    metadata: { method: "new_claim" },
    data: { nomor_kartu, nomor_sep, nomor_rm, nama_pasien, tgl_lahir, gender },
  };
  const msg = await requestEKlaim(request);
  if (msg?.metadata?.message === "Ok") {
    await db.delete(inacbg_klaim_baru_internal).where(eq(inacbg_klaim_baru_internal.no_sep, nomor_sep));
    await db.insert(inacbg_klaim_baru_internal).values({
      no_sep: msg.response.claim_number,
      patient_id: msg.response.patient_id,
      admission_id: msg.response.admission_id,
      hospital_admission_id: msg.response.hospital_admission_id,
    });
  } else {
    console.error("Respon Klaim Internal : " + msg?.metadata?.message);
  }
  return msg;
}

export async function BuatKlaimBaru2(
  nomor_kartu: string,
  nomor_sep: string,
  nomor_rm: string,
  nama_pasien: string,
  tgl_lahir: string,
  gender: string,
  norawat: string
) {
  const request = {
    metadata: { method: "new_claim" },
    data: { nomor_kartu, nomor_sep, nomor_rm, nama_pasien, tgl_lahir, gender },
  };
  const msg = await requestEKlaim(request);
  if (msg?.metadata?.message === "Ok") {

    await db.delete(inacbg_klaim_baru2).where(eq(inacbg_klaim_baru2.no_sep, nomor_sep));
    await db.insert(inacbg_klaim_baru2).values({
      no_sep: msg.response.claim_number,
      patient_id: msg.response.patient_id,
      admission_id: msg.response.admission_id,
      hospital_admission_id: msg.response.hospital_admission_id,
    });
  } else {
    console.error("Respon Klaim Baru 2 : " + msg?.metadata?.message);
  }
  return msg;
}

export async function UpdateDataPasien(
  nomor_rmlama: string,
  nomor_kartu: string,
  nomor_rm: string,
  nama_pasien: string,
  tgl_lahir: string,
  gender: string
) {
  const request = {
    metadata: { method: "update_patient", nomor_rm: nomor_rmlama },
    data: { nomor_kartu, nomor_rm, nama_pasien, tgl_lahir, gender },
  };
  const msg = await requestEKlaim(request);
  return msg;
}

export async function HapusDataPasien(nomor_rm: string, coder_nik: string) {
  const request = {
    metadata: { method: "delete_patient" },
    data: { nomor_rm, coder_nik },
  };
  const msg = await requestEKlaim(request);
  return msg;
}

// Minimal wrapper for UpdateDataKlaim2 which passes all raw data properties without side-effect DB querying
export async function UpdateDataKlaim2(data: any) {
  // data should contain: nomor_sep, nomor_kartu, tgl_masuk, dll.
  const request = {
    metadata: { method: "set_claim_data", nomor_sep: data.nomor_sep },
    data: data,
  };
  const msg = await requestEKlaim(request);

  let respon = "Berhasil";
  if (msg?.metadata?.message === "Ok") {
    await db.delete(inacbg_data_terkirim2).where(eq(inacbg_data_terkirim2.no_sep, data.nomor_sep));
    await db.insert(inacbg_data_terkirim2).values({
      no_sep: data.nomor_sep,
      nik: data.coder_nik,
    });

    await SetDiagnosaDRG(data.nomor_sep, data.diagnosa);
    await SetProsedurDRG(data.nomor_sep, data.procedure);
    const groupingStr = await GroupingDRG(data.nomor_sep);
    if (groupingStr === "Ok") {
      await InacBGToDRG(data.nomor_sep, data.diagnosainacbg, data.procedureinacbg);
      await GroupingStage12(data.nomor_sep, data.coder_nik);
    }
  } else {
    respon = "Gagal";
    console.error("Respon Update Klaim : " + msg?.metadata?.message);
  }
  return { respon, msg };
}

export async function UpdateDataKlaim3(data: any) {
  const request = {
    metadata: { method: "set_claim_data", nomor_sep: data.nomor_sep },
    data: data,
  };
  const msg = await requestEKlaim(request);

  let respon = "Berhasil";
  if (msg?.metadata?.message === "Ok") {
    await db.delete(inacbg_data_terkirim2).where(eq(inacbg_data_terkirim2.no_sep, data.nomor_sep));
    await db.insert(inacbg_data_terkirim2).values({
      no_sep: data.nomor_sep,
      nik: data.coder_nik,
    });

    await SetDiagnosaDRG(data.nomor_sep, data.diagnosa);
    await SetProsedurDRG(data.nomor_sep, data.procedure);
    const groupingStr = await GroupingDRG(data.nomor_sep);
    if (groupingStr === "Ok") {
      await InacBGToDRG(data.nomor_sep, data.diagnosainacbg, data.procedureinacbg);
      await GroupingStage13(data.nomor_sep, data.coder_nik);
    }
  } else {
    respon = "Gagal";
    console.error("Respon Update Klaim 3 : " + msg?.metadata?.message);
  }
  return { respon, msg };
}

export async function UpdateDataKlaim(data: any) {
  const request = {
    metadata: { method: "set_claim_data", nomor_sep: data.nomor_sep },
    data: data,
  };
  const msg = await requestEKlaim(request);

  let respon = "Berhasil";
  if (msg?.metadata?.message === "Ok") {
    await db.delete(inacbg_data_terkirim).where(eq(inacbg_data_terkirim.no_sep, data.nomor_sep));
    await db.insert(inacbg_data_terkirim).values({
      no_sep: data.nomor_sep,
      nik: data.coder_nik,
    });

    await SetDiagnosaDRG(data.nomor_sep, data.diagnosa);
    await SetProsedurDRG(data.nomor_sep, data.procedure);
    const groupingStr = await GroupingDRG(data.nomor_sep);
    if (groupingStr === "Ok") {
      await InacBGToDRG(data.nomor_sep, data.diagnosainacbg, data.procedureinacbg);
      await GroupingStage1(data.nomor_sep, data.coder_nik);
    }
  } else {
    respon = "Gagal";
    console.error("Respon Update Klaim : " + msg?.metadata?.message);
  }
  return { respon, msg };
}

export async function UpdateDataKlaimInternal(data: any) {
  const request = {
    metadata: { method: "set_claim_data", nomor_sep: data.nomor_sep },
    data: data,
  };
  const msg = await requestEKlaim(request);

  let respon = "Berhasil";
  if (msg?.metadata?.message === "Ok") {
    await db.delete(inacbg_data_terkirim_internal).where(eq(inacbg_data_terkirim_internal.no_sep, data.nomor_sep));
    await db.insert(inacbg_data_terkirim_internal).values({
      no_sep: data.nomor_sep,
      nik: data.coder_nik,
    });

    await SetDiagnosaDRG(data.nomor_sep, data.diagnosa);
    await SetProsedurDRG(data.nomor_sep, data.procedure);
    const groupingStr = await GroupingDRG(data.nomor_sep);
    if (groupingStr === "Ok") {
      await InacBGToDRG(data.nomor_sep, data.diagnosainacbg, data.procedureinacbg);
      await GroupingStage1Internal(data.nomor_sep, data.coder_nik);
    }
  } else {
    respon = "Gagal";
    console.error("Respon Update Klaim Internal : " + msg?.metadata?.message);
  }
  return { respon, msg };
}

export async function SetDiagnosaDRG(nomor_sep: string, diagnosa: string) {
  if (diagnosa) {
    await requestEKlaim({
      metadata: { method: "idrg_diagnosa_set", nomor_sep },
      data: { diagnosa: "#" },
    });
    const msg = await requestEKlaim({
      metadata: { method: "idrg_diagnosa_set", nomor_sep },
      data: { diagnosa },
    });
    return msg;
  }
}

export async function SetProsedurDRG(nomor_sep: string, procedure: string) {
  if (procedure) {
    await requestEKlaim({
      metadata: { method: "idrg_procedure_set", nomor_sep },
      data: { procedure: "#" },
    });
    const msg = await requestEKlaim({
      metadata: { method: "idrg_procedure_set", nomor_sep },
      data: { procedure },
    });
    return msg;
  }
}

export async function UpdateDataProsedur(nomor_sep: string, procedure: string, coder_nik: string) {
  const request = {
    metadata: { method: "set_claim_data", nomor_sep },
    data: { procedure, coder_nik },
  };
  return await requestEKlaim(request);
}

export async function HapusSemuaProsedur(nomor_sep: string, coder_nik: string) {
  const request = {
    metadata: { method: "set_claim_data", nomor_sep },
    data: { procedure_inagrouper: "#", coder_nik },
  };
  return await requestEKlaim(request);
}

export async function HapusSemuaDiagnosa(nomor_sep: string, coder_nik: string) {
  const request = {
    metadata: { method: "set_claim_data", nomor_sep },
    data: { diagnosa_inagrouper: "#", coder_nik },
  };
  return await requestEKlaim(request);
}

export async function GroupingDRG(nomor_sep: string) {
  const request = {
    metadata: { method: "grouper", stage: "1", grouper: "idrg" },
    data: { nomor_sep },
  };
  const msg = await requestEKlaim(request);
  let pesan = "Gagal";
  if (msg?.metadata?.message === "Ok") {
    pesan = msg.metadata.message;
    await requestEKlaim({
      metadata: { method: "idrg_grouper_final" },
      data: { nomor_sep },
    });
  }
  return pesan;
}

export async function GroupingStage1(nomor_sep: string, coder_nik: string) {
  const request = {
    metadata: { method: "grouper", stage: "1", grouper: "inacbg" },
    data: { nomor_sep },
  };
  const msg = await requestEKlaim(request);
  if (msg?.metadata?.message === "Ok") {
    await db.delete(inacbg_grouping_stage1).where(eq(inacbg_grouping_stage1.no_sep, nomor_sep));
    await db.insert(inacbg_grouping_stage1).values({
      no_sep: nomor_sep,
      code_cbg: msg.response_inacbg.cbg.code,
      deskripsi: msg.response_inacbg.cbg.description,
      tarif: parseFloat(msg.response_inacbg.tariff) || 0,
    });
    await FinalisasiKlaim(nomor_sep, coder_nik);
  }
  return msg;
}

export async function GroupingStage1Internal(nomor_sep: string, coder_nik: string) {
  const request = {
    metadata: { method: "grouper", stage: "1", grouper: "inacbg" },
    data: { nomor_sep },
  };
  const msg = await requestEKlaim(request);
  if (msg?.metadata?.message === "Ok") {
    await db.delete(inacbg_grouping_stage1_internal).where(eq(inacbg_grouping_stage1_internal.no_sep, nomor_sep));
    await db.insert(inacbg_grouping_stage1_internal).values({
      no_sep: nomor_sep,
      code_cbg: msg.response_inacbg.cbg.code,
      deskripsi: msg.response_inacbg.cbg.description,
      tarif: parseFloat(msg.response_inacbg.tariff) || 0,
    });
    await FinalisasiKlaim(nomor_sep, coder_nik);
  }
  return msg;
}

export async function GroupingStage12(nomor_sep: string, coder_nik: string) {
  const request = {
    metadata: { method: "grouper", stage: "1", grouper: "inacbg" },
    data: { nomor_sep },
  };
  const msg = await requestEKlaim(request);
  if (msg?.metadata?.message === "Ok") {
    await db.delete(inacbg_grouping_stage12).where(eq(inacbg_grouping_stage12.no_sep, nomor_sep));
    await db.insert(inacbg_grouping_stage12).values({
      no_sep: nomor_sep,
      code_cbg: msg.response_inacbg.cbg.code,
      deskripsi: msg.response_inacbg.cbg.description,
      tarif: parseFloat(msg.response_inacbg.tariff) || 0,
    });
    await FinalisasiKlaim(nomor_sep, coder_nik);
  }
  return msg;
}

export async function GroupingStage13(nomor_sep: string, coder_nik: string) {
  const request = {
    metadata: { method: "grouper", stage: "1", grouper: "inacbg" },
    data: { nomor_sep },
  };
  const msg = await requestEKlaim(request);
  if (msg?.metadata?.message === "Ok") {
    await db.delete(inacbg_grouping_stage12).where(eq(inacbg_grouping_stage12.no_sep, nomor_sep));
    await db.insert(inacbg_grouping_stage12).values({
      no_sep: nomor_sep,
      code_cbg: msg.response_inacbg.cbg.code,
      deskripsi: msg.response_inacbg.cbg.description,
      tarif: parseFloat(msg.response_inacbg.tariff) || 0,
    });
    await FinalisasiKlaim(nomor_sep, coder_nik);
  }
  return msg;
}

export async function GroupingStage2(nomor_sep: string, special_cmg: string) {
  const request = {
    metadata: { method: "grouper", stage: "2", grouper: "inacbg" },
    data: { nomor_sep, special_cmg },
  };
  const msg = await requestEKlaim(request);
  console.log("Respon Grouping INACBG : " + msg?.metadata?.message);
  return msg;
}

export async function InacBGToDRG(nomor_sep: string, diagnosainacbg: string, procedureinacbg: string) {
  const request = {
    metadata: { method: "idrg_to_inacbg_import" },
    data: { nomor_sep },
  };
  const msg = await requestEKlaim(request);

  if (msg?.metadata?.message === "Ok") {
    if (diagnosainacbg) {
      await requestEKlaim({
        metadata: { method: "inacbg_diagnosa_set", nomor_sep },
        data: { diagnosa: "#" },
      });
      await requestEKlaim({
        metadata: { method: "inacbg_diagnosa_set", nomor_sep },
        data: { diagnosa: diagnosainacbg },
      });
    }
    if (procedureinacbg) {
      await requestEKlaim({
        metadata: { method: "inacbg_procedure_set", nomor_sep },
        data: { procedure: "#" },
      });
      await requestEKlaim({
        metadata: { method: "inacbg_procedure_set", nomor_sep },
        data: { procedure: procedureinacbg },
      });
    }
  }
  return msg;
}

export async function FinalisasiKlaim(nomor_sep: string, coder_nik: string) {
  await requestEKlaim({
    metadata: { method: "inacbg_grouper_final" },
    data: { nomor_sep },
  });
  const msg = await requestEKlaim({
    metadata: { method: "claim_final" },
    data: { nomor_sep, coder_nik },
  });
  return msg;
}

export async function EditUlangKlaim(nomor_sep: string) {
  await requestEKlaim({
    metadata: { method: "reedit_claim" },
    data: { nomor_sep },
  });
  await requestEKlaim({
    metadata: { method: "idrg_grouper_reedit" },
    data: { nomor_sep },
  });
  await requestEKlaim({
    metadata: { method: "inacbg_grouper_reedit" },
    data: { nomor_sep },
  });
}

export async function KirimKlaimPeriodeKeDC(start_dt: string, stop_dt: string, jenis_rawat: string) {
  return await requestEKlaim({
    metadata: { method: "send_claim" },
    data: { start_dt, stop_dt, jenis_rawat, date_type: "2" },
  });
}

export async function KirimKlaimIndividualKeDC(nomor_sep: string) {
  return await requestEKlaim({
    metadata: { method: "send_claim_individual" },
    data: { nomor_sep },
  });
}

export async function MenarikDataKlaimPeriode(start_dt: string, stop_dt: string, jenis_rawat: string) {
  return await requestEKlaim({
    metadata: { method: "pull_claim" },
    data: { start_dt, stop_dt, jenis_rawat },
  });
}

export async function MengambilDataDetailPerklaim(nomor_sep: string) {
  return await requestEKlaim({
    metadata: { method: "get_claim_data" },
    data: { nomor_sep },
  });
}

export async function MengambilSetatusPerklaim(nomor_sep: string) {
  return await requestEKlaim({
    metadata: { method: "get_claim_status" },
    data: { nomor_sep },
  });
}

export async function MenghapusKlaim(nomor_sep: string, coder_nik: string) {
  return await requestEKlaim({
    metadata: { method: "delete_claim" },
    data: { nomor_sep, coder_nik },
  });
}

export async function CetakKlaim(nomor_sep: string) {
  return await requestEKlaim({
    metadata: { method: "claim_print" },
    data: { nomor_sep },
  });
}

