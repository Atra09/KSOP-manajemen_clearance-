import Label from '../form/Label';
import Select from '../form/Select';
import InputField from '../form/InputField';
import Button from '../ui/Button';

const Step2DataMuatan = ({ formData, setFormData, prevStep, muatanOptions }) => {

  const golonganOptions = [
    { value: '', label: 'Pilih Golongan' },
    { value: 'I', label: 'Golongan I' },
    { value: 'II', label: 'Golongan II' },
    { value: 'III', label: 'Golongan III' },
    { value: 'IV', label: 'Golongan IV' },

    { value: 'V', label: 'Golongan V' },
    { value: 'VI', label: 'Golongan VI' },
  ];

  const handleGlobalChange = (e) => {
    const { name, value } = e.target;
    if ((name === 'penumpang_naik' || name === 'penumpang_turun') && value !== '' && !/^[0-9]*$/.test(value)) {
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRowChange = (type, index, e) => {
    let { name, value } = e.target;

    if ((name === 'ton' || name === 'm3' || name === 'unit' || name === 'liter' || name === 'quantity' || name === 'estimated_ton') && value !== '' && !/^[0-9]*\.?[0-9]*$/.test(value)) {
      return;
    }

    const list = [...(formData[type] || [])];
    const currentRow = { ...list[index] };
    const isKendaraan = currentRow.type === 'kendaraan';
    const selectedCat = !isKendaraan ? muatanOptions?.find(k => String(k.id) === String(currentRow.id_kategori_muatan)) : null;
    const bobotKg = parseFloat(selectedCat?.bobot_per_unit_kg || 0);

    // Reset values when category changes
    if (name === 'id_kategori_muatan') {
      currentRow.id_kategori_muatan = value;
      currentRow.quantity = '';
      currentRow.estimated_ton = '';
      currentRow.unit = null;
      currentRow.ton = null;
      currentRow.liter = null;
      currentRow.m3 = null;
    } else if (name === 'quantity') {
      currentRow.quantity = value;
      currentRow.unit = value !== '' ? value : null;
      if (bobotKg > 0 && value !== '' && !isNaN(parseFloat(value))) {
        const calc = (parseFloat(value) * bobotKg) / 1000;
        const est = Number.isInteger(calc) ? calc.toString() : parseFloat(calc.toFixed(3)).toString();
        currentRow.estimated_ton = est;
        currentRow.ton = est;
      } else if (value === '') {
        currentRow.estimated_ton = '';
        currentRow.ton = null;
      }
    } else if (name === 'estimated_ton') {
      currentRow.estimated_ton = value;
      currentRow.ton = value !== '' ? value : null;
      if (bobotKg > 0 && value !== '' && !isNaN(parseFloat(value))) {
        const calculatedQty = Math.round((parseFloat(value) * 1000) / bobotKg).toString();
        currentRow.quantity = calculatedQty;
        currentRow.unit = calculatedQty;
      } else if (value === '') {
        currentRow.quantity = '';
        currentRow.unit = null;
      }
    } else {
      currentRow[name] = value;
    }

    list[index] = currentRow;
    setFormData(prev => ({ ...prev, [type]: list }));
  };

  const removeRow = (type, index) => {
    const list = [...formData[type]];
    list.splice(index, 1);
    setFormData(prev => ({ ...prev, [type]: list }));
  };

  const addRow = (listType, itemType) => {
    const jenisPerjalanan = listType === 'barangDatang' ? 'datang' : 'berangkat';
    let newItem;

    if (itemType === 'kendaraan') {
      newItem = { type: 'kendaraan', golongan_kendaraan: '', unit: '', jenis_perjalanan: jenisPerjalanan };
    } else {
      newItem = { type: 'barang', id_kategori_muatan: '', quantity: '', estimated_ton: '', jenis_perjalanan: jenisPerjalanan };
    }

    setFormData(prev => ({
      ...prev,
      [listType]: [...(prev[listType] || []), newItem]
    }));
  };

  const renderRow = (item, index, listType) => {
    const isKendaraan = item.type === 'kendaraan';
    const selectedCat = !isKendaraan ? muatanOptions?.find(k => String(k.id) === String(item.id_kategori_muatan)) : null;
    const unitLabel = selectedCat?.nama_satuan_muatan || 'unit';
    const bobotKg = parseFloat(selectedCat?.bobot_per_unit_kg || 0);

    const currentQtyValue = item.quantity ?? item.unit ?? item.liter ?? item.m3 ?? item.ton ?? '';
    const currentTonValue = item.estimated_ton ?? item.ton ?? '';

    return (
      <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-4 pt-4 pb-4 px-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/80 shadow-xs items-start">
        <div className={isKendaraan ? "md:col-span-6" : "md:col-span-4"}>
          <Label>{isKendaraan ? 'Golongan Kendaraan' : 'Nama Muatan'}</Label>
          {isKendaraan ? (
            <Select
              name="golongan_kendaraan"
              value={item.golongan_kendaraan || ''}
              onChange={e => handleRowChange(listType, index, e)}
              options={golonganOptions}
              required
            />
          ) : (
            <Select
              name="id_kategori_muatan"
              value={item.id_kategori_muatan || ''}
              onChange={e => handleRowChange(listType, index, e)}
              options={[{ value: '', label: 'Pilih Muatan' }, ...muatanOptions.map(k => ({ value: k.id, label: k.nama }))]}
              required
            />
          )}
        </div>

        {isKendaraan ? (
          <div className="md:col-span-4">
            <Label>Jumlah (unit)</Label>
            <InputField
              name="unit"
              type="text"
              inputMode="decimal"
              value={item.unit || ''}
              onChange={e => handleRowChange(listType, index, e)}
              placeholder="0"
            />
          </div>
        ) : (
          <>
            <div className="md:col-span-3">
              <Label>{item.id_kategori_muatan ? `Jumlah (${unitLabel})` : 'Jumlah (Pilih Muatan)'}</Label>
              <InputField
                name="quantity"
                type="text"
                inputMode="decimal"
                value={currentQtyValue}
                onChange={e => handleRowChange(listType, index, e)}
                placeholder="0"
                disabled={!item.id_kategori_muatan}
              />
            </div>
            <div className="md:col-span-3">
              <Label>Estimasi Bobot (Ton)</Label>
              <InputField
                name="estimated_ton"
                type="text"
                inputMode="decimal"
                value={currentTonValue}
                onChange={e => handleRowChange(listType, index, e)}
                placeholder={bobotKg > 0 ? "0.00" : "-"}
                disabled={!item.id_kategori_muatan}
              />
            </div>
          </>
        )}

        <div className="md:col-span-2 flex flex-col justify-end">
          <span className="hidden md:block text-xs font-semibold invisible mb-1 select-none">Hapus</span>
          <button
            type="button"
            onClick={() => removeRow(listType, index)}
            className="bg-red-500 hover:bg-red-600 text-white font-medium px-3 py-2.5 rounded-lg h-11 w-full flex items-center justify-center gap-1.5 transition-colors shadow-xs shrink-0"
            title="Hapus baris"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Hapus</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Data Muatan (Datang)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="penumpang_turun">Jumlah Penumpang Turun (Opsional)</Label>
            <InputField
              name="penumpang_turun"
              id="penumpang_turun"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.penumpang_turun || ''}
              onChange={handleGlobalChange}
              placeholder="Jumlah orang"
            />
          </div>
        </div>
        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mt-6">Barang & Kendaraan (Datang)</h4>
        {(formData.barangDatang || []).map((item, index) => renderRow(item, index, 'barangDatang'))}
        <div className="mt-4 flex flex-wrap gap-2.5">
          <button 
            type="button" 
            onClick={() => addRow('barangDatang', 'barang')} 
            className="inline-flex items-center text-xs sm:text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg transition-colors shadow-xs"
          >
            + Tambah Barang
          </button>
          <button 
            type="button" 
            onClick={() => addRow('barangDatang', 'kendaraan')} 
            className="inline-flex items-center text-xs sm:text-sm font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 px-4 py-2.5 rounded-lg transition-colors shadow-xs"
          >
            + Tambah Kendaraan
          </button>
        </div>
      </div>

      {formData.status_muatan_berangkat === 'SESUAI MANIFEST' && (
        <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Data Muatan (Berangkat)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="penumpang_naik">Jumlah Penumpang Naik (Opsional)</Label>
              <InputField
                name="penumpang_naik"
                id="penumpang_naik"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.penumpang_naik || ''}
                onChange={handleGlobalChange}
                placeholder="Jumlah orang"
              />
            </div>
          </div>
          <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mt-6">Barang & Kendaraan (Berangkat)</h4>
          {(formData.barangBerangkat || []).map((item, index) => renderRow(item, index, 'barangBerangkat'))}
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button 
              type="button" 
              onClick={() => addRow('barangBerangkat', 'barang')} 
              className="inline-flex items-center text-xs sm:text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg transition-colors shadow-xs"
            >
              + Tambah Barang
            </button>
            <button 
              type="button" 
              onClick={() => addRow('barangBerangkat', 'kendaraan')} 
              className="inline-flex items-center text-xs sm:text-sm font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 px-4 py-2.5 rounded-lg transition-colors shadow-xs"
            >
              + Tambah Kendaraan
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-800 mt-6">
        <Button type="button" variant="secondary" onClick={prevStep}>Sebelumnya</Button>
        <Button type="submit">Simpan Clearance</Button>
      </div>
    </div>
  );
};

export default Step2DataMuatan;