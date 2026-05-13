import React, { useState, useEffect, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import "./styles/index.css";
import Login from './componentes/Login';
import WhatsApp from './componentes/WhatsApp';
import { supabase } from './supabaseClient';

function AplicacionPrincipal() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUsuario(session.user);
      }
    });

    const { data: oyenteAuth } = supabase.auth.onAuthStateChange((evento, sesion) => {
      if (sesion) {
        setUsuario(sesion.user);
      } else {
        setUsuario(null);
      }
    });

    return () => {
      oyenteAuth.subscription.unsubscribe();
    };
  }, []);

  return (
    <div>
      {usuario ? (
        <WhatsApp usuario={usuario} />
      ) : (
        <Login iniciarSesion={(u) => setUsuario(u)} />
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <>
    <StrictMode>
      <AplicacionPrincipal />
    </StrictMode>
  </>
);
