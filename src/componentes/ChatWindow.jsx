import React from 'react';

function ChatWindow({ mensajes, usuario }) {

    return (
        <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-2">
            {mensajes.map((msg, index) => {
                let clasesMensaje = "max-w-[60%] p-2 px-3 rounded-lg text-sm relative break-words shadow-sm";

                if (msg.emisor_id === usuario.id) {
                    clasesMensaje += " self-end bg-[#d9fdd3] rounded-tr-none";
                } else {
                    clasesMensaje += " self-start bg-white rounded-tl-none";
                }

                return (
                    <div key={index} className={clasesMensaje}>
                        <p className="mb-1">{msg.texto}</p>
                        <span className="text-[10px] text-gray-500 float-right ml-2">{msg.hora}</span>
                    </div>
                );
            })}
        </div>
    );
}

export default ChatWindow;
