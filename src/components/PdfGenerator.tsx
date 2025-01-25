import React, { useState, useRef } from "react";
import jsPDF from "jspdf";

interface FormData {
  ferreteriaName: string;
  ferreteriaEmail: string;
  invoiceItems: { description: string; price: number; quantity: number }[];
}

const PDFGenerator: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    ferreteriaName: "Ferreteria Del Mallin",
    ferreteriaEmail: "alfonsclau@yahoo.com.ar",
    invoiceItems: [{ description: "", price: 0, quantity: 0 }],
  });

  const logoRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number,
  ) => {
    const { name, value } = e.target;
    if (name === "description" || name === "price" || name === "quantity") {
      const updatedItems = [...formData.invoiceItems];
      if (index !== undefined) {
        updatedItems[index] = {
          ...updatedItems[index],
          [name]:
            name === "price" || name === "quantity" ? parseFloat(value) : value,
        };
      }
      setFormData({ ...formData, invoiceItems: updatedItems });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addInvoiceItem = () => {
    setFormData({
      ...formData,
      invoiceItems: [
        ...formData.invoiceItems,
        { description: "", price: 0, quantity: 0 },
      ],
    });
  };

  const removeInvoiceItem = (index: number) => {
    const updatedItems = formData.invoiceItems.filter((_, i) => i !== index);
    setFormData({ ...formData, invoiceItems: updatedItems });
  };

  const resetForm = () => {
    setFormData({
      clientName: "",
      clientEmail: "",
      invoiceItems: [{ description: "", price: 0, quantity: 0 }],
    });
    if (logoRef.current) {
      logoRef.current.value = "";
    }
  };

  const generatePDF = async () => {
    const doc = new jsPDF();

    const totalAmount = formData.invoiceItems.reduce(
      (sum, item) => sum + (item.price * item.quantity || 0),
      0,
    );

    let logoDataURL = "";
    if (logoRef.current?.files?.[0]) {
      const logoFile = logoRef.current.files[0];
      logoDataURL = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(logoFile);
      });
    }

    // Logo
    if (logoDataURL) {
      doc.addImage(logoDataURL, "JPEG", 10, 10, 50, 30);
    }

    // Header
    doc.setFontSize(16);
    doc.text("Factura", 105, 20, { align: "center" });

    // Client details
    doc.setFontSize(12);
    doc.text(`Nombre del Cliente: ${formData.clientName}`, 10, 50);
    doc.text(`Email del Cliente: ${formData.clientEmail}`, 10, 60);

    // Table header
    doc.setFontSize(12);
    doc.text("Descripción", 10, 80);
    doc.text("Precio", 80, 80);
    doc.text("Cantidad", 120, 80);
    doc.text("Subtotal", 160, 80);

    // Table rows
    let yOffset = 90;
    formData.invoiceItems.forEach((item) => {
      const subtotal = item.price * item.quantity;
      doc.text(item.description, 10, yOffset);
      doc.text(item.price.toFixed(2), 80, yOffset, { align: "right" });
      doc.text(item.quantity.toString(), 120, yOffset, { align: "right" });
      doc.text(subtotal.toFixed(2), 160, yOffset, { align: "right" });
      yOffset += 10;
    });

    // Total
    doc.setFontSize(14);
    doc.text(`Total: $${totalAmount.toFixed(2)}`, 160, yOffset + 10, {
      align: "right",
    });

    // Save PDF
    doc.save("factura.pdf");

    // Reset form after generating PDF
    resetForm();
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Generador de Facturas</h1>

      <div className="mb-4">
        <label className="block mb-1">Logo de la Empresa:</label>
        <input type="file" ref={logoRef} accept="image/*" />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Nombre: Ferreteria Del Mallin</label>
        {/* <input */}
        {/*   type="text" */}
        {/*   name="clientName" */}
        {/*   value={formData.clientName} */}
        {/*   onChange={handleInputChange} */}
        {/*   className="border p-2 w-full" */}
        {/* /> */}
      </div>

      <div className="mb-4">
        <label className="block mb-1">Email: {formData.ferreteriaEmail}</label>
        {/* <input */}
        {/*   type="email" */}
        {/*   name="clientEmail" */}
        {/*   value={formData.clientEmail} */}
        {/*   onChange={handleInputChange} */}
        {/*   className="border p-2 w-full" */}
        {/* /> */}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Items de Factura:</h2>
        {formData.invoiceItems.map((item, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              name="description"
              value={item.description}
              onChange={(e) => handleInputChange(e, index)}
              className="border p-2 flex-1 mr-2"
              placeholder="Descripción"
            />
            <input
              type="number"
              name="price"
              value={item.price}
              onChange={(e) => handleInputChange(e, index)}
              className="border p-2 w-32 mr-2"
              placeholder="Precio"
            />
            <input
              type="number"
              name="quantity"
              value={item.quantity}
              onChange={(e) => handleInputChange(e, index)}
              className="border p-2 w-32 mr-2"
              placeholder="Cantidad"
            />
            <button
              onClick={() => removeInvoiceItem(index)}
              className="bg-red-500 text-white p-2"
            >
              Eliminar
            </button>
          </div>
        ))}
        <button onClick={addInvoiceItem} className="bg-blue-500 text-white p-2">
          Agregar Item
        </button>
      </div>

      <div className="mt-4">
        <button onClick={generatePDF} className="bg-green-500 text-white p-2">
          Generar PDF
        </button>
      </div>
    </div>
  );
};

export default PDFGenerator;
