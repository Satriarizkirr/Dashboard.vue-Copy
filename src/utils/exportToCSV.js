// utils/exportToCSV.js
export function exportToCSV(filename, headers, data) {
  const csvRows = [];

  // Tambahkan header
  csvRows.push(headers.join(','));

  // Tambahkan baris data
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] ?? '';
      const safeValue = `"${String(value).replace(/"/g, '""')}"`; // Escape koma/kutip
      return safeValue;
    });
    csvRows.push(values.join(','));
  });

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
