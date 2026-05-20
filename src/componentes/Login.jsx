import React, { useState } from 'react';

const supabaseUrl = 'https://qlxxdrbxcjofttwxbpwr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFseHhkcmJ4Y2pvZnR0d3hicHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTUxMzMsImV4cCI6MjA5NDE3MTEzM30.s9xGl4QUebBUwR6PCFeR4KPsZlpwRgF-1NPdpaQu3zo';

function Login({ iniciarSesion }) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [registro, setregistro] = useState(false);

  const procesarFormulario = async (e) => {
    e.preventDefault();

    let emailFalso = telefono + "@whatsapp.com";

    if (registro === true) {
      let peticionRegistro = await fetch(supabaseUrl + '/auth/v1/signup', {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: emailFalso,
          password: contrasena
        })
      });
      let respuestaRegistro = await peticionRegistro.json();

      if (peticionRegistro.ok === false) {
        let mensajeDeError = respuestaRegistro.msg || respuestaRegistro.error_description || respuestaRegistro.message || "";

        if (mensajeDeError.includes('Password should be at least') === true) {
          alert("La contraseña es demasiado corta (mínimo 6 caracteres).");
        } else if (mensajeDeError.includes('already registered') === true || mensajeDeError.includes('already exists') === true) {
          alert("Este teléfono ya está registrado.");
        } else {
          alert("Error al registrarse: " + mensajeDeError);
        }
      } else {
        let colores = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
        let numeroAleatorio = Math.floor(Math.random() * colores.length);
        let colorElegido = colores[numeroAleatorio];

        let peticionGuardar = await fetch(supabaseUrl + '/rest/v1/usuarios', {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': 'Bearer ' + (respuestaRegistro.session?.access_token || supabaseKey),
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            id: respuestaRegistro.user.id,
            nombre: nombre,
            correo: emailFalso,
            telefono: telefono,
            color: colorElegido
          })
        });

        let respuestaGuardar = await peticionGuardar.json();

        if (peticionGuardar.ok === false) {
          let mensajeErrorGuardar = respuestaGuardar.message || respuestaGuardar.details || JSON.stringify(respuestaGuardar);
          alert("Error al guardar el perfil de usuario: " + mensajeErrorGuardar);
        } else {
          alert("¡Registro completado!");
          setNombre('');
          setTelefono('');
          setContrasena('');
        }
      }
    } else {
      let peticionLogin = await fetch(supabaseUrl + '/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: emailFalso,
          password: contrasena
        })
      });

      let respuestaLogin = await peticionLogin.json();

      if (peticionLogin.ok === false) {
        let mensajeError = respuestaLogin.msg || respuestaLogin.error_description || "";

        if (mensajeError.includes("Invalid login credentials") === true) {
          alert("El número de teléfono o la contraseña no son correctos.");
        } else {
          alert("Error al iniciar sesión: " + mensajeError);
        }
      } else {
        iniciarSesion(respuestaLogin);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {registro ? 'Crear Cuenta' : 'Iniciar Sesión'} en WhatsApp
        </h2>

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
            type="tel"
            placeholder="Número de teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="border border-gray-300 p-2 rounded focus:outline-none focus:border-green-500"
            required
            minLength="9"
            maxLength="15"
            pattern="[0-9]{9,15}"
            title="El teléfono debe tener entre 9 y 15 dígitos numéricos."
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            className="border border-gray-300 p-2 rounded focus:outline-none focus:border-green-500"
            required
          />
          <button type="submit" className="bg-[#00a884] text-white p-2 rounded hover:bg-[#008f6f] font-bold mt-2 cursor-pointer">
            {registro ? 'Registrarse' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {registro ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
          <button
            onClick={(e) => {
              e.preventDefault();
              setNombre('');
              setTelefono('');
              setContrasena('');
              setregistro(!registro);
            }}
            className="text-blue-500 hover:underline font-semibold cursor-pointer"
          >
            {registro ? 'Inicia sesión' : 'Regístrate aquí'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
