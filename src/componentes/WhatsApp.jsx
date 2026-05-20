import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import InputBox from './InputBox';

const supabaseUrl = 'https://qlxxdrbxcjofttwxbpwr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFseHhkcmJ4Y2pvZnR0d3hicHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTUxMzMsImV4cCI6MjA5NDE3MTEzM30.s9xGl4QUebBUwR6PCFeR4KPsZlpwRgF-1NPdpaQu3zo';

function WhatsApp({ usuario, cerrarSesionApp }) {
    const [contactos, setContactos] = useState([]);
    const [chatActivoId, setChatActivoId] = useState(null);
    const [mensajes, setMensajes] = useState([]);

    useEffect(() => {
        async function cargarDatos() {
            let cabeceras = {
                'apikey': supabaseKey,
                'Authorization': 'Bearer ' + (usuario.token || supabaseKey)
            };

            let peticionContactos = await fetch(supabaseUrl + '/rest/v1/contactos?usuario_id=eq.' + usuario.id + '&select=contacto_id', {
                method: 'GET',
                headers: cabeceras
            });
            let respuestaContactos = await peticionContactos.json();

            let listaIds = [];
            if (respuestaContactos.length >= 0) {
                for (let i = 0; i < respuestaContactos.length; i++) {
                    let id = respuestaContactos[i].contacto_id;
                    if (!listaIds.includes(id)) {
                        listaIds.push(id);
                    }
                }
            }

            let urlMensajes = supabaseUrl + '/rest/v1/mensajes?select=*&or=(emisor_id.eq.' + usuario.id + ',receptor_id.eq.' + usuario.id + ')&order=created_at.asc';
            let peticionMensajes = await fetch(urlMensajes, {
                method: 'GET',
                headers: cabeceras
            });
            let respuestaMensajes = await peticionMensajes.json();

            if (respuestaMensajes.length >= 0) {
                setMensajes(respuestaMensajes);
                for (let i = 0; i < respuestaMensajes.length; i++) {
                    let m = respuestaMensajes[i];
                    if (m.emisor_id !== usuario.id && !listaIds.includes(m.emisor_id)) {
                        listaIds.push(m.emisor_id);
                    }
                    if (m.receptor_id !== usuario.id && !listaIds.includes(m.receptor_id)) {
                        listaIds.push(m.receptor_id);
                    }
                }
            }

            if (listaIds.length > 0) {
                let idsString = listaIds.join(',');
                let urlUsuarios = supabaseUrl + '/rest/v1/usuarios?select=*&id=in.(' + idsString + ')';
                let peticionUsuarios = await fetch(urlUsuarios, {
                    method: 'GET',
                    headers: cabeceras
                });
                let respuestaUsuarios = await peticionUsuarios.json();

                if (respuestaUsuarios.length >= 0) {
                    setContactos(respuestaUsuarios);
                    setChatActivoId((chatActual) => {
                        if (chatActual) return chatActual;
                        if (respuestaUsuarios.length > 0) return respuestaUsuarios[0].id;
                        return null;
                    });
                }
            } else {
                setContactos([]);
            }
        }

        cargarDatos();

    }, [usuario.id]);

    const chatActivo = contactos.find(c => c.id === chatActivoId);

    const mensajesDelChat = mensajes.filter(m =>
        (m.receptor_id === chatActivoId && m.emisor_id === usuario.id) ||
        (m.emisor_id === chatActivoId && m.receptor_id === usuario.id)
    );

    const cambiarChat = (contacto) => {
        setChatActivoId(contacto.id);
    };

    const agregarContacto = async (telefonoNuevo) => {
        let cabeceras = {
            'apikey': supabaseKey,
            'Authorization': 'Bearer ' + (usuario.token || supabaseKey),
            'Content-Type': 'application/json'
        };

        let peticionBuscar = await fetch(supabaseUrl + '/rest/v1/usuarios?telefono=eq.' + telefonoNuevo + '&select=*', {
            method: 'GET',
            headers: cabeceras
        });
        let respuestaBuscar = await peticionBuscar.json();

        if (respuestaBuscar.length > 0) {
            let data = respuestaBuscar[0];
            if (data.id === usuario.id) {
                return;
            }
            if (contactos.find(c => c.id === data.id)) {
                return;
            }

            let peticionInsertar = await fetch(supabaseUrl + '/rest/v1/contactos', {
                method: 'POST',
                headers: cabeceras,
                body: JSON.stringify({ usuario_id: usuario.id, contacto_id: data.id })
            });

            if (peticionInsertar.ok) {
                const nuevosContactos = [...contactos, data];
                setContactos(nuevosContactos);
                setChatActivoId(data.id);
            } else {
                console.error("Error al añadir contacto");
            }
        }
    };

    const enviarMensaje = async (texto) => {
        let horaTexto = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let nuevoMensaje = {
            receptor_id: chatActivoId,
            texto: texto,
            hora: horaTexto,
            emisor_id: usuario.id
        };

        let cabeceras = {
            'apikey': supabaseKey,
            'Authorization': 'Bearer ' + (usuario.token || supabaseKey),
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };

        let peticionEnviar = await fetch(supabaseUrl + '/rest/v1/mensajes', {
            method: 'POST',
            headers: cabeceras,
            body: JSON.stringify(nuevoMensaje)
        });

        let data = await peticionEnviar.json();

        if (data && data.length > 0) {
            setMensajes((mensajesAnteriores) => {
                let existe = false;
                for (let i = 0; i < mensajesAnteriores.length; i++) {
                    if (mensajesAnteriores[i].id === data[0].id) {
                        existe = true;
                    }
                }
                if (existe) {
                    return mensajesAnteriores;
                } else {
                    return [...mensajesAnteriores, data[0]];
                }
            });
        }
    };

    const cerrarSesion = () => {
        if (cerrarSesionApp) {
            cerrarSesionApp();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-200 relative">

            <div className="flex w-[90vw] h-[90vh] bg-white shadow-lg rounded-lg overflow-hidden">
                <Sidebar
                    contactos={contactos}
                    chatActivo={chatActivo}
                    hacerClick={cambiarChat}
                    mensajes={mensajes}
                    usuario={usuario}
                    cerrarSesion={cerrarSesion}
                    agregarContacto={agregarContacto}
                />

                <div className="flex flex-col flex-1 bg-[#efeae2]">
                    {chatActivo ? (
                        <>
                            <div className="flex items-center p-4 h-[60px] bg-gray-100 border-b border-gray-200">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-4 shrink-0"
                                    style={{ backgroundColor: chatActivo.color }}
                                >
                                    {chatActivo.nombre.charAt(0)}
                                </div>
                                <h3 className="text-lg font-normal">{chatActivo.nombre}</h3>
                            </div>

                            <ChatWindow mensajes={mensajesDelChat} usuario={usuario} />

                            <InputBox enviarMensaje={enviarMensaje} />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-[#f0f2f5]">
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default WhatsApp;
