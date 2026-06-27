import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

// helpers
const hex2rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const setFill = (doc: jsPDF, hex: string) => doc.setFillColor(...hex2rgb(hex));
const setTextColor = (doc: jsPDF, hex: string) => doc.setTextColor(...hex2rgb(hex));
const setDrawColor = (doc: jsPDF, hex: string) => doc.setDrawColor(...hex2rgb(hex));

async function makeQR(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 200,
    margin: 1,
    color: { dark: '#0f172a', light: '#ffffff' },
  });
}

const getBadgeColors = (value: string): { bg: string; text: string } => {
  const v = value.toUpperCase();
  if (v === 'CONFIRMED' || v === 'PAID') {
    return { bg: '#dcfce7', text: '#166534' };
  } else if (v === 'PENDING') {
    return { bg: '#fef3c7', text: '#9a3412' };
  } else {
    return { bg: '#fee2e2', text: '#991b1b' };
  }
};

// Flight Ticket PDF
export async function generateFlightTicketPDF(r: {
  id: string;
  status: string;
  paymentStatus: string;
  seatClass: string;
  seatsBooked: number;
  totalPrice: number | string;
  createdAt: string;
  flight: {
    flightNumber: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    airline: { name: string };
  };
  user?: { firstName: string; lastName: string; email?: string };
  payment?: { transactionId?: string };
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const W = 595;

  const qrData = await makeQR(
    `FLIGHTHOTEL-TICKET|${r.id}|${r.flight.flightNumber}|${r.status}`
  );

  // HEADER BANNER
  setFill(doc, '#0f172a');
  doc.roundedRect(36, 36, W - 72, 80, 8, 8, 'F');

  // Brand and document title
  setTextColor(doc, '#ffffff');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('FlightHotel', 56, 74);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setTextColor(doc, '#94a3b8');
  doc.text('BOARDING PASS & E-TICKET', 56, 92);

  // Flight pill on the right
  setFill(doc, '#1e293b');
  doc.roundedRect(W - 190, 52, 134, 48, 6, 6, 'F');
  
  setTextColor(doc, '#38bdf8');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(r.flight.flightNumber, W - 123, 74, { align: 'center' });

  setTextColor(doc, '#94a3b8');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(r.flight.airline.name, W - 123, 88, { align: 'center' });

  // ROUTE SECTION
  setTextColor(doc, '#0f172a');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Flight Route', 36, 142);

  // Route Card Background
  setFill(doc, '#f8fafc');
  doc.roundedRect(36, 150, W - 72, 76, 8, 8, 'F');
  setDrawColor(doc, '#e2e8f0');
  doc.roundedRect(36, 150, W - 72, 76, 8, 8, 'S');

  // Origin Airport Code
  setTextColor(doc, '#0f172a');
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(r.flight.origin, 60, 192);

  // Connector Line and Arrow
  setDrawColor(doc, '#cbd5e1');
  doc.setLineDashPattern([4, 3], 0);
  doc.setLineWidth(1);
  doc.line(190, 186, W - 190, 186);
  doc.setLineDashPattern([], 0);

  setTextColor(doc, '#94a3b8');
  doc.setFontSize(14);
  doc.text('>', W / 2 - 4, 190);

  // Destination Airport Code
  setTextColor(doc, '#0f172a');
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(r.flight.destination, W - 60, 192, { align: 'right' });

  // Departure and Arrival Times
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  setTextColor(doc, '#64748b');
  const dep = new Date(r.flight.departureTime);
  const arr = new Date(r.flight.arrivalTime);
  doc.text('Departure: ' + dep.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), 60, 210);
  doc.text('Arrival: ' + arr.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), W - 60, 210, { align: 'right' });

  // DIVIDER (perforated look)
  setDrawColor(doc, '#e2e8f0');
  doc.setLineDashPattern([5, 4], 0);
  doc.setLineWidth(1.5);
  doc.line(36, 242, W - 36, 242);
  doc.setLineDashPattern([], 0);

  // DETAILS & QR CODE SECTION
  // Left Column: Passenger & Booking Details
  setTextColor(doc, '#0f172a');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Passenger & Booking Details', 36, 268);

  const details: [string, string][] = [
    ['Passenger Name', r.user ? `${r.user.firstName} ${r.user.lastName}` : 'N/A'],
    ['Reservation ID', r.id],
    ['Seat Class', r.seatClass],
    ['Seats Booked', String(r.seatsBooked)],
    ['Status', r.status],
    ['Payment Status', r.paymentStatus],
    ['Amount Paid', `$${Number(r.totalPrice).toFixed(2)}`],
    ['Transaction ID', r.payment?.transactionId || 'N/A'],
    ['Booking Date', new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
  ];

  let y = 282;
  const col1 = 44, col2 = 160, rowH = 23;

  details.forEach(([label, value], i) => {
    const bg = i % 2 === 0 ? '#f8fafc' : '#ffffff';
    setFill(doc, bg);
    doc.roundedRect(36, y - 4, 320, rowH - 2, 4, 4, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setTextColor(doc, '#64748b');
    doc.text(label + ':', col1, y + 10);

    doc.setFont('helvetica', 'bold');
    setTextColor(doc, '#1e293b');

    if (label === 'Status' || label === 'Payment Status') {
      const colors = getBadgeColors(value);
      setFill(doc, colors.bg);
      const textW = doc.getTextWidth(value);
      const badgeW = textW + 10;
      doc.roundedRect(col2 - 4, y - 1, badgeW, 14, 3, 3, 'F');
      
      setTextColor(doc, colors.text);
      doc.setFontSize(8);
      doc.text(value, col2 + 1, y + 9);
    } else {
      doc.setFontSize(9);
      doc.text(value, col2, y + 10);
    }

    y += rowH;
  });

  // Right Column: QR Code Card
  const qrX = 385;
  const qrY = 278;
  const qrW = 174;
  const qrH = 205;

  setFill(doc, '#f8fafc');
  doc.roundedRect(qrX, qrY, qrW, qrH, 8, 8, 'F');
  setDrawColor(doc, '#e2e8f0');
  doc.roundedRect(qrX, qrY, qrW, qrH, 8, 8, 'S');

  const qrSize = 115;
  doc.addImage(qrData, 'PNG', qrX + (qrW - qrSize) / 2, qrY + 18, qrSize, qrSize);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  setTextColor(doc, '#64748b');
  doc.text('Scan to verify booking validity', qrX + qrW / 2, qrY + qrSize + 40, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  setTextColor(doc, '#0f172a');
  doc.text('FLIGHTHOTEL SECURE', qrX + qrW / 2, qrY + qrSize + 54, { align: 'center' });

  // FOOTER
  const footerY = 790;
  setDrawColor(doc, '#cbd5e1');
  doc.setLineWidth(1);
  doc.line(36, footerY, W - 36, footerY);

  setTextColor(doc, '#94a3b8');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Generated: ${new Date().toLocaleString('en-US')} | Secure E-Ticket | FlightHotel Platform`,
    36, footerY + 16
  );
  doc.text(
    'Please present this ticket and a valid ID at airport check-in.',
    W - 36, footerY + 16, { align: 'right' }
  );

  doc.save(`ticket-${r.flight.flightNumber}-${r.id.slice(-6)}.pdf`);
}

// Hotel Voucher PDF
export async function generateHotelVoucherPDF(r: {
  id: string;
  status: string;
  paymentStatus: string;
  guestCount: number;
  totalPrice: number | string;
  checkIn: string;
  checkOut: string;
  createdAt: string;
  hotel: { name: string; city: string; address: string; stars: number };
  room: { type: string; roomNumber: string };
  user?: { firstName: string; lastName: string; email?: string };
  payment?: { transactionId?: string };
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const W = 595;

  const nights = Math.ceil(
    (new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / (1000 * 60 * 60 * 24)
  );

  const qrData = await makeQR(
    `FLIGHTHOTEL-HOTEL|${r.id}|${r.hotel.name}|${r.status}`
  );

  // HEADER BANNER
  setFill(doc, '#022c22');
  doc.roundedRect(36, 36, W - 72, 80, 8, 8, 'F');

  // Brand and document title
  setTextColor(doc, '#ffffff');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('FlightHotel', 56, 74);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setTextColor(doc, '#a7f3d0');
  doc.text('HOTEL BOOKING VOUCHER', 56, 92);

  // Hotel pill on the right
  setFill(doc, '#064e3b');
  doc.roundedRect(W - 190, 52, 134, 48, 6, 6, 'F');
  
  setTextColor(doc, '#34d399');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(r.hotel.name, W - 123, 71, { align: 'center', maxWidth: 120 });

  const stars = Array(r.hotel.stars).fill('\u2605').join(' ');
  setTextColor(doc, '#fbbf24');
  doc.setFontSize(10);
  doc.text(stars, W - 123, 87, { align: 'center' });

  // STAY DATES SECTION
  setTextColor(doc, '#022c22');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Stay Schedule', 36, 142);

  // Stay Card Background
  setFill(doc, '#f0fdf4');
  doc.roundedRect(36, 150, W - 72, 76, 8, 8, 'F');
  setDrawColor(doc, '#bbf7d0');
  doc.roundedRect(36, 150, W - 72, 76, 8, 8, 'S');

  // Check-In
  setTextColor(doc, '#064e3b');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('CHECK-IN', 60, 172);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(new Date(r.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 60, 194);

  // Nights Badge
  setFill(doc, '#10b981');
  doc.roundedRect(W / 2 - 32, 168, 64, 22, 11, 11, 'F');
  setTextColor(doc, '#ffffff');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`${nights} Nights`, W / 2, 183, { align: 'center' });

  // Check-Out
  setTextColor(doc, '#064e3b');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('CHECK-OUT', W - 60, 172, { align: 'right' });
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(new Date(r.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), W - 60, 194, { align: 'right' });

  // DIVIDER (perforated look)
  setDrawColor(doc, '#d1fae5');
  doc.setLineDashPattern([5, 4], 0);
  doc.setLineWidth(1.5);
  doc.line(36, 242, W - 36, 242);
  doc.setLineDashPattern([], 0);

  // DETAILS & QR CODE SECTION
  // Left Column: Guest & Booking Details
  setTextColor(doc, '#022c22');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Guest & Booking Details', 36, 268);

  const hotelDetails: [string, string][] = [
    ['Guest Name', r.user ? `${r.user.firstName} ${r.user.lastName}` : 'N/A'],
    ['Reservation ID', r.id],
    ['Hotel Name', r.hotel.name],
    ['City', r.hotel.city],
    ['Address', r.hotel.address],
    ['Room Type', r.room.type],
    ['Room Number', r.room.roomNumber],
    ['Guests Count', String(r.guestCount)],
    ['Status', r.status],
    ['Payment Status', r.paymentStatus],
    ['Amount Paid', `$${Number(r.totalPrice).toFixed(2)}`],
    ['Transaction ID', r.payment?.transactionId || 'N/A'],
  ];

  let y = 282;
  const col1 = 44, col2 = 160, rowH = 23;

  hotelDetails.forEach(([label, value], i) => {
    const bg = i % 2 === 0 ? '#f0fdf4' : '#ffffff';
    setFill(doc, bg);
    doc.roundedRect(36, y - 4, 320, rowH - 2, 4, 4, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setTextColor(doc, '#64748b');
    doc.text(label + ':', col1, y + 10);

    doc.setFont('helvetica', 'bold');
    setTextColor(doc, '#1e293b');

    if (label === 'Status' || label === 'Payment Status') {
      const colors = getBadgeColors(value);
      setFill(doc, colors.bg);
      const textW = doc.getTextWidth(value);
      const badgeW = textW + 10;
      doc.roundedRect(col2 - 4, y - 1, badgeW, 14, 3, 3, 'F');
      
      setTextColor(doc, colors.text);
      doc.setFontSize(8);
      doc.text(value, col2 + 1, y + 9);
    } else {
      doc.setFontSize(9);
      doc.text(value, col2, y + 10, { maxWidth: 320 - (col2 - col1) - 10 });
    }

    y += rowH;
  });

  // Right Column: QR Code Card
  const qrX = 385;
  const qrY = 278;
  const qrW = 174;
  const qrH = 205;

  setFill(doc, '#f0fdf4');
  doc.roundedRect(qrX, qrY, qrW, qrH, 8, 8, 'F');
  setDrawColor(doc, '#bbf7d0');
  doc.roundedRect(qrX, qrY, qrW, qrH, 8, 8, 'S');

  const qrSize = 115;
  doc.addImage(qrData, 'PNG', qrX + (qrW - qrSize) / 2, qrY + 18, qrSize, qrSize);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  setTextColor(doc, '#64748b');
  doc.text('Scan to verify voucher validity', qrX + qrW / 2, qrY + qrSize + 40, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  setTextColor(doc, '#022c22');
  doc.text('FLIGHTHOTEL SECURE', qrX + qrW / 2, qrY + qrSize + 54, { align: 'center' });

  // FOOTER
  const footerY = 790;
  setDrawColor(doc, '#cbd5e1');
  doc.setLineWidth(1);
  doc.line(36, footerY, W - 36, footerY);

  setTextColor(doc, '#94a3b8');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Generated: ${new Date().toLocaleString('en-US')} | Secure Voucher | FlightHotel Platform`,
    36, footerY + 16
  );
  doc.text(
    'Please present this voucher and ID upon check-in.',
    W - 36, footerY + 16, { align: 'right' }
  );

  doc.save(`voucher-${r.hotel.name.replace(/\s+/g, '-')}-${r.id.slice(-6)}.pdf`);
}
