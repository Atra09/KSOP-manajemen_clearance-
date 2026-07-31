import Label from '../form/Label';
import InputField from '../form/InputField';
import Select from '../form/Select';
import Button from '../ui/Button';

const Step1DataKapal = ({
    formData, setFormData, nextStep, handleKapalChange,
    kapalOptions, nahkodaOptions, kabupatenOptions,
    kecamatanOptions, agenOptions, jenisPpkOptions, pelabuhanOptions
}) => {

    const handleChange = (e) => {
        let { name, value } = e.target;
        
        if (name === 'no_urut' || name === 'no_spb' || name === 'jumlah_crew') {
            if (value !== '' && !/^[0-9]*$/.test(value)) {
                return;
            }
        }
        if ((name === 'rambu_nilai' || name === 'labuh_nilai') && value !== '' && !/^[0-9]*$/.test(value)) {
            return;
        }

        if (name === 'kapalId') {
            handleKapalChange(value);
        }
        else if (name === "no_spb_asal" || name === "no_spb") {
            setFormData(prev => ({
                ...prev,
                spb: {
                    ...prev.spb,
                    [name]: value
                }
            }));
        }
        else if (name === 'rambu_ntpn' || name === 'rambu_nilai') {
            const field = name.split('_')[1];
            setFormData(prev => ({
                ...prev,
                pembayaran_rambu: { ...prev.pembayaran_rambu, [field]: value }
            }));
        }
        else if (name === 'labuh_ntpn' || name === 'labuh_nilai') {
            const field = name.split('_')[1];
            setFormData(prev => ({
                ...prev,
                pembayaran_labuh: { ...prev.pembayaran_labuh, [field]: value }
            }));
        }
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleNext = () => {
        const form = document.querySelector('form');
        if (!form.checkValidity()) {
            form.reportValidity(); 
            return;
        }
        nextStep();
    };

    const createOptions = (items, placeholder) => [
        { value: '', label: placeholder, disabled: true }, 
        ...items.map(item => ({ value: item.id, label: item.nama }))
    ];

    const createOptionalOptions = (items, placeholder) => [
        { value: '', label: placeholder, disabled: false },
        ...items.map(item => ({ value: item.id, label: item.nama }))
    ];


    return (
        <div className="space-y-6">
            <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800">Data Clearance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    <div><Label htmlFor="jenisPpk">Jenis PPK</Label><Select id="jenisPpk" name="ppk" value={formData.ppk || ''} onChange={handleChange} options={createOptions(jenisPpkOptions, 'Pilih Jenis PPK')} required /></div>
                    <div>
                        <Label htmlFor="nomorRegister">Nomor Register</Label>
                        <InputField
                            id="nomorRegister"
                            name="no_urut"
                            value={formData.no_urut || ''}
                            onChange={handleChange}
                            required
                            inputMode="numeric"
                            pattern="[0-9]*"
                            title="Input harus berupa angka"
                        />
                    </div>
                    <div>
                        <Label htmlFor="nomorSpb">Nomor SPB</Label>
                        <InputField
                            id="nomorSpb"
                            name="no_spb"
                            value={formData.spb?.no_spb || ''}
                            onChange={handleChange}
                            required
                            inputMode="numeric"
                            pattern="[0-9]*"
                            title="Input harus berupa angka"
                        />
                    </div>
                    <div>
                        <Label htmlFor="noSpbAsal">No SPB Asal</Label>
                        <InputField
                            id="noSpbAsal"
                            name="no_spb_asal"
                            value={formData.spb?.no_spb_asal || ''}
                            onChange={handleChange}
                            required
                            type="text"
                        />
                    </div>
                    <div><Label htmlFor="tanggalClearance">Tanggal Clearance</Label><InputField id="tanggalClearance" name="tanggal_clearance" type="date" value={formData.tanggal_clearance || ''} onChange={handleChange} required /></div>
                    <div><Label htmlFor="pukulClearance">Pukul Clearance</Label><InputField id="pukulClearance" name="pukul_agen_clearance" type="time" value={formData.pukul_agen_clearance || ''} onChange={handleChange} required /></div>
                </div>
            </div>

            <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800">Data Kapal & Awak</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div><Label htmlFor="kapalId">Nama Kapal</Label><Select id="kapalId" name="id_kapal" value={formData.id_kapal || ''} onChange={handleChange} options={createOptions(kapalOptions, 'Pilih Kapal')} required /></div>
                    <div><Label htmlFor="nahkodaId">Nama Nahkoda</Label><Select id="nahkodaId" name="id_nahkoda" value={formData.id_nahkoda || ''} onChange={handleChange} options={createOptions(nahkodaOptions, 'Pilih Nahkoda')} required /></div>
                    <div>
                        <Label htmlFor="jumlahCrew">Jumlah Crew</Label>
                        <InputField
                            id="jumlahCrew"
                            name="jumlah_crew"
                            type="text"
                            value={formData.jumlah_crew || ''}
                            onChange={handleChange}
                            required
                            inputMode="numeric"
                            pattern="[0-9]*"
                            title="Input harus berupa angka"
                        />
                    </div>
                </div>
            </div>

            <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800">Data Perjalanan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div><Label htmlFor="kedudukanKapal">Kedudukan Kapal</Label><Select id="kedudukanKapal" name="id_kedudukan_kapal" value={formData.id_kedudukan_kapal || ''} onChange={handleChange} options={createOptions(kabupatenOptions, 'Pilih Kedudukan')} required /></div>
                    <div><Label htmlFor="datangDari">Datang Dari</Label><Select id="datangDari" name="id_datang_dari" value={formData.id_datang_dari || ''} onChange={handleChange} options={createOptions(kecamatanOptions, 'Pilih Asal')} required /></div>
                    <div><Label htmlFor="tanggalDatang">Tanggal Datang</Label><InputField id="tanggalDatang" name="tanggal_datang" type="date" value={formData.tanggal_datang || ''} onChange={handleChange} required /></div>

                     <div>
                        <Label htmlFor="sandarDi">Sandar Di</Label>
                        <Select
                            id="sandarDi"
                            name="id_sandar"
                            value={formData.id_sandar || ''}
                            onChange={handleChange}
                            options={createOptions(pelabuhanOptions, 'Pilih Pelabuhan Sandar')}
                            required
                        />
                    </div>
                   <div>
                        <Label htmlFor="tolakDari">Tolak Dari</Label>
                        <Select
                            id="tolakDari"
                            name="id_tolak"
                            value={formData.id_tolak || ''}
                            onChange={handleChange}
                            options={createOptions(pelabuhanOptions, 'Pilih Pelabuhan Tolak')}
                            required
                        />
                    </div>
                     <div></div>
                    <div><Label htmlFor="tujuanAkhir">Tujuan Akhir</Label><Select id="tujuanAkhir" name="id_tujuan_akhir" value={formData.id_tujuan_akhir || ''} onChange={handleChange} options={createOptions(kecamatanOptions, 'Pilih Tujuan')} required /></div>
                    <div><Label htmlFor="tanggalBerangkat">Tanggal Berangkat</Label><InputField id="tanggalBerangkat" name="tanggal_berangkat" type="date" value={formData.tanggal_berangkat || ''} onChange={handleChange} required /></div>
                    <div><Label htmlFor="pukulKapalBerangkat">Pukul Berangkat</Label><InputField id="pukulKapalBerangkat" name="pukul_kapal_berangkat" type="time" value={formData.pukul_kapal_berangkat || ''} onChange={handleChange} required /></div>

                     <div>
                        <Label htmlFor="tempatSinggah">Pelabuhan Singgah Lanjutan (Opsional)</Label>
                        <Select
                            id="tempatSinggah"
                            name="id_tempat_singgah"
                            value={formData.id_tempat_singgah || ''}
                            onChange={handleChange}
                            options={createOptionalOptions(kecamatanOptions, 'Pilih Pelabuhan Lanjutan (Opsional)')}
                        />
                    </div>
                    <div className="md:col-span-2"><Label htmlFor="agenKapalId">Agen Kapal</Label><Select id="agenKapalId" name="id_agen" value={formData.id_agen || ''} onChange={handleChange} options={createOptions(agenOptions, 'Pilih Agen')} required /></div>


                    <div>
                        <Label>Status Muatan Berangkat</Label>
                        <div className="flex gap-4 h-11 items-center">
                            <label className="flex items-center"><input type="radio" name="status_muatan_berangkat" value="NIHIL" checked={formData.status_muatan_berangkat === 'NIHIL'} onChange={handleChange} className="mr-2" />Kosong</label>
                            <label className="flex items-center"><input type="radio" name="status_muatan_berangkat" value="SESUAI MANIFEST" checked={formData.status_muatan_berangkat === 'SESUAI MANIFEST'} onChange={handleChange} className="mr-2" />Ada Muatan</label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800">Data Pembayaran (Opsional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <Label htmlFor="rambu_ntpn">NTPN Rambu</Label>
                        <InputField
                            id="rambu_ntpn"
                            name="rambu_ntpn"
                            value={formData.pembayaran_rambu?.ntpn || ''}
                            onChange={handleChange}
                            type="text"
                            placeholder="Masukkan NTPN Rambu"
                        />
                    </div>
                    <div>
                        <Label htmlFor="rambu_nilai">Nilai Rambu (Rp)</Label>
                        <InputField
                            id="rambu_nilai"
                            name="rambu_nilai"
                            value={formData.pembayaran_rambu?.nilai || ''}
                            onChange={handleChange}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            title="Input harus berupa angka"
                            placeholder="Contoh: 125000"
                        />
                    </div>
                    
                    <div>
                        <Label htmlFor="labuh_ntpn">NTPN Labuh</Label>
                        <InputField
                            id="labuh_ntpn"
                            name="labuh_ntpn"
                            value={formData.pembayaran_labuh?.ntpn || ''}
                            onChange={handleChange}
                            type="text"
                            placeholder="Masukkan NTPN Labuh"
                        />
                    </div>
                    <div>
                        <Label htmlFor="labuh_nilai">Nilai Labuh (Rp)</Label>
                        <InputField
                            id="labuh_nilai"
                            name="labuh_nilai"
                            value={formData.pembayaran_labuh?.nilai || ''}
                            onChange={handleChange}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            title="Input harus berupa angka"
                            placeholder="Contoh: 250000"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="button" onClick={handleNext}>
                    Berikutnya
                </Button>
            </div>
        </div>
    );
};

export default Step1DataKapal;