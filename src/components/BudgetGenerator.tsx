import React, { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Define types for form state and items
interface Item {
  description: string;
  quantity: number;
  price: number;
}

interface FormState {
  clientName: string;
  items: Item[];
}

const BudgetGenerator: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    clientName: "",
    items: [{ description: "", quantity: 1, price: 0 }],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number | null = null,
  ) => {
    const { name, value } = e.target;
    if (index !== null) {
      const updatedItems = [...form.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [name]: name === "quantity" || name === "price" ? +value : value,
      };
      setForm({ ...form, items: updatedItems });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { description: "", quantity: 1, price: 0 }],
    });
  };

  const generatePDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const { clientName, items } = form;

      let logoImage;
      try {
        // Add company logo
        const logoUrl = "https://via.placeholder.com/150"; // Replace with your logo URL
        const logoBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());
        logoImage = await pdfDoc.embedPng(logoBytes);
        const logoDims = logoImage.scale(0.5);
        page.drawImage(logoImage, {
          x: 50,
          y: 720,
          width: logoDims.width,
          height: logoDims.height,
        });
      } catch (error) {
        console.error("Error loading logo: ", error);
      }

      // Add header text
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      page.drawText("Factura", {
        x: 250,
        y: 750,
        size: 24,
        font,
        color: rgb(0, 0, 0),
      });

      page.drawText(`Cliente: ${clientName}`, {
        x: 50,
        y: 680,
        size: 14,
        font,
        color: rgb(0, 0, 0),
      });

      // Add table header
      page.drawText("Descripción", { x: 50, y: 640, size: 12, font });
      page.drawText("Cantidad", { x: 300, y: 640, size: 12, font });
      page.drawText("Precio", { x: 400, y: 640, size: 12, font });

      // Add table items
      let y = 620;
      items.forEach((item, index) => {
        page.drawText(item.description, { x: 50, y, size: 12, font });
        page.drawText(item.quantity.toString(), { x: 300, y, size: 12, font });
        page.drawText(`$${item.price.toFixed(2)}`, {
          x: 400,
          y,
          size: 12,
          font,
        });
        y -= 20;
      });

      // Calculate total
      const total = items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0,
      );
      page.drawText(`Total: $${total.toFixed(2)}`, {
        x: 400,
        y: y - 20,
        size: 14,
        font,
        color: rgb(0, 0, 0),
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `factura-${clientName}.pdf`;
      link.click();
    } catch (error) {
      console.error("Error generating PDF: ", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Generador de Facturas</h1>
      <div>
        <label>Cliente:</label>
        <input
          type="text"
          name="clientName"
          value={form.clientName}
          onChange={handleInputChange}
          className="border p-2 mb-2"
        />
      </div>
      {form.items.map((item, index) => (
        <div key={index} className="mb-2">
          <label>Descripción:</label>
          <input
            type="text"
            name="description"
            placeholder="Descripción"
            value={item.description}
            onChange={(e) => handleInputChange(e, index)}
            className="border p-2 mr-2"
          />
          <label>Cantidad:</label>
          <input
            type="number"
            name="quantity"
            placeholder="Cantidad"
            value={item.quantity}
            onChange={(e) => handleInputChange(e, index)}
            className="border p-2 mr-2"
          />
          <label>Precio:</label>
          <input
            type="number"
            name="price"
            placeholder="Precio"
            value={item.price}
            onChange={(e) => handleInputChange(e, index)}
            className="border p-2"
          />
        </div>
      ))}
      <button onClick={addItem} className="bg-blue-500 text-white p-2 rounded">
        Agregar ítem
      </button>
      <button
        onClick={generatePDF}
        className="bg-green-500 text-white p-2 rounded ml-2"
      >
        Generar PDF
      </button>
    </div>
  );
};

export default BudgetGenerator;
