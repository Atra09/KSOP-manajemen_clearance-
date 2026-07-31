import React, { useState, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { CheckLineIcon, ChevronDownIcon, TrashBinIcon } from '../../icons';
import Button from '../ui/Button';

const CustomCombobox = ({ items, selected, setSelected, onAddItem, onDeleteItem, placeholder }) => {
  const [query, setQuery] = useState('');

  const filteredItems =
    query === ''
      ? items
      : items.filter((item) =>
          item.toLowerCase().includes(query.toLowerCase())
        );

  const showAddItemButton = query.length > 0 && !items.some(item => item.toLowerCase() === query.toLowerCase());

  const handleDelete = (e, item) => {
    e.stopPropagation();
    if (window.confirm(`Anda yakin ingin menghapus jabatan "${item}"?`)) {
      onDeleteItem(item);
    }
  };

  return (
    <Combobox value={selected} onChange={setSelected}>
      <div className="relative">
        <div className="relative w-full cursor-default overflow-hidden rounded-lg border border-gray-300 bg-white text-left shadow-sm focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500/20">
          <Combobox.Input
            className="h-11 w-full border-none py-2.5 pl-4 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredItems.length === 0 && !showAddItemButton && (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                Tidak ditemukan.
              </div>
            )}
            {filteredItems.map((item) => (
              <Combobox.Option
                key={item}
                className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${ active ? 'bg-gray-100' : 'text-gray-900' }`}
                value={item}
              >
                {({ selected }) => (
                  <div className="flex items-center justify-between">
                    <span className={`block truncate ${ selected ? 'font-medium' : 'font-normal' }`}>
                      {item}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, item)}
                      className="ml-4 rounded-md p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
                    >
                      <TrashBinIcon className="h-4 w-4" />
                    </button>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-600">
                        <CheckLineIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </div>
                )}
              </Combobox.Option>
            ))}
            {showAddItemButton && (
              <div className="py-2 px-4">
                <p className="text-sm text-gray-500 mb-2">Jabatan tidak ditemukan.</p>
                <Button 
                  onClick={() => onAddItem(query)}
                  className="w-full text-sm"
                >
                  Tambah "{query}"
                </Button>
              </div>
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
};

export default CustomCombobox;