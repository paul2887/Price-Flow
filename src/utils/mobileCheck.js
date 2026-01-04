export const isMobileDevice = () => {
  return window.innerWidth <= 768;
};

export const checkMobileOnResize = (callback) => {
  const handleResize = () => {
    callback(isMobileDevice());
  };
  
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
};