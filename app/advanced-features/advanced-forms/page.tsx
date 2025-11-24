"use client";

import { FormTemplate } from '@/app/components/ui/forms/FormTemplate';
import { FieldConfig, FormRow } from '@/app/components/ui/forms/FormTemplate';

const CheckoutPage = () => {
  const checkoutRows: FormRow[] = [
    {
      className: "grid grid-cols-1 md:grid-cols-3 gap-4",
      fields: {
        firstName: {
          label: "Nombre",
          type: "text",
          placeholder: "Tu nombre",
          validate: { required: true, onlyLetters: true },
          className: "input-moderno"
        },
        lastName: {
          label: "Apellido", 
          type: "text",
          placeholder: "Tu apellido",
          validate: { required: true, onlyLetters: true },
          className: "input-moderno"
        },
        dni: {
          label: "DNI",
          type: "text",
          placeholder: "12345678A", 
          validate: { required: true, min4: true },
          className: "input-moderno"
        }
      }
    },
    {
      className: "grid grid-cols-1 md:grid-cols-2 gap-4",
      fields: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "tu@email.com",
          validate: { required: true, email: true },
          className: "input-moderno"
        },
        phone: {
          label: "Teléfono",
          type: "tel", 
          placeholder: "612345678",
          validate: { required: true, phone: true },
          className: "input-moderno"
        }
      }
    },
    {
      className: "grid grid-cols-1 md:grid-cols-2 gap-4", 
      fields: {
        street: {
          label: "Calle",
          type: "text",
          placeholder: "Calle principal",
          validate: { required: true },
          className: "input-moderno"
        },
        number: {
          label: "Número",
          type: "text",
          placeholder: "123",
          validate: { required: true },
          className: "input-moderno"
        }
      }
    },
    {
      className: "grid grid-cols-1 md:grid-cols-2 gap-4",
      fields: {
        city: {
          label: "Ciudad",
          type: "text",
          placeholder: "Tu ciudad", 
          validate: { required: true },
          className: "input-moderno"
        },
        zipCode: {
          label: "Código Postal",
          type: "text",
          placeholder: "28001",
          validate: { required: true, min4: true },
          className: "input-moderno"
        }
      }
    },
    {
      className: "grid grid-cols-1 gap-4",
      fields: {
        comments: {
          label: "Comentarios",
          type: "text",
          placeholder: "Comentarios adicionales...",
          validate: {},
          className: "input-moderno input-comentario"
        }
      }
    }
  ];

  const handleSubmit = (formData: Record<string, string>) => {
    console.log('Datos del checkout:', formData);
    alert('Pedido procesado correctamente!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-8">Finalizar Compra</h1>
        
        <FormTemplate
          formRows={checkoutRows}
          onSubmit={handleSubmit}
          submitText="Completar Pedido"
          className="space-y-6"
        />
      </div>

    </div>
  );
};

export default CheckoutPage;