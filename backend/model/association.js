const agen = require("./agenModel");
const kecamatan = require("./kecamatanModel");
const jenis = require("./jenisModel");
const kapal = require("./kapalModel");
const kategoriMuatan = require("./kategoriMuatanModel");
const muatan = require("./muatanModel");
const nahkoda = require("./nahkodaModel");
const perjalanan = require("./perjalananModel");
const spb = require("./spbModel");
const kabupaten = require("./kabupatenModel");
const negara = require("./negaraModel");
const provinsi = require("./provinsiModel");
const users = require("./userModel");
const logUser = require("./logUserModel");
const muatanKendaraan = require("./muatanKendaraanModel");
const pelabuhan = require("./pelabuhanModel");
const jenisMuatan = require("./jenisMuatanModel");
const pembayaran = require("./pembayaranModel");

jenis.hasMany(kapal, { foreignKey: "id_jenis", onDelete: "SET NULL", onUpdate: "CASCADE" })

kapal.belongsTo(jenis, { foreignKey: "id_jenis", onDelete: "SET NULL", onUpdate: "CASCADE" })

negara.hasMany(kapal, { foreignKey: "id_bendera", onDelete: "SET NULL", onUpdate: "CASCADE" })

kapal.belongsTo(negara, { as: "bendera", foreignKey: "id_bendera", onDelete: "SET NULL", onUpdate: "CASCADE" })

spb.hasOne(perjalanan, { foreignKey: "id_spb", onDelete: "SET NULL", onUpdate: "CASCADE" })

perjalanan.belongsTo(spb, { foreignKey: "id_spb", onDelete: "SET NULL", onUpdate: "CASCADE" })

kapal.hasMany(perjalanan, { foreignKey: "id_kapal", onDelete: "SET NULL", onUpdate: "CASCADE" })

perjalanan.belongsTo(kapal, { foreignKey: "id_kapal", onDelete: "SET NULL", onUpdate: "CASCADE" })

nahkoda.hasMany(perjalanan, { foreignKey: "id_nahkoda", onDelete: "SET NULL", onUpdate: "CASCADE" })

perjalanan.belongsTo(nahkoda, { foreignKey: "id_nahkoda", onDelete: "SET NULL", onUpdate: "CASCADE" })

negara.hasMany(provinsi, { foreignKey: "id_negara", onDelete: "SET NULL", onUpdate: "CASCADE" })

provinsi.belongsTo(negara, { foreignKey: "id_negara", onDelete: "SET NULL", onUpdate: "CASCADE" })

provinsi.hasMany(kabupaten, { foreignKey: "id_provinsi", onDelete: "SET NULL", onUpdate: "CASCADE" })

kabupaten.belongsTo(provinsi, { foreignKey: "id_provinsi", onDelete: "SET NULL", onUpdate: "CASCADE" })

kabupaten.hasMany(kecamatan, { foreignKey: "id_kabupaten", onDelete: "SET NULL", onUpdate: "CASCADE" })

kecamatan.belongsTo(kabupaten, { foreignKey: "id_kabupaten", onDelete: "SET NULL", onUpdate: "CASCADE" })

kabupaten.hasMany(perjalanan, { foreignKey: "id_kedudukan_kapal", onDelete: "SET NULL", onUpdate: "CASCADE" })

perjalanan.belongsTo(kabupaten, { as: "kedudukan_kapal", foreignKey: "id_kedudukan_kapal", onDelete: "SET NULL", onUpdate: "CASCADE" })

kecamatan.hasMany(perjalanan, { foreignKey: "id_datang_dari", onDelete: "SET NULL", onUpdate: "CASCADE" })

perjalanan.belongsTo(kecamatan, { as: "datang_dari", foreignKey: "id_datang_dari", onDelete: "SET NULL", onUpdate: "CASCADE" })

kecamatan.hasMany(perjalanan, { foreignKey: "id_tempat_singgah", onDelete: "SET NULL", onUpdate: "CASCADE" })

perjalanan.belongsTo(kecamatan, { as: "tempat_singgah", foreignKey: "id_tempat_singgah", onDelete: "SET NULL", onUpdate: "CASCADE" })

kecamatan.hasMany(perjalanan, { foreignKey: "id_tujuan_akhir", onDelete: "SET NULL", onUpdate: "CASCADE" })

perjalanan.belongsTo(kecamatan, { as: "tujuan_akhir", foreignKey: "id_tujuan_akhir", onDelete: "SET NULL", onUpdate: "CASCADE" })

pelabuhan.hasMany(perjalanan, { foreignKey: "id_tolak", onDelete: "SET NULL", onUpdate: "CASCADE" })

perjalanan.belongsTo(pelabuhan, {as: "tolak", foreignKey: "id_tolak", onDelete: "SET NULL", onUpdate: "CASCADE"})

pelabuhan.hasMany(perjalanan, { foreignKey: "id_sandar", onDelete: "SET NULL", onUpdate: "CASCADE" })

perjalanan.belongsTo(pelabuhan, {as: "sandar", foreignKey: "id_sandar", onDelete: "SET NULL", onUpdate: "CASCADE"})

agen.hasMany(perjalanan, { foreignKey: "id_agen", onDelete: "SET NULL", onUpdate: "CASCADE" })

perjalanan.belongsTo(agen, { foreignKey: "id_agen", onDelete: "SET NULL", onUpdate: "CASCADE" })

perjalanan.hasMany(pembayaran, { as: "pembayaran", foreignKey: "id_perjalanan", onDelete: "CASCADE", onUpdate: "CASCADE" })

pembayaran.belongsTo(perjalanan, { as: "pembayaran", foreignKey: "id_perjalanan", onDelete: "CASCADE", onUpdate: "CASCADE" })

perjalanan.hasMany(muatan, { as: "muatans", foreignKey: "id_perjalanan", onDelete: "CASCADE", onUpdate: "CASCADE" })

muatan.belongsTo(perjalanan, { foreignKey: "id_perjalanan", onDelete: "CASCADE", onUpdate: "CASCADE" })

jenisMuatan.hasMany(kategoriMuatan, {foreignKey: "id_jenis_muatan", onDelete: "SET NULL", onUpdate: "CASCADE"})

kategoriMuatan.belongsTo(jenisMuatan, {as: "jenis_muatan", foreignKey: "id_jenis_muatan", onDelete: "SET NULL", onUpdate: "CASCADE"})

kategoriMuatan.hasMany(muatan, { foreignKey: "id_kategori_muatan", onDelete: "SET NULL", onUpdate: "CASCADE" })

muatan.belongsTo(kategoriMuatan, { as: "kategori_muatan", foreignKey: "id_kategori_muatan", onDelete: "SET NULL", onUpdate: "CASCADE" })

perjalanan.hasMany(muatanKendaraan, { as: "muatan_kendaraan", foreignKey: "id_perjalanan", onDelete: "CASCADE", onUpdate: "CASCADE" })

muatanKendaraan.belongsTo(perjalanan, { foreignKey: "id_perjalanan", onDelete: "CASCADE", onUpdate: "CASCADE" })


module.exports = { agen, kecamatan, kabupaten, negara, jenis, kapal, kategoriMuatan, muatan, nahkoda, perjalanan, pelabuhan, spb, users, logUser, pembayaran, jenisMuatan }