/**
 * Format deadline to a user-friendly string (Thai)
 */
export const formatDeadline = (date: Date | null | string | number): string => {
  if (!date) return "ไม่มีกำหนดเวลา";

  try {
    // Handle different date formats
    let timestamp: Date;

    if (date instanceof Date) {
      timestamp = date;
    } else if (typeof date === 'string') {
      timestamp = new Date(date);
    } else if (typeof date === 'number') {
      timestamp = new Date(date);
    } else {
      return "ไม่มีกำหนดเวลา";
    }

    // Check if the date is valid
    if (isNaN(timestamp.getTime())) {
      return "ไม่มีกำหนดเวลา";
    }

    const now = new Date();
    const diffTime = timestamp.getTime() - now.getTime();
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    if (diffHours < 24) {
      return `เหลืออีก ${diffHours} ชั่วโมง`;
    } else {
      const diffDays = Math.ceil(diffHours / 24);
      return `เหลืออีก ${diffDays} วัน`;
    }
  } catch (error) {
    console.error("Error formatting deadline:", error);
    return "ไม่มีกำหนดเวลา";
  }
};
