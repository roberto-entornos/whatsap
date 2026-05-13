import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import InputBox from './InputBox';
import { supabase } from '../supabaseClient';

function WhatsApp({ usuario }) {
    const [contactos, setContactos] = useState([]);
    const [chatActivoId, setChatActivoId] = useState(null);
    const [mensajes, setMensajes] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        async function cargarDatos() {
            const { data: dataContactos, error: errContactos } = await supabase
                .from('usuarios')
                .select('*')
                .neq('id', usuario.id);

            if (dataContactos) {
                setContactos(dataContactos);
                if (dataContactos.length > 0) {
                    setChatActivoId(dataContactos[0].id);
                }
            }
            if (errContactos) {
                console.error("Error al cargar contactos:", errContactos);
            }

            const { data: dataMensajes, error: errMensajes } = await supabase
                .from('mensajes')
                .select('*')
                .or(`emisor_id.eq.${usuario.id},receptor_id.eq.${usuario.id}`)
                .order('created_at', { ascending: true });

            if (dataMensajes) {
                setMensajes(dataMensajes);
            }
            if (errMensajes) {
                console.error("Error al cargar mensajes:", errMensajes);
            }

            setCargando(false);
        }

        cargarDatos();

        const canalMensajes = supabase
            .channel('public:mensajes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes' }, (payload) => {
                const nuevo = payload.new;
                if (nuevo.emisor_id === usuario.id || nuevo.receptor_id === usuario.id) {
                    setMensajes((prev) => {
                        if (prev.find(m => m.id === nuevo.id)) return prev;
                        return [...prev, nuevo];
                    });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(canalMensajes);
        };
    }, [usuario.id]);

    const chatActivo = contactos.find(c => c.id === chatActivoId);

    const mensajesDelChat = mensajes.filter(m => 
        (m.receptor_id === chatActivoId && m.emisor_id === usuario.id) ||
        (m.emisor_id === chatActivoId && m.receptor_id === usuario.id)
    );

    const cambiarChat = (contacto) => {
        setChatActivoId(contacto.id);
    };

    const enviarMensaje = async (texto) => {
        const horaTexto = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const nuevoMensaje = {
            receptor_id: chatActivoId,
            texto: texto,
            hora: horaTexto,
            emisor_id: usuario.id
        };

        const { data, error } = await supabase
            .from('mensajes')
            .insert([nuevoMensaje])
            .select();
            
        if (data && data.length > 0) {
            setMensajes((prev) => {
                if (prev.find(m => m.id === data[0].id)) return prev;
                return [...prev, data[0]];
            });
        }
    };

    const cerrarSesion = async () => {
        await supabase.auth.signOut();
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
