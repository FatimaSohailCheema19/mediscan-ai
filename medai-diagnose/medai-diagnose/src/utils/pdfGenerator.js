import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const generateMedicalReport = async (data, imageElement) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  
  // Colors
  const primaryColor = [14, 165, 233]; // Medical blue
  const secondaryColor = [20, 184, 166]; // Teal
  const textColor = [51, 65, 85]; // Slate 700
  
  // Helper functions
  const addHeader = () => {
    // Logo area
    pdf.setFillColor(...primaryColor);
    pdf.roundedRect(margin, margin, 40, 15, 3, 3, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('MedAI', margin + 5, margin + 10);
    
    // Title
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(24);
    pdf.text('Medical Imaging Report', pageWidth / 2, margin + 10, { align: 'center' });
    
    // Subtitle
    pdf.setTextColor(...secondaryColor);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('AI-Assisted Diagnostic Analysis', pageWidth / 2, margin + 18, { align: 'center' });
    
    // Line
    pdf.setDrawColor(...primaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(margin, margin + 25, pageWidth - margin, margin + 25);
  };
  
  const addFooter = (pageNum) => {
    const footerY = pageHeight - 15;
    
    pdf.setDrawColor(...primaryColor);
    pdf.setLineWidth(0.3);
    pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text(
      'This report is AI-generated and does not replace professional medical diagnosis. Consult a healthcare provider for definitive evaluation.',
      pageWidth / 2,
      footerY,
      { align: 'center', maxWidth: pageWidth - 40 }
    );
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Page ${pageNum}`, pageWidth - margin, footerY);
  };
  
  const addSection = (title, content, y, isList = false) => {
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, y);
    
    pdf.setTextColor(...textColor);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    if (isList && Array.isArray(content)) {
      let currentY = y + 8;
      content.forEach((item, index) => {
        const bullet = '•';
        pdf.text(bullet, margin + 5, currentY);
        
        const splitText = pdf.splitTextToSize(item, pageWidth - margin * 2 - 15);
        pdf.text(splitText, margin + 12, currentY);
        
        currentY += splitText.length * 5 + 3;
      });
      return currentY + 5;
    } else {
      const splitText = pdf.splitTextToSize(content, pageWidth - margin * 2);
      pdf.text(splitText, margin, y + 8);
      return y + 8 + splitText.length * 5 + 5;
    }
  };
  
  // Start generating PDF
  addHeader();
  
  let currentY = margin + 35;
  
  // Date and Report ID
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(10);
  pdf.text(`Report Date: ${new Date().toLocaleString()}`, margin, currentY);
  pdf.text(`Report ID: MED-${Date.now().toString(36).toUpperCase()}`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 10;
  
  // Patient Info Box
  pdf.setFillColor(240, 249, 255);
  pdf.roundedRect(margin, currentY, pageWidth - margin * 2, 25, 3, 3, 'F');
  pdf.setTextColor(...textColor);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Patient Information', margin + 5, currentY + 8);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`Body Part Analyzed: ${data.bodyPart}`, margin + 5, currentY + 16);
  pdf.text(`Analysis Type: AI-Powered Medical Imaging`, margin + 5, currentY + 22);
  currentY += 35;
  
  // Add Image if available
  if (imageElement) {
    try {
      const canvas = await html2canvas(imageElement, { scale: 0.5 });
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      
      const imgWidth = 80;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.setDrawColor(...primaryColor);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(margin, currentY, imgWidth + 4, imgHeight + 4, 3, 3, 'S');
      pdf.addImage(imgData, 'JPEG', margin + 2, currentY + 2, imgWidth, imgHeight);
      
      // Image label
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(9);
      pdf.text('Analyzed Medical Image', margin, currentY + imgHeight + 8);
      
      currentY += imgHeight + 15;
    } catch (error) {
      console.error('Error adding image:', error);
    }
  }
  
  // Diagnosis Section
  pdf.setFillColor(254, 242, 242);
  pdf.roundedRect(margin, currentY, pageWidth - margin * 2, 20, 3, 3, 'F');
  pdf.setTextColor(220, 38, 38);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DIAGNOSIS', margin + 5, currentY + 7);
  
  pdf.setTextColor(153, 27, 27);
  pdf.setFontSize(14);
  pdf.text(data.diseaseName, margin + 5, currentY + 16);
  
  pdf.setTextColor(...secondaryColor);
  pdf.setFontSize(11);
  pdf.text(`Confidence: ${data.confidence}%`, pageWidth - margin - 5, currentY + 16, { align: 'right' });
  
  currentY += 28;
  
  // AI Explanation
  currentY = addSection('AI Explanation', data.explanation, currentY);
  
  // Check if we need a new page
  if (currentY > pageHeight - 60) {
    pdf.addPage();
    addHeader();
    currentY = margin + 35;
  }
  
  // Reasoning
  currentY = addSection('Analysis Reasoning', data.reasoning, currentY);
  
  // Check page break
  if (currentY > pageHeight - 80) {
    pdf.addPage();
    addHeader();
    currentY = margin + 35;
  }
  
  // Precautions
  currentY = addSection('Recommended Precautions', data.precautions, currentY, true);
  
  // Check page break
  if (currentY > pageHeight - 60) {
    pdf.addPage();
    addHeader();
    currentY = margin + 35;
  }
  
  // Doctor Advice
  pdf.setFillColor(240, 253, 250);
  pdf.roundedRect(margin, currentY, pageWidth - margin * 2, 40, 3, 3, 'F');
  pdf.setTextColor(...secondaryColor);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Medical Consultation Advice', margin + 5, currentY + 10);
  
  pdf.setTextColor(...textColor);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const adviceLines = pdf.splitTextToSize(data.doctorAdvice, pageWidth - margin * 2 - 10);
  pdf.text(adviceLines, margin + 5, currentY + 20);
  
  // Add footer to all pages
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    addFooter(i);
  }
  
  // Save PDF
  pdf.save(`MedAI_Report_${data.bodyPart}_${new Date().toISOString().split('T')[0]}.pdf`);
  
  return true;
};