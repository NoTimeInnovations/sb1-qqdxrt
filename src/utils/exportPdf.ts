import { format, isWithinInterval, parseISO } from 'date-fns';
import { Sale, Purchase } from '../types';
import html2pdf from 'html2pdf.js';

const formatMaterialsList = (items: Array<{ materialName: string; quantity: number }>) => {
  return items.map(item => `${item.materialName}(${item.quantity})`).join(', ');
};

export const generateExportHTML = (
  records: (Sale | Purchase)[],
  startDate: string,
  endDate: string,
  type: 'sales' | 'purchases'
) => {
  const filteredRecords = records.filter((record) => {
    const recordDate = parseISO(record.date);
    return isWithinInterval(recordDate, {
      start: parseISO(startDate),
      end: parseISO(endDate),
    });
  });

  const total = filteredRecords.reduce((sum, record) => {
    return sum + ('total' in record ? record.total : record.subtotal);
  }, 0);

  const html = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="text-align: center; color: #1a56db; margin-bottom: 20px;">
        ${type === 'sales' ? 'Sales' : 'Purchases'} Report
      </h1>
      <div style="margin-bottom: 20px;">
        <p><strong>Period:</strong> ${format(parseISO(startDate), 'dd/MM/yyyy')} - ${format(
    parseISO(endDate),
    'dd/MM/yyyy'
  )}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Date</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Invoice No</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">
              ${type === 'sales' ? 'Customer' : 'Supplier'}
            </th>
            ${type === 'purchases' ? '<th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Materials</th>' : ''}
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${filteredRecords
            .map(
              (record) => `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                ${format(parseISO(record.date), 'dd/MM/yyyy')}
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                #${record.invoiceNumber}
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                ${
                  'customerName' in record
                    ? record.customerName
                    : record.supplierName
                }
              </td>
              ${type === 'purchases' ? 
                `<td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                  ${formatMaterialsList(record.items)}
                </td>` 
                : ''
              }
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                ₹${
                  'total' in record ? record.total : record.subtotal
                }
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
        <tfoot>
          <tr style="font-weight: bold; background-color: #f3f4f6;">
            <td colspan="${type === 'purchases' ? '4' : '3'}" style="padding: 12px; text-align: right;">Total:</td>
            <td style="padding: 12px; text-align: right;">₹${total}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  return html;
};

export const exportToPdf = async (
  records: (Sale | Purchase)[],
  startDate: string,
  endDate: string,
  type: 'sales' | 'purchases'
) => {
  const html = generateExportHTML(records, startDate, endDate, type);
  const opt = {
    margin: 1,
    filename: `${type}-report-${startDate}-to-${endDate}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  };

  const element = document.createElement('div');
  element.innerHTML = html;
  document.body.appendChild(element);

  try {
    await html2pdf().set(opt).from(element).save();
  } finally {
    document.body.removeChild(element);
  }
};