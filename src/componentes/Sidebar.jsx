import React, { useState } from 'react';

function Sidebar({ contactos, chatActivo, hacerClick, mensajes, usuario, cerrarSesion, agregarContacto }) {
    const [nuevoTelefono, setNuevoTelefono] = useState('');

    return (
        <div className="w-[30%] border-r border-[#e9edef] flex flex-col bg-white">
            <div className="flex items-center justify-between p-4 h-[60px] bg-gray-100 border-b border-[#e9edef]">
                <h3 className="text-xl font-bold text-gray-700">Chats</h3>
                <button 
                    onClick={cerrarSesion}
                    className="text-sm text-red-500 hover:bg-red-100 px-2 py-1 rounded font-semibold transition cursor-pointer"
                >
                    Cerrar Sesión
                </button>
            </div>

            <div className="bg-white p-2 border-b border-[#e9edef] flex flex-col gap-2">
                <div className="flex gap-2">
                    <input 
                        type="tel"
                        placeholder="Añadir por teléfono"
                        className="flex-1 bg-[#f0f2f5] p-2 rounded-lg text-sm outline-none border border-transparent focus:border-green-500 focus:bg-white transition-colors"
                        value={nuevoTelefono}
                        onChange={(e) => setNuevoTelefono(e.target.value)}
                    />
                    <button
                        onClick={() => {
                            if (nuevoTelefono.trim() !== '') {
                                agregarContacto(nuevoTelefono.trim());
                                setNuevoTelefono('');
                            }
                        }}
                        className="bg-[#00a884] text-white px-3 py-1 rounded hover:bg-[#008f6f] font-bold text-sm transition-colors cursor-pointer"
                    >
                        Añadir
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {contactos.length === 0 ? (
                    <p className="text-center text-gray-500 mt-4 text-sm">No se encontraron contactos</p>
                ) : contactos.map((contacto) => {
                    let clase = "flex items-center p-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50";
                    if (chatActivo && chatActivo.id === contacto.id) {
                        clase = "flex items-center p-3 cursor-pointer border-b border-gray-100 bg-[#f0f2f5]";
                    }

                    const mensajesContacto = mensajes.filter(m => 
                        (m.receptor_id === contacto.id && m.emisor_id === usuario.id) || 
                        (m.emisor_id === contacto.id && m.receptor_id === usuario.id)
                    );
                    const ultimoMensaje = mensajesContacto.length > 0 ? mensajesContacto[mensajesContacto.length - 1].texto : "Sin mensajes aún";

                    return (
                        <div
                            key={contacto.id}
                            className={clase}
                            onClick={() => hacerClick(contacto)}
                        >
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shrink-0"
                                style={{ backgroundColor: contacto.color }}
                            >
                                {contacto.nombre.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-normal text-gray-900 truncate">{contacto.nombre}</h3>
                                <p className="text-sm text-gray-500 truncate">{ultimoMensaje}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Sidebar;
