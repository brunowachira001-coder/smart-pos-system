// Force clear all caches and reload
(function() {
  // Clear service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        registration.unregister();
      }
    });
  }
  
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(function(names) {
      for (let name of names) {
        caches.delete(name);
      }
    });
  }
  
  // Force reload without cache
  console.log('🔄 Forcing cache clear and reload...');
  setTimeout(() => {
    window.location.reload(true);
  }, 1000);
})();
