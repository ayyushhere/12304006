import React, { createContext, useState, useEffect } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [readIds, setReadIds] = useState(() => {
    const stored = localStorage.getItem('read_notifications');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('read_notifications', JSON.stringify(readIds));
  }, [readIds]);

  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      setReadIds((prev) => [...prev, id]);
    }
  };

  const markAllAsRead = (ids) => {
    const newIds = ids.filter(id => !readIds.includes(id));
    if (newIds.length > 0) {
      setReadIds(prev => [...prev, ...newIds]);
    }
  };

  const clearReadHistory = () => {
    setReadIds([]);
  };

  return (
    <NotificationContext.Provider value={{ readIds, markAsRead, markAllAsRead, clearReadHistory }}>
      {children}
    </NotificationContext.Provider>
  );
};
