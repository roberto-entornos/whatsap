import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function Login({ iniciarSesion }) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [registro, setregistro] = useState(false);
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const procesarFormulario = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeExito('');

    if (registro) {
      const { data, error } = await supabase.auth.signUp({
        email: correo,
        password: contrasena,
      });
      if (error) {
        let msg = error.message;
        if (msg.includes('Password should be at least')) {
          msg = "Contraseña demasiado corta. Por favor, ajusta el mínimo permitido en tu panel de Supabase.";
        } else if (msg.includes('User already registered') || msg.includes('already been registered')) {
          msg = "Este correo ya está registrado.";
        }
        setError(msg);
      } else {
        const colores = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
        const colorAleatorio = colores[Math.floor(Math.random() * colores.length)];

        const { error: errorInsert } = await supabase.from('usuarios').insert([{
          id: data.user.id,
          nombre: nombre,
          correo: correo,
          color: colorAleatorio
        }]);

        if (errorInsert) {
          setError("Usuario creado, pero hubo un error al guardar el perfil: " + errorInsert.message);
        } else {
          setMensajeExito("¡Registro completado! Ahora inicia sesión.");
          setregistro(false);
          setNombre('');
          setContrasena('');
        }
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: correo,
        password: contrasena,
      });
      if (error) {
        setError("Correo o contraseña incorrectos");
      } else {
        iniciarSesion(data.user);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {registro ? 'Crear Cuenta' : 'Iniciar Sesión'} en WhatsApp
        </h2>

        {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}
        {mensajeExito && <p className="text-green-600 mb-4 text-sm text-center font-semibold">{mensajeExito}</p>}

        <form onSubmit={procesarFormulario} className="flex flex-col gap-4">
          {registro && (
            <input
              type="text"
              placeholder="Tu Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="border border-gray-300 p-2 rounded focus:outline-none focus:border-green-500"
              required={registro}
            />
          )}
          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="border border-gray-300 p-2 rounded focus:outline-none focus:border-green-500"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            className="border border-gray-300 p-2 rounded focus:outline-none focus:border-green-500"
            required
          />
          <button type="submit" className="bg-[#00a884] text-white p-2 rounded hover:bg-[#008f6f] font-bold mt-2">
            {registro ? 'Registrarse' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {registro ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
          <button
            onClick={() => setregistro(!registro)}
            className="text-blue-500 hover:underline font-semibold"
          >
            {registro ? 'Inicia sesión' : 'Regístrate aquí'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
