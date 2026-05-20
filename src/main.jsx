import React, { useState, useEffect, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import "./styles/index.css";
import Login from './componentes/Login';
import WhatsApp from './componentes/WhatsApp';

function AplicacionPrincipal() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    let usuarioGuardado = localStorage.getItem("miTokenDeUsuario");
    let tokenGuardado = localStorage.getItem("miTokenDeAcceso");
    if (usuarioGuardado && usuarioGuardado !== "undefined") {
      try {
        let usuarioObjeto = JSON.parse(usuarioGuardado);
        if (usuarioObjeto) {
          usuarioObjeto.token = tokenGuardado;
          setUsuario(usuarioObjeto);
        }
      } catch (e) {
        localStorage.removeItem("miTokenDeUsuario");
        localStorage.removeItem("miTokenDeAcceso");
      }
    }
  }, []);

  return (
    <div>
      {usuario ? (
        <WhatsApp 
            usuario={usuario} 
            cerrarSesionApp={() => {
                localStorage.removeItem("miTokenDeUsuario");
                localStorage.removeItem("miTokenDeAcceso");
                setUsuario(null);
            }} 
        />
      ) : (
        <Login iniciarSesion={(datosLogin) => {
            localStorage.setItem("miTokenDeUsuario", JSON.stringify(datosLogin.user));
            localStorage.setItem("miTokenDeAcceso", datosLogin.access_token);
            let usuarioObjeto = datosLogin.user;
            usuarioObjeto.token = datosLogin.access_token;
            setUsuario(usuarioObjeto);
        }} />
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
