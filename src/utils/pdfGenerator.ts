import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MealTrackerData, PaymentRecord, MessSettings, MealType } from '../types';
import { calculateBillingSummary, getDayRecord } from './storage';
import {
  getDatesInMonth,
  formatDateKey,
  getShortDayName,
  formatStringDateToIndian,
  getMonthName,
  format12HourTime,
} from './dateUtils';

export function exportMonthPDF(
  year: number,
  month: number, // 0-indexed
  data: MealTrackerData,
  settings: MessSettings,
  payments: PaymentRecord[]
): void {
  const currentPrice = settings.mealPrice && settings.mealPrice > 0 ? settings.mealPrice : 44;
  const dates = getDatesInMonth(year, month);
  const monthName = getMonthName(month);
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  
  // Calculate billing summary
  const billing = calculateBillingSummary(
    year,
    month,
    data,
    payments,
    settings.usePreviousAdvance ?? true,
    currentPrice
  );

  // Month payment records
  const monthPayments = payments.filter((p) => p.monthKey === monthKey);

  // Initialize jsPDF document (Portrait, mm, A4)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;

  // Primary colors
  const primaryColor = [15, 23, 42]; // Slate 900
  const emeraldColor = [5, 150, 105]; // Emerald 600
  const grayColor = [100, 116, 139]; // Slate 500
  const lightBg = [248, 250, 252]; // Slate 50

  // 1. Header Section
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Decorative Accent bar
  doc.setFillColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
  doc.rect(0, 28, pageWidth, 2, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MESS TRACKER REPORT', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text(`${settings.messName || 'Private Mess Tracker'} • Monthly Statement`, margin, 18);

  // Top Right Month Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.text(`${monthName.toUpperCase()} ${year}`, pageWidth - margin, 14, { align: 'right' });

  const generatedDateStr = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${generatedDateStr}`, pageWidth - margin, 20, { align: 'right' });

  let currentY = 36;

  // 2. Member & Mess Metadata Info Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);

  // Col 1: Member / Mess
  doc.text('Mess / Facility:', margin + 4, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.messName || 'Private Mess', margin + 32, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Member Name:', margin + 4, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.userName || 'Member Record', margin + 32, currentY + 12);

  // Col 2: Timings & Meal Rate
  const col2X = margin + 95;
  doc.setFont('helvetica', 'bold');
  doc.text('Rate per Meal:', col2X, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Rs. ${currentPrice} / meal`, col2X + 26, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Configured Times:', col2X, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `B: ${format12HourTime(settings.breakfastTime) || '8:00 AM'} | L: ${format12HourTime(settings.lunchTime) || '1:00 PM'} | D: ${format12HourTime(settings.dinnerTime) || '8:00 PM'}`,
    col2X + 29,
    currentY + 12
  );

  currentY += 23;

  // 3. Billing & Financial Summary Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('FINANCIAL & MEAL SUMMARY', margin, currentY);

  currentY += 4;

  const boxWidth = (pageWidth - margin * 2 - 9) / 4; // 4 columns
  const boxHeight = 18;

  // Card 1: Total Meals
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.roundedRect(margin, currentY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('TOTAL MEALS', margin + 3, currentY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${billing.totalMeals}`, margin + 3, currentY + 13);

  // Card 2: Total Bill
  const card2X = margin + boxWidth + 3;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(card2X, currentY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('MONTHLY BILL', card2X + 3, currentY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(185, 28, 28); // Red 700
  doc.text(`Rs. ${billing.monthlyBill.toLocaleString('en-IN')}`, card2X + 3, currentY + 13);

  // Card 3: Total Paid
  const card3X = card2X + boxWidth + 3;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(card3X, currentY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('TOTAL PAID', card3X + 3, currentY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(3, 105, 161); // Sky 700
  doc.text(`Rs. ${billing.effectivePaid.toLocaleString('en-IN')}`, card3X + 3, currentY + 13);

  // Card 4: Net Status
  const card4X = card3X + boxWidth + 3;
  const isAdvance = billing.advanceBalance > 0;
  if (isAdvance) {
    doc.setFillColor(224, 242, 254); // Sky 100
  } else if (billing.remainingBalance > 0) {
    doc.setFillColor(254, 242, 242); // Red 50
  } else {
    doc.setFillColor(209, 250, 229); // Emerald 100
  }
  doc.roundedRect(card4X, currentY, boxWidth, boxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(isAdvance ? 'ADVANCE BALANCE' : 'NET REMAINING', card4X + 3, currentY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  if (isAdvance) {
    doc.setTextColor(2, 132, 199); // Sky 600
    doc.text(`+Rs. ${billing.advanceBalance.toLocaleString('en-IN')}`, card4X + 3, currentY + 13);
  } else if (billing.remainingBalance > 0) {
    doc.setTextColor(220, 38, 38); // Red 600
    doc.text(`Rs. ${billing.remainingBalance.toLocaleString('en-IN')}`, card4X + 3, currentY + 13);
  } else {
    doc.setTextColor(5, 150, 105); // Emerald 600
    doc.text('Rs. 0 (SETTLED)', card4X + 3, currentY + 13);
  }

  currentY += boxHeight + 8;

  // Status Note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(
    `Status: ${billing.status} | Avg Expense: Rs. ${billing.averageDailyExpense}/day | Direct Payments: Rs. ${billing.totalPaid}${
      billing.previousAdvance > 0 ? ` | Prev Advance: Rs. ${billing.previousAdvance}` : ''
    }`,
    margin,
    currentY
  );

  currentY += 6;

  // 4. Daily Meal Records Table Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('DAILY MEAL RECORDS', margin, currentY);

  currentY += 3;

  // Prepare table rows
  const tableHeaders = [
    'Date',
    'Day',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Meals',
    'Rate',
    'Daily Cost',
    'Payment',
  ];

  const tableData: (string | number)[][] = [];

  dates.forEach((d) => {
    const dateKey = formatDateKey(d);
    const record = getDayRecord(data, dateKey, currentPrice);

    let dayMealCount = 0;
    let dayCost = 0;

    const bReceived = record.breakfast.received;
    const lReceived = record.lunch.received;
    const dReceived = record.dinner.received;

    if (bReceived) {
      dayMealCount++;
      dayCost += record.breakfast.amount ?? record.breakfast.rateAtTime ?? currentPrice;
    }
    if (lReceived) {
      dayMealCount++;
      dayCost += record.lunch.amount ?? record.lunch.rateAtTime ?? currentPrice;
    }
    if (dReceived) {
      dayMealCount++;
      dayCost += record.dinner.amount ?? record.dinner.rateAtTime ?? currentPrice;
    }

    const bStr = bReceived
      ? `YES (${record.breakfast.markedAt ? format12HourTime(record.breakfast.markedAt) : 'Yes'})`
      : '-';
    const lStr = lReceived
      ? `YES (${record.lunch.markedAt ? format12HourTime(record.lunch.markedAt) : 'Yes'})`
      : '-';
    const dStr = dReceived
      ? `YES (${record.dinner.markedAt ? format12HourTime(record.dinner.markedAt) : 'Yes'})`
      : '-';

    // Payments on this date
    const datePayments = payments.filter((p) => p.date === dateKey);
    const datePaidSum = datePayments.reduce((s, p) => s + p.amount, 0);

    tableData.push([
      formatStringDateToIndian(dateKey),
      getShortDayName(d),
      bStr,
      lStr,
      dStr,
      dayMealCount > 0 ? dayMealCount : '-',
      `Rs. ${currentPrice}`,
      dayCost > 0 ? `Rs. ${dayCost}` : 'Rs. 0',
      datePaidSum > 0 ? `Rs. ${datePaidSum}` : '-',
    ]);
  });

  // Table Footer Row
  const totalPaymentsInMonth = monthPayments.reduce((s, p) => s + p.amount, 0);
  const footerRow = [
    'TOTAL',
    '',
    '',
    '',
    '',
    `${billing.totalMeals}`,
    '',
    `Rs. ${billing.monthlyBill.toLocaleString('en-IN')}`,
    `Rs. ${totalPaymentsInMonth.toLocaleString('en-IN')}`,
  ];

  // Render Daily Meal Table using jspdf-autotable
  autoTable(doc, {
    startY: currentY,
    head: [tableHeaders],
    body: tableData,
    foot: [footerRow],
    margin: { left: margin, right: margin, bottom: 18 },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2,
      textColor: [30, 41, 59], // Slate 800
      lineColor: [226, 232, 240], // Slate 200
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [15, 23, 42], // Slate 900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
    },
    footStyles: {
      fillColor: [241, 245, 249], // Slate 100
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 22 }, // Date
      1: { halign: 'center', cellWidth: 12 }, // Day
      2: { halign: 'center' },                // Breakfast
      3: { halign: 'center' },                // Lunch
      4: { halign: 'center' },                // Dinner
      5: { halign: 'center', cellWidth: 15 }, // Meals
      6: { halign: 'right', cellWidth: 16 },  // Rate
      7: { halign: 'right', cellWidth: 22 },  // Cost
      8: { halign: 'right', cellWidth: 22 },  // Payment
    },
    didParseCell: (data) => {
      // Highlight row if meals were taken
      if (data.section === 'body') {
        const mealsCell = data.row.cells[5]?.raw;
        if (mealsCell && mealsCell !== '-') {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  let lastTableY = (doc as any).lastAutoTable.finalY || currentY + 50;

  // 5. Payment Records Section (if any payments exist in month)
  if (monthPayments.length > 0) {
    // Check if we need a new page or have room
    if (lastTableY + 35 > pageHeight - 20) {
      doc.addPage();
      lastTableY = 20;
    } else {
      lastTableY += 8;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`PAYMENT LOGS (${monthName} ${year})`, margin, lastTableY);

    const paymentHeaders = ['Date', 'Amount', 'Method', 'Notes'];
    const paymentRows = monthPayments.map((p) => [
      p.formattedDate || formatStringDateToIndian(p.date),
      `Rs. ${p.amount.toLocaleString('en-IN')}`,
      p.method,
      p.note || '-',
    ]);

    autoTable(doc, {
      startY: lastTableY + 3,
      head: [paymentHeaders],
      body: paymentRows,
      margin: { left: margin, right: margin, bottom: 18 },
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 2,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [3, 105, 161], // Sky 700
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 30 },
        1: { halign: 'right', cellWidth: 25 },
        2: { halign: 'center', cellWidth: 30 },
        3: { halign: 'left' },
      },
    });
  }

  // 6. Footer Page Numbers & Disclaimer on All Pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    // Footer Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400

    doc.text(
      `${settings.messName || 'My Mess Tracker'} • Computer Generated Report`,
      margin,
      pageHeight - 7
    );

    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7, {
      align: 'right',
    });
  }

  // Save/Download PDF
  const filenameMonth = String(month + 1).padStart(2, '0');
  const fileName = `Mess-Tracker-Report-${year}-${filenameMonth}.pdf`;
  doc.save(fileName);
}
