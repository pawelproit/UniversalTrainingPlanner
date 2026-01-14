export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('pl-PL');
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}