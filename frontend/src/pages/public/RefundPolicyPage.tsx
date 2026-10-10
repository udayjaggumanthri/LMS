import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const RefundPolicyPage: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/terms', { replace: true });
  }, [navigate]);
  return null;
};
