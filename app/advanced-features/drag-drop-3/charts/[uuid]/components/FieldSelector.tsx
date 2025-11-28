'use client';

import React, { useState, useEffect } from 'react';

interface Props {
  formFields: string[];
  selectedField: string;
  onSelectField: (field: string) => void;
  onOpenModal?: (field: string) => void;
  chartData?: any[];
  renderChart?: (data: any[]) => void;
}

export const FieldSelector: React.FC<Props> = ({ 
  formFields, 
  selectedField, 
  onSelectField,
  onOpenModal,
  chartData,
  renderChart
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [modalField, setModalField] = useState<string>('');
  const [showPreview, setShowPreview] = useState<string | null>(null);

  // Efecto que se ejecuta cuando el modal se abre
  useEffect(() => {
    if (openModal && modalField && onOpenModal) {
      setTimeout(() => {
        onOpenModal(modalField);
      }, 100);
    }
  }, [openModal, modalField, onOpenModal]);

  if (formFields.length === 0) return null;

  const handleShowPreview = (field: string) => {
    setShowPreview(field);
    setOpenDropdown(null);
    onSelectField(field);
  };

  const handleOpenModalFromPreview = (field: string) => {
    setModalField(field);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalField('');
  };

  const handleClosePreview = (field: string) => {
    setShowPreview(null);
  };

  return (
    <>
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-bold mb-2">Selecciona un campo</h2>

        <div className="flex gap-2 flex-wrap">
          {formFields.map((f) => (
            <div key={f} className="relative">

              {/* --- Botón original --- */}
              <button
                onClick={() => onSelectField(f)}
                className={`px-4 py-2 rounded ${
                  selectedField === f ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {f}
              </button>

              {/* Botón para el dropdown */}
              <button
                onClick={() => setOpenDropdown(openDropdown === f ? null : f)}
                className="ml-1 px-2 py-2 rounded bg-gray-100 hover:bg-gray-200 border text-sm"
              >
                ⋮
              </button>

              {/* Dropdown */}
              {openDropdown === f && !openModal && (
                <div className="absolute left-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                  <button
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={() => handleShowPreview(f)}
                  >
                    Gráfico de Barras
                  </button>
                </div>
              )}

              {/* Icono de preview debajo del botón */}
              {showPreview === f && !openModal && (
                <div className="absolute left-0 top-full mt-2 z-50">
                  <div className="relative">
                    {/* Solo el icono */}
                    <div className="text-5xl">
                      📊
                    </div>
                    
                    {/* Botón circular flotante en la esquina superior derecha */}
                    <button
                      onClick={() => handleOpenModalFromPreview(f)}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-xs font-bold transition-all hover:scale-110"
                      title="Abrir modal"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- MODAL ---------------- */}
      {openModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-2xl relative w-[800px] max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              onClick={handleCloseModal}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4 pr-10">
              Gráfico de Barras - {modalField}
            </h2>

            {/* AQUÍ VA EL GRÁFICO DE BARRAS DEL MODAL */}
            <div id="chartdiv2" style={{ width: '100%', height: '400px' }}></div>
          </div>
        </div>
      )}
    </>
  );
};